# AUMATIQ — Dr. Asma Doctor Automation System
## Master Project Plan + Individual Part-Prompts (v2.0)

**তৈরির তারিখ:** জুলাই ৯, ২০২৬ (v2.0 আপডেট — নতুন ইনস্ট্রাকশন যোগ)
**Repo (anchor/এনকোর):** `https://github.com/aumatiq/DA-P3WD-Pink-SkyBlue`
**ক্লায়েন্ট:** ডা. আসমা বিনতে খায়ের (গাইনি ও প্রসূতিবিদ্যা বিশেষজ্ঞ, ল্যাপারোস্কপি সার্জন)

---

## এই ডকুমেন্টটি কীভাবে ব্যবহার করবে (v2.0 — নতুন সহজ পদ্ধতি)

**শুধু এই ফাইলটাই যেকোনো নতুন চ্যাটে আপলোড/যোগ করবে, তারপর একলাইনে বলবে:**
> "Part 7 কর" / "Part 12 শুরু করো" ইত্যাদি।

আর কিছু কপি-পেস্ট করার দরকার নেই — পুরো context (repo, stack, schema,
role rules, brand) এই একটা ফাইলেই আছে। Claude নিজে থেকেই নিচের
**সর্বজনীন প্রোটোকল** অনুসরণ করবে।

---

## 🔒 সর্বজনীন প্রোটোকল — যেকোনো PART শুরু করার আগে (বাধ্যতামূলক)

যখনই কোনো Part-এর কমান্ড আসবে, এই ক্রম **কখনো বাদ না দিয়ে** পালন করতে হবে:

### ধাপ ১ — নিজে থেকে প্রস্তুতি (চুপচাপ, ইউজারকে জিজ্ঞেস না করেই)
- রিপো clone/re-clone করে সর্বশেষ অবস্থা পড়ে নেবে:
  `git clone https://github.com/aumatiq/DA-P3WD-Pink-SkyBlue.git`
  — Access না পেলে কাজ শুরু না করে আগে জানাবে।
- সেই নির্দিষ্ট Part-এর কাজের ধরন অনুযায়ী কোন স্কিল লাগবে তা নিজে থেকেই
  বুঝে খুঁজে পড়ে নেবে — উদাহরণ:
  - UI/ওয়েবসাইট/ড্যাশবোর্ড পার্ট → `frontend-design` skill
  - Visiting card/PDF output → `pdf` skill
  - Word/docx handover ডকুমেন্ট → `docx` skill
  - স্প্রেডশিট এক্সপোর্ট সংক্রান্ত কিছু → `xlsx` skill
  - এর বাইরে প্রাসঙ্গিক যেকোনো স্কিল থাকলে সেটাও
  এই ধাপ **নীরবে** হবে — ইউজারকে "স্কিল পড়ছি" বলে জানানোর দরকার নেই।

### ধাপ ২ — স্পষ্টীকরণ প্রশ্ন (বাধ্যতামূলক, কোনো কোড লেখার আগেই)
প্রতিটা Part-এর প্রম্পটের নিচে "🔎 স্পষ্টীকরণ প্রশ্ন" নামে একটা তালিকা
দেওয়া আছে — ওই থেকে প্রাসঙ্গিকগুলো (এবং প্রয়োজনে নতুন) option-আকারে
(A/B/C ধরনের সংক্ষিপ্ত চয়েস) জিজ্ঞেস করবে। প্রশ্নের মধ্যে **অবশ্যই**
থাকবে:
1. ওই Part-এর জন্য যা যা এখনও অস্পষ্ট (scope-related)।
2. **আউটপুট ফরম্যাট** — সম্পূর্ণ ফাইল (downloadable) নাকি নির্দিষ্ট
   অংশের diff/patch; একবারে সব নাকি ধাপে ধাপে review করে করে করবে;
   ইত্যাদি।
3. রোল/পারমিশন সংক্রান্ত কোনো সিদ্ধান্ত যদি PART 0-তে স্পষ্ট না থাকে।

উত্তর পাওয়ার পরই কাজ শুরু করবে। ছোটখাটো ব্যাপারে যুক্তিসঙ্গত ধরে নিয়ে
বলে দেওয়া ঠিক আছে (assumption বলে দিয়ে এগিয়ে যাওয়া), কিন্তু বড়
সিদ্ধান্ত/আউটপুট ফরম্যাট নিশ্চিত না হয়ে পুরো কাজ শুরু করবে না।

### ধাপ ৩ — ডেলিভারি
PART 0-এ বলা ডেলিভারি স্ট্যান্ডার্ড মেনে সম্পূর্ণ, কপি-পেস্ট-রেডি,
placeholder-মুক্ত আউটপুট দিবে — ঠিক কোন ফাইলে কোথায় বসবে তা স্পষ্ট বলবে।

---

## রিপোতে যা ইতিমধ্যে আছে + যা নতুন করে পাওয়া গ্যাপ (Audit v2.0)

| ফাইল | কী আছে |
|---|---|
| `Code.gs` | `doGet()` router, Public booking, Patient portal login (PatientID+Phone), সব email template, daily reminder trigger |
| `Auth.gs` | Role-based session (15-মিনিট sliding), guards |
| `PatientModule.gs` | Patient CRUD, নাম/ফোন সার্চ (autocomplete UI নাই) |
| `AppointmentFinance.gs` | Slot booking, Finance **আগে থেকেই Doctor-only** |
| `Prescription.gs` | Prescription save + PDF + WhatsApp/Email delivery |
| `DashboardAdapter.gs` | Dashboard data adapter |
| `PWASetup.gs` + `manifest.json` | দুইটা আলাদা PWA manifest |
| `DoctorDashboard.html` | সেকেন্ড-সহ লাইভ ক্লক + Bangla + Hijri date **ইতিমধ্যেই আছে** |
| `PublicWebsite.html` | সব মূল section আছে, language toggle/dark-light নাই |
| `CNAME` | `drasma.aumatiq.com` সেট করা আছে |

### Gap Analysis (v1.0 + v2.0 নতুন সংযোজন)
1. Patient login flow বদলাতে হবে (নাম-অটোকমপ্লিট + মোবাইল পাসওয়ার্ড)।
2. **পারমিশন বাগ:** `saveAppointmentData()`/`savePatientData()` Edit
   মোডেও Assistant-কে অনুমতি দিচ্ছে; Delete ফাংশনই নেই।
3. Language toggle (EN/BN) নেই।
4. Dark/Light auto theme নেই।
5. Visiting card নেই।
6. Two-URL clean subdomain সেটআপ নেই (এখন শুধু query param)।
7. Future-app-tab scaffold নেই।
8. **(নতুন) Time slot এন্ট্রি বাগ:** এখনো free-text/custom-keyboard
   টাইপ করে time slot দেওয়া যাচ্ছে (booking + dashboard দুই জায়গাতেই),
   যেটা format-mismatch সিঙ্ক বাগের মূল কারণ — click-based selector
   দরকার।
9. **(নতুন) Settings → Website auto-sync নেই স্পষ্টভাবে:** ডাক্তার
   Settings-এ কিছু আপডেট করলে তা পাবলিক ওয়েবসাইটে অটোমেটিক প্রতিফলিত
   হওয়ার নিশ্চয়তা এখনো explicit না — ভেরিফাই ও নিশ্চিত করতে হবে।
10. **(নতুন) Finance ভবিষ্যতের Personal Finance App-এর সাথে সহজে যুক্ত
    হওয়ার মতো কাঠামো নেই** — এখন শুধু ভেতরের Finance ট্যাবে যোগ হয়,
    ভবিষ্যতে আলাদা ওয়েব অ্যাপে export/sync করার হুক নেই।
11. **(নতুন) ব্যাপক Security Hardening এখনো audit করা হয়নি** (শুধু
    role-permission ঠিক করাই যথেষ্ট না — XSS, brute-force, sheet-sharing
    সেটিংস, audit log ইত্যাদি বাকি)।
12. **(নতুন) Doctor's Blog/Articles মডিউল নেই** — লেখা/আপলোড/হাতে-লেখা
    ছবি থেকে OCR/প্রিভিউ/পাবলিশ/এডিট/প্রিন্ট কিছুই নেই।
13. **(নতুন) Recommended Doctors মডিউল নেই।**

---
---

# PART 0 — SHARED FOUNDATION (সব সময় Claude নিজে এই পুরো ফাইল থেকে পড়ে নেবে)

```
তুমি AUMATIQ-এর জন্য কাজ করছ। এটা "ডা. আসমা বিনতে খায়ের" নামে একজন
গাইনি ও প্রসূতিবিদ্যা বিশেষজ্ঞ ও ল্যাপারোস্কপি সার্জনের জন্য একটা সম্পূর্ণ
Doctor Automation System-এর একটা অংশ। ডক্টর খুলনা মেডিকেল কলেজ হাসপাতালের
সহকারী অধ্যাপক (সরকারি গেজেটেড অফিসার) এবং আরও দুইটা প্রাইভেট চেম্বারে বসেন।

REPO (এটাকে "anchor"/বেসলাইন হিসেবে ধরবে — যা ভালো আছে রাখবে, উন্নত করবে,
কোনো কিছু আগের চেয়ে খারাপ করবে না):
https://github.com/aumatiq/DA-P3WD-Pink-SkyBlue

প্রথমেই clone করে পুরোটা পড়ে নাও:
  git clone https://github.com/aumatiq/DA-P3WD-Pink-SkyBlue.git
Access করতে না পারলে কাজ শুরু কোরো না — আগে জানাও।

স্ট্যাক ও আর্কিটেকচার (বদলাবে না):
- Backend: Google Apps Script + Google Sheets (database) + Gmail
- Frontend: Single-file HTML (inline CSS+JS) — PublicWebsite.html,
  DoctorDashboard.html
- Deployment: Apps Script Web App (`/exec`), GitHub = code backup +
  (ভবিষ্যতে) clasp auto-deploy
- WhatsApp: বিনামূল্যে wa.me click-to-chat লিংক (paid API না, যদি না
  স্পষ্ট করে বলা হয়)
- হোস্টিং সম্পূর্ণ ফ্রি — paid tool শেষ বিকল্প হিসেবেও সাজেস্ট করলে খরচ
  স্পষ্ট বলবে

Google Sheets Tabs (schema — দরকার হলে নতুন কলাম/ট্যাব যোগ করা যাবে,
পুরনো কলাম মুছবে না):
- Patients (PatientID: PT-YYYY-XXXX)
- Appointments (AppointmentID)
- TestRecords
- Finance (Doctor-only — এবং ভবিষ্যতে আলাদা Personal Finance App-এ
  export হবে — নিচে বিস্তারিত)
- DoctorProfile
- Settings (Doctor-only)
- Categories (CategoryGroup, Value, IsSystemDefault, IsActive, AddedBy,
  DateAdded)
- (ভবিষ্যতে যোগ হতে পারে: Articles, RecommendedDoctors, AuditLog —
  প্রাসঙ্গিক Part-এ বিস্তারিত)

Role ও Permission নিয়ম (চূড়ান্ত):
- DOCTOR: সব কিছু (Add/Edit/Delete, Finance, Settings, Blog publish,
  Recommended Doctors, সব রিপোর্ট)
- RECEPTIONIST/ASSISTANT: Patient/Appointment শুধু ADD করতে পারবে, Edit/
  Delete পারবে না। Finance/Settings/Blog-publish/Recommended-Doctors
  একদমই access করতে পারবে না।
- PATIENT: শুধু নিজের রেকর্ড দেখবে/ডাউনলোড/প্রিন্ট করবে, বুকিং করবে,
  পাবলিক ব্লগ/রিকমেন্ডেড ডক্টর দেখবে (এগুলো সবার জন্য পাবলিক, লগইন
  লাগবে না)।

Session: 15-মিনিট sliding expiration — বদলাবে না।

**🔐 নিরাপত্তা (Security) — এটা একটা non-negotiable core principle,
প্রতিটা Part-এ মাথায় রাখতে হবে (বিস্তারিত Part 17-এ):**
- ডাক্তার ছাড়া আর কেউ যেন কোনোভাবেই Finance ডেটা দেখতে/access করতে না
  পারে — কোনো API response-এ ভুলবশত finance field include হবে না।
- Session token predictable/guessable হবে না।
- Public-facing যেকোনো endpoint (autocomplete, booking) rate-limit ও
  minimal-data-exposure নীতি মানবে।
- Google Sheet-এর sharing setting সবসময় Private থাকতে হবে (Apps
  Script সার্ভার-সাইড এক্সিকিউশনের জন্য sheet public করার দরকার নেই)।

**💰 ভবিষ্যতের Personal Finance App ইন্টিগ্রেশন (নতুন নিয়ম):**
ডাক্তারের সম্পূর্ণ ব্যক্তিগত ফিন্যান্স (শুধু ক্লিনিক আয় না, সামগ্রিক
personal finance) ভবিষ্যতে একটা **আলাদা ওয়েব অ্যাপে** ম্যানেজ হবে।
এই সিস্টেমের Finance entry (appointment payment) সেই ভবিষ্যৎ অ্যাপে সহজে
sync/export হওয়ার মতো ভাবে স্ট্রাকচার করতে হবে (stable unique ID, ISO
timestamp, source tag) — কিন্তু **এখনই কোনো live integration/webhook
বানানোর দরকার নেই**, শুধু future-ready রাখতে হবে (বিস্তারিত Part 6-এ)।

**🔄 Settings → Public Website Auto-Sync (নতুন নিয়ম):**
ডাক্তার Settings/Doctor-Profile-এ (চেম্বারের ঠিকানা/সময়, ডাক্তারের বায়ো/
ছবি/ডিগ্রি, ক্লিনিক-আওয়ার ইত্যাদি) যা কিছু আপডেট করবেন, তা পাবলিক
ওয়েবসাইটে **অটোমেটিক** প্রতিফলিত হবে — কোনো হার্ডকোড করা তথ্য
PublicWebsite.html-এ সরাসরি লেখা থাকবে না; সবকিছু `getDoctorProfile()`/
`getSettingsData()`-জাতীয় ফাংশন দিয়ে ডায়নামিকভাবে আসবে (বিস্তারিত Part 1
ও Part 8-এ)।

ব্র্যান্ড আইডেন্টিটি (ক্লায়েন্টের নিজের, AUMATIQ-ব্র্যান্ড না):
- Rose Pink: #E8608A | Deep Plum/Indigo: #7C3AED | Teal (সহায়ক)
- Elegant/luxury medical direction, পরিমার্জিত প্যালেট বানানো যাবে কিন্তু
  মূল identity থেকে সরবে না।
- Typography: distinctive display font + readable body font (Google
  Fonts)।

ভাষার নিয়ম:
- ব্যাখ্যা/instruction: বাংলায়। কোড/ফাইলনাম/ভ্যারিয়েবল: ইংরেজিতে।
- ওয়েবসাইট UI: ন্যাচারালি ইংরেজি + সম্পূর্ণ human-Bangla টগল অপশন
  (রোবোটিক translation না)।

ডক্টরের তথ্য (রেফারেন্স):
- নাম: ডা. আসমা বিনতে খায়ের
- ডিগ্রি: এমবিবিএস (ডিএমসি), এমএস (বিএমইউ), বিসিএস (স্বাস্থ্য)
- বিশেষত্ব: স্ত্রীরোগ ও প্রসূতিবিদ্যা বিশেষজ্ঞ ও ল্যাপারোস্কপি সার্জন
- পদবি: সহকারী অধ্যাপক (অবস্ এন্ড গাইনি), খুলনা মেডিকেল কলেজ হাসপাতাল
- বিশেষ অভিজ্ঞতা: বন্ধ্যাত্ব চিকিৎসা, IUI, হাইরিস্ক প্রেগন্যান্সি, গাইনি
  ক্যান্সার, ব্যথামুক্ত নরমাল ডেলিভারি
- চেম্বার ১: ইসলামী ব্যাংক হাসপাতাল খুলনা, ৪২ খানজাহান আলী রোড। সময়:
  বিকাল ৩টা–৫টা। সিরিয়াল: ০১৭১২-০৬৮৬৮৪
- চেম্বার ২: ডক্টরস পয়েন্ট স্পেশালাইজড হাসপাতাল, ৪৯ কেডিএ এভিনিউ। সময়:
  বিকাল ৫টা–সন্ধ্যা ৭টা। সিরিয়াল: ০১৭৯৫-৩৮৩৮০৩
- ইমেইল: clinic.drasma@gmail.com
- ডোমেইন: drasma.aumatiq.com

ডেলিভারির মান: সম্পূর্ণ, copy-paste-ready, কোনো placeholder ছাড়া। কোন
ফাইল কোথায় বসবে তা স্পষ্ট বলবে।
```

---

# PART 1 — Public Website: Professional Redesign

```
কাজ: `PublicWebsite.html`-কে পূর্ণাঙ্গ, আন্তর্জাতিক মানের প্রফেশনাল ডক্টর
ওয়েবসাইট হিসেবে পুনর্নির্মাণ করো — বিদ্যমান sections (hero, about, svcs,
stats, hrs, testi, faq, bk, portal) অ্যাঙ্কর ধরে উন্নত করো।

Requirements:
1. Hero, About/Credentials, Chambers/Locations (দুই চেম্বার, ঠিকানা,
   সময়সূচি, সিরিয়াল, Maps লিংক), Services, Booking (backend অপরিবর্তিত)।
2. Patient Portal entry শেল (ভেতরের লজিক Part 2/3-এ)।
3. **নতুন — Doctor's Blog/Articles বিভাগের entry point** (পুরো মডিউল
   Part 18-এ হবে, এখানে শুধু nav link + section শেল রাখো)।
4. **নতুন — Recommended Doctors বিভাগের entry point** (পুরো মডিউল Part
   19-এ হবে, এখানে শুধু nav link + section শেল রাখো)।
5. Language toggle (EN⇄BN) — sessionStorage/in-memory (Apps Script
   sandbox-এ localStorage ভরসাযোগ্য না)।
6. Dark/Light theme — `prefers-color-scheme` auto-detect + manual
   override।
7. ফন্ট কোথাও ভাঙবে/চ্যাপ্টা হবে না (clamp() সহ, 375px→desktop)।
8. SEO — meta/OG tags।
9. **🔄 Settings→Website Auto-Sync (বাধ্যতামূলক):** চেম্বারের তথ্য,
   ডাক্তারের বায়ো/ছবি/ক্লিনিক আওয়ার — এসবের **একটাও হার্ডকোড HTML-এ
   লেখা থাকবে না।** পেজ লোড হওয়ার সময় `getDoctorProfile()`/
   `getSettingsData()`-জাতীয় ফাংশন কল করে ডায়নামিকভাবে বসবে, যেন Doctor
   Settings থেকে কিছু বদলালে ওয়েবসাইটে অটোমেটিক আপডেট হয়।
10. Design direction: elegant/luxury medical, Rose Pink + Deep Plum +
    Teal ভিত্তিক পরিমার্জিত প্যালেট।

Output: সম্পূর্ণ নতুন `PublicWebsite.html` (single file, GAS templating
syntax অক্ষুণ্ণ)।

Dependencies: Part 2/3 (Portal internals), Part 18 (Blog), Part 19
(Recommended Doctors), Part 8 (Settings backend যা ডেটা সাপ্লাই করবে)।

🔎 স্পষ্টীকরণ প্রশ্ন (উদাহরণ):
- ব্লগ ও রিকমেন্ডেড-ডক্টর সেকশন এখনই ফুল-ডিজাইন করব নাকি শুধু placeholder
  card রাখব (Part 18/19 পরে বসবে)?
- Hero-তে ডাক্তারের ছবি ব্যবহার করা হবে (আপলোড করা লাগবে) নাকি
  আপাতত initials/icon-ভিত্তিক ডিজাইন?
- আউটপুট: একবারে পুরো ফাইল, নাকি section-ধরে-ধরে review করে করে?
```

---

# PART 2 — Patient Portal Login System (নাম-অটোকমপ্লিট + মোবাইল পাসওয়ার্ড)

```
কাজ: রোগীর পোর্টাল লগইন — Username = নাম (live autocomplete), Password =
রেজিস্টার্ড মোবাইল নম্বর।

Backend (নতুন, পুরনো মুছবে না):
1. `PatientModule.gs` → `searchPatientNamesForAutocomplete(query)` —
   নাম+বয়স+ফোনের শেষ ৩ ডিজিট রিটার্ন (privacy-safe), ২ অক্ষরের কম হলে
   কিছু রিটার্ন করবে না, **rate-limit সচেতন** (Part 17 দেখো)।
2. `patientPortalLoginByName(patientId, mobileNumber)` — পুরনো
   `patientPortalLogin(patientId, phone)` **রাখবে** (fallback)।
3. মোবাইল নম্বর normalize করে (স্পেস/ড্যাশ/+৮৮ prefix বাদ দিয়ে শেষ ১১
   ডিজিট) মেলাবে।
4. **নিরাপত্তা:** ভুল পাসওয়ার্ড বারবার দিলে temporary lockout (Part 17
   অনুযায়ী)।

Frontend: live dropdown (debounce 300ms), নাম+মোবাইল ফিল্ড, স্পষ্ট এরর
মেসেজ (EN+BN), "নতুন? বুকিং করুন" লিংক।

Dependencies: Part 1 (শেল), Part 3 (dashboard session ব্যবহার করবে),
Part 17 (security)।

🔎 স্পষ্টীকরণ প্রশ্ন (উদাহরণ):
- একই নামে একাধিক patient থাকলে dropdown-এ বয়স+ফোন ছাড়া আর কী তথ্য
  দেখানো উচিত (যেমন শেষ ভিজিটের তারিখ)?
- ভুল পাসওয়ার্ড কতবার দিলে lockout হবে, কতক্ষণের জন্য?
- আউটপুট: শুধু নতুন ফাংশন/diff নাকি সম্পূর্ণ ফাইল?
```

---

# PART 3 — Patient Portal Dashboard (রেকর্ড ভিউ/ডাউনলোড/প্রিন্ট)

```
কাজ: লগইন-পরবর্তী Patient Portal Dashboard — প্রোফাইল সামারি, upcoming/
past appointments, Prescriptions (preview+print), Test Records
(approved-only দৃশ্যমান), self-upload, print-friendly `@media print`
A4 layout। Financial তথ্য রোগী কখনোই দেখবে না।

Dependencies: Part 2 (session), বিদ্যমান `getMyRecords`/
`getMyPrescriptions`/`patientSelfUpload` রিইউজ।

🔎 স্পষ্টীকরণ প্রশ্ন (উদাহরণ):
- Pending-review টেস্ট রিপোর্ট রোগীকে কি স্ট্যাটাস-ব্যাজ আকারে দেখাবে
  নাকি একদমই লুকাবে?
- রোগী কি নিজের প্রোফাইল তথ্য (ঠিকানা/ইমেইল) নিজে এডিট করতে পারবে, নাকি
  শুধু ক্লিনিকে জানিয়ে বদলাতে হবে?
- আউটপুট ফরম্যাট প্রেফারেন্স?
```

---

# PART 4 — Doctor Dashboard Core + Patient 360° Profile View

```
কাজ: `DoctorDashboard.html` অ্যাঙ্কর ধরে উন্নত করো।

**রাখতে হবে (উন্নত করতে পারো):** সেকেন্ড-সহ লাইভ ক্লক + Bangla/Hijri
তারিখ (রঙিন, প্রতিটা তারিখ-টাইপ আলাদা accent, ফন্ট না ভেঙে) —
Gregorian তারিখও নিশ্চিত করো আছে কিনা।

**নতুন/উন্নত:**
1. Nav পুনর্গঠন: Dashboard/Overview → Patients → Appointments →
   Follow-ups → Communications → Settings (doctor-only)। **এবং নতুন
   doctor-only আইটেম:** Articles/Blog (Part 18), Recommended Doctors
   (Part 19) — এই দুইটা nav-এ শুধু Doctor role-এ দেখাবে।
2. Patient Search → 360° Profile View (এক স্ক্রিনে সব ভিজিট/
   প্রেসক্রিপশন/টেস্ট হিস্ট্রি, নতুন প্রেসক্রিপশন শুরু করার এন্ট্রি
   পয়েন্ট)।
3. Role-based UI enforcement (Assistant-এর জন্য Edit/Delete/Finance/
   Settings/Blog/Recommended-Doctors বাটন hidden/disabled)।
4. Appointment এন্ট্রিতে **time slot ক্লিক-করে-বাছাই UI** ব্যবহার করবে
   (বিস্তারিত ও ফিক্স Part 16-এ, এখানে শুধু সেই কম্পোনেন্ট hook করো)।
5. Future App Tabs placeholder (`AVAILABLE_MODULES` registry, বিস্তারিত
   Part 9)।
6. ফন্ট/রেসপনসিভনেস 375px→desktop।

Dependencies: Part 5, 6, 7, 9, 16, 17, 18, 19।

🔎 স্পষ্টীকরণ প্রশ্ন (উদাহরণ):
- Overview ড্যাশবোর্ডে আজকের অ্যাপয়েন্টমেন্ট/আয়ের সামারি — Assistant কি
  আয়ের সংখ্যা ছাড়া বাকি সব সামারি দেখতে পারবে?
- Patients লিস্ট ডিফল্ট sort কীসের ভিত্তিতে (সর্বশেষ ভিজিট/নাম/ID)?
- আউটপুট: একবারে পুরো ফাইল নাকি ট্যাব-ধরে-ধরে?
```

---

# PART 5 — Prescription Writing, Preview, Print

```
কাজ: বিদ্যমান `Prescription.gs` ফাংশনগুলো রিইউজ করে লেখা/এডিট/লাইভ
প্রিভিউ/রিভিউ/প্রিন্ট/WhatsApp-Email delivery flow বানাও (RX-XXXX ID)।

Output: `Prescription.gs`-এ নতুন সাপোর্ট ফাংশন (থাকলে) + Dashboard-এর
Prescription writer UI।

Dependencies: Part 4 (entry point), Part 6 (হ্যান্ডঅফ)।

🔎 স্পষ্টীকরণ প্রশ্ন (উদাহরণ):
- ওষুধের নাম লেখার সময়ও কি Categories শীট থেকে autocomplete suggestion
  চান, নাকি সম্পূর্ণ free-text থাকবে?
- আগের প্রেসক্রিপশন কপি করে নতুন একটা বানানোর ("repeat prescription")
  অপশন লাগবে কিনা?
- আউটপুট ফরম্যাট প্রেফারেন্স?
```

---

# PART 6 — Appointment Close + Financial Entry Flow (Doctor-Only, Future-App-Ready)

```
কাজ: Prescription শেষে Appointment "Close" ফ্লো — Doctor হলে পেমেন্ট
মোডাল (Amount, Method, Notes) → `addFinanceEntry` দিয়ে সেভ + appointment
"Completed"। Assistant হলে পেমেন্ট মোডাল **আসবেই না** — status
"Completed - Pending Payment Entry" হয়ে Doctor-এর queue-তে যাবে।

**💰 নতুন — ভবিষ্যতের Personal Finance App-এর জন্য Future-Ready
কাঠামো:**
ডাক্তারের সম্পূর্ণ ব্যক্তিগত ফিন্যান্স ভবিষ্যতে একটা **আলাদা** ওয়েব
অ্যাপে ম্যানেজ হবে, যেখানে এই সিস্টেমের ক্লিনিক-আয় এন্ট্রি হিসেবে যোগ
হবে। এখনই কোনো actual integration/webhook বানানোর দরকার নেই, শুধু:
1. প্রতিটা Finance entry-তে stable unique `EntryID`, ISO 8601
   timestamp, `Source: "DrAsmaClinicSystem"` ট্যাগ, category, amount,
   payment-method যোগ করো (schema আপডেট, `Finance` শীটে কলাম যোগ করলে
   পুরনো ডেটা যেন না ভাঙে সেভাবে migration-safe করো)।
2. একটা নতুন Doctor-only ফাংশন
   `exportFinanceEntriesForExternalApp(token, startDate, endDate)`
   বানাও যেটা clean, structured JSON রিটার্ন করবে (ভবিষ্যতে Personal
   Finance App এটা API দিয়ে পুল করতে পারবে, বা এখন manual JSON
   export/download হিসেবেও কাজে লাগবে)।
3. এটাকে এমনভাবে ডিজাইন করো যেন ভবিষ্যতে এই ফাংশনকে সহজে একটা proper
   webhook/API endpoint-এ রূপান্তর করা যায় — কিন্তু এখন শুধু এই
   ফাংশনটাই যথেষ্ট।

Output: `AppointmentFinance.gs` আপডেট + Close-Appointment/Payment modal
+ Finance summary UI।

Dependencies: Part 5, Part 17 (Finance access security)।

🔎 স্পষ্টীকরণ প্রশ্ন (উদাহরণ):
- `exportFinanceEntriesForExternalApp` এখনই একটা "Download as JSON"
  বাটন হিসেবে ড্যাশবোর্ডে দেখাবো, নাকি শুধু ব্যাকএন্ড ফাংশন হিসেবে রেখে
  দেব (ভবিষ্যতে ব্যবহারের জন্য)?
- পেমেন্ট মেথডের লিস্ট (Cash/bKash/Nagad/Card...) Categories শীট থেকে
  আসবে — এখন কী কী মেথড অ্যাড থাকা উচিত?
- আউটপুট ফরম্যাট প্রেফারেন্স?
```

---

# PART 7 — Backend Permission Hardening (জরুরি নির্দিষ্ট বাগ ফিক্স)

```
কাজ: (এটা independent, সবচেয়ে আগে করা উচিত — শুধু নির্দিষ্ট বাগ ফিক্স;
ব্যাপক security audit-এর জন্য Part 17 দেখো)

Gap ১ — `saveAppointmentData()`: `editId` present হলে ভেতরে আলাদা
`requireDoctor(token)` চেক যোগ করো; না থাকলে (নতুন তৈরি)
`requireDoctorOrReceptionist` অপরিবর্তিত।

Gap ২ — `savePatientData()` ও `editPatient()`: এডিট-পাথ সবসময়
`requireDoctor` (নতুন-তৈরি পাথ `requireDoctorOrReceptionist` থাকবে)।

Gap ৩ — Delete ফাংশন নেই। নতুন বানাও (Doctor-only, soft-delete
`IsDeleted` কলাম দিয়ে):
- `PatientModule.gs` → `deletePatient(token, patientId)`
- `AppointmentFinance.gs` → `deleteAppointment(token, appointmentId)`

Gap ৪ — ডাবল-চেক করো Finance/Settings-সংক্রান্ত সব ফাংশন `requireDoctor`
দিয়ে গার্ড করা আছে কিনা।

Output: `PatientModule.gs`, `AppointmentFinance.gs`,
`DashboardAdapter.gs`-এর আপডেটেড কোড (কী বদলাল আলাদা করে হাইলাইট করো)।

Dependencies: নেই — independent, সবার আগে করা ভালো।

🔎 স্পষ্টীকরণ প্রশ্ন (উদাহরণ):
- Soft-delete করা Patient/Appointment Doctor Dashboard-এ কি একটা
  "Recently Deleted" ভিউতে কিছুদিন দেখা যাবে (restore অপশনসহ), নাকি
  একদমই লিস্ট থেকে সরে যাবে?
- আউটপুট: শুধু diff/patch নাকি তিনটা ফাইলের সম্পূর্ণ কোড?
```

---

# PART 8 — Settings Module উন্নতি + Website Auto-Sync নিশ্চিতকরণ

```
কাজ: বিদ্যমান Settings ট্যাব অ্যাঙ্কর ধরে উন্নত করো (আগের চেয়ে খারাপ না)।

**🔄 বাধ্যতামূলক নতুন অংশ — Settings→Website Sync ভেরিফিকেশন:**
নিশ্চিত করো Settings-এ যা কিছু Doctor বদলাবে (চেম্বারের ঠিকানা/সময়/
সিরিয়াল, ডাক্তারের বায়ো/ছবি/ডিগ্রি-তালিকা, ক্লিনিক আওয়ার) তা
`saveDoctorProfile`/`updateClinicHours`-এর মাধ্যমে সেভ হওয়ার সাথে সাথেই
পরবর্তী পাবলিক-ওয়েবসাইট লোডে (রিফ্রেশ/re-fetch) স্বয়ংক্রিয়ভাবে
প্রতিফলিত হয় — কোনো ক্যাশিং লেয়ার যেন পুরনো ডেটা আটকে না রাখে (Apps
Script-এ সাধারণত caching সমস্যা কম, তবু PropertiesService/ScriptCache
ব্যবহার করা থাকলে TTL ছোট রাখতে হবে বা প্রতি সেভে cache invalidate করতে
হবে)।

অন্যান্য উন্নতি: দুই চেম্বারের তথ্য আলাদা ম্যানেজ UI, পাসওয়ার্ড বদল UI,
Categories Add/Deactivate/Restore UI পরিষ্কার করা, WhatsApp/Email
টেমপ্লেট প্রিভিউ+এডিট UI।

Output: Settings section-এর সম্পূর্ণ কোড + প্রয়োজনীয় backend helper।

Dependencies: Part 1 (website যেই ডেটা টানবে), Part 4 (shell)।

🔎 স্পষ্টীকরণ প্রশ্ন (উদাহরণ):
- চেম্বারের সংখ্যা কি ভবিষ্যতে দুইয়ের বেশি হতে পারে (তৃতীয় চেম্বার
  যোগ হতে পারে)? — সেই অনুযায়ী UI dynamic (Add Chamber বাটন) রাখব কিনা।
- ডাক্তারের প্রোফাইল ছবি আপলোডের জন্য কি Google Drive folder ব্যবহার
  করব (PatientFiles-এর প্যাটার্নে একটা "ProfileAssets" ফোল্ডার)?
- আউটপুট ফরম্যাট প্রেফারেন্স?
```

---

# PART 9 — Future App-Tabs Extensibility Scaffold

```
কাজ: ভবিষ্যতে নতুন app মডিউল যোগ করার জন্য `MODULE_REGISTRY` কাঠামো
(id, label EN+BN, icon, enabled, renderFn, roles) — `enabled:false`
মডিউল nav-এ দেখাবে না। কমেন্টে সম্পূর্ণ ডামি উদাহরণ দাও।

Output: DoctorDashboard.html-এর nav-রেন্ডারিং অংশে diff + ব্যাখ্যা।

Dependencies: Part 4।

🔎 স্পষ্টীকরণ প্রশ্ন (উদাহরণ):
- এখন থেকেই কি Articles/Recommended-Doctors মডিউলদুটোকেও এই
  Registry-প্যাটার্নে ফিট করাব (enabled:true রেখে), নাকি ওই দুটো
  স্থায়ী/core ফিচার হিসেবে registry-র বাইরে সরাসরি nav-এ থাকবে?
- আউটপুট: শুধু কোড স্নিপেট/diff, নাকি ফুল ফাইল?
```

---

# PART 10 — WhatsApp + Email Automation (Free-First)

```
কাজ: বিদ্যমান email templates + wa.me click-to-chat লিংক রিভিউ ও সম্পূর্ণ
করো — সব ইভেন্টে (booking confirm, reminder, prescription, test result)
Email+WhatsApp দুটোই অপশন আছে কিনা, রোগীর `PreferredContact` অনুসরণ করে
কিনা।

Cost নোট: wa.me পদ্ধতির সীমাবদ্ধতা (এক-ক্লিক, পুরোপুরি অটো না) স্পষ্ট
করে লিখো, ফুল-অটো চাইলে সবচেয়ে কম খরচের বিকল্প (Twilio WhatsApp) খরচসহ
উল্লেখ করো — ডিফল্ট হিসেবে সাজেস্ট করবে না।

Dependencies: Part 2, Part 5/6।

🔎 স্পষ্টীকরণ প্রশ্ন (উদাহরণ):
- `PreferredContact` কলাম Patients শীটে এখন যোগ করব, নাকি আপাতত দুটোই
  (Email+WhatsApp) সবসময় পাঠানো থাকবে?
- আউটপুট: ফাংশন কোড + ছোট মার্কডাউন সামারি — এটাই ঠিক আছে?
```

---

# PART 11 — Domain, Hosting & Two-URL Architecture

```
কাজ: দুইটা পরিষ্কার সাবডোমেইন (`drasma.aumatiq.com` রোগীর জন্য,
`staff.drasma.aumatiq.com` স্টাফের জন্য) — GitHub Pages branded redirect
পেজ দিয়ে (সম্পূর্ণ ফ্রি) `?page=dashboard` query param URL-এ পাঠাবে।
Hostinger hPanel DNS CNAME setup ধাপে-ধাপে বাংলা গাইড।

Output: দুইটা redirect HTML ফাইল + আপডেটেড DEPLOYMENT_GUIDE.md সেকশন +
DNS গাইড।

Dependencies: নেই — independent।

🔎 স্পষ্টীকরণ প্রশ্ন (উদাহরণ):
- Staff সাবডোমেইনের নাম `staff.drasma.aumatiq.com` ঠিক আছে, নাকি অন্য
  কিছু (যেমন `admin.drasma.aumatiq.com`) পছন্দ?
- redirect পেজে loading spinner ছাড়াও AUMATIQ/ক্লিনিক লোগো দেখাবো
  কিনা?
```

---

# PART 12 — International-Standard Visiting Card

```
কাজ: Front+back visiting card (3.5×2 inch, bleed সহ), PART 0-এর ডক্টর
তথ্য থেকে হুবহু কনটেন্ট, Rose Pink+Deep Plum+Teal luxury palette, QR
কোড (ওয়েবসাইট/বুকিং পেজে), print-ready PDF + PNG প্রিভিউ।

Method: `pdf` skill পড়ে Python (PIL/ReportLab) দিয়ে exact positioning।

Output: `dr_asma_visiting_card_front_back.pdf` + `..._preview.png`।

Dependencies: Part 11 (URL চূড়ান্ত)।

🔎 স্পষ্টীকরণ প্রশ্ন (উদাহরণ):
- QR কোড স্ক্যান করলে সরাসরি Booking সেকশনে নিয়ে যাবে নাকি হোমপেজে?
- মনোগ্রাম/আইকন ডিজাইনে "AK" initials নাকি একটা abstract medical
  আইকন পছন্দ?
```

---

# PART 13 — PWA Manifests, Icons & Install Experience

```
কাজ: বিদ্যমান PWA সেটআপ অডিট/ফাইনালাইজ — দুইটা manifest, আইকন (Patient
vs Staff app আলাদা ভিজুয়াল), offline.html/sw.js প্রাসঙ্গিকতা, "Add to
Home Screen" ইনস্ট্রাকশন কার্ড (Android+iPhone, বাংলা)।

Dependencies: Part 1/4 (ব্র্যান্ড কালার), Part 11 (URL)।

🔎 স্পষ্টীকরণ প্রশ্ন (উদাহরণ):
- আইকনে ডাক্তারের ছবি/লোগো ব্যবহার করব নাকি টাইপোগ্রাফিক মনোগ্রাম?
```

---

# PART 14 — QA: Fonts, Responsiveness, Dark/Light, Print

```
কাজ: সম্পূর্ণ ফাইল পেস্ট করে "রিভিউ করো" বললে — font rendering (সব
breakpoint), dark/light contrast, language-toggle layout shift, print
CSS, role-based visibility, accessibility basics — চেকলিস্ট অনুযায়ী
bug+fix লিস্ট (ফাইল+লাইন রেফারেন্সসহ)।

Dependencies: বাকি সব পার্টের পরে/পাশাপাশি।

🔎 স্পষ্টীকরণ প্রশ্ন (উদাহরণ):
- কোন নির্দিষ্ট ফাইল/সেকশন রিভিউ করব, নাকি পুরো রিপো একসাথে?
```

---

# PART 15 — Client Handover Package

```
কাজ: `Client_Welcome_Packet.html`, `DEPLOYMENT_GUIDE.md`,
`WhatsApp_Templates...`, `Email_Template...` আপডেট — চূড়ান্ত URL, ধাপে-
ধাপে নন-টেকনিক্যাল গাইড (Doctor+Assistant কাজ, Patient portal গাইড,
কার্ড প্রিন্ট নির্দেশনা, Add-to-Home-Screen, troubleshooting)।

Dependencies: বাকি সব পার্ট শেষে, সবার শেষে করা হবে।

🔎 স্পষ্টীকরণ প্রশ্ন (উদাহরণ):
- হ্যান্ডওভার প্যাকেজ HTML+PDF দুই ফরম্যাটেই চান, নাকি একটাই যথেষ্ট?
```

---

# PART 16 — Time Slot Selector Fix (Booking + Dashboard) 🆕

```
কাজ: বর্তমান বাগ ঠিক করো — এখন Appointment সময় (Time Slot) ফ্রি-টেক্সট/
কাস্টম কিবোর্ডে টাইপ করে দেওয়া যায় (বুকিং ফর্ম এবং Dashboard Appointment
Add/Edit ফর্ম দুই জায়গাতেই), যা format-mismatch সিঙ্ক বাগের কারণ (যেমন
"6:00 PM" বনাম "06:00 PM" — এক জায়গায় zero-padded, আরেক জায়গায় না,
ফলে string-compare ফেইল করে ও ডাবল-বুকিং/সিঙ্ক-এরর হয়)।

সমাধান (দুই জায়গাতেই একই কম্পোনেন্ট রিইউজ করবে):
1. **কোনো ফ্রি-টেক্সট টাইম ইনপুট থাকবে না।** পরিবর্তে একটা ক্লিকযোগ্য
   বাটন-গ্রিড বা ড্রপডাউন — যেটা ডাক্তারের Settings-এ কনফিগার করা
   ক্লিনিক-আওয়ার + স্লট-ডিউরেশন (বিদ্যমান `getClinicHours`,
   `getAvailableSlots`, `getPublicBookingSlots`) থেকে **ডায়নামিকভাবে**
   জেনারেট হবে।
2. ইতিমধ্যে বুক হয়ে যাওয়া স্লট disabled/greyed-out দেখাবে (আবার সিলেক্ট
   করা যাবে না)।
3. **ক্যানোনিকাল ফরম্যাট:** সব জায়গায় (স্টোরেজ+তুলনা) সময় একটাই
   ইন্টারনাল ফরম্যাটে (যেমন 24-ঘণ্টা `"HH:mm"`) রাখা হবে — 12-ঘণ্টা
   AM/PM ফরম্যাট শুধু **display-এর জন্য** কনভার্ট হবে, স্টোরেজ/তুলনায়
   না। বিদ্যমান `timeStringToMinutes`/`minutesToDisplayTime`
   ফাংশনগুলো এই একক-ফরম্যাট নীতির সাথে align করে রিভিউ/দরকার হলে ঠিক
   করো।
4. বুকিং সফল হওয়ার সাথে সাথে সেই স্লট immediately unavailable দেখাবে
   (re-fetch slot list after successful booking — Apps Script-এ
   real-time websocket নেই, তাই booking-সফল হওয়ার পরপরই client-side
   optimistic update + এক রিফ্রেশ কল যথেষ্ট)।
5. এই একই Time-Slot-Picker কম্পোনেন্ট Public Booking ফর্ম (Part 1) এবং
   Doctor Dashboard Appointment Add/Edit ফর্ম (Part 4) — দুই জায়গাতেই
   ব্যবহার হবে (কোড ডুপ্লিকেট না করে একটা shared JS ফাংশন হিসেবে)।

Output: `AppointmentFinance.gs`/`Code.gs`-এ যদি স্লট-ফরম্যাট সংক্রান্ত
ফিক্স লাগে তার কোড, এবং shared Time-Slot-Picker UI কম্পোনেন্টের সম্পূর্ণ
HTML/CSS/JS (দুই ফাইলেই কীভাবে বসবে সেই instruction সহ)।

Dependencies: Part 1, Part 4 (যেখানে বসবে), Part 8 (ক্লিনিক-আওয়ার
কনফিগ)।

🔎 স্পষ্টীকরণ প্রশ্ন (উদাহরণ):
- স্লট-ডিউরেশন (যেমন প্রতি ১৫/২০/৩০ মিনিটে একটা স্লট) ডাক্তার কি
  Settings থেকে নিজে বদলাতে পারবেন, নাকি এটা fixed থাকবে?
- একই সময়ে একাধিক রোগী বুক করতে চাইলে (race condition — দুইজন একই
  মুহূর্তে একই স্লট সিলেক্ট করলে) কীভাবে হ্যান্ডল করব — "first come first
  serve" এরর মেসেজ দেখিয়ে refresh করাবো?
- আউটপুট ফরম্যাট প্রেফারেন্স?
```

---

# PART 17 — Security & Data Protection Hardening (ব্যাপক) 🆕

```
কাজ: Part 7 শুধু নির্দিষ্ট permission বাগ ঠিক করে — এই পার্টে সম্পূর্ণ
সিস্টেমের ব্যাপক নিরাপত্তা অডিট করো, লক্ষ্য: **"ডাক্তার ছাড়া অন্য কেউ
যেন কোনোভাবেই ডেটা দেখতে না পারে বা সিস্টেম হ্যাক করতে না পারে।"**

চেকলিস্ট (প্রতিটা যাচাই করো এবং গ্যাপ পেলে ফিক্স দাও):

1. **Data leak prevention:** `getPatientsData`, `getAppointmentsData`,
   `getTestRecordsData` ইত্যাদি — কোনো response-এ ভুলবশত Finance-related
   field/column চলে আসছে কিনা যাচাই করো (whitelist-based field
   selection ব্যবহার করো, পুরো row blindly পাঠানো এড়াও)।
2. **Session security:** টোকেন cryptographically random কিনা
   (`Utilities.getUuid()` বা সমমানের — sequential/predictable ID না),
   টোকেনের ভেতরে কোনো readable PII (নাম/ফোন) embed করা নেই তো?
3. **Brute-force protection:** `roleLogin` (Doctor/Assistant password)
   এবং নতুন Patient name+mobile লগইন (Part 2) — দুই জায়গাতেই একটা
   simple attempt-counter (PropertiesService বা একটা "LoginAttempts"
   শীটে identifier+timestamp+count রেখে) বানাও যা ৫টা ভুল চেষ্টার পর
   কিছুক্ষণের (যেমন ১৫ মিনিট) জন্য lock করবে।
4. **XSS prevention:** যেকোনো ইউজার-ইনপুট (patient name, notes,
   prescription free-text, Blog article body — Part 18) যখন HTML-এ
   ফেরত রেন্ডার হয়, escape/sanitize করে render হচ্ছে কিনা (raw
   `innerHTML` এড়িয়ে `textContent` বা explicit escape helper ব্যবহার
   করো); Blog article body-র ক্ষেত্রে শুধু নির্দিষ্ট allowed HTML
   ট্যাগ (bold/italic/image/paragraph) ছাড়া বাকি স্ক্রিপ্ট ট্যাগ strip
   করে দিবে (sanitization allowlist)।
5. **Autocomplete/public endpoint hardening:** নাম-অটোকমপ্লিট (Part 2)
   পাবলিক/anonymous — নিশ্চিত করো এটা কখনো পুরো ফোন/ঠিকানা/মেডিকেল ডেটা
   রিটার্ন করে না, এবং প্রতি রিকোয়েস্টে সর্বোচ্চ কয়টা রেজাল্ট
   (যেমন সর্বোচ্চ ১০টা) রিটার্ন করবে তা limit করো।
6. **Sheet sharing setting:** স্পষ্ট instruction দাও যে backend Google
   Spreadsheet-টা অবশ্যই **Private** (শুধু ডাক্তারের Google account-এর
   owner/editor হিসেবে) থাকতে হবে — কখনোই "Anyone with the link"
   করা যাবে না, কারণ Apps Script সার্ভার-সাইড এক্সিকিউশন
   (`executeAs: USER_DEPLOYING`) sheet public হওয়ার দরকার নেই।
7. **Audit log:** একটা নতুন `AuditLog` শীট-ট্যাব প্রস্তাব করো (Timestamp,
   Role, ActionType, TargetID, Details) — Edit/Delete/Finance-entry-র
   মতো গুরুত্বপূর্ণ অ্যাকশনে একটা লগ-এন্ট্রি যোগ হবে, শুধু Doctor এটা
   দেখতে পারবে (`getAuditLog(token)`, `requireDoctor`)। এটা কে-কখন-কী
   করল তার accountability/hack-detection ট্রেইল হিসেবে কাজ করবে।
8. **URL/SEO exposure:** স্টাফ ড্যাশবোর্ড URL/পেজে
   `<meta name="robots" content="noindex, nofollow">` যোগ করো যেন
   সার্চ ইঞ্জিনে ইনডেক্স না হয়; redirect পেজে (Part 11)
   `rel="noreferrer"` প্রাসঙ্গিক জায়গায় ব্যবহার করো।
9. **HTTPS:** নিশ্চিত করো সব লিংক/redirect সবসময় HTTPS (Apps Script
   `/exec` এমনিতেই HTTPS, GitHub Pages redirect-ও HTTPS enforce করে —
   ডাবল-চেক করো)।
10. **Console/debug leak:** প্রোডাকশন কোডে কোনো `console.log(token)`,
    `console.log(password)` বা সমমানের sensitive-data logging আছে
    কিনা পুরো কোডবেসে গ্রেপ করে বের করো ও সরাও।

Output: প্রতিটা আইটেমের জন্য (ক) বর্তমান অবস্থা কী পাওয়া গেল, (খ) ফিক্স
থাকলে সেই ফাইলের সম্পূর্ণ আপডেটেড কোড, (গ) নতুন শীট/কলাম লাগলে তার সেটআপ
কোড।

Dependencies: Part 7 (basic permission fix আগে হওয়া ভালো), Part 2
(login flow), Part 18 (blog sanitization)।

🔎 স্পষ্টীকরণ প্রশ্ন (উদাহরণ):
- Audit Log কতদিনের পুরনো এন্ট্রি রাখব (unlimited নাকি, যেমন ১ বছর পর
  auto-archive)?
- Brute-force lockout ৫ বার/১৫ মিনিট — এই সংখ্যা ঠিক আছে নাকি অন্য
  ভ্যালু চান?
- আউটপুট: একবারে সব ১০ আইটেম, নাকি ধাপে ধাপে (যেমন প্রথমে
  ১-৫, তারপর ৬-১০) রিভিউ করে করে করব?
```

---

# PART 18 — Doctor's Blog / Articles Module 🆕

```
কাজ: ডাক্তারের ব্যক্তিগত ব্লগ/আর্টিকেল সিস্টেম — Doctor Dashboard-এ
লেখা/আপলোড/পাবলিশ, Public Website-এ সুন্দর প্রদর্শন।

নতুন Sheet Tab: `Articles` (ArticleID, Title, BodyHtml/DriveDocLink,
CoverImageURL, Status [Draft/Published], AuthorName, PublishedDate,
LastEditedDate, Tags)।

Doctor Dashboard — Compose করার ৩টা উপায়:
1. **সরাসরি লেখা** — Rich text editor (bold/italic/heading/bullet/
   image-insert সহ, কিন্তু arbitrary script/HTML না — Part 17-এর
   sanitization allowlist মেনে) — ভেতরে ছবি insert করলে সুন্দর ফরম্যাটে
   (caption সহ, inline) বসবে।
2. **আপলোড** — বিদ্যমান ডকুমেন্ট (docx/pdf/text) আপলোড করলে তা থেকে
   টেক্সট বের করে editor-এ বসবে (এডিট করা যাবে)।
3. **হাতে-লেখা পাতার ছবি → OCR:** ডাক্তার হাতে লেখা পাতার ছবি তুললে
   (upload) সেটা **সম্পূর্ণ সঠিকভাবে টেক্সটে কনভার্ট** হবে। ফ্রি-স্ট্যাক
   পদ্ধতি: Google Drive API-এর built-in OCR ব্যবহার করো — ছবি Drive-এ
   আপলোড করে Google Docs ফরম্যাটে কনভার্ট করলে (Drive Advanced Service
   / `Drive.Files.copy` with `ocr: true` অথবা Docs API দিয়ে) automatic
   OCR হয়ে টেক্সট বের হয়ে আসে, খরচ ছাড়াই (Google Workspace-এর মধ্যেই)।
   এই OCR-করা টেক্সট editor-এ বসবে, ডাক্তার রিভিউ/এডিট করে নিতে
   পারবেন (বাংলা হাতের লেখার ক্ষেত্রে OCR accuracy সীমিত হতে পারে —
   এই সীমাবদ্ধতা স্পষ্ট করে ডাক্তারকে জানিয়ে দিবে, এবং রিভিউ ধাপ
   বাধ্যতামূলক রাখবে)।
4. যেকোনো পদ্ধতিতে লেখার পর **Preview মোড** — এডিট বা Publish।
5. Publish হওয়ার পর যেকোনো সময় আবার Edit করা যাবে, নতুন ছবি যোগ করা
   যাবে।
6. **Print:** যেকোনো আর্টিকেল প্রিভিউ করে এডিট করে তারপর প্রিন্ট করা
   যাবে (`window.print()` + `@media print` A4 layout, ছবি সহ সুন্দর
   ফরম্যাটে)।

Public Website:
- "Blog"/"Articles" সেকশন — card-grid লিস্ট (cover image, title, তারিখ,
  reading-time), ক্লিক করলে ফুল আর্টিকেল পেজ (সুন্দর টাইপোগ্রাফি, ছবি
  ইনলাইন-ক্যাপশন সহ)।
- শুধু `Status: Published` আর্টিকেল পাবলিক দেখাবে, Draft না।
- ছবি স্টোরেজ: বিদ্যমান PatientFiles-এর প্যাটার্নে একটা আলাদা
  "ArticleAssets" Google Drive ফোল্ডার ব্যবহার করবে।

Output: নতুন `Articles.gs` (বা DashboardAdapter.gs-এ যোগ) ব্যাকএন্ড
ফাংশন (`createArticle`, `editArticle`, `publishArticle`,
`getPublishedArticles`, `ocrImageToText_`), Dashboard Compose UI, Public
Website Blog section — সবগুলোর সম্পূর্ণ কোড।

Dependencies: Part 1 (entry point), Part 4 (nav), Part 17 (sanitization
rules), Part 8 (Drive folder pattern রেফারেন্স)।

🔎 স্পষ্টীকরণ প্রশ্ন (উদাহরণ):
- আর্টিকেল লেখা/পাবলিশ শুধু Doctor-ই করবে, নাকি Assistant draft লিখে
  রাখতে পারবে আর শুধু Doctor publish করবে?
- বাংলা হাতের লেখার OCR accuracy সীমিত হতে পারে — এটা মেনে নিয়ে
  এগোবো, নাকি ইংরেজি হাতের লেখার জন্যই এই ফিচার প্রাধান্য দেব?
- আর্টিকেলে Category/Tag (যেমন "Pregnancy Tips", "PCOS") রাখা লাগবে
  কিনা?
- আউটপুট ফরম্যাট প্রেফারেন্স?
```

---

# PART 19 — Recommended Doctors Module 🆕

```
কাজ: ডাক্তার তার পছন্দের/রিকমেন্ডেড অন্য ডাক্তারদের প্রোফাইল যোগ করতে
পারবেন Dashboard-এর Settings থেকে, যা Public Website-এ রোগীরা দেখতে
পারবে।

নতুন Sheet Tab: `RecommendedDoctors` (ID, Name, Specialty,
PhotoURL/DriveLink, Chamber/ContactInfo, Note/Reason, DisplayOrder,
IsActive)।

Doctor Dashboard (Doctor-only, Settings-এর অংশ হিসেবে বা আলাদা ছোট nav
আইটেম):
- Add/Edit/Remove রিকমেন্ডেড ডক্টর এন্ট্রি (নাম, specialty, ছবি,
  যোগাযোগ তথ্য, সংক্ষিপ্ত কারণ/নোট, ক্রম)।
- ছবি স্টোরেজ Drive folder প্যাটার্ন (Part 8/18-এর মতো)।

Public Website:
- একটা নতুন সেকশন/পেজ "Recommended Doctors" — কার্ড আকারে (ছবি, নাম,
  specialty, সংক্ষিপ্ত নোট, যোগাযোগ) — শুধু `IsActive: true` এন্ট্রি
  দেখাবে, `DisplayOrder` অনুযায়ী সাজানো।

Output: নতুন backend ফাংশন (`addRecommendedDoctor`,
`editRecommendedDoctor`, `removeRecommendedDoctor`,
`getActiveRecommendedDoctors`), Dashboard UI, Public Website section —
সবগুলোর সম্পূর্ণ কোড।

Dependencies: Part 1 (entry point), Part 4 (nav), Part 8 (Settings
প্যাটার্ন)।

🔎 স্পষ্টীকরণ প্রশ্ন (উদাহরণ):
- একসাথে সর্বোচ্চ কতজন রিকমেন্ডেড ডক্টর দেখানো হবে (limit আছে কিনা)?
- এখানে কি সরাসরি ওই ডাক্তারের ফোন/হোয়াটসঅ্যাপ নম্বর ক্লিকযোগ্য করে
  দেব, নাকি শুধু তথ্য-প্রদর্শনী (ক্লিক করা যাবে না)?
- আউটপুট ফরম্যাট প্রেফারেন্স?
```

---

## সারসংক্ষেপ — কোন অর্ডারে করা ভালো (v2.0)

| ক্রম | পার্ট | কারণ |
|---|---|---|
| ১ | Part 7 (Permission bug fix) | জরুরি, independent |
| ২ | Part 17 (Security hardening) | Part 7-এর পরপরই, বাকি সবকিছুর ভিত্তি |
| ৩ | Part 11 (Domain/URL) | বাকি সব পার্ট এই URL-এর উপর নির্ভর করবে |
| ৪ | Part 1 (Public Website shell) | |
| ৫ | Part 2 (Patient login) | |
| ৬ | Part 3 (Patient portal dashboard) | |
| ৭ | Part 4 (Doctor dashboard core) | |
| ৮ | Part 16 (Time slot fix) | Part 1 ও 4-এর booking form-এর সাথে |
| ৯ | Part 5 (Prescription) | |
| ১০ | Part 6 (Finance/Close flow) | |
| ১১ | Part 8 (Settings + sync) | |
| ১২ | Part 9 (Future tabs scaffold) | |
| ১৩ | Part 18 (Blog/Articles) | |
| ১৪ | Part 19 (Recommended Doctors) | |
| ১৫ | Part 10 (WhatsApp/Email) | |
| ১৬ | Part 12 (Visiting card) | Part 11 শেষ হলে URL চূড়ান্ত |
| ১৭ | Part 13 (PWA/Icons) | |
| ১৮ | Part 14 (QA pass) | সব শেষে |
| ১৯ | Part 15 (Handover package) | একদম শেষে |

---

*v2.0 — এই ডকুমেন্ট AUMATIQ Master Brain v3.0 নিয়ম অনুসরণ করে তৈরি।
প্রতিটা Part এখন স্বয়ংসম্পূর্ণ + শুরুতে স্পষ্টীকরণ প্রশ্ন করার
প্রোটোকল-সহ। শুধু এই একটা ফাইল যেকোনো চ্যাটে দিয়ে "Part [N] কর" বললেই
পুরো প্রক্রিয়া (repo read → skill read → clarifying questions →
delivery) স্বয়ংক্রিয়ভাবে শুরু হবে। নতুন কোনো সিদ্ধান্ত/পরিবর্তন এলে
শুধু প্রাসঙ্গিক অংশ আপডেট করলেই চলবে।*
