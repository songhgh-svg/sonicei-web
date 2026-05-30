/* ════════════════════════════════════════════════════════════
   SONIC E&I — Scrollspy Sidebar
   File: scrollspy-sidebar.js

   CÁCH TÍCH HỢP:
   1. Dán <link rel="stylesheet" href="scrollspy-sidebar.css">
      vào <head> của index.html (sau main.css)
   2. Dán HTML snippet bên dưới vào ngay sau thẻ <body> mở:

      <nav class="ss-bar" id="ss-bar" aria-label="Page navigation">
        <div class="ss-progress" id="ss-progress"></div>
      </nav>

   3. Dán <script src="scrollspy-sidebar.js"></script>
      vào ngay trước </body>
   ════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── 1. KHAI BÁO SECTIONS ────────────────────────────────
     id    : khớp với thuộc tính id trên <section> thật
     en    : nhãn tiếng Anh (tooltip khi lang=en)
     vi    : nhãn tiếng Việt (tooltip khi lang=vi)
     ──────────────────────────────────────────────────────── */
  var SECTIONS = [
    { id: 'home',            en: 'Hero',              vi: 'Trang Chủ'          },
    { id: 'why-epc',         en: 'Why EPC',           vi: 'Vì Sao EPC'         },
    { id: 'ai',              en: 'AI Platform',       vi: 'Nền Tảng AI'        },
    { id: 'projects',        en: 'Projects',          vi: 'Dự Án'              },
    { id: 'photo-gallery',   en: 'Eng. Experience',   vi: 'Kinh Nghiệm'        },
    { id: 'services',        en: 'Services',          vi: 'Dịch Vụ'            },
    { id: 'project-delivery',en: 'Project Delivery',  vi: 'Triển Khai'         },
    { id: 'supply',          en: 'Supply',            vi: 'Vật Tư'             },
    { id: 'academy',         en: 'Academy',           vi: 'Academy'            },
    { id: 'about',           en: 'About',             vi: 'Về Chúng Tôi'       },
    { id: 'contact',         en: 'Contact',           vi: 'Liên Hệ'            },
    { id: 'investors',       en: 'Investors',         vi: 'Nhà Đầu Tư'         },
    { id: 'faq',             en: 'FAQ',               vi: 'FAQ'                },
  ];

  /* ── 2. ĐỢI DOM SẴN SÀNG ──────────────────────────────── */
  function init() {
    var bar      = document.getElementById('ss-bar');
    var progress = document.getElementById('ss-progress');
    if (!bar) return;

    var items = []; /* { el, item, labelEl } */

    /* ── 3. BUILD DOTS ─────────────────────────────────── */
    SECTIONS.forEach(function (sec) {
      var el = document.getElementById(sec.id);
      if (!el) return; /* bỏ qua section không tồn tại */

      var item = document.createElement('div');
      item.className = 'ss-item';
      item.setAttribute('role', 'button');
      item.setAttribute('tabindex', '0');
      item.setAttribute('aria-label', 'Go to ' + sec.en);

      var dot = document.createElement('div');
      dot.className = 'ss-dot';

      var label = document.createElement('span');
      label.className = 'ss-label';
      label.textContent = getCurrentLabel(sec);

      item.appendChild(dot);
      item.appendChild(label);

      /* Click → smooth scroll tới section */
      function goTo() {
        var navHeight = 48; /* chiều cao nav fixed của sonicei */
        var top = el.getBoundingClientRect().top + window.pageYOffset - navHeight;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
      item.addEventListener('click', goTo);
      item.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goTo(); }
      });

      bar.insertBefore(item, progress);
      items.push({ el: el, item: item, labelEl: label, sec: sec });
    });

    /* ── 4. SCROLLSPY ──────────────────────────────────── */
    var ticking = false;

    function update() {
      var threshold = window.innerHeight * 0.38;
      var activeIdx = 0;

      items.forEach(function (s, i) {
        var rect = s.el.getBoundingClientRect();
        if (rect.top <= threshold) activeIdx = i;
      });

      items.forEach(function (s, i) {
        s.item.classList.toggle('active', i === activeIdx);
      });

      /* Progress line */
      if (progress && items.length > 1) {
        /* Tổng chiều cao vùng dots (bỏ padding top/bottom của bar::before) */
        var barItems  = bar.querySelectorAll('.ss-item');
        if (barItems.length > 1) {
          var first = barItems[0].getBoundingClientRect();
          var last  = barItems[barItems.length - 1].getBoundingClientRect();
          var total = last.top - first.top;
          var filled = total > 0 ? (activeIdx / (items.length - 1)) * total : 0;
          progress.style.height = Math.max(0, filled) + 'px';
        }
      }
    }

    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { ticking = false; update(); });
    }, { passive: true });

    update(); /* chạy ngay khi load */

    /* ── 5. SYNC NGÔN NGỮ VỚI sonicSetLang ────────────── */
    function getCurrentLabel(sec) {
      var lang = document.documentElement.lang || 'en';
      return lang === 'vi' ? sec.vi : sec.en;
    }

    function syncLabels() {
      items.forEach(function (s) {
        s.labelEl.textContent = getCurrentLabel(s.sec);
        s.item.setAttribute('aria-label', 'Go to ' + getCurrentLabel(s.sec));
      });
    }

    /*
     * Hook vào hệ thống i18n hiện có của sonicei:
     * sonicSetLang() được patch qua MutationObserver trên html[lang]
     * → không cần sửa main.js, chỉ cần watch thuộc tính lang
     */
    var langObs = new MutationObserver(function (muts) {
      muts.forEach(function (m) {
        if (m.attributeName === 'lang') syncLabels();
      });
    });
    langObs.observe(document.documentElement, { attributes: true });
  }

  /* Chạy sau DOMContentLoaded */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
