# AUMATIQ — Dr. Asma Clinic System: GitHub + PWA Setup গাইড

**Repo:** `aumatiq/DA-P3WD-SkyBlue`
**Path:** Path A — Apps Script-ই আসল হোস্ট থাকবে, GitHub হবে কোড ব্যাকআপ + automation trigger

---

## এক নজরে পুরো আর্কিটেকচার

```
                    ┌─────────────────────────────────────┐
                    │   GitHub repo: DA-P3WD-SkyBlue        │
                    │   (কোড ব্যাকআপ + version history)      │
                    └───────────────┬───────────────────────┘
                                    │ push হলে GitHub Action
                                    │ অটোমেটিক clasp দিয়ে deploy করে
                                    ▼
                    ┌─────────────────────────────────────┐
                    │   Google Apps Script (আসল হোস্ট)       │
                    │   Google Sheets = Database             │
                    └───────────────┬───────────────────────┘
                                    │
                 ┌──────────────────┴──────────────────┐
                 ▼                                      ▼
   PUBLIC WEBSITE (PWA #1)                DOCTOR DASHBOARD (PWA #2)
   .../exec                               .../exec?page=dashboard
   Patient-facing, installable            Staff-facing, installable
   আলাদা app icon + নাম                    আলাদা app icon + নাম
```

**দুইটা "সাইট" আসলে একই Apps Script deployment-এর দুইটা ভিন্ন view** —
আলাদা কোনো হোস্টিং লাগে না। URL-এর `?page=` parameter দিয়ে কোনটা দেখাবে
সেটা ঠিক হয়। দুটোই আলাদা manifest.json রাখায় ফোনে "Add to Home Screen"
করলে দুটো আলাদা app icon বসবে (একটা রোগীর জন্য, একটা ডাক্তার/স্টাফের জন্য)।

---

## ধাপ ১ — Repo-টা GitHub থেকে ঠিকমতো ভরে নেওয়া (clasp দিয়ে)

তোমার বর্তমান repo-তে যা আছে তা হলো: Code.gs, Auth.gs, PatientModule.gs,
AppointmentFinance.gs, Prescription.gs, DashboardAdapter.gs,
PublicWebsite.html, DoctorDashboard.html, icons, README, DB info। কিন্তু
**`appsscript.json` (Apps Script project manifest) repo-তে নেই** — এটা
লাইভ প্রজেক্টে নিশ্চয়ই আছে, শুধু GitHub-এ ব্যাকআপ করা হয়নি এখনো।

এটা ঠিক করার সবচেয়ে নিরাপদ উপায় হলো `clasp` (Google-এর অফিসিয়াল
command-line টুল) দিয়ে **সরাসরি লাইভ Apps Script প্রজেক্ট থেকে সব ফাইল
টেনে আনা** — নিজে হাতে না লিখে, যাতে কিছু miss না হয় বা ভুল না হয়।

### এক-বারের সেটআপ (টার্মিনাল লাগবে, একবারই করতে হবে)

কম্পিউটারে Node.js ইনস্টল থাকতে হবে (না থাকলে nodejs.org থেকে ইনস্টল
করে নাও — বিনামূল্যে)।

```bash
# ১. clasp ইনস্টল করো (একবারই)
npm install -g @google/clasp

# ২. Google account দিয়ে login করো (ব্রাউজার খুলবে)
clasp login

# ৩. Apps Script প্রজেক্টের Script ID বের করো:
#    script.google.com এ প্রজেক্ট খোলো → বাম পাশে ⚙️ Project Settings
#    → "Script ID" কপি করো (এটা deployment ID থেকে আলাদা জিনিস)

# ৪. লাইভ প্রজেক্ট থেকে সব ফাইল টেনে আনো:
clasp clone "PASTE_SCRIPT_ID_HERE" --rootDir ./DA-P3WD-SkyBlue
cd DA-P3WD-SkyBlue
```

এতে করে `appsscript.json` সহ **সব ফাইল হুবহু লাইভ প্রজেক্ট থেকে** নেমে
আসবে — কোনো কিছু নিজে টাইপ করে ভুল করার সুযোগ থাকবে না।

---

## ধাপ ২ — GitHub repo-র সাথে merge করা

```bash
git clone https://github.com/aumatiq/DA-P3WD-SkyBlue.git
# clasp clone করা ফাইলগুলো এই GitHub folder-এর ভেতরে কপি করে বসাও
# (appsscript.json সহ)
```

---

## ধাপ ৩ — PWA প্যাচ ৩টা লাগানো (আমি বানিয়ে দিয়েছি, শুধু paste করবে)

এই ৩টা কাজ কর, ক্রমানুসারে:

1. **নতুন ফাইল যোগ করো:** `PWASetup.gs` (আমার দেওয়া ফাইলটা হুবহু কপি করে
   folder-এ রাখো — Apps Script Editor-এ ম্যানুয়ালি করলে "+"→Script→
   নাম দাও `PWASetup`)
2. **Code.gs-এর `doGet()` ফাংশন বদলাও** — `Code_gs_REPLACE_doGet.txt`-এ
   দেওয়া নির্দেশনা মেনে পুরনো ফাংশন মুছে নতুনটা বসাও
3. **দুইটা HTML হেড প্যাচ করো:**
   - `PublicWebsite_HEAD_PATCH.txt` অনুযায়ী `PublicWebsite.html`-এর
     ৪ লাইন বদলাও
   - `DoctorDashboard_HEAD_PATCH.txt` অনুযায়ী `DoctorDashboard.html`-এ
     নতুন লাইনগুলো যোগ করো

**এই ৩টা কাজ Auth.gs, PatientModule.gs, AppointmentFinance.gs,
Prescription.gs, DashboardAdapter.gs — এই ফাইলগুলোর একটাতেও হাত দেয় না।
কোনো existing feature ভাঙবে না।**

---

## ধাপ ৪ — GitHub-এ automation ফাইল বসানো (ভবিষ্যতে অটো-ডিপ্লয়ের জন্য)

আমার দেওয়া এই ৩টা ফাইল repo-র রুটে বসাও:
- `.clasp.json` (ভেতরে নিজের Script ID বসিয়ে দাও)
- `.claspignore`
- `.github/workflows/deploy.yml`

তারপর GitHub repo-র **Settings → Secrets and variables → Actions →
New repository secret** এ গিয়ে ২টা secret বানাও:

| Secret নাম | মান কী হবে |
|---|---|
| `DEPLOYMENT_ID` | `AKfycbzkMBKWDavE2ZKIIsufc_N5Kwi6X-eow-Erz9lj9fgOjTuZPeRdkLFRjIOaqYZyT25Q1g` (তোমার `DrAsma_DB_INFO_URL.txt`-এ থাকা exec URL থেকে নেওয়া — Apps Script এডিটরে Deploy → Manage deployments-এ গিয়ে একবার মিলিয়ে নাও এটাই এখনো active আছে কিনা) |
| `CLASPRC_JSON` | টার্মিনালে `clasp login` করার পর তৈরি হওয়া `~/.clasprc.json` ফাইলের পুরো ভেতরের লেখা (Mac/Linux: `cat ~/.clasprc.json`, Windows: `type %USERPROFILE%\.clasprc.json`) — পুরোটা কপি করে secret-এ paste করো |

এরপর থেকে **তুমি শুধু GitHub Desktop দিয়ে commit + push করলেই**,
GitHub Action নিজে থেকে:
1. কোড Apps Script-এ push করবে (`clasp push`)
2. লাইভ `/exec` URL-এ নতুন ভার্সন ডিপ্লয় করবে (`clasp deploy`)

কোনো manual Apps Script editor-এ গিয়ে "Deploy" চাপার দরকার থাকবে না।

---

## ধাপ ৫ — টেস্ট করা

- **Public site:** `.../exec` খোলো → Chrome address bar-এ install ⊕ icon
  দেখা যাবে (ডেস্কটপ), মোবাইলে Chrome-এর ⋮ মেনুতে "Add to Home screen"
- **Dashboard:** `.../exec?page=dashboard` খোলো → একই রকম install অপশন,
  কিন্তু আলাদা icon/নাম (gold theme রঙে)
- DevTools → Application → Manifest ট্যাবে গিয়ে দুটো manifest-ই ঠিকভাবে
  parse হচ্ছে কিনা চেক করে নাও

**সার্ভিস ওয়ার্কার নেই কেন?** Apps Script-এর `/exec` URL সবসময়
redirect করে (script.googleusercontent.com-এ), আর ব্রাউজারের নিয়ম
অনুযায়ী redirected script দিয়ে service worker register করা যায় না।
এটা এড়িয়ে গেছি — আধুনিক Chrome/Edge-এ install prompt-এর জন্য এখন আর
service worker বাধ্যতামূলক না (শুধু manifest + icons + HTTPS লাগে), আর
এই সিস্টেম যেহেতু সবসময় লাইভ Google Sheets ডেটার উপর নির্ভর করে, অফলাইন
ক্যাশিং এমনিতেও কাজে লাগবে না।

---

## ক্লায়েন্টকে (Dr. Asma-কে) যা দেবে

দুইটা লিংক শুধু — কোনো টেকনিক্যাল ব্যাখ্যা লাগবে না:

**📱 রোগীদের জন্য শেয়ার করার লিংক:**
`https://script.google.com/macros/s/AKfycbzkMBKWDavE2ZKIIsufc_N5Kwi6X-eow-Erz9lj9fgOjTuZPeRdkLFRjIOaqYZyT25Q1g/exec`

**🔒 ডাক্তার/স্টাফের জন্য (আলাদা রাখো, শেয়ার করো না):**
`https://script.google.com/macros/s/AKfycbzkMBKWDavE2ZKIIsufc_N5Kwi6X-eow-Erz9lj9fgOjTuZPeRdkLFRjIOaqYZyT25Q1g/exec?page=dashboard`

**Install করার নির্দেশ (এক লাইনে ক্লায়েন্টকে পাঠানোর জন্য):**
> লিংকটা খুলে Chrome-এর ⋮ মেনু থেকে "Add to Home screen" চাপুন —
> iPhone-এ Safari-তে Share বাটন থেকে "Add to Home Screen" চাপুন।
> এরপর ফোনের হোম স্ক্রিনে একটা সাধারণ অ্যাপের মতো আইকন চলে আসবে।

---

## সারসংক্ষেপ — কী কী বদলাল, কী কী বদলায়নি

| | |
|---|---|
| ✅ নতুন | `PWASetup.gs`, `.clasp.json`, `.claspignore`, `.github/workflows/deploy.yml` |
| ✏️ বদলানো | `Code.gs`-এর শুধু `doGet()` ফাংশন, দুই HTML ফাইলের শুধু `<head>` অংশ |
| ⛔ অক্ষত | Auth.gs, PatientModule.gs, AppointmentFinance.gs, Prescription.gs, DashboardAdapter.gs, Sheets ডেটাবেস, সব existing business logic |
