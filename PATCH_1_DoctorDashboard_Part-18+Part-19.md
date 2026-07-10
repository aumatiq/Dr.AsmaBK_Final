# PATCH — DoctorDashboard.html (Part 18: Blog + Part 19: Recommended Doctors)

ফাইল: `DoctorDashboard.html`
পদ্ধতি: নিচের প্রতিটা ধাপে "খুঁজো" (Find) টেক্সটটা ফাইলে খুঁজে বের করে তার
ঠিক পরে/জায়গায় "যোগ করো" (Insert) কোডটুকু পেস্ট করো। কোনো existing কোড
মুছবে না — সবই additive।

---

## ধাপ ১ — Sidebar-এ দুইটা নতুন মেনু আইটেম (Doctor-only)

**খুঁজো** (এটা exact ভাবে থাকবে, একবারই আছে ফাইলে):
```html
    <div class="sb-section">Settings</div>
    <button class="sb-item doctor-only" onclick="navTo('settings',this)">
      <span class="sb-icon">⚙️</span> Settings
    </button>
```

**তার ঠিক আগে এই ব্লকটা যোগ করো** (মানে "Settings" section header-এর আগে):
```html
    <div class="sb-section">Content</div>
    <button class="sb-item doctor-only" onclick="navTo('blog',this)">
      <span class="sb-icon">📝</span> Blog / Articles
    </button>
    <button class="sb-item doctor-only" onclick="navTo('recdocs',this)">
      <span class="sb-icon">🤝</span> Recommended Doctors
    </button>

```

---

## ধাপ ২ — Mobile bottom nav-এ দুইটা আইটেম + horizontal scroll CSS fix

**খুঁজো:**
```html
    <button class="mob-nav-item doctor-only" onclick="navTo('settings',this)" data-tab="settings">
      <span class="mi">⚙️</span>Settings
    </button>
  </div>
</nav>
```

**দিয়ে বদলাও (replace) এটা দিয়ে:**
```html
    <button class="mob-nav-item doctor-only" onclick="navTo('blog',this)" data-tab="blog">
      <span class="mi">📝</span>Blog
    </button>
    <button class="mob-nav-item doctor-only" onclick="navTo('recdocs',this)" data-tab="recdocs">
      <span class="mi">🤝</span>Doctors
    </button>
    <button class="mob-nav-item doctor-only" onclick="navTo('settings',this)" data-tab="settings">
      <span class="mi">⚙️</span>Settings
    </button>
  </div>
</nav>
```
> নোট: এখন মোবাইল bottom nav-এ ৭টা আইটেম হয়ে যাবে — নিচের ধাপ ৫-এর CSS
> patch-এ `.mob-nav-items` horizontal-scroll করে দেওয়া হয়েছে যাতে 375px
> স্ক্রিনেও সবগুলো বাটন হাতে-ঠেলে (swipe) দেখা যায়, layout ভাঙবে না।

---

## ধাপ ৩ — দুইটা নতুন Tab-Page (Blog + Recommended Doctors)

**খুঁজো:**
```html
    <!-- END SETTINGS -->

  </main>
```

**তার ঠিক আগে (মানে `<!-- END SETTINGS -->` এর পরে, `</main>` এর আগে) এই পুরো ব্লকটা বসাও:**

```html
    <!-- ══ PART 18: BLOG / ARTICLES ══ -->
    <div class="tab-page" id="pg-blog">
      <div id="blogListView">
        <div class="page-hd">
          <div class="page-hd-left">
            <div class="page-lbl">Content Management</div>
            <h1>Blog / Articles</h1>
            <p>Write and publish health articles for the public website. Only you (Doctor) can write and publish.</p>
          </div>
          <div class="page-hd-right">
            <button class="btn btn-rose" onclick="openArticleComposer()">✍️ New Article</button>
          </div>
        </div>
        <div id="articleListWrap" class="sec-card">
          <div class="sec-body" id="articleListBody">
            <p style="color:var(--sil2);font-size:13px;">Loading articles...</p>
          </div>
        </div>
      </div>

      <div id="blogComposeView" style="display:none;">
        <div class="page-hd">
          <div class="page-hd-left">
            <div class="page-lbl" id="composerModeLbl">New Article</div>
            <h1 id="composerTitleHd">Write Article</h1>
            <p>Format with the toolbar below. Images upload directly into the article.</p>
          </div>
          <div class="page-hd-right" style="gap:10px;display:flex;">
            <button class="btn btn-out" onclick="closeArticleComposer()">← Back to List</button>
          </div>
        </div>

        <input type="hidden" id="artId" value="">

        <div class="sec-card">
          <div class="sec-body">
            <div class="form-grid">
              <div class="fg" style="grid-column:1/-1;">
                <label class="fl">Title</label>
                <input class="fi" id="artTitle" placeholder="e.g. 5 Early Signs of PCOS Every Woman Should Know">
              </div>
              <div class="fg">
                <label class="fl">Tags (comma separated)</label>
                <input class="fi" id="artTags" placeholder="Pregnancy Tips, PCOS, Women's Health">
              </div>
              <div class="fg">
                <label class="fl">Cover Image</label>
                <input type="file" class="fi" id="artCoverFile" accept="image/*" onchange="handleCoverImageUpload(event)">
                <div id="artCoverPreviewWrap" style="margin-top:8px;"></div>
                <input type="hidden" id="artCoverURL" value="">
              </div>
            </div>
          </div>
        </div>

        <div class="sec-card">
          <div class="sec-card-hd">
            <h3>📥 Import Content (optional)</h3>
          </div>
          <div class="sec-body">
            <p style="font-size:13px;color:var(--sil);margin-bottom:14px;">
              Upload an already-typed document, or scan a handwritten page. Extracted text will be inserted
              into the editor below — you can then format it with the toolbar.
            </p>
            <div style="display:flex;flex-wrap:wrap;gap:24px;">
              <div>
                <label class="fl" style="display:block;margin-bottom:6px;">📄 Upload Document (.docx / .pdf)</label>
                <input type="file" class="fi" id="artDocFile" accept=".doc,.docx,.pdf" onchange="handleDocumentImport(event)">
              </div>
              <div>
                <label class="fl" style="display:block;margin-bottom:6px;">✍️ Scan Handwritten Page (photo)</label>
                <input type="file" class="fi" id="artOcrFile" accept="image/*" capture="environment" onchange="handleOcrImport(event)">
                <p style="font-size:11px;color:var(--warn);margin-top:6px;max-width:320px;">
                  ⚠️ Bangla handwriting OCR accuracy is limited — always review the extracted text
                  below before inserting it into the article.
                </p>
              </div>
            </div>
            <div id="importStatus" style="margin-top:12px;font-size:13px;color:var(--sil);"></div>

            <!-- Review step — শুধু OCR/Doc import এর পর দেখা যাবে -->
            <div id="importReviewWrap" style="display:none;margin-top:16px;padding:16px;background:var(--bg3);border:1px solid var(--bd);border-radius:12px;">
              <label class="fl" style="display:block;margin-bottom:8px;">Review extracted text before inserting:</label>
              <textarea class="fta" id="importReviewText" rows="8" style="width:100%;"></textarea>
              <div style="display:flex;gap:10px;margin-top:10px;">
                <button class="btn btn-teal btn-sm" onclick="insertImportedText()">✓ Insert into Article</button>
                <button class="btn btn-out btn-sm" onclick="discardImportedText()">✕ Discard</button>
              </div>
            </div>
          </div>
        </div>

        <div class="sec-card">
          <div class="sec-card-hd"><h3>📝 Article Body</h3></div>
          <div class="sec-body">
            <div id="editorToolbar" style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px;padding:8px;background:var(--bg3);border:1px solid var(--bd);border-radius:10px;">
              <button type="button" class="btn btn-out btn-sm" onclick="execFmt('bold')"><b>B</b></button>
              <button type="button" class="btn btn-out btn-sm" onclick="execFmt('italic')"><i>I</i></button>
              <button type="button" class="btn btn-out btn-sm" onclick="execFmt('underline')"><u>U</u></button>
              <button type="button" class="btn btn-out btn-sm" onclick="execFmtBlock('h2')">H2</button>
              <button type="button" class="btn btn-out btn-sm" onclick="execFmtBlock('h3')">H3</button>
              <button type="button" class="btn btn-out btn-sm" onclick="execFmtBlock('p')">¶</button>
              <button type="button" class="btn btn-out btn-sm" onclick="execFmt('insertUnorderedList')">• List</button>
              <button type="button" class="btn btn-out btn-sm" onclick="execFmt('insertOrderedList')">1. List</button>
              <button type="button" class="btn btn-out btn-sm" onclick="execFmtBlock('blockquote')">❝ Quote</button>
              <button type="button" class="btn btn-teal btn-sm" onclick="insertInlineImage()">🖼️ Insert Image</button>
              <input type="file" id="artInlineImgFile" accept="image/*" style="display:none;" onchange="handleInlineImageUpload(event)">
            </div>
            <div id="articleEditor" contenteditable="true"
                 style="min-height:280px;padding:16px;background:var(--bg3);border:1px solid var(--bd);border-radius:12px;color:var(--wht);font-size:15px;line-height:1.8;outline:none;">
            </div>
          </div>
        </div>

        <div id="composerMsg"></div>

        <div style="display:flex;gap:12px;justify-content:flex-end;margin-top:8px;">
          <button class="btn btn-out" onclick="saveArticleDraft()">💾 Save as Draft</button>
          <button class="btn btn-rose" onclick="publishArticleFromComposer()">🚀 Publish</button>
        </div>
      </div>
    </div>
    <!-- END BLOG -->

    <!-- ══ PART 19: RECOMMENDED DOCTORS ══ -->
    <div class="tab-page" id="pg-recdocs">
      <div class="page-hd">
        <div class="page-hd-left">
          <div class="page-lbl">Network</div>
          <h1>Recommended Doctors</h1>
          <p>Doctors you personally refer patients to — shown on the public website with clickable call/WhatsApp.</p>
        </div>
        <div class="page-hd-right">
          <button class="btn btn-rose" onclick="openAddRecDoc()">+ Add Doctor</button>
        </div>
      </div>
      <div id="recDocMsg"></div>
      <div id="recDocGrid" class="g2" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:18px;">
        <p style="color:var(--sil2);font-size:13px;">Loading...</p>
      </div>
    </div>
    <!-- END RECOMMENDED DOCTORS -->

```

---

## ধাপ ৪ — নতুন Modal (Recommended Doctor Add/Edit)

**খুঁজো:**
```html
</div><!-- end #main-app -->
```

**তার ঠিক আগে এই মোডালটা বসাও:**

```html
<!-- ══ RECOMMENDED DOCTOR MODAL ══ -->
<div class="modal-overlay" id="recDocModal">
  <div class="modal">
    <div class="modal-hd">
      <h3 id="recDocModalTitle">Add Recommended Doctor</h3>
      <button class="modal-close" onclick="closeModal('recDocModal')">✕</button>
    </div>
    <div class="modal-body">
      <input type="hidden" id="rdId" value="">
      <div class="form-grid">
        <div class="fg" style="grid-column:1/-1;">
          <label class="fl">Name</label>
          <input class="fi" id="rdName" placeholder="Dr. Rahim Uddin">
        </div>
        <div class="fg">
          <label class="fl">Specialty</label>
          <input class="fi" id="rdSpecialty" placeholder="Cardiologist">
        </div>
        <div class="fg">
          <label class="fl">Display Order</label>
          <input class="fi" type="number" id="rdOrder" placeholder="1">
        </div>
        <div class="fg" style="grid-column:1/-1;">
          <label class="fl">Chamber / Address</label>
          <input class="fi" id="rdChamber" placeholder="Square Hospital, Panthapath, Dhaka">
        </div>
        <div class="fg" style="grid-column:1/-1;">
          <label class="fl">Phone Number (used for both Call &amp; WhatsApp)</label>
          <input class="fi" id="rdContact" placeholder="8801XXXXXXXXX">
        </div>
        <div class="fg" style="grid-column:1/-1;">
          <label class="fl">Note / Reason for Recommendation</label>
          <textarea class="fta" id="rdNote" rows="2" placeholder="Best for pediatric cardiac cases..."></textarea>
        </div>
        <div class="fg" style="grid-column:1/-1;">
          <label class="fl">Photo</label>
          <input type="file" class="fi" id="rdPhotoFile" accept="image/*" onchange="handleRecDocPhotoUpload(event)">
          <div id="rdPhotoPreviewWrap" style="margin-top:8px;"></div>
          <input type="hidden" id="rdPhotoURL" value="">
        </div>
        <div class="fg" style="grid-column:1/-1;display:flex;align-items:center;gap:8px;">
          <input type="checkbox" id="rdActive" checked style="width:16px;height:16px;">
          <label class="fl" style="margin:0;">Show on public website</label>
        </div>
      </div>
    </div>
    <div class="modal-foot">
      <button class="btn btn-out" onclick="closeModal('recDocModal')">Cancel</button>
      <button class="btn btn-rose" onclick="saveRecDoc()">💾 Save</button>
    </div>
  </div>
</div>

```

---

## ধাপ ৫ — নতুন CSS (mobile nav scroll fix)

**খুঁজো:**
```html
</head>
<body>
```

**তার ঠিক আগে এই `<style>` ব্লকটা যোগ করো:**

```html
<style id="PART18_19_STYLES">
/* মোবাইল bottom nav-এ ৭টা আইটেম ধরার জন্য horizontal scroll */
@media(max-width:768px){
  .mob-nav-items{
    justify-content:flex-start;
    overflow-x:auto;
    -webkit-overflow-scrolling:touch;
    scrollbar-width:none;
  }
  .mob-nav-items::-webkit-scrollbar{ display:none; }
  .mob-nav-item{ flex-shrink:0; }
}
/* Article list card */
.art-row{
  display:flex;align-items:center;gap:14px;padding:14px 16px;
  border:1px solid var(--bd);border-radius:12px;margin-bottom:10px;
  background:var(--bg3);
}
.art-row-cover{ width:56px;height:56px;border-radius:8px;object-fit:cover;background:var(--bg4);flex-shrink:0; }
.art-row-body{ flex:1;min-width:0; }
.art-row-title{ font-family:'Syne',sans-serif;font-weight:700;font-size:15px;color:var(--wht);margin-bottom:4px; }
.art-row-meta{ font-size:12px;color:var(--sil2); }
.art-status-badge{ font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;text-transform:uppercase;letter-spacing:0.4px; }
.art-status-published{ background:rgba(20,184,166,0.14);color:var(--teal2);border:1px solid rgba(20,184,166,0.3); }
.art-status-draft{ background:rgba(245,166,35,0.14);color:var(--gold);border:1px solid rgba(245,166,35,0.3); }
/* Recommended doctor card */
.rd-card{
  background:var(--bg3);border:1px solid var(--bd);border-radius:14px;padding:18px;
  display:flex;flex-direction:column;gap:10px;
}
.rd-card-top{ display:flex;gap:12px;align-items:center; }
.rd-photo{ width:52px;height:52px;border-radius:50%;object-fit:cover;background:var(--bg4);flex-shrink:0; }
.rd-name{ font-family:'Syne',sans-serif;font-weight:700;font-size:15px;color:var(--wht); }
.rd-spec{ font-size:12px;color:var(--rose2); }
.rd-meta{ font-size:12px;color:var(--sil);line-height:1.6; }
.rd-actions{ display:flex;gap:8px;margin-top:4px;flex-wrap:wrap; }
</style>
```

---

## ধাপ ৬ — `D` (global data object) আপডেট

**খুঁজো:**
```javascript
var D = {
  profile:      {},
  patients:     [],
  appointments: [],
  testRecords:  [],
  prescriptions: [],   // ← নতুন
  settings:     {},
  categories:   [],
  commsLog:     []
};
```

**দিয়ে বদলাও (replace) এটা দিয়ে:**
```javascript
var D = {
  profile:      {},
  patients:     [],
  appointments: [],
  testRecords:  [],
  prescriptions: [],   // ← নতুন
  settings:     {},
  categories:   [],
  commsLog:     [],
  articles:     [],    // ← Part 18
  recommendedDoctors: [] // ← Part 19
};
var _importedText = ''; // OCR/Doc import-এর সাময়িক buffer
```

---

## ধাপ ৭ — `loadAll()`-এ নতুন লোড কল যোগ করা

**খুঁজো:**
```javascript
function loadAll() {
  loadProfile();
  loadPatients();
  loadAppointments();
  loadTestRecords();
  loadSettings();
}
```

**দিয়ে বদলাও:**
```javascript
function loadAll() {
  loadProfile();
  loadPatients();
  loadAppointments();
  loadTestRecords();
  loadSettings();
  loadArticles();          // ← Part 18
  loadRecommendedDoctors(); // ← Part 19
}
```

---

## ধাপ ৮ — নতুন JavaScript ফাংশনগুলো (নতুন `<script>` ব্লক)

**খুঁজো** (ফাইলের একদম শেষের দিকে):
```html
</script>
</body>
</html>
```

**তার ঠিক আগে (মানে `</script>` এর পরে, `</body>` এর আগে) এই পুরো নতুন স্ক্রিপ্ট ব্লকটা বসাও:**

```html
<script>
// ═══════════════════════════════════════════════════════════
// PART 18 — BLOG / ARTICLES
// ═══════════════════════════════════════════════════════════

function loadArticles() {
  call('getAllArticles', [], function(r) {
    if (!r || !r.success) return;
    D.articles = r.articles || [];
    renderArticleList();
  });
}

function renderArticleList() {
  var el = document.getElementById('articleListBody');
  if (!el) return;
  if (!D.articles.length) {
    el.innerHTML = '<p style="color:var(--sil2);font-size:13px;">No articles yet. Click "New Article" to write your first one.</p>';
    return;
  }
  el.innerHTML = D.articles.map(function(a) {
    var statusCls = a.status === 'Published' ? 'art-status-published' : 'art-status-draft';
    var toggleBtn = a.status === 'Published'
      ? '<button class="btn btn-out btn-sm" onclick="doUnpublish(\'' + a.articleId + '\')">Unpublish</button>'
      : '<button class="btn btn-teal btn-sm" onclick="doPublish(\'' + a.articleId + '\')">Publish</button>';
    return '<div class="art-row">' +
      (a.coverImageURL ? '<img class="art-row-cover" src="' + a.coverImageURL + '">' : '<div class="art-row-cover"></div>') +
      '<div class="art-row-body">' +
        '<div class="art-row-title">' + esc_(a.title) + '</div>' +
        '<div class="art-row-meta">' + esc_(a.tags || 'No tags') + ' · Edited ' + fmtDate(a.lastEditedDate) + '</div>' +
      '</div>' +
      '<span class="art-status-badge ' + statusCls + '">' + a.status + '</span>' +
      '<div style="display:flex;gap:6px;">' +
        '<button class="btn btn-out btn-sm" onclick="openArticleComposer(\'' + a.articleId + '\')">Edit</button>' +
        toggleBtn +
        '<button class="btn btn-out btn-sm" onclick="doDeleteArticle(\'' + a.articleId + '\')" style="color:var(--err);">Delete</button>' +
      '</div>' +
    '</div>';
  }).join('');
}

function esc_(s) {
  var d = document.createElement('div');
  d.textContent = s || '';
  return d.innerHTML;
}

function doPublish(id) {
  call('publishArticle', [id], function(r) {
    if (r && r.success) { showToast('Published!', 'ok'); loadArticles(); }
    else showToast((r && r.error) || 'Failed', 'err');
  });
}
function doUnpublish(id) {
  call('unpublishArticle', [id], function(r) {
    if (r && r.success) { showToast('Moved to Draft.', 'ok'); loadArticles(); }
    else showToast((r && r.error) || 'Failed', 'err');
  });
}
function doDeleteArticle(id) {
  if (!confirm('Delete this article permanently?')) return;
  call('deleteArticle', [id], function(r) {
    if (r && r.success) { showToast('Deleted.', 'ok'); loadArticles(); }
    else showToast((r && r.error) || 'Failed', 'err');
  });
}

// ── COMPOSER ──
function openArticleComposer(articleId) {
  document.getElementById('blogListView').style.display = 'none';
  document.getElementById('blogComposeView').style.display = 'block';
  document.getElementById('composerMsg').innerHTML = '';
  document.getElementById('importReviewWrap').style.display = 'none';
  document.getElementById('importStatus').textContent = '';

  if (articleId) {
    document.getElementById('composerModeLbl').textContent = 'Edit Article';
    document.getElementById('composerTitleHd').textContent = 'Edit Article';
    call('getArticleById', [articleId], function(r) {
      if (!r || !r.success) { showToast((r && r.error) || 'Load failed', 'err'); return; }
      var a = r.article;
      setVal('artId', a.articleId);
      setVal('artTitle', a.title);
      setVal('artTags', a.tags);
      setVal('artCoverURL', a.coverImageURL || '');
      document.getElementById('articleEditor').innerHTML = a.bodyHtml || '';
      renderCoverPreview(a.coverImageURL);
    });
  } else {
    document.getElementById('composerModeLbl').textContent = 'New Article';
    document.getElementById('composerTitleHd').textContent = 'Write Article';
    setVal('artId', '');
    setVal('artTitle', '');
    setVal('artTags', '');
    setVal('artCoverURL', '');
    document.getElementById('articleEditor').innerHTML = '';
    document.getElementById('artCoverPreviewWrap').innerHTML = '';
  }
}

function closeArticleComposer() {
  document.getElementById('blogComposeView').style.display = 'none';
  document.getElementById('blogListView').style.display = 'block';
}

// ── Rich-text toolbar (contenteditable + execCommand — Chrome/Edge admin tool, simple by design) ──
function execFmt(cmd) {
  document.getElementById('articleEditor').focus();
  document.execCommand(cmd, false, null);
}
function execFmtBlock(tag) {
  document.getElementById('articleEditor').focus();
  document.execCommand('formatBlock', false, tag);
}

// ── Cover image upload ──
function handleCoverImageUpload(evt) {
  var file = evt.target.files[0];
  if (!file) return;
  fileToBase64_(file, function(base64) {
    document.getElementById('importStatus').textContent = 'Uploading cover image...';
    call('uploadArticleImage', [base64, file.type, file.name], function(r) {
      document.getElementById('importStatus').textContent = '';
      if (r && r.success) {
        setVal('artCoverURL', r.url);
        renderCoverPreview(r.url);
        showToast('Cover image uploaded!', 'ok');
      } else {
        showToast((r && r.error) || 'Upload failed', 'err');
      }
    });
  });
}
function renderCoverPreview(url) {
  var wrap = document.getElementById('artCoverPreviewWrap');
  wrap.innerHTML = url ? '<img src="' + url + '" style="max-width:180px;border-radius:8px;">' : '';
}

// ── Inline image insert (inside editor) ──
function insertInlineImage() {
  document.getElementById('artInlineImgFile').click();
}
function handleInlineImageUpload(evt) {
  var file = evt.target.files[0];
  if (!file) return;
  fileToBase64_(file, function(base64) {
    document.getElementById('importStatus').textContent = 'Uploading image...';
    call('uploadArticleImage', [base64, file.type, file.name], function(r) {
      document.getElementById('importStatus').textContent = '';
      if (r && r.success) {
        document.getElementById('articleEditor').focus();
        document.execCommand('insertHTML', false, '<img src="' + r.url + '" style="max-width:100%;border-radius:8px;">');
      } else {
        showToast((r && r.error) || 'Upload failed', 'err');
      }
    });
  });
}

// ── Document import (.docx/.pdf) ──
function handleDocumentImport(evt) {
  var file = evt.target.files[0];
  if (!file) return;
  fileToBase64_(file, function(base64) {
    document.getElementById('importStatus').textContent = '⏳ Extracting text from document...';
    call('uploadArticleDocument', [base64, file.type, file.name], function(r) {
      document.getElementById('importStatus').textContent = '';
      if (r && r.success) {
        showImportReview(r.text);
      } else {
        showToast((r && r.error) || 'Extraction failed', 'err');
      }
    });
  });
}

// ── OCR handwritten import ──
function handleOcrImport(evt) {
  var file = evt.target.files[0];
  if (!file) return;
  fileToBase64_(file, function(base64) {
    document.getElementById('importStatus').textContent = '⏳ Scanning handwriting (OCR)... this may take a moment.';
    call('ocrHandwrittenImage', [base64, file.type, file.name], function(r) {
      document.getElementById('importStatus').textContent = '';
      if (r && r.success) {
        showImportReview(r.text);
      } else {
        showToast((r && r.error) || 'OCR failed', 'err');
      }
    });
  });
}

function showImportReview(text) {
  _importedText = text || '';
  document.getElementById('importReviewText').value = _importedText;
  document.getElementById('importReviewWrap').style.display = 'block';
}
function insertImportedText() {
  var reviewed = document.getElementById('importReviewText').value.trim();
  if (!reviewed) return;
  var paras = reviewed.split(/\n+/).map(function(line) {
    return line.trim() ? '<p>' + esc_(line.trim()) + '</p>' : '';
  }).join('');
  document.getElementById('articleEditor').innerHTML += paras;
  document.getElementById('importReviewWrap').style.display = 'none';
  document.getElementById('artOcrFile').value = '';
  document.getElementById('artDocFile').value = '';
  showToast('Inserted into article.', 'ok');
}
function discardImportedText() {
  document.getElementById('importReviewWrap').style.display = 'none';
  document.getElementById('artOcrFile').value = '';
  document.getElementById('artDocFile').value = '';
}

// ── Save ──
function collectArticleData_() {
  return {
    title:         getVal('artTitle').trim(),
    bodyHtml:      document.getElementById('articleEditor').innerHTML,
    coverImageURL: getVal('artCoverURL'),
    tags:          getVal('artTags').trim()
  };
}

function saveArticleDraft() {
  var data = collectArticleData_();
  if (!data.title) { showAl('composerMsg', 'err', '❌ Title is required.'); return; }
  var id = getVal('artId');
  if (id) {
    call('editArticle', [id, data], function(r) {
      if (r && r.success) { showToast('Draft saved!', 'ok'); loadArticles(); closeArticleComposer(); }
      else showAl('composerMsg', 'err', '❌ ' + ((r && r.error) || 'Save failed.'));
    });
  } else {
    data.status = 'Draft';
    call('createArticle', [data], function(r) {
      if (r && r.success) { showToast('Draft saved!', 'ok'); loadArticles(); closeArticleComposer(); }
      else showAl('composerMsg', 'err', '❌ ' + ((r && r.error) || 'Save failed.'));
    });
  }
}

function publishArticleFromComposer() {
  var data = collectArticleData_();
  if (!data.title) { showAl('composerMsg', 'err', '❌ Title is required.'); return; }
  var id = getVal('artId');
  if (id) {
    call('editArticle', [id, data], function(r) {
      if (!r || !r.success) { showAl('composerMsg', 'err', '❌ ' + ((r && r.error) || 'Save failed.')); return; }
      call('publishArticle', [id], function(r2) {
        if (r2 && r2.success) { showToast('Published!', 'ok'); loadArticles(); closeArticleComposer(); }
        else showAl('composerMsg', 'err', '❌ ' + ((r2 && r2.error) || 'Publish failed.'));
      });
    });
  } else {
    data.status = 'Published';
    call('createArticle', [data], function(r) {
      if (r && r.success) { showToast('Published!', 'ok'); loadArticles(); closeArticleComposer(); }
      else showAl('composerMsg', 'err', '❌ ' + ((r && r.error) || 'Save failed.'));
    });
  }
}

// ── shared helper: File → base64 ──
function fileToBase64_(file, cb) {
  var reader = new FileReader();
  reader.onload = function() { cb(reader.result); };
  reader.readAsDataURL(file);
}


// ═══════════════════════════════════════════════════════════
// PART 19 — RECOMMENDED DOCTORS
// ═══════════════════════════════════════════════════════════

function loadRecommendedDoctors() {
  call('getAllRecommendedDoctors', [], function(r) {
    if (!r || !r.success) return;
    D.recommendedDoctors = r.doctors || [];
    renderRecDocGrid();
  });
}

function renderRecDocGrid() {
  var el = document.getElementById('recDocGrid');
  if (!el) return;
  if (!D.recommendedDoctors.length) {
    el.innerHTML = '<p style="color:var(--sil2);font-size:13px;">No recommended doctors yet. Click "Add Doctor" to add one.</p>';
    return;
  }
  el.innerHTML = D.recommendedDoctors.map(function(d) {
    var activeToggle = d.isActive
      ? '<button class="btn btn-out btn-sm" onclick="doToggleRecDoc(\'' + d.id + '\',false)">Hide</button>'
      : '<button class="btn btn-teal btn-sm" onclick="doToggleRecDoc(\'' + d.id + '\',true)">Show</button>';
    return '<div class="rd-card">' +
      '<div class="rd-card-top">' +
        (d.photoURL ? '<img class="rd-photo" src="' + d.photoURL + '">' : '<div class="rd-photo"></div>') +
        '<div><div class="rd-name">' + esc_(d.name) + '</div><div class="rd-spec">' + esc_(d.specialty) + '</div></div>' +
      '</div>' +
      '<div class="rd-meta">📍 ' + esc_(d.chamber || '—') + '<br>📞 ' + esc_(d.contactInfo || '—') + '</div>' +
      (d.note ? '<div class="rd-meta" style="font-style:italic;">"' + esc_(d.note) + '"</div>' : '') +
      '<div class="rd-actions">' +
        '<button class="btn btn-out btn-sm" onclick="openAddRecDoc(\'' + d.id + '\')">Edit</button>' +
        activeToggle +
        '<button class="btn btn-out btn-sm" onclick="doRemoveRecDoc(\'' + d.id + '\')" style="color:var(--err);">Remove</button>' +
      '</div>' +
    '</div>';
  }).join('');
}

function openAddRecDoc(id) {
  clearRecDocForm_();
  if (id) {
    var d = D.recommendedDoctors.find(function(x){ return x.id === id; });
    if (!d) return;
    document.getElementById('recDocModalTitle').textContent = 'Edit Doctor';
    setVal('rdId', d.id);
    setVal('rdName', d.name);
    setVal('rdSpecialty', d.specialty);
    setVal('rdOrder', d.displayOrder);
    setVal('rdChamber', d.chamber);
    setVal('rdContact', d.contactInfo);
    setVal('rdNote', d.note);
    setVal('rdPhotoURL', d.photoURL);
    document.getElementById('rdActive').checked = !!d.isActive;
    if (d.photoURL) document.getElementById('rdPhotoPreviewWrap').innerHTML = '<img src="' + d.photoURL + '" style="width:60px;height:60px;border-radius:50%;object-fit:cover;">';
  } else {
    document.getElementById('recDocModalTitle').textContent = 'Add Recommended Doctor';
  }
  openModal('recDocModal');
}

function clearRecDocForm_() {
  ['rdId','rdName','rdSpecialty','rdOrder','rdChamber','rdContact','rdNote','rdPhotoURL'].forEach(function(id){ setVal(id, ''); });
  document.getElementById('rdActive').checked = true;
  document.getElementById('rdPhotoPreviewWrap').innerHTML = '';
}

function handleRecDocPhotoUpload(evt) {
  var file = evt.target.files[0];
  if (!file) return;
  fileToBase64_(file, function(base64) {
    call('uploadRecommendedDoctorPhoto', [base64, file.type, file.name], function(r) {
      if (r && r.success) {
        setVal('rdPhotoURL', r.url);
        document.getElementById('rdPhotoPreviewWrap').innerHTML = '<img src="' + r.url + '" style="width:60px;height:60px;border-radius:50%;object-fit:cover;">';
      } else {
        showToast((r && r.error) || 'Upload failed', 'err');
      }
    });
  });
}

function saveRecDoc() {
  var data = {
    name:         getVal('rdName').trim(),
    specialty:    getVal('rdSpecialty').trim(),
    chamber:      getVal('rdChamber').trim(),
    contactInfo:  getVal('rdContact').trim(),
    note:         getVal('rdNote').trim(),
    displayOrder: getVal('rdOrder') ? Number(getVal('rdOrder')) : '',
    photoURL:     getVal('rdPhotoURL'),
    isActive:     document.getElementById('rdActive').checked
  };
  if (!data.name) { showAl('recDocMsg', 'err', '❌ Name is required.'); return; }

  var id = getVal('rdId');
  if (id) {
    call('editRecommendedDoctor', [id, data], function(r) {
      if (r && r.success) { showToast('Updated!', 'ok'); closeModal('recDocModal'); loadRecommendedDoctors(); }
      else showAl('recDocMsg', 'err', '❌ ' + ((r && r.error) || 'Save failed.'));
    });
  } else {
    call('addRecommendedDoctor', [data], function(r) {
      if (r && r.success) { showToast('Added!', 'ok'); closeModal('recDocModal'); loadRecommendedDoctors(); }
      else showAl('recDocMsg', 'err', '❌ ' + ((r && r.error) || 'Save failed.'));
    });
  }
}

function doToggleRecDoc(id, isActive) {
  call('toggleRecommendedDoctorActive', [id, isActive], function(r) {
    if (r && r.success) { showToast(isActive ? 'Now visible on website.' : 'Hidden from website.', 'ok'); loadRecommendedDoctors(); }
    else showToast((r && r.error) || 'Failed', 'err');
  });
}

function doRemoveRecDoc(id) {
  if (!confirm('Remove this recommended doctor permanently?')) return;
  call('removeRecommendedDoctor', [id], function(r) {
    if (r && r.success) { showToast('Removed.', 'ok'); loadRecommendedDoctors(); }
    else showToast((r && r.error) || 'Failed', 'err');
  });
}
</script>
```

---

## ✅ চেকলিস্ট (patch শেষে যাচাই করো)
- [ ] Sidebar-এ "Content" section-এর নিচে "Blog / Articles" আর "Recommended Doctors" দেখা যাচ্ছে
- [ ] মোবাইলে bottom nav swipe করলে ৭টা আইটেমই দেখা যাচ্ছে
- [ ] "New Article" ক্লিক করলে composer view খুলছে, টুলবার দিয়ে বোল্ড/ইটালিক/হেডিং কাজ করছে
- [ ] Cover image upload → preview দেখাচ্ছে
- [ ] Document (.docx/.pdf) upload → review textarea-তে টেক্সট আসছে → Insert করলে editor-এ বসছে
- [ ] হাতের লেখার ছবি → OCR চলছে, disclaimer দেখাচ্ছে, review-এর পর insert হচ্ছে
- [ ] Draft save + Publish দুটোই কাজ করছে, লিস্টে status badge ঠিকমতো দেখাচ্ছে
- [ ] "+ Add Doctor" মোডাল খুলছে, ছবি upload, save, edit, hide/show, remove সব কাজ করছে
