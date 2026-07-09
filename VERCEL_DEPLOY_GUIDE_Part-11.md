> ⚠️ **DEPRECATED (Part 11, v2.0-এর পর থেকে):** এই Vercel hub পদ্ধতি
> আর ব্যবহার হচ্ছে না। এখন `drasma.aumatiq.com` (রোগী) ও
> `admin.drasma.aumatiq.com` (স্টাফ) — দুইটা আলাদা, সম্পূর্ণ ফ্রি
> GitHub Pages সাবডোমেইন instant-redirect করে। নতুন সেটআপের জন্য
> `DEPLOYMENT_GUIDE.md`-এর "ধাপ ৬ — Two-URL Subdomain Setup" অংশ
> দেখো। এই ফাইলটা শুধু historical reference/rollback হিসেবে রাখা
> হয়েছে।

# AUMATIQ — Vercel Hub Deployment Guide
### (এইটা কেন লাগবে + কিভাবে ডিপ্লয় করবে)

## কেন এই "Hub" বানানো হলো

Dr. Asma-র সিস্টেমের আসল ব্যাকএন্ড (Sheets ডেটা) এখনো Apps Script-এর
`.../exec` URL-এই থাকে — এটা **বদলানো হয়নি, ভাঙা হয়নি**। কিন্তু
Apps Script-এর URL (`script.google.com/macros/s/...`) দেখতে ক্লায়েন্টের
কাছে টেকনিক্যাল/আনপ্রফেশনাল লাগে।

তাই একটা ছোট, সুন্দর, brand-ম্যাচ করা **"launcher" পেজ** বানিয়ে দিলাম —
এইটা Vercel-এ হোস্ট হবে, একটা সুন্দর নিজস্ব URL/ডোমেইন পাবে, আর ভেতরে
দুইটা বাটন থাকবে যেটা আসল অ্যাপ দুটো (Patient Portal + Doctor Dashboard)
খুলে দেয়। ক্লায়েন্ট শুধু এই একটা সুন্দর link/QR পাবে — ভেতরের
Apps Script URL দেখতেই হবে না।

**এইটা প্রতিটা নতুন doctor-automation client-এর জন্য reusable টেমপ্লেট**
— শুধু ৩টা জায়গা বদলাবে (নিচে দেখো)।

---

## ধাপ ১ — টেমপ্লেটে ৩টা জায়গা বদলাও

`vercel-hub/index.html` আর `vercel-hub/manifest.json` ফাইলে এই
placeholder গুলো খুঁজে বদলাও:

| Placeholder | কী বসাবে |
|---|---|
| `{{CLINIC_NAME}}` | যেমন: `Dr. Asma Clinic` |
| `{{PUBLIC_URL}}` | Patient website-এর আসল exec URL |
| `{{DASHBOARD_URL}}` | Doctor dashboard-এর exec URL (`?page=dashboard` সহ) |

## ধাপ ২ — GitHub-এ push করা

```bash
git init
git add .
git commit -m "feat: Dr. Asma Clinic — Vercel hub launcher page"
git remote add origin https://github.com/aumatiq/aumatiq-bd-systems.git
git push origin main
```
(অথবা GitHub Desktop দিয়ে সরাসরি commit + push — কমান্ড লাইন লাগবে না)

## ধাপ ৩ — Vercel-এ কানেক্ট করা (একবারই)

1. vercel.com → "Add New" → "Project"
2. GitHub repo `aumatiq-bd-systems` সিলেক্ট করো
3. **Root Directory** সেট করো: `vercel-hub` (যদি একই repo-তে অন্য
   ক্লায়েন্টের ফোল্ডারও থাকে, প্রতিটার জন্য আলাদা Vercel project বানাও,
   প্রতিটার Root Directory আলাদা ফোল্ডার দেখিয়ে)
4. Framework Preset: "Other" (এটা plain static HTML, কোনো build লাগবে না)
5. Deploy চাপো — ৩০ সেকেন্ডে লাইভ হয়ে যাবে

## ধাপ ৪ — নিজের ডোমেইন যোগ করা (ঐচ্ছিক কিন্তু প্রফেশনাল)

Vercel Project → Settings → Domains → যোগ করো যেমন:
`drasma.aumatiq.com` (subdomain, তোমার aumatiq.com-এর DNS-এ একটা CNAME
রেকর্ড যোগ করলেই হবে)

এরপর থেকে প্রতিবার GitHub Desktop-এ commit + push করলেই Vercel নিজে
থেকেই নতুন ভার্সন লাইভ করে দেবে — কোনো manual ডিপ্লয় লাগবে না।

---

## ফলাফল — ক্লায়েন্টকে কী পাঠাবে

আগের মতো raw Apps Script লিংক না দিয়ে, এখন একটাই সুন্দর লিংক দেবে:

> **https://drasma.aumatiq.com**

এখানেই দুটো বাটন থাকবে (Patient Portal / Doctor Dashboard), install
নির্দেশনা থাকবে, আর পুরো পেজটাই AUMATIQ ব্র্যান্ড থিমে (dark + indigo +
gold) — মোবাইলে খুললে সম্পূর্ণ প্রফেশনাল লাগবে।
