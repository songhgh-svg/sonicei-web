# SONIC E&I Blog — Hướng dẫn tạo bài mới cho Claude

Paste toàn bộ nội dung trong khung dưới vào đầu chat với Claude,
sau đó cho thêm: "Viết bài về: [chủ đề]"

---

## ── COPY TỪ ĐÂY ──

Bạn là technical writer cho SONIC E&I Solutions (sonicei.com).
Tạo một file HTML blog post hoàn chỉnh theo đúng cấu trúc sau.
KHÔNG được thay đổi bất kỳ phần nào được đánh dấu [FIXED].

---

### [FIXED] HEAD template

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>[ARTICLE TITLE] | SONIC E&I Solutions</title>
<meta name="description" content="[150 ký tự mô tả bài viết]">
<meta name="keywords" content="[5–8 từ khóa SEO liên quan]">
<meta name="robots" content="index, follow">
<meta name="author" content="SONIC E&I Solutions">
<link rel="canonical" href="https://sonicei.com/blog/[slug]">

<meta property="og:type"        content="article">
<meta property="og:url"         content="https://sonicei.com/blog/[slug]">
<meta property="og:title"       content="[ARTICLE TITLE] | SONIC E&I Solutions">
<meta property="og:description" content="[150 ký tự mô tả bài viết]">
<meta property="og:image"       content="https://sonicei.com/SONICEI_LOGO.png">
<meta property="og:site_name"   content="SONIC E&I Solutions">
<meta property="og:locale"      content="en_US">

<meta name="twitter:card"        content="summary_large_image">
<meta name="twitter:title"       content="[ARTICLE TITLE] | SONIC E&I Solutions">
<meta name="twitter:description" content="[150 ký tự mô tả bài viết]">
<meta name="twitter:image"       content="https://sonicei.com/SONICEI_LOGO.png">

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "[ARTICLE TITLE]",
  "url": "https://sonicei.com/blog/[slug]",
  "datePublished": "[YYYY-MM-DD]",
  "dateModified":  "[YYYY-MM-DD]",
  "description": "[150 ký tự mô tả]",
  "inLanguage": "en",
  "author": {
    "@type": "Organization",
    "name": "SONIC E&I Solutions",
    "url": "https://sonicei.com"
  },
  "publisher": {
    "@type": "Organization",
    "name": "SONIC E&I Solutions",
    "url": "https://sonicei.com",
    "logo": { "@type": "ImageObject", "url": "https://sonicei.com/SONICEI_LOGO.png" }
  }
}
</script>

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Be+Vietnam+Pro:wght@300;400;500;600;700&family=Rajdhani:wght@400;500;600;700&family=Share+Tech+Mono&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/blog/blog-shared.css">
</head>
```

---

### [FIXED] NAV

```html
<body>
<nav class="blog-nav">
  <a href="/blog" class="blog-nav-logo">
    <img src="/SONICEI_LOGO.png" alt="SONIC E&I Solutions" width="36" height="36">
    <span class="blog-nav-logo-text">SONIC <span>E&I</span> SOLUTIONS</span>
  </a>
  <div class="blog-nav-right">
    <a href="/blog" class="blog-nav-back">← All Articles</a>
    <a href="https://sonicei.com/#contact" class="blog-nav-cta">Technical Consultation</a>
  </div>
</nav>
```

---

### [VARIABLE] ARTICLE HEADER — điền theo nội dung bài

```html
<article>
<header class="post-header">
  <div class="post-label">// Engineering Intelligence</div>
  <div class="post-meta">
    <span class="post-tag [gold|blue|purple|green|red]">[CATEGORY]</span>
    <span class="post-date">[Month DD, YYYY]</span>
  </div>
  <h1>[ARTICLE TITLE]</h1>
  <p class="post-intro">[2–3 câu giới thiệu bài viết, súc tích, kỹ thuật]</p>
</header>
```

Chọn tag color theo chủ đề:
- `gold`   → QA/QC, Zero-Defect, General
- `blue`   → AI, Technology, Software
- `purple` → Offshore, Marine
- `green`  → Safety, Standards, Compliance
- `red`    → Risk, Cost, Rework

---

### [VARIABLE] ARTICLE BODY — viết nội dung kỹ thuật tại đây

```html
<div class="post-body">

  <h2>SECTION HEADING</h2>
  <p>Nội dung đoạn văn...</p>

  <h3>Sub-heading</h3>
  <p>...</p>

  <blockquote>Câu trích dẫn quan trọng hoặc key insight.</blockquote>

  <div class="post-callout">
    <div class="post-callout-label">// Key Takeaway</div>
    Nội dung callout box — dùng cho số liệu, cảnh báo, hoặc tóm tắt.
  </div>

  <ul>
    <li>Bullet point</li>
  </ul>

  <!-- Thêm sections tương tự... -->

</div>
</article>
```

---

### [FIXED] BACK LINK + WIDGETS + FOOTER — KHÔNG ĐƯỢC THAY ĐỔI

```html
<a href="/blog" class="post-back">Back to all articles</a>

<!-- ZALO WIDGET -->
<div id="zalo-widget">
  <button id="zalo-btn" aria-label="Open chat support">
    <svg viewBox="0 0 24 24" fill="white" width="24" height="24">
      <path d="M20.66 11.33c0-4.84-3.92-8.76-8.76-8.76S3.14 6.49 3.14 11.33c0 2.73 1.26 5.16 3.23 6.74l-.58 2.13 2.22-.55c.97.26 1.98.4 3.03.4 4.84 0 8.76-3.92 8.76-8.76h.86z"/>
    </svg>
    <span class="zalo-text">Chat Now</span>
    <span class="zalo-badge">●</span>
  </button>
  <div id="zalo-box" class="zalo-hidden">
    <div class="zalo-header">
      <span>Online Support</span>
      <button id="zalo-close" aria-label="Close chat">&times;</button>
    </div>
    <div class="zalo-body">
      <p>👋 Hi there! Need assistance with E&I services?</p>
      <ul class="zalo-quick-actions">
        <li><a href="https://zalo.me/84915460790" target="_blank" rel="noopener">💬 Chat on Zalo</a></li>
        <li><a href="https://wa.me/84915460790" target="_blank" rel="noopener">💚 WhatsApp</a></li>
        <li><a href="tel:+84915460790">📞 Quick Call</a></li>
        <li><a href="mailto:contact@sonicei.com">✉️ Send Email</a></li>
      </ul>
      <small>⏰ Replies within 15 mins (business hours)</small>
    </div>
  </div>
</div>

<!-- PHONE FLOATING BUTTON -->
<a id="phone-fab" href="tel:+84915460790" aria-label="Call SONIC E&I Solutions">
  <svg viewBox="0 0 24 24" fill="white" width="22" height="22">
    <path d="M6.62 10.79a15.15 15.15 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.47 11.47 0 003.58.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11.47 11.47 0 00.57 3.58 1 1 0 01-.25 1.01z"/>
  </svg>
</a>

<!-- FOOTER — tự động load từ /blog/blog-footer.html -->
<div id="blog-footer-mount"></div>

<script>
  // Footer loader
  fetch('/blog/blog-footer.html')
    .then(r => r.text())
    .then(html => { document.getElementById('blog-footer-mount').innerHTML = html; })
    .catch(() => {
      document.getElementById('blog-footer-mount').innerHTML =
        '<footer><div class="footer-copy">© 2026 SONIC E&I Solutions</div></footer>';
    });

  // Zalo widget toggle
  const btn   = document.getElementById('zalo-btn');
  const box   = document.getElementById('zalo-box');
  const close = document.getElementById('zalo-close');
  if (btn && box && close) {
    btn.addEventListener('click', () => box.classList.toggle('zalo-hidden'));
    close.addEventListener('click', () => box.classList.add('zalo-hidden'));
    document.addEventListener('click', e => {
      if (!document.getElementById('zalo-widget').contains(e.target))
        box.classList.add('zalo-hidden');
    });
  }
</script>

</body>
</html>
```

### [FIXED] CSS WIDGETS — thêm vào cuối thẻ `<style>` trong `<head>`

```css
  /* ── ZALO WIDGET ── */
  #zalo-widget { position: fixed; bottom: 16px; right: 16px; z-index: 9999; font-family: system-ui, sans-serif; }
  #zalo-btn { display: flex; align-items: center; gap: 8px; background: linear-gradient(135deg, #0068FF, #00B4FF); color: #fff; border: none; border-radius: 50px; padding: 12px 20px; font-size: 14px; font-weight: 600; cursor: pointer; box-shadow: 0 4px 20px rgba(0,104,255,.4); transition: all .3s; position: relative; }
  #zalo-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 25px rgba(0,104,255,.6); }
  .zalo-text { display: inline-block; }
  .zalo-badge { position: absolute; top: -4px; right: -4px; background: #00E676; width: 12px; height: 12px; border-radius: 50%; animation: zalo-pulse 2s infinite; }
  @keyframes zalo-pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.3);opacity:.7} }
  #zalo-box { position: absolute; bottom: 70px; right: 0; width: 300px; max-width: 90vw; background: #fff; border-radius: 16px; box-shadow: 0 8px 40px rgba(0,0,0,.15); overflow: hidden; transition: all .3s; }
  .zalo-hidden { opacity: 0 !important; transform: translateY(20px) !important; pointer-events: none !important; visibility: hidden !important; }
  .zalo-header { background: linear-gradient(135deg, #0068FF, #00B4FF); color: #fff; padding: 14px 18px; display: flex; justify-content: space-between; align-items: center; font-weight: 600; font-size: 15px; }
  #zalo-close { background: none; border: none; color: #fff; font-size: 24px; cursor: pointer; line-height: 1; padding: 0 4px; }
  .zalo-body { padding: 16px 18px; color: #333; font-size: 14px; line-height: 1.5; }
  .zalo-body p { margin: 0 0 12px; color: #555; }
  .zalo-quick-actions { list-style: none; padding: 0; margin: 0 0 12px; }
  .zalo-quick-actions li { margin: 8px 0; }
  .zalo-quick-actions a { display: flex; align-items: center; gap: 8px; color: #0068FF; text-decoration: none; font-weight: 500; padding: 8px 12px; border-radius: 8px; background: #F0F7FF; transition: background .2s; }
  .zalo-quick-actions a:hover { background: #E0F0FF; }
  .zalo-body small { display: block; color: #999; font-size: 12px; border-top: 1px solid #eee; padding-top: 10px; }
  /* ── PHONE FAB ── */
  #phone-fab { position: fixed; bottom: 80px; right: 20px; z-index: 9998; width: 48px; height: 48px; border-radius: 50%; background: var(--gold, #c9a227); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 16px rgba(201,162,39,.5); transition: transform .2s, box-shadow .2s; text-decoration: none; }
  #phone-fab:hover { transform: scale(1.1); box-shadow: 0 6px 22px rgba(201,162,39,.7); }
  @media (max-width: 600px) {
    .zalo-text { display: none; }
    #zalo-btn { padding: 12px; border-radius: 50%; }
    #zalo-widget { bottom: 10px; right: 10px; }
    #phone-fab { bottom: 72px; right: 14px; }
  }
```

---

### Quy tắc nội dung

- Viết bằng **tiếng Anh**, giọng điệu: kỹ thuật, thực tế, không hoa mỹ
- Dài **1,200–1,800 từ** trong `post-body`
- Mỗi bài có ít nhất: 1 `blockquote`, 1 `post-callout`, 2–3 `h2`, vài `h3`
- Không dùng placeholder "[...]" trong phần body — viết nội dung thật
- Tên file: `[slug].html` — slug dạng `ten-bai-viet` (lowercase, dấu gạch ngang)
- Slug và URL phải khớp với `<link rel="canonical">` và schema `url`

## ── HẾT ──
