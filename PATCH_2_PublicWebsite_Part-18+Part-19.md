# PATCH — PublicWebsite.html (Part 18: Blog + Part 19: Recommended Doctors)

ফাইল: `PublicWebsite.html`
পদ্ধতি: আগের মতোই — "খুঁজো" টেক্সট খুঁজে বের করে ঠিক জায়গায় "যোগ করো" কোডটুকু বসাও। কিছু মুছবে না, সবই additive।

---

## ধাপ ১ — Desktop nav-এ লিংক যোগ

**খুঁজো:**
```html
      <ul class="nav-links">
        <li><a href="#about">About</a></li>
        <li><a href="#svcs">Services</a></li>
        <li><a href="#hrs">Hours</a></li>
        <li><a href="#testi">Reviews</a></li>
        <li><a href="#faq">FAQ</a></li>
      </ul>
```

**দিয়ে বদলাও:**
```html
      <ul class="nav-links">
        <li><a href="#about">About</a></li>
        <li><a href="#svcs">Services</a></li>
        <li><a href="#blog">Blog</a></li>
        <li><a href="#recdocs">Specialists</a></li>
        <li><a href="#hrs">Hours</a></li>
        <li><a href="#testi">Reviews</a></li>
        <li><a href="#faq">FAQ</a></li>
      </ul>
```

---

## ধাপ ২ — Mobile menu-তে লিংক যোগ

**খুঁজো:**
```html
    <a href="#about"  onclick="cMob()">About Doctor</a>
    <a href="#svcs"   onclick="cMob()">Services</a>
    <a href="#hrs"    onclick="cMob()">Hours &amp; Location</a>
    <a href="#testi"  onclick="cMob()">Patient Reviews</a>
    <a href="#faq"    onclick="cMob()">FAQ</a>
    <a href="#portal" class="mp" onclick="cMob()">👤 Patient Portal</a>
```

**দিয়ে বদলাও:**
```html
    <a href="#about"  onclick="cMob()">About Doctor</a>
    <a href="#svcs"   onclick="cMob()">Services</a>
    <a href="#blog"   onclick="cMob()">Blog</a>
    <a href="#recdocs" onclick="cMob()">Recommended Specialists</a>
    <a href="#hrs"    onclick="cMob()">Hours &amp; Location</a>
    <a href="#testi"  onclick="cMob()">Patient Reviews</a>
    <a href="#faq"    onclick="cMob()">FAQ</a>
    <a href="#portal" class="mp" onclick="cMob()">👤 Patient Portal</a>
```

---

## ধাপ ৩ — নতুন দুইটা Section (Blog + Recommended Doctors)

**খুঁজো:**
```html
    <p style="text-align:center;font-size:12px;color:var(--sil2);margin-top:32px;">Placeholder reviews — real patient testimonials will be added here.</p>
  </div>
</section>

<!-- ══════════════════════════════════
  FAQ
══════════════════════════════════ -->
```

**তার মাঝখানে (মানে Testimonials section-এর `</section>` এর পরে, FAQ comment-এর আগে) এই দুইটা নতুন section বসাও:**

```html
<!-- ══════════════════════════════════
  BLOG / ARTICLES  (Part 18)
══════════════════════════════════ -->
<section class="blog sec" id="blog">
  <div class="wrap" style="position:relative;z-index:1;">
    <div class="cx" style="margin-bottom:40px;">
      <span class="lbl">Health Articles</span>
      <h2 class="ttl">From the <span class="r">Doctor's Desk</span></h2>
      <p class="sub">Tips, insights, and health guidance written by Dr. Asma for you and your family.</p>
    </div>
    <div class="blog-grid" id="blogGrid">
      <p style="text-align:center;color:var(--sil2);font-size:13px;grid-column:1/-1;">Loading articles...</p>
    </div>
  </div>
</section>

<!-- Full Article Reader Overlay -->
<div class="blog-reader" id="blogReader">
  <div class="blog-reader-inner">
    <button class="blog-reader-close" onclick="closeArticleReader()" aria-label="Close">✕</button>
    <div id="blogReaderContent"><p style="color:var(--sil);">Loading...</p></div>
  </div>
</div>

<!-- ══════════════════════════════════
  RECOMMENDED DOCTORS  (Part 19)
══════════════════════════════════ -->
<section class="recdocs sec" id="recdocs">
  <div class="wrap">
    <div class="cx" style="margin-bottom:40px;">
      <span class="lbl teal" style="border-color:rgba(20,184,166,.35);">Trusted Network</span>
      <h2 class="ttl">Doctors We <span class="t">Recommend</span></h2>
      <p class="sub">Specialists Dr. Asma personally refers her patients to for further care.</p>
    </div>
    <div class="recdoc-grid" id="recDocPubGrid">
      <p style="text-align:center;color:var(--sil2);font-size:13px;grid-column:1/-1;">Loading...</p>
    </div>
  </div>
</section>

```

---

## ধাপ ৪ — নতুন CSS

**খুঁজো:**
```html
</head>
<body>
```

**তার ঠিক আগে এই `<style>` ব্লকটা যোগ করো:**

```html
<style id="PART18_19_PUBLIC_STYLES">
/* ── BLOG GRID ── */
.blog-grid{
  display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:28px;
}
.blog-card{
  background:var(--bg2);border:1px solid var(--bd);border-radius:16px;overflow:hidden;
  display:flex;flex-direction:column;cursor:pointer;transition:all .3s ease;
}
.blog-card:hover{ border-color:var(--bd2);transform:translateY(-6px);box-shadow:0 20px 44px rgba(232,96,138,.14); }
.blog-card-cover{ width:100%;height:180px;object-fit:cover;background:var(--bg3); }
.blog-card-body{ padding:20px 22px 24px;display:flex;flex-direction:column;gap:10px;flex:1; }
.blog-card-tags{ display:flex;flex-wrap:wrap;gap:6px; }
.blog-tag{
  font-size:11px;font-weight:600;padding:3px 10px;border-radius:20px;
  background:rgba(232,96,138,.1);border:1px solid rgba(232,96,138,.25);color:var(--rose2);
}
.blog-card-title{ font-family:'Syne',sans-serif;font-size:18px;font-weight:700;color:var(--wht);line-height:1.35; }
.blog-card-date{ font-size:12px;color:var(--sil2); }
.blog-card-read{ font-size:13px;font-weight:600;color:var(--rose2);margin-top:auto; }

/* ── ARTICLE READER OVERLAY ── */
.blog-reader{
  display:none;position:fixed;inset:0;z-index:3000;
  background:rgba(15,10,26,.92);backdrop-filter:blur(10px);
  overflow-y:auto;padding:40px 20px;
}
.blog-reader.on{ display:block; }
.blog-reader-inner{
  max-width:760px;margin:0 auto;background:var(--bg2);border:1px solid var(--bd);
  border-radius:18px;padding:40px;position:relative;
}
.blog-reader-close{
  position:sticky;top:0;float:right;width:38px;height:38px;border-radius:10px;
  background:rgba(232,96,138,.1);border:1px solid rgba(232,96,138,.25);color:var(--wht);
  font-size:16px;cursor:pointer;
}
#blogReaderContent img{ max-width:100%;border-radius:10px;margin:14px 0; }
#blogReaderContent h1{ font-family:'Syne',sans-serif;font-size:28px;font-weight:800;color:var(--wht);margin-bottom:8px; }
#blogReaderContent h2{ font-family:'Syne',sans-serif;font-size:22px;font-weight:700;color:var(--wht);margin:24px 0 10px; }
#blogReaderContent h3{ font-family:'Syne',sans-serif;font-size:18px;font-weight:700;color:var(--wht);margin:20px 0 8px; }
#blogReaderContent p{ font-size:15px;color:var(--sil);line-height:1.85;margin-bottom:14px; }
#blogReaderContent blockquote{
  border-left:3px solid var(--rose);padding:10px 18px;margin:16px 0;
  color:var(--rose2);font-style:italic;background:rgba(232,96,138,.05);border-radius:0 8px 8px 0;
}
#blogReaderContent ul,#blogReaderContent ol{ margin:0 0 14px 22px;color:var(--sil);font-size:15px;line-height:1.85; }
.blog-reader-meta{ font-size:12px;color:var(--sil2);margin-bottom:24px; }

@media(max-width:768px){
  .blog-reader-inner{ padding:24px 18px; }
}

/* ── RECOMMENDED DOCTORS GRID ── */
.recdoc-grid{
  display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:24px;
}
.recdoc-card{
  background:var(--bg2);border:1px solid var(--bd);border-radius:16px;padding:26px;
  text-align:center;transition:all .3s ease;
}
.recdoc-card:hover{ border-color:var(--bd-teal);transform:translateY(-6px); }
.recdoc-photo{
  width:76px;height:76px;border-radius:50%;object-fit:cover;margin:0 auto 14px;
  background:var(--bg3);border:2px solid rgba(20,184,166,.3);
}
.recdoc-name{ font-family:'Syne',sans-serif;font-size:17px;font-weight:700;color:var(--wht); }
.recdoc-spec{ font-size:13px;color:var(--teal2);margin-bottom:10px; }
.recdoc-chamber{ font-size:13px;color:var(--sil);margin-bottom:6px;line-height:1.6; }
.recdoc-note{ font-size:12px;color:var(--sil2);font-style:italic;margin-bottom:16px; }
.recdoc-actions{ display:flex;gap:10px;justify-content:center; }
.recdoc-btn{
  flex:1;max-width:120px;display:inline-flex;align-items:center;justify-content:center;gap:6px;
  padding:9px 14px;border-radius:8px;font-size:13px;font-weight:600;text-decoration:none;
  transition:all .25s ease;
}
.recdoc-btn.call{ background:rgba(124,58,237,.12);border:1px solid rgba(124,58,237,.3);color:#C4B5FD; }
.recdoc-btn.wa{ background:rgba(20,184,166,.12);border:1px solid rgba(20,184,166,.3);color:var(--teal2); }
.recdoc-btn:hover{ transform:translateY(-2px); }
</style>
```

---

## ধাপ ৫ — নতুন JavaScript (init hook + লোড/রেন্ডার ফাংশন)

**খুঁজো:**
```javascript
window.addEventListener('DOMContentLoaded',function(){
  document.getElementById('fYear').textContent=new Date().getFullYear();
  var d=document.getElementById('bkDate');
  if(d) d.setAttribute('min',new Date().toISOString().split('T')[0]);
  initNav(); initScroll(); initFAQ(); initStatCounters(); initReveal();
  loadProfile(); loadGenders(); loadTestNames();
});
```

**দিয়ে বদলাও:**
```javascript
window.addEventListener('DOMContentLoaded',function(){
  document.getElementById('fYear').textContent=new Date().getFullYear();
  var d=document.getElementById('bkDate');
  if(d) d.setAttribute('min',new Date().toISOString().split('T')[0]);
  initNav(); initScroll(); initFAQ(); initStatCounters(); initReveal();
  loadProfile(); loadGenders(); loadTestNames();
  loadBlog();                  // ← Part 18
  loadRecommendedDoctorsPublic(); // ← Part 19
});
```

---

## ধাপ ৬ — নতুন JS ফাংশনগুলো (ফাইলের শেষে যোগ করো)

**খুঁজো** (ফাইলের একদম শেষে):
```html
</script>
</body>
</html>
```

**তার ঠিক আগে এই নতুন `<script>` ব্লকটা বসাও:**

```html
<script>
// ═══════════════════════════════════════════════════════════
// PART 18 — PUBLIC BLOG
// ═══════════════════════════════════════════════════════════
var _pubArticles = [];

function loadBlog(){
  google.script.run
    .withSuccessHandler(function(r){
      if(!r||!r.success) return;
      _pubArticles = r.articles || [];
      renderBlogGrid();
    })
    .withFailureHandler(function(){})
    .getPublishedArticles();
}

function renderBlogGrid(){
  var el = document.getElementById('blogGrid');
  if(!el) return;
  if(!_pubArticles.length){
    el.innerHTML = '<p style="text-align:center;color:var(--sil2);font-size:13px;grid-column:1/-1;">No articles published yet. Check back soon!</p>';
    return;
  }
  el.innerHTML = _pubArticles.map(function(a){
    var tags = (a.tags||'').split(',').map(function(t){ return t.trim(); }).filter(Boolean);
    return '<div class="blog-card rv" onclick="openArticleReader(\''+a.articleId+'\')">' +
      (a.coverImageURL ? '<img class="blog-card-cover" src="'+a.coverImageURL+'">' : '<div class="blog-card-cover"></div>') +
      '<div class="blog-card-body">' +
        (tags.length ? '<div class="blog-card-tags">'+tags.map(function(t){ return '<span class="blog-tag">'+escPub_(t)+'</span>'; }).join('')+'</div>' : '') +
        '<div class="blog-card-title">'+escPub_(a.title)+'</div>' +
        '<div class="blog-card-date">'+fmtPubDate_(a.publishedDate)+'</div>' +
        '<div class="blog-card-read">Read Article →</div>' +
      '</div>' +
    '</div>';
  }).join('');
  if (typeof initReveal === 'function') initReveal();
}

function openArticleReader(id){
  var overlay = document.getElementById('blogReader');
  var content = document.getElementById('blogReaderContent');
  content.innerHTML = '<p style="color:var(--sil);">Loading...</p>';
  overlay.classList.add('on');
  document.body.style.overflow = 'hidden';

  google.script.run
    .withSuccessHandler(function(r){
      if(!r||!r.success){ content.innerHTML = '<p style="color:var(--error);">Article not found.</p>'; return; }
      var a = r.article;
      content.innerHTML =
        (a.coverImageURL ? '<img src="'+a.coverImageURL+'" style="width:100%;border-radius:12px;margin-bottom:20px;">' : '') +
        '<h1>'+escPub_(a.title)+'</h1>' +
        '<div class="blog-reader-meta">By '+escPub_(a.authorName||'Dr. Asma')+' · '+fmtPubDate_(a.publishedDate)+'</div>' +
        (a.bodyHtml || '');
    })
    .withFailureHandler(function(){ content.innerHTML = '<p style="color:var(--error);">Failed to load article.</p>'; })
    .getPublicArticleById(id);
}

function closeArticleReader(){
  document.getElementById('blogReader').classList.remove('on');
  document.body.style.overflow = '';
}

// ═══════════════════════════════════════════════════════════
// PART 19 — PUBLIC RECOMMENDED DOCTORS
// ═══════════════════════════════════════════════════════════
function loadRecommendedDoctorsPublic(){
  google.script.run
    .withSuccessHandler(function(r){
      if(!r||!r.success) return;
      renderRecDocPubGrid(r.doctors||[]);
    })
    .withFailureHandler(function(){})
    .getActiveRecommendedDoctors();
}

function renderRecDocPubGrid(list){
  var el = document.getElementById('recDocPubGrid');
  if(!el) return;
  if(!list.length){
    el.innerHTML = '<p style="text-align:center;color:var(--sil2);font-size:13px;grid-column:1/-1;">No recommendations listed yet.</p>';
    return;
  }
  el.innerHTML = list.map(function(d){
    var digits = (d.contactInfo||'').replace(/\D/g,'');
    var waNum = digits.length===11 && digits.charAt(0)==='0' ? '880'+digits.substring(1) : digits;
    var telHref = digits ? 'tel:+'+ (digits.length===11 && digits.charAt(0)==='0' ? '880'+digits.substring(1) : digits) : '';
    var waHref  = waNum ? 'https://wa.me/'+waNum : '';
    return '<div class="recdoc-card rv">' +
      (d.photoURL ? '<img class="recdoc-photo" src="'+d.photoURL+'">' : '<div class="recdoc-photo"></div>') +
      '<div class="recdoc-name">'+escPub_(d.name)+'</div>' +
      '<div class="recdoc-spec">'+escPub_(d.specialty)+'</div>' +
      (d.chamber ? '<div class="recdoc-chamber">📍 '+escPub_(d.chamber)+'</div>' : '') +
      (d.note ? '<div class="recdoc-note">"'+escPub_(d.note)+'"</div>' : '') +
      '<div class="recdoc-actions">' +
        (telHref ? '<a class="recdoc-btn call" href="'+telHref+'">📞 Call</a>' : '') +
        (waHref  ? '<a class="recdoc-btn wa" href="'+waHref+'" target="_blank" rel="noopener">💬 WhatsApp</a>' : '') +
      '</div>' +
    '</div>';
  }).join('');
  if (typeof initReveal === 'function') initReveal();
}

// ── shared helpers ──
function escPub_(s){
  var d = document.createElement('div');
  d.textContent = s || '';
  return d.innerHTML;
}
function fmtPubDate_(s){
  if(!s) return '';
  try{
    var d = new Date(s);
    return d.getDate()+' '+['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()]+' '+d.getFullYear();
  }catch(e){ return ''; }
}
</script>
```

---

## ✅ চেকলিস্ট
- [ ] Nav-এ "Blog" আর "Specialists" লিংক দেখা যাচ্ছে, ক্লিক করলে স্ক্রল হচ্ছে
- [ ] Blog section-এ published আর্টিকেলগুলো card আকারে দেখা যাচ্ছে (draft দেখা যাচ্ছে না — এটাই কাঙ্ক্ষিত)
- [ ] Card ক্লিক করলে full article overlay খুলছে, ছবি/heading/paragraph ঠিকমতো রেন্ডার হচ্ছে
- [ ] Recommended Doctors section-এ card দেখা যাচ্ছে, শুধু "Show on public website" চেক করা ডাক্তাররাই দেখা যাচ্ছে
- [ ] Call বাটনে ক্লিক করলে ফোন ডায়ালার খোলে, WhatsApp বাটনে ক্লিক করলে wa.me লিংক খোলে
