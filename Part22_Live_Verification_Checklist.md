# Part 22 — Live Verification Checklist
### Dr. Asma Clinic System — Production Sign-off
**তারিখ:** ______________  **যাচাইকারী:** ______________

> নিয়ম: প্রতিটা আইটেম বাস্তব ডিভাইস/ব্রাউজারে টেস্ট করে ✅ বা ❌ বসাও। কোনো ❌ পেলে সেই আইটেমের নিচে কী হয়েছে লিখে রাখো — পরের সেশনে সেটা নিয়ে ফিক্স করব।

---

## A. PUBLIC WEBSITE — `https://drasma.aumatiq.com`

### A1. বেসিক লোড
- [ ] সাইট লোড হয়, blank/error পেজ আসে না
- [ ] Browser DevTools → Console-এ কোনো লাল এরর নেই (F12 → Console ট্যাব)
- [ ] Favicon/PWA icon ঠিকভাবে দেখাচ্ছে ব্রাউজার ট্যাবে

### A2. ভাষা টগল (EN ↔ BN)
- [ ] Hero সেকশন উভয় ভাষায় সঠিক টেক্সট দেখায়
- [ ] Testimonial, Stat counter, "My Records" (nav + hero দুটোই) — bn মোডে ঠিক আছে
- [ ] টগল করার পর `sessionStorage`-এ ভাষা persist করছে (পেজ রিফ্রেশ করলেও bn/en ঠিক থাকে)
- [ ] ডাক্তারের বাংলা নাম/ঠিকানা (`sDrNameBn`/`sAddressBn`) সঠিকভাবে দেখাচ্ছে bn মোডে (আগের সেশনে খালি থাকলে — এখন পূরণ করা আছে কিনা চেক করো)

### A3. মূল প্যাশেন্ট ফ্লো
- [ ] Appointment booking ফর্ম — slot select, date picker, confirm — সব কাজ করে
- [ ] Booking confirm হওয়ার পর Google Sheet-এ সঠিক row যোগ হয় (Sheet খুলে verify করো)
- [ ] Patient Login / My Records — সঠিক History দেখায়
- [ ] File Upload ফ্লো — আপলোড হওয়া ফাইল Drive folder-এ (`ClinicPatientFiles`) পৌঁছায়
- [ ] Blog ও Recommended Doctors সেকশন লোড হয়, ভাঙা লিংক নেই

### A4. রেসপনসিভ (viewport)
- [ ] 1440px (ডেস্কটপ) — কোনো layout ভাঙা নেই
- [ ] 390px (মোবাইল) — horizontal scroll/overflow নেই, বাটন ট্যাপযোগ্য
- [ ] iOS Safari + Android Chrome — দুই আসল ডিভাইসে (বা BrowserStack/আসল ফোনে) একবার সরাসরি চেক করো — emulator যথেষ্ট না

### A5. PWA ইনস্টল
- [ ] "Add to Home Screen" প্রম্পট আসে (Android Chrome)
- [ ] ইনস্টল করা আইকন সঠিক (patient-facing icon, staff icon না)

---

## B. ACCESS GATE + DOCTOR DASHBOARD — `https://drasma.aumatiq.com/admin.html`

⚠️ এই সেকশনের প্রতিটা টেস্ট **আসল Google account দিয়ে করতে হবে** — আমি এটা করতে পারব না।

### B1. Non-whitelisted account
- [ ] whitelist-এ নেই এমন Google account দিয়ে ব্রাউজার লগইন করা অবস্থায় `admin.html` খুলে দেখো
- [ ] **Access Denied** পেজ আসে (ব্র্যান্ডেড, dashboard-এর কোনো ডেটা/লাইন দেখা যায় না)
- [ ] View-source / Network tab চেক করো — Access Denied অবস্থায় patient ডেটা কোনোভাবে leak হচ্ছে না

### B2. Whitelisted account (ডাক্তার)
- [ ] ডাক্তারের Gmail দিয়ে লগইন অবস্থায় `admin.html` খুললে app password login screen আসে (Google gate পাস হয়ে যায়)
- [ ] সঠিক app password দিলে Dashboard লোড হয় — Patients, Appointments, Finance, Settings সব ট্যাব খোলে
- [ ] ভুল app password দিলে যথাযথ error (dashboard content leak হয় না)

### B3. Whitelisted account (সহকারী)
- [ ] সহকারীর Gmail দিয়েও একই ফ্লো কাজ করে (গেট পাস + app password + dashboard access)

### B4. Session/logout behavior
- [ ] Google account থেকে logout করে আবার `admin.html` খুললে যথাযথভাবে ব্লক হয় (আগের সেশন cache থেকে bypass হয় না)
- [ ] অন্য ব্রাউজার/incognito-তে একই টেস্ট রিপিট করে দেখো — consistent behavior

### B5. Domain masking (admin.html iframe wrapper)
- [ ] `admin.html` খোলা অবস্থায় address bar-এ `drasma.aumatiq.com/admin.html`-ই থাকে (raw `script.google.com` URL দেখা যায় না)
- [ ] View-source করলে raw exec URL দেখা যাচ্ছে এটা known limitation হিসেবে গ্রহণযোগ্য (Option B-এর সীমাবদ্ধতা — Cloudflare migration না করার সিদ্ধান্ত অনুযায়ী)
- [ ] PWA manifest ইনস্টল করলে সঠিক staff icon/নাম দেখায় (patient app-এর সাথে গুলিয়ে যায় না)

---

## C. DATA INTEGRITY

- [ ] Dashboard থেকে করা একটা টেস্ট এন্ট্রি (appointment/patient) Public Website-এর সংশ্লিষ্ট ভিউতে সঠিকভাবে দেখা যায়
- [ ] Financial entry (Part 6) সঠিক সংখ্যায় যোগ/বিয়োগ হচ্ছে
- [ ] Audit log (`logAuditEvent_`) — Access Gate ও sensitive action-গুলো Security শীটে লগ হচ্ছে কিনা চেক করো

---

## D. চূড়ান্ত সাইন-অফ

- [ ] উপরের সব সেকশন ✅ — কোনো ❌ বাকি নেই
- [ ] বাকি থাকা কোনো আইটেম থাকলে তালিকা করে পরবর্তী ফিক্স সেশনে দাও
- [ ] সব ✅ হলে **Part 23 (Client Handover)** শুরু করার জন্য প্রস্তুত

---
*এই চেকলিস্ট সম্পন্ন/আংশিক সম্পন্ন করে ফলাফল (কোন আইটেম ❌, কী হয়েছে) আমাকে জানালেই আমি সেই অনুযায়ী ফিক্স করব এবং master plan-এ Part 22 লগ করে দেব।*
