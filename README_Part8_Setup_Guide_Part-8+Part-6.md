# Part 8 (+ Part 6 Finance) — সেটআপ গাইড
**প্রজেক্ট:** DA-P3WD-Pink-SkyBlue (Dr. Asma Clinic System)
**রিপো:** `aumatiq/DA-P3WD-Pink-SkyBlue`

---

## 📦 এই ডেলিভারিতে যা আছে

| ফাইল | কী করতে হবে |
|---|---|
| `AppointmentFinance.gs` | **পুরো ফাইলটা replace করুন** (repo-তে একই নামের ফাইলের পুরো কনটেন্ট বদলে দিন) |
| `Code_gs_PATCH.md` | `Code.gs` ও `DashboardAdapter.gs`-এ ৪টা find-and-replace প্যাচ |
| `DoctorDashboard_html_PATCH.md` | `DoctorDashboard.html`-এ ১১টা find-and-replace/insert প্যাচ |

কোনো ফাইলই স্ক্র্যাচ থেকে লেখা লাগবে না — শুধু উপরের নির্দেশনা অনুযায়ী paste করুন।

---

## 🚀 ইনস্টল করার ক্রম (এই ক্রমেই করুন)

1. **AppointmentFinance.gs** — GitHub Desktop-এ repo খুলুন → Apps Script Editor-এ
   গিয়ে `AppointmentFinance.gs` ফাইলের পুরো কনটেন্ট মুছে এই নতুন ফাইলের কনটেন্ট
   পেস্ট করুন।
2. **Code_gs_PATCH.md**-এর ৪টা প্যাচ একে একে `Code.gs` ও `DashboardAdapter.gs`-এ বসান।
3. **DoctorDashboard_html_PATCH.md**-এর ১১টা প্যাচ ক্রমানুসারে `DoctorDashboard.html`-এ বসান।
4. Apps Script এডিটরে **Save** করুন (Ctrl+S / বা মেনু থেকে)।
5. **Deploy → Manage deployments → Edit (✏️) → Version: New version → Deploy**
   (নতুন ভার্সন ডিপ্লয় না করলে পরিবর্তন Live Web App URL-এ আসবে না)।
6. Doctor Dashboard-এ লগইন করে **Finance** ট্যাব ও **Settings** ট্যাবের নতুন
   কার্ডগুলো (External Finance App Sync, Drive Folder Overrides, Profile Photo,
   Chambers) একবার খুলে দেখুন — প্রথমবার Settings লোড হলেই `FinanceApiKey`
   অটোমেটিক জেনারেট হয়ে যাবে, কিছু করতে হবে না।
7. GitHub Desktop দিয়ে commit করুন:
   `feat: Part 6+8 — Finance module, external sync, payment proof upload, drive folder overrides — Dr. Asma system`

---

## 🧠 আমি যেসব অনুমান (assumption) করেছি — জেনে রাখুন

তুমি যেসব প্রশ্নের উত্তর দিয়েছ সেগুলো অনুযায়ীই মূল কাঠামো বানানো হয়েছে। বাকি
ছোটখাটো ডিজাইন সিদ্ধান্তগুলো (যেগুলো নিয়ে আগে থেকে জিজ্ঞেস করিনি) —

- **Payment Method তালিকা** — Categories শীটে নতুন গ্রুপ না বানিয়ে সরাসরি
  Cash / bKash / Nagad / Card / Bank Transfer হার্ডকোড করা হয়েছে (বাংলাদেশ
  ক্লিনিকের জন্য এই ৫টাই সবচেয়ে কমন)। চাইলে পরে Categories-ভিত্তিক dropdown-এ
  কনভার্ট করে দেওয়া যাবে।
- **Payment Proof ফাইল প্রাইভেট রাখা হয়েছে** (ANYONE_WITH_LINK শেয়ারিং দেওয়া
  হয়নি) — কারণ এতে টাকার অংক, রোগীর নাম, কখনো bKash নম্বরও থাকতে পারে। Dashboard-এ
  দেখতে `getPaymentProofImage()` দিয়ে base64 হিসেবে টেনে আনা হয় (শুধু Doctor)।
  শুধু **ডাক্তারের প্রোফাইল ছবিই** ব্যতিক্রম হিসেবে পাবলিক লিংক পায়, কারণ সেটা
  ওয়েবসাইটে সবাই দেখবে।
- **একাধিক চেম্বার** — Dynamic "+ Add Chamber" লিস্ট হিসেবে বানানো হয়েছে
  (২টায় সীমাবদ্ধ না রেখে, যত খুশি যোগ করা যাবে)। ডেটা `ChambersJSON` ফিল্ডে
  JSON array আকারে সেভ হয়। **পাবলিক ওয়েবসাইটে (PublicWebsite.html) এখনো এই
  চেম্বার লিস্ট রেন্ডার করার UI যোগ করা হয়নি** — সেটা Part 1-এর স্কোপ, ডেটা রেডি
  আছে, চাইলে পরের সেশনে যোগ করে দেব।
- **Mobile bottom nav** এখন ৬টা আইটেম হয়ে গেছে (Overview/Today/Patients/Tests/
  Finance/Settings) — ছোট স্ক্রিনে একটু টাইট লাগতে পারে, দেখে যদি ঠিক না লাগে
  জানিও, ছোট ফন্ট/আইকনে অ্যাডজাস্ট করে দেব।
- **External Finance App নিজে তৈরি করা হয়নি** — কারণ সেই অ্যাপের কোনো রিপো/স্কোপ
  এখনো ঠিক করা হয়নি। এই ডেলিভারিতে শুধু এই ক্লিনিক সিস্টেমের দিক থেকে যা যা রেডি
  থাকা দরকার (push webhook + pull API + API key) সেটা বানানো হয়েছে। ভবিষ্যতে
  যখন সেই Personal Finance App বানানো শুরু হবে, তখন শুধু Settings থেকে কপি করা
  Web App URL + API Key ওই অ্যাপের নিজের সেটিংসে একবার বসালেই কানেক্ট হয়ে যাবে।

---

## ✅ Settings → Website Auto-Sync (যাচাই করা হয়েছে, কোনো ফিক্স লাগেনি)

`PublicWebsite.html` প্রতিটা পেজ-লোডে `getDoctorProfile()` সরাসরি কল করে, কোনো
caching লেয়ার নেই (`CacheService` শুধু login session token-এর জন্য ব্যবহার হয়,
Profile/Settings ডেটার জন্য না)। তাই Settings-এ কিছু সেভ করলেই তা সাথে সাথে
ওয়েবসাইটে প্রতিফলিত হবে — এটা আগে থেকেই ঠিক ছিল।

**একটা প্রি-এক্সিস্টিং বাগ ফিক্স করা হয়েছে বোনাস হিসেবে:** আগে Photo URL-এ Drive-এর
raw শেয়ার লিংক সেভ হতো যেটা `<img>` ট্যাগে সরাসরি দেখা যেত না। এখন
`uploadDoctorProfilePhoto()` একটা সঠিক embeddable thumbnail URL জেনারেট করে,
তাই ছবি এখন থেকে ওয়েবসাইটে ঠিকমতো দেখাবে।

---

## 🔒 নিরাপত্তা নোট

- Finance-সংক্রান্ত সব ফাংশনই `requireDoctor(token)` দিয়ে গার্ড করা — Assistant/
  Receptionist এই ডেটার কোনো অংশই দেখতে পারবে না, আগের নিরাপত্তা নীতিমালা বজায়
  আছে।
- External pull API (`?action=financeExport&apiKey=...`) session token ছাড়াই
  কাজ করে (এটা প্রয়োজনীয়, কারণ External App-এর কোনো লগইন সেশন নেই), কিন্তু
  `FinanceApiKey` ছাড়া কেউ ডেটা টানতে পারবে না। এই Key কাউকে শেয়ার করবেন না —
  ফাঁস হলে সাথে সাথে Settings থেকে "🔄 Regenerate" চাপুন।
