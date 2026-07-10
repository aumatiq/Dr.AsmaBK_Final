# DoctorDashboard.html — PATCH (Part 6 + Part 8)

কোনো existing কোড মুছবেন না। প্রতিটা ব্লক **FIND** করে ঠিক ওখানে **REPLACE/INSERT**
করুন। ধারাবাহিকভাবে (PATCH 1 → 9) করলে সবচেয়ে নিরাপদ হবে।

---

## PATCH 1 — Sidebar-এ Finance নেভ আইটেম

**FIND:**
```html
    <div class="sb-section">Settings</div>
    <button class="sb-item doctor-only" onclick="navTo('settings',this)">
      <span class="sb-icon">⚙️</span> Settings
    </button>
```

**REPLACE WITH:**
```html
    <div class="sb-section">Finance</div>
    <button class="sb-item doctor-only" onclick="navTo('finance',this)">
      <span class="sb-icon">💰</span> Finance
      <span class="sb-badge warn" id="sb-sync-count" style="display:none;">0</span>
    </button>

    <div class="sb-section">Settings</div>
    <button class="sb-item doctor-only" onclick="navTo('settings',this)">
      <span class="sb-icon">⚙️</span> Settings
    </button>
```

---

## PATCH 2 — Mobile nav-এ Finance আইটেম

**FIND:**
```html
    <button class="mob-nav-item doctor-only" onclick="navTo('settings',this)" data-tab="settings">
      <span class="mi">⚙️</span>Settings
    </button>
```

**REPLACE WITH:**
```html
    <button class="mob-nav-item doctor-only" onclick="navTo('finance',this)" data-tab="finance">
      <span class="mi">💰</span>Finance
    </button>
    <button class="mob-nav-item doctor-only" onclick="navTo('settings',this)" data-tab="settings">
      <span class="mi">⚙️</span>Settings
    </button>
```

---

## PATCH 3 — নতুন PAGE: FINANCE (Settings পেজের ঠিক আগে বসবে)

**FIND:**
```html
    <!-- ════════════════════════════
      PAGE: SETTINGS
    ════════════════════════════ -->
    <div class="tab-page" id="pg-settings">
```

**REPLACE WITH:** *(পুরো নতুন pg-finance ব্লক + অপরিবর্তিত pg-settings ওপেনিং ট্যাগ)*

```html
    <!-- ════════════════════════════
      PAGE: FINANCE  (Part 6 + Part 8)
    ════════════════════════════ -->
    <div class="tab-page" id="pg-finance">
      <div class="page-hd">
        <div class="page-hd-left">
          <div class="page-lbl">Income & Expense</div>
          <h1>Finance</h1>
          <p>প্রতিটা এন্ট্রি অটোমেটিক External Finance App-এ sync হয় (যদি Settings-এ কানেক্ট করা থাকে)।</p>
        </div>
        <div class="page-hd-right" style="display:flex;gap:10px;">
          <button class="btn btn-out" id="finRetryBtn" onclick="retryAllFinanceSync()" style="display:none;">
            🔄 Retry Failed Sync
          </button>
          <button class="btn btn-rose" onclick="openPaymentModal()">+ Add Entry</button>
        </div>
      </div>

      <!-- Summary cards -->
      <div class="g4" style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:20px;">
        <div class="sec-card" style="padding:18px;">
          <div style="font-size:12px;color:var(--sil2);margin-bottom:6px;">Income (this month)</div>
          <div style="font-size:24px;font-weight:800;color:var(--ok);" id="finIncome">৳0</div>
        </div>
        <div class="sec-card" style="padding:18px;">
          <div style="font-size:12px;color:var(--sil2);margin-bottom:6px;">Expense (this month)</div>
          <div style="font-size:24px;font-weight:800;color:#F87171;" id="finExpense">৳0</div>
        </div>
        <div class="sec-card" style="padding:18px;">
          <div style="font-size:12px;color:var(--sil2);margin-bottom:6px;">Net Profit</div>
          <div style="font-size:24px;font-weight:800;color:var(--rose);" id="finNet">৳0</div>
        </div>
        <div class="sec-card" style="padding:18px;">
          <div style="font-size:12px;color:var(--sil2);margin-bottom:6px;">External App Sync</div>
          <div style="font-size:14px;font-weight:700;" id="finSyncSummary">✅ সব sync হয়ে গেছে</div>
        </div>
      </div>

      <!-- Filter row -->
      <div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap;align-items:center;">
        <input class="fi" type="date" id="finStart" style="max-width:170px;">
        <span style="color:var(--sil2);font-size:13px;">থেকে</span>
        <input class="fi" type="date" id="finEnd" style="max-width:170px;">
        <button class="btn btn-out btn-sm" onclick="loadFinance()">🔍 Filter</button>
      </div>

      <div class="sec-card">
        <div class="sec-body np">
          <div class="tbl-wrap">
            <table>
              <thead><tr>
                <th>তারিখ</th><th>Type</th><th>Category</th><th>Patient</th>
                <th>Amount</th><th>Payment</th><th>প্রুফ</th><th>Sync</th>
              </tr></thead>
              <tbody id="financeTable"></tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    <!-- END FINANCE -->


    <!-- ════════════════════════════
      PAGE: SETTINGS
    ════════════════════════════ -->
    <div class="tab-page" id="pg-settings">
```

---

## PATCH 4 — Settings: Clinic Address সিঙ্গেল ফিল্ড → একাধিক Chamber (dynamic)

**FIND:**
```html
              <div class="fg" style="grid-column:1/-1;"><label class="fl">Clinic Address</label><input class="fi" id="sAddress" placeholder="House, Road, Area, Dhaka"></div>
              <div class="fg" style="grid-column:1/-1;"><label class="fl">Bio (shown on public website)</label><textarea class="fta" id="sBio" rows="3" placeholder="Dr. Asma is a dedicated physician..."></textarea></div>
            </div>
          </div>
        </div>
```

**REPLACE WITH:**
```html
              <div class="fg" style="grid-column:1/-1;"><label class="fl">Clinic Address (Primary)</label><input class="fi" id="sAddress" placeholder="House, Road, Area, Dhaka"></div>
              <div class="fg" style="grid-column:1/-1;"><label class="fl">Bio (shown on public website)</label><textarea class="fta" id="sBio" rows="3" placeholder="Dr. Asma is a dedicated physician..."></textarea></div>
            </div>
          </div>
        </div>

        <div class="sec-card" style="margin-top:20px;">
          <div class="sec-card-hd"><h3>🏢 চেম্বারসমূহ (একাধিক যোগ করা যাবে)</h3></div>
          <div class="sec-body">
            <div id="chambersList" style="display:flex;flex-direction:column;gap:12px;margin-bottom:14px;"></div>
            <button class="btn btn-out btn-sm" onclick="addChamberRow()">+ Add Chamber</button>
          </div>
        </div>
```

---

## PATCH 5 — Settings: ডাক্তারের প্রোফাইল ছবি (ক্যামেরা/আপলোড, Photo URL টেক্সট ফিল্ডের জায়গায়)

**FIND:**
```html
                <div class="fg"><label class="fl">Photo URL (Google Drive)</label><input class="fi" id="sPhotoURL" placeholder="https://drive.google.com/..."></div>
              </div>
            </div>
          </div>
        </div>
      </div>
```

**REPLACE WITH:**
```html
                <div class="fg" style="grid-column:1/-1;">
                  <label class="fl">Profile Photo</label>
                  <div id="drPhotoZone" style="border:2px dashed rgba(232,96,138,0.4);border-radius:12px;padding:16px;text-align:center;cursor:pointer;background:rgba(232,96,138,0.03);display:flex;align-items:center;gap:14px;"
                       onclick="document.getElementById('drPhotoInput').click()">
                    <input type="file" id="drPhotoInput" accept="image/*" capture="environment" style="display:none;" onchange="handleDoctorPhotoSelect(this)">
                    <img id="drPhotoPreview" src="" alt="" style="width:56px;height:56px;border-radius:50%;object-fit:cover;display:none;background:var(--bg3);">
                    <div style="text-align:left;">
                      <strong style="font-size:13px;color:var(--wht);">📷 ক্লিক করে ক্যামেরা/গ্যালারি থেকে ছবি দিন</strong><br>
                      <span style="font-size:11px;color:var(--sil2);">অটোমেটিক আপলোড হয়ে যাবে, আলাদা সেভ লাগবে না</span>
                    </div>
                  </div>
                  <input type="hidden" id="sPhotoURL">
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
```

---

## PATCH 6 — Settings: External Finance App Sync + Drive Folder Overrides (নতুন কার্ড, Test Name Categories কার্ডের আগে)

**FIND:**
```html
      <div class="sec-card" style="margin-top:0;">
        <div class="sec-card-hd"><h3>🧪 Test Name Categories</h3></div>
```

**REPLACE WITH:**
```html
      <div class="g2" style="margin-bottom:20px;">
        <div class="sec-card">
          <div class="sec-card-hd"><h3>🔗 External Finance App Sync</h3></div>
          <div class="sec-body">
            <p style="font-size:12.5px;color:var(--sil);margin-bottom:14px;line-height:1.6;">
              ভবিষ্যতের Personal Finance App-কে এই সিস্টেমের সাথে কানেক্ট করতে
              নিচের <strong>Web App URL</strong> ও <strong>API Key</strong> কপি করে
              সেই অ্যাপের Settings-এ একবার বসান। এরপর প্রতিটা এন্ট্রি অটোমেটিক sync হবে।
            </p>
            <div class="fg">
              <label class="fl">External App Webhook URL (push করার জন্য — ঐচ্ছিক)</label>
              <input class="fi" id="extWebhookURL" placeholder="https://your-finance-app.com/webhook">
            </div>
            <div class="fg">
              <label class="fl">এই সিস্টেমের Web App URL (pull করার জন্য)</label>
              <div style="display:flex;gap:8px;">
                <input class="fi" id="extSystemURL" readonly style="flex:1;background:var(--bg3);">
                <button class="btn btn-out btn-sm" onclick="copyField('extSystemURL')">📋 Copy</button>
              </div>
            </div>
            <div class="fg">
              <label class="fl">Finance API Key</label>
              <div style="display:flex;gap:8px;">
                <input class="fi" id="extApiKey" readonly style="flex:1;background:var(--bg3);">
                <button class="btn btn-out btn-sm" onclick="copyField('extApiKey')">📋 Copy</button>
                <button class="btn btn-out btn-sm" onclick="regenerateApiKey()">🔄 Regenerate</button>
              </div>
            </div>
            <button class="btn btn-teal btn-sm" onclick="saveExternalFinanceSettings()">💾 Save Sync Settings</button>
            <div id="extSyncMsg" style="margin-top:10px;"></div>
          </div>
        </div>

        <div class="sec-card">
          <div class="sec-card-hd"><h3>📁 Drive Folder Overrides (ঐচ্ছিক)</h3></div>
          <div class="sec-body">
            <p style="font-size:12.5px;color:var(--sil);margin-bottom:14px;line-height:1.6;">
              খালি রাখলে সিস্টেম নিজে থেকেই ফোল্ডার তৈরি করে নেবে এবং তার ID এখানে
              অটোমেটিক এসে যাবে — একবার সেট হলে আর কিছু করতে হবে না।
            </p>
            <div class="fg"><label class="fl">Patient Files Folder ID</label><input class="fi" id="drvPatientFolder" placeholder="Auto-filled after first use"></div>
            <div class="fg"><label class="fl">Payment Proofs Folder ID</label><input class="fi" id="drvPaymentFolder" placeholder="Auto-filled after first use"></div>
            <div class="fg"><label class="fl">Doctor Profile Folder ID</label><input class="fi" id="drvProfileFolder" placeholder="Auto-filled after first use"></div>
            <button class="btn btn-teal btn-sm" onclick="saveDriveFolderSettings()">💾 Save Folder Settings</button>
            <div id="drvFolderMsg" style="margin-top:10px;"></div>
          </div>
        </div>
      </div>

      <div class="sec-card" style="margin-top:0;">
        <div class="sec-card-hd"><h3>🧪 Test Name Categories</h3></div>
```

---

## PATCH 7 — নতুন MODAL: Add Payment Entry (ক্যামেরা/স্ক্যান/আপলোড + প্রিভিউ)

`</body>` ট্যাগের ঠিক আগে, বিদ্যমান অন্য যেকোনো `<div class="modal-overlay" ...>` ব্লকের পরে এই নতুন ব্লকটা **যোগ করুন** (paste করুন, কিছু মুছবেন না):

```html
<!-- ══════════════════════════════
  MODAL: ADD PAYMENT / FINANCE ENTRY  (Part 6 + Part 8)
══════════════════════════════ -->
<div class="modal-overlay" id="paymentModal">
  <div class="modal">
    <div class="modal-hd">
      <h3>Add Finance Entry</h3>
      <button class="modal-close" onclick="closeModal('paymentModal')">✕</button>
    </div>
    <div class="modal-body">
      <div id="paymentModalMsg"></div>

      <div class="form-grid g2" style="margin-bottom:14px;">
        <div class="fg">
          <label class="fl">Type *</label>
          <select class="fs" id="mPayType">
            <option value="Income">Income</option>
            <option value="Expense">Expense</option>
          </select>
        </div>
        <div class="fg">
          <label class="fl">Category *</label>
          <select class="fs" id="mPayCategory"></select>
        </div>
        <div class="fg">
          <label class="fl">Patient ID (থাকলে)</label>
          <input class="fi" id="mPayPatientId" placeholder="PT-0001">
        </div>
        <div class="fg">
          <label class="fl">Amount (৳) *</label>
          <input class="fi" type="number" id="mPayAmount" placeholder="1500">
        </div>
        <div class="fg">
          <label class="fl">Payment Method</label>
          <select class="fs" id="mPayMethod">
            <option value="Cash">Cash</option>
            <option value="bKash">bKash</option>
            <option value="Nagad">Nagad</option>
            <option value="Card">Card</option>
            <option value="Bank Transfer">Bank Transfer</option>
          </select>
        </div>
        <div class="fg">
          <label class="fl">Date</label>
          <input class="fi" type="date" id="mPayDate">
        </div>
      </div>

      <div class="fg" style="margin-bottom:14px;">
        <label class="fl">Notes</label>
        <textarea class="fta" id="mPayNotes" rows="2"></textarea>
      </div>

      <!-- Payment Proof: camera / scan / upload -->
      <div class="fg" style="margin-bottom:14px;">
        <label class="fl">Payment Proof (ক্যামেরা / স্ক্যান / আপলোড) — ঐচ্ছিক</label>
        <div id="payUploadZone" style="
          border:2px dashed rgba(232,96,138,0.4);
          border-radius:12px; padding:22px;
          text-align:center; cursor:pointer;
          background:rgba(232,96,138,0.03);
        " onclick="document.getElementById('mPayFileInput').click()">
          <input type="file" id="mPayFileInput"
                 accept="image/*,.pdf" capture="environment"
                 style="display:none;"
                 onchange="handlePaymentFileSelect(this)">
          <div id="payUploadIcon" style="font-size:32px;margin-bottom:6px;">📷</div>
          <div id="payUploadText" style="font-size:13px;color:var(--sil);">
            <strong style="color:var(--wht);">ক্যামেরা দিয়ে তুলুন বা ফাইল আপলোড করুন</strong><br>
            <span style="font-size:11px;color:var(--sil2);">bKash/Nagad স্ক্রিনশট, ক্যাশ মেমো ছবি ইত্যাদি</span>
          </div>
          <div id="payFilePreviewWrap" style="display:none;margin-top:10px;">
            <img id="payFilePreview" style="max-width:100%;max-height:150px;border-radius:8px;object-fit:contain;" alt="Preview">
            <div style="margin-top:6px;font-size:12px;color:var(--sil2);" id="payFileName"></div>
          </div>
        </div>
      </div>

      <button class="btn btn-rose" id="paySaveBtn" style="width:100%;" onclick="savePaymentEntry()">
        💾 Save Finance Entry
      </button>
    </div>
  </div>
</div>
```

---

## PATCH 8 — JS: loadAll() এ Finance যোগ করা

**FIND:**
```js
function loadAll() {
  loadProfile();
  loadPatients();
  loadAppointments();
  loadTestRecords();
  loadSettings();
}
```

**REPLACE WITH:**
```js
function loadAll() {
  loadProfile();
  loadPatients();
  loadAppointments();
  loadTestRecords();
  loadSettings();
  if (_session && _session.role === 'DOCTOR') {
    loadFinance();
    loadExternalFinanceSettings();
    loadDriveFolderSettings();
  }
}
```

---

## PATCH 9 — JS: fillSettingsForm() ও saveSettings() আপডেট (Chambers + Photo)

**FIND:**
```js
function fillSettingsForm(p) {
  setVal('sDrName',    p.DoctorName     || '');
  setVal('sClinicName',p.ClinicName     || '');
  setVal('sSpecialty', p.Specialty      || '');
  setVal('sDegree',    p.Degree         || '');
  setVal('sPhone',     p.ContactPhone   || '');
  setVal('sEmail',     p.ContactEmail   || '');
  setVal('sAddress',   p.ClinicAddress  || '');
  setVal('sBio',       p.Bio            || '');
  setVal('sWorkingDays',p.WorkingDays   || 'Sat,Sun,Mon,Tue,Wed');
  setVal('sSlotDur',   p.SlotDuration   || '20');
  setVal('sOpenTime',  p.OpeningTime    || '09:00');
  setVal('sCloseTime', p.ClosingTime    || '20:00');
  setVal('sWebsiteURL',p.WebsiteURL     || '');
  setVal('sWaNumber',  p.WhatsAppNumber || '');
  setVal('sYearsExp',  p.YearsExperience|| '');
  setVal('sPhotoURL',  p.PhotoURL       || '');
}
```

**REPLACE WITH:**
```js
function fillSettingsForm(p) {
  setVal('sDrName',    p.DoctorName     || '');
  setVal('sClinicName',p.ClinicName     || '');
  setVal('sSpecialty', p.Specialty      || '');
  setVal('sDegree',    p.Degree         || '');
  setVal('sPhone',     p.ContactPhone   || '');
  setVal('sEmail',     p.ContactEmail   || '');
  setVal('sAddress',   p.ClinicAddress  || '');
  setVal('sBio',       p.Bio            || '');
  setVal('sWorkingDays',p.WorkingDays   || 'Sat,Sun,Mon,Tue,Wed');
  setVal('sSlotDur',   p.SlotDuration   || '20');
  setVal('sOpenTime',  p.OpeningTime    || '09:00');
  setVal('sCloseTime', p.ClosingTime    || '20:00');
  setVal('sWebsiteURL',p.WebsiteURL     || '');
  setVal('sWaNumber',  p.WhatsAppNumber || '');
  setVal('sYearsExp',  p.YearsExperience|| '');
  setVal('sPhotoURL',  p.PhotoURL       || '');

  // Photo preview
  var pv = document.getElementById('drPhotoPreview');
  if (pv && p.PhotoURL) { pv.src = p.PhotoURL; pv.style.display = 'inline-block'; }

  // Chambers (JSON array) — না থাকলে ১টা খালি রো দেখানো হবে
  var chambers = [];
  try { chambers = p.ChambersJSON ? JSON.parse(p.ChambersJSON) : []; } catch(e) { chambers = []; }
  if (!chambers.length) chambers = [{ name: '', address: '', time: '', serial: '' }];
  renderChambers(chambers);
}

// ═══════════════════════════════════════
// CHAMBERS (multi-chamber dynamic list)
// ═══════════════════════════════════════
function renderChambers(chambers) {
  var wrap = document.getElementById('chambersList');
  if (!wrap) return;
  wrap.innerHTML = '';
  chambers.forEach(function(ch, i) { wrap.appendChild(buildChamberRow(ch, i)); });
}

function buildChamberRow(ch, i) {
  var div = document.createElement('div');
  div.className = 'chamber-row';
  div.setAttribute('style', 'border:1px solid rgba(232,96,138,0.2);border-radius:10px;padding:12px;position:relative;');
  div.innerHTML =
    '<button type="button" onclick="this.closest(\'.chamber-row\').remove()" ' +
      'style="position:absolute;top:8px;right:8px;background:none;border:none;color:var(--sil2);cursor:pointer;font-size:16px;">✕</button>' +
    '<div class="form-grid g2">' +
      '<div class="fg"><label class="fl">Chamber Name</label><input class="fi ch-name" value="' + escAttr(ch.name||'') + '" placeholder="Chamber 1"></div>' +
      '<div class="fg"><label class="fl">Serial/Booking Info</label><input class="fi ch-serial" value="' + escAttr(ch.serial||'') + '" placeholder="Sl. 01-40"></div>' +
      '<div class="fg" style="grid-column:1/-1;"><label class="fl">Address</label><input class="fi ch-address" value="' + escAttr(ch.address||'') + '" placeholder="Full address"></div>' +
      '<div class="fg" style="grid-column:1/-1;"><label class="fl">Visiting Time</label><input class="fi ch-time" value="' + escAttr(ch.time||'') + '" placeholder="Sat/Mon/Wed — 6PM to 9PM"></div>' +
    '</div>';
  return div;
}

function addChamberRow() {
  var wrap = document.getElementById('chambersList');
  wrap.appendChild(buildChamberRow({ name:'', address:'', time:'', serial:'' }));
}

function collectChambers() {
  var rows = document.querySelectorAll('#chambersList .chamber-row');
  var out = [];
  rows.forEach(function(r) {
    var name = r.querySelector('.ch-name').value.trim();
    var address = r.querySelector('.ch-address').value.trim();
    var time = r.querySelector('.ch-time').value.trim();
    var serial = r.querySelector('.ch-serial').value.trim();
    if (name || address || time || serial) out.push({ name:name, address:address, time:time, serial:serial });
  });
  return out;
}

function escAttr(s) {
  return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
}
```

---

## PATCH 10 — JS: saveSettings() এ Chambers ও Photo যোগ

**FIND:**
```js
function saveSettings() {
  var data = {
    DoctorName:     getVal('sDrName'),
    ClinicName:     getVal('sClinicName'),
    Specialty:      getVal('sSpecialty'),
    Degree:         getVal('sDegree'),
    ContactPhone:   getVal('sPhone'),
    ContactEmail:   getVal('sEmail'),
    ClinicAddress:  getVal('sAddress'),
    Bio:            getVal('sBio'),
    WorkingDays:    getVal('sWorkingDays'),
    SlotDuration:   getVal('sSlotDur'),
    OpeningTime:    getVal('sOpenTime'),
    ClosingTime:    getVal('sCloseTime'),
    WebsiteURL:     getVal('sWebsiteURL'),
    WhatsAppNumber: getVal('sWaNumber'),
    YearsExperience:getVal('sYearsExp'),
    PhotoURL:       getVal('sPhotoURL')
  };
```

**REPLACE WITH:**
```js
function saveSettings() {
  var data = {
    DoctorName:     getVal('sDrName'),
    ClinicName:     getVal('sClinicName'),
    Specialty:      getVal('sSpecialty'),
    Degree:         getVal('sDegree'),
    ContactPhone:   getVal('sPhone'),
    ContactEmail:   getVal('sEmail'),
    ClinicAddress:  getVal('sAddress'),
    Bio:            getVal('sBio'),
    WorkingDays:    getVal('sWorkingDays'),
    SlotDuration:   getVal('sSlotDur'),
    OpeningTime:    getVal('sOpenTime'),
    ClosingTime:    getVal('sCloseTime'),
    WebsiteURL:     getVal('sWebsiteURL'),
    WhatsAppNumber: getVal('sWaNumber'),
    YearsExperience:getVal('sYearsExp'),
    PhotoURL:       getVal('sPhotoURL'),
    ChambersJSON:   JSON.stringify(collectChambers())
  };
```

*(এই ব্লকের ঠিক নিচে থাকা `call('saveDoctorProfile', ...)` অংশ অপরিবর্তিত থাকবে — কিছু বদলাতে হবে না।)*

---

## PATCH 11 — নতুন JS ব্লক (ফাইলের একদম শেষে, `</script>` এর ঠিক আগে যোগ করুন)

```js
// ═══════════════════════════════════════════════
// PART 8 — FINANCE TAB
// ═══════════════════════════════════════════════
var _payFile = null; // নির্বাচিত পেমেন্ট প্রুফ ফাইল (এখনো আপলোড হয়নি)

function loadFinance() {
  var start = getVal('finStart') || '';
  var end   = getVal('finEnd') || '';
  call('getFinanceEntries', [start, end], function(r) {
    if (!r || !r.success) return;
    D.finance = r.entries || [];
    renderFinanceEntries();
  });

  var now = new Date();
  call('getMonthlyFinanceSummary', [now.getFullYear(), now.getMonth() + 1], function(r) {
    if (!r || !r.success) return;
    document.getElementById('finIncome').textContent = '৳' + Math.round(r.totalIncome).toLocaleString();
    document.getElementById('finExpense').textContent = '৳' + Math.round(r.totalExpense).toLocaleString();
    document.getElementById('finNet').textContent = '৳' + Math.round(r.netProfit).toLocaleString();

    var failCount = r.failedSyncCount || 0;
    var pendCount = r.pendingSyncCount || 0;
    var sumEl = document.getElementById('finSyncSummary');
    var retryBtn = document.getElementById('finRetryBtn');
    var badge = document.getElementById('sb-sync-count');

    if (failCount > 0) {
      sumEl.innerHTML = '❌ ' + failCount + ' টা sync ব্যর্থ হয়েছে';
      sumEl.style.color = '#F87171';
      if (retryBtn) retryBtn.style.display = 'inline-flex';
      if (badge) { badge.style.display = 'inline-block'; badge.textContent = failCount; }
    } else if (pendCount > 0) {
      sumEl.innerHTML = '⏳ ' + pendCount + ' টা sync হচ্ছে...';
      sumEl.style.color = 'var(--warn)';
      if (retryBtn) retryBtn.style.display = 'none';
      if (badge) badge.style.display = 'none';
    } else {
      sumEl.innerHTML = '✅ সব sync হয়ে গেছে';
      sumEl.style.color = 'var(--ok)';
      if (retryBtn) retryBtn.style.display = 'none';
      if (badge) badge.style.display = 'none';
    }
  });

  // Category dropdown পপুলেট (Payment modal-এর জন্য, একবারই দরকার হলেও রিফ্রেশ safe)
  populatePaymentCategories();
}

function renderFinanceEntries() {
  var tbody = document.getElementById('financeTable');
  if (!tbody) return;
  if (!D.finance || !D.finance.length) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--sil2);padding:24px;">কোনো এন্ট্রি নেই।</td></tr>';
    return;
  }
  tbody.innerHTML = D.finance.map(function(e) {
    var dateStr = e.Date ? new Date(e.Date).toLocaleDateString('en-GB', {day:'2-digit',month:'short',year:'numeric'}) : '';
    var typeColor = e.Type === 'Income' ? 'var(--ok)' : '#F87171';
    var syncBadge = '';
    if (e.SyncStatus === 'Synced') syncBadge = '<span style="color:var(--ok);font-size:11px;">✅ Synced</span>';
    else if (e.SyncStatus === 'Failed') syncBadge = '<span style="color:#F87171;font-size:11px;cursor:pointer;" onclick="retryOneFinanceSync(\'' + e.EntryID + '\')">❌ Retry</span>';
    else if (e.SyncStatus === 'NotConfigured') syncBadge = '<span style="color:var(--sil2);font-size:11px;">— N/A</span>';
    else syncBadge = '<span style="color:var(--warn);font-size:11px;">⏳ Pending</span>';

    var proofBtn = e.PaymentProofURL
      ? '<button class="btn btn-out btn-sm" onclick="viewPaymentProof(\'' + extractFileId(e.PaymentProofURL) + '\')">🖼️</button>'
      : '<span style="color:var(--sil2);font-size:12px;">—</span>';

    return '<tr>' +
      '<td>' + dateStr + '</td>' +
      '<td style="color:' + typeColor + ';font-weight:600;">' + e.Type + '</td>' +
      '<td>' + (e.Category||'') + '</td>' +
      '<td>' + (e.PatientID||'—') + '</td>' +
      '<td style="font-weight:700;">৳' + Number(e.Amount||0).toLocaleString() + '</td>' +
      '<td>' + (e.PaymentMethod||'—') + '</td>' +
      '<td>' + proofBtn + '</td>' +
      '<td>' + syncBadge + '</td>' +
    '</tr>';
  }).join('');
}

function extractFileId(url) {
  var m = String(url).match(/[-\w]{25,}/);
  return m ? m[0] : '';
}

function viewPaymentProof(fileId) {
  if (!fileId) return;
  call('getPaymentProofImage', [fileId], function(r) {
    if (!r || !r.success) { showToast('ছবি লোড করা যায়নি।', 'err'); return; }
    var w = window.open('');
    w.document.write('<img src="data:' + r.mimeType + ';base64,' + r.base64 + '" style="max-width:100%;">');
  });
}

function populatePaymentCategories() {
  var sel = document.getElementById('mPayCategory');
  if (!sel) return;
  var cats = (D.categories||[]).filter(function(c){ return c.group === 'FinanceCategory' && c.active; });
  if (!cats.length) {
    sel.innerHTML = '<option value="Consultation Fee">Consultation Fee</option><option value="Other">Other</option>';
    return;
  }
  sel.innerHTML = cats.map(function(c){ return '<option value="' + c.value + '">' + c.value + '</option>'; }).join('');
}

function retryAllFinanceSync() {
  call('retryAllFailedFinanceSync', [], function(r) {
    if (r && r.success) {
      showToast(r.succeeded + '/' + r.retried + ' entries synced!', 'ok');
      loadFinance();
    }
  });
}

function retryOneFinanceSync(entryId) {
  call('retryFinanceSync', [entryId], function(r) {
    if (r && r.success) showToast('Synced!', 'ok'); else showToast('Sync failed: ' + (r.error||''), 'err');
    loadFinance();
  });
}

// ── Add Payment Modal ──
function openPaymentModal() {
  clearModal('paymentModal');
  _payFile = null;
  resetPayUploadZone();
  setVal('mPayDate', new Date().toISOString().split('T')[0]);
  populatePaymentCategories();
  openModal('paymentModal');
}

function handlePaymentFileSelect(input) {
  if (!input.files || !input.files[0]) return;
  var file = input.files[0];
  if (file.size > 10 * 1024 * 1024) { showAl('paymentModalMsg','err','ফাইল সাইজ ১০MB-এর কম হতে হবে।'); return; }
  _payFile = file;

  var zt = document.getElementById('payUploadText');
  var fp = document.getElementById('payFilePreviewWrap');
  var fn = document.getElementById('payFileName');
  if (zt) zt.style.display = 'none';
  if (fp) fp.style.display = 'block';
  if (fn) fn.textContent = file.name;

  if (file.type.indexOf('image') !== -1) {
    var reader = new FileReader();
    reader.onload = function(e) {
      document.getElementById('payFilePreview').src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
}

function resetPayUploadZone() {
  var zt = document.getElementById('payUploadText');
  var fp = document.getElementById('payFilePreviewWrap');
  if (zt) zt.style.display = 'block';
  if (fp) fp.style.display = 'none';
  var input = document.getElementById('mPayFileInput');
  if (input) input.value = '';
}

function savePaymentEntry() {
  var type     = getVal('mPayType');
  var category = getVal('mPayCategory');
  var amount   = getVal('mPayAmount');
  var patientId= getVal('mPayPatientId').trim();

  if (!category) { showAl('paymentModalMsg','err','Category বাছাই করুন।'); return; }
  if (!amount || isNaN(amount) || Number(amount) <= 0) { showAl('paymentModalMsg','err','সঠিক Amount দিন।'); return; }

  var btn = document.getElementById('paySaveBtn');
  if (btn) { btn.disabled = true; btn.innerHTML = '<span class="spin"></span> Saving...'; }

  var entryData = {
    type: type,
    category: category,
    patientId: patientId,
    amount: Number(amount),
    paymentMethod: getVal('mPayMethod'),
    date: getVal('mPayDate'),
    notes: getVal('mPayNotes')
  };

  call('addFinanceEntry', [entryData], function(r) {
    if (!r || !r.success) {
      if (btn) { btn.disabled = false; btn.innerHTML = '💾 Save Finance Entry'; }
      showAl('paymentModalMsg','err', (r&&r.message)||'সেভ ব্যর্থ হয়েছে।');
      return;
    }

    // যদি payment proof ফাইল দেওয়া থাকে, সেভ হওয়া entryId দিয়ে আপলোড করো
    if (_payFile) {
      var reader = new FileReader();
      reader.onload = function(e) {
        call('uploadPaymentProof', [e.target.result, _payFile.type, _payFile.name, patientId, r.entryId], function(ur) {
          if (btn) { btn.disabled = false; btn.innerHTML = '💾 Save Finance Entry'; }
          closeModal('paymentModal');
          showToast('Finance entry ও proof সেভ হয়েছে!', 'ok');
          loadFinance();
        });
      };
      reader.readAsDataURL(_payFile);
    } else {
      if (btn) { btn.disabled = false; btn.innerHTML = '💾 Save Finance Entry'; }
      closeModal('paymentModal');
      showToast('Finance entry সেভ হয়েছে!', 'ok');
      loadFinance();
    }
  });
}

// ═══════════════════════════════════════════════
// PART 8 — EXTERNAL FINANCE APP SYNC SETTINGS
// ═══════════════════════════════════════════════
function loadExternalFinanceSettings() {
  call('getExternalFinanceSettings', [], function(r) {
    if (!r || !r.success) return;
    setVal('extWebhookURL', r.webhookURL || '');
    setVal('extSystemURL', r.thisSystemWebAppURL || '');
    setVal('extApiKey', r.apiKey || '');
  });
}

function saveExternalFinanceSettings() {
  call('saveExternalFinanceSettings', [{ webhookURL: getVal('extWebhookURL') }], function(r) {
    if (r && r.success) { showAl('extSyncMsg','ok','✅ সেভ হয়েছে।'); showToast('Sync settings saved!', 'ok'); }
    else showAl('extSyncMsg','err', (r&&r.message)||'সেভ ব্যর্থ।');
  });
}

function regenerateApiKey() {
  if (!confirm('নতুন API Key জেনারেট করলে পুরনো Key দিয়ে External App আর ডেটা টানতে পারবে না। এগোতে চান?')) return;
  call('regenerateFinanceApiKey', [], function(r) {
    if (r && r.success) { setVal('extApiKey', r.apiKey); showToast('নতুন API Key তৈরি হয়েছে!', 'ok'); }
  });
}

function copyField(id) {
  var el = document.getElementById(id);
  if (!el) return;
  el.select(); el.setSelectionRange(0, 99999);
  document.execCommand('copy');
  showToast('কপি হয়েছে!', 'ok');
}

// ═══════════════════════════════════════════════
// PART 8 — DRIVE FOLDER OVERRIDES
// ═══════════════════════════════════════════════
function loadDriveFolderSettings() {
  call('getDriveFolderSettings', [], function(r) {
    if (!r || !r.success) return;
    setVal('drvPatientFolder', r.patientFilesFolderId || '');
    setVal('drvPaymentFolder', r.paymentProofsFolderId || '');
    setVal('drvProfileFolder', r.doctorProfileFolderId || '');
  });
}

function saveDriveFolderSettings() {
  var data = {
    patientFilesFolderId:  getVal('drvPatientFolder'),
    paymentProofsFolderId: getVal('drvPaymentFolder'),
    doctorProfileFolderId: getVal('drvProfileFolder')
  };
  call('saveDriveFolderSettings', [data], function(r) {
    if (r && r.success) { showAl('drvFolderMsg','ok','✅ সেভ হয়েছে।'); showToast('Folder settings saved!', 'ok'); }
    else showAl('drvFolderMsg','err', (r&&r.message)||'সেভ ব্যর্থ — Folder ID যাচাই করুন।');
  });
}

// ═══════════════════════════════════════════════
// PART 8 — DOCTOR PROFILE PHOTO (camera/upload → auto-upload)
// ═══════════════════════════════════════════════
function handleDoctorPhotoSelect(input) {
  if (!input.files || !input.files[0]) return;
  var file = input.files[0];
  if (file.size > 8 * 1024 * 1024) { showToast('ছবি ৮MB-এর কম হতে হবে।', 'err'); return; }

  var reader = new FileReader();
  reader.onload = function(e) {
    var pv = document.getElementById('drPhotoPreview');
    if (pv) { pv.src = e.target.result; pv.style.display = 'inline-block'; }

    call('uploadDoctorProfilePhoto', [e.target.result, file.type, file.name], function(r) {
      if (r && r.success) {
        setVal('sPhotoURL', r.photoUrl);
        showToast('প্রোফাইল ছবি আপডেট হয়েছে!', 'ok');
      } else {
        showToast((r&&r.message)||'ছবি আপলোড ব্যর্থ হয়েছে।', 'err');
      }
    });
  };
  reader.readAsDataURL(file);
}
```

---

## ✅ যা এখন অটোমেটিক কাজ করবে

1. **Finance এন্ট্রি** → Dashboard-এর Finance ট্যাবে সুন্দর প্রিভিউ (summary cards + entry table) দেখা যাবে।
2. প্রতিটা এন্ট্রি সেভ হওয়ার সাথে সাথে (Webhook URL সেট করা থাকলে) External Finance App-এ **push** হওয়ার চেষ্টা করবে; ব্যর্থ হলে "❌ Retry" বাটন দেখাবে, এন্ট্রি হারাবে না।
3. Settings-এ একবার Webhook URL / API Key সেভ করলেই তা Google Sheet-এ (Settings ট্যাব) স্থায়ীভাবে থেকে যাবে — নতুন ডিভাইস থেকে ড্যাশবোর্ডে লগইন করলেও একই সেটিংস দেখাবে, দ্বিতীয়বার বসাতে হবে না।
4. Drive Folder ID খালি রাখলে সিস্টেম নিজে ফোল্ডার বানিয়ে ID নিজে থেকেই Settings-এ সেভ করে নেবে (self-healing, no manual step)।
5. Payment Proof ক্যামেরা/স্ক্যান/আপলোড — patient-এর নিজের ফোল্ডারেও কপি থাকবে, কেন্দ্রীয় মাস-ভিত্তিক ফোল্ডারেও কপি থাকবে, দুটোই **প্রাইভেট** (কোনো পাবলিক লিংক শেয়ার হয় না)।
6. ডাক্তারের প্রোফাইল ছবি ক্যামেরা/আপলোড দিলেই অটোমেটিক Drive-এ নিজের ফোল্ডারে সেভ হয়ে, পাবলিক ওয়েবসাইটে সঠিকভাবে দেখা যাবে (আগের বাগ ফিক্সসহ)।
7. একাধিক চেম্বার — Settings ট্যাবে "+ Add Chamber" দিয়ে যত খুশি চেম্বার যোগ/মুছা যাবে, JSON আকারে সেভ হবে।
