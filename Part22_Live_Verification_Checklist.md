# Part 22 — End-to-End Live Verification Checklist
### Dr. Asma Doctor Automation System — AUMATIQ

এই চেকলিস্টটা তোমাকে (AUMATIQ P3 / ডাক্তার) নিজে হাতে টেস্ট করতে হবে, কারণ Claude সরাসরি লাইভ URL ব্রাউজ করতে পারে না। প্রতিটা আইটেম টেস্ট করে ☐ বক্সে টিক দাও। কোনো ধাপে সমস্যা পেলে সেই আইটেম নম্বর + স্ক্রিনশট/এরর মেসেজ সহ রিপোর্ট করো — root cause বের করে ফিক্স দেব।

**টেস্ট করার URL দুটো (repo-এর `DrAsma_ClinicSystem_INFO_URL.txt` থেকে কনফার্মড):**
- 🌐 Patient App: `https://drasma.aumatiq.com`
- 👩‍⚕️ Staff/Doctor App: `https://drasma.aumatiq.com/admin.html`

---

## ১. Manifest JSON বৈধতা

☐ Patient app-এ ব্রাউজার DevTools → Application tab → Manifest খুলে দেখো `manifest.json` লোড হচ্ছে কিনা, কোনো red error নেই তো।
☐ Staff app-এও একই চেক করো (`?file=manifest-dashboard` রুট থেকে আসা manifest)।
☐ দুটো manifest-এই `name`, `short_name`, `theme_color`, `icons` array ঠিকভাবে দেখাচ্ছে কিনা কনফার্ম করো (icon URL গুলো broken/404 দেখাচ্ছে না তো)।

## ২. Icon Load

☐ Patient app-এর favicon ব্রাউজার ট্যাবে ঠিকমতো দেখাচ্ছে কিনা (Rose Pink→Teal ভ্যারিয়েন্ট)।
☐ Staff app-এর favicon আলাদা (Deep Plum→Indigo ভ্যারিয়েন্ট) দেখাচ্ছে কিনা — দুটো ট্যাব পাশাপাশি খুলে ভিজ্যুয়ালি কনফার্ম করো যেন গুলিয়ে না যায়।
☐ DevTools → Network tab-এ `/icons/` ও `/icons/staff/` পাথের কোনো ফাইল 404 দিচ্ছে কিনা চেক করো।

## ৩. PWA Installability (Lighthouse)

☐ Chrome DevTools → Lighthouse tab → "Progressive Web App" ক্যাটাগরি সিলেক্ট করে Patient app-এ রান করো — installability সংক্রান্ত কোনো major fail আছে কিনা দেখো।
☐ একই টেস্ট Staff app-এও করো।
☐ Android Chrome-এ সরাসরি ফোন থেকে দুটো URL-ই খুলে "Add to Home Screen" প্রম্পট আসছে কিনা টেস্ট করো (আগের session-এ নোট করা cross-origin manifest fetch রিস্ক-এর জন্য এই ধাপটা বিশেষভাবে গুরুত্বপূর্ণ — না আসলে জানিও, same-origin static manifest fallback বানাতে হবে)।
☐ iPhone Safari-তে "Share → Add to Home Screen" দিয়ে ইনস্টল করে আইকন/নাম ঠিক দেখাচ্ছে কিনা চেক করো (iOS manifest সাপোর্ট সীমিত, তাই apple-touch-icon মেটা ট্যাগই এখানে আসল ভরসা)।

## ৪. Access Gate টেস্ট (Part 27-এ যোগ হওয়া নতুন গুরুত্বপূর্ণ ধাপ)

> ⚠️ এই ধাপ শুরু করার আগে Part 27-এ দেওয়া Go-Live চেকলিস্ট (৪টা ম্যানুয়াল ধাপ — deployment access setting, allowlist emails, sheet share setting) সম্পন্ন করা থাকতে হবে, নইলে নিচের টেস্ট ভুল রেজাল্ট দেবে।

☐ **টেস্ট A (ব্লক হওয়া উচিত):** এমন একটা Google account দিয়ে ব্রাউজারে সাইন-ইন থাকা অবস্থায় Staff app URL-এ যাও যেটা `AllowedDashboardEmails`-এ নেই — ব্র্যান্ডেড "Access Restricted" পেজ আসা উচিত (App password স্ক্রিন না)।
☐ **টেস্ট B (ব্লক হওয়া উচিত):** ব্রাউজারে কোনো Google account সাইন-ইন না থাকা অবস্থায় (ইনকগনিটো + Google logout) Staff app URL-এ যাও — এটাও Access Restricted পেজ দেখানো উচিত।
☐ **টেস্ট C (পাস হওয়া উচিত):** whitelisted Gmail দিয়ে সাইন-ইন থাকা অবস্থায় Staff app URL-এ যাও — এবার App Password login screen (Doctor/Assistant role select) ঠিকমতো আসা উচিত।
☐ **টেস্ট D:** টেস্ট A বা B-এর পরে Google Sheet-এর `AuditLog` শীটে (বা Security.gs-এর audit log মেকানিজম যেখানে রাখে) `DASHBOARD_ACCESS_DENIED` এন্ট্রি লগ হয়েছে কিনা চেক করো।

## ৫. Staff লগইন ফ্লো (Access Gate পাস করার পরে)

☐ App Password দিয়ে Doctor role-এ লগইন করে Dashboard-এর সবকটা ট্যাব (Overview, Patients, Appointments, Finance, Prescriptions, Settings ইত্যাদি) খুলে দেখো কোনো কনসোল এরর নেই তো।
☐ Assistant role দিয়েও আলাদাভাবে লগইন টেস্ট করো — role-based permission ঠিকমতো আলাদা হচ্ছে কিনা।
☐ Logout বাটনে ক্লিক করে ব্র্যান্ডেড কনফার্মেশন মডাল আসছে কিনা (ব্রাউজারের নেটিভ popup না) কনফার্ম করো।

## ৬. Prescription প্রিন্ট (PDF)

☐ একটা টেস্ট prescription বানিয়ে PDF জেনারেট করো (`generatePrescriptionPdf_()`)।
☐ PDF-টা A4 সাইজে এসেছে কিনা কনফার্ম করো (Part 21-এ `@page{size:A4;margin:12mm;}` ফিক্স করা হয়েছিল — US Letter না আসা উচিত)।
☐ Header/footer কোনো কনটেন্ট কাটা যাচ্ছে না তো, এবং বাংলা টেক্সট (ডাক্তারের নাম/ঠিকানা যদি বাংলায় বসানো হয়ে থাকে) ঠিকমতো রেন্ডার হচ্ছে কিনা চেক করো।

## ৭. Visiting Card QR লিংক

☐ প্রিন্ট করা (বা ডিজিটাল) ভিজিটিং কার্ডের QR কোড ফোন দিয়ে স্ক্যান করো।
☐ স্ক্যান করলে সঠিক Patient app URL (`https://drasma.aumatiq.com`)-এ নিয়ে যাচ্ছে কিনা, এবং পেজ ঠিকমতো লোড হচ্ছে কিনা কনফার্ম করো।

---

## রিপোর্ট করার ফরম্যাট

কোনো আইটেম ফেল করলে এভাবে জানিও, যাতে দ্রুত root cause বের করা যায়:

```
আইটেম নম্বর: [যেমন ৪-B]
কী দেখলে: [যেমন "Access Denied পেজের বদলে সরাসরি App Password স্ক্রিন এসেছে"]
ডিভাইস/ব্রাউজার: [যেমন "Chrome Android"]
স্ক্রিনশট: [যদি থাকে]
```

সব আইটেম ✅ পাস হলে Part 22 সম্পূর্ণ ধরা হবে এবং সরাসরি **Part 23 (Client Handover Package)**-এ যাওয়া যাবে।
