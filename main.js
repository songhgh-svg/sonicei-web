  // ── SCROLL FADE-IN ──
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

  // ── PARALLAX HERO GRID ──
  const gridLines = document.querySelector('.grid-lines');
  window.addEventListener('scroll', () => {
    if (gridLines) {
      const scrollY = window.scrollY;
      gridLines.style.transform = `translateY(${scrollY * 0.3}px)`;
    }
  }, { passive: true });

  // ── ANIMATED COUNTERS ──
  const counters = document.querySelectorAll('.counter');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.done) {
        entry.target.dataset.done = '1';
        const target = parseInt(entry.target.dataset.target);
        const suffix = entry.target.dataset.suffix || '';
        let current = 0;
        const increment = target / 40;
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          entry.target.textContent = Math.floor(current) + suffix;
        }, 40);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => counterObserver.observe(c));

  // ── MARKET BARS ANIMATION ──
  const barObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.market-bar-fill').forEach(bar => {
          const w = bar.dataset.width;
          setTimeout(() => { bar.style.width = w + '%'; }, 200);
        });
      }
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('.market-bars').forEach(el => barObserver.observe(el));

  // ── FLOATING CTA show/hide ──

  // ── DYNAMIC NAV HEIGHT → sub-nav position + hero padding ──
  function alignSubNav() {
    const nav         = document.querySelector('nav');
    const subNav      = document.querySelector('.sub-nav-wrap');
    const hero        = document.querySelector('.hero');
    const mobilePain  = document.querySelector('.mobile-pain-bar');
    const mobileTick  = document.querySelector('.mobile-ticker-bar');
    if (!nav) return;
    const navH     = nav.getBoundingClientRect().height;
    const isMobile = window.innerWidth <= 900;

    if (isMobile) {
      // Position mobile fixed bars: ticker first below nav, pain bar below ticker
      var painH = 0, tickH = 0;
      if (mobileTick) {
        mobileTick.style.top = navH + 'px';
        tickH = mobileTick.getBoundingClientRect().height;
      }
      if (mobilePain) {
        mobilePain.style.top = (navH + tickH) + 'px';
        painH = mobilePain.getBoundingClientRect().height;
      }
      // Hero padding = nav + ticker + pain + gap
      if (hero) hero.style.paddingTop = (navH + tickH + painH + 20) + 'px';
    } else {
      // Desktop: use fixed sub-nav below nav
      const subNavH = subNav ? subNav.getBoundingClientRect().height : 0;
      if (subNav) subNav.style.transform = 'translateY(' + navH + 'px)';
      if (hero) hero.style.paddingTop = (navH + subNavH + 60) + 'px';
    }
    document.documentElement.style.setProperty('--nav-h', navH + 'px');
  }
  document.addEventListener('DOMContentLoaded', alignSubNav);
  window.addEventListener('load',   alignSubNav);
  window.addEventListener('resize', alignSubNav);
  if (document.fonts && document.fonts.ready) { document.fonts.ready.then(alignSubNav); }
  // Run immediately after first paint to fix flash-of-overlap on mobile
  requestAnimationFrame(function() { alignSubNav(); requestAnimationFrame(alignSubNav); });

  // ── HAMBURGER MENU ──
  function toggleMenu() {
    const menu = document.getElementById('mobileMenu');
    const btn = document.getElementById('hamburger');
    menu.classList.toggle('open');
    btn.classList.toggle('open');
  }
  function closeMenu() {
    document.getElementById('mobileMenu').classList.remove('open');
    document.getElementById('hamburger').classList.remove('open');
  }

  // ── 6-STEP DEMO ──
  var _demoStep = 0;
  function showStep(n) {
    for (var i = 0; i < 6; i++) {
      var el = document.getElementById('demoStep' + i);
      if (el) el.style.display = (i === n) ? '' : 'none';
    }
    var sc = document.getElementById('demoScreen');
    if (sc) sc.scrollTop = 0;
    var badge = document.getElementById('demoStepBadge');
    if (badge) badge.textContent = 'STEP ' + (n+1) + ' / 6';
    for (var j = 1; j <= 6; j++) {
      var b = document.getElementById('sbar' + j);
      if (b) b.style.background = (j <= n+1) ? '#c9a227' : 'rgba(201,162,39,0.15)';
    }
    _demoStep = n;
  }
  function demoNext() {
    var next = _demoStep + 1;
    if (next === 1) {
      showStep(1);
      var fill = document.getElementById('progressFill');
      var text = document.getElementById('progressText');
      var status = document.getElementById('scanStatusText');
      if (fill) fill.style.width = '0%';
      var msgs = ['Initializing Gemini AI...','Buoc 1/2: Quet tong quat...','Scanning layout...','Buoc 2/2: Phan tich chi tiet...','Cross-checking IEC...','Generating report...'];
      var scanMsgs = ['AI đang quét tổng quát...','Phân tích chi tiết lỗi...','Kiểm tra tiêu chuẩn IEC...'];
      var pct = 0, mi = 0, si = 0;
      var t = setInterval(function(){
        pct += 1.6;
        if (fill) fill.style.width = Math.min(pct,100)+'%';
        if (pct % 18 < 1.6 && mi < msgs.length-1){ mi++; if (text) text.textContent = msgs[mi]; }
        if (pct % 32 < 1.6 && si < scanMsgs.length-1){ si++; if (status) status.textContent = scanMsgs[si]; }
        if (pct >= 100){ clearInterval(t); setTimeout(function(){ showStep(2); }, 400); }
      }, 28);
    } else { showStep(next); }
  }
  function startDemo() { demoNext(); }
  function fixDemo()   { showStep(3); }
  function resetDemo() {
    var fill = document.getElementById('progressFill');
    var text = document.getElementById('progressText');
    if (fill) fill.style.width = '0%';
    if (text) text.textContent = 'Initializing Gemini AI...';
    showStep(0);
  }


  // ── LANGUAGE SWITCHER ──
  const translations = {
    en: {
      // NAV
      nav_about: 'About', nav_services: 'Services', nav_supply: 'Supply',
      // VISION
      nav_vision: 'Vision',
      vision_label: '// Strategic Direction',
      vision_title1: 'VISION · MISSION', vision_title2: '& CORE VALUES',
      vision_sub: 'Strategic Direction & Professional Integrity',
      vision_card1_title: 'VISION',
      vision_card1_body: 'To be the premier E&I technical partner in Southeast Asia, recognized for integrating global engineering standards with innovative AI-driven precision.',
      vision_card2_title: 'MISSION',
      vision_card2_body: 'To ensure absolute technical integrity of energy infrastructures through veteran expertise, "Right First Time" execution, and a commitment to zero-defect delivery.',
      vision_card3_title: 'CORE VALUES',
      val1_name: 'PRECISION', val1_desc: 'Excellence in every termination and calibration.',
      val2_name: 'INTEGRITY', val2_desc: 'Transparency in technical reporting and safety compliance.',
      val3_name: 'INNOVATION', val3_desc: 'Pioneering AI-Punch™ technology to eliminate human error.',
      nav_results: 'Results', nav_investors: 'Investors', nav_gallery: 'Gallery',
      nav_academy: 'Academy', nav_contact: 'Contact',
      nav_cta: 'Request Consultation',
      // HERO H1
      hero_h1_line1: 'ZERO DEFECT.', hero_h1_line2: 'ZERO REWORK.', hero_h1_line3: 'OR YOU DON\'T PAY.',
      hero_pain_bar: 'Every defect costs $500–$5,000 · Every delay day costs $50K+ · Most EPCs accept this as "normal" — We don\'t.',
      hero_guarantee_badge: 'PERFORMANCE GUARANTEE — ZERO DEFECT<br>OR FEE REDUCTION APPLIED',
      // ABOUT
      about_title1: '25 YEARS ON THE', about_title2: 'GLOBAL FRONTLINES',
      about_p1: "SONIC E&I Solutions is a specialist firm delivering precision Electrical & Instrumentation services for the world's most demanding energy projects. Founded by a former Siemens Energy official and GE Owner's Engineer, we bring international standards directly to the field.",
      about_quote: '"Integrating Global Standards into Local Field Excellence."',
      about_p2: "From Siemens gas turbines to GE gensets, VIETSOVPETRO offshore platforms to VARD vessel systems — our team has operated at the highest levels of technical integrity across 25+ years.",
      dl_desc: 'Download our full company profile — complete service offering, project history, technical credentials and AI-Punch™ platform details. Available in PDF and PowerPoint.',
      dl_btn1: '⬇ Download PDF', dl_btn2: '⬇ Download PPTX',
      // HERO
      hero_tag: '// SONIC E&I SOLUTIONS — EST. 2000',
      hero_sub: "Stop paying for rework. We guarantee zero-defect E&I commissioning — backed by our fee, not just our words.",
      hero_btn1: 'Book a Free 30-Min Call', hero_btn2: 'See AI-Punch™ Demo',
      hero_cta_micro: 'No commitment · Response within 24h · Zero-defect guarantee included',
      hero_stat1: 'Years Experience', hero_stat2: 'Global Partners', hero_stat3: 'AI Powered QA/QC',
      hero_proof2: 'Punch Items Closed', hero_proof3: 'Defects at Handover',
      hero_kpi1: 'Rework Cost Saved', hero_kpi2: 'Faster Punch Closure', hero_kpi3: 'On-Time Handover', hero_kpi3_sub: '✓ Guaranteed',
      ai_proof1: 'Early Access — Live Testing Phase', ai_proof2: 'Defect Detection Accuracy', ai_proof3: 'Report Generated Per Item', ai_proof4_label: 'Trusted by',
      hiw1_title: 'Take Photo or Upload', hiw1_desc: 'Capture termination or component directly in field',
      hiw2_title: 'AI Analyzes Image', hiw2_desc: 'Google Gemini AI scans for defects in under 3 seconds',
      hiw3_title: 'Get Error Code', hiw3_desc: 'Exact defect type, location and severity returned instantly',
      hiw4_title: 'FIXED ✓', hiw4_desc: 'Technician resolves defect — AI confirms correction',
      hiw5_title: 'Report Immediately', hiw5_desc: 'PDF report with photo evidence auto-sent to team',
      hiw6_title: 'Save to Cloud', hiw6_desc: 'All results stored — searchable, traceable, audit-ready',
      // ABOUT
      about_label: '// About Us',
      about_title1: '25 YEARS ON THE', about_title2: 'GLOBAL FRONTLINES',
      about_p1: "SONIC E&I Solutions is a specialist firm delivering precision Electrical & Instrumentation services for the world's most demanding energy projects. Founded by a former Siemens Energy official and GE Owner's Engineer, we bring international standards directly to the field.",
      about_quote: '"Integrating Global Standards into Local Field Excellence."',
      about_p2: "From Siemens gas turbines to GE gensets, VIETSOVPETRO offshore platforms to VARD vessel systems — our team has operated at the highest levels of technical integrity across 25+ years.",
      // CRED
      cred_label1: 'Official Staff', cred_val1: 'Siemens Energy',
      cred_sub1: 'Turbines & Gensets Commissioning, Field Service & Project Management',
      cred_label2: "Owner's Engineer", cred_val2: 'GE Turbines & Gensets',
      cred_sub2: 'Technical Integrity & Specification Compliance',
      cred_label3: 'Sub-contractor', cred_val3: 'Vietsovpetro · VARD · Seaonics',
      cred_sub3: 'Offshore Platforms & OSV Vessel Systems',
      cred_label4: 'Standards', cred_val4: 'IEC 61084 · Siemens Spec · GE Spec',
      cred_sub4: 'All projects executed to international E&I standards',
      cred_label5: 'Proprietary Technology', cred_val5: 'SONIC AI-Punch™ Platform',
      cred_sub5: 'AI-assisted QA/QC · Powered by Google Gemini',
      // DOWNLOAD
      dl_title: '🤝 COMPANY PROFILE 2026',
      dl_desc: 'Download our full company profile — complete service offering, project history, technical credentials and AI-Punch™ platform details. Available in PDF.',
      dl_btn1: '⬇ Download PDF', dl_btn2: '⬇ Download PPTX',
      // SERVICES
      svc_label: '// What We Do',
      svc_title1: 'ELITE', svc_title2: 'E&I', svc_title3: 'EXECUTION',
      svc_sub: "International standards. Precision results. Right First Time — we don't just finish projects; we deliver integrity.",
      // CONTACT
      contact_label: '// Get In Touch',
      contact_title1: 'YOUR TRUSTED', contact_title2: 'PARTNER',
      contact_desc: 'Ready to bring international E&I standards to your next project? Contact us today.',
      contact_name: 'Founder & CEO', contact_phone_label: 'Phone / Zalo',
      contact_email_label: 'Email', contact_location_label: 'Location',
      contact_location: '📍 Vung Tau, Vietnam',
      form_name: 'Name', form_company: 'Company', form_email: 'Email',
      form_service: 'Service', form_select: 'Select a service...',
      form_message: 'Message', form_placeholder: 'Tell us about your project...',
      form_send: 'SEND MESSAGE', form_title: 'SEND A MESSAGE',
      form_name_ph: 'Your name', form_company_ph: 'Your company',

      // NEW SERVICE CARDS
      svc_card4_title: 'QA/QC & PUNCH LIST',
      svc_card4_desc: 'AI-powered punch list management and QA/QC inspection using SONIC AI-Punch™ — eliminating human error with real-time photo verification and instant reporting.',
      svc_card4_li1: 'AI-Punch™ defect detection',
      svc_card4_li2: 'Digital punch list tracking',
      svc_card4_li3: 'Photo evidence per item',
      svc_card4_li4: 'Auto email report on close-out',
      svc_card4_li5: 'Zero-defect delivery guarantee',
      svc_card5_title: 'PRE-STARTUP SAFETY REVIEW',
      svc_card5_desc: 'Comprehensive PSSR execution ensuring all E&I systems are safe, compliant and ready for startup — protecting assets, personnel and project timelines.',
      svc_card5_li1: 'IEC / Siemens / GE compliance audit',
      svc_card5_li2: 'Hazard identification & risk review',
      svc_card5_li3: 'Instrument & safety loop verification',
      svc_card5_li4: 'Formal PSSR documentation',
      svc_card5_li5: 'Startup authorization sign-off',
      // SERVICE OPTIONS
      svc_opt1: 'Installation & Wiring', svc_opt2: 'System Commissioning',
      svc_opt3: 'Technical Supervision', svc_opt4: 'Industrial Supply',
      svc_opt_qaqc: 'QA/QC & Punch List Management',
      svc_opt_pssr: 'Pre-Startup Safety Review (PSSR)',
      svc_opt5: 'SONIC Academy — Training Program',

      svc4_title: 'QA/QC & PUNCH LIST',
      svc4_desc: 'AI-powered punch list management using SONIC AI-Punch™ — eliminating human error with real-time photo verification and instant automated reporting.',
      svc4_li1: 'AI-Punch™ real-time defect detection',
      svc4_li2: 'Digital punch list tracking & close-out',
      svc4_li3: 'Photo evidence logged per item',
      svc4_li4: 'Auto email report on defect resolution',
      svc4_li5: 'Zero-defect delivery commitment',
      svc5_title: 'PRE-STARTUP SAFETY REVIEW',
      svc5_desc: 'Comprehensive PSSR ensuring all E&I systems are safe, compliant and ready for startup — protecting assets, personnel and project timelines.',
      svc5_li1: 'IEC / Siemens / GE compliance audit',
      svc5_li2: 'Hazard identification & risk assessment',
      svc5_li3: 'Safety loop & instrument verification',
      svc5_li4: 'Formal PSSR documentation package',
      svc5_li5: 'Startup authorization sign-off',
      // CONTACT HINTS
      contact_phone_hint: 'Tap to call / open Zalo',
      contact_email_hint: 'Tap to send email',
      // FOOTER
      footer_copy: '© 2026 SONIC E&I Solutions. All rights reserved.',
    },
    vi: {
      // NAV
      nav_about: 'Giới Thiệu', nav_services: 'Dịch Vụ', nav_supply: 'Vật Tư',
      nav_vision: 'Tầm Nhìn', nav_results: 'Kết Quả', nav_investors: 'Nhà Đầu Tư',
      nav_gallery: 'Thư Viện', nav_academy: 'Học Viện', nav_contact: 'Liên Hệ',
      nav_cta: 'Yêu Cầu Tư Vấn',
      // HERO H1
      hero_h1_line1: 'KHÔNG LỖI KỸ THUẬT.', hero_h1_line2: 'KHÔNG LÀM LẠI.', hero_h1_line3: 'HOẶC KHÔNG THU PHÍ.',
      hero_pain_bar: 'Mỗi lỗi tốn $500–$5.000 · Mỗi ngày trễ tốn $50K+ · Hầu hết EPC chấp nhận điều này là "bình thường" — Chúng tôi thì không.',
      hero_guarantee_badge: 'CAM KẾT HIỆU SUẤT — KHÔNG ĐẠT KPI ZERO DEFECT → GIẢM PHÍ TỰ ĐỘNG',
      hero_tag: '// SONIC E&I SOLUTIONS — THÀNH LẬP 2000',
      hero_sub: 'Ngừng trả tiền cho làm lại. Chúng tôi cam kết bàn giao E&I không lỗi — bằng phí dịch vụ, không chỉ lời nói.',
      hero_btn1: 'Đặt Lịch Tư Vấn 30 Phút', hero_btn2: 'Demo AI-Punch™',
      hero_cta_micro: 'Không ràng buộc · Phản hồi trong 24h · Bao gồm cam kết zero-defect',
      hero_stat1: 'Năm Kinh Nghiệm', hero_stat2: 'Đối Tác Toàn Cầu', hero_stat3: 'QA/QC Bằng AI',
      hero_proof2: 'Hạng Mục Punch Đã Đóng', hero_proof3: 'Lỗi Khi Bàn Giao',
      hero_kpi1: 'Tiết Kiệm Chi Phí Làm Lại', hero_kpi2: 'Đóng Punch Nhanh Hơn',
      hero_kpi3: 'Bàn Giao Đúng Hạn', hero_kpi3_sub: '✓ Đã Cam Kết',
      // AI
      ai_proof1: 'Truy Cập Sớm — Đang Thử Nghiệm Thực Tế', ai_proof2: 'Độ Chính Xác Phát Hiện Lỗi',
      ai_proof3: 'Báo Cáo Tạo Ra Mỗi Hạng Mục', ai_proof4_label: 'Được Tin Dùng Bởi',
      hiw1_title: 'Chụp Ảnh hoặc Tải Lên', hiw1_desc: 'Chụp đầu cáp hoặc thiết bị ngay tại hiện trường',
      hiw2_title: 'AI Phân Tích Ảnh', hiw2_desc: 'Google Gemini AI quét lỗi trong vòng dưới 3 giây',
      hiw3_title: 'Nhận Mã Lỗi', hiw3_desc: 'Loại lỗi, vị trí và mức độ nghiêm trọng trả về ngay lập tức',
      hiw4_title: 'ĐÃ SỬA ✓', hiw4_desc: 'Kỹ thuật viên xử lý lỗi — AI xác nhận đã khắc phục',
      hiw5_title: 'Báo Cáo Ngay', hiw5_desc: 'Báo cáo PDF có ảnh minh chứng tự động gửi cho nhóm',
      hiw6_title: 'Lưu Lên Cloud', hiw6_desc: 'Toàn bộ kết quả được lưu trữ — tra cứu, truy vết, sẵn sàng kiểm toán',
      // VISION
      vision_label: '// Định Hướng Chiến Lược',
      vision_title1: 'TẦM NHÌN · SỨ MỆNH', vision_title2: '& GIÁ TRỊ CỐT LÕI',
      vision_sub: 'Định Hướng Chiến Lược & Tính Chuyên Nghiệp',
      vision_card1_title: 'TẦM NHÌN',
      vision_card1_body: 'Trở thành đối tác kỹ thuật E&I hàng đầu tại Đông Nam Á, được công nhận nhờ tích hợp tiêu chuẩn kỹ thuật toàn cầu với công nghệ AI tiên tiến.',
      vision_card2_title: 'SỨ MỆNH',
      vision_card2_body: 'Đảm bảo tính toàn vẹn kỹ thuật tuyệt đối cho cơ sở hạ tầng năng lượng thông qua kinh nghiệm dày dặn, thực thi "Đúng Ngay Lần Đầu" và cam kết không có lỗi.',
      vision_card3_title: 'GIÁ TRỊ CỐT LÕI',
      val1_name: 'CHÍNH XÁC', val1_desc: 'Xuất sắc trong mọi đầu cos và hiệu chỉnh.',
      val2_name: 'CHÍNH TRỰC', val2_desc: 'Minh bạch trong báo cáo kỹ thuật và tuân thủ an toàn.',
      val3_name: 'ĐỔI MỚI', val3_desc: 'Tiên phong công nghệ AI-Punch™ để loại bỏ lỗi của con người.',
      // ABOUT
      about_label: '// Về Chúng Tôi',
      about_title1: '25 NĂM TRÊN', about_title2: 'MẶT TRẬN TOÀN CẦU',
      about_p1: 'SONIC E&I Solutions là công ty chuyên cung cấp dịch vụ Điện & Thiết bị Đo lường (E&I) chính xác cho các dự án năng lượng khắt khe nhất thế giới. Được thành lập bởi cựu nhân viên chính thức Siemens Energy và Kỹ sư Chủ của GE, chúng tôi đưa tiêu chuẩn quốc tế trực tiếp vào thực địa.',
      about_quote: '"Tích hợp Tiêu chuẩn Toàn cầu vào Thực tiễn Thi công Địa phương."',
      about_p2: 'Từ tuabin khí Siemens đến máy phát GE, từ giàn khoan ngoài khơi VIETSOVPETRO đến hệ thống tàu VARD — đội ngũ của chúng tôi đã hoạt động ở mức độ toàn vẹn kỹ thuật cao nhất trong hơn 25 năm.',
      // CRED
      cred_label1: 'Nhân Viên Chính Thức', cred_val1: 'Siemens Energy',
      cred_sub1: 'Vận hành Tuabin & Tổ máy, Dịch vụ Hiện trường & Quản lý Dự án',
      cred_label2: 'Kỹ Sư Chủ', cred_val2: 'GE Turbines & Gensets',
      cred_sub2: 'Đảm bảo Toàn vẹn Kỹ thuật & Tuân thủ Thông số kỹ thuật',
      cred_label3: 'Nhà Thầu Phụ', cred_val3: 'Vietsovpetro · VARD · Seaonics',
      cred_sub3: 'Nền tảng Ngoài khơi & Hệ thống Tàu OSV',
      cred_label4: 'Tiêu Chuẩn', cred_val4: 'IEC 61084 · Siemens Spec · GE Spec',
      cred_sub4: 'Tất cả dự án thực hiện theo tiêu chuẩn E&I quốc tế',
      cred_label5: 'Công Nghệ Độc Quyền', cred_val5: 'Nền tảng SONIC AI-Punch™',
      cred_sub5: 'QA/QC hỗ trợ AI · Được hỗ trợ bởi Google Gemini',
      // DOWNLOAD
      dl_title: '🤝 HỒ SƠ CÔNG TY 2026',
      dl_desc: 'Tải hồ sơ công ty đầy đủ — dịch vụ, lịch sử dự án, chứng chỉ kỹ thuật và chi tiết nền tảng AI-Punch™. Có sẵn ở định dạng PDF và PowerPoint.',
      dl_btn1: '⬇ Tải PDF', dl_btn2: '⬇ Tải PPTX',
      // SERVICES
      svc_label: '// Những Gì Chúng Tôi Làm',
      svc_title1: 'DỊCH VỤ', svc_title2: 'E&I', svc_title3: 'CHUYÊN NGHIỆP',
      svc_sub: 'Tiêu chuẩn quốc tế. Kết quả chính xác. Đúng ngay từ lần đầu — chúng tôi không chỉ hoàn thành dự án; chúng tôi bàn giao sự toàn vẹn.',
      svc_opt1: 'Lắp Đặt & Đi Dây', svc_opt2: 'Vận Hành Hệ Thống',
      svc_opt3: 'Giám Sát Kỹ Thuật', svc_opt4: 'Cung Cấp Vật Tư Công Nghiệp',
      svc_opt_qaqc: 'QA/QC & Quản Lý Punch List',
      svc_opt_pssr: 'Đánh Giá An Toàn Trước Khởi Động (PSSR)',
      svc_opt5: 'SONIC Academy — Chương Trình Đào Tạo',
      svc_card4_title: 'QA/QC & QUẢN LÝ PUNCH LIST',
      svc_card4_desc: 'Quản lý punch list và kiểm tra QA/QC bằng AI-Punch™ — loại bỏ sai sót của con người với xác minh ảnh thời gian thực và báo cáo tức thì.',
      svc_card4_li1: 'Phát hiện lỗi bằng AI-Punch™',
      svc_card4_li2: 'Theo dõi punch list kỹ thuật số',
      svc_card4_li3: 'Ảnh bằng chứng cho từng hạng mục',
      svc_card4_li4: 'Báo cáo email tự động khi hoàn thành',
      svc_card4_li5: 'Cam kết bàn giao không lỗi',
      svc_card5_title: 'ĐÁNH GIÁ AN TOÀN TRƯỚC KHỞI ĐỘNG',
      svc_card5_desc: 'Thực hiện PSSR toàn diện đảm bảo tất cả hệ thống E&I an toàn, tuân thủ và sẵn sàng khởi động — bảo vệ tài sản, nhân lực và tiến độ dự án.',
      svc_card5_li1: 'Kiểm tra tuân thủ IEC / Siemens / GE',
      svc_card5_li2: 'Nhận diện mối nguy & đánh giá rủi ro',
      svc_card5_li3: 'Xác minh vòng lặp thiết bị & an toàn',
      svc_card5_li4: 'Lập tài liệu PSSR chính thức',
      svc_card5_li5: 'Ký duyệt cấp phép khởi động',
      svc4_title: 'QA/QC & QUẢN LÝ PUNCH LIST',
      svc4_desc: 'Quản lý punch list bằng AI-Punch™ — loại bỏ sai sót của con người với xác minh ảnh thời gian thực và báo cáo tự động tức thì.',
      svc4_li1: 'Phát hiện lỗi thời gian thực bằng AI-Punch™',
      svc4_li2: 'Theo dõi & đóng punch list kỹ thuật số',
      svc4_li3: 'Lưu ảnh bằng chứng cho từng hạng mục',
      svc4_li4: 'Email báo cáo tự động khi xử lý xong lỗi',
      svc4_li5: 'Cam kết bàn giao không lỗi',
      svc5_title: 'ĐÁNH GIÁ AN TOÀN TRƯỚC KHỞI ĐỘNG',
      svc5_desc: 'Thực hiện PSSR toàn diện đảm bảo các hệ thống E&I an toàn, tuân thủ và sẵn sàng khởi động — bảo vệ tài sản, nhân lực và tiến độ dự án.',
      svc5_li1: 'Kiểm tra tuân thủ IEC / Siemens / GE',
      svc5_li2: 'Nhận diện mối nguy & đánh giá rủi ro',
      svc5_li3: 'Xác minh vòng lặp an toàn & thiết bị đo',
      svc5_li4: 'Lập hồ sơ PSSR chính thức đầy đủ',
      svc5_li5: 'Ký duyệt cấp phép khởi động',
      // CONTACT
      contact_label: '// Liên Hệ',
      contact_title1: 'ĐỐI TÁC', contact_title2: 'ĐÁNG TIN CẬY',
      contact_desc: 'Sẵn sàng đưa tiêu chuẩn E&I quốc tế vào dự án tiếp theo của bạn? Liên hệ với chúng tôi ngay hôm nay.',
      contact_name: 'Nhà Sáng Lập & CEO', contact_phone_label: 'Điện Thoại / Zalo',
      contact_email_label: 'Email', contact_location_label: 'Địa Điểm',
      contact_location: '📍 Vũng Tàu, Việt Nam',
      contact_phone_hint: 'Nhấn để gọi / mở Zalo',
      contact_email_hint: 'Nhấn để gửi email',
      // FORM
      form_name: 'Họ Tên', form_company: 'Công Ty', form_email: 'Email',
      form_service: 'Dịch Vụ', form_select: 'Chọn dịch vụ...',
      form_message: 'Tin Nhắn', form_placeholder: 'Mô tả dự án của bạn...',
      form_send: 'GỬI TIN NHẮN', form_title: 'GỬI TIN NHẮN',
      form_name_ph: 'Họ và tên', form_company_ph: 'Tên công ty',
      // FOOTER
      footer_tagline: '"Đối Tác Đáng Tin Cậy trong Lĩnh vực E&I."',
      footer_copy: '© 2026 SONIC E&I Solutions. Bảo lưu mọi quyền.',
    }
  };

  let currentLang = 'en';

  function setLang(lang) {
    currentLang = lang;
    const t = translations[lang];

    // Toggle active button
    document.getElementById('btnEN').classList.toggle('active', lang === 'en');
    document.getElementById('btnVI').classList.toggle('active', lang === 'vi');

    // Switch font family
    if (lang === 'vi') {
      document.body.classList.add('vi-font');
    } else {
      document.body.classList.remove('vi-font');
    }

    // Update all data-i18n elements (including option, button, label etc.)
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (t[key] !== undefined) {
        if (el.tagName === 'OPTION' || el.tagName === 'BUTTON') {
          el.textContent = t[key];
        } else {
          el.innerHTML = t[key];
        }
      }
    });

    // Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (t[key] !== undefined) el.placeholder = t[key];
    });

    // Update lang attribute
    document.documentElement.lang = lang;
  }

  // ── FORM HANDLER ──
  // ── SERVICE DROPDOWN ──
  (function() {
    var dropdown = document.getElementById('svc-dropdown');
    var trigger  = document.getElementById('svc-trigger');
    var panel    = document.getElementById('svc-panel');
    var labelEl  = document.getElementById('svc-trigger-label');
    var tagsEl   = document.getElementById('svc-trigger-tags');
    if (!dropdown) return;

    // Toggle open/close
    function openDropdown()  { dropdown.classList.add('open'); }
    function closeDropdown() { dropdown.classList.remove('open'); }
    function toggleDropdown(){ dropdown.classList.toggle('open'); }

    trigger.addEventListener('click', function(e) { e.stopPropagation(); toggleDropdown(); });

    // Close on outside click
    document.addEventListener('click', function(e) {
      if (!dropdown.contains(e.target)) closeDropdown();
    });

    // Update trigger label/tags after selection
    function updateTrigger() {
      var checked = panel.querySelectorAll('input[type="checkbox"]:checked');
      if (checked.length === 0) {
        labelEl.style.color = 'rgba(201,162,39,0.35)';
        labelEl.textContent = 'Select a service...';
        tagsEl.innerHTML = '';
      } else {
        labelEl.style.color = 'transparent';
        labelEl.textContent = '';
        tagsEl.innerHTML = Array.from(checked).map(function(cb) {
          // Short label for tag
          var short = cb.value
            .replace('Installation & Wiring', 'Installation')
            .replace('System Commissioning', 'Commissioning')
            .replace('Technical Supervision', 'Supervision')
            .replace('Industrial Supply', 'Supply')
            .replace('QA/QC & Punch List Management', 'QA/QC')
            .replace('Pre-Startup Safety Review (PSSR)', 'PSSR')
            .replace('SONIC Academy — Training Program', 'Academy');
          return '<span class="svc-tag">' + short + '</span>';
        }).join('');
      }
    }

    // Checkbox toggle inside panel
    panel.querySelectorAll('.svc-box').forEach(function(box) {
      box.addEventListener('click', function(e) {
        e.stopPropagation();
        var cb = box.querySelector('input[type="checkbox"]');
        cb.checked = !cb.checked;
        box.classList.toggle('checked', cb.checked);
        updateTrigger();
      });
    });

    // Expose reset for form submit
    window.svcDropdownReset = function() {
      panel.querySelectorAll('.svc-box').forEach(function(b) {
        b.classList.remove('checked');
        b.querySelector('input').checked = false;
      });
      updateTrigger();
      closeDropdown();
    };
  })();

  // ── EMAILJS SEND ──
  // Keys được load từ file riêng: emailjs-config.js (cùng thư mục với index.html)
  // Chỉ cần sửa file đó, không cần đụng vào index.html

  function handleSubmit(e) {
    e.preventDefault();
    const form   = e.target;
    const btn    = form.querySelector('button[type="submit"]');
    const isVI   = currentLang === 'vi';
    const inputs = form.querySelectorAll('input, textarea, select');

    // Lấy dữ liệu form
    const name    = (document.getElementById('cf-name')    || {}).value || '';
    const company = (document.getElementById('cf-company') || {}).value || '';
    const email   = (document.getElementById('cf-email')   || {}).value || '';
    const message = (document.getElementById('cf-message') || {}).value || '';
    // Multi-select services (optional)
    const checkedBoxes = form.querySelectorAll('.svc-box input[type="checkbox"]:checked');
    const services = checkedBoxes.length
      ? Array.from(checkedBoxes).map(function(cb){ return cb.value; }).join(', ')
      : '(Not specified)';

    // Basic validation
    if (!name.trim() || !email.trim() || !message.trim()) {
      alert(isVI ? 'Vui lòng điền đầy đủ: Tên, Email và Nội dung.' : 'Please fill in: Name, Email and Message.');
      return;
    }

    // Loading state
    btn.disabled = true;
    btn.textContent = isVI ? '⏳ Đang gửi...' : '⏳ Sending...';
    btn.style.background = '#888';
    btn.style.color = '#fff';

    // Check EmailJS keys configured
    if (!EMAILJS_SERVICE_ID || EMAILJS_SERVICE_ID === 'YOUR_SERVICE_ID') {
      // Fallback: open mailto (works immediately without setup)
      const subject = encodeURIComponent('[SONIC E&I] New inquiry from ' + name);
      const body    = encodeURIComponent(
        'Name: '    + name    + '\n' +
        'Company: ' + company + '\n' +
        'Email: '   + email   + '\n' +
        'Service: ' + services + '\n\n' +
        'Message:\n' + message
      );
      window.location.href = 'mailto:contact@sonicei.com?subject=' + subject + '&body=' + body;
      btn.disabled = false;
      btn.textContent = isVI ? 'GỬI TIN NHẮN' : 'SEND MESSAGE';
      btn.style.background = '';
      btn.style.color = '';
      return;
    }

    // Send via EmailJS
    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      from_name:    name,
      from_company: company,
      from_email:   email,
      service:      services,
      message:      message,
      to_email:     'contact@sonicei.com'
    }, EMAILJS_PUBLIC_KEY)
    .then(function() {
      btn.disabled = false;
      btn.textContent = isVI ? '✓ ĐÃ GỬI — CHÚNG TÔI SẼ LIÊN HỆ SỚM' : '✓ MESSAGE SENT — WE WILL CONTACT YOU SHORTLY';
      btn.style.background = '#00c896';
      btn.style.color = '#fff';
      // GA4 event
      if (typeof gtag !== 'undefined') gtag('event', 'form_submit', { event_category: 'contact', event_label: services });
      // FB Pixel
      if (typeof fbq !== 'undefined') fbq('track', 'Lead');
      setTimeout(function() {
        btn.textContent = isVI ? 'GỬI TIN NHẮN' : 'SEND MESSAGE';
        btn.style.background = '';
        btn.style.color = '';
        form.reset();
        // Also uncheck svc boxes visually
        if (typeof window.svcDropdownReset === 'function') window.svcDropdownReset();
      }, 5000);
    })
    .catch(function(err) {
      btn.disabled = false;
      console.error('EmailJS error:', err);
      // Fallback to mailto on error
      const subject = encodeURIComponent('[SONIC E&I] New inquiry from ' + name);
      const body    = encodeURIComponent(
        'Name: '    + name    + '\n' +
        'Company: ' + company + '\n' +
        'Email: '   + email   + '\n' +
        'Service: ' + services + '\n\n' +
        'Message:\n' + message
      );
      window.location.href = 'mailto:contact@sonicei.com?subject=' + subject + '&body=' + body;
      btn.textContent = isVI ? 'GỬI TIN NHẮN' : 'SEND MESSAGE';
      btn.style.background = '';
      btn.style.color = '';
    });
  }
