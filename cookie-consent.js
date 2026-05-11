/**
 * SONIC E&I Solutions — Cookie Consent Manager
 * Handles: GA4 (gtag) + Meta Pixel (fbq) consent gating
 * Stores preference in localStorage key: "sonic_cookie_consent"
 * Values: null (not set) | "all" | "essential"
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'sonic_cookie_consent';

  /* ── Helpers ── */
  function getConsent() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }
  function setConsent(value) {
    try { localStorage.setItem(STORAGE_KEY, value); } catch (e) {}
  }

  /* ── Enable / Disable trackers ── */
  function enableAllTrackers() {
    // GA4 — grant consent
    if (typeof gtag === 'function') {
      gtag('consent', 'update', {
        analytics_storage: 'granted',
        ad_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted'
      });
    }
    // Meta Pixel — grant consent
    if (typeof fbq === 'function') {
      fbq('consent', 'grant');
    }
  }

  function disableTrackers() {
    // GA4 — deny
    if (typeof gtag === 'function') {
      gtag('consent', 'update', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied'
      });
    }
    // Meta Pixel — revoke
    if (typeof fbq === 'function') {
      fbq('consent', 'revoke');
    }
  }

  /* ── Banner show / hide ── */
  function showBanner() {
    var banner = document.getElementById('cookie-banner');
    if (banner) {
      // Small delay so the slide-up animation is visible on page load
      setTimeout(function () { banner.classList.add('visible'); }, 600);
    }
  }

  function hideBanner() {
    var banner = document.getElementById('cookie-banner');
    if (banner) {
      banner.classList.remove('visible');
      // Remove from DOM after transition so it doesn't block footer
      setTimeout(function () { banner.style.display = 'none'; }, 500);
    }
  }

  function showSettingsBtn() {
    var btn = document.getElementById('cookie-settings-btn');
    if (btn) btn.style.display = 'block';
  }

  /* ── Modal ── */
  function openModal() {
    var modal = document.getElementById('cookie-modal');
    if (!modal) return;
    // Sync toggles with current prefs
    var consent = getConsent();
    var analyticsToggle = document.getElementById('toggle-analytics');
    var marketingToggle = document.getElementById('toggle-marketing');
    if (analyticsToggle) analyticsToggle.checked = (consent === 'all');
    if (marketingToggle) marketingToggle.checked = (consent === 'all');
    modal.classList.add('open');
  }

  function closeModal() {
    var modal = document.getElementById('cookie-modal');
    if (modal) modal.classList.remove('open');
  }

  /* ── Accept all ── */
  function acceptAll() {
    setConsent('all');
    enableAllTrackers();
    hideBanner();
    closeModal();
    showSettingsBtn();
  }

  /* ── Essential only ── */
  function acceptEssential() {
    setConsent('essential');
    disableTrackers();
    hideBanner();
    closeModal();
    showSettingsBtn();
  }

  /* ── Save from modal ── */
  function savePreferences() {
    var analyticsToggle = document.getElementById('toggle-analytics');
    var marketingToggle = document.getElementById('toggle-marketing');
    var analytics = analyticsToggle ? analyticsToggle.checked : false;
    var marketing  = marketingToggle  ? marketingToggle.checked  : false;

    if (analytics || marketing) {
      setConsent('all');
      enableAllTrackers();
    } else {
      setConsent('essential');
      disableTrackers();
    }
    hideBanner();
    closeModal();
    showSettingsBtn();
  }

  /* ── Init on DOMContentLoaded ── */
  function init() {
    var consent = getConsent();

    // Wire up banner buttons
    var btnAccept  = document.getElementById('cookie-accept');
    var btnDecline = document.getElementById('cookie-decline');
    var btnManage  = document.getElementById('cookie-manage');
    var btnSettingsFloat = document.getElementById('cookie-settings-btn');

    if (btnAccept)  btnAccept.addEventListener('click', acceptAll);
    if (btnDecline) btnDecline.addEventListener('click', acceptEssential);
    if (btnManage)  btnManage.addEventListener('click', openModal);
    if (btnSettingsFloat) btnSettingsFloat.addEventListener('click', function () {
      openModal();
    });

    // Wire up modal buttons
    var btnModalSave  = document.getElementById('cookie-modal-save');
    var btnModalClose = document.getElementById('cookie-modal-close');
    var modal         = document.getElementById('cookie-modal');

    if (btnModalSave)  btnModalSave.addEventListener('click', savePreferences);
    if (btnModalClose) btnModalClose.addEventListener('click', closeModal);
    // Close modal on backdrop click
    if (modal) {
      modal.addEventListener('click', function (e) {
        if (e.target === modal) closeModal();
      });
    }

    // Apply existing consent or show banner
    if (consent === 'all') {
      enableAllTrackers();
      showSettingsBtn();
    } else if (consent === 'essential') {
      disableTrackers();
      showSettingsBtn();
    } else {
      // No consent recorded — show banner, keep trackers in default-denied state
      showBanner();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
