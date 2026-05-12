/**
 * SONIC E&I Solutions — Visitor Stats Bar
 * ══════════════════════════════════════════════════════════════
 * Pulls data from two GA4 APIs via a lightweight backend proxy:
 *
 *   GET /api/stats/realtime   → { activeUsers: N }
 *   GET /api/stats/report     → { today: N, week: N, month: N, total: N }
 *
 * See "BACKEND SETUP" section at the bottom for the proxy
 * implementation (Node/Express or serverless).
 *
 * If no proxy is configured, the bar gracefully hides itself.
 * ══════════════════════════════════════════════════════════════
 */

(function () {
  'use strict';

  /* ── CONFIG ── edit these ── */
  var CONFIG = {
    /* URL of your backend proxy endpoints */
    realtimeEndpoint : '/api/stats/realtime',
    reportEndpoint   : '/api/stats/report',

    /* How often to refresh (ms) */
    realtimeInterval : 30_000,   /* 30s  — realtime active users */
    reportInterval   : 300_000,  /* 5min — daily / weekly / monthly */

    /* Show the bar only when we have at least one successful fetch */
    hideUntilLoaded  : true,
  };
  /* ── END CONFIG ── */

  /* ── DOM refs ── */
  var bar       = document.getElementById('stats-bar');
  var elLive    = document.getElementById('stat-live');
  var elToday   = document.getElementById('stat-today');
  var elWeek    = document.getElementById('stat-week');
  var elMonth   = document.getElementById('stat-month');
  var elTotal   = document.getElementById('stat-total');

  if (!bar) return; /* bar not on this page */

  /* ── Number formatter ── */
  function fmt(n) {
    if (n === null || n === undefined || isNaN(n)) return '—';
    n = parseInt(n, 10);
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (n >= 1_000)     return (n / 1_000).toFixed(1).replace(/\.0$/, '')     + 'K';
    return String(n);
  }

  /* ── Update a single stat element with flicker ── */
  function update(el, value, isLive) {
    if (!el) return;
    var formatted = fmt(value);
    if (el.textContent === formatted) return; /* no change */

    el.classList.remove('loading', 'error');
    if (isLive) el.classList.add('live-val');

    el.classList.add('updating');
    el.textContent = formatted;
    setTimeout(function () { el.classList.remove('updating'); }, 400);
  }

  function setError(el) {
    if (!el) return;
    el.classList.remove('loading', 'updating');
    el.classList.add('error');
    el.textContent = '—';
  }

  /* ── Fetch realtime active users ── */
  function fetchRealtime() {
    fetch(CONFIG.realtimeEndpoint, { credentials: 'same-origin' })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (data) {
        update(elLive, data.activeUsers, true);
        if (CONFIG.hideUntilLoaded) bar.style.opacity = '1';
      })
      .catch(function () {
        setError(elLive);
      });
  }

  /* ── Fetch historical report (today / week / month / total) ── */
  function fetchReport() {
    fetch(CONFIG.reportEndpoint, { credentials: 'same-origin' })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (data) {
        update(elToday, data.today);
        update(elWeek,  data.week);
        update(elMonth, data.month);
        update(elTotal, data.total);
      })
      .catch(function () {
        [elToday, elWeek, elMonth, elTotal].forEach(setError);
      });
  }

  /* ── Init ── */
  if (CONFIG.hideUntilLoaded) bar.style.opacity = '0';

  fetchRealtime();
  fetchReport();

  setInterval(fetchRealtime, CONFIG.realtimeInterval);
  setInterval(fetchReport,   CONFIG.reportInterval);

})();


/*
 * ══════════════════════════════════════════════════════════════
 * BACKEND SETUP (Node / Express example)
 * ══════════════════════════════════════════════════════════════
 *
 * Prerequisites:
 *   npm install @google-analytics/data googleapis
 *
 * Environment variables required:
 *   GA4_PROPERTY_ID   = "properties/XXXXXXXXX"   (from GA4 Admin → Property Settings)
 *   GOOGLE_APPLICATION_CREDENTIALS = "/path/to/service-account.json"
 *   (or set individual key fields — see Google Auth library docs)
 *
 * ── routes/stats.js ────────────────────────────────────────────
 *
 * const { BetaAnalyticsDataClient } = require('@google-analytics/data');
 * const express = require('express');
 * const router  = express.Router();
 * const client  = new BetaAnalyticsDataClient();
 * const PROP    = process.env.GA4_PROPERTY_ID;   // "properties/XXXXXXXXX"
 *
 * // GET /api/stats/realtime — active users right now
 * router.get('/realtime', async (req, res) => {
 *   try {
 *     const [response] = await client.runRealtimeReport({
 *       property: PROP,
 *       metrics: [{ name: 'activeUsers' }],
 *     });
 *     const activeUsers = parseInt(
 *       response.rows?.[0]?.metricValues?.[0]?.value ?? '0', 10
 *     );
 *     res.json({ activeUsers });
 *   } catch (err) {
 *     console.error(err);
 *     res.status(500).json({ error: 'realtime_failed' });
 *   }
 * });
 *
 * // GET /api/stats/report — today / week / month / total
 * router.get('/report', async (req, res) => {
 *   try {
 *     // Run three date-range queries in parallel
 *     const ranges = [
 *       { startDate: 'today',    endDate: 'today',         name: 'today' },
 *       { startDate: '7daysAgo', endDate: 'today',         name: 'week'  },
 *       { startDate: '30daysAgo',endDate: 'today',         name: 'month' },
 *       { startDate: '2005-01-01', endDate: 'today',       name: 'total' },
 *     ];
 *
 *     const results = await Promise.all(ranges.map(range =>
 *       client.runReport({
 *         property: PROP,
 *         metrics: [{ name: 'sessions' }],
 *         dateRanges: [{ startDate: range.startDate, endDate: range.endDate }],
 *       }).then(([r]) => ({
 *         key: range.name,
 *         value: parseInt(r.rows?.[0]?.metricValues?.[0]?.value ?? '0', 10),
 *       }))
 *     ));
 *
 *     const payload = {};
 *     results.forEach(r => { payload[r.key] = r.value; });
 *     res.json(payload);
 *   } catch (err) {
 *     console.error(err);
 *     res.status(500).json({ error: 'report_failed' });
 *   }
 * });
 *
 * module.exports = router;
 *
 * ── server.js (register the route) ─────────────────────────────
 *
 * const statsRouter = require('./routes/stats');
 * app.use('/api/stats', statsRouter);
 *
 * ── Google Cloud setup ──────────────────────────────────────────
 * 1. Google Cloud Console → APIs & Services → Enable:
 *       "Google Analytics Data API"
 * 2. IAM → Service Accounts → Create → download JSON key
 * 3. GA4 Admin → Property → Property Access Management →
 *       Add the service account email with "Viewer" role
 * 4. Set GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json
 *
 * ── Serverless (Vercel / Netlify) ──────────────────────────────
 * Same @google-analytics/data package works in serverless functions.
 * Set env vars in dashboard. Add rate limiting + caching (Redis or
 * in-memory) so you don't hit GA4 API quota on every page load.
 * Recommended: cache /report response for 5 minutes.
 * ══════════════════════════════════════════════════════════════
 */
