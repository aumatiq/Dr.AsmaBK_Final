# SETUP — Part 18 & 19 চালু করার জন্য যা যা করতে হবে

## ১. দুইটা নতুন ফাইল যোগ করো
- `Articles.gs` → রিপোর রুটে (নতুন Apps Script ফাইল হিসেবে)
- `RecommendedDoctors.gs` → রিপোর রুটে (নতুন Apps Script ফাইল হিসেবে)

Apps Script Editor-এ: বামে "Files" এর পাশে "+" → Script → নাম দাও
("Articles" / "RecommendedDoctors") → কনটেন্ট পেস্ট করো → Save।

---

## ২. `appsscript.json`-এ Drive Advanced Service যোগ করো

**বর্তমান `appsscript.json`:**
```json
{
  "timeZone": "Asia/Dhaka",
  "dependencies": {},
  "webapp": {
    "executeAs": "USER_DEPLOYING",
    "access": "ANYONE_ANONYMOUS"
  },
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8"
}
```

**দিয়ে বদলাও এটা দিয়ে** (শুধু `dependencies` অংশটা বদলেছে, বাকি সব অপরিবর্তিত):
```json
{
  "timeZone": "Asia/Dhaka",
  "dependencies": {
    "enabledAdvancedServices": [
      {
        "userSymbol": "Drive",
        "version": "v2",
        "serviceId": "drive"
      }
    ]
  },
  "webapp": {
    "executeAs": "USER_DEPLOYING",
    "access": "ANYONE_ANONYMOUS"
  },
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8"
}
```

**এরপর Apps Script Editor-এ ম্যানুয়ালিও একবার confirm করে নাও:**
বামপাশে "Services" এর পাশে "+" আইকনে ক্লিক করো → "Drive API" খুঁজে বের
করো → "Add" করো। এটা ছাড়া `uploadArticleDocument`, `ocrHandwrittenImage`
কাজ করবে না (Drive.Files.insert কল fail করবে)।

> ⚠️ এই সার্ভিস ছাড়া শুধু **document import / handwriting OCR** কাজ
> করবে না — বাকি সবকিছু (article লেখা, cover image upload, recommended
> doctors) স্বাভাবিকভাবেই কাজ করবে।

---

## ৩. HTML প্যাচ দুইটা প্রয়োগ করো
- `PATCH_1_DoctorDashboard.md` অনুযায়ী `DoctorDashboard.html` আপডেট করো
- `PATCH_2_PublicWebsite.md` অনুযায়ী `PublicWebsite.html` আপডেট করো

---

## ৪. Sheet ট্যাব দুইটা একবার বানিয়ে নাও (idempotent — চিন্তা নেই)

Apps Script Editor-এ, ফাইল ড্রপডাউন থেকে `Articles.gs` সিলেক্ট করে
`setupArticlesSheet` ফাংশন সিলেক্ট করে ▶ Run করো। তারপর
`RecommendedDoctors.gs` থেকে `setupRecommendedDoctorsSheet` Run করো।

(এগুলো না চালালেও প্রথম আর্টিকেল/ডাক্তার যোগ করার সময় ট্যাব দুইটা
নিজে থেকেই তৈরি হয়ে যাবে — কিন্তু আগে থেকে বানিয়ে রাখলে Sheet-এ গিয়ে
কলাম হেডার আগেই দেখে নিতে পারবে।)

---

## ৫. GitHub Desktop + Vercel — deploy

1. GitHub Desktop-এ `DA-P3WD-Pink-SkyBlue` রিপো খুলো
2. পরিবর্তনগুলো দেখাবে (Articles.gs, RecommendedDoctors.gs — নতুন;
   DoctorDashboard.html, PublicWebsite.html, appsscript.json — modified)
3. Commit message: `feat: add Part 18 blog module + Part 19 recommended doctors — Dr. Asma dashboard`
4. Push to origin
5. যেহেতু এটা Google Apps Script Web App (Vercel না), deploy Apps
   Script Editor থেকেই হয়: **Deploy → Manage Deployments → পুরনো
   deployment-এ Edit (✏️) → Version: "New version" → Deploy**

---

## ৬. টেস্ট চেকলিস্ট (দুই ফাইলের প্যাচেই আলাদা চেকলিস্ট দেওয়া আছে,
   এখানে শুধু end-to-end ফ্লো)

1. Doctor Dashboard-এ লগইন → Sidebar → "Blog / Articles" → "+ New Article"
2. Title লিখো, টুলবার দিয়ে কিছু ফরম্যাট করো, cover image আপলোড করো
3. একটা .docx ফাইল আপলোড করে দেখো টেক্সট আসছে কিনা, review করে Insert করো
4. একটা হাতের লেখার ছবি তুলে/আপলোড করে OCR টেস্ট করো (accuracy কম হতে
   পারে — এটাই expected, disclaimer সেভাবেই দেখানো হয়েছে)
5. "Publish" চাপো → Public website-এ গিয়ে Blog সেকশনে দেখো আর্টিকেলটা
   এসেছে কিনা → card ক্লিক করে full article পড়ে দেখো
6. Dashboard-এ "Recommended Doctors" → "+ Add Doctor" → নাম, specialty,
   ফোন নাম্বার, ছবি দিয়ে সেভ করো
7. Public website-এ "Specialists" সেকশনে গিয়ে দেখো — Call আর WhatsApp
   বাটন দুটোই ক্লিকযোগ্য কিনা যাচাই করো (মোবাইলে টেস্ট করলে সবচেয়ে ভালো বোঝা যাবে)
