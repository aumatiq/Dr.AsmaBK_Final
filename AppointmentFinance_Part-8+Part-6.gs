/**
 * AUMATIQ — Doctor & Clinic Automation System
 * Part 4: Appointment + Finance + Categories Manager (AppointmentFinance.gs)
 * ─────────────────────────────────────────────
 * v3.0 (Part 6 + Part 8 combined):
 *  - Finance schema migration (PaymentMethod, PaymentProofURL x2, Source,
 *    CreatedAt, SyncStatus, LastSyncAttempt, LastSyncError) — migration-safe,
 *    runs automatically, never touches existing rows/columns.
 *  - External Personal Finance App sync: best-effort push (webhook POST) on
 *    every entry + pull-able JSON API (apiKey-based, for doGet in Code.gs).
 *  - Drive folder ID overrides (Settings) — once set, everything uses the ID;
 *    if empty, auto-creates by name and SAVES the ID back to Settings so it
 *    never has to be entered again.
 *  - Payment proof (camera/scan/upload) — saved in BOTH central
 *    "Clinic.DrAsma_PaymentProofs" (by month) AND inside the patient's own
 *    folder ("Payments" subfolder) — kept PRIVATE (no ANYONE_WITH_LINK),
 *    served back to the Dashboard only via getPaymentProofImage() (Doctor-only).
 *  - Doctor profile photo — separate "Clinic.DrAsma_DoctorProfile" folder,
 *    old photos auto-archived, PhotoURL saved as a real embeddable image URL
 *    (fixes a pre-existing bug where the raw Drive "view" link doesn't render
 *    inside an <img> tag).
 */

// ═══════════════════════════════════════════════
// SECTION 1 — APPOINTMENT BOOKING + CALENDAR
// ═══════════════════════════════════════════════

// ───────────────────────── নির্দিষ্ট তারিখে available time slot বের করা ─────────────────────────
/**
 * Settings Tab-এর SlotDuration ও WorkingDays ব্যবহার করে
 * সকাল ৯টা থেকে রাত ৮টা পর্যন্ত স্লট জেনারেট করে, তারপর
 * Appointments Tab-এ যা বুকড আছে তা বাদ দিয়ে available স্লট রিটার্ন করে।
 */
function getAvailableSlots(dateString) {
  const slotDuration = parseInt(getSettingValue("SlotDuration") || 20, 10);
  const workingDaysRaw = String(getSettingValue("WorkingDays") || "Sat,Sun,Mon,Tue,Wed");
  const workingDays = workingDaysRaw.split(",").map(function(d) { return d.trim(); });

  // ── FIX: Timezone-safe date parsing ──
  const parts = String(dateString).split("-");
  const requestedDate = new Date(
    parseInt(parts[0], 10),
    parseInt(parts[1], 10) - 1,
    parseInt(parts[2], 10)
  );

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const requestedDayName = dayNames[requestedDate.getDay()];

  if (workingDays.indexOf(requestedDayName) === -1) {
    return {
      success: true,
      slots: [],
      message: "এই দিনে ক্লিনিক বন্ধ থাকে। (" + requestedDayName + ")"
    };
  }

  const openingTimeStr = String(getSettingValue("OpeningTime") || "09:00");
  const closingTimeStr = String(getSettingValue("ClosingTime") || "20:00");
  const openingMinutes = timeStringToMinutes(openingTimeStr);
  const closingMinutes = timeStringToMinutes(closingTimeStr);

  const allSlots = [];
  let startMinutes = openingMinutes;
  while (startMinutes < closingMinutes) {
    allSlots.push(minutesToDisplayTime(startMinutes));
    startMinutes += slotDuration;
  }

  const apptSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Appointments");
  const data = apptSheet.getDataRange().getValues();
  const headers = data[0];
  const dateCol   = headers.indexOf("Date");
  const timeCol   = headers.indexOf("TimeSlot");
  const statusCol = headers.indexOf("Status");

  const bookedSlots = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i][statusCol] === "Cancelled") continue;
    const rowDateStr = Utilities.formatDate(new Date(data[i][dateCol]), Session.getScriptTimeZone(), "yyyy-MM-dd");
    if (rowDateStr === dateString) {
      bookedSlots.push(String(data[i][timeCol]).trim());
    }
  }

  const availableSlots = allSlots.filter(function(slot) {
    return bookedSlots.indexOf(slot) === -1;
  });

  return { success: true, slots: availableSlots };
}

function timeStringToMinutes(timeStr) {
  const parts = timeStr.split(":");
  return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
}

function minutesToDisplayTime(totalMinutes) {
  let hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  if (hours === 0) hours = 12;
  const minStr = minutes < 10 ? "0" + minutes : String(minutes);
  return hours + ":" + minStr + " " + ampm;
}

// ───────────────────────── CLINIC HOURS আপডেট (Dashboard থেকে, Doctor-only) ─────────────────────────
function updateClinicHours(token, settingsData) {
  requireDoctor(token);

  if (settingsData.openingTime) {
    setSettingValue("OpeningTime", settingsData.openingTime);
  }
  if (settingsData.closingTime) {
    setSettingValue("ClosingTime", settingsData.closingTime);
  }
  if (settingsData.slotDuration) {
    setSettingValue("SlotDuration", settingsData.slotDuration);
  }
  if (settingsData.workingDays) {
    setSettingValue("WorkingDays", settingsData.workingDays);
  }

  return { success: true, message: "ক্লিনিকের সময়সূচী আপডেট হয়েছে।" };
}

// ───────────────────────── হেল্পার: Settings Tab-এ ভ্যালু লেখা/আপডেট করা ─────────────────────────
function setSettingValue(fieldName, newValue) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Settings");
  if (!sheet) {
    throw new Error('"Settings" নামে কোনো শীট খুঁজে পাওয়া যায়নি।');
  }
  const data = sheet.getDataRange().getValues();
  const target = String(fieldName).trim();

  for (let i = 0; i < data.length; i++) {
    if (String(data[i][0]).trim() === target) {
      sheet.getRange(i + 1, 2).setValue(newValue);
      return true;
    }
  }
  // ফিল্ড না থাকলে নতুন রো হিসেবে যোগ করে দাও (migration-safe append)
  sheet.appendRow([target, newValue]);
  return true;
}

// ───────────────────────── বর্তমান Clinic Hours দেখা (Dashboard লোড হওয়ার সময়) ─────────────────────────
function getClinicHours(token) {
  requireDoctorOrReceptionist(token);

  return {
    success: true,
    openingTime: getSettingValue("OpeningTime"),
    closingTime: getSettingValue("ClosingTime"),
    slotDuration: getSettingValue("SlotDuration"),
    workingDays: getSettingValue("WorkingDays"),
  };
}

// ═══════════════════════════════════════════════
// SECTION 1.5 — SCHEMA MIGRATION (idempotent, auto-runs, never destructive)
// ═══════════════════════════════════════════════

/**
 * Finance শীটে নতুন কলাম লাগলে (আগে থেকে না থাকলে) নিঃশব্দে যোগ করে দেয়,
 * পুরনো কোনো ডেটা/কলাম কখনো মুছবে না বা সরাবে না — শুধু ডানপাশে নতুন
 * কলাম appendহবে।
 */
function ensureFinanceSchema_() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Finance");
  if (!sheet) throw new Error('"Finance" শীট খুঁজে পাওয়া যায়নি।');

  const lastCol = Math.max(sheet.getLastColumn(), 1);
  const existingHeaders = sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(function(h) {
    return String(h).trim();
  });

  const requiredHeaders = [
    "EntryID", "Date", "Type", "Category", "PatientID", "Amount", "Notes",
    "PaymentMethod", "PaymentProofURL", "PaymentProofPatientCopyURL",
    "Source", "CreatedAt", "SyncStatus", "LastSyncAttempt", "LastSyncError"
  ];

  const missing = requiredHeaders.filter(function(h) { return existingHeaders.indexOf(h) === -1; });
  if (missing.length > 0) {
    const startCol = existingHeaders.length + 1;
    sheet.getRange(1, startCol, 1, missing.length).setValues([missing]);
    sheet.getRange(1, startCol, 1, missing.length)
      .setFontWeight("bold").setBackground("#7C3AED").setFontColor("#FFFFFF");
  }
  return sheet;
}

/**
 * Settings শীটে External-App sync + Drive folder override ফিল্ডগুলো
 * না থাকলে যোগ করে দেয়। FinanceApiKey প্রথমবার auto-generate হয়।
 */
function ensureSettingsSchema_() {
  const defaults = [
    ["ExternalFinanceAppWebhookURL", ""],
    ["FinanceApiKey", ""],
    ["DriveFolderID_PatientFiles", ""],
    ["DriveFolderID_PaymentProofs", ""],
    ["DriveFolderID_DoctorProfile", ""]
  ];

  defaults.forEach(function(pair) {
    const existing = getSettingValue(pair[0]);
    if (existing === null || existing === undefined || existing === "") {
      if (pair[0] === "FinanceApiKey") {
        // প্রথমবার auto-generate — ডাক্তারকে হাতে কিছু বসাতে হবে না
        setSettingValue(pair[0], Utilities.getUuid());
      } else if (existing === null || existing === undefined) {
        setSettingValue(pair[0], pair[1]);
      }
    }
  });
}

// ═══════════════════════════════════════════════
// SECTION 1.6 — DRIVE FOLDER HELPERS (ID override → name-based fallback → auto-save ID)
// ═══════════════════════════════════════════════

/**
 * settingKey-তে যদি একটা বৈধ Folder ID সেভ করা থাকে সেটাই ব্যবহার হবে।
 * না থাকলে defaultName দিয়ে ফোল্ডার খোঁজা/তৈরি হবে, এবং তার ID
 * সাথে সাথে Settings-এ সেভ হয়ে যাবে — যেন দ্বিতীয়বার আর নাম দিয়ে
 * খুঁজতে না হয়, ভবিষ্যতে সব জায়গায় (নতুন ডিভাইস থেকে চালানো হলেও)
 * এই একই ফোল্ডার ব্যবহার হয়।
 */
function getRootFolderByKey_(settingKey, defaultName) {
  const savedId = getSettingValue(settingKey);
  if (savedId) {
    try {
      return DriveApp.getFolderById(savedId);
    } catch (e) {
      // সেভ করা ID আর বৈধ না (ডিলিট হয়ে গেছে) — নিচে নাম দিয়ে নতুন করে তৈরি হবে
    }
  }
  const found = DriveApp.getFoldersByName(defaultName);
  const folder = found.hasNext() ? found.next() : DriveApp.createFolder(defaultName);
  setSettingValue(settingKey, folder.getId());
  return folder;
}

function getOrCreateSubfolder_(parentFolder, name) {
  const found = parentFolder.getFoldersByName(name);
  return found.hasNext() ? found.next() : parentFolder.createFolder(name);
}

// ───────────────────────── Settings থেকে Drive Folder ID override দেখা/সেভ করা (Doctor-only) ─────────────────────────
function getDriveFolderSettings(token) {
  requireDoctor(token);
  ensureSettingsSchema_();
  return {
    success: true,
    patientFilesFolderId:  getSettingValue("DriveFolderID_PatientFiles") || "",
    paymentProofsFolderId: getSettingValue("DriveFolderID_PaymentProofs") || "",
    doctorProfileFolderId: getSettingValue("DriveFolderID_DoctorProfile") || ""
  };
}

function saveDriveFolderSettings(token, data) {
  requireDoctor(token);

  function validateAndSave(key, id) {
    if (id === undefined || id === null) return;
    const trimmed = String(id).trim();
    if (trimmed === "") { setSettingValue(key, ""); return; }
    try {
      DriveApp.getFolderById(trimmed); // valid কিনা যাচাই
      setSettingValue(key, trimmed);
    } catch (e) {
      throw new Error("এই Folder ID বৈধ না বা এই Google অ্যাকাউন্ট থেকে access নেই: " + trimmed);
    }
  }

  validateAndSave("DriveFolderID_PatientFiles",  data.patientFilesFolderId);
  validateAndSave("DriveFolderID_PaymentProofs", data.paymentProofsFolderId);
  validateAndSave("DriveFolderID_DoctorProfile", data.doctorProfileFolderId);

  return { success: true, message: "Drive ফোল্ডার সেটিংস সেভ হয়েছে — এখন থেকে এই ফোল্ডারগুলোই ব্যবহার হবে।" };
}

// ═══════════════════════════════════════════════
// SECTION 2 — FINANCE MODULE (শুধু DOCTOR অ্যাক্সেস করতে পারবে)
// ═══════════════════════════════════════════════

// ───────────────────────── নতুন ফাইন্যান্স এন্ট্রি অ্যাড করা (v3.0 — future-app-ready + auto-push) ─────────────────────────
function addFinanceEntry(token, entryData) {
  requireDoctor(token); // গুরুত্বপূর্ণ — শুধু Doctor, Receptionist না

  if (!entryData.type || !entryData.category || !entryData.amount) {
    return { success: false, message: "Type, Category, এবং Amount আবশ্যক।" };
  }

  const sheet = ensureFinanceSchema_();
  const allData = sheet.getDataRange().getValues();
  const headers = allData[0];

  let maxNumber = 0;
  for (let i = 1; i < allData.length; i++) {
    const match = String(allData[i][0]).match(/FN-(\d+)/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNumber) maxNumber = num;
    }
  }
  const newEntryId = "FN-" + String(maxNumber + 1).padStart(4, "0");
  const nowIso = new Date().toISOString();

  const rowObj = {
    EntryID: newEntryId,
    Date: entryData.date ? new Date(entryData.date) : new Date(),
    Type: entryData.type,
    Category: entryData.category,
    PatientID: entryData.patientId || "",
    Amount: entryData.amount,
    Notes: entryData.notes || "",
    PaymentMethod: entryData.paymentMethod || "",
    PaymentProofURL: "",                 // uploadPaymentProof() দিয়ে পরে বসবে (একই এন্ট্রিতে আপডেট হবে)
    PaymentProofPatientCopyURL: "",
    Source: "DrAsmaClinicSystem",
    CreatedAt: nowIso,
    SyncStatus: "Pending",
    LastSyncAttempt: "",
    LastSyncError: ""
  };

  const newRow = headers.map(function(h) { return rowObj[h] !== undefined ? rowObj[h] : ""; });
  sheet.appendRow(newRow);

  // Best-effort push — ব্যর্থ হলেও এন্ট্রি সেভ থেকে যাবে, শুধু SyncStatus = Failed থাকবে
  const pushResult = pushFinanceEntryToExternalApp_(rowObj);
  updateFinanceSyncStatus_(sheet, newEntryId, pushResult);

  return { success: true, entryId: newEntryId, message: "ফাইন্যান্স এন্ট্রি যুক্ত হয়েছে।", syncStatus: pushResult.status };
}

// ───────────────────────── SyncStatus/LastSyncAttempt/LastSyncError আপডেট করার হেল্পার ─────────────────────────
function updateFinanceSyncStatus_(sheet, entryId, pushResult) {
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idCol = headers.indexOf("EntryID");
  const statusCol = headers.indexOf("SyncStatus");
  const attemptCol = headers.indexOf("LastSyncAttempt");
  const errorCol = headers.indexOf("LastSyncError");

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idCol]) === String(entryId)) {
      sheet.getRange(i + 1, statusCol + 1).setValue(pushResult.status);
      sheet.getRange(i + 1, attemptCol + 1).setValue(new Date().toISOString());
      sheet.getRange(i + 1, errorCol + 1).setValue(pushResult.error || "");
      return;
    }
  }
}

// ───────────────────────── External Personal Finance App-এ PUSH করা (best-effort, non-blocking) ─────────────────────────
function pushFinanceEntryToExternalApp_(entry) {
  const webhookUrl = getSettingValue("ExternalFinanceAppWebhookURL");
  if (!webhookUrl) {
    return { status: "NotConfigured", error: "" };
  }

  try {
    const response = UrlFetchApp.fetch(webhookUrl, {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(entry),
      muteHttpExceptions: true,
      followRedirects: true
    });
    const code = response.getResponseCode();
    if (code >= 200 && code < 300) {
      return { status: "Synced", error: "" };
    }
    return { status: "Failed", error: "HTTP " + code + ": " + response.getContentText().substring(0, 200) };
  } catch (err) {
    return { status: "Failed", error: err.message };
  }
}

// ───────────────────────── ব্যর্থ হওয়া এন্ট্রি(গুলো) আবার push করার চেষ্টা (Dashboard "Retry Sync" বাটন) ─────────────────────────
function retryFinanceSync(token, entryId) {
  requireDoctor(token);
  const sheet = ensureFinanceSchema_();
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idCol = headers.indexOf("EntryID");

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idCol]) === String(entryId)) {
      const rowObj = {};
      headers.forEach(function(h, idx) { rowObj[h] = data[i][idx]; });
      const pushResult = pushFinanceEntryToExternalApp_(rowObj);
      updateFinanceSyncStatus_(sheet, entryId, pushResult);
      return { success: pushResult.status === "Synced", status: pushResult.status, error: pushResult.error };
    }
  }
  return { success: false, message: "এন্ট্রি খুঁজে পাওয়া যায়নি।" };
}

function retryAllFailedFinanceSync(token) {
  requireDoctor(token);
  const sheet = ensureFinanceSchema_();
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idCol = headers.indexOf("EntryID");
  const statusCol = headers.indexOf("SyncStatus");

  let retried = 0, succeeded = 0;
  for (let i = 1; i < data.length; i++) {
    if (data[i][statusCol] === "Failed") {
      const rowObj = {};
      headers.forEach(function(h, idx) { rowObj[h] = data[i][idx]; });
      const pushResult = pushFinanceEntryToExternalApp_(rowObj);
      updateFinanceSyncStatus_(sheet, data[i][idCol], pushResult);
      retried++;
      if (pushResult.status === "Synced") succeeded++;
    }
  }
  return { success: true, retried: retried, succeeded: succeeded };
}

// ───────────────────────── ফাইন্যান্স এন্ট্রি লিস্ট (তারিখ রেঞ্জ অনুযায়ী ফিল্টার) ─────────────────────────
function getFinanceEntries(token, startDate, endDate) {
  requireDoctor(token);

  const sheet = ensureFinanceSchema_();
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const dateCol = headers.indexOf("Date");

  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;

  const results = [];
  for (let i = 1; i < data.length; i++) {
    const rowDate = new Date(data[i][dateCol]);
    const afterStart = !start || rowDate >= start;
    const beforeEnd = !end || rowDate <= end;

    if (afterStart && beforeEnd) {
      const entryObj = {};
      headers.forEach(function (h, idx) { entryObj[h] = data[i][idx]; });
      results.push(entryObj);
    }
  }

  // সাম্প্রতিকতম আগে
  results.sort(function(a, b) { return new Date(b.Date) - new Date(a.Date); });

  return { success: true, entries: results, count: results.length };
}

// ───────────────────────── মাসিক ফাইন্যান্স সামারি (Income/Expense টোটাল) ─────────────────────────
function getMonthlyFinanceSummary(token, year, month) {
  requireDoctor(token);

  const sheet = ensureFinanceSchema_();
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const dateCol = headers.indexOf("Date");
  const typeCol = headers.indexOf("Type");
  const amountCol = headers.indexOf("Amount");
  const categoryCol = headers.indexOf("Category");
  const statusCol = headers.indexOf("SyncStatus");

  let totalIncome = 0;
  let totalExpense = 0;
  let pendingSyncCount = 0;
  let failedSyncCount = 0;
  const categoryBreakdown = {};

  for (let i = 1; i < data.length; i++) {
    const rowDate = new Date(data[i][dateCol]);
    if (rowDate.getFullYear() === year && rowDate.getMonth() + 1 === month) {
      const amount = parseFloat(data[i][amountCol]) || 0;
      const type = data[i][typeCol];
      const category = data[i][categoryCol];

      if (type === "Income") totalIncome += amount;
      if (type === "Expense") totalExpense += amount;

      categoryBreakdown[category] = (categoryBreakdown[category] || 0) + amount;
    }
    if (data[i][statusCol] === "Pending") pendingSyncCount++;
    if (data[i][statusCol] === "Failed") failedSyncCount++;
  }

  return {
    success: true,
    totalIncome: totalIncome,
    totalExpense: totalExpense,
    netProfit: totalIncome - totalExpense,
    categoryBreakdown: categoryBreakdown,
    pendingSyncCount: pendingSyncCount,
    failedSyncCount: failedSyncCount
  };
}

// ═══════════════════════════════════════════════
// SECTION 2.5 — EXTERNAL PERSONAL FINANCE APP INTEGRATION
// ═══════════════════════════════════════════════

/**
 * Doctor Dashboard-এ কল হবে (session token দিয়ে) — External App-এর
 * Webhook URL এবং এই সিস্টেমের নিজের API Key/Web-App URL দেখানোর জন্য,
 * যেন Doctor সেগুলো কপি করে ভবিষ্যতের Personal Finance App-এর Settings-এ
 * একবার বসিয়ে দিতে পারেন।
 */
function getExternalFinanceSettings(token) {
  requireDoctor(token);
  ensureSettingsSchema_();

  return {
    success: true,
    webhookURL: getSettingValue("ExternalFinanceAppWebhookURL") || "",
    apiKey: getSettingValue("FinanceApiKey") || "",
    thisSystemWebAppURL: ScriptApp.getService().getUrl(),
    pullEndpointExample: ScriptApp.getService().getUrl() +
      "?action=financeExport&apiKey=" + (getSettingValue("FinanceApiKey") || "YOUR_API_KEY") +
      "&start=2026-01-01&end=2026-12-31"
  };
}

function saveExternalFinanceSettings(token, data) {
  requireDoctor(token);
  if (data.webhookURL !== undefined) {
    const url = String(data.webhookURL).trim();
    if (url && !/^https?:\/\//i.test(url)) {
      return { success: false, message: "Webhook URL অবশ্যই http:// বা https:// দিয়ে শুরু হতে হবে।" };
    }
    setSettingValue("ExternalFinanceAppWebhookURL", url);
  }
  return { success: true, message: "External Finance App সেটিংস সেভ হয়েছে।" };
}

function regenerateFinanceApiKey(token) {
  requireDoctor(token);
  const newKey = Utilities.getUuid();
  setSettingValue("FinanceApiKey", newKey);
  return { success: true, apiKey: newKey, message: "নতুন API Key তৈরি হয়েছে। পুরনো Key দিয়ে আর pull endpoint কাজ করবে না — External App-এ নতুনটা আপডেট করে দিন।" };
}

/**
 * Doctor session token দিয়ে কল হবে (Dashboard থেকে ম্যানুয়াল Export/Download বাটনের জন্য)।
 */
function exportFinanceEntriesForExternalApp(token, startDate, endDate) {
  requireDoctor(token);
  return exportFinanceEntriesForExternalApp_internal(startDate, endDate);
}

/**
 * Internal শেয়ার্ড লজিক — session token ছাড়াও (apiKey-ভিত্তিক doGet API থেকে) কল হয়।
 */
function exportFinanceEntriesForExternalApp_internal(startDate, endDate) {
  const sheet = ensureFinanceSchema_();
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const dateCol = headers.indexOf("Date");

  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;

  const results = [];
  for (let i = 1; i < data.length; i++) {
    const rowDate = new Date(data[i][dateCol]);
    if ((!start || rowDate >= start) && (!end || rowDate <= end)) {
      const entryObj = {};
      headers.forEach(function (h, idx) {
        entryObj[h] = (data[i][idx] instanceof Date) ? data[i][idx].toISOString() : data[i][idx];
      });
      results.push(entryObj);
    }
  }

  return { success: true, entries: results, count: results.length, exportedAt: new Date().toISOString() };
}

/**
 * Code.gs-এর doGet() থেকে কল হয়:  ?action=financeExport&apiKey=...&start=...&end=...
 * এখানে session token লাগে না — বরং Settings-এ সেভ থাকা FinanceApiKey দিয়ে
 * যাচাই হয়, যাতে External Personal Finance App (যেটার নিজের কোনো লগইন সেশন
 * নেই) নিয়মিত এই ডেটা pull করতে পারে।
 */
function handleFinanceExportApi_(params) {
  const providedKey = params.apiKey || "";
  const realKey = getSettingValue("FinanceApiKey") || "";

  if (!realKey || providedKey !== realKey) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Invalid or missing API key." }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const result = exportFinanceEntriesForExternalApp_internal(params.start || "", params.end || "");
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// ═══════════════════════════════════════════════
// SECTION 2.6 — PAYMENT PROOF UPLOAD (camera / scan / file, dual-folder, private)
// ═══════════════════════════════════════════════

/**
 * পেমেন্টের প্রমাণ (ক্যামেরা দিয়ে তোলা ছবি / স্ক্যান / আপলোড ফাইল)
 * Drive-এ সেভ করে এবং Finance শীটের সংশ্লিষ্ট এন্ট্রিতে লিংক বসিয়ে দেয়।
 * দুই জায়গায় কপি রাখা হয় (ব্রাউজিং সহজ করার জন্য):
 *   ১) কেন্দ্রীয় "Clinic.DrAsma_PaymentProofs" ফোল্ডার (মাস অনুযায়ী সাব-ফোল্ডার)
 *   ২) সংশ্লিষ্ট patient-এর নিজের ফোল্ডারের ভেতরে "Payments" সাব-ফোল্ডার
 * নিরাপত্তার জন্য ফাইল দুটোই সম্পূর্ণ PRIVATE থাকে (কোনো ANYONE_WITH_LINK
 * শেয়ারিং না) — শুধুমাত্র getPaymentProofImage() দিয়ে Doctor নিজে দেখতে পারবে।
 */
function uploadPaymentProof(token, base64Data, mimeType, fileName, patientId, entryId) {
  requireDoctor(token);

  if (!base64Data || !fileName) {
    return { success: false, message: "ছবি/ফাইল পাওয়া যায়নি।" };
  }

  try {
    const cleanBase64 = base64Data.indexOf(",") !== -1 ? base64Data.split(",").pop() : base64Data;
    const decoded = Utilities.base64Decode(cleanBase64);
    const blob = Utilities.newBlob(decoded, mimeType, fileName);

    // ১) কেন্দ্রীয় ফোল্ডার (মাস অনুযায়ী)
    const centralRoot = getRootFolderByKey_("DriveFolderID_PaymentProofs", "Clinic.DrAsma_PaymentProofs");
    const monthLabel = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM");
    const monthFolder = getOrCreateSubfolder_(centralRoot, monthLabel);
    const centralFile = monthFolder.createFile(blob.copyBlob());

    let patientCopyUrl = "";
    if (patientId) {
      // ২) patient-এর নিজের ফোল্ডারের ভেতরে "Payments" সাব-ফোল্ডার
      const patientFolder = getPatientFolder(patientId);
      const paymentsSub = getOrCreateSubfolder_(patientFolder, "Payments");
      const patientFile = paymentsSub.createFile(blob.copyBlob());
      patientCopyUrl = patientFile.getUrl();
    }

    // Finance শীটে entryId-র বিপরীতে URL বসানো
    if (entryId) {
      const sheet = ensureFinanceSchema_();
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const idCol = headers.indexOf("EntryID");
      const proofCol = headers.indexOf("PaymentProofURL");
      const proofCopyCol = headers.indexOf("PaymentProofPatientCopyURL");

      for (let i = 1; i < data.length; i++) {
        if (String(data[i][idCol]) === String(entryId)) {
          sheet.getRange(i + 1, proofCol + 1).setValue(centralFile.getUrl());
          sheet.getRange(i + 1, proofCopyCol + 1).setValue(patientCopyUrl);
          break;
        }
      }
    }

    return {
      success: true,
      fileId: centralFile.getId(),
      centralUrl: centralFile.getUrl(),
      patientCopyUrl: patientCopyUrl,
      message: "পেমেন্ট প্রুফ সেভ হয়েছে।"
    };
  } catch (err) {
    return { success: false, message: "ফাইল সেভ করতে সমস্যা হয়েছে: " + err.message };
  }
}

/**
 * Dashboard-এ প্রিভিউ/লাইটবক্সে দেখানোর জন্য — ফাইল private থাকায়
 * সরাসরি <img src> দিয়ে দেখানো যায় না, তাই base64 হিসেবে ফেরত দেওয়া হয়
 * (শুধুমাত্র Doctor, session token যাচাই করে)।
 */
function getPaymentProofImage(token, fileId) {
  requireDoctor(token);
  try {
    const file = DriveApp.getFileById(fileId);
    const blob = file.getBlob();
    return {
      success: true,
      base64: Utilities.base64Encode(blob.getBytes()),
      mimeType: blob.getContentType(),
      fileName: file.getName()
    };
  } catch (err) {
    return { success: false, message: "ছবি লোড করা যায়নি: " + err.message };
  }
}

// ═══════════════════════════════════════════════
// SECTION 2.7 — DOCTOR PROFILE PHOTO UPLOAD (public — shown on website)
// ═══════════════════════════════════════════════

/**
 * ডাক্তারের প্রোফাইল ছবি — এটা পাবলিক ওয়েবসাইটে দেখানো হয় (Part 1),
 * তাই এই ফাইলটাই একমাত্র ব্যতিক্রম যেটা ANYONE_WITH_LINK/VIEW শেয়ারিং
 * পায় (বাকি সব ফাইল private থাকে)। পুরনো ছবি(গুলো) অটোমেটিক ট্র্যাশে
 * পাঠানো হয় যাতে ফোল্ডার এলোমেলো না হয়।
 */
function uploadDoctorProfilePhoto(token, base64Data, mimeType, fileName) {
  requireDoctor(token);

  if (!base64Data || !fileName) {
    return { success: false, message: "ছবি পাওয়া যায়নি।" };
  }

  try {
    const folder = getRootFolderByKey_("DriveFolderID_DoctorProfile", "Clinic.DrAsma_DoctorProfile");

    // পুরনো প্রোফাইল ছবি ট্র্যাশে পাঠানো
    const oldFiles = folder.getFilesByName ? null : null; // no-op (রাখা হলো readability-র জন্য)
    const it = folder.getFiles();
    while (it.hasNext()) {
      const f = it.next();
      if (String(f.getName()).indexOf("ProfilePhoto_") === 0) {
        f.setTrashed(true);
      }
    }

    const cleanBase64 = base64Data.indexOf(",") !== -1 ? base64Data.split(",").pop() : base64Data;
    const decoded = Utilities.base64Decode(cleanBase64);
    const ext = (fileName.match(/\.[0-9a-z]+$/i) || [".jpg"])[0];
    const blob = Utilities.newBlob(decoded, mimeType, "ProfilePhoto_" + Date.now() + ext);
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    // সরাসরি <img src>-এ কাজ করার মতো embeddable URL (raw "view" লিংক কাজ করে না)
    const directImageUrl = "https://drive.google.com/thumbnail?id=" + file.getId() + "&sz=w1000";

    // DoctorProfile শীটে PhotoURL ফিল্ড আপডেট
    const profileSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("DoctorProfile");
    const pData = profileSheet.getDataRange().getValues();
    let found = false;
    for (let i = 0; i < pData.length; i++) {
      if (pData[i][0] === "PhotoURL") {
        profileSheet.getRange(i + 1, 2).setValue(directImageUrl);
        found = true;
        break;
      }
    }
    if (!found) profileSheet.appendRow(["PhotoURL", directImageUrl]);

    return { success: true, photoUrl: directImageUrl, message: "প্রোফাইল ছবি আপডেট হয়েছে — পাবলিক ওয়েবসাইটে অটোমেটিক দেখা যাবে।" };
  } catch (err) {
    return { success: false, message: "ছবি আপলোড করতে সমস্যা হয়েছে: " + err.message };
  }
}

// ═══════════════════════════════════════════════
// SECTION 3 — CATEGORIES MANAGER (Settings & Categories Tab)
// ═══════════════════════════════════════════════

// ───────────────────────── সব ক্যাটেগরি দেখা (Active + Deleted আলাদাভাবে, v1.3) ─────────────────────────
function getAllCategories(token) {
  requireDoctor(token);

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Categories");
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const activeCol = headers.indexOf("IsActive");

  const grouped = {};
  for (let i = 1; i < data.length; i++) {
    const group = data[i][0];
    if (!grouped[group]) grouped[group] = { active: [], deleted: [] };

    const catObj = {};
    headers.forEach(function (h, idx) { catObj[h] = data[i][idx]; });
    catObj["_rowIndex"] = i + 1;

    const isActive = String(data[i][activeCol]).toUpperCase() === "TRUE";
    if (isActive) {
      grouped[group].active.push(catObj);
    } else {
      grouped[group].deleted.push(catObj);
    }
  }

  return { success: true, categories: grouped };
}

// ───────────────────────── নতুন ক্যাটেগরি ভ্যালু অ্যাড করা (v1.3) ─────────────────────────
function addCategoryValue(token, categoryGroup, value) {
  const session = requireDoctor(token);

  if (!categoryGroup || !value) {
    return { success: false, message: "Category Group এবং Value দুটোই দিতে হবে।" };
  }

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Categories");
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === categoryGroup && String(data[i][1]).toLowerCase() === String(value).toLowerCase()) {
      const isActive = String(data[i][3]).toUpperCase() === "TRUE";
      if (isActive) {
        return { success: false, message: "এই ভ্যালু আগে থেকেই এই ক্যাটেগরিতে আছে।" };
      } else {
        sheet.getRange(i + 1, 4).setValue("TRUE");
        return { success: true, message: "এই ভ্যালু আগে ডিলিট করা ছিল, পুনরায় চালু করা হলো।" };
      }
    }
  }

  sheet.appendRow([categoryGroup, value, "FALSE", "TRUE", session.identifier, new Date()]);
  return { success: true, message: "নতুন ক্যাটেগরি ভ্যালু যুক্ত হয়েছে।" };
}

// ───────────────────────── ক্যাটেগরি ভ্যালু SOFT DELETE করা (v1.3) ─────────────────────────
function deleteCategoryValue(token, categoryGroup, value) {
  requireDoctor(token);

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Categories");
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const groupCol = headers.indexOf("CategoryGroup");
  const valueCol = headers.indexOf("Value");
  const defaultCol = headers.indexOf("IsSystemDefault");
  const activeCol = headers.indexOf("IsActive");

  for (let i = 1; i < data.length; i++) {
    if (data[i][groupCol] === categoryGroup && String(data[i][valueCol]) === String(value)) {
      const isProtected = String(data[i][defaultCol]).toUpperCase() === "TRUE";

      if (isProtected) {
        return { success: false, message: "এটা একটা সিস্টেম-প্রোটেক্টেড ভ্যালু, ডিলিট করা যাবে না।" };
      }

      sheet.getRange(i + 1, activeCol + 1).setValue("FALSE");
      return { success: true, message: "ক্যাটেগরি ভ্যালু ডিলিট হয়েছে (Restore করা সম্ভব)।" };
    }
  }

  return { success: false, message: "ক্যাটেগরি ভ্যালু পাওয়া যায়নি।" };
}

// ───────────────────────── ক্যাটেগরি ভ্যালু RESTORE করা (নতুন, v1.3) ─────────────────────────
function restoreCategoryValue(token, categoryGroup, value) {
  requireDoctor(token);

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Categories");
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const groupCol = headers.indexOf("CategoryGroup");
  const valueCol = headers.indexOf("Value");
  const activeCol = headers.indexOf("IsActive");

  for (let i = 1; i < data.length; i++) {
    if (data[i][groupCol] === categoryGroup && String(data[i][valueCol]) === String(value)) {
      sheet.getRange(i + 1, activeCol + 1).setValue("TRUE");
      return { success: true, message: "ক্যাটেগরি ভ্যালু পুনরায় চালু করা হলো।" };
    }
  }

  return { success: false, message: "ক্যাটেগরি ভ্যালু পাওয়া যায়নি।" };
}
