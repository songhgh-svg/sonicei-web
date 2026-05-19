// supabase/functions/demo-scan/index.ts
// ─────────────────────────────────────────────────────────────────────────────
// SONIC AI-Punch™ — Web Demo Edge Function
//
// Nhận ảnh base64 từ landing page → gọi Gemini Vision → trả kết quả JSON
//
// Deploy:
//   supabase functions deploy demo-scan --no-verify-jwt
//
// Secrets (cùng với send-report đã có):
//   supabase secrets set GEMINI_API_KEY=AIzaSy...
//
// Rate limit: 3 requests / IP / 24h (dùng Supabase KV via postgres)
// Request:  { image: string (base64), mimeType: string, lang: 'en'|'vi' }
// Response: { status: 'passed'|'failed'|'outOfScope', defects: Defect[], cached?: boolean }
// ─────────────────────────────────────────────────────────────────────────────

import { serve }        from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ── Config ────────────────────────────────────────────────────────────────────
const GEMINI_KEY     = Deno.env.get('GEMINI_API_KEY') ?? ''
const SUPABASE_URL   = Deno.env.get('SUPABASE_URL')   ?? ''
const SUPABASE_KEY   = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const GEMINI_MODEL   = 'gemini-2.5-flash'
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_KEY}`

const DEMO_RATE_LIMIT = 3     // max scans per IP per 24h
const DEMO_WINDOW_H   = 24    // hours

// ── CORS ──────────────────────────────────────────────────────────────────────
const cors = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface Defect {
  code:        string
  name:        string
  severity:    'A' | 'B' | 'C'
  instruction: string
}

interface DemoResult {
  status:    'passed' | 'failed' | 'outOfScope'
  defects:   Defect[]
  scansLeft?: number
}

// ── Defect library (self-contained — no DB call needed for web demo) ──────────
// Mirrors the error_library table. Update here when adding new defect types.
const DEFECT_LIBRARY: Record<string, { name: string; instruction: string }> = {
  CRIMPING:        { name: 'Crimp Terminal Defect',       instruction: 'Re-crimp with correct ferrule size. Perform pull test per IEC 60947-1 §8.2. Min pull force 20N.' },
  TERMINAL_LOOSE:  { name: 'Loose Terminal Connection',   instruction: 'Re-torque to manufacturer spec. Apply torque seal after tightening. Verify with pull test.' },
  CABLE_TIE:       { name: 'Cable Management Defect',     instruction: 'Install SS316 cable ties at max 300mm intervals. Remove all nylon/plastic ties. Cut tails flush.' },
  CABLE_GLAND:     { name: 'Cable Gland Defect',          instruction: 'Install correct IP68-rated cable gland matching cable OD. Torque to manufacturer spec. Check Roxtec clip.' },
  GROUNDING:       { name: 'Grounding / Earthing Defect', instruction: 'Install green/yellow conductor per IEC 60364-5-54. Crimp lug at each end. Verify continuity < 0.1Ω. One conductor per earth boss.' },
  MARKING_MISSING: { name: 'Missing Labels / Marking',    instruction: 'Apply cable tag per P&ID. Use heat-shrink sleeve label (min 10mm). Device marking per project spec.' },
  ZIP_TIE_SS:      { name: 'Non-SS Cable Ties',           instruction: 'Replace all nylon/plastic zip ties with SS316 stainless steel ties. Required for offshore/outdoor use.' },
  CABLE_ROUTING:   { name: 'Incorrect Cable Routing',     instruction: 'Segregate power and signal cables (min 50mm separation). Route through designated cable ladder. Avoid proximity to moving parts.' },
  BOLT_LOOSE:      { name: 'Loose Bolt / Fastener',       instruction: 'Torque to specification per equipment manual. Apply torque seal mark. Check all bolts in same area.' },
  BOLT_PRESERVATION: { name: 'Bolt Preservation Missing', instruction: 'Clean threads, apply preservation compound (Denso or equivalent). Protect machined surfaces from corrosion.' },
  MECHANICAL_LEAK: { name: 'Mechanical Leak',             instruction: 'Identify leak source. Replace seal/gasket. Verify oil level. Clean affected area. Re-inspect after 4h operation.' },
  BEARING_DEFECT:  { name: 'Bearing / Bushing Defect',    instruction: 'Replace bearing per manufacturer specification. Check alignment. Verify lubrication. Record in maintenance log.' },
  HOSE_UNSECURED:  { name: 'Unsecured Hose',              instruction: 'Clamp hose at max 500mm intervals. Add edge protector where hose contacts sharp surface. Verify routing avoids heat sources.' },
  RUST_PAINT:      { name: 'Rust / Paint Damage',         instruction: 'Abrasive blast to Sa 2.5. Apply primer coat within 4h. Final coat per project coating spec. Holiday test if specified.' },
  SURFACE_BURN:    { name: 'Burn Mark / Heat Damage',     instruction: 'Remove weld spatter with grinder. Treat bare metal. Re-coat to original spec. Verify structural integrity not affected.' },
  CLEANLINESS:     { name: 'Contamination / Cleanliness', instruction: 'Remove all debris, dust, and contamination. Vacuum interior of cabinets. Inspect for FOD before energization.' },
  GRATING_DEFECT:  { name: 'Grating Defect / Trip Hazard', instruction: 'Secure loose grating with GRP clips. Replace damaged sections. Ensure gaps < 8mm per OSHA 1926.502. Paint non-slip surface.' },
  SHARP_EDGE:      { name: 'Sharp Edge / Unprotected End', instruction: 'Deburr and file all sharp edges. Install edge protectors on cable tray cut ends. Cap unused conduit ends.' },
  SAFETY_MARKING:  { name: 'Missing Safety Marking',      instruction: 'Apply SWL/WLL marking per lifting equipment. Install warning labels per NFPA 70E or IEC 60309. Add harness point marking.' },
  INSULATION_DAMAGE: { name: 'Thermal Insulation Damage', instruction: 'Replace damaged insulation section. Verify vapour barrier integrity. Re-test with thermographic camera.' },
  STRUCTURAL_GAP:  { name: 'Structural Gap / Missing Component', instruction: 'Install missing component per engineering drawing. Seal gaps with approved fire-rated material where specified.' },
  MAT_SAT:         { name: 'Foreign Object Debris (FOD)', instruction: 'Remove all FOD. Document source. Inspect for secondary damage. Complete FOD check sign-off before energization.' },
}

// ── Screening prompt (identical to Flutter app) ───────────────────────────────
function buildScreeningPrompt(): string {
  return `You are a QA/QC inspector for industrial E&I commissioning.
Inspect this image and return ONLY comma-separated defect codes from this list:

=== E&I / ELECTRICAL ===
CRIMPING = crimp terminal defect, exposed copper wire, missing ferrule, damaged lug
TERMINAL_LOOSE = loose terminal screw, conductor not inserted, missing torque seal mark
CABLE_TIE = cable not secured, cable sag, unsupported cable bundle, uncut zip tie tails
CABLE_GLAND = cable gland loose/wrong size, wire loose inside gland, Roxtec without clip
GROUNDING = missing earth bond, multiple cables on one earth boss, no PE label, plastic washer on earth
MARKING_MISSING = no cable tag, no device label, no equipment marking, label loose/missing
ZIP_TIE_SS = plastic/nylon zip ties visible (must be stainless steel SS316)
CABLE_ROUTING = cables outside cable ladder, power mixed with signal, cable near moving parts

=== MECHANICAL ===
BOLT_LOOSE = loose bolt, unsecured fastener, torque mark missing
BOLT_PRESERVATION = bolt/nut rust, thread not protected, preservation compound missing
MECHANICAL_LEAK = oil leak, grease leak, fluid on surface, wet stain below equipment
BEARING_DEFECT = worn bearing, damaged bushing, bearing play
HOSE_UNSECURED = hose not clamped, hose touching sharp edge

=== PAINTING / SURFACE ===
RUST_PAINT = rust visible, paint missing, corrosion, paint flaking
SURFACE_BURN = burn mark from welding, discoloration from heat, weld spatter
CLEANLINESS = dirt, dust accumulation, grime buildup

=== STRUCTURAL / SAFETY ===
GRATING_DEFECT = grating gap too large, grating not secured, broken grating
SHARP_EDGE = sharp metal edge, unprotected sharp end, zip tie not cut flush
SAFETY_MARKING = missing SWL/WLL marking, no warning label, missing harness point marking
INSULATION_DAMAGE = damaged thermal insulation, insulation missing
STRUCTURAL_GAP = missing component, hole in structure
MAT_SAT = foreign objects, debris, swarf, construction waste inside cabinet

IMPORTANT — If the image is NOT industrial E&I equipment (e.g. food, people, scenery, generic objects):
  Return exactly: OUT_OF_SCOPE

Rules:
- Return NONE if everything is perfect
- Return OUT_OF_SCOPE if not E&I equipment
- Use EXACT codes above
- Assign severity: A (critical/safety), B (major/functional), C (minor/cosmetic)
- Format: CODE:SEVERITY — example: CRIMPING:A,RUST_PAINT:C
- Severity A = safety risk or blocks energization
- Severity B = must fix before handover
- Severity C = fix before final acceptance
- No explanation, ONLY codes`
}

// ── Call Gemini ───────────────────────────────────────────────────────────────
async function callGemini(parts: unknown[], maxTokens = 300): Promise<string> {
  const body = {
    contents: [{ parts }],
    generationConfig: { temperature: 0.05, maxOutputTokens: maxTokens },
  }

  const res = await fetch(GEMINI_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30_000),
  })

  if (res.status === 429) throw new Error('QUOTA_EXCEEDED')
  if (!res.ok) throw new Error(`Gemini HTTP ${res.status}`)

  const data = await res.json()
  return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toUpperCase() ?? ''
}

// ── Parse screening result ─────────────────────────────────────────────────────
function parseScreening(raw: string): Array<{ code: string; severity: 'A'|'B'|'C' }> {
  if (!raw || raw.includes('NONE') || raw.includes('OUT_OF_SCOPE')) return []

  const results: Array<{ code: string; severity: 'A'|'B'|'C' }> = []
  const seen = new Set<string>()

  for (const token of raw.split(/[,\s]+/)) {
    const [rawCode, rawSev] = token.split(':')
    const code = rawCode?.trim()
    if (!code || !DEFECT_LIBRARY[code]) continue
    if (seen.has(code)) continue
    seen.add(code)

    const sev = rawSev?.trim()
    results.push({
      code,
      severity: (sev === 'A' || sev === 'B' || sev === 'C') ? sev : 'B',
    })
  }

  return results
}

// ── Rate limiting via Supabase (postgres table) ───────────────────────────────
// Table DDL (run once in SQL Editor):
//
//   CREATE TABLE IF NOT EXISTS demo_rate_limit (
//     ip          TEXT NOT NULL,
//     scan_count  INT  NOT NULL DEFAULT 1,
//     window_start TIMESTAMPTZ NOT NULL DEFAULT now(),
//     PRIMARY KEY (ip)
//   );
//   ALTER TABLE demo_rate_limit ENABLE ROW LEVEL SECURITY;
//   -- No user RLS needed — service role only

async function checkRateLimit(ip: string): Promise<{ allowed: boolean; scansLeft: number }> {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    // If Supabase service key not configured, skip rate limiting
    return { allowed: true, scansLeft: DEMO_RATE_LIMIT }
  }

  const sb = createClient(SUPABASE_URL, SUPABASE_KEY)
  const windowStart = new Date(Date.now() - DEMO_WINDOW_H * 3600_000).toISOString()

  try {
    const { data } = await sb
      .from('demo_rate_limit')
      .select('scan_count, window_start')
      .eq('ip', ip)
      .maybeSingle()

    if (!data || data.window_start < windowStart) {
      // No record or window expired — reset
      await sb.from('demo_rate_limit').upsert(
        { ip, scan_count: 1, window_start: new Date().toISOString() },
        { onConflict: 'ip' }
      )
      return { allowed: true, scansLeft: DEMO_RATE_LIMIT - 1 }
    }

    if (data.scan_count >= DEMO_RATE_LIMIT) {
      return { allowed: false, scansLeft: 0 }
    }

    await sb
      .from('demo_rate_limit')
      .update({ scan_count: data.scan_count + 1 })
      .eq('ip', ip)

    return { allowed: true, scansLeft: DEMO_RATE_LIMIT - data.scan_count - 1 }
  } catch {
    // DB error — fail open (allow scan, don't block user)
    return { allowed: true, scansLeft: DEMO_RATE_LIMIT }
  }
}

// ── Main handler ──────────────────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'POST only' }),
      { status: 405, headers: { ...cors, 'Content-Type': 'application/json' } })
  }

  try {
    if (!GEMINI_KEY) {
      throw new Error('GEMINI_API_KEY not set. Run: supabase secrets set GEMINI_API_KEY=AIzaSy...')
    }

    // ── Parse body ───────────────────────────────────────────────────────────
    const body = await req.json()
    const { image, mimeType = 'image/jpeg' } = body

    if (!image || typeof image !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Missing required field: image (base64 string)' }),
        { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }
      )
    }

    // Basic size guard — reject payloads > 12MB base64 (~9MB image)
    if (image.length > 12_000_000) {
      return new Response(
        JSON.stringify({ error: 'Image too large. Max 9MB.' }),
        { status: 413, headers: { ...cors, 'Content-Type': 'application/json' } }
      )
    }

    // ── Rate limit ────────────────────────────────────────────────────────────
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
            ?? req.headers.get('cf-connecting-ip')
            ?? 'unknown'

    const { allowed, scansLeft } = await checkRateLimit(ip)

    if (!allowed) {
      const result: DemoResult = {
        status:    'outOfScope',
        defects:   [],
        scansLeft: 0,
      }
      return new Response(
        JSON.stringify({ ...result, error: 'rate_limit',
          message: 'Hiện đang có nhiều người trải nghiệm phần mềm, vui lòng thử lại sau hoặc để lại email để chúng tôi liên hệ.',
          messageEn: 'Our AI is currently serving many users. Please try again in a moment, or leave your email and we\'ll reach out.',
        }),
        { status: 429, headers: { ...cors, 'Content-Type': 'application/json' } }
      )
    }

    // ── Step 1: Screening ─────────────────────────────────────────────────────
    const screeningParts = [
      { text: buildScreeningPrompt() },
      { inline_data: { mime_type: mimeType, data: image } },
    ]

    const rawScreen = await callGemini(screeningParts, 300)

    // Out of scope check
    if (rawScreen.includes('OUT_OF_SCOPE')) {
      const result: DemoResult = { status: 'outOfScope', defects: [], scansLeft }
      return new Response(JSON.stringify(result),
        { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } })
    }

    const suspects = parseScreening(rawScreen)

    // Passed: no defects
    if (suspects.length === 0) {
      const result: DemoResult = { status: 'passed', defects: [], scansLeft }
      return new Response(JSON.stringify(result),
        { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } })
    }

    // ── Step 2: Quick confirm (single pass, no sample images for web demo) ────
    // Web demo uses a lighter confirm: ask Gemini to verify each suspect
    // in a single multi-defect prompt (faster, fewer API calls).
    const confirmPrompt = `You are a QA/QC inspector.
The image has been flagged for these potential defects: ${suspects.map(s => s.code).join(', ')}

For each code, determine if the defect is ACTUALLY visible in this image.
Reply with ONLY the confirmed defect codes in the same CODE:SEVERITY format.
If a code is NOT actually visible, omit it.
If NONE are confirmed, reply: NONE
No explanation — only confirmed codes like: CRIMPING:A,RUST_PAINT:C`

    const confirmParts = [
      { text: confirmPrompt },
      { inline_data: { mime_type: mimeType, data: image } },
    ]

    let confirmedSuspects = suspects
    try {
      const rawConfirm = await callGemini(confirmParts, 200)
      if (rawConfirm && !rawConfirm.includes('NONE')) {
        const reconfirmed = parseScreening(rawConfirm)
        // Only keep suspects that were reconfirmed; if confirm is empty, trust screening
        if (reconfirmed.length > 0) confirmedSuspects = reconfirmed
      } else if (rawConfirm.includes('NONE')) {
        // AI confirms nothing — pass
        const result: DemoResult = { status: 'passed', defects: [], scansLeft }
        return new Response(JSON.stringify(result),
          { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } })
      }
    } catch {
      // Confirm failed — trust screening result
    }

    // ── Build defect list ─────────────────────────────────────────────────────
    const defects: Defect[] = confirmedSuspects.map(s => ({
      code:        s.code,
      name:        DEFECT_LIBRARY[s.code]?.name        ?? s.code,
      severity:    s.severity,
      instruction: DEFECT_LIBRARY[s.code]?.instruction ?? 'Inspect and rectify per project specification.',
    }))

    // Sort: A first, then B, then C
    defects.sort((a, b) => {
      const order = { A: 0, B: 1, C: 2 }
      return (order[a.severity] ?? 1) - (order[b.severity] ?? 1)
    })

    const result: DemoResult = { status: 'failed', defects, scansLeft }
    return new Response(JSON.stringify(result),
      { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } })

  } catch (err) {
    console.error('demo-scan error:', err)

    const msg = String(err)
    if (msg.includes('QUOTA_EXCEEDED')) {
      return new Response(
        JSON.stringify({
          error: 'ai_quota',
          message: 'Hiện đang có nhiều người trải nghiệm phần mềm, vui lòng thử lại sau.',
          messageEn: 'Our AI is currently serving many users. Please try again in a moment.',
        }),
        { status: 503, headers: { ...cors, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'internal', message: 'Analysis failed. Please try a clearer photo.' }),
      { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } }
    )
  }
})
