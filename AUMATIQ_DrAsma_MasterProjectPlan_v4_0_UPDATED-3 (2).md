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

### ✅ 2026-07-13 — Repo Re-check + GUIDE Fix + Part 21 QA Pass (এই session)
- Repo re-fetch করে দেখা গেল client নিজেই Go-Live prerequisite-গুলো সম্পন্ন করেছে (commit `30578f3 "UP"`): icon folder rename (`pwa_icons_patient/patient/` → `/icons/`, `pwa_icons_staff/staff/` → `/icons/staff/`) হয়ে গেছে, পুরনো dead `manifest.json` ডিলিট হয়ে গেছে, `index.html`/`admin.html` দুটোতেই real Apps Script exec URL বসানো হয়ে গেছে (iframe src + manifest link দুই জায়গাতেই)। CNAME অপরিবর্তিত (`drasma.aumatiq.com`, Option A কনফার্মড)।
- **নতুন discovery:** client-এর যোগ করা `GUIDE/DrAsma_ClinicSystem_INFO_URL.txt` ফাইলে staff URL ভুলভাবে `https://admin.drasma.aumatiq.com` লেখা ছিল — এই সাবডোমেইনের কোনো DNS রেকর্ড নেই (Option A অনুযায়ী দরকারও নেই)। ফিক্স করে `https://drasma.aumatiq.com/admin.html` করা হলো, সাথে inline deprecation নোট যোগ করা হলো যাতে ভবিষ্যতে বিভ্রান্তি না হয়।
- **Part 21 (QA pass) সম্পন্ন হলো** — WCAG contrast ratio actual হিসাব করে (assumption না) ৪টা কনফার্মড contrast bug ফিক্স করা হলো, existing CSS token দিয়েই (কোনো নতুন token যোগ হয়নি):
  1. `DoctorDashboard.html` `.btn-ind` — light mode-এ button text প্রায় অদৃশ্য হয়ে যাচ্ছিল (`var(--wht)` ভুল ব্যবহারের কারণে) → fixed literal `#fff`।
  2. `DoctorDashboard.html` `.btn-teal` — dark mode-এ সাদা টেক্সট 2.49:1 (FAIL) → fixed background `#0F766E`।
  3. `PublicWebsite.html` `.btn-teal` — একই ক্রস-ফাইল বাগ, একইভাবে ফিক্স।
  4. `DoctorDashboard.html` `.sb-section`/`.sb-bottom` sidebar ছোট টেক্সট — `--sil2` থেকে `--sil`-এ সুইচ করে contrast বাড়ানো হলো।
- **স্কোপ-কারেকশন:** Part 21-এর মূল স্পেকে "prescription `@media print` স্টাইলশিট" চেক করার কথা ছিল, কিন্তু audit করে দেখা গেল prescription কখনো ব্রাউজার-প্রিন্ট হয় না — `Prescription.gs`-এর `generatePrescriptionPdf_()` সার্ভার-সাইডে PDF বানায়। সেখানে **নতুন bug পাওয়া গেল**: কোনো explicit page-size না থাকায় Apps Script ডিফল্টভাবে US Letter সাইজ ব্যবহার করছিল A4-র বদলে। `@page{size:A4;margin:12mm;}` যোগ করে ফিক্স করা হলো।
- বাকি সব borderline/কম-প্রায়োরিটি issue (badge contrast 4.35:1, disabled-state contrast, `.btn-rose` gradient-এর rose প্রান্ত) ফিক্স না করে আলাদাভাবে ফ্ল্যাগ করা হলো `Part21_QA_Report.md`-এ — ভবিষ্যতে দরকার হলে ঠিক করা যাবে।
- Responsive breakpoint কভারেজ যাচাই করা হলো: `DoctorDashboard.html`-এ 400px পর্যন্ত breakpoint আছে (ভালো), `PublicWebsite.html`-এর সর্বনিম্ন breakpoint 640px (375-640px রেঞ্জ dedicated fine-tuning ছাড়া) — নোট করা হলো, ব্লকার হিসেবে ট্রিট করা হয়নি।
- `Prescription.gs`-এ syntax-check পাস করেছে (node --check)। Client↔backend cross-reference অক্ষত — এই session-এ কোনো নতুন function call যোগ/বাদ হয়নি, শুধু CSS/একটা backend PDF-config লাইন বদলেছে।

**🔜 পরের session-এর জন্য বাকি:** এই সেশনের ৩টা আপডেটেড ফাইল (`DoctorDashboard.html`, `PublicWebsite.html`, `Prescription.gs`) GitHub-এ push করো এবং Apps Script editor-এও sync করো (`Prescription.gs`-এর জন্য বিশেষভাবে জরুরি, PDF fix কাজ করার জন্য নতুন deployment version লাগবে — Go-Live checklist ধাপ ১) → Go-Live সম্পূর্ণ করো (checklist ফাইল অনুসরণ করে, GitHub Pages activate + DNS বাকি) → Part 22 (live verification, প্রেসক্রিপশন PDF আসলেই A4-তে আসছে কিনা বিশেষভাবে চেক করা) → Part 23 (client handover)।

### ✅ 2026-07-14 — Part 25: "My Records" Bug Fix + Deep Bangla Localization (এই session)
- Repo re-clone করে audit করা হলো (`aumatiq/Dr.AsmaBK_Final`, Universal Protocol অনুযায়ী)।
- **রুট-কজ বাগ ফিক্স (হিরো সেকশনের "My Records" লিংক কাজ করছিল না):** কারণ ছিল একটা classic JS foot-gun — গ্লোবাল ফাংশনের নাম ছিল `scrollTo(id)`, যেটা `onclick="scrollTo('#portal')"` হিসেবে `<button>`/`<a>` element-এর উপর কল হচ্ছিল। ইনলাইন `onclick` attribute-এর ভেতরে ব্রাউজার একটা implicit `with(element)` স্কোপ ব্যবহার করে, আর প্রতিটা HTML element-এরই নিজস্ব বিল্ট-ইন `scrollTo()` মেথড আছে (element-এর ভেতরে scroll করার জন্য) — তাই `scrollTo('#portal')` কল আসলে glবাল ফাংশনের বদলে button-এর নিজস্ব `Element.scrollTo()`-কে কল করছিল, আর সেটা string argument (`'#portal'`) পেয়ে সরাসরি silently fail করছিল (কনসোলে error, কিন্তু UI-তে কিছুই দেখা যাচ্ছিল না)। **ফিক্স:** গ্লোবাল ফাংশনের নাম `scrollTo` থেকে বদলে `goToSection` করা হলো (৩ জায়গায় — hero বাটন, nav বাটন, ফাংশন definition)। Playwright দিয়ে ভেরিফাই করা হয়েছে: hero ও nav দুটো "My Records" বাটনই এখন সঠিকভাবে `#portal`-এ স্ক্রল করছে, আর logo click-এর native `window.scrollTo(top:0)`-ও (যেটা আগে এই bug-এর কারণে indirectly ভেঙে যেতে পারতো) ঠিকভাবে কাজ করছে।
- **Bengali numeral system যোগ করা হলো:** নতুন `bnNum()` হেল্পার — bn মোডে যেকোনো ডিসপ্লে টেক্সটের ০-৯ সংখ্যাকে বাংলা সংখ্যায় (০-৯) রূপান্তর করে। প্রয়োগ করা হয়েছে: হিরো stat কাউন্টার (৫,০০০+, ৭০%), stats সেকশনের অ্যানিমেটেড কাউন্টার (ভাষা টগল করার পরও সঠিকভাবে re-render হয় — নতুন `reformatStatNumbers()`), YearsExperience, ক্লিনিক আওয়ার সময় (`fmt12()`), booking flow-এর slot বাটন ও তারিখ/সময় summary, Patient Portal-এর appointment/test তারিখ, ব্লগ পোস্টের তারিখ, ফোন/হোয়াটসঅ্যাপ নম্বরের ডিসপ্লে লেবেল।
  - **ইচ্ছাকৃত ব্যতিক্রম (functional integrity রক্ষার জন্য):** Patient ID, `tel:`/`wa.me` href-এর ভেতরের আসল ডিজিট, এবং `<input type="date">`/`<input type="tel">`-এর ভ্যালু ইচ্ছাকৃতভাবে Western digit-এই রাখা হয়েছে — এগুলো সিস্টেম ম্যাচিং/সার্চ লজিকের সাথে যুক্ত এবং ব্রাউজারের নেটিভ ইনপুট টাইপ Western digit ছাড়া কাজ করে না। নেটিভ HTML5 date picker-এর calendar UI নিজেই ব্রাউজার/OS locale অনুযায়ী রেন্ডার হয় — এটা page-level JS দিয়ে override করা সম্ভব না, তাই ওটা বাদ রাখা হয়েছে।
- **তারিখ ফরম্যাটিং backend + frontend দুই জায়গাতেই fix করা হলো:** `Code.gs`-এর `getPatientRecords()` আগে সার্ভার-সাইডে হার্ডকোডেড ইংরেজি ফরম্যাটে (`'dd MMM yyyy'`) তারিখ পাঠাতো — এখন ISO ফরম্যাটে (`'yyyy-MM-dd'`) পাঠায়, আর ক্লায়েন্ট-সাইড `fmtD()`/`fmtPubDate_()` ফাংশন এখন ভাষা অনুযায়ী বাংলা/ইংরেজি মাসের নাম + সংখ্যা দেখায়। (এই ফাংশন শুধু `PublicWebsite.html` থেকেই কল হয়, তাই ফরম্যাট বদলানো নিরাপদ ছিল — cross-referenced করে কনফার্ম করা হয়েছে।)
- **হিরো সেকশন সম্পূর্ণ বাংলায় রূপান্তর:** H1 হেডলাইন ("আপনার সুস্থতা, আমাদের অগ্রাধিকার।") ও সাব-টেক্সট এখন `data-i18n-html`/`data-i18n` দিয়ে সম্পূর্ণ bilingual — আগে এই দুটো element-এর কোনো i18n key-ই ছিল না (hardcoded ইংরেজি, টগল করলেও বদলাতো না)।
- **রোগীদের মতামত (Testimonials) সেকশন সম্পূর্ণ bilingual করা হলো:** ৩টা কার্ডই এখন `data-i18n` দিয়ে দুই ভাষাতেই সঠিক — আগে ২টা কার্ড শুধু ইংরেজিতে ছিল (bn মোডেও বদলাতো না), আর ৩ নম্বর কার্ড শুধু বাংলায় ছিল (en মোডেও বাংলাই দেখাতো)। এখন সবগুলো টগল করলে সঠিক ভাষায় বদলায়।
- **Settings-চালিত ডাক্তার তথ্যের জন্য Bangla ফিল্ড (`*Bn`) যোগ করা হলো — end-to-end:** `DoctorNameBn`, `ClinicNameBn`, `SpecialtyBn`, `DegreeBn`, `ClinicAddressBn`, `BioBn`, `ServicesListBn`।
  - `DashboardAdapter.gs`-এর `saveDoctorProfile()` whitelist-এ নতুন ফিল্ডগুলো যোগ করা হলো (আগে whitelist না থাকলে এগুলো সেভই হতো না)।
  - `DoctorDashboard.html`-এর Settings ট্যাবে প্রতিটা ইংরেজি ফিল্ডের পাশে একটা বাংলা input যোগ করা হলো (ডাক্তার নিজে যেকোনো সময় বাংলা টেক্সট বসাতে/বদলাতে পারবেন) — `fillSettingsForm()` ও `saveSettings()` দুটোই আপডেট করা হয়েছে।
  - `PublicWebsite.html`-এর `renderProfile()`-এ একটা `bf(enKey,bnKey)` resolver যোগ করা হলো — bn মোডে Bangla ফিল্ড থাকলে সেটাই দেখাবে, না থাকলে ইংরেজি ফিল্ডে fallback করবে (সাইট কখনো ফাঁকা দেখাবে না)।
  - **Email ইচ্ছাকৃতভাবে এই সিস্টেমের বাইরে রাখা হয়েছে** — `ContactEmail` সবসময় যা আছে তাই দেখাবে, কোনো ভাষা-নির্ভর রূপান্তর হবে না (ইউজারের স্পষ্ট নির্দেশ অনুযায়ী)।
  - `getDoctorProfile()`/`getProfileForEmail_()` জেনেরিক (Field/Value শীট থেকে যেকোনো ফিল্ড অটো-পড়ে) — তাই নতুন `*Bn` ফিল্ড সেভ হলেই পাবলিক সাইটে অটোমেটিক পৌঁছে যাবে, আলাদা কোনো read-side কোড বদলাতে হয়নি।
- **Booking/Login/Patient Portal/Upload/Blog/Recommended-Doctors ফ্লো-র সব হার্ডকোডেড ইংরেজি JS মেসেজ** (error/success/loading/empty-state, ~৩৫টা স্ট্রিং — যেমন "Confirming...", "Please enter both fields.", "No appointments found.", টেবিল হেডার "ID/Date/Time/Status" ইত্যাদি) এখন `T()` ফাংশন দিয়ে সম্পূর্ণ bilingual।
- **যাচাই করা হয়েছে (Playwright, headless Chromium):**
  - Node `--check` দিয়ে `PublicWebsite.html`/`DoctorDashboard.html`-এর সব ইনলাইন `<script>` ব্লক ও `Code.gs`/`DashboardAdapter.gs` — সবগুলো syntax-valid।
  - EN↔BN টগল করে হিরো, টেস্টিমোনিয়াল, স্ট্যাট কাউন্টার, "My Records" (hero + nav দুটোই) — সব সঠিকভাবে কাজ করছে, কোনো কনসোল এরর নেই।
  - 1440px ও 390px দুই viewport-এই স্ক্রিনশট নিয়ে visual QA করা হয়েছে — bn মোডে কোনো horizontal overflow নেই (`scrollWidth === clientWidth`)।
- **এখনো বাকি / জানা সীমাবদ্ধতা (পরবর্তী সেশনের জন্য নোট):**
  1. **ডাক্তারের প্রকৃত বাংলা নাম ও ঠিকানা এখনো বসানো হয়নি** — নতুন Settings ফিল্ড তৈরি হয়েছে (`sDrNameBn`, `sAddressBn` ইত্যাদি), কিন্তু আসল Bangla টেক্সট ডাক্তার নিজে Dashboard থেকে বসাবেন অথবা ব্যবহারকারী (AUMATIQ P2) থেকে সংগ্রহ করে সরাসরি Google Sheet-এ বসিয়ে দেওয়া যেতে পারে।
  2. Recommended Doctors ও Blog মডিউলের ফ্রি-টেক্সট কনটেন্ট (ডাক্তার নিজে যা টাইপ করেন — নাম, নোট, আর্টিকেল বডি) এই সেশনের স্কোপে অটো-ট্রান্সলেট করা হয়নি (শুধু চারপাশের UI chrome লেবেল বাংলা করা হয়েছে) — এগুলোর জন্যও চাইলে ভবিষ্যতে একই প্যাটার্নে `*Bn` ফিল্ড যোগ করা যাবে।
  3. নেটিভ `<input type="date">` calendar picker-এর সংখ্যা/মাসের নাম ব্রাউজার/OS locale-নির্ভর — page-level কোড দিয়ে বাংলা করা সম্ভব না (browser limitation, bug না)।

**🔜 পরের session-এর জন্য বাকি:** এই সেশনের ৪টা আপডেটেড ফাইল (`PublicWebsite.html`, `DoctorDashboard.html`, `Code.gs`, `DashboardAdapter.gs`) GitHub-এ push করো এবং Apps Script editor-এও sync করো (`Code.gs`/`DashboardAdapter.gs`-এর জন্য নতুন deployment version লাগবে, নইলে date-format fix ও নতুন `*Bn` ফিল্ড সেভ হবে না) → Dashboard-এর Settings ট্যাব থেকে ডাক্তারের বাংলা নাম/ঠিকানা (ও ইচ্ছা হলে Bio/Specialty/Degree/Services বাংলা) পূরণ করো → Go-Live checklist বাকি ধাপ সম্পন্ন করো → Part 22 (live verification) → Part 23 (client handover)।

### ✅ 2026-07-14 (continued) — Part 26: বুকিং স্লট বাগ ফিক্স + ড্যাশবোর্ড মোবাইল হেডার ফিক্স + ডেটটাইম বার ক্লিনআপ
- **🐛 কনফার্মড রুট-কজ বাগ (সবচেয়ে গুরুত্বপূর্ণ ফিক্স):** `Code.gs`-এর `getDoctorProfile()` শুধু `DoctorProfile` শীট পড়তো — `WorkingDays`/`SlotDuration`/`OpeningTime`/`ClosingTime` (এগুলো আসলে থাকে আলাদা `Settings` শীটে) কখনোই রিটার্ন করতো না। ফলে:
  1. `DoctorDashboard.html`-এর Settings ট্যাব সবসময় hardcoded ডিফল্ট মান দেখাতো (২০ মিনিট, ০৯:০০–২০:০০, Sat-Wed) — ডাক্তার আসলে কী সেভ করেছেন তা না।
  2. ডাক্তার Settings-এ গিয়ে **অন্য কোনো** ফিল্ড বদলে Save করলেও, ফর্মে দেখানো ভুল/ডিফল্ট স্লট-ডিউরেশন/আওয়ার আবার সাইলেন্টলি সেভ হয়ে যেত — মানে তার আসল সেটিং (যেমন ৩০ মিনিট স্লট) প্রতিবার সেভের সাথে সাথে ডিফল্টে (২০ মিনিট) রিসেট হয়ে যাচ্ছিল! এটাই ছিল "টাইম স্লট ঠিক হয়নি" সমস্যার আসল কারণ।
  3. পাবলিক ওয়েবসাইটের "Clinic Hours" সেকশনও (`buildHours()`) একই কারণে সবসময় ডিফল্ট আওয়ার দেখাতো, ডাক্তারের আসল আওয়ার না।
  - **ফিক্স:** `getDoctorProfile()`-এ এখন `Settings` শীট থেকে এই ৪টা নির্দিষ্ট ফিল্ড (whitelist — অন্য কোনো sensitive Settings ডেটা যেমন session secret leak হয় না) merge করে পাঠানো হয়। Node দিয়ে merge logic আলাদাভাবে unit-test করে ও Playwright দিয়ে end-to-end (fillSettingsForm সঠিক মান দেখাচ্ছে কিনা) — দুটোই যাচাই করা হয়েছে।
  - **স্লট-জেনারেশনের গণিত** (`getPublicBookingSlots()`) নিজে থেকেই সবসময় সঠিক ছিল (Settings শীট সরাসরি পড়ে, duration দিয়ে ভাগ করে) — Node দিয়ে ৩টা ভিন্ন duration (১৫/২০/৩০ মিনিট) কেস টেস্ট করে কনফার্ম করা হয়েছে। আসল সমস্যা settings persist/display না হওয়াতেই ছিল, যা এখন সমাধান হয়েছে।
- **📱 ড্যাশবোর্ড মোবাইল হেডার — real overlap বাগ কনফার্মড ও ফিক্সড:** Playwright bounding-box টেস্ট দিয়ে প্রতিটা টপবার এলিমেন্টের exact পিক্সেল পজিশন মেপে কনফার্ম করা হয়েছে যে ৩২০–৩২৯px width-এ (পুরনো/ছোট ফোন) লোগো টেক্সট "AUMATIQ." থিম-টগল বাটনের উপর ~৯px উঠে যাচ্ছিল (৪টা আইকন + লোগো টেক্সট একসাথে জায়গায় আঁটছিল না)। ফিক্স: `≤400px`-এ লোগো টেক্সট হাইড করে শুধু আইকন দেখানো হয় (safety margin সহ — ৩২০px থেকে ৪০০px পর্যন্ত সব সাইজে রি-টেস্ট করে ওভারল্যাপ শূন্য কনফার্ম করা হয়েছে, আগে -৯.২px ছিল, এখন +৭২px গ্যাপ)।
- **টপবার প্রোফাইল চিপ/লগআউট বাটনে ডাক্তারের পুরো নাম না দেখিয়ে শুধু প্রথম অংশ** ("Dr. Asma Binte Khair" → "Dr. Asma") — Overview ট্যাবের greeting-এ (`ovDrName`) পুরো নাম অপরিবর্তিত রাখা হয়েছে (শুধু compact টপবার চিপেই শর্ট নাম)।
- **লগআউট কনফার্মেশন — ব্রাউজারের নেটিভ `confirm()` সরিয়ে ব্র্যান্ডেড মডাল যোগ করা হলো:** নেটিভ `confirm()` ডায়ালগে ব্রাউজার নিজে থেকেই অতিরিক্ত টেক্সট (origin/URL) জুড়ে দেয় — এটা JS দিয়ে বন্ধ করা সম্ভব না (ব্রাউজার সিকিউরিটি ফিচার)। তাই বিদ্যমান মডাল সিস্টেম (`confirmEntryModal`-এর মতো) ব্যবহার করে একটা নতুন `logoutConfirmModal` বানানো হয়েছে — এখন শুধু "আপনি কি লগআউট করতে চান?" এই লাইনটাই দেখাবে, ব্রাউজারের কোনো এক্সট্রা টেক্সট নেই।
- **ডেটটাইম বার:** আগের সেশনে (Part 25) "বাংলা:"/"Eng:"/"হিজরি:" লেবেল সরানো হয়েছিল — desktop ও mobile bar দুটোই একই `datesHtml` ভ্যারিয়েবল শেয়ার করে বলে দুই জায়গাতেই একসাথে ফিক্স হয়ে গেছে (রি-কনফার্ম করা হলো এই সেশনে)। "হিজরি" শব্দটা (লেবেল না, ক্যালেন্ডার-টাইপ সাফিক্স হিসেবে, যেমন "১৪৪৮ হিজরি") ইচ্ছাকৃতভাবে রাখা হয়েছে যাতে বোঝা যায় এটা কোন ক্যালেন্ডার — এটা "লেবেল:" প্রিফিক্স থেকে আলাদা জিনিস।
- **যাচাই:** Playwright দিয়ে re-confirm — My Records (EN+BN, mobile) ঠিক আছে, টপবার ওভারল্যাপ নেই (৩২০–৪১৪px রেঞ্জ), Settings ফর্ম merge করা ডেটা সঠিকভাবে দেখাচ্ছে, লগআউট মডাল ক্লিন টেক্সট দেখাচ্ছে — সব pass, কোনো কনসোল এরর নেই।

**⚠️ ডিপ্লয়ের সময় বিশেষভাবে মনে রাখতে হবে:** `Code.gs`-এর `getDoctorProfile()` বদল হয়েছে বলে Apps Script-এ **অবশ্যই নতুন deployment version** লাগবে — শুধু ফাইল push করলেই হবে না, Apps Script editor থেকে "New deployment" বা existing deployment-এ "Manage deployments → Edit → Version: New → Deploy" করতে হবে, নইলে এই ফিক্স লাইভ হবে না।

### ✅ 2026-07-15 — Part 27: Access Gate Go-Live যাচাই + Domain Masking সিদ্ধান্ত চূড়ান্ত (এই session)

**কাজ ১ — Google Account Access Gate: অডিট রেজাল্ট (কোড দিক থেকে সম্পূর্ণ, ইতিমধ্যে repo-তে আছে)**
- Repo আবার re-clone করে audit করা হলো (Universal Protocol অনুযায়ী)। কনফার্মড: `AccessGate.gs` ফাইল আগে থেকেই বিদ্যমান এবং স্পেক অনুযায়ী সঠিক — `verifyDashboardAccess_()`, `renderAccessDeniedPage_()`, `addAllowedDashboardEmailsSetting()` (non-destructive row insert), `updateAllowedDashboardEmails(token, emailsCsv)` ও `getAllowedDashboardEmails(token)` (দুটোই `requireDoctor()` guard দিয়ে) — সব ফাংশন উপস্থিত ও সম্পূর্ণ।
- `Code.gs`-এর `doGet()`-এ `page === 'dashboard'` ব্লকের একদম শুরুতেই (App password login-এর আগে) গেট-চেক বসানো কনফার্মড — Access Denied হলে `DoctorDashboard.html`-এর কোনো লাইনও সার্ভ হয় না (লাইন ২৯২-২৯৯)।
- Fail-closed ডিজাইন কনফার্মড: `Session.getActiveUser().getEmail()` খালি হলে (Google login নেই) বা `AllowedDashboardEmails` Settings row খালি হলে — দুই ক্ষেত্রেই ডিফল্ট = block।
- সব `.gs` ফাইল (`AccessGate.gs` সহ ১৩টা) `node --check` দিয়ে syntax-verify করা হলো — সব pass, কোনো error নেই।
- `getSettingValue()` (Auth.gs) ও `setSettingValue()` (AppointmentFinance.gs) — দুটো dependency ফাংশনই repo-তে বিদ্যমান কনফার্মড।
- **এই সেশনে নতুন কোনো কোড লাগেনি** — Task 1 আগের সেশনেই সম্পূর্ণ হয়েছিল, এই সেশনে শুধু re-verify করা হলো।
- **Go-Live চেকলিস্ট (ম্যানুয়াল, client-সাইড — এগুলো code audit দিয়ে verify করা যায় না, ডাক্তার/AUMATIQ P3-কে নিজে করে confirm করতে হবে):**
  1. ☐ Apps Script deployment-এর "Who has access" = "Anyone with Google account" (Execute as: "Me" অপরিবর্তিত)।
  2. ☐ `addAllowedDashboardEmailsSetting()` রান হয়েছে ও Settings শীটে `AllowedDashboardEmails` row-তে ডাক্তার+সহকারীর আসল Gmail (কমা দিয়ে, স্পেস ছাড়া) বসানো হয়েছে।
  3. ☐ আন্ডারলাইং Google Sheet-এর Share সেটিং "Restricted" (owner-only) — "Anyone with the link" না।
  4. ☐ টেস্ট: non-whitelisted Google account দিয়ে `?page=dashboard` লোড করলে Access Denied পেজ আসে, whitelisted account দিয়ে app password screen ঠিকমতো আসে।

**কাজ ২ — Cloudflare Worker Domain Masking: Option B (Iframe Wrapper) চূড়ান্ত সিদ্ধান্ত হিসেবে কনফার্মড**
- Client-এর সিদ্ধান্ত: nameserver migration (Cloudflare Worker) **না** করে বিদ্যমান Option B (Part 20-এর iframe wrapper, `admin.html`) দিয়েই থাকা হবে।
- অডিট কনফার্ম করল `admin.html` (repo root) ইতিমধ্যেই সম্পূর্ণ ও live exec URL দিয়ে populated (placeholder না) — real Script ID `1Zog4-dT0h96cJelSmLHHboNv965cXXxdHZopWzHpKqqltguIASXjj77B`-এর exec URL iframe `src` ও `EXEC_URL` ভ্যারিয়েবল দুই জায়গাতেই বসানো আছে।
- **এই সেশনে নতুন কোনো কোড/DNS পরিবর্তন লাগেনি** — Option B আগে থেকেই সক্রিয় প্রোডাকশন ফাইল, কোনো "পুরনো ডুপ্লিকেট" বা dead file নেই যা ডিলিট/রিনেম করতে হবে (আলাদা `dashboard.drasma.aumatiq.com` সাবডোমেইন কখনো বানানো হয়নি বলে `_legacy_unused_admin.html` প্রশ্নটা প্রযোজ্য হয়নি)।
- **জানা ও গৃহীত সীমাবদ্ধতা (client-approved trade-off, বাগ না):** `admin.html`-এর view-source-এ raw `script.google.com/macros/.../exec` URL প্লেইনটেক্সটে দেখা যায় (iframe `src` + `EXEC_URL` ভ্যারিয়েবল)। এটা Cloudflare Worker migration ছাড়া ফিক্স করা সম্ভব না, এবং client এই migration না করার সিদ্ধান্ত নিয়েছে (DNS propagation windows-এ ইমেইল ব্যাহত হওয়ার ঝুঁকির কারণে)। ভবিষ্যতে মত বদলালে migration-এর ধাপগুলো (DNS রেকর্ড ইনভেন্টরি → Cloudflare add domain → nameserver switch → Worker script → route bind) প্রস্তুত আছে, চাইলে নতুন session-এ চালানো যাবে।
- URL রেফারেন্স ফাইল (`DrAsma_ClinicSystem_INFO_URL.txt`) পুনরায় কনফার্ম করা হলো — patient (`https://drasma.aumatiq.com`) ও staff (`https://drasma.aumatiq.com/admin.html`) দুটো ক্লিন URL-ই ইতিমধ্যে সঠিকভাবে ডকুমেন্টেড।

**এই সেশনের সারমর্ম:** কোনো নতুন ফাইল ডেলিভার হয়নি, কারণ audit করে দেখা গেছে Task 1 ও Task 2 দুটোই কোড লেভেলে আগেই সম্পূর্ণ ছিল। এই সেশনের কাজ শুধু verification, client-decision লক-ইন (Option B), এবং ম্যানুয়াল Go-Live চেকলিস্ট তৈরি করা যা AUMATIQ P3/ডাক্তারকে নিজে সম্পন্ন করে কনফার্ম করতে হবে।

**Part 22 checklist ডেলিভার করা হলো (এই সেশনেই, নিচে দেখো):** যেহেতু Claude সরাসরি লাইভ URL browse করতে পারে না (Part 22-এর নিজের স্পেক অনুযায়ী), তাই ৭টা ক্যাটাগরিতে ভাগ করা একটা সম্পূর্ণ manual test checklist ডেলিভার করা হলো (`Part22_Live_Verification_Checklist.md`) — manifest বৈধতা, icon load, PWA installability (Lighthouse + Android/iOS), Access Gate-এর ৪টা নির্দিষ্ট টেস্ট কেস (নতুন, Part 27-এর AccessGate.gs-এর জন্য), staff লগইন ফ্লো, prescription PDF (A4), visiting card QR — প্রতিটাতে ঠিক কী চেক করতে হবে তার বর্ণনা সহ। ক্লায়েন্ট নিজে টেস্ট করে রেজাল্ট রিপোর্ট করলে (নির্দিষ্ট ফরম্যাটে, চেকলিস্টে দেওয়া আছে) root cause বের করে ফিক্স দেওয়া হবে।

**🔜 পরের session-এর জন্য বাকি (ক্রম অনুযায়ী):** উপরের Go-Live চেকলিস্ট (৪টা ম্যানুয়াল ধাপ, Part 27) সম্পন্ন করা → **Part 22 checklist** (৭ ক্যাটাগরি, উপরে বর্ণিত) ধরে ধরে টেস্ট করে রেজাল্ট রিপোর্ট করা → যেকোনো ফেল হওয়া আইটেম ফিক্স করা → সব ✅ হলে **Part 23** (Client Handover Package — Bangla ইউজার গাইড, credential শীট, maintenance নোট)।
