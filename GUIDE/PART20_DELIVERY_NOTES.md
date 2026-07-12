# PART 20 — ডেলিভারি নোট (Option A কনফার্মড)

## ✅ যা ফিক্স হলো
1. `index.html` (নতুন) — patient app-এর GitHub Pages entry point, exec URL iframe করে
2. `admin.html` (নতুন) — staff dashboard-এর entry point, `?page=dashboard` দিয়ে iframe করে
3. `CNAME` (নতুন) — `drasma.aumatiq.com`
4. `PWASetup.gs` (আপডেট) — `ICON_BASE_STAFF_` ফিক্স করা হলো (নিচে ব্যাখ্যা)
5. `_legacy_unused_manifest.json` — পুরনো dead `manifest.json`-এর rename করা ভার্সন
6. Icon ফোল্ডার rename নির্দেশনা (নিচে)

---

## 📂 প্রতিটা ফাইল কোথায় বসবে (repo root-এ)

| ফাইল | Repo-তে exact path | অ্যাকশন |
|---|---|---|
| `index.html` | `/index.html` | নতুন ফাইল (repo-তে root-এ paste করো) |
| `admin.html` | `/admin.html` | নতুন ফাইল (repo-তে root-এ paste করো) |
| `CNAME` | `/CNAME` | নতুন ফাইল (extension ছাড়া, ঠিক এই নামেই) |
| `PWASetup.gs` | `/PWASetup.gs` | **existing ফাইল replace করো** (Apps Script editor-এও আপডেট করতে হবে — Go-Live ধাপ ১ দেখো) |
| `_legacy_unused_manifest.json` | `/_legacy_unused_manifest.json` | নতুন ফাইল, **তারপর পুরনো `/manifest.json` ডিলিট করো** |

---

## 🔧 কেন `PWASetup.gs`-এ কোড বদলাতে হলো (একমাত্র exception, backend touch করা হয়েছে)

আগের প্ল্যানে ধরে নেওয়া হয়েছিল শুধু folder rename করলেই চলবে, কোড বদলানো লাগবে না। কিন্তু audit করে দেখা গেছে `ICON_BASE_STAFF_` আগে থেকেই hardcoded ছিল `admin.drasma.aumatiq.com` সাবডোমেইন ধরে — যেটা তুমি Option A বেছে নেওয়ায় আর সেট আপ হচ্ছে না। তাই এই এক লাইন বদলানো **আবশ্যক ছিল**, নাহলে staff app-এর PWA আইকন কখনোই লোড হতো না (চিরস্থায়ী 404)। বাকি কোনো `.gs`/`.html` ফাইলে হাত দেওয়া হয়নি — client↔backend-এর ৫৮টা function call balance অক্ষত আছে।

---

## 📁 Icon ফোল্ডার rename করার ধাপ (GitHub Desktop-friendly, terminal লাগবে না)

তোমার লোকাল repo folder-এ (যেটা GitHub Desktop দিয়ে clone করা):

1. **Windows File Explorer / Mac Finder** খোলো, repo folder-এ যাও।
2. `pwa_icons_patient` ফোল্ডারের ভিতরে ঢোকো → `patient` নামের সাব-ফোল্ডারটা খুঁজে বের করো (এতে ৮টা icon ফাইল আছে: `apple-touch-icon-180.png`, `favicon-16.png`, `favicon-32.png`, `favicon.ico`, `icon-192-maskable.png`, `icon-192.png`, `icon-512-maskable.png`, `icon-512.png`)।
3. এই `patient` ফোল্ডারের **সব ৮টা ফাইল** repo root-এ একটা নতুন ফোল্ডার `icons` বানিয়ে সেখানে move করো (path হবে: `/icons/apple-touch-icon-180.png` ইত্যাদি — কোনো `patient` সাব-ফোল্ডার লাগবে না)।
4. এরপর পুরনো খালি `pwa_icons_patient` ফোল্ডারটা ডিলিট করো।
5. একইভাবে: `pwa_icons_staff/staff/`-এর ভিতরের ৮টা ফাইল move করো `/icons/staff/` নামের নতুন ফোল্ডারে (repo root-এর `icons` ফোল্ডারের ভিতরে একটা `staff` সাব-ফোল্ডার)।
6. পুরনো খালি `pwa_icons_staff` ফোল্ডারটা ডিলিট করো।
7. GitHub Desktop খুললে "Changes" ট্যাবে এগুলো rename/move হিসেবেই দেখাবে (ফাইল content অপরিবর্তিত থাকায় Git নিজে থেকে rename detect করবে) — এক commit-এ সব করে ফেলতে পারো।

**ফলাফল (চূড়ান্ত icon path):**
```
/icons/apple-touch-icon-180.png
/icons/favicon-16.png
/icons/favicon-32.png
/icons/favicon.ico
/icons/icon-192-maskable.png
/icons/icon-192.png
/icons/icon-512-maskable.png
/icons/icon-512.png
/icons/staff/apple-touch-icon-180.png
/icons/staff/favicon-16.png
/icons/staff/favicon-32.png
/icons/staff/favicon.ico
/icons/staff/icon-192-maskable.png
/icons/staff/icon-192.png
/icons/staff/icon-512-maskable.png
/icons/staff/icon-512.png
```
এটাই `PWASetup.gs`-এর `ICON_BASE_PATIENT_` (`/icons`) ও ফিক্সড `ICON_BASE_STAFF_` (`/icons/staff`) — দুটোর সাথেই এখন হুবহু মিলবে।

---

## 🗑️ dead `manifest.json` ক্লিনআপ

1. `_legacy_unused_manifest.json` ফাইলটা repo root-এ যোগ করো (রেফারেন্সের জন্য রাখা হলো, ভবিষ্যতে দরকার পড়লে পড়ার জন্য)।
2. পুরনো `/manifest.json` ফাইলটা ডিলিট করো — এটা কোথাও `<link>` বা কোনো `.gs`/`.html` ফাইল থেকে reference হয় না, dead ফাইল।

---

## ⚠️ একটা জিনিস মনে রাখার মতো (Part 22-এ formal test হবে, কিন্তু এখনই জেনে রাখো)

`index.html`/`admin.html`-এর `<link rel="manifest">` ট্যাগ cross-origin URL-এ পয়েন্ট করছে (GitHub Pages ডোমেইন থেকে `script.google.com`-এর exec URL-এ manifest fetch করছে)। বেশিরভাগ আধুনিক Chrome/Edge এটা সাপোর্ট করে, কিন্তু কিছু ব্রাউজার/প্ল্যাটফর্মে cross-origin manifest নিয়ে সমস্যা হতে পারে। যদি Part 22 লাইভ টেস্টে "Add to Home Screen" prompt না আসে, সমাধান হবে: GitHub Pages-এই একটা static `manifest.json` বানিয়ে local same-origin icon path ব্যবহার করা (ব্যাকআপ প্ল্যান, দরকার হলে তখন বানিয়ে দেব)। এখনই এটা preventively করিনি কারণ dynamic manifest (live clinic নাম, ইত্যাদি সহ) অক্ষত রাখাই ভালো — শুধু সমস্যা রিপোর্ট এলে fallback বানাবো।

---

## ✅ Client↔Backend cross-reference — অক্ষত আছে
এই session-এ কোনো নতুন frontend feature/function call যোগ হয়নি (শুধু wrapper page + ১ লাইন ব্যাকএন্ড কনফিগ), তাই আগের audit-এর ৫৮টা resolved function call অক্ষতই আছে — নতুন করে চেক করার দরকার নেই।
