# PART 24 — Bangla / English ভাষা টগল (Public Website)

## কী যোগ হলো

`PublicWebsite.html`-এ (patient-facing site, `drasma.aumatiq.com`) একটা ভাষা
টগল বাটন যোগ করা হয়েছে — নেভিগেশন বারে (`EN` / `বাং` বাটন) এবং মোবাইল মেনুতে
("বাংলায় দেখুন")। ক্লিক করলে পুরো পেজের static টেক্সট (নেভিগেশন, হিরো, About,
Services, Stats, সময়সূচী, Testimonials, Blog/Recommended Doctors হেডার, FAQ,
Booking ফর্ম, Patient Portal, Footer) তাৎক্ষণিকভাবে বাংলায় বদলে যায় — পেজ রিলোড
হয় না।

## Bangla কেমন লেখা হয়েছে

- আক্ষরিক (word-by-word) অনুবাদ না করে, সহজ, প্রচলিত, formal চলিত বাংলায় লেখা
  হয়েছে — যাতে কম-শিক্ষিত রোগীও সহজে বুঝতে পারেন।
- "অ্যাপয়েন্টমেন্ট", "প্যাথলজি", "হোয়াটসঅ্যাপ"-এর মতো শব্দ রাখা হয়েছে কারণ এগুলো
  বাংলাদেশে ক্লিনিকে সবাই এমনিতেই বোঝে ও ব্যবহার করে — এগুলোকে জোর করে কঠিন
  সংস্কৃতভাষী বাংলায় রূপান্তর করা হয়নি (যেমন "নিয়োগকাল" জাতীয় শব্দ ব্যবহার করা
  হয়নি)।
- সময়সূচী টেবিল-এ দিনের নাম (শনিবার, রবিবার...) এবং "বন্ধ"/"আজ" ট্যাগও বাংলায়
  বদলায়।

## কোনটা অনুবাদ হয় না (এবং কেন)

নিচের অংশগুলো **doctor-এর নিজের Google Sheet ডেটা থেকে আসে** — তাই এগুলো
স্বয়ংক্রিয়ভাবে অনুবাদ হয় না, ডাক্তার Sheet-এ যেভাবে লিখেছেন সেভাবেই থাকবে:
- ডাক্তারের Bio / About টেক্সট (`aboutBio`, `heroSub`, `footDesc`)
- ক্লিনিকের ঠিকানা (`ClinicAddress`)
- Blog আর্টিকেলের বিষয়বস্তু (Articles.gs থেকে আসে)
- Recommended Doctors-এর নোট
- Patient-এর নিজের ডেটা (নাম, appointment reason, ইত্যাদি)

**ভবিষ্যতে চাইলে:** Google Sheet-এ একটা আলাদা "Bio (Bangla)" কলাম যোগ করে,
`getDoctorProfile()`-এ সেটা রিটার্ন করিয়ে, `renderProfile()`-এ `CURLANG==='bn'`
হলে সেই কলাম দেখানো যাবে — এটা একটা future enhancement, এই Part-এ করা হয়নি।

## কীভাবে মনে রাখে (persistence)

Theme toggle-এর মতোই `sessionStorage` ব্যবহার করা হয়েছে (key:
`aumatiq-drasma-lang`) — `localStorage` ব্যবহার করা হয়নি কারণ Apps Script-এর
iframe sandbox-এ সেটা নির্ভরযোগ্য না (এটা repo-র established pattern, theme
toggle-এও একই কারণে sessionStorage ব্যবহার হয়েছে)।

## Deploy করার ধাপ

এটা শুধু একটা ফাইল বদল (`PublicWebsite.html`) — কোনো নতুন `.gs` ফাইল বা নতুন
permission লাগে না। তাই Master Plan-এর "Deployment — Go Live" সেকশনের ধাপ ১
অনুসরণ করলেই হবে:

1. Apps Script editor খুলুন (Dr. Asma প্রজেক্টের bound script)।
2. পুরনো `PublicWebsite.html`-এর জায়গায় নতুন ফাইলের সম্পূর্ণ কনটেন্ট paste করে
   Save করুন।
3. **⚠️ গুরুত্বপূর্ণ:** নতুন deployment বানাবেন না। `Deploy` → `Manage
   deployments` → existing deployment-এর ✏️ (edit আইকন) → `Version: New
   version` → `Deploy`। এতে exec URL অপরিবর্তিত থাকবে (patient-দের
   ইতিমধ্যে অ্যাড করা PWA শর্টকাট ভাঙবে না)।
4. GitHub repo-তেও `PublicWebsite.html` commit করুন যদি ওখানেও কপি রাখেন
   (commit message: `feat: Bangla/English language toggle on public website — Part 24`)।
5. টেস্ট করুন: লাইভ সাইটে গিয়ে ওপরের ডানে `EN`/`বাং` বাটনে ক্লিক করে পুরো পেজ
   বাংলায় বদলাচ্ছে কিনা দেখুন — বিশেষভাবে Booking ফর্ম আর সময়সূচী অংশ ভালোভাবে
   চেক করুন (এই দুটোই সবচেয়ে বেশি ব্যবহৃত হবে)।

## টেস্ট চেকলিস্ট

- [ ] EN → বাং টগল করলে nav, hero, FAQ, booking form সব বাংলায় বদলায়
- [ ] বাং → EN টগল করলে আবার ঠিকমতো ইংরেজিতে ফিরে আসে
- [ ] Booking ফর্মের প্লেসহোল্ডার টেক্সট (নাম/ফোন/কারণ) বাংলায় বদলায়
- [ ] সময়সূচী টেবিলের দিনের নাম ও "বন্ধ"/"আজ" ঠিকভাবে বাংলায় দেখায়
- [ ] ডাক্তারের নাম-সহ লেবেল ("Dr. Asma" / "ডা. আসমা") দুই ভাষাতেই সঠিক দেখায়
- [ ] ভাষা টগল করার পরেও WhatsApp/ফোন লিংক সঠিক নম্বরে যায় (ভাঙে না)
- [ ] পেজ রিফ্রেশ করলে আগের বেছে নেওয়া ভাষা মনে থাকে (একই ব্রাউজার ট্যাবে)
- [ ] মোবাইল মেনুতেও ভাষা বাটন কাজ করে
