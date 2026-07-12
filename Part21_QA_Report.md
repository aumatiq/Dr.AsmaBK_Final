# Part 21 — QA Pass Report (Contrast + Print/PDF)
**তারিখ:** 2026-07-13 | **স্কোপ:** `DoctorDashboard.html`, `PublicWebsite.html`, `Prescription.gs`
**পদ্ধতি:** WCAG 2.1 রিলেটিভ-লুমিনেন্স ফর্মুলা দিয়ে actual contrast ratio হিসাব করা হয়েছে (assumption না) — প্রতিটা color pair alpha-blend করে effective hex বের করে তারপর মাপা হয়েছে।

---

## ✅ ফিক্স হয়েছে (৪টা কনফার্মড bug, existing token দিয়েই fix)

| # | ফাইল | সমস্যা | আগে | পরে | কেন |
|---|---|---|---|---|---|
| 1 | `DoctorDashboard.html` `.btn-ind` | Light mode-এ button text অদৃশ্য হয়ে যাচ্ছিল | `color:var(--wht)` → light mode-এ `--wht` আসলে dark text color (#241428), তাই purple button-এর উপর dark-on-dark: **2.45:1 FAIL** | `color:#fff` (fixed) | `--wht` variable-টা body-text-এর জন্য মোড অনুযায়ী flip করে (dark↔white); button-এর উপর সবসময়-সাদা টেক্সটের জন্য এটা ভুল ব্যবহার ছিল। `.btn-rose`/`.btn-teal` আগে থেকেই ঠিক প্যাটার্ন (`color:#fff`) ব্যবহার করছিল — এখন সবগুলো সলিড button consistent। **ফলাফল: 5.70:1 (dark) / 7.10:1 (light)** |
| 2 | `DoctorDashboard.html` `.btn-teal` | সাদা টেক্সট প্রায় অদৃশ্য (dark mode) | `background:var(--teal)` (#14B8A6) + সাদা টেক্সট → **2.49:1 FAIL** | `background:#0F766E` (fixed, এটা আগে থেকেই palette-এ থাকা teal2/light-teal শেড) | **ফলাফল: 5.47:1** (দুই মোডেই একই fixed background, theme-independent) |
| 3 | `PublicWebsite.html` `.btn-teal` | একই সমস্যা (গ্রেডিয়েন্টের প্রথম স্টপ) | `linear-gradient(135deg, var(--teal), #0D9488)` → dark mode-এ প্রথম স্টপ 2.49:1 FAIL | `linear-gradient(135deg, #0F766E, #0D9488)` | দুটো গ্রেডিয়েন্ট স্টপই এখন থিম-নির্বিশেষে যথেষ্ট গাঢ় |
| 4 | `DoctorDashboard.html` `.sb-section` + `.sb-bottom` | Sidebar-এর ছোট টেক্সট (10-11px) borderline অস্পষ্ট | `color:var(--sil2)` → **3.78:1 (dark) / 3.62:1 (light)** — ছোট টেক্সটের জন্য দরকার 4.5:1, এটা পাস করছিল না | `color:var(--sil)` | **ফলাফল: 10.15:1 (dark) / 6.19:1 (light)** |

---

## 🟡 ফ্ল্যাগ করা হলো কিন্তু ফিক্স করা হয়নি (borderline, ছোট রিস্ক — চাইলে পরে ঠিক করা যাবে)

| ফাইল | এলিমেন্ট | Contrast | নোট |
|---|---|---|---|
| `DoctorDashboard.html` | `.bdg-appr` badge (indigo2 on purple-tint bg, dark mode) | 4.35:1 | সাধারণ ছোট টেক্সটের 4.5:1 থ্রেশোল্ডের সামান্য নিচে। badge, বড় UI element না হওয়ায় প্রায়োরিটি কম। |
| `PublicWebsite.html` | `.btn-rose` (rose→indigo গ্রেডিয়েন্ট, সাদা টেক্সট) | 3.25:1 (rose প্রান্তে) | Rose প্রান্তে সামান্য কম, indigo প্রান্তে 5.44:1 ভালো। গ্রেডিয়েন্টের গড় readable, কিন্তু rose প্রান্তে টেক্সট থাকলে marginal। |
| উভয় ফাইল | disabled button states (`opacity:0.45`) | ~2.7-2.9:1 | WCAG disabled controls-এর জন্য কড়া না, কিন্তু usability-এর দিক থেকে "disabled" অবস্থা বোঝা কষ্টকর হতে পারে। ইচ্ছাকৃতভাবে muted রাখা ঠিক আছে যদি না client নিজে থেকে রিপোর্ট করে। |
| `PublicWebsite.html` | breakpoint coverage | — | সর্বনিম্ন breakpoint 640px — 375px-640px রেঞ্জে dedicated fine-tuning নেই (default flow-এর উপর নির্ভর করছে)। `DoctorDashboard.html`-এ 400px পর্যন্ত breakpoint আছে, তুলনামূলক ভালো কভারেজ। |

---

## 🔴 গুরুত্বপূর্ণ স্কোপ-কারেকশন — "Print Stylesheet" আসলে প্রযোজ্য না

Master Plan-এর Part 21 স্কোপে লেখা ছিল "`@media print` স্টাইলশিট যাচাই করো — A4 পেজে ঠিকভাবে ফিট হচ্ছে কিনা"। Audit করে দেখা গেছে **এই assumption ভুল ছিল**:

- Prescription কখনোই ব্রাউজার `window.print()`/`@media print` দিয়ে প্রিন্ট হয় না।
- আসল ফ্লো: doctor prescription লেখে → `Prescription.gs`-এর `generatePrescriptionPdf_()` সার্ভার-সাইডে **HTML → PDF blob** কনভার্ট করে → Drive-এ সেভ হয় → ডাক্তার/রোগী PDF ফাইলটা Drive preview থেকে print করে।
- অর্থাৎ audit করার জিনিসটা `@media print` CSS না, বরং **PDF জেনারেশন pipeline-এর page size**।

**পাওয়া bug:** `generatePrescriptionPdf_()`-এ কোনো explicit page-size নির্দেশ ছিল না। Apps Script-এর HTML→PDF blob conversion ডিফল্টভাবে US Letter সাইজ ব্যবহার করে, A4 না — বাংলাদেশে A4-ই standard, তাই physical print-এ margin কাটা পড়ার/ভুল সাইজের ঝুঁকি ছিল।

**ফিক্স:** generated HTML-এর `<head>`-এ `<style>@page{size:A4;margin:12mm;}</style>` যোগ করা হয়েছে — Apps Script-এর Chromium-ভিত্তিক PDF converter এই CSS respect করে। বাকি prescription layout/লজিক অপরিবর্তিত।

---

## পরবর্তী ধাপ
এই ৩টা ফাইল (`DoctorDashboard.html`, `PublicWebsite.html`, `Prescription.gs`) আপডেট হয়েছে — GitHub-এ push করে (Apps Script-এও sync করতে হবে `Prescription.gs`-এর জন্য, Go-Live checklist-এর ধাপ ১ অনুযায়ী) Part 22 (live verification)-এ পরবর্তী প্রেসক্রিপশন লিখে PDF-টা actually A4-তে আসছে কিনা চেক করে দেখো।
