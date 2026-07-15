### PART 27 — Access Gate Go-Live Finalization + Cloudflare Worker Domain Masking 🆕🔒

**প্রম্পট (নতুন চ্যাটে এই আকারেই ব্যবহারযোগ্য — কপি-পেস্ট করো):**

> Repo `https://github.com/aumatiq/Dr.AsmaBK_Final` clone করে (Universal Protocol অনুযায়ী) পুরোটা অডিট করো — অনুমান করে এগিও না, আগে ফাইলগুলো নিজে পড়ো। এই সেশনে ২টা কাজ শেষ করতে হবে।
>
> **কাজ ১ — Google Account Access Gate: Go-Live যাচাই ও সম্পন্ন করা**
> আগের একটা সেশনে `AccessGate.gs` (নতুন ফাইল) বানানো হয়েছে এবং `Code.gs`-এর `doGet()`-এ `page === 'dashboard'` ব্লকে একটা গেট-চেক বসানো হয়েছে, যেটা `Session.getActiveUser().getEmail()` দিয়ে ভিজিটরের Google account যাচাই করে Settings শীটের `AllowedDashboardEmails` কমা-সেপারেটেড লিস্টের সাথে মেলায় — না মিললে `renderAccessDeniedPage_()` একটা ব্র্যান্ডেড Access Denied পেজ দেখায়। Fail-closed ডিজাইন (Google login না থাকলে বা allowlist খালি থাকলে ডিফল্ট = block)। প্রথমে চেক করো এই ফাইল ও পরিবর্তনটা repo-তে আছে কিনা।
> - **যদি থাকে:** নিচের Go-Live চেকলিস্ট ধাপে ধাপে verify করো এবং আমাকে confirm করতে বলো প্রতিটা হয়েছে কিনা:
>   1. Apps Script deployment-এর "Who has access" সেটিং "Anyone with Google account" আছে কিনা (এটা ছাড়া `Session.getActiveUser()` সবসময় খালি রিটার্ন করবে এবং সবাই ব্লক হয়ে যাবে) — "Execute as" অপরিবর্তিত ("Me") থাকা উচিত।
>   2. `addAllowedDashboardEmailsSetting()` রান হয়েছে কিনা এবং Settings শীটে `AllowedDashboardEmails` row-তে ডাক্তার ও সহকারীর আসল Gmail (কমা দিয়ে, কোনো স্পেস ছাড়া) বসানো হয়েছে কিনা।
>   3. আন্ডারলাইং Google Sheet-এর Share সেটিং "Restricted" (শুধু owner) কিনা — "Anyone with the link" থাকলে সেটা এখনই বদলাতে বলো।
>   4. একটা টেস্ট করাও: whitelist-এ নেই এমন Google account দিয়ে `?page=dashboard` লোড করে Access Denied পেজ আসছে কিনা, আর whitelisted account দিয়ে app password login screen ঠিকমতো আসছে কিনা।
> - **যদি না থাকে (ফাইল/পরিবর্তন মিসিং পাও):** নিচের স্পেক অনুযায়ী পুরোটা রিক্রিয়েট করো — `AccessGate.gs` নতুন ফাইল হিসেবে বানাও (`verifyDashboardAccess_()`, `renderAccessDeniedPage_()`, `addAllowedDashboardEmailsSetting()` — non-destructive Settings row insert, `updateAllowedDashboardEmails(token, emailsCsv)` ও `getAllowedDashboardEmails(token)` — দুটোই `requireDoctor()` guard দিয়ে), এবং `Code.gs`-এর `doGet()`-এ `page === 'dashboard'` ব্লকের ঠিক শুরুতে গেট-চেক বসাও (Access Denied হলে DoctorDashboard.html-এর কোনো লাইনও সার্ভ হবে না)। `node --check` দিয়ে syntax verify করে সম্পূর্ণ ফাইল ডেলিভার করো।
>
> **কাজ ২ — `dashboard.drasma.aumatiq.com` সাবডোমেইনে Cloudflare Worker Reverse Proxy (ফ্রি টায়ার, address bar সবসময় ক্লিন থাকবে)**
> লক্ষ্য: ডাক্তার/সহকারী `https://dashboard.drasma.aumatiq.com` লিংকে গেলে ব্রাউজারের address bar-এ এই লিংকটাই থাকবে সবসময় — ভেতরে যে আসলে Google Apps Script exec URL সার্ভ করছে সেটা কখনো দেখা যাবে না (view-source/Network tab-এও না, যেহেতু existing iframe-ভিত্তিক `admin.html` পদ্ধতিতে raw exec URL client-side সোর্সে প্লেইনটেক্সট থাকে — এটাই ফিক্স করছি)।
> - আমাকে জিজ্ঞেস করো: বর্তমানে `aumatiq.com`-এর DNS Hostinger-এ ম্যানেজড (৫টা ফ্রি ইমেইল অ্যাকাউন্ট + `drasma.aumatiq.com` GitHub Pages CNAME সহ)। Cloudflare Worker ফ্রি টায়ারে ব্যবহার করতে হলে পুরো ডোমেইনের **nameserver** Cloudflare-এ পয়েন্ট করতে হয় (রেজিস্ট্রার Hostinger-এই থাকবে, শুধু DNS ম্যানেজমেন্ট সরবে) — এতে বিদ্যমান সব DNS রেকর্ড (email MX/TXT, drasma CNAME, ওয়েবসাইটের A/CNAME রেকর্ড) Cloudflare-এ পুনরায় বসাতে হবে যাতে ইমেইল/ওয়েবসাইট কিছু ভেঙে না যায়। এটা কনফার্ম করে নাও এগোনোর আগে — migration করতে চায় কিনা, নাকি বদলে Option A (Simple Redirect) বা Option B (Iframe Wrapper, যেটা ইতিমধ্যে Part 20-এ `admin.html`-এ করা আছে) দিয়েই থাকতে চায়।
> - Migration কনফার্ম হলে, ধাপে ধাপে দাও:
>   1. বর্তমান Hostinger DNS-এর সব রেকর্ডের একটা তালিকা করতে বলো (client থেকে export/স্ক্রিনশট নিতে বলো) যাতে কিছু miss না হয়।
>   2. Cloudflare-এ ফ্রি অ্যাকাউন্টে `aumatiq.com` যোগ করা ও existing রেকর্ডগুলো ঠিক same ভাবে Cloudflare DNS-এ রি-ক্রিয়েট করার নির্দেশনা।
>   3. Hostinger-এ গিয়ে nameserver বদলে Cloudflare-এর দেওয়া দুটো nameserver বসানো (DNS propagation-এ কয়েক ঘণ্টা থেকে ৪৮ ঘণ্টা লাগতে পারে — এই সময় client-কে সতর্ক করে দাও, এই সময়টায় email সাময়িক ব্যাহত হতে পারে)।
>   4. Cloudflare Worker script (সম্পূর্ণ কোড) বানাও যেটা `dashboard.drasma.aumatiq.com`-এ আসা সব request fetch করে GAS exec URL-এ ফরওয়ার্ড করবে এবং রেসপন্স (HTML/JS/CSS/cookies/headers) পাস-থ্রু করবে, query params ও POST body ঠিকভাবে ফরওয়ার্ড করে (Apps Script-এর `google.script.run` কল ঠিকমতো কাজ করা জরুরি — তাই raw fetch/response bytes অপরিবর্তিত রাখো, শুধু হোস্ট হেডার/Location redirect ঠিক করো)।
>   5. Cloudflare Worker Route/Custom Domain বাইন্ড করা (`dashboard.drasma.aumatiq.com/*` → এই Worker), ফ্রি টায়ারে limits (100,000 requests/day) মেনশন করো।
>   6. এই নতুন সাবডোমেইন লাইভ হওয়ার পর পুরনো `admin.html` (Part 20-এর iframe wrapper) আর দরকার নেই কিনা confirm করে নাও — dead ফাইল রেখে দিলে বিভ্রান্তি হতে পারে বলে ডিলিট বা `_legacy_unused_admin.html` নাম দেওয়ার সাজেশন দাও।
> - কাজ শেষে মাস্টার প্ল্যান ফাইল (`AUMATIQ_DrAsma_MasterProjectPlan_v4_0_UPDATED-3.md`)-এ Session Log আপডেট করো এবং Part 22 (Live Verification) ও Part 23 (Client Handover)-কে "পরের ধাপ" হিসেবে উল্লেখ করো — ওই দুটো Part এখনো নিজেরা আলাদাভাবে বাকি আছে, এই Part-এর অংশ না।

---
**এই ফাইলটা কোথায় ব্যবহার করবে:** এই পুরো ব্লককোট-টা (`> ...` দিয়ে শুরু হওয়া অংশ) কপি করে যেকোনো নতুন Claude চ্যাটে পেস্ট করলেই এটা repo clone করে অডিট করে কাজ শুরু করবে — আলাদা করে কোনো context দেওয়ার দরকার নেই, git লিংকটাই প্রম্পটের ভেতরে আছে।
