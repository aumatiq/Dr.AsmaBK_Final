# SkyBlue Clinic — PWA Setup & Deployment গাইড
### AUMATIQ Internal Reference Doc

---

## ০. আগে যা জানা দরকার

তোমার `DA-P3WD-SkyBlue` repo **private** হওয়ায় আমি সরাসরি ফাইল দেখতে পারিনি।
তাই এই প্যাকেজে যা আছে সব **নতুন, additive ফাইল** — তোমার existing
`index.html`-এর কোনো লজিক (session fix, prescription module ইত্যাদি) **touch
করা হয়নি**। শুধু ৫ লাইনের একটা snippet paste করতে হবে (Step 3 দেখো)।

---

## ১. এই প্যাকেজে কী কী ফাইল আছে

```
pwa-assets/
├── manifest.json                    → PWA identity (নাম, icon, color)
├── sw.js                            → Service worker (offline support)
├── offline.html                     → নেট না থাকলে যেটা দেখাবে
├── PASTE_THIS_IN_INDEX_HEAD.html    → index.html এ paste করার snippet
├── PWA_SETUP_GUIDE.md               → এই গাইড
└── icons/
    ├── icon-192.png
    ├── icon-512.png
    ├── apple-touch-icon.png
    ├── favicon-32x32.png
    └── favicon-16x16.png
```

---

## ২. তোমার GitHub repo-তে ফাইল বসানোর সঠিক জায়গা (folder structure)

Repo-র root এ গিয়ে এভাবে বসাও:

```
DA-P3WD-SkyBlue/
├── index.html          ← (এটা আগে থেকেই আছে, touch করো না)
├── manifest.json        ← নতুন, root এ বসাও
├── sw.js                ← নতুন, root এ বসাও
├── offline.html          ← নতুন, root এ বসাও
└── icons/                ← নতুন ফোল্ডার বানাও
    ├── icon-192.png
    ├── icon-512.png
    ├── apple-touch-icon.png
    ├── favicon-32x32.png
    └── favicon-16x16.png
```

⚠️ **গুরুত্বপূর্ণ:** `manifest.json` আর `sw.js` অবশ্যই root এ থাকতে হবে
(subfolder এ না) — নাহলে PWA কাজ করবে না।

---

## ৩. GitHub Desktop দিয়ে আপলোড — Step by Step

### Step 1 — Repo clone/open করো
1. GitHub Desktop খোলো
2. যদি আগে থেকে clone করা না থাকে: **File → Clone Repository →**
   `aumatiq/DA-P3WD-SkyBlue` সিলেক্ট করো → **Clone**
3. যদি আগে থেকে আছে: **Current Repository** থেকে `DA-P3WD-SkyBlue` সিলেক্ট করো

### Step 2 — ফাইল কপি করো
1. তোমার কম্পিউটারে GitHub Desktop যেখানে repo clone করেছে সেই ফোল্ডারটা খোলো
   (GitHub Desktop এ **Repository → Show in Explorer/Finder** ক্লিক করলে খুলে যাবে)
2. এই প্যাকেজের `manifest.json`, `sw.js`, `offline.html` — এই ৩টা ফাইল
   সরাসরি সেই ফোল্ডারের **root এ paste** করো (index.html যেখানে আছে ঠিক সেখানে)
3. একটা নতুন ফোল্ডার বানাও নাম দাও `icons` — তার ভেতরে ৫টা icon ফাইল paste করো

### Step 3 — index.html এ ৫ লাইনের snippet যোগ করো
1. `index.html` টা Notepad / VS Code / যেকোনো text editor দিয়ে খোলো
2. `PASTE_THIS_IN_INDEX_HEAD.html` ফাইলের পুরো content কপি করো
3. তোমার `index.html`-এ `</head>` ট্যাগ খুঁজে বের করো (Ctrl+F দিয়ে খুঁজলে সহজ হবে)
4. `</head>` এর ঠিক **আগে** পুরো snippet paste করে দাও
5. Save করো

এইটুকুই — বাকি কিছু change করার দরকার নেই।

### Step 4 — GitHub Desktop এ commit করো
1. GitHub Desktop এ ফিরে আসো — বাম পাশে সব changed ফাইল দেখাবে
   (manifest.json, sw.js, offline.html, icons/, index.html)
2. নিচে **Summary** বক্সে commit message লিখো:
   ```
   feat: add PWA support (manifest, service worker, icons) — offline capability for clinic app
   ```
3. **Commit to main** বাটনে ক্লিক করো
4. উপরে **Push origin** বাটনে ক্লিক করো — এটাই তোমার কোড GitHub এ পাঠিয়ে দেবে

✅ এই মুহূর্তে তোমার GitHub repo আপডেট হয়ে গেছে।

---

## ৪. Vercel এ Deploy (Auto-Deploy Setup — একবার করলেই সারাজীবন automatic)

যদি এই repo আগে থেকেই Vercel-এ connected থাকে:
- **কিছুই করা লাগবে না।** Step 4-এ push করার সাথে সাথেই Vercel নিজে থেকে
  নতুন ভার্সন detect করে rebuild + deploy করে দেবে (১-২ মিনিটের মধ্যে লাইভ)।
- Vercel dashboard → তোমার প্রজেক্ট → **Deployments** ট্যাবে গিয়ে দেখতে পারবে
  "Building..." → "Ready" status।

যদি এই repo এখনো Vercel-এ connect করা না থাকে (প্রথমবার):
1. [vercel.com/dashboard](https://vercel.com/dashboard) এ লগইন করো
2. **Add New → Project** ক্লিক করো
3. GitHub থেকে `aumatiq/DA-P3WD-SkyBlue` repo সিলেক্ট করো → **Import**
4. Framework Preset: **Other** (কারণ এটা plain HTML/JS, কোনো build step নেই)
5. Root Directory: default রেখে দাও (`./`)
6. **Deploy** ক্লিক করো
7. ১-২ মিনিট পর একটা লাইভ URL পাবে (যেমন `da-p3wd-skyblue.vercel.app`)
8. এরপর থেকে GitHub এ যেকোনো push করলেই Vercel automatically নতুন version
   deploy করে দেবে — এটাই "automation" অংশ, তোমাকে বার বার manual deploy
   করা লাগবে না

---

## ৫. PWA ঠিকমতো কাজ করছে কিনা টেস্ট করো

1. Deploy হওয়া লাইভ URL টা Chrome browser এ খোলো
2. Right-click → **Inspect** → উপরের ট্যাব থেকে **Application** সিলেক্ট করো
3. বাম পাশে **Manifest** ক্লিক করো — সব ঠিকঠাক দেখালে icon, name, color সব
   দেখাবে, কোনো error লাল রঙে দেখাবে না
4. বাম পাশে **Service Workers** ক্লিক করো — "activated and is running"
   লেখা দেখাবে
5. Address bar-এর ডান পাশে একটা **install icon (⊕)** দেখা যাবে —
   এটাই প্রমাণ করে PWA সঠিকভাবে সেটআপ হয়েছে
6. Airplane mode অন করে page reload করে দেখো — `offline.html` দেখাবে
   (সম্পূর্ণ crash/blank page হবে না)

---

## ৬. Client-কে কীভাবে Deliver করবে (Professional Way)

### A. যা তুমি client কে পাঠাবে
1. **Live URL** (custom domain থাকলে সেটা, নাহলে vercel.app link)
2. একটা ছোট **1-page WhatsApp/PDF instruction** (নিচে template দেওয়া আছে)
3. Login credentials (username/password) — WhatsApp বা email এ আলাদাভাবে
   পাঠাও, instruction PDF এর সাথে না (security)

### B. Client-এর Staff-দের জন্য "Add to Home Screen" instruction (কপি করে পাঠাও)

**Android (Chrome) ইউজারদের জন্য:**
```
১. লিংকটা Chrome ব্রাউজারে খুলুন
২. উপরে ডান পাশে ৩ ডট (⋮) মেনুতে ট্যাপ করুন
৩. "Add to Home screen" সিলেক্ট করুন
৪. "Add" এ ট্যাপ করুন
৫. এখন থেকে হোম স্ক্রিনে একটা আইকন থাকবে — সেখান থেকে সরাসরি
   app-এর মতো খুলবে, ব্রাউজার address bar দেখাবে না
```

**iPhone (Safari) ইউজারদের জন্য:**
```
১. লিংকটা Safari ব্রাউজারে খুলুন (Chrome দিয়ে না)
২. নিচের Share বাটনে (□ থেকে ↑ চিহ্ন) ট্যাপ করুন
৩. নিচে স্ক্রল করে "Add to Home Screen" সিলেক্ট করুন
৪. "Add" এ ট্যাপ করুন
```

### C. Retainer-এর মধ্যে কী কভার হয় (client কে বলার মতো ভাষা)
> "আপনার সিস্টেম এখন থেকে ইন্টারনেট দুর্বল থাকলেও খুলবে, এবং মোবাইলে
> সরাসরি অ্যাপের মতো ইনস্টল করা যাবে — কোনো Play Store/App Store দরকার
> নেই। প্রতিটা আপডেট আমরা automatically পাঠিয়ে দেব, আপনাকে নতুন করে কিছু
> ডাউনলোড করতে হবে না।"

---

## ৭. ভবিষ্যতে আপডেট দেওয়ার প্রসেস (Fast reference)

যেকোনো ভবিষ্যৎ ফিচার/ফিক্স এর জন্য:
1. `index.html` (বা যে ফাইল change হয়েছে) এডিট করো
2. GitHub Desktop → commit → push
3. Vercel automatically ১-২ মিনিটে নতুন version live করে দেবে
4. `sw.js` এর `CACHE_VERSION` নাম্বার বাড়িয়ে দাও (v1 → v2) — এতে সব
   ইউজারের পুরনো cache clear হয়ে নতুন version load হবে

এটাই পুরো automation loop — manual redeploy বা manual client-side
update করার দরকার নেই।
