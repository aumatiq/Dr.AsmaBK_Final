# PART 25 — "My Records" বাগ ফিক্স + গভীর বাংলা লোকালাইজেশন

## 🐛 বাগ ফিক্স: হিরো সেকশনের "My Records" লিংক কাজ করছিল না

**রুট কজ:** গ্লোবাল ফাংশনের নাম ছিল `scrollTo(id)`। এই নামটাই সমস্যা —
প্রতিটা HTML element-এর নিজস্ব বিল্ট-ইন `Element.scrollTo()` মেথড থাকে।
ইনলাইন `onclick="scrollTo('#portal')"` অ্যাট্রিবিউটের ভেতরে ব্রাউজার একটা
implicit `with(element)` স্কোপ ব্যবহার করে, যেখানে element নিজেই প্রথমে চেক
হয় — তাই আমাদের গ্লোবাল ফাংশনের বদলে বাটনের নিজস্ব `scrollTo()` কল হয়ে
যাচ্ছিল, আর সেটা string argument (`'#portal'`) পেয়ে সরাসরি ব্যর্থ হচ্ছিল
(কনসোলে error, UI-তে কিছুই হচ্ছিল না)।

**ফিক্স:** ফাংশনের নাম বদলে `goToSection(id)` করা হয়েছে (৩ জায়গায় —
hero বাটন লাইন ~1388, nav বাটন লাইন ~1343, ফাংশন definition)। এখন কোনো
built-in DOM নামের সাথে সংঘর্ষ নেই।

**যাচাই (Playwright):** hero ও nav — দুই "My Records" বাটনই এখন সঠিকভাবে
`#portal`-এ স্ক্রল করে, EN ও BN দুই ভাষাতেই। Logo click-এর native
`window.scrollTo(top:0)`-ও (যেটা আগে এই bug-এর কারণে global namespace-এ
override হয়ে যাচ্ছিল) এখন ঠিকভাবে কাজ করছে।

---

## 🌐 বাংলা সংখ্যা (Bengali Numerals)

নতুন `bnNum()` হেল্পার — bn মোডে যেকোনো ডিসপ্লে টেক্সটের ০-৯ সংখ্যাকে
বাংলা সংখ্যায় (০-৯) রূপান্তর করে। প্রয়োগ: হিরো stat সংখ্যা, stats
কাউন্টার (ভাষা টগলের পরও সঠিক থাকে — `reformatStatNumbers()`),
YearsExperience, ক্লিনিক আওয়ার সময়, booking slot/date/time, Patient
Portal-এর appointment/test তারিখ, ব্লগ তারিখ, ফোন/হোয়াটসঅ্যাপ নম্বরের
ডিসপ্লে।

**ইচ্ছাকৃত ব্যতিক্রম:** Patient ID, `tel:`/`wa.me` href-এর আসল ডিজিট,
`<input type="date">`/`<input type="tel">`-এর ভ্যালু — এগুলো Western
digit-এই থাকবে (সিস্টেম ম্যাচিং/সার্চ লজিক ও ব্রাউজার ইনপুট রিকোয়ারমেন্ট
রক্ষার জন্য)। নেটিভ ক্যালেন্ডার পিকারের UI ব্রাউজার/OS locale-নির্ভর —
page-level কোড দিয়ে বদলানো যায় না (browser limitation)।

**Backend পরিবর্তন:** `Code.gs`-এর `getPatientRecords()` আগে সার্ভার-সাইডে
হার্ডকোডেড ইংরেজি ফরম্যাটে (`dd MMM yyyy`) তারিখ পাঠাতো — এখন ISO
ফরম্যাটে (`yyyy-MM-dd`) পাঠায়, ক্লায়েন্ট-সাইড `fmtD()` ভাষা অনুযায়ী
বাংলা/ইংরেজি মাসের নাম বসায়।

---

## 🖼️ হিরো সেকশন + টেস্টিমোনিয়াল — সম্পূর্ণ বাংলা

- H1 হেডলাইন ও সাব-টেক্সট এখন `data-i18n-html`/`data-i18n` দিয়ে সম্পূর্ণ
  bilingual (আগে এই দুটোতে কোনো i18n key-ই ছিল না)।
- ৩টা testimonial কার্ডই এখন দুই ভাষাতেই সঠিক (আগে ২টা শুধু ইংরেজি, ১টা
  শুধু বাংলা ছিল — টগল করলেও বদলাতো না)।

---

## ⚙️ Settings-চালিত ডাক্তার তথ্যের জন্য নতুন Bangla ফিল্ড

নতুন ফিল্ড: `DoctorNameBn`, `ClinicNameBn`, `SpecialtyBn`, `DegreeBn`,
`ClinicAddressBn`, `BioBn`, `ServicesListBn`।

- `DashboardAdapter.gs` → `saveDoctorProfile()` whitelist-এ যোগ হয়েছে।
- `DoctorDashboard.html` → Settings ট্যাবে প্রতিটা ইংরেজি ফিল্ডের পাশে
  বাংলা input যোগ হয়েছে — ডাক্তার নিজেই পূরণ/আপডেট করতে পারবেন।
- `PublicWebsite.html` → `renderProfile()`-এ bn→en fallback (Bangla ফিল্ড
  খালি থাকলে ইংরেজিতে fallback করবে, সাইট কখনো ফাঁকা দেখাবে না)।
- **Email ইচ্ছাকৃতভাবে বাইরে রাখা হয়েছে** — সবসময় ইংরেজিতেই থাকবে।
- `getDoctorProfile()` জেনেরিক (Field/Value শীট অটো-পড়ে) — তাই নতুন
  ফিল্ড সেভ হলেই পাবলিক সাইটে অটোমেটিক পৌঁছাবে, read-side কোড বদলাতে
  হয়নি।

**⚠️ পরবর্তী ধাপ:** ডাক্তারের আসল বাংলা নাম ও ঠিকানা এখনো বসানো হয়নি।
Settings ট্যাব থেকে নিজে পূরণ করুন, অথবা AUMATIQ P2-কে টেক্সট দিলে সরাসরি
Google Sheet-এ বসিয়ে দেওয়া যাবে।

---

## 💬 বুকিং/লগইন/পোর্টাল/আপলোড/ব্লগ — সব JS মেসেজ বাংলা

Booking, Login, Patient Portal, Upload, Blog, Recommended Doctors ফ্লো-র
~৩৫টা হার্ডকোডেড ইংরেজি স্ট্রিং (error/success/loading/empty-state, টেবিল
হেডার) এখন `T()` দিয়ে সম্পূর্ণ bilingual।

**স্কোপের বাইরে (এই সেশনে):** Recommended Doctors ও Blog-এর ফ্রি-টেক্সট
কনটেন্ট (ডাক্তার নিজে যা টাইপ করেন) অটো-ট্রান্সলেট হয়নি — শুধু চারপাশের UI
লেবেল বাংলা হয়েছে। ভবিষ্যতে দরকার হলে একই `*Bn` প্যাটার্নে যোগ করা যাবে।

---

## ✅ যাচাই করা হয়েছে

- `node --check` — `PublicWebsite.html`/`DoctorDashboard.html`-এর সব
  ইনলাইন `<script>` ও `Code.gs`/`DashboardAdapter.gs`: সব syntax-valid।
- Playwright (headless Chromium): EN↔BN টগল, হিরো/টেস্টিমোনিয়াল/স্ট্যাট
  কাউন্টার/My Records — সব সঠিক, কোনো কনসোল এরর নেই।
- 1440px ও 390px viewport স্ক্রিনশট — bn মোডে কোনো horizontal overflow
  নেই।

## 📋 ডিপ্লয় চেকলিস্ট

1. GitHub Desktop দিয়ে ৪টা ফাইল push করুন: `PublicWebsite.html`,
   `DoctorDashboard.html`, `Code.gs`, `DashboardAdapter.gs`।
2. Apps Script editor-এ **নতুন deployment version** বানান (`Code.gs`/
   `DashboardAdapter.gs` পরিবর্তনের জন্য এটা জরুরি — নইলে date-format fix
   ও নতুন Bangla ফিল্ড সেভ হবে না)।
3. Dashboard Settings ট্যাব থেকে ডাক্তারের বাংলা নাম/ঠিকানা পূরণ করুন।
4. পাবলিক ওয়েবসাইটে গিয়ে EN↔BN টগল করে সবকিছু আরেকবার চোখে দেখে নিন।
