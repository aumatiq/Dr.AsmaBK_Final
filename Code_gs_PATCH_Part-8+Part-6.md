# Code.gs — PATCH (Part 6+8 Finance/Settings/API)

কোনো কোড মুছবে না। নিচের ৩টা জায়গায় শুধু Find করে ঠিক ওই যায়গাটায় Replace/Insert করুন।

---

## PATCH 1 — doGet() এ নতুন API route যোগ (External Finance App PULL endpoint)

**FIND (Code.gs, `function doGet(e) {` এর ভেতরে, `params.file === 'manifest-dashboard'` ব্লকের ঠিক নিচে):**

```js
  if (params.file === 'manifest-dashboard') {
    return ContentService.createTextOutput(JSON.stringify(getDashboardManifestJson_()))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // ── FIX: "page" এবং পুরনো "view" — দুটো parameter নামই এখন কাজ করবে ──
  var page = params.page || params.view || 'home';
```

**REPLACE WITH:**

```js
  if (params.file === 'manifest-dashboard') {
    return ContentService.createTextOutput(JSON.stringify(getDashboardManifestJson_()))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // ── Part 8: External Personal Finance App — PULL API (apiKey দিয়ে যাচাই, session লাগে না) ──
  // Usage: <WebAppURL>?action=financeExport&apiKey=XXXX&start=2026-01-01&end=2026-12-31
  if (params.action === 'financeExport') {
    return handleFinanceExportApi_(params);
  }

  // ── FIX: "page" এবং পুরনো "view" — দুটো parameter নামই এখন কাজ করবে ──
  var page = params.page || params.view || 'home';
```

---

## PATCH 2 — setupFinanceTab() migration-safe করা (নতুন শীট বানানোর সময়েও নতুন কলামগুলো থাকবে)

**FIND:**

```js
function setupFinanceTab(sheet, categoriesSheet) {
  const headers = ["EntryID", "Date", "Type", "Category", "PatientID", "Amount", "Notes"];
```

**REPLACE WITH:**

```js
function setupFinanceTab(sheet, categoriesSheet) {
  const headers = [
    "EntryID", "Date", "Type", "Category", "PatientID", "Amount", "Notes",
    "PaymentMethod", "PaymentProofURL", "PaymentProofPatientCopyURL",
    "Source", "CreatedAt", "SyncStatus", "LastSyncAttempt", "LastSyncError"
  ];
```

> ℹ️ পুরনো শীট যেগুলো আগেই তৈরি হয়ে গেছে, সেগুলোর জন্য কিছু করতে হবে না —
> `AppointmentFinance.gs`-এর `ensureFinanceSchema_()` ফাংশনটা **প্রতিবার** কোনো
> Finance ফাংশন কল হলে (addFinanceEntry / getFinanceEntries ইত্যাদি) নিজে থেকেই
> চেক করে নেয় এবং মিসিং কলাম থাকলে নিঃশব্দে ডানপাশে যোগ করে দেয়। কোনো ডেটা
/  মুছবে না।

---

## PATCH 3 — setupSettingsTab() এ নতুন ফিল্ড যোগ

**FIND:**

```js
    ["OpeningTime", "09:00"],
    ["ClosingTime", "20:00"],
  ];

  sheet.getRange(1, 1, fields.length, 2).setValues(fields);
  sheet.getRange(1, 1, fields.length, 1).setFontWeight("bold").setBackground("#F3F1FB");
  sheet.autoResizeColumns(1, 2);
}
```

**REPLACE WITH:**

```js
    ["OpeningTime", "09:00"],
    ["ClosingTime", "20:00"],
    // ── Part 8: External Finance App sync + Drive folder overrides ──
    ["ExternalFinanceAppWebhookURL", ""],
    ["FinanceApiKey", ""],               // প্রথম Settings লোডেই auto-generate হবে
    ["DriveFolderID_PatientFiles", ""],
    ["DriveFolderID_PaymentProofs", ""],
    ["DriveFolderID_DoctorProfile", ""],
  ];

  sheet.getRange(1, 1, fields.length, 2).setValues(fields);
  sheet.getRange(1, 1, fields.length, 1).setFontWeight("bold").setBackground("#F3F1FB");
  sheet.autoResizeColumns(1, 2);
}
```

> এটাও শুধু **নতুন স্প্রেডশিট তৈরি হওয়ার সময়ের জন্য** — পুরনো Settings শীটে
> `ensureSettingsSchema_()` অটোমেটিক এই ফিল্ডগুলো (এবং API Key) যোগ করে দেবে,
> প্রথমবার Settings ট্যাব খুললেই।

---

## PATCH 4 — DashboardAdapter.gs → saveDoctorProfile() এ Chambers ফিল্ড যোগ

**FIND (DashboardAdapter.gs):**

```js
  const profileFields = [
    "DoctorName", "ClinicName", "Specialty", "Degree", "ContactPhone",
    "ContactEmail", "ClinicAddress", "Bio", "WebsiteURL", "WhatsAppNumber",
    "YearsExperience", "PhotoURL"
  ];
```

**REPLACE WITH:**

```js
  const profileFields = [
    "DoctorName", "ClinicName", "Specialty", "Degree", "ContactPhone",
    "ContactEmail", "ClinicAddress", "Bio", "WebsiteURL", "WhatsAppNumber",
    "YearsExperience", "PhotoURL",
    "ChambersJSON"   // ── Part 8: একাধিক চেম্বার — JSON array হিসেবে সেভ হয় ──
  ];
```

এতেই যথেষ্ট — `getDoctorProfile()` (Code.gs) সব Field/Value রো নিজে থেকেই রিটার্ন
করে (কোনো allow-list নেই), তাই `ChambersJSON` অটোমেটিক Dashboard ও ভবিষ্যতে
Public Website দুই জায়গাতেই পৌঁছে যাবে।

---

## ✅ যাচাই করা হয়েছে (কোনো প্যাচ লাগবে না)

Settings/Profile পরিবর্তন সাথে সাথে Public Website-এ দেখা যায় কিনা — **যাচাই করে
দেখা হয়েছে এটা ইতিমধ্যেই সঠিকভাবে কাজ করে**:
- `PublicWebsite.html` প্রতিবার পেজ লোডে `google.script.run.getDoctorProfile()`
  কল করে (কোনো caching নেই — `CacheService`/`PropertiesService` শুধু Auth.gs-এ
  session token-এর জন্য ব্যবহার হয়, Profile/Settings ডেটার জন্য না)।
- তাই Settings ট্যাব থেকে সেভ করলেই তা সাথে সাথে ওয়েবসাইটে প্রতিফলিত হবে।
  আলাদা কোনো "sync" বাটন/ফিক্সের দরকার নেই।

**একটা প্রি-এক্সিস্টিং বাগ ঠিক করা হয়েছে:** আগে `PhotoURL`-এ Drive-এর raw
"view" লিংক (`.../file/d/ID/view`) সেভ হতো, যেটা `<img src>`-এ সরাসরি রেন্ডার
হয় না। এখন `uploadDoctorProfilePhoto()` একটা embeddable
`https://drive.google.com/thumbnail?id=...` লিংক জেনারেট করে সেভ করে, যেটা
ওয়েবসাইটে ছবি হিসেবে সঠিকভাবে দেখাবে।
