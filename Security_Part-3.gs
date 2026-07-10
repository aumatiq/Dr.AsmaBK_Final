/**
 * AUMATIQ — Doctor & Clinic Automation System
 * Part 17: Security & Data Protection Hardening (Security.gs) — v1.0
 * ─────────────────────────────────────────────
 * এই ফাইলটা নতুন। এখানে যা আছে:
 *  1. Brute-force Lockout (Login Attempts ট্র্যাকিং) — ১০ বার ভুল → ১০ মিনিট লক (soft)
 *  2. Audit Log (কে, কখন, কী এডিট/ডিলিট/ফাইন্যান্স এন্ট্রি করলো)
 *     → ১ বছর পর পুরনো এন্ট্রি auto-archive হয়ে যাবে আলাদা শীটে
 *  3. Input Sanitization হেল্পার (পাবলিক ফর্ম থেকে আসা টেক্সটে HTML ট্যাগ স্ট্রিপ করা)
 *  4. Monthly Full-System Backup — প্রতি মাসে Drive-এ একটা নতুন ফোল্ডারে পুরো
 *     স্প্রেডশিটের (সব রোগীর তথ্য, অ্যাপয়েন্টমেন্ট, ফাইন্যান্স, টেস্ট রেকর্ড —
 *     সব ডেটাবেসের) কপি + একটা manifest ফাইল সেভ হবে, সম্পূর্ণ স্বয়ংক্রিয়ভাবে
 *     (কোনো ম্যানুয়াল স্টেপ লাগবে না, একবার ইনস্টল করলেই চলতে থাকবে)।
 *
 * নোট: রোগীর টেস্ট রিপোর্ট/ছবি (PatientFiles ফোল্ডারের আসল ফাইল) এমনিতেই Google
 * Drive-এ স্থায়ীভাবে জমা থাকে (কখনো ডিলিট হয় না) — তাই সেগুলো প্রতি মাসে আবার
 * কপি করে ডুপ্লিকেট স্টোরেজ খরচ বাড়ানো হয়নি। ব্যাকআপ ফোল্ডারে বরং পুরো
 * ডেটাবেসের (স্প্রেডশিট) কপি + সেই সময়ে মোট কতগুলো ফাইল/রোগী/রেকর্ড ছিল তার
 * একটা manifest থাকবে — এতে ডেটাবেস কোনো কারণে করাপ্ট বা ভুলবশত এডিট হয়ে
 * গেলে, নির্দিষ্ট মাসের অবস্থায় ফিরে যাওয়া যাবে।
 *
 * ইনস্টল করার নিয়ম (একবারই করতে হবে):
 *   Apps Script এডিটরে এই ফাইল থেকে নিচের ফাংশনটা রান করো —
 *     installMonthlySecurityMaintenance()
 *   এটা মাসের ১ তারিখ রাত ২টায় স্বয়ংক্রিয়ভাবে ব্যাকআপ + অডিট লগ আর্কাইভ চালাবে।
 */

// ═══════════════════════════════════════════════
// SECTION 1 — BRUTE-FORCE LOCKOUT (Login Attempts)
// ═══════════════════════════════════════════════

const MAX_LOGIN_ATTEMPTS   = 10; // এতবার ভুল হলে লক হবে (soft — ব্যবহারকারীর পছন্দ অনুযায়ী)
const LOCKOUT_MINUTES      = 10; // লক থাকলে কতক্ষণ

// ───────────────────────── হেল্পার: LoginAttempts শীট পাওয়া/তৈরি করা ─────────────────────────
function getLoginAttemptsSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("LoginAttempts");
  if (!sheet) {
    sheet = ss.insertSheet("LoginAttempts");
    sheet.getRange(1, 1, 1, 4).setValues([["Identifier", "FailCount", "LastAttempt", "LockedUntil"]]);
    sheet.setFrozenRows(1);
    sheet.hideSheet(); // ইউজারের চোখের সামনে থাকার দরকার নেই
  }
  return sheet;
}

// ───────────────────────── লগইন করার আগে চেক করা — লক আছে কিনা ─────────────────────────
/**
 * identifier = কার জন্য ট্র্যাক করা হচ্ছে (যেমন: "DOCTOR", "RECEPTIONIST",
 * বা patientId — যেই লগইন এন্ডপয়েন্টে যেটা প্রযোজ্য)
 * রিটার্ন করে: { allowed: true } অথবা { allowed: false, message, retryAfterMinutes }
 */
function checkLoginAllowed_(identifier) {
  const sheet = getLoginAttemptsSheet_();
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === String(identifier).trim()) {
      const lockedUntil = data[i][3];
      if (lockedUntil && new Date(lockedUntil) > new Date()) {
        const remainingMs = new Date(lockedUntil) - new Date();
        const remainingMin = Math.ceil(remainingMs / 60000);
        return {
          allowed: false,
          message: "অনেকবার ভুল Password দেওয়া হয়েছে। নিরাপত্তার জন্য " + remainingMin + " মিনিট পর আবার চেষ্টা করো।",
          retryAfterMinutes: remainingMin,
        };
      }
      return { allowed: true };
    }
  }
  return { allowed: true }; // কখনো ভুল হয়নি — অনুমতি আছে
}

// ───────────────────────── ভুল Password হলে কল করা হবে ─────────────────────────
function recordFailedLoginAttemptSheet_(identifier) {
  const sheet = getLoginAttemptsSheet_();
  const data = sheet.getDataRange().getValues();
  const now = new Date();

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === String(identifier).trim()) {
      const newCount = (Number(data[i][1]) || 0) + 1;
      sheet.getRange(i + 1, 2).setValue(newCount);
      sheet.getRange(i + 1, 3).setValue(now);
      if (newCount >= MAX_LOGIN_ATTEMPTS) {
        const lockUntil = new Date(now.getTime() + LOCKOUT_MINUTES * 60000);
        sheet.getRange(i + 1, 4).setValue(lockUntil);
      }
      return;
    }
  }

  // এই identifier-এর জন্য প্রথমবার ভুল — নতুন রো যোগ করা
  sheet.appendRow([identifier, 1, now, ""]);
}

// ───────────────────────── সফল লগইন হলে কাউন্টার রিসেট করা ─────────────────────────
function clearLoginAttemptsSheet_(identifier) {
  const sheet = getLoginAttemptsSheet_();
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === String(identifier).trim()) {
      sheet.getRange(i + 1, 2).setValue(0);
      sheet.getRange(i + 1, 4).setValue("");
      return;
    }
  }
}

// ═══════════════════════════════════════════════
// SECTION 2 — AUDIT LOG
// ═══════════════════════════════════════════════

// ───────────────────────── হেল্পার: AuditLog শীট পাওয়া/তৈরি করা ─────────────────────────
function getAuditLogSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("AuditLog");
  if (!sheet) {
    sheet = ss.insertSheet("AuditLog");
    sheet.getRange(1, 1, 1, 5).setValues([["Timestamp", "ActorRole", "ActorIdentifier", "ActionType", "Details"]]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/**
 * session = validateSession()/requireDoctor()/requireDoctorOrReceptionist() থেকে পাওয়া
 * অবজেক্ট { role, identifier } — মানে actor কে সেটা সবসময় server-side সেশন থেকেই
 * নেওয়া হয়, ক্লায়েন্ট থেকে পাঠানো নাম বিশ্বাস করা হয় না (স্পুফিং এড়াতে)।
 */
function logAuditEvent_(session, actionType, targetId, details) {
  try {
    const sheet = getAuditLogSheet_();
    sheet.appendRow([
      new Date(),
      session && session.role ? session.role : "UNKNOWN",
      session && session.identifier ? session.identifier : "UNKNOWN",
      actionType + (targetId ? " (" + targetId + ")" : ""),
      details || "",
    ]);
  } catch (e) {
    // অডিট লগ লিখতে ব্যর্থ হলেও মূল অ্যাকশন যেন আটকে না যায়
    Logger.log("Audit log write failed: " + e.message);
  }
}

// ───────────────────────── Doctor Dashboard-এ অডিট লগ দেখা (শুধু Doctor) ─────────────────────────
function getAuditLog(token) {
  requireDoctor(token);

  const sheet = getAuditLogSheet_();
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { success: true, entries: [] };

  const entries = [];
  // সর্বশেষ ৩০০টা এন্ট্রি দেখালেই যথেষ্ট (dashboard-এ লোড দ্রুত রাখার জন্য)
  const startRow = Math.max(1, data.length - 300);
  for (let i = startRow; i < data.length; i++) {
    entries.push({
      timestamp: data[i][0],
      role: data[i][1],
      identifier: data[i][2],
      action: data[i][3],
      details: data[i][4],
    });
  }
  entries.reverse(); // নতুন এন্ট্রি আগে
  return { success: true, entries: entries, totalCount: data.length - 1 };
}

// ───────────────────────── ১ বছরের পুরনো এন্ট্রি auto-archive করা ─────────────────────────
/**
 * "AuditLog" শীট থেকে ৩৬৫ দিনের বেশি পুরনো রো-গুলো "AuditLog_Archive" শীটে
 * সরিয়ে দেওয়া হয় (মুছে ফেলা হয় না, শুধু আলাদা শীটে রাখা হয়, যাতে মূল শীট
 * ছোট ও দ্রুত থাকে কিন্তু পুরনো ডেটা হারিয়ে না যায়)।
 * এটা মাসিক ট্রিগার থেকে নিজে থেকেই চলবে — ম্যানুয়ালি চালানোর দরকার নেই।
 */
function archiveOldAuditLogs_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = getAuditLogSheet_();
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { archived: 0 };

  const headers = data[0];
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 365);

  const keep = [headers];
  const toArchive = [];

  for (let i = 1; i < data.length; i++) {
    const ts = new Date(data[i][0]);
    if (ts < cutoff) {
      toArchive.push(data[i]);
    } else {
      keep.push(data[i]);
    }
  }

  if (toArchive.length === 0) return { archived: 0 };

  let archiveSheet = ss.getSheetByName("AuditLog_Archive");
  if (!archiveSheet) {
    archiveSheet = ss.insertSheet("AuditLog_Archive");
    archiveSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    archiveSheet.setFrozenRows(1);
    archiveSheet.hideSheet();
  }
  archiveSheet.getRange(archiveSheet.getLastRow() + 1, 1, toArchive.length, headers.length).setValues(toArchive);

  // মূল শীট পরিষ্কার করে শুধু "রাখার মতো" এন্ট্রিগুলো আবার বসানো
  sheet.clearContents();
  sheet.getRange(1, 1, keep.length, headers.length).setValues(keep);
  sheet.setFrozenRows(1);

  return { archived: toArchive.length };
}

// ═══════════════════════════════════════════════
// SECTION 3 — INPUT SANITIZATION (পাবলিক ফর্ম থেকে আসা টেক্সট)
// ═══════════════════════════════════════════════

/**
 * পাবলিক ওয়েবসাইট (booking form, patient self-upload) থেকে আসা free-text
 * ফিল্ড (নাম, ঠিকানা, reason, notes ইত্যাদি) থেকে HTML ট্যাগ/স্ক্রিপ্ট স্ট্রিপ
 * করে দেয় — এটা "defense in depth", মূল সুরক্ষা থাকবে output-এ escape করার
 * মধ্যে (DoctorDashboard.html / PublicWebsite.html-এর escapeHtml() ফাংশন),
 * কিন্তু ডেটাবেসে ঢোকার আগেও একটা লেয়ার রাখা ভালো অভ্যাস।
 */
function sanitizeUserText_(text) {
  if (text === null || text === undefined) return "";
  let str = String(text);
  // < > ট্যাগ পুরোপুরি স্ট্রিপ করা (script/img/svg সহ যেকোনো ট্যাগ)
  str = str.replace(/<[^>]*>/g, "");
  // অতিরিক্ত হোয়াইটস্পেস পরিষ্কার
  str = str.trim();
  // অস্বাভাবিক লম্বা ইনপুট আটকানো (accidental paste/abuse protection)
  if (str.length > 2000) str = str.substring(0, 2000);
  return str;
}

// ═══════════════════════════════════════════════
// SECTION 4 — MONTHLY FULL-SYSTEM BACKUP (Drive)
// ═══════════════════════════════════════════════

// ───────────────────────── হেল্পার: রুট Backup ফোল্ডার ─────────────────────────
function getRootBackupFolder_() {
  const rootFolderName = "Clinic.DrAsma_Backups";
  const folders = DriveApp.getFoldersByName(rootFolderName);
  if (folders.hasNext()) return folders.next();
  return DriveApp.createFolder(rootFolderName);
}

/**
 * প্রতি মাসে একবার চলবে (ট্রিগার দিয়ে, নিচে installMonthlySecurityMaintenance() দেখো)।
 * কাজ:
 *  ১. "Clinic.DrAsma_Backups" ফোল্ডারের ভেতরে "2026-07" ফরম্যাটে একটা সাব-ফোল্ডার তৈরি
 *  ২. পুরো ডেটাবেস স্প্রেডশিটের (সব ট্যাব — Patients, Appointments, TestRecords,
 *     Finance, DoctorProfile, Settings, Categories, AuditLog সব) একটা কপি সেই
 *     ফোল্ডারে সেভ করা
 *  ৩. একটা manifest.txt ফাইল সেভ করা — কবে ব্যাকআপ নেওয়া হলো, কতজন রোগী,
 *     কতগুলো অ্যাপয়েন্টমেন্ট, কতগুলো টেস্ট রেকর্ড ছিল, PatientFiles ফোল্ডারে
 *     মোট কতগুলো ফাইল ছিল — যাতে দরকার হলে যাচাই করা যায় কোনো ফাইল হারিয়েছে কিনা
 */
function runMonthlyFullBackup_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const rootFolder = getRootBackupFolder_();

  const now = new Date();
  const tz = Session.getScriptTimeZone();
  const monthLabel = Utilities.formatDate(now, tz, "yyyy-MM");
  const stamp = Utilities.formatDate(now, tz, "yyyy-MM-dd_HHmm");

  let monthFolder;
  const existing = rootFolder.getFoldersByName(monthLabel);
  monthFolder = existing.hasNext() ? existing.next() : rootFolder.createFolder(monthLabel);

  // ১. স্প্রেডশিট কপি
  const sourceFile = DriveApp.getFileById(ss.getId());
  const backupName = "DB_Backup_" + stamp;
  sourceFile.makeCopy(backupName, monthFolder);

  // ২. Manifest তৈরি করা
  const counts = getSystemDataCounts_();
  const manifestText =
    "AUMATIQ — Monthly Full Backup Manifest\n" +
    "Generated: " + now.toString() + "\n" +
    "─────────────────────────────\n" +
    "Patients: " + counts.patients + "\n" +
    "Appointments: " + counts.appointments + "\n" +
    "Test Records: " + counts.testRecords + "\n" +
    "Finance Entries: " + counts.financeEntries + "\n" +
    "Files in PatientFiles Drive Folder: " + counts.patientFileCount + "\n" +
    "─────────────────────────────\n" +
    "নোট: রোগীর আসল টেস্ট ফাইল/ছবি এই ব্যাকআপে ডুপ্লিকেট করা হয়নি — সেগুলো\n" +
    "'Clinic.DrAsma_PatientFiles' ফোল্ডারে স্থায়ীভাবে জমা আছে। এই ব্যাকআপ\n" +
    "শুধু পুরো ডেটাবেস (স্প্রেডশিট) + উপরের কাউন্ট স্ন্যাপশট।\n";

  monthFolder.createFile("manifest_" + stamp + ".txt", manifestText, MimeType.PLAIN_TEXT);

  // ৩. একই মাসে অনেক পুরনো ব্যাকআপ জমতে থাকলে (যেমন একই মাসে বারবার ম্যানুয়ালি রান করা
  //    হলে), শুধু সর্বশেষ ৩টা রেখে বাকিগুলো সরিয়ে দেওয়া — স্টোরেজ যেন অকারণে না বাড়ে
  pruneOldCopiesInFolder_(monthFolder, "DB_Backup_", 3);

  Logger.log("Monthly backup completed: " + backupName);
  return { success: true, folder: monthFolder.getUrl(), fileName: backupName };
}

// ───────────────────────── হেল্পার: সিস্টেমের বর্তমান কাউন্ট (manifest-এর জন্য) ─────────────────────────
function getSystemDataCounts_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  function rowCount(sheetName) {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return 0;
    const lastRow = sheet.getLastRow();
    return lastRow > 1 ? lastRow - 1 : 0;
  }

  let patientFileCount = 0;
  try {
    const root = getRootPatientFolder(); // PatientModule.gs-এ আগে থেকেই আছে
    const subFolders = root.getFolders();
    while (subFolders.hasNext()) {
      const pf = subFolders.next();
      const files = pf.getFiles();
      while (files.hasNext()) { files.next(); patientFileCount++; }
    }
  } catch (e) {
    patientFileCount = -1; // গোনা যায়নি
  }

  return {
    patients: rowCount("Patients"),
    appointments: rowCount("Appointments"),
    testRecords: rowCount("TestRecords"),
    financeEntries: rowCount("Finance"),
    patientFileCount: patientFileCount,
  };
}

// ───────────────────────── হেল্পার: পুরনো কপি ছেঁটে ফেলা ─────────────────────────
function pruneOldCopiesInFolder_(folder, prefix, keepCount) {
  const files = [];
  const it = folder.getFilesByType(MimeType.GOOGLE_SHEETS);
  while (it.hasNext()) {
    const f = it.next();
    if (f.getName().indexOf(prefix) === 0) files.push(f);
  }
  files.sort(function (a, b) { return b.getDateCreated() - a.getDateCreated(); });
  for (let i = keepCount; i < files.length; i++) {
    files[i].setTrashed(true);
  }
}

// ═══════════════════════════════════════════════
// SECTION 5 — TRIGGER INSTALLER (একবারই রান করতে হবে)
// ═══════════════════════════════════════════════

/**
 * এই ফাংশনটা Apps Script এডিটর থেকে ম্যানুয়ালি একবার রান করো (▶️ বাটনে ক্লিক)।
 * এটা মাসের ১ তারিখ রাত ২টায় স্বয়ংক্রিয়ভাবে:
 *   ১. পুরো সিস্টেমের ব্যাকআপ Drive-এ নেবে (runMonthlyFullBackup_)
 *   ২. ১ বছরের পুরনো Audit Log এন্ট্রি আর্কাইভ করবে (archiveOldAuditLogs_)
 * বারবার রান করলেও সমস্যা নেই — আগের ট্রিগার থাকলে সেটা মুছে নতুন করে বসাবে
 * (ডুপ্লিকেট ট্রিগার তৈরি হবে না)।
 */
function installMonthlySecurityMaintenance() {
  // আগের একই নামের ট্রিগার থাকলে মুছে ফেলা (ডুপ্লিকেট এড়াতে)
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(function (t) {
    if (t.getHandlerFunction() === "runMonthlySecurityMaintenance_") {
      ScriptApp.deleteTrigger(t);
    }
  });

  ScriptApp.newTrigger("runMonthlySecurityMaintenance_")
    .timeBased()
    .onMonthDay(1)
    .atHour(2)
    .create();

  SpreadsheetApp.getUi().alert(
    "✅ মাসিক ব্যাকআপ + অডিট লগ আর্কাইভ ট্রিগার সেট হয়ে গেছে।\n\n" +
    "প্রতি মাসের ১ তারিখ রাত ২টায় স্বয়ংক্রিয়ভাবে চলবে।"
  );
}

// ট্রিগার এই কম্বাইনড ফাংশনটাকে কল করে
function runMonthlySecurityMaintenance_() {
  runMonthlyFullBackup_();
  archiveOldAuditLogs_();
}

// ═══════════════════════════════════════════════
// SECTION 6 — (রেফারেন্স) CLIENT-SIDE XSS ESCAPE
// ═══════════════════════════════════════════════
/**
 * এই ফাংশনটা এখানে ডকুমেন্টেশনের জন্য রাখা হলো — আসল কার্যকর ভার্সনটা
 * DoctorDashboard.html এবং PublicWebsite.html-এর <script> ব্লকে যোগ করা
 * হয়েছে (escapeHtml নামে), কারণ ওটা ব্রাউজারে (client-side) কাজ করে,
 * Apps Script সার্ভারে না। এখানে শুধু রেফারেন্সের জন্য একই লজিক:
 *
 *   function escapeHtml(str) {
 *     if (str === null || str === undefined) return '';
 *     return String(str)
 *       .replace(/&/g, '&amp;')
 *       .replace(/</g, '&lt;')
 *       .replace(/>/g, '&gt;')
 *       .replace(/"/g, '&quot;')
 *       .replace(/'/g, '&#039;');
 *   }
 */
