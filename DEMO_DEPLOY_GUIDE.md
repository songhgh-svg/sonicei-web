# SONIC AI-Punch™ — Web Demo: Deploy Guide
# Kích hoạt live Gemini AI trên trang web sonicei.com
# ─────────────────────────────────────────────────────────────────────────────


════════════════════════════════════════════════════════════
BƯỚC 1 — Tạo thư mục Edge Function
════════════════════════════════════════════════════════════

Trong project Flutter (cùng thư mục gốc với pubspec.yaml):

  mkdir -p supabase/functions/demo-scan
  cp demo-scan-index.ts supabase/functions/demo-scan/index.ts

Cấu trúc sau khi xong:
  project-root/
  ├── pubspec.yaml
  ├── lib/
  └── supabase/
      └── functions/
          ├── send-report/
          │   └── index.ts          ← đã có từ bước 7
          └── demo-scan/
              └── index.ts          ← file mới


════════════════════════════════════════════════════════════
BƯỚC 2 — Chạy SQL migration
════════════════════════════════════════════════════════════

Vào Supabase Dashboard → SQL Editor
Copy và chạy toàn bộ nội dung file: migration_demo_rate_limit.sql

Verify thành công:
  table demo_rate_limit hiện trong Table Editor


════════════════════════════════════════════════════════════
BƯỚC 3 — Set secrets
════════════════════════════════════════════════════════════

GEMINI_API_KEY đã được set từ bước 7 (send-report) nếu bạn đã deploy.
Nếu chưa:

  supabase secrets set GEMINI_API_KEY=AIzaSy...

Cần thêm SUPABASE_SERVICE_ROLE_KEY cho rate limiting:

  # Lấy từ: Supabase Dashboard → Settings → API → service_role key
  supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

  # SUPABASE_URL tự động có sẵn trong Edge Function environment,
  # nhưng set thêm để chắc chắn:
  supabase secrets set SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co

Verify secrets đã set:
  supabase secrets list


════════════════════════════════════════════════════════════
BƯỚC 4 — Deploy
════════════════════════════════════════════════════════════

  supabase functions deploy demo-scan --no-verify-jwt

Expected output:
  Deployed Function demo-scan
  https://YOUR_PROJECT_REF.supabase.co/functions/v1/demo-scan


════════════════════════════════════════════════════════════
BƯỚC 5 — Test
════════════════════════════════════════════════════════════

Test với ảnh sample (terminal block):

  curl -X POST \
    'https://YOUR_PROJECT_REF.supabase.co/functions/v1/demo-scan' \
    -H 'Authorization: Bearer YOUR_ANON_KEY' \
    -H 'Content-Type: application/json' \
    -d '{
      "image": "'$(base64 -i path/to/test-image.jpg | tr -d '\n')'",
      "mimeType": "image/jpeg",
      "lang": "en"
    }'

Expected response (FAILED example):
  {
    "status": "failed",
    "defects": [
      {
        "code": "CRIMPING",
        "name": "Crimp Terminal Defect",
        "severity": "A",
        "instruction": "Re-crimp with correct ferrule size..."
      }
    ],
    "scansLeft": 2
  }

Expected response (PASSED example):
  { "status": "passed", "defects": [], "scansLeft": 2 }

Expected response (non E&I image):
  { "status": "outOfScope", "defects": [], "scansLeft": 2 }


════════════════════════════════════════════════════════════
BƯỚC 6 — Activate trong HTML
════════════════════════════════════════════════════════════

Mở file ai-punch.html, tìm DEMO_CONFIG (khoảng dòng 930):

  const DEMO_CONFIG = {
    supabaseUrl: 'https://YOUR_PROJECT_REF.supabase.co',  // ← thay
    anonKey:     'YOUR_ANON_KEY',                          // ← thay
    endpoint:    '/functions/v1/demo-scan',
    maxScans:    3,
    storageKey:  'aipunch_demo_v1',
    liveMode:    false,   // ← ĐỔI THÀNH true
  };

Sau khi thay:
  liveMode: true,
  supabaseUrl: 'https://abcdefghij.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',

Upload ai-punch.html lên server → demo trang web sẽ dùng Gemini thật.


════════════════════════════════════════════════════════════
KIẾN TRÚC & RATE LIMITING
════════════════════════════════════════════════════════════

Flow:
  Browser → [base64 image] → Edge Function (demo-scan)
                               │
                   ┌───────────┴───────────┐
                   │ Rate limit check      │
                   │ demo_rate_limit table │
                   │ 3 scans / IP / 24h    │
                   └───────────┬───────────┘
                               │ allowed
                   ┌───────────┴───────────┐
                   │ Gemini API call 1     │
                   │ Screening prompt      │
                   │ → defect codes        │
                   └───────────┬───────────┘
                               │ suspects found
                   ┌───────────┴───────────┐
                   │ Gemini API call 2     │
                   │ Confirm prompt        │
                   │ (single call, no      │
                   │  sample images)       │
                   └───────────┬───────────┘
                               │
                   ┌───────────┴───────────┐
                   │ Return JSON result    │
                   │ { status, defects,    │
                   │   scansLeft }         │
                   └───────────────────────┘

Rate limit design:
  - IP-based (x-forwarded-for header)
  - 3 scans per IP per 24 hours
  - localStorage in browser adds a second layer (client-side)
  - Rate limit table stores minimum data: only IP hash + count + timestamp
  - No personal data collected

Cost estimate (Gemini 2.5 Flash, free tier):
  - 15 requests/minute, 1,500/day free
  - 2 Gemini calls per demo scan
  - 3 scans max per user per day
  - With 50 unique visitors: 50 × 3 × 2 = 300 calls/day → well within free tier
  - Scale to paid tier when needed: ~$0.00035 per 1K tokens input


════════════════════════════════════════════════════════════
TROUBLESHOOTING
════════════════════════════════════════════════════════════

Lỗi                            | Giải pháp
─────────────────────────────────────────────────────────────
GEMINI_API_KEY not set         | supabase secrets set GEMINI_API_KEY=...
429 from demo (rate limit)     | Normal — user đã dùng hết 3 lượt
503 ai_quota                   | Gemini quota hết — upgrade Google AI plan
"Analysis failed"              | Ảnh quá nhỏ/mờ/không phải E&I equipment
CORS error in browser          | Function chưa deploy hoặc URL sai
liveMode: false (mock)         | Quên đổi sang liveMode: true
"Incorrect API key"            | Kiểm tra GEMINI_API_KEY trong supabase secrets list
Rate limit không hoạt động     | Thiếu SUPABASE_SERVICE_ROLE_KEY — function fail open (OK)


════════════════════════════════════════════════════════════
OPTIONAL: Cleanup cron job (pg_cron)
════════════════════════════════════════════════════════════

Nếu muốn tự động dọn rate limit table mỗi ngày:

  -- Enable pg_cron extension (Supabase → Database → Extensions)
  CREATE EXTENSION IF NOT EXISTS pg_cron;

  -- Chạy cleanup mỗi ngày lúc 03:00 UTC
  SELECT cron.schedule(
    'demo-ratelimit-cleanup',
    '0 3 * * *',
    $$DELETE FROM demo_rate_limit WHERE window_start < now() - interval '48 hours'$$
  );
