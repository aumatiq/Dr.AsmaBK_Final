/**
 * ═══════════════════════════════════════════════════════════════
 * ONE-TIME SETUP SCRIPT — Chamber Data Seeder
 * ───────────────────────────────────────────────────────────────
 * এই ফাইলটা শুধুমাত্র একবার চালানোর জন্য।
 *
 * কী করে:
 *   "DoctorProfile" শীটে Chamber1/Chamber2 সংক্রান্ত ১০টি ফিল্ড
 *   (Name/Address/Hours/Serial/MapsLink) না থাকলে, Part 0-এর
 *   রেফারেন্স তথ্য দিয়ে সেগুলো তৈরি করে দেয়।
 *
 * নিরাপত্তা (Idempotent):
 *   - যদি কোনো ফিল্ড ইতিমধ্যে শীটে থাকে (এমনকি খালি ভ্যালু নিয়েও),
 *     এই স্ক্রিপ্ট সেটাকে touch করবে না। শুধু সম্পূর্ণ অনুপস্থিত
 *     row-গুলো appendRow দিয়ে যোগ করবে।
 *   - বারবার চালালেও কোনো ক্ষতি নেই (safe to re-run)।
 *
 * কীভাবে চালাবেন:
 *   1. Apps Script এডিটরে এই ফাইলটা প্রজেক্টে যোগ করুন
 *      (Code.gs, DashboardAdapter.gs-এর পাশে, একই প্রজেক্টে)।
 *   2. উপরের ফাংশন ড্রপডাউন থেকে "seedChamberDataOnce" সিলেক্ট করুন।
 *   3. ▶ Run বাটনে ক্লিক করুন। প্রথমবার Authorization চাইতে পারে —
 *      Allow করুন।
 *   4. Execution log-এ কনফার্মেশন মেসেজ দেখবেন।
 *   5. কাজ শেষে চাইলে এই ফাইলটা প্রজেক্ট থেকে ডিলিট করে দিতে পারেন
 *      (Settings ট্যাব — Part 8 — থেকে ভবিষ্যতে এই ফিল্ডগুলো
 *      সম্পাদনা করা যাবে)।
 * ═══════════════════════════════════════════════════════════════
 */
function seedChamberDataOnce() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("DoctorProfile");

  if (!sheet) {
    Logger.log('❌ "DoctorProfile" শীট পাওয়া যায়নি। আগে সেটআপ নিশ্চিত করুন।');
    return;
  }

  // ── Part 0 রেফারেন্স ডেটা (দুই চেম্বার) ──
  const defaults = {
    "Chamber1Name":     "Islami Bank Hospital, Khulna",
    "Chamber1Address":  "42 Khan Jahan Ali Road, Khulna",
    "Chamber1Hours":     "Sat–Wed · 3:00 PM – 5:00 PM",
    "Chamber1Serial":   "01712-068684",
    "Chamber1MapsLink": "",   // খালি রাখলে ওয়েবসাইট নিজে থেকে Name+Address দিয়ে Google Maps লিংক বানাবে
    "Chamber2Name":     "Doctors Point Specialized Hospital",
    "Chamber2Address":  "49 KDA Avenue, Khulna",
    "Chamber2Hours":     "Sat–Thu · 5:00 PM – 7:00 PM",
    "Chamber2Serial":   "01795-383803",
    "Chamber2MapsLink": ""
  };

  const data = sheet.getDataRange().getValues();
  const existingFields = {};
  for (let i = 0; i < data.length; i++) {
    existingFields[data[i][0]] = true;
  }

  let addedCount = 0;
  Object.keys(defaults).forEach(function (field) {
    if (existingFields[field]) return; // ইতিমধ্যে আছে — touch করবো না
    sheet.appendRow([field, defaults[field]]);
    addedCount++;
  });

  if (addedCount === 0) {
    Logger.log('✅ সব চেম্বার ফিল্ড আগে থেকেই বিদ্যমান। কিছু যোগ করা হয়নি — ডেটা অপরিবর্তিত।');
  } else {
    Logger.log('✅ ' + addedCount + 'টি নতুন চেম্বার ফিল্ড "DoctorProfile" শীটে যোগ হয়েছে।');
  }
  Logger.log('এখন PublicWebsite.html রিফ্রেশ করলে দুই চেম্বারের তথ্য দেখা যাবে।');
}
