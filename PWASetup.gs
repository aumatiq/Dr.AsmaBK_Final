/* ============================================================
   PWASetup.gs — PART 13: PWA Manifests, Icons & Install Experience
   ============================================================
   কী করে এই ফাইল:
   doGet() (Code.gs) দুইটা route কল করে যেগুলোর ফাংশন এই ফাইলে ছিল না —
   getPublicManifestJson_() এবং getDashboardManifestJson_() — ফলে
   ?file=manifest / ?file=manifest-dashboard হিট করলে runtime error
   হতো এবং PWA install prompt কখনো আসতো না। এই ফাইল সেই bug ফিক্স করে।

   দুইটা আলাদা ভিজ্যুয়াল আইডেন্টিটি:
   - PATIENT app (drasma.aumatiq.com)        → Rose Pink → Teal gradient icon
   - STAFF/DOCTOR app (drasma.aumatiq.com/admin.html) → Deep Plum → Indigo gradient icon
   দুটোই stethoscope glyph ব্যবহার করে (আগের flower/generic mark বাদ)।

   ⚠️ আইকন ফাইলগুলো GitHub Pages-এ হোস্ট হয় (Apps Script নিজে static
   binary file serve করতে পারে না), তাই URL গুলো drasma.aumatiq.com
   ডোমেইন থেকে আসে — নিচের ICON_BASE_PATIENT_ / ICON_BASE_STAFF_
   পরিবর্তন করে দরকার হলে আপডেট করা যাবে।

   🔧 PART 20 FIX (2026-07-12): staff dashboard-এর জন্য Option A
   (single-domain, drasma.aumatiq.com/admin.html) কনফার্ম হওয়ায়
   ICON_BASE_STAFF_ আগের 'admin.drasma.aumatiq.com/icons/staff' থেকে
   বদলে 'drasma.aumatiq.com/icons/staff' করা হলো — কারণ কোনো আলাদা
   admin সাবডোমেইন এখন আর সেট আপ হচ্ছে না। এই একই ডোমেইনে icon folder
   structure হবে: /icons/ (patient) এবং /icons/staff/ (staff)।
   ============================================================ */

var ICON_BASE_PATIENT_ = 'https://drasma.aumatiq.com/icons';
var ICON_BASE_STAFF_   = 'https://drasma.aumatiq.com/icons/staff';

/* ─────────────────────────────────────────────────────────────
   HELPER: DoctorProfile থেকে ক্লিনিকের নাম/থিম কালার আনে
   (Settings → Website Auto-Sync নীতি মেনে — হার্ডকোড না করে
   সম্ভব হলে লাইভ ডেটা ব্যবহার করা)
───────────────────────────────────────────────────────────── */
function getManifestProfile_() {
  var fallback = { clinicName: "Dr. Asma's Clinic", doctorName: 'Asma Binte Khair' };
  try {
    var ss    = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('DoctorProfile');
    if (!sheet) return fallback;
    var data = sheet.getDataRange().getValues();
    var p = {};
    for (var i = 0; i < data.length; i++) {
      if (data[i][0] && data[i][0] !== 'Field') p[data[i][0]] = data[i][1] || '';
    }
    return {
      clinicName: p.ClinicName || fallback.clinicName,
      doctorName: p.DoctorName || fallback.doctorName
    };
  } catch (e) {
    return fallback;
  }
}

/* ─────────────────────────────────────────────────────────────
   PATIENT MANIFEST — drasma.aumatiq.com
───────────────────────────────────────────────────────────── */
function getPublicManifestJson_() {
  var prof = getManifestProfile_();
  return {
    name: "Dr. " + prof.doctorName + " — Patient Portal",
    short_name: "Dr. Asma Clinic",
    description: "Book appointments, view prescriptions and test reports — " + prof.clinicName + ".",
    start_url: "/?page=home",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#0F0A1A",
    theme_color: "#0F0A1A",
    lang: "en",
    dir: "ltr",
    categories: ["medical", "health"],
    icons: [
      { src: ICON_BASE_PATIENT_ + "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: ICON_BASE_PATIENT_ + "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: ICON_BASE_PATIENT_ + "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: ICON_BASE_PATIENT_ + "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
    ]
  };
}

/* ─────────────────────────────────────────────────────────────
   STAFF / DOCTOR DASHBOARD MANIFEST — drasma.aumatiq.com/admin.html
───────────────────────────────────────────────────────────── */
function getDashboardManifestJson_() {
  return {
    name: "Clinic Dashboard — Dr. Asma's Clinic (Staff)",
    short_name: "Clinic Dashboard",
    description: "Internal doctor/assistant dashboard — appointments, patients, finance.",
    start_url: "/?page=dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#0F0A1A",
    theme_color: "#1C1230",
    lang: "en",
    dir: "ltr",
    categories: ["medical", "productivity", "business"],
    icons: [
      { src: ICON_BASE_STAFF_ + "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: ICON_BASE_STAFF_ + "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: ICON_BASE_STAFF_ + "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: ICON_BASE_STAFF_ + "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
    ]
  };
}
