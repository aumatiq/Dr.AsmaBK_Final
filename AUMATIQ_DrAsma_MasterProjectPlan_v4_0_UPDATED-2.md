# AUMATIQ — Dr. Asma Doctor Automation System
## MASTER PROJECT PLAN — v4.0 (একক সোর্স-অফ-ট্রুথ, self-contained onboarding doc)

**তৈরি হয়েছে:** 2026-07-12, live repo clone + full code audit-এর ভিত্তিতে (v3.0-এর stale claim গুলো এই audit দিয়ে ঠিক করা হয়েছে)
**রিপ্লেস করে:** `AUMATIQ_DrAsma_MasterProjectPlan-Up_Part-14.md` (পুরনো ফাইলে duplicate "Part 14" naming clash ছিল — নিচে ব্যাখ্যা আছে)

---

## 🎯 এই ডকুমেন্ট কীভাবে কাজ করে (একবার পড়ে নাও)

এই একটা ফাইলই যথেষ্ট — যেকোনো নতুন চ্যাটে এই পুরো ফাইলটা paste করে শুধু বলবে **"Part X কর"** বা **"পরবর্তী কাজ কর"**, Claude নিজে থেকেই বাকি সব বের করে নেবে। এর জন্য প্রতিটা Part স্বয়ংসম্পূর্ণ prompt হিসেবে লেখা — আলাদা কোনো context লাগবে না।

**কেন আগের ফাইলে সমস্যা ছিল:** পুরনো মাস্টার প্ল্যানে "PART 14" নামে দুইটা আলাদা section ছিল (একটা original spec, একটা পরে session-log হিসেবে যোগ করা "Full System Build & Bugfix Pass") — এটা future confusion তৈরি করত। এই v4.0-এ প্রতিটা Part-এর নম্বর ইউনিক এবং Execution Order-এই sequential। পুরনো Part 1-13, 16-19 এর spec/prompt content অপরিবর্তিত আছে (নিচে অংশ ৩-এ, reference হিসেবে রাখা হলো) — শুধু status ও bug-list আপডেট হয়েছে এবং নতুন Part 20-23 যোগ হয়েছে বাকি কাজের জন্য।

</br>

---

## 🔒 ইউনিভার্সাল প্রোটোকল — যেকোনো Part শুরুর আগে অবশ্যই করতে হবে

Claude-কে (নতুন session-এও) নিচের ধাপগুলো **প্রতিবার** করতে হবে, ধরে নেওয়া চলবে না যে আগের session-এর অবস্থা এখনো সত্যি:

```bash
git clone https://github.com/aumatiq/Dr.AsmaBK_Final.git
cd Dr.AsmaBK_Final
git log --oneline -5        # সর্বশেষ commit চেক করা
find . -not -path './.git*' | sort   # actual file list দেখা
```

1. **সবসময় clone করে actual ফাইল পড়ো** — কখনো ধরে নিও না যে মেমরি/প্ল্যান ডকুমেন্ট-এ যা লেখা আছে তাই বর্তমান repo state। প্রতিটা session-এ repo divergence থাকতে পারে (client নিজে GitHub-এ commit করতে পারে)।
2. **client-side ↔ backend cross-reference:** কোনো নতুন feature/tab যোগ করলে, `DoctorDashboard.html`-এ `call('functionName', ...)` অথবা `PublicWebsite.html`-এ `google.script.run.functionName(...)` — এই দুই প্যাটার্নে যত call আছে, প্রতিটার বিপরীতে সংশ্লিষ্ট `.gs` ফাইলে actual function definition আছে কিনা যাচাই করা। (v4.0 audit অনুযায়ী এই মুহূর্তে ৫৮টা unique call-এর সবগুলোই resolve করে — কোনো missing function নেই। নতুন কাজ শুরুর আগে এই ব্যালেন্স নষ্ট না করা।)
3. **Part 10 লার্নিং:** `Prescription.gs` সবসময় deploy bundle-এ include করতে হবে (এটা Code.gs-এর ভেতরে merge করা না, আলাদা ফাইল হিসেবেই থাকবে)।
4. **সব ডেলিভারেবল সম্পূর্ণ ফাইল হিসেবে দিতে হবে** — diff/patch না, পুরো ফাইল কপি-পেস্ট রেডি।
5. **Session শেষে এই মাস্টার প্ল্যান ফাইলটা আপডেট করে দিতে হবে** — নিচে অংশ ৫-এ "Session Log" ফরম্যাট অনুসরণ করে নতুন entry যোগ করা, cumulative history মুছে ফেলা না।

</br>

---

## 📊 অংশ ১ — বর্তমান Repo Status (2026-07-12 audit-ভেরিফায়েড, ধরে নেওয়া না)

**Repo:** `aumatiq/Dr.AsmaBK_Final` | **Branch:** `main` (একমাত্র branch) | **সর্বশেষ commit:** `8711039 "PWA+Icons"`

### ফাইল ইনভেন্টরি (রুট)
```
AppointmentFinance.gs   Articles.gs   Auth.gs   Code.gs
DashboardAdapter.gs   DeleteRestore.gs   PWASetup.gs
PatientModule.gs   Prescription.gs   RecommendedDoctors.gs
Security.gs   WhatsAppQueue.gs
DoctorDashboard.html (236K)   PublicWebsite.html (152K)
manifest.json  (⚠️ legacy/অব্যবহৃত — নিচে দ্রষ্টব্য)
dr_asma_visiting_card_front_back.pdf
dr_asma_visiting_card_preview.png
pwa_icons_patient/patient/  (8 icon files)
pwa_icons_staff/staff/      (8 icon files)
```
**নেই (কিন্তু আর্কিটেকচার-এ দরকার):** `index.html`, `CNAME` — এগুলো git history-তে ছিল (commit `507e0b0`, `59dc04a`) কিন্তু পরবর্তী restructuring-এ হারিয়ে গেছে। নিচে **Part 20**-এ এটাই সবচেয়ে জরুরি ফিক্স।

### ✅ যা কনফার্মড ঠিক আছে (audit দিয়ে verify করা, অনুমান না)
- `Prescription.gs` bundle-এ present এবং সব function `DoctorDashboard.html` থেকে সঠিকভাবে কল হচ্ছে।
- Client ↔ Backend RPC cross-reference: `DoctorDashboard.html`-এর `call()` wrapper দিয়ে ৪৫টা, direct `google.script.run` দিয়ে ৩টা (`roleLogin`, `validateSession`, `logout`), আর `PublicWebsite.html`-এর ১১টা direct call — মোট ৫৮টা ইউনিক ফাংশন কল, **সবগুলোই** কোনো না কোনো `.gs` ফাইলে define করা আছে। Missing function জিরো।
- Finance tab (Doctor-only, `requireDoctor()` দিয়ে locked) — backend + UI দুটোই আছে।
- Archive/Delete-Restore প্যাটার্ন (Patients + Appointments) — কাজ করছে।
- Theme toggle (Light/Dark/Auto, sessionStorage-based) — দুই app-এই আছে।
- Blog/Articles module ও Recommended Doctors module — merge করা এবং কাজ করছে।
- ভিজিটিং কার্ড PDF (front+back) — repo-তে আছে, stethoscope motif, `/#bk` QR link। (ফন্ট নোট: Instrument Serif Italic এর বদলে Liberation Serif Italic ব্যবহার হয়েছে বিল্ড এনভায়রনমেন্টে network restriction-এর কারণে — আসল `.ttf` আপলোড করলে রি-জেনারেট করা যাবে।)
- PWA icon সেট — দুই ব্র্যান্ড ভ্যারিয়েন্ট (patient: Rose Pink→Teal, staff: Deep Plum→Indigo), ৫ সাইজ প্রতিটায় — actual PNG ফাইল হিসেবে repo-তে **আছে** (আগের session log-এ "regenerate করতে হবে" লেখা ছিল, কিন্তু সর্বশেষ "PWA+Icons" commit-এ এটা আসলে হয়ে গেছে — প্ল্যান ডকুমেন্ট stale ছিল)।

### 🔴 CRITICAL — নতুন করে ধরা পড়া bug (এখনো ফিক্স হয়নি, Live করার আগে অবশ্যই লাগবে)

**Bug #1 — GitHub Pages entry point নেই (সবচেয়ে বড় ব্লকার):**
`Code.gs`-এর `doGet()`-এ `XFrameOptionsMode.ALLOWALL` সেট করা আছে, আর `PWASetup.gs`-এর কমেন্টে স্পষ্ট লেখা যে static assets GitHub Pages-এ custom domain (`drasma.aumatiq.com`, `admin.drasma.aumatiq.com`) দিয়ে হোস্ট হওয়ার কথা। কিন্তু repo-তে root-level `index.html` বা `CNAME` — কোনোটাই নেই। এর মানে এই মুহূর্তে এই দুই ডোমেইনে কিছুই লাইভ নেই (GitHub Pages নিজে থেকে কিছু serve করবে না)। **Part 20** এটা ফিক্স করে।

**Bug #2 — PWA icon path mismatch:**
`PWASetup.gs`-এ hardcoded আছে:
```js
var ICON_BASE_PATIENT_ = 'https://drasma.aumatiq.com/icons';
var ICON_BASE_STAFF_   = 'https://admin.drasma.aumatiq.com/icons/staff';
```
কিন্তু repo-তে actual folder নাম `pwa_icons_patient/patient/` ও `pwa_icons_staff/staff/` — path মেলে না। Domain fix হয়ে গেলেও (Bug #1) icon 404 দেবে, PWA install prompt-এ ভাঙা আইকন দেখাবে। **Part 20**-এ একসাথে ফিক্স হবে (folder rename করে code-এর সাথে মেলানো, কোড না পাল্টিয়ে — কম রিস্কি)।

**Bug #3 — root-level `manifest.json` অপ্রাসঙ্গিক/dead file:**
আসল manifest দুটো **dynamically generate** হয় (`PWASetup.gs`-এর `getPublicManifestJson_()` / `getDashboardManifestJson_()`), doGet routing দিয়ে (`?file=manifest`, `?file=manifest-dashboard`) — যা `<link rel="manifest">` ট্যাগে ব্যবহার হচ্ছে দুই HTML ফাইলেই। root-এর static `manifest.json` কোথাও reference হয় না — মৃত ফাইল, বিভ্রান্তি এড়াতে **Part 20**-এ ডিলিট করে দেওয়া হবে বা `_legacy_unused_manifest.json` নাম দিয়ে রাখা হবে।

### ⚠️ এখনো ওপেন (আগের memory/plan-এও ছিল, এখনো verify হয়নি বা হয়নি)
- Light-mode component-by-component contrast audit — **করা হয়নি** (Part 21-এ)।
- Staff subdomain (`admin.drasma.aumatiq.com`) আসলে live/DNS-configured কিনা — যাচাই বাকি (Part 20-এর অংশ)।
- Finance export function (backend-only) — deferred, client চাইলে launch-এর পরে।
- Doctor overview-এ Pending Payments widget — scoped কিন্তু বানানো হয়নি, deferred।

</br>

---

## 🗂️ অংশ ২ — বাকি কাজ শেষ করার ক্রম (Execution Order)

এই ক্রম মেনে করলে প্রতিটা অংশ একবারেই শেষ হবে, রিওয়ার্ক লাগবে না। প্রতিটা "Part X কর" বললেই যথেষ্ট — নিচের প্রতিটা Part self-contained prompt হিসেবে লেখা (অংশ ৪ দেখো)।

| ক্রম | Part | কী করবে | কেন এই অর্ডারে | আনুমানিক সময় |
|---|---|---|---|---|
| 1 | **Part 20** | GitHub Pages entry architecture ফিক্স: `index.html` (patient), `admin.html` (staff), `CNAME`, icon folder rename, dead manifest.json ক্লিনআপ | সব ব্লকার — এটা ছাড়া কিছুই লাইভ করা যাবে না | ১ session |
| 2 | **Part 21** | Full QA pass: light/dark contrast (component-by-component), responsiveness (375px–1440px), print stylesheet (prescription), cross-browser PWA install test | ডেপ্লয়ের আগে bug কম রাখা সস্তা, পরে expensive | ১-২ session |
| 3 | **Go-Live (deployment)** | নিচের "Deployment — Go Live" section অনুযায়ী Apps Script + GitHub Pages + DNS লাইভ করা | কোড রেডি হওয়ার পরই লাইভ করা উচিত | দেখো নিচে |
| 4 | **Part 22** | End-to-end live verification: দুই ডোমেইনেই সত্যিকারের ক্লিক-টেস্ট, PWA install (Android+iOS), manifest বৈধতা | ডেপ্লয়মেন্ট bug production-এই ধরা পড়ে, তাই আলাদা ধাপ | ১ session |
| 5 | **Part 23** | Client Handover Package: Bangla ইউজার গাইড (ডাক্তার + স্টাফ আলাদা), credential শীট, ভবিষ্যৎ maintenance নোট | সব কাজ শেষ হওয়ার পরের ধাপ | ১ session |
| 6 | *(deferred, optional)* | Finance export backend, Pending-payments widget | শুধু client চাইলে, launch ব্লকার না | v1.1 backlog |

</br>

---

## 🚀 Deployment — Go Live (সম্পূর্ণ স্টেপ বাই স্টেপ, বাংলায়)

**এই সেকশনটা Part 20 কোড ডেলিভারির সাথেই ব্যবহার করবে — ফাইল হাতে পাওয়ার সাথে সাথে নিচের ধাপ ধরে এগোলেই লাইভ হয়ে যাবে।**

### গুরুত্বপূর্ণ আর্কিটেকচার সিদ্ধান্ত (Part 20 শুরুর আগে বেছে নাও)

GitHub Pages-এর একটা platform limitation আছে: **একটা repo/Pages site-এ একটামাত্র custom domain (CNAME) বসানো যায়**। কিন্তু এই প্রজেক্টের ডিজাইনে দুইটা আলাদা সাবডোমেইন দরকার (`drasma.aumatiq.com` patient-দের জন্য, `admin.drasma.aumatiq.com` staff-দের জন্য)। দুইটা অপশন:

- **Option A (সুপারিশকৃত, সহজ, কম খরচ):** একটামাত্র ডোমেইন (`drasma.aumatiq.com`) ব্যবহার করো। Patient app root-এ (`/`), Staff app আলাদা পেজে (`/admin.html`)। কোনো দ্বিতীয় সাবডোমেইন/repo/DNS লাগবে না — শুধু path আলাদা। PWA হিসেবে দুটোই আলাদাভাবে "Add to Home Screen" করা যাবে (প্রতিটার নিজস্ব manifest link আছেই)।
- **Option B (client যদি নির্দিষ্টভাবে `admin.*` সাবডোমেইন-ই চায়):** দ্বিতীয় একটা ছোট GitHub repo বানাতে হবে (যেমন `aumatiq/Dr.AsmaBK_Admin`) শুধু staff wrapper page + staff icon-এর জন্য, তার নিজের GitHub Pages + `CNAME=admin.drasma.aumatiq.com`। এতে DNS-এ দুইটা আলাদা CNAME রেকর্ড লাগবে (দুই সাবডোমেইনের জন্য আলাদা)।

Part 20-এর ডেলিভারিতে দুটো অপশনের জন্যই ফাইল রেডি থাকবে — কোনটা করবে সেটা client-কে জিজ্ঞেস করে confirm করে নিও, কারণ এটা DNS-লেভেল সিদ্ধান্ত (একবার সেট করলে বদলাতে DNS propagation সময় লাগে)।

### ধাপ ১ — Google Apps Script Deploy (backend + HTML, একবারই লাইভ URL পাবে)

1. Apps Script প্রজেক্ট খোলো (Google Sheets database-এর সাথে bound script)।
2. সব `.gs` ফাইল + `DoctorDashboard.html` + `PublicWebsite.html` — script editor-এ paste/আপডেট করো (Part 20 থেকে পাওয়া ফাইলগুলো সহ)।
3. **⚠️ গুরুত্বপূর্ণ:** যদি এটা প্রথমবার deploy না হয়ে থাকে (আগের কোনো deployment আগে থেকেই আছে) — **নতুন deployment বানিও না।** তার বদলে: `Deploy` → `Manage deployments` → existing deployment-এর পাশে ✏️ (edit) → `Version: New version` → `Deploy`। এতে exec URL (`https://script.google.com/macros/s/XXXX/exec`) **একই থাকবে** — এটা critical, কারণ index.html-এর iframe src, manifest-এর icon domain reference, এবং client-দের ইতিমধ্যে "Add to Home Screen" করা PWA — সব এই একই URL-এর উপর নির্ভর করে।
4. প্রথমবার deploy করলে: `Deploy` → `New deployment` → Type: `Web app` → Execute as: `Me` → Who has access: `Anyone` → `Deploy`। এই exec URL-টা কপি করে রাখো — এটাই ধাপ ২-এ লাগবে।
5. Test করো: exec URL-এ সরাসরি গিয়ে `?page=home` (patient) এবং `?page=dashboard` (staff) দুটোই লোড হচ্ছে কিনা দেখো।

### ধাপ ২ — GitHub-এ push করা

1. Part 20-এর ফাইলগুলো (`index.html`, `CNAME`, rename করা icon folder, ইত্যাদি) লোকাল রিপোতে রাখো।
2. `index.html` (ও প্রযোজ্য হলে `admin.html`)-এর iframe `src` অ্যাট্রিবিউটে ধাপ ১-এর exec URL বসাও।
3. GitHub Desktop দিয়ে commit করো (commit message ফরম্যাট: `deploy: fix GitHub Pages entry + icon paths — Part 20`), push করো `main` branch-এ।

### ধাপ ৩ — GitHub Pages চালু করা

1. রিপোর `Settings` → `Pages` → Source: `Deploy from a branch` → Branch: `main` / `root` → Save।
2. একই পেজে `Custom domain` ফিল্ডে বসাও `drasma.aumatiq.com` (Option A হলে এটাই একমাত্র) — GitHub নিজে থেকে `CNAME` ফাইল কমিট করবে (যদি আগে থেকে না থাকে)। এতে ২৪ ঘণ্টা পর্যন্ত সময় লাগতে পারে DNS check হতে।
3. Option B করলে দ্বিতীয় repo-তেও একই ধাপ, custom domain `admin.drasma.aumatiq.com` দিয়ে।

### ধাপ ৪ — DNS রেকর্ড (aumatiq.com-এর DNS প্রোভাইডারে)

GitHub Pages-এর docs অনুযায়ী নিচের রেকর্ড লাগবে (subdomain-এর জন্য সাধারণত CNAME রেকর্ড):
```
drasma.aumatiq.com        CNAME   aumatiq.github.io.
admin.drasma.aumatiq.com  CNAME   aumatiq.github.io.   (শুধু Option B হলে, আলাদা repo হলে)
```
(exact target hostname repo-র owner username/org অনুযায়ী বসাও — GitHub-এর Pages settings পেজ এটা confirm করবে "unverified"/"verified" স্ট্যাটাস দিয়ে।)

### ধাপ ৫ — যাচাই (Go-Live checklist, Part 22-এ formal test হবে কিন্তু এখনই quick check করো)

- [ ] `https://drasma.aumatiq.com` → patient app লোড হচ্ছে, iframe-এর ভেতর সঠিক ডাক্তার profile দেখাচ্ছে
- [ ] `https://drasma.aumatiq.com/?file=manifest` (অথবা admin.html-এর dashboard-manifest) → valid JSON রিটার্ন করছে, icon URL 404 দিচ্ছে না
- [ ] Chrome DevTools → Application → Manifest → icon thumbnail ঠিকভাবে দেখাচ্ছে (broken image icon না)
- [ ] Android Chrome-এ "Add to Home Screen" করে actual icon (stethoscope, সঠিক রঙ) দেখাচ্ছে কিনা
- [ ] Staff app path/subdomain থেকে লগইন → dashboard লোড হচ্ছে, `Prescription.gs`-নির্ভর ফিচার (prescription লেখা/প্রিন্ট) কাজ করছে
- [ ] visiting card QR কোড স্ক্যান করলে সঠিক `/#bk` সেকশনে যাচ্ছে

### ধাপ ৬ — Client Delivery

Part 23 (Client Handover Package) সম্পূর্ণ হলে client-কে দাও:
- দুই app-এর লাইভ URL (Bangla-তে "কীভাবে হোম স্ক্রিনে অ্যাড করবেন" স্ক্রিনশট গাইড সহ — এটা আগে থেকেই দুই app-এই বিল্ট-ইন মোডাল হিসেবে আছে)
- Staff লগইন credential (role-based: Doctor / Receptionist)
- Google Sheet-এর লিংক (database, শুধু owner-এর access)
- Master Project Plan-এর এই ফাইল (ভবিষ্যতে নতুন ফিচার লাগলে reuse করার জন্য)

</br>

---

## 📘 অংশ ৩ — Reference: পুরনো Part 1-13, 16-19 এর spec (অপরিবর্তিত, ইতিমধ্যে delivered)

> এই অংশটা শুধু reference/history-এর জন্য রাখা হলো — Part 1-9, 11-13, 16-19 সবগুলো **delivered ও verified** (উপরের অংশ ১ audit দেখো)। নতুন session-এ এগুলো আবার করার দরকার নেই, শুধু কোনো bug রিপোর্ট এলে সংশ্লিষ্ট Part-এর original scope বোঝার জন্য পড়ো। পুরো verbose spec (Part 0 Shared Foundation, Part 1 Public Website Redesign, Part 2 Patient Login, Part 3 Patient Dashboard, Part 4 Doctor Dashboard Core, Part 5 Prescription, Part 6 Appointment+Finance, Part 7 Permission Hardening, Part 8 Settings, Part 9 Extensibility Scaffold, Part 10 WhatsApp+Email, Part 11 Domain/Hosting, Part 12 Visiting Card, Part 13 PWA Manifests, Part 16 Time Slot Fix, Part 17 Security Hardening, Part 18 Blog Module, Part 19 Recommended Doctors) পুরনো ফাইল `AUMATIQ_DrAsma_MasterProjectPlan-Up_Part-14.md`-এর লাইন ১৫৫-৮২৭-এ অবিকল আছে — repo-র commit history-তে সেই ফাইলটাও এখনো পাওয়া যাবে (`git show d14bf7e:AUMATIQ_DrAsma_MasterProjectPlan-Up_Part-14.md`)। প্রয়োজন হলে সেখান থেকে পড়ে নাও, এখানে ডুপ্লিকেট করা হলো না যাতে ফাইল অতিরিক্ত লম্বা না হয়ে যায়।

</br>

---

## 🧩 অংশ ৪ — বাকি কাজের Self-Contained Prompts (এখান থেকেই সরাসরি চালানো যাবে)

### PART 20 — GitHub Pages Entry Architecture Fix + Icon Path Correction 🆕🔴 (সবচেয়ে জরুরি)

**প্রম্পট (নতুন চ্যাটে এই আকারেই ব্যবহারযোগ্য):**

> Repo `aumatiq/Dr.AsmaBK_Final` clone করে audit করো। দুটো bug ফিক্স করতে হবে:
> 1. Root-এ `index.html` নেই যা `Code.gs`-এর Apps Script exec URL-কে iframe করবে (patient app-এর জন্য, `XFrameOptionsMode.ALLOWALL` অলরেডি সেট করা আছে ব্যাকএন্ডে)। আমাকে জিজ্ঞেস করো Option A (single domain, `/admin.html` path) নাকি Option B (আলাদা admin সাবডোমেইন, দ্বিতীয় repo) — client confirm করার পর সেই অনুযায়ী `index.html` (ও প্রয়োজনে `admin.html`) বানাও। iframe `src`-এ placeholder `YOUR_APPS_SCRIPT_EXEC_URL_HERE` রাখো, আমি deploy করার পর বসাবো।
> 2. `CNAME` ফাইল বানাও (`drasma.aumatiq.com` কনটেন্ট সহ, Option B হলে দ্বিতীয় repo-র জন্যও)।
> 3. `pwa_icons_patient/patient/` ফোল্ডার rename করো `icons/` করে, এবং `pwa_icons_staff/staff/` rename করো `icons/staff/` করে (কোড না পাল্টিয়ে ফোল্ডার নাম কোডের সাথে মেলানো, কারণ `PWASetup.gs`-এর `ICON_BASE_PATIENT_`/`ICON_BASE_STAFF_` ইতিমধ্যে `/icons` ও `/icons/staff` আশা করে)।
> 4. Root-এর static `manifest.json` ফাইলটা ডিলিট করো অথবা `_legacy_unused_manifest.json` নাম দাও — এটা কোথাও reference হয় না (dynamic manifest generation `PWASetup.gs` থেকে হয়)।
> 5. সব ফাইল সম্পূর্ণ ডেলিভার করো, প্রতিটার exact path/folder বলে দাও।
> 6. মাস্টার প্ল্যানের এই ফাইলে Session Log আপডেট করো।

---

### PART 21 — Full QA Pass: Contrast, Responsiveness, Print 🆕

**প্রম্পট:**

> Repo clone করে `DoctorDashboard.html` ও `PublicWebsite.html`-এ Light mode ও Dark mode দুটোতেই component-by-component contrast audit করো (WCAG AA ন্যূনতম — text/background contrast ratio 4.5:1 সাধারণ টেক্সটের জন্য, 3:1 বড় টেক্সট/UI element-এর জন্য)। বিশেষভাবে চেক করো: sidebar navigation, modal ফর্ম, badge/chip color, table row hover state, button disabled state। যেসব জায়গায় contrast ফেল করে সেগুলোর তালিকা দাও, তারপর existing CSS variable token (`--rose`, `--teal`, `--gold`, `--ind` ইত্যাদি) ব্যবহার করেই ফিক্স করো (নতুন token যোগ করা যাবে না)। এরপর 375px থেকে 1440px পর্যন্ত breakpoint-এ visual regression চেক করো (screenshot বা code-review ভিত্তিতে বর্ণনা দাও)। সবশেষে prescription print stylesheet (`@media print`) যাচাই করো — A4 পেজে ঠিকভাবে ফিট হচ্ছে কিনা, header/footer কাটা যাচ্ছে কিনা। সব ফিক্স সহ সম্পূর্ণ ফাইল ডেলিভার করো এবং মাস্টার প্ল্যান আপডেট করো।

---

### PART 22 — End-to-End Live Verification 🆕

**প্রম্পট (Deployment-এর পরে চালাবে):**

> লাইভ URL গুলো আমাকে দিতে বলো (patient app, staff app/admin path)। প্রতিটার জন্য নিচের চেকলিস্ট অনুযায়ী verification-এর ধাপ বলে দাও যা আমি নিজে করব (Claude সরাসরি live URL browse করতে পারবে না বলে, checklist + কী দেখতে হবে তার বর্ণনা দাও): manifest JSON বৈধতা, icon load, PWA installability (Chrome DevTools Lighthouse PWA audit), staff লগইন flow, prescription প্রিন্ট, visiting card QR লিংক। যদি কোনো ধাপে সমস্যা রিপোর্ট করি, root cause বের করে ফিক্স দাও।

---

### PART 23 — Client Handover Package 🆕

**প্রম্পট:**

> Dr. Asma ও তার স্টাফদের জন্য বাংলায় দুটো আলাদা সংক্ষিপ্ত ইউজার গাইড বানাও (markdown অথবা PDF — জিজ্ঞেস করে confirm করো কোনটা চাই): (১) Patient app কীভাবে ব্যবহার করবেন (patient-দের জন্য, appointment বুক করা, prescription দেখা), (২) Staff dashboard গাইড (appointment ম্যানেজ, prescription লেখা, finance entry, patient archive/restore)। প্রতিটাতে স্ক্রিনশট-প্লেসহোল্ডার note রাখো (আমি চাইলে পরে স্ক্রিনশট বসাবো)। এছাড়া একটা credential/handover শীট বানাও (Google Sheet database লিংক, Apps Script exec URL, GitHub repo লিংক, staff লগইন রোল লিস্ট) — sensitive password actual ভ্যালু না বসিয়ে placeholder রাখো।

</br>

---

## 📝 অংশ ৫ — Session Log (নতুন entry সবসময় নিচে যোগ করবে, পুরনোটা মুছবে না)

### ✅ Part 19 পর্যন্ত সেশনগুলোর সারাংশ
Part 1-13, 16-19 — সব delivered। বিস্তারিত লগ পুরনো ফাইলে আছে (`git show d14bf7e:...` দিয়ে দেখা যায়)। সংক্ষেপে: Public website redesign, patient portal, doctor dashboard, prescription module, appointment+finance flow, permission hardening, settings, WhatsApp+email automation, domain/hosting architecture ডিজাইন, visiting card, PWA manifest (bug-fixed), booking slot fix, security hardening, blog module, recommended doctors module — সব শেষ।

### ✅ 2026-07-12 — Master Plan Audit + Rewrite Session (এই session)
- Repo সম্পূর্ণ re-clone করে audit করা হলো (আগের কোনো session-এর claim ধরে না নিয়ে)।
- Client↔backend RPC cross-reference (৫৮টা unique call) পুরোপুরি পাস করেছে — কোনো missing function নেই।
- **নতুন bug আবিষ্কার (৩টা, উপরের অংশ ১-এ বিস্তারিত):** GitHub Pages entry point (`index.html`/`CNAME`) মিসিং, PWA icon folder path mismatch, dead static `manifest.json`।
- পুরনো master plan ফাইলের duplicate "Part 14" naming clash আইডেন্টিফাই করে v4.0-এ single, unambiguous numbering স্কিমে rewrite করা হলো।
- বাকি কাজের জন্য Part 20-23 সংজ্ঞায়িত করা হলো, প্রতিটা self-contained prompt আকারে যাতে যেকোনো নতুন চ্যাটে সরাসরি চালানো যায়।
- সম্পূর্ণ Go-Live deployment guide যোগ করা হলো (Apps Script + GitHub Pages + DNS + custom domain সিদ্ধান্ত, Option A/B সহ)।

**🔜 পরের session-এর জন্য বাকি (ক্রম অনুযায়ী):** Part 20 → Go-Live দাপ্তরিক ডেপ্লয়মেন্ট → Part 21 → Part 22 → Part 23।

### ✅ 2026-07-12 — Part 20: GitHub Pages Entry Architecture Fix (এই session)
- Repo আবার clone করে re-audit করা হলো (Universal Protocol অনুযায়ী, আগের session-এর claim ধরে না নিয়ে)। সর্বশেষ commit `df3f9b1` কনফার্ম করা হলো।
- **আর্কিটেকচার সিদ্ধান্ত কনফার্মড: Option A** — একটাই ডোমেইন (`drasma.aumatiq.com`), staff `/admin.html` পাথে। কোনো দ্বিতীয় repo/সাবডোমেইন/DNS রেকর্ড লাগছে না।
- `index.html` (patient wrapper) ও `admin.html` (staff wrapper) ডেলিভার করা হলো — দুটোই exec URL iframe করে, নিজস্ব branded loading screen + fallback আছে, নিজস্ব `<link rel="manifest">` (top-level document-এ manifest link দরকার, iframe-এর ভিতরেরটা কাজ করবে না installability-এর জন্য)।
- `CNAME` ফাইল ডেলিভার করা হলো (`drasma.aumatiq.com`)।
- **নতুন আবিষ্কার এই session-এ:** `PWASetup.gs`-এর `ICON_BASE_STAFF_` আগে থেকেই `admin.drasma.aumatiq.com` সাবডোমেইন hardcoded ছিল — Option A বেছে নেওয়ায় এটা আর valid না। এক লাইন ব্যাকএন্ড ফিক্স করা হলো (`https://drasma.aumatiq.com/icons/staff`-এ পরিবর্তন), সাথে ফাইলের header comment-ও আপডেট করা হলো। বাকি কোনো `.gs`/`.html` ফাইলে হাত দেওয়া হয়নি।
- Icon folder rename নির্দেশনা দেওয়া হলো (GitHub Desktop-friendly, non-technical, terminal ছাড়া) — `pwa_icons_patient/patient/*` → `/icons/*`, `pwa_icons_staff/staff/*` → `/icons/staff/*`।
- Dead static `manifest.json` → `_legacy_unused_manifest.json`-এ rename করে deprecation note যোগ করা হলো (পুরনো `manifest.json` ডিলিট করার নির্দেশ দেওয়া হয়েছে)।
- Client↔backend cross-reference অক্ষত আছে — এই session-এ কোনো নতুন frontend function call যোগ হয়নি।
- **ওপেন রিস্ক নোট করা হয়েছে:** cross-origin manifest fetch (GitHub Pages ডোমেইন থেকে script.google.com exec URL-এ) কিছু ব্রাউজারে সমস্যা করতে পারে — Part 22 লাইভ টেস্টে PWA install prompt না এলে same-origin static manifest fallback বানাতে হবে (এখনই preventively করা হয়নি, dynamic manifest-এর সুবিধা রাখার জন্য)।

**🔜 পরের session-এর জন্য বাকি (ক্রম অনুযায়ী):** Go-Live দাপ্তরিক ডেপ্লয়মেন্ট (Apps Script deploy → exec URL বসানো → GitHub push → Pages চালু → DNS) → Part 21 (QA pass) → Part 22 (live verification, PWA install prompt বিশেষভাবে চেক করা) → Part 23 (client handover)।

### ✅ 2026-07-13 — Go-Live Deployment Checklist Handoff (এই session)
- Repo আবার re-clone করে audit করা হলো (Universal Protocol অনুযায়ী)। সর্বশেষ commit `c85cf96 "Part 20 files"` কনফার্মড।
- **কনফার্মড উপস্থিত:** `index.html`, `admin.html`, `CNAME` (কনটেন্ট `drasma.aumatiq.com` — Option A অনুযায়ী সঠিক), `PART20_DELIVERY_NOTES.md`, `_legacy_unused_manifest.json`, `PWASetup.gs`-এ `ICON_BASE_STAFF_` ঠিক করা আছে (`https://drasma.aumatiq.com/icons/staff`)।
- **নতুন আবিষ্কার (এখনো ফিক্স হয়নি) — Part 20-এর ২টা ম্যানুয়াল ধাপ এখনো বাকি:**
  1. Icon ফোল্ডার rename এখনো হয়নি — repo-তে এখনো পুরনো নামেই আছে (`pwa_icons_patient/patient/`, `pwa_icons_staff/staff/`), নতুন `/icons/`, `/icons/staff/` তৈরি হয়নি। যতক্ষণ এটা না হবে, PWA icon 404 দেবে লাইভেও।
  2. পুরনো dead `manifest.json` এখনো ডিলিট হয়নি — `_legacy_unused_manifest.json` (নতুন, deprecation note সহ) আর পুরনো `manifest.json` দুটোই এখন repo-তে আছে।
  3. `index.html` ও `admin.html` দুটোতেই iframe `src` এখনো placeholder (`YOUR_APPS_SCRIPT_EXEC_URL_HERE`) — Apps Script deploy করার পর real exec URL বসাতে হবে।
- `Code.gs`-এর `doGet()` routing কনফার্ম করা হলো: `?page=home`/`?page=dashboard`/`?file=manifest`/`?file=manifest-dashboard` — সব ঠিকভাবে কাজ করছে, ডকুমেন্টেড আচরণের সাথে মিলছে।
- একটা সম্পূর্ণ **Go-Live Deployment Checklist** (`GoLive_Deployment_Checklist.md`) ডেলিভার করা হলো — উপরের ৩টা bakiy ধাপ + Apps Script deploy → GitHub push → Pages activation → DNS → quick verification, সবকিছু checkbox আকারে, exec URL বসানোর exact জায়গা (line-level) চিহ্নিত করে।
- এই session-এ কোনো `.gs`/`.html` ফাইলে কোড পরিবর্তন করা হয়নি — শুধু audit + deployment guide। Client↔backend cross-reference (৫৮টা call) অক্ষত আছে।

**🔜 পরের session-এর জন্য বাকি (ক্রম অনুযায়ী):** (ক) Icon folder rename + পুরনো manifest.json delete (client-সাইড, GitHub Desktop দিয়ে) → (খ) Apps Script deploy + exec URL বসানো + GitHub push + Pages activate + DNS (checklist ফাইল অনুসরণ করে) → Part 21 (QA pass) → Part 22 (live verification) → Part 23 (client handover)।
