/* ═══════════════════════════════════════════════════════════
   SONIC E&I Solutions — main.js
   All page-level JavaScript extracted from index.html
   ═══════════════════════════════════════════════════════════ */

/* ── 0a. MOBILE TICKER CLONE — tránh duplicate HTML ── */
(function() {
  var desktopTrack = document.getElementById('tickerTrack');
  var mobileTrack  = document.getElementById('mobileTickerTrack');
  if (desktopTrack && mobileTrack) {
    mobileTrack.innerHTML = desktopTrack.innerHTML;
  }
})();

/* ── 0. MOBILE MENU ── */
(function () {
  var menu      = document.getElementById('mobileMenu');
  var hamburger = document.getElementById('hamburger');

  window.toggleMenu = function () {
    if (!menu || !hamburger) return;
    var isOpen = menu.classList.contains('open');
    menu.classList.toggle('open', !isOpen);
    hamburger.classList.toggle('open', !isOpen);
    document.body.style.overflow = isOpen ? '' : 'hidden';
  };

  window.closeMenu = function () {
    if (!menu || !hamburger) return;
    menu.classList.remove('open');
    hamburger.classList.remove('open');
    document.body.style.overflow = '';
  };

  // Close when clicking outside
  document.addEventListener('click', function (e) {
    if (menu && menu.classList.contains('open') &&
        !menu.contains(e.target) && !hamburger.contains(e.target)) {
      window.closeMenu();
    }
  });
})();


/* ── 1. PAIN BAR CYCLE (show 10s / hide 50s) ── */
(function(){
  var bar    = document.getElementById('painBar');
  var mob    = document.getElementById('mobilePainBar');
  var toggle = document.getElementById('painBarToggle');

  var SHOW_DURATION = 10000;
  var HIDE_DURATION = 50000;

  var visible    = true;
  var cycleTimer = null;
  var hoverForced = false;

  function showBar() {
    visible = true;
    bar.style.visibility = '';
    bar.style.opacity = '';
    bar.style.pointerEvents = '';
    if (toggle) toggle.textContent = '▲ HIDE';
    if (mob) {
      mob.style.visibility = '';
      mob.style.opacity = '';
      mob.style.pointerEvents = '';
    }
  }

  function hideBar() {
    visible = false;
    bar.style.opacity = '0';
    bar.style.pointerEvents = 'none';
    setTimeout(function(){ bar.style.visibility = 'hidden'; }, 300);
    if (toggle) toggle.textContent = '▼ SHOW';
    if (mob) {
      mob.style.opacity = '0';
      mob.style.pointerEvents = 'none';
      setTimeout(function(){ mob.style.visibility = 'hidden'; }, 300);
    }
  }

  function startCycle() {
    clearTimeout(cycleTimer);
    if (hoverForced) return;
    cycleTimer = setTimeout(function() {
      if (!hoverForced) {
        if (visible) { hideBar(); } else { showBar(); }
        startCycle();
      }
    }, visible ? SHOW_DURATION : HIDE_DURATION);
  }

  var hoverEls = [
    document.querySelector('nav'),
    document.querySelector('.sub-nav-wrap'),
    document.querySelector('.ticker-bar'),
    document.querySelector('.mobile-ticker-bar'),
    bar, mob
  ].filter(Boolean);

  hoverEls.forEach(function(el) {
    el.addEventListener('mouseenter', function() {
      hoverForced = true;
      clearTimeout(cycleTimer);
      if (!visible) showBar();
    });
    el.addEventListener('mouseleave', function() {
      hoverForced = false;
      startCycle();
    });
  });

  window.togglePainBar = function() {
    clearTimeout(cycleTimer);
    if (visible) { hideBar(); } else { showBar(); }
    startCycle();
  };

  startCycle();

  // Dừng timer khi tab bị ẩn — giảm CPU khi user chuyển tab
  document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
      clearTimeout(cycleTimer);
    } else {
      startCycle();
    }
  });
})();


/* ── 2. PROJECT REQUEST SIMILAR ── */
function requestSimilar(projectType, scope) {
  document.querySelectorAll('.qq-chip').forEach(function(c) {
    c.classList.remove('active');
    if (c.getAttribute('data-value') === projectType) c.classList.add('active');
  });

  var scopeEl = document.getElementById('qq-scope');
  if (scopeEl) scopeEl.value = scope;

  var target = document.getElementById('quote');
  if (target) {
    var top = target.getBoundingClientRect().top + window.pageYOffset - 80;
    window.scrollTo({ top: top, behavior: 'smooth' });
  }

  if (scopeEl) {
    setTimeout(function() {
      scopeEl.focus();
      scopeEl.style.transition = 'box-shadow 0.3s';
      scopeEl.style.boxShadow = '0 0 0 2px #c9a227';
      setTimeout(function() { scopeEl.style.boxShadow = ''; }, 1800);
    }, 600);
  }
}


/* ── 3. QUICK QUOTE FORM ── */
(function() {
  // Chip toggle — multi-select
  document.querySelectorAll('.qq-chip').forEach(function(chip) {
    chip.addEventListener('click', function() {
      this.classList.toggle('active');
    });
  });

  function showQuoteSuccess() {
    document.getElementById('qqFormBox').style.display = 'none';
    document.getElementById('qqSuccess').style.display = 'block';

    var secs = 5;
    var cdEl = document.getElementById('qqCountdown');
    if (cdEl) cdEl.textContent = '// RETURNING TO FORM IN ' + secs + 's';

    var cdTimer = setInterval(function() {
      secs--;
      if (cdEl) cdEl.textContent = '// RETURNING TO FORM IN ' + secs + 's';
      if (secs <= 0) clearInterval(cdTimer);
    }, 1000);

    setTimeout(function() {
      clearInterval(cdTimer);
      document.getElementById('qq-name').value = '';
      document.getElementById('qq-email').value = '';
      document.getElementById('qq-scope').value = '';
      document.querySelectorAll('.qq-chip').forEach(function(c){ c.classList.remove('active'); });
      var btn = document.getElementById('qqSubmitBtn');
      btn.textContent = 'Request a Quote  →';
      btn.disabled = false;
      document.getElementById('qqSuccess').style.display = 'none';
      document.getElementById('qqFormBox').style.display = 'flex';
    }, 5000);
  }

  window.qqSubmit = function() {
    var name    = document.getElementById('qq-name');
    var email   = document.getElementById('qq-email');
    var scope   = document.getElementById('qq-scope');
    var typeEls = document.querySelectorAll('.qq-chip.active');
    var valid   = true;

    [name, email, scope].forEach(function(el){ el.classList.remove('qq-error'); });

    if (!name.value.trim())  { name.classList.add('qq-error');  valid = false; }
    if (!email.value.trim() || !email.value.includes('@')) { email.classList.add('qq-error'); valid = false; }
    if (!scope.value.trim()) { scope.classList.add('qq-error'); valid = false; }
    if (!valid) return;

    var projectType = typeEls.length
      ? Array.from(typeEls).map(function(el){ return el.getAttribute('data-value'); }).join(', ')
      : 'Not specified';

    var btn = document.getElementById('qqSubmitBtn');
    btn.textContent = 'Sending…';
    btn.disabled = true;

    var params = {
      from_name:    name.value.trim(),
      from_email:   email.value.trim(),
      project_type: projectType,
      message:      scope.value.trim(),
      subject:      'Quote Request — ' + projectType
    };

    if (typeof emailjs !== 'undefined') {
      emailjs.send('default_service', 'template_contact', params)
        .then(function() {
          return emailjs.send('default_service', 'template_autoreply', {
            to_name:      params.from_name,
            to_email:     params.from_email,
            project_type: params.project_type
          });
        })
        .then(showQuoteSuccess)
        .catch(function(err) {
          console.warn('EmailJS auto-reply skipped:', err);
          showQuoteSuccess();
        });
    } else {
      setTimeout(showQuoteSuccess, 600);
    }
  };
})();


/* ── 4. PDF PREVIEW FALLBACK ── */
(function() {
  var iframe    = document.getElementById('pdf-iframe');
  var fallback  = document.getElementById('pdf-fallback');
  var label     = document.getElementById('pdf-preview-label');
  var container = document.getElementById('pdf-frame-container');
  var pdfUrl    = 'SONIC_E_I_Solutions_Profile_2026_NEW.pdf';

  if (!iframe) return;

  function showFallback() {
    iframe.style.display   = 'none';
    fallback.style.display = 'flex';
    if (label) label.style.display = 'none';
    var cta = container && container.querySelector('.pdf-overlay-cta');
    if (cta) cta.style.display = 'none';
  }

  fetch(pdfUrl, { method: 'HEAD' })
    .then(function(res) { if (!res.ok) showFallback(); })
    .catch(function() { showFallback(); });
})();


/* ── 5. FAQ ACCORDION ── */
function faqToggle(btn) {
  var isOpen = btn.classList.contains('open');
  document.querySelectorAll('.faq-q.open').forEach(function(b) {
    b.classList.remove('open');
    b.nextElementSibling.classList.remove('open');
  });
  if (!isOpen) {
    btn.classList.add('open');
    btn.nextElementSibling.classList.add('open');
  }
}


/* ── 6. CONTACT FORM VALIDATION ── */
window.sonicHandleSubmit = function(event) {
  event.preventDefault();
  event.stopPropagation();

  var emailEl  = document.getElementById('cf-email');
  var emailVal = (emailEl ? emailEl.value : '').trim();
  var emailOk  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal);

  if (!emailOk) {
    if (emailEl) {
      emailEl.style.outline = '2px solid rgba(255,60,60,0.85)';
      emailEl.focus();
      setTimeout(function(){ emailEl.style.outline = ''; }, 3000);
    }
    return false;
  }

  var form           = event.target;
  var checked        = Array.from(form.querySelectorAll('input[name="cf-scope"]:checked'));
  var msgEl          = document.getElementById('cf-message');
  var notSureDetail  = document.getElementById('cf-not-sure-detail');
  var detail         = (notSureDetail && notSureDetail.value.trim()) ? ' | Detail: ' + notSureDetail.value.trim() : '';

  if (msgEl) {
    msgEl.value = checked.length
      ? 'Scope interest: ' + checked.map(function(i){ return i.value; }).join('; ') + detail
      : 'Submitted via short form — no scope selected.' + detail;
  }

  if (typeof handleSubmit === 'function') {
    try { handleSubmit(event); } catch(e) {}
  } else {
    if (typeof emailjs !== 'undefined') {
      var nameVal = (document.getElementById('cf-name') || {}).value || '(not provided)';
      emailjs.send('default_service', 'template_contact', {
        name: nameVal, email: emailVal, message: msgEl ? msgEl.value : ''
      });
    }
    var btn = form.querySelector('button[type="submit"]');
    if (btn) { btn.textContent = '✓ SENT — We\'ll reply within 24h'; btn.disabled = true; }
  }
  return false;
};

document.addEventListener('DOMContentLoaded', function() {
  // "Not sure yet" checkbox toggle
  var cb  = document.getElementById('cb-not-sure');
  var box = document.getElementById('not-sure-box');
  if (cb && box) {
    cb.addEventListener('change', function() {
      box.style.display = this.checked ? 'block' : 'none';
      if (!this.checked) {
        var ta = document.getElementById('cf-not-sure-detail');
        if (ta) ta.value = '';
      }
    });
  }

  // Scope chip → populate hidden message field before submit
  var contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function() {
      var checked       = Array.from(contactForm.querySelectorAll('input[name="cf-scope"]:checked'));
      var msg           = document.getElementById('cf-message');
      var notSureDetail = document.getElementById('cf-not-sure-detail');
      var detail        = notSureDetail && notSureDetail.value.trim() ? ' | Detail: ' + notSureDetail.value.trim() : '';
      if (msg && checked.length) msg.value = 'Scope interest: ' + checked.map(function(i){return i.value;}).join('; ') + detail;
      else if (msg) msg.value = 'Submitted via short form — no scope selected.' + detail;
    });
  }
});


/* ── 7. IN-VIEW BRIGHTNESS BOOST ── */
(function(){
  var targets = [
    'section', '.card', '.case-study', '.testimonial',
    '.hero', '.section-header', '.service-card',
    '.stat-block', '.proof-grid', '.market',
    'nav', '.hero-pain-bar', '.sub-nav-wrap',
    'h1','h2','h3','.section-title','.section-label',
    '.clients-strip', '.fade-in', '.about-grid',
    '.contact-block', 'footer'
  ].join(',');

  var els = document.querySelectorAll(targets);
  els.forEach(function(el){ el.classList.add('in-view-boost'); });

  if (!('IntersectionObserver' in window)) {
    els.forEach(function(el){ el.classList.add('is-visible'); });
    return;
  }
  var obs = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      entry.target.classList.toggle('is-visible', entry.isIntersecting);
    });
  }, { threshold: 0.08 });
  els.forEach(function(el){ obs.observe(el); });
})();


/* ── 8. ZALO WIDGET ── */
document.addEventListener('DOMContentLoaded', function() {
  var btn      = document.getElementById('zalo-btn');
  var box      = document.getElementById('zalo-box');
  var closeBtn = document.getElementById('zalo-close');

  if (!btn || !box || !closeBtn) {
    console.error('Zalo Widget: Missing DOM elements!', { btn, box, closeBtn });
    return;
  }

  // UTM tracking
  (function initUTM() {
    var p = new URLSearchParams(location.search);
    ['utm_source','utm_medium','utm_campaign','utm_content','utm_term'].forEach(function(k) {
      if (p.get(k) && !sessionStorage.getItem(k)) sessionStorage.setItem(k, decodeURIComponent(p.get(k)));
    });
    if (!sessionStorage.getItem('utm_initialized')) sessionStorage.setItem('utm_initialized','1');
  })();

  function getUTM() {
    return {
      utm_source:   sessionStorage.getItem('utm_source')   || 'organic',
      utm_medium:   sessionStorage.getItem('utm_medium')   || 'none',
      utm_campaign: sessionStorage.getItem('utm_campaign') || 'none'
    };
  }

  function fireEvents(action, label) {
    var u = getUTM();
    if (typeof gtag !== 'undefined') gtag('event', 'zalo_' + action, { event_category: 'engagement', event_label: label, ...u });
    if (typeof fbq  !== 'undefined') fbq('trackCustom', 'ZaloWidget_' + action, { content_name: label, ...u });
  }

  var autoHideTimer = null;

  function hideChatBox() {
    box.classList.add('zalo-hidden');
    if (autoHideTimer) { clearTimeout(autoHideTimer); autoHideTimer = null; }
  }

  function showChatBox() {
    box.classList.remove('zalo-hidden');
    if (autoHideTimer) clearTimeout(autoHideTimer);
    autoHideTimer = setTimeout(hideChatBox, 5000);
  }

  btn.addEventListener('click', function(e) {
    e.preventDefault(); e.stopPropagation();
    if (box.classList.contains('zalo-hidden')) {
      showChatBox(); fireEvents('open', 'floating_button');
    } else {
      hideChatBox();
    }
  });

  closeBtn.addEventListener('click', function(e) {
    e.preventDefault(); e.stopPropagation(); hideChatBox();
  });

  document.addEventListener('click', function(e) {
    if (!box.contains(e.target) && !btn.contains(e.target)) hideChatBox();
  });

  box.addEventListener('click', function(e) { e.stopPropagation(); });

  document.querySelectorAll('.zalo-quick-actions a').forEach(function(a) {
    a.addEventListener('click', function() {
      var act = 'unknown';
      if (this.href.includes('zalo.me')) act = 'chat';
      else if (this.href.startsWith('tel:')) act = 'call';
      else if (this.href.startsWith('mailto:')) act = 'email';
      fireEvents('click', act);
    });
  });
});


/* ── 9. ZALO DEEP LINK ── */
function openZalo(e) {
  e.preventDefault();
  var phone   = '84915460790';
  var webLink = 'https://zalo.me/' + phone;
  // Thử mở app trước; nếu không cài, fallback về web sau 1.2s
  window.location.href = 'zalo://chat?phone=' + phone;
  setTimeout(function() {
    window.open(webLink, '_blank');
  }, 1200);
  return false;
}


/* ── 10. AI-PUNCH™ DEMO (phone mockup steps) ── */
(function () {
  var currentStep = 0;
  var totalSteps  = 6;
  var scanTimer   = null;

  function updateProgressBars(step) {
    for (var i = 1; i <= totalSteps; i++) {
      var bar = document.getElementById('sbar' + i);
      if (bar) bar.style.background = i <= step
        ? '#c9a227'
        : 'rgba(201,162,39,0.15)';
    }
    var badge = document.getElementById('demoStepBadge');
    if (badge) badge.textContent = 'STEP ' + step + ' / ' + totalSteps;
  }

  function showStep(idx) {
    for (var i = 0; i < totalSteps; i++) {
      var el = document.getElementById('demoStep' + i);
      if (el) { el.style.display = 'none'; el.style.animation = 'none'; }
    }
    var target = document.getElementById('demoStep' + idx);
    if (target) {
      target.style.display = 'block';
      void target.offsetWidth;
      target.style.animation = 'fadeUp 0.35s both';
    }
    var screen = document.getElementById('demoScreen');
    if (screen) screen.scrollTop = 0;
    updateProgressBars(idx + 1);
  }

  function runScanAnimation(onComplete) {
    var fill       = document.getElementById('progressFill');
    var text       = document.getElementById('progressText');
    var statusText = document.getElementById('scanStatusText');
    var stages = [
      { pct: 18,  status: 'AI đang quét tổng quát...',   label: 'Initializing Gemini AI...' },
      { pct: 35,  status: 'Phân tích cấu trúc dây...',   label: 'Analyzing wiring structure...' },
      { pct: 52,  status: 'Kiểm tra tiêu chuẩn IEC...',  label: 'Checking IEC standards...' },
      { pct: 68,  status: 'So sánh với Siemens TI...',   label: 'Cross-referencing Siemens TI...' },
      { pct: 84,  status: 'Phát hiện bất thường...',     label: 'Detecting anomalies...' },
      { pct: 100, status: 'Phân tích hoàn tất ✓',        label: 'Analysis complete — defect found' }
    ];
    var i = 0;
    if (scanTimer) clearInterval(scanTimer);
    scanTimer = setInterval(function () {
      if (i >= stages.length) {
        clearInterval(scanTimer);
        setTimeout(onComplete, 600);
        return;
      }
      var s = stages[i];
      if (fill)       fill.style.width       = s.pct + '%';
      if (text)       text.textContent       = s.label;
      if (statusText) statusText.textContent = s.status;
      i++;
    }, 420);
  }

  window.demoNext = function () {
    if (currentStep === 0) {
      currentStep = 1;
      showStep(1);
      runScanAnimation(function () {
        currentStep = 2;
        showStep(2);
      });
    } else {
      currentStep = Math.min(currentStep + 1, totalSteps - 1);
      showStep(currentStep);
    }
  };

  window.resetDemo = function () {
    if (scanTimer) clearInterval(scanTimer);
    currentStep = 0;
    showStep(0);
    var fill       = document.getElementById('progressFill');
    var text       = document.getElementById('progressText');
    var statusText = document.getElementById('scanStatusText');
    if (fill)       fill.style.width       = '0%';
    if (text)       text.textContent       = 'Initializing Gemini AI...';
    if (statusText) statusText.textContent = 'AI đang quét tổng quát...';
  };
})();


/* ── 11. VIDEO CLICK-TO-PLAY ── */
function svPlay(frameId) {
  var frame = document.getElementById(frameId);
  if (!frame) return;
  var video = document.getElementById(frameId + '-video');
  if (!video) return;

  // Hide the thumbnail/overlay UI
  frame.classList.add('sv-playing');

  // Show video element and attempt play directly
  video.style.display = 'block';
  video.load(); // force reload source in case browser cached a failed state

  var playAttempt = video.play();
  if (playAttempt !== undefined) {
    playAttempt.catch(function(err) {
      console.warn('svPlay error:', err);
      // Autoplay policy blocked — video is visible with controls, user can press play
    });
  }

  // If file genuinely missing/broken, show a clean error overlay
  video.addEventListener('error', function onErr() {
    video.removeEventListener('error', onErr);
    video.style.display = 'none';
    frame.classList.remove('sv-playing');
    if (frame.querySelector('.sv-missing-notice')) return;
    var n = document.createElement('div');
    n.className = 'sv-missing-notice';
    n.style.cssText = 'position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;background:rgba(8,16,40,0.92);z-index:10;font-family:"Share Tech Mono",monospace;text-align:center;padding:24px;';
    n.innerHTML = '<div style="font-size:28px">🎬</div>'
      + '<div style="font-size:11px;color:#c9a227;letter-spacing:2px;text-transform:uppercase;">Video Not Found</div>'
      + '<div style="font-size:10px;color:rgba(136,153,187,0.7);letter-spacing:1px;line-height:1.7;max-width:240px;">Check that <code style="color:#60a5fa">AI Platform LIVE.mp4</code> is in the <code style="color:#60a5fa">/videos/</code> folder on your server.</div>'
      + '<button onclick="this.parentElement.remove()" style="margin-top:8px;padding:6px 18px;background:rgba(201,162,39,0.12);border:1px solid rgba(201,162,39,0.4);color:#c9a227;font-family:inherit;font-size:10px;letter-spacing:1.5px;cursor:pointer;border-radius:4px;">CLOSE</button>';
    frame.style.position = 'relative';
    frame.appendChild(n);
  }, { once: true });
}


/* ── 11. GA4 + FB PIXEL ──
   Loaded lazily via inline script trong index.html (window 'load' + 3s delay).
   KHÔNG khởi tạo lại ở đây — gây double-fire và block parse thread. */
window.dataLayer = window.dataLayer || [];
function gtag(){ dataLayer.push(arguments); }


/* ── 12. EMAILJS LAZY LOADER ──
   Chuyển từ inline script trong index.html vào đây để giữ HTML sạch. */
(function() {
  var contactSection = document.getElementById('contact');
  if (!contactSection) return;
  contactSection.addEventListener('focusin', function onFocus() {
    var s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
    s.onload = function() {
      var cfg = document.createElement('script');
      cfg.src = 'emailjs-config.js';
      document.head.appendChild(cfg);
    };
    document.head.appendChild(s);
    contactSection.removeEventListener('focusin', onFocus, true);
  }, true);
})();


/* ── 13 + 14. FADE-IN sections — merged IntersectionObserver ── */
(function() {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.fade-in').forEach(function(el) {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    return;
  }
  var style = document.createElement('style');
  style.textContent = '.fade-in{opacity:0;transform:translateY(22px);transition:opacity 0.55s ease,transform 0.55s ease}.fade-in.visible{opacity:1;transform:none}';
  document.head.appendChild(style);

  var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) {
        e.target.classList.add('visible', 'is-visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.fade-in, .in-view-boost').forEach(function(el) {
    obs.observe(el);
  });
})();
