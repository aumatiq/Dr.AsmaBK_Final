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

## ধাপ ৬ — Two-URL Subdomain Setup (Part 11, GitHub Pages, সম্পূর্ণ ফ্রি)

**⚠️ Vercel hub deprecated:** আগে একটা Vercel-hosted hub পেজ (দুই বাটন
— Patient/Doctor) ছিল (`VERCEL_DEPLOY_GUIDE.md` দ্রষ্টব্য)। এখন থেকে
সেটা আর ব্যবহার হবে না — GitHub Pages দিয়ে দুইটা আলাদা, পরিষ্কার
সাবডোমেইন-ই primary। কারণ (ক) সম্পূর্ণ ফ্রি, কোনো Vercel অ্যাকাউন্ট
লাগবে না, (খ) রোগী ও স্টাফ প্রতিটা নিজের URL সরাসরি খুলবে — কোনো
বাটনে ক্লিক করে বাছাই করতে হবে না, instant redirect হয়ে যাবে।
`VERCEL_DEPLOY_GUIDE.md` ফাইলটা মুছে ফেলা হয়নি (রেফারেন্স/rollback
হিসেবে থাকল), কিন্তু আর অনুসরণ করার দরকার নেই।

### আর্কিটেকচার (দুইটা আলাদা GitHub repo, দুইটা আলাদা GitHub Pages সাইট)

GitHub Pages প্রতি repo-তে একটাই custom domain সাপোর্ট করে, তাই দুইটা
সাবডোমেইনের জন্য দুইটা আলাদা ছোট repo লাগবে:

| সাবডোমেইন | কার জন্য | Repo | রিডাইরেক্ট করে যেখানে |
|---|---|---|---|
| `drasma.aumatiq.com` | রোগী (public) | `aumatiq/DA-P3WD-Pink-SkyBlue` (এই repo-র root `index.html`) | Public Website exec URL |
| `admin.drasma.aumatiq.com` | স্টাফ/ডাক্তার (private) | নতুন repo: `aumatiq/DA-P3WD-Pink-SkyBlue-Admin` | Dashboard exec URL (`?page=dashboard`) |

দুইটা পেজই **instant auto-redirect** — খুললেই AK মনোগ্রাম + স্পিনার
এক ঝলক দেখিয়ে সাথে সাথে আসল Apps Script URL-এ নিয়ে যায় (কোনো ক্লিক
লাগে না)। JS বন্ধ থাকলেও `<meta http-equiv="refresh">` fallback কাজ
করবে।

### ৬.১ — Repo ১: এই repo-র root `index.html` (রোগী)

ইতিমধ্যে আপডেট করা হয়ে গেছে — নতুন করে কিছু করার নেই, শুধু commit+push
করলেই হবে (নিচে ধাপ ৬.৩ দেখো)। `CNAME` ফাইলে ইতিমধ্যেই
`drasma.aumatiq.com` সেট করা আছে।

### ৬.২ — Repo ২: নতুন repo বানানো (স্টাফ)

1. GitHub-এ নতুন **private** repo বানাও: `DA-P3WD-Pink-SkyBlue-Admin`
   (Organization: `aumatiq`)
2. এই দুইটা ফাইল সেই repo-র root-এ push করো (দুটোই এই ডেলিভারিতে
   সম্পূর্ণ দেওয়া আছে):
   - `index.html`
   - `CNAME` (ভেতরে শুধু একলাইন: `admin.drasma.aumatiq.com`)
3. GitHub repo → **Settings → Pages**:
   - Source: `Deploy from a branch`
   - Branch: `main` / root (`/`)
   - Custom domain বক্সে টাইপ করো: `admin.drasma.aumatiq.com` → Save
   - DNS ঠিকমতো propagate হলে **"Enforce HTTPS"** চেকবক্স অন করো
     (প্রথমবার কয়েক মিনিট থেকে কয়েক ঘণ্টা সময় লাগতে পারে)

একই ধাপ (Settings → Pages → Custom domain) মূল repo-তেও (root
`index.html`-এর জন্য) চেক করে নাও `drasma.aumatiq.com` সেট আছে এবং
"Enforce HTTPS" অন আছে কিনা।

### ৬.৩ — GitHub Desktop দিয়ে push (টার্মিনাল লাগবে না)

- **Repo ১ (root, রোগী):** GitHub Desktop-এ এই repo খুলে commit করো —
  `feat: instant auto-redirect landing page for drasma.aumatiq.com — Part 11`
  → Push origin
- **Repo ২ (নতুন, স্টাফ):** GitHub Desktop → "Add local repository" →
  নতুন ফোল্ডার সিলেক্ট করো যেখানে `index.html` + `CNAME` রাখা আছে →
  "Publish repository" (private রেখে) → commit বার্তা:
  `feat: instant auto-redirect landing page for admin.drasma.aumatiq.com — Part 11`

### ৬.৪ — Hostinger hPanel-এ DNS সেটআপ (ধাপে ধাপে, বাংলা)

Hostinger-এ `aumatiq.com` ডোমেইনের DNS জোনে দুইটা CNAME রেকর্ড লাগবে
(দুটোই একই টার্গেটে যাবে, কারণ GitHub Pages `Host` হেডার দেখে বুঝে নেয়
কোন repo-র সাইট দেখাতে হবে):

1. **hPanel লগইন করো** → বামের মেনু থেকে **Domains** → `aumatiq.com`
   সিলেক্ট করো → **DNS / Nameservers** ট্যাবে যাও
2. **প্রথম রেকর্ড (রোগীর জন্য — যদি আগে থেকে করা না থাকে, ভেরিফাই করো):**
   - Type: `CNAME`
   - Name/Host: `drasma`
   - Points to/Target: `aumatiq.github.io`
   - TTL: ডিফল্ট রেখে দাও (সাধারণত 14400 বা Auto)
   - Save/Add Record চাপো
3. **দ্বিতীয় রেকর্ড (স্টাফের জন্য — নতুন যোগ করো):**
   - Type: `CNAME`
   - Name/Host: `admin.drasma`  *(hPanel অনেক সময় শুধু সাব-পার্টটাই চায়
     — পুরো `admin.drasma.aumatiq.com` লিখলেও কাজ করবে, ইন্টারফেস
     অনুযায়ী adjust করো)*
   - Points to/Target: `aumatiq.github.io`
   - TTL: ডিফল্ট
   - Save/Add Record চাপো
4. পুরনো কোনো `A` রেকর্ড `drasma` বা `admin.drasma`-এর জন্য থেকে থাকলে
   সেটা **মুছে ফেলো** (CNAME আর A রেকর্ড একসাথে একই নামের জন্য থাকতে
   পারে না — conflict হবে)
5. **DNS propagate হতে সাধারণত ৫ মিনিট–২৪ ঘণ্টা লাগে** (বেশিরভাগ সময়
   Hostinger-এ ১৫-৩০ মিনিটের মধ্যেই হয়ে যায়)। টেস্ট করার জন্য
   [dnschecker.org](https://dnschecker.org)-এ গিয়ে `admin.drasma.aumatiq.com`
   টাইপ করে CNAME propagation চেক করতে পারো
6. DNS propagate হয়ে গেলে GitHub repo-র Pages সেটিংসে ফিরে গিয়ে
   "Enforce HTTPS" চেকবক্সটা অন করে দাও (ধাপ ৬.২-এ বলা হয়েছে) — এটা
   ছাড়া `https://` কাজ করবে না।

### ৬.৫ — টেস্ট করা

- `https://drasma.aumatiq.com` খুলে দেখো — ~০.১৫ সেকেন্ডের মধ্যে রোজ
  পিংক লোগো ফ্ল্যাশ হয়ে Public Website-এ নিয়ে যাবে
- `https://admin.drasma.aumatiq.com` খুলে দেখো — একইভাবে Doctor
  Dashboard-এ নিয়ে যাবে (লগইন পেজ দেখবে, যেহেতু session না থাকলে
  Auth.gs গার্ড করবে)
- দুইটা URL-ই Google-এ সার্চ করে দেখো — `admin.drasma.aumatiq.com`
  ইনডেক্স **হবে না** (`noindex, nofollow` মেটা ট্যাগ আছে বলে), এটাই
  কাম্য (Part 17 security rule)

---

## ক্লায়েন্টকে (Dr. Asma-কে) যা দেবে

এখন থেকে raw Apps Script লিংকের বদলে দুইটা পরিষ্কার, প্রফেশনাল
সাবডোমেইন — কোনো টেকনিক্যাল ব্যাখ্যা লাগবে না:

**📱 রোগীদের জন্য শেয়ার করার লিংক (ওয়েবসাইট/ভিজিটিং কার্ড/QR-এ ব্যবহার
করো):**
`https://drasma.aumatiq.com`

**🔒 ডাক্তার/স্টাফের জন্য (আলাদা রাখো, পাবলিকলি শেয়ার করো না):**
`https://admin.drasma.aumatiq.com`

*(আসল Apps Script `.../exec` লিংকদুটো এখন শুধু ভেতরের রিডাইরেক্ট
টার্গেট হিসেবে থাকবে, ক্লায়েন্টকে সরাসরি দেওয়ার দরকার নেই।)*

**Install করার নির্দেশ (এক লাইনে ক্লায়েন্টকে পাঠানোর জন্য):**
> লিংকটা খুলে Chrome-এর ⋮ মেনু থেকে "Add to Home screen" চাপুন —
> iPhone-এ Safari-তে Share বাটন থেকে "Add to Home Screen" চাপুন।
> এরপর ফোনের হোম স্ক্রিনে একটা সাধারণ অ্যাপের মতো আইকন চলে আসবে।
>
> *(লক্ষ্য করো: install prompt/manifest আসল Apps Script পেজেই আছে —
> redirect পেজটা এত দ্রুত সরে যায় যে সেখানে install করার দরকার নেই,
> এটা শুধু একটা পরিষ্কার URL হিসেবে কাজ করে। PWA install experience-এর
> পূর্ণাঙ্গ অডিট হবে Part 13-এ।)*

---

## সারসংক্ষেপ — কী কী বদলাল, কী কী বদলায়নি

| | |
|---|---|
| ✅ নতুন | `PWASetup.gs`, `.clasp.json`, `.claspignore`, `.github/workflows/deploy.yml` |
| ✏️ বদলানো | `Code.gs`-এর শুধু `doGet()` ফাংশন, দুই HTML ফাইলের শুধু `<head>` অংশ |
| ⛔ অক্ষত | Auth.gs, PatientModule.gs, AppointmentFinance.gs, Prescription.gs, DashboardAdapter.gs, Sheets ডেটাবেস, সব existing business logic |
