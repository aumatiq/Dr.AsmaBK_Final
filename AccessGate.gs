/**
 * AUMATIQ — Doctor & Clinic Automation System
 * Part 20-B: Google Account Access Gate (AccessGate.gs) — v1.0
 * ─────────────────────────────────────────────
 * উদ্দেশ্য:
 *  Dashboard (?page=dashboard) কেউ যেন whitelisted Google account দিয়ে
 *  লগইন করা ছাড়া একদম দেখতেই না পারে — শুধু app password (Auth.gs) না,
 *  তার আগে এই Google-স্তরের গেট পার হতে হবে। App password login screen
 *  (Doctor/Assistant role select) এই গেটের *পরে* আসবে, আগে না।
 *
 * এটা কীভাবে কাজ করে (মেকানিজম):
 *  Session.getActiveUser().getEmail() তখনই ভিজিটরের আসল ইমেইল রিটার্ন করে
 *  যখন Web App deployment-এর "Who has access" সেটিং "Anyone with Google
 *  account" (বা org-restricted) করা থাকে — "Anyone" (login ছাড়া) সেট করা
 *  থাকলে এই ফাংশন সবসময় খালি স্ট্রিং রিটার্ন করবে এবং এই গেট সবাইকে ব্লক
 *  করে দেবে (fail-closed — নিরাপদ ডিফল্ট)। তাই ডিপ্লয়মেন্ট সেটিং বদলানো
 *  **বাধ্যতামূলক** — নিচে "GO-LIVE ধাপ" দেখো।
 *
 *  Execute as: "Me" রাখা হচ্ছে (বদলাতে হবে না) — তাই স্প্রেডশিট অ্যাক্সেস
 *  সবসময় owner permission দিয়েই হবে, ভিজিটরকে আলাদা করে Sheet শেয়ার
 *  করা লাগবে না। শুধু Google account দিয়ে সাইন-ইন থাকলেই identity
 *  চেক করা সম্ভব হয়, Sheet-এর direct অ্যাক্সেস লাগে না।
 */

// ───────────────────────── কনফিগ ─────────────────────────
const DASHBOARD_ALLOWLIST_SETTING_KEY = "AllowedDashboardEmails";

// ───────────────────────── মূল গেট ফাংশন ─────────────────────────
/**
 * রিটার্ন করে:
 *   { allowed: true,  email: "..." }
 *   { allowed: false, reason: "NO_GOOGLE_LOGIN" }        → visitor Google দিয়ে সাইন-ইনই করেনি
 *   { allowed: false, reason: "NOT_WHITELISTED", email } → সাইন-ইন করেছে কিন্তু allowlist-এ নেই
 *   { allowed: false, reason: "NO_ALLOWLIST_CONFIGURED" }→ Settings-এ এখনো কোনো email সেট করা হয়নি
 */
function verifyDashboardAccess_() {
  let activeEmail = "";
  try {
    activeEmail = String(Session.getActiveUser().getEmail() || "").trim();
  } catch (e) {
    activeEmail = "";
  }

  if (!activeEmail) {
    return { allowed: false, reason: "NO_GOOGLE_LOGIN" };
  }

  const rawList = String(getSettingValue(DASHBOARD_ALLOWLIST_SETTING_KEY) || "").trim();
  if (!rawList) {
    // নিরাপদ ডিফল্ট: allowlist খালি থাকলে কাউকেই ঢুকতে দেওয়া হবে না।
    return { allowed: false, reason: "NO_ALLOWLIST_CONFIGURED" };
  }

  const allowedEmails = rawList
    .split(",")
    .map(function (e) { return e.trim().toLowerCase(); })
    .filter(Boolean);

  if (allowedEmails.indexOf(activeEmail.toLowerCase()) === -1) {
    return { allowed: false, reason: "NOT_WHITELISTED", email: activeEmail };
  }

  return { allowed: true, email: activeEmail };
}

// ───────────────────────── Access Denied পেজ (ব্র্যান্ডেড) ─────────────────────────
function renderAccessDeniedPage_(access) {
  // সবসময় generic মেসেজ — কারণ ঠিক কতটুকু তথ্য (whitelisted কিনা, কারা আছে) বাইরে
  // দেখানো enumeration risk তৈরি করে। আসল reason শুধু Audit Log-এ থাকবে।
  const html = `
  <!DOCTYPE html>
  <html lang="bn">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Access Restricted — AUMATIQ Dr. Asma</title>
    <style>
      * { margin:0; padding:0; box-sizing:border-box; }
      body {
        background:#0A0A0F; color:#F8F9FF; font-family:'Inter',sans-serif;
        min-height:100vh; display:flex; align-items:center; justify-content:center;
        padding:24px; text-align:center;
      }
      .card {
        max-width:440px; background:#0D1117; border:1px solid rgba(79,70,229,0.25);
        border-radius:16px; padding:40px 32px;
      }
      .icon {
        width:56px; height:56px; margin:0 auto 20px; border-radius:14px;
        background:rgba(245,166,35,0.12); border:1px solid rgba(245,166,35,0.3);
        display:flex; align-items:center; justify-content:center; font-size:26px;
      }
      h1 { font-family:'Syne',sans-serif; font-size:22px; font-weight:700; margin-bottom:12px; }
      p { font-size:14px; color:#A0A0B0; line-height:1.7; margin-bottom:8px; }
      .btn {
        display:inline-block; margin-top:20px; background:#4F46E5; color:#F8F9FF;
        text-decoration:none; padding:12px 24px; border-radius:8px; font-size:14px; font-weight:600;
      }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="icon">🔒</div>
      <h1>Access Restricted</h1>
      <p>এই Dashboard শুধুমাত্র অনুমোদিত (whitelisted) Google account দিয়ে অ্যাক্সেসযোগ্য।</p>
      <p>আপনার অ্যাকাউন্টে এই মুহূর্তে অনুমতি নেই। সঠিক Google account দিয়ে সাইন-ইন করা আছে কিনা চেক করো, অথবা AUMATIQ-এর সাথে যোগাযোগ করো।</p>
      <a class="btn" href="mailto:contact@aumatiq.com">Contact AUMATIQ Support</a>
    </div>
  </body>
  </html>`;

  // অডিট লগ — কে/কখন ব্লক হলো তার রেকর্ড রাখা হচ্ছে (Security.gs-এর existing ফাংশন ব্যবহার করে)
  try {
    logAuditEvent_(
      { role: "GATE", identifier: (access && access.email) ? access.email : "ANONYMOUS" },
      "DASHBOARD_ACCESS_DENIED",
      access ? access.reason : "UNKNOWN",
      "Blocked at Google-account gate (AccessGate.gs)"
    );
  } catch (e) {
    // অডিট লগ ব্যর্থ হলেও ইউজারকে Access Denied পেজ দেখানো বন্ধ হবে না
  }

  return HtmlService.createHtmlOutput(html)
    .setTitle("Access Restricted")
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
}

// ───────────────────────── ONE-TIME SETUP: Settings-এ নতুন row যোগ করা ─────────────────────────
/**
 * এটা একবারই রান করতে হবে (Apps Script এডিটর থেকে ম্যানুয়ালি সিলেক্ট করে ▶ Run)।
 * এটা setupDatabase()-এর মতো ধ্বংসাত্মক না — Settings শীট clear করে না,
 * শুধু "AllowedDashboardEmails" row না থাকলে নিচে যোগ করে দেয়।
 */
function addAllowedDashboardEmailsSetting() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Settings");
  if (!sheet) {
    throw new Error('"Settings" শীট খুঁজে পাওয়া যায়নি।');
  }

  const existing = getSettingValue(DASHBOARD_ALLOWLIST_SETTING_KEY);
  if (existing !== null) {
    Logger.log('"AllowedDashboardEmails" আগে থেকেই আছে — কিছু বদলানো হয়নি। বর্তমান ভ্যালু: ' + existing);
    return;
  }

  const lastRow = sheet.getLastRow();
  sheet.getRange(lastRow + 1, 1, 1, 2).setValues([
    [DASHBOARD_ALLOWLIST_SETTING_KEY, ""] // ফাঁকা রেখে দেওয়া হলো — ইচ্ছাকৃত (fail-closed)
  ]);

  Logger.log('"AllowedDashboardEmails" row Settings শীটে যোগ হয়েছে। এখন সেখানে ডাক্তার ও সহকারীর Gmail ঠিকানা কমা দিয়ে বসাও, যেমন: doctor@gmail.com,assistant@gmail.com');
}

// ───────────────────────── Doctor থেকে Allowlist আপডেট (in-app, password login-এর পরে) ─────────────────────────
function updateAllowedDashboardEmails(token, emailsCsv) {
  const session = requireDoctor(token); // শুধু Doctor role-ই এই লিস্ট বদলাতে পারবে

  const cleaned = String(emailsCsv || "")
    .split(",")
    .map(function (e) { return e.trim().toLowerCase(); })
    .filter(Boolean)
    .join(",");

  if (!cleaned) {
    return { success: false, message: "কমপক্ষে একটা Gmail ঠিকানা দিতে হবে।" };
  }

  setSettingValue(DASHBOARD_ALLOWLIST_SETTING_KEY, cleaned);
  logAuditEvent_(session, "DASHBOARD_ALLOWLIST_UPDATED", "", "New list: " + cleaned);

  return { success: true, message: "Allowlist আপডেট হয়েছে। নতুন লিস্ট: " + cleaned };
}

// ───────────────────────── Doctor থেকে বর্তমান Allowlist দেখা ─────────────────────────
function getAllowedDashboardEmails(token) {
  requireDoctor(token);
  return { success: true, emails: String(getSettingValue(DASHBOARD_ALLOWLIST_SETTING_KEY) || "") };
}
