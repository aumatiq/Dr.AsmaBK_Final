/**
 * AUMATIQ — Doctor & Clinic Automation System
 * Part 2: Patient Module (PatientModule.gs) — UPDATED v2.1
 * ─────────────────────────────────────────────
 * নতুন সংযোজন:
 *  1. searchPatientNamesForAutocomplete(query) — নাম+বয়স+ফোনের শেষ ৩ ডিজিট+শেষ ভিজিট
 *  2. patientPortalLoginByName(patientId, mobileNumber) — নাম দিয়ে login
 *  3. Brute-force protection: 5 attempts → 5 minutes lockout
 * 
 * পুরনো ফাংশন সব অপরিবর্তিত রাখা হয়েছে।
 */

// ───────────────────────── BRUTE-FORCE PROTECTION CONFIG ─────────────────────────
const BRUTE_FORCE_MAX_ATTEMPTS = 5;
const BRUTE_FORCE_LOCKOUT_MINUTES = 5;

// ───────────────────────── হেল্পার: রুট Drive ফোল্ডার পাওয়া/তৈরি করা ─────────────────────────
/**
 * পুরো সিস্টেমের সব পেশেন্ট-ফোল্ডার একটা নির্দিষ্ট মূল ফোল্ডারের
 * ভেতরে থাকবে, যাতে Drive-এ ছড়িয়ে-ছিটিয়ে না থাকে।
 */
function getRootPatientFolder() {
  const rootFolderName = "Clinic.DrAsma_PatientFiles";
  const folders = DriveApp.getFoldersByName(rootFolderName);

  if (folders.hasNext()) {
    return folders.next();
  }
  return DriveApp.createFolder(rootFolderName);
}

// ───────────────────────── হেল্পার: নির্দিষ্ট পেশেন্টের ফোল্ডার পাওয়া/তৈরি করা ─────────────────────────
function getPatientFolder(patientId) {
  const root = getRootPatientFolder();
  const folders = root.getFoldersByName(patientId);

  if (folders.hasNext()) {
    return folders.next();
  }
  return root.createFolder(patientId);
}

// ───────────────────────── হেল্পার: নতুন Patient ID জেনারেট করা ─────────────────────────
/**
 * ফরম্যাট: PT-YYYY-0001 (বছর + ক্রমিক নম্বর)
 * প্রতি বছর কাউন্টার নতুন করে শুরু হয় না — সম্পূর্ণ ক্রমিক,
 * তবে বছরের ট্যাগ থাকে শুধু readability-র জন্য।
 */
function generatePatientId() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Patients");
  const data = sheet.getDataRange().getValues();
  const year = new Date().getFullYear();

  let maxNumber = 0;
  for (let i = 1; i < data.length; i++) {
    const id = String(data[i][0]); // PatientID কলাম
    const match = id.match(/PT-\d{4}-(\d+)/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNumber) maxNumber = num;
    }
  }

  const nextNumber = maxNumber + 1;
  const padded = String(nextNumber).padStart(4, "0");
  return "PT-" + year + "-" + padded;
}

// ───────────────────────── PATIENT তৈরি করা (নতুন পেশেন্ট) ─────────────────────────
/**
 * patientData = { fullName, phone, age, gender, address }
 * রিটার্ন করে নতুন তৈরি হওয়া Patient ID।
 * এটা public website booking form (Part 5) থেকে আসবে, login লাগবে না —
 * তাই এখানে কোনো requireXXX() গার্ড নেই (ইচ্ছাকৃতভাবে)।
 */
function createPatient(patientData) {
  if (!patientData.fullName || !patientData.phone) {
    return { success: false, message: "নাম এবং ফোন নম্বর আবশ্যক।" };
  }

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Patients");

  // একই ফোন নম্বরে আগে থেকে patient আছে কিনা চেক করা হচ্ছে — duplicate তৈরি না হয়
  const existing = findPatientByPhone(patientData.phone);
  if (existing) {
    return { success: true, patientId: existing.patientId, message: "এই ফোন নম্বরে আগে থেকে একটা Patient ID আছে।", existing: true };
  }

  const newId = generatePatientId();
  const today = new Date();

  sheet.appendRow([
    newId,
    patientData.fullName,
    patientData.phone,
    patientData.age || "",
    patientData.gender || "",
    patientData.address || "",
    today,
    "", // LastVisit — এখনো কোনো visit হয়নি
    patientData.notes || "",
    patientData.email || "", // v3.0: Email — শীটের একদম শেষ কলাম (নতুন)
  ]);

  return { success: true, patientId: newId, message: "নতুন Patient ID তৈরি হয়েছে।", existing: false };
}

// ───────────────────────── হেল্পার: ফোন নম্বর normalize করা ─────────────────────────
/**
 * Normalize phone: স্পেস/ড্যাশ/+৮৮ prefix বাদ দিয়ে শেষ ১১ ডিজিট রিটার্ন।
 * উদাহরণ: "+88 01712 068684", "01712-068684", "017120 68684" সব → "01712068684"
 */
function normalizePhoneNumber(phone) {
  if (!phone) return "";
  
  // সব non-digit বাদ দাও
  let digits = String(phone).replace(/\D/g, "");
  
  // শেষ ১১ ডিজিট নাও (যদি ১১+ হয়)
  if (digits.length >= 11) {
    digits = digits.slice(-11);
  }
  
  return digits;
}

// ───────────────────────── হেল্পার: ফোন নম্বর দিয়ে patient খোঁজা ─────────────────────────
function findPatientByPhone(phone) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Patients");
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const phoneCol = headers.indexOf("Phone");
  const idCol = headers.indexOf("PatientID");
  const nameCol = headers.indexOf("FullName");

  const normalizedInput = normalizePhoneNumber(phone);

  for (let i = 1; i < data.length; i++) {
    const normalizedSheet = normalizePhoneNumber(String(data[i][phoneCol]));
    if (normalizedSheet === normalizedInput) {
      return { patientId: data[i][idCol], fullName: data[i][nameCol], rowIndex: i + 1 };
    }
  }
  return null;
}

// ───────────────────────── হেল্পার: Patient ID দিয়ে পুরো প্রোফাইল খোঁজা ─────────────────────────
function findPatientById_(patientId) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Patients");
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idCol = headers.indexOf("PatientID");
  const nameCol = headers.indexOf("FullName");
  const phoneCol = headers.indexOf("Phone");
  const emailCol = headers.indexOf("Email");

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idCol]).trim() === String(patientId).trim()) {
      return {
        patientId: data[i][idCol],
        fullName: data[i][nameCol],
        phone: data[i][phoneCol],
        email: emailCol > -1 ? data[i][emailCol] : "",
      };
    }
  }
  return null;
}

// ───────────────────────── নতুন: AUTOCOMPLETE — নাম দিয়ে সার্চ (Part 2) ─────────────────────────
/**
 * searchPatientNamesForAutocomplete(query)
 * রিটার্ন করে: [{ patientId, fullName, age, phoneLastThree, lastVisit }]
 * - শুধু ২ অক্ষরের উপরে সার্চ করে (rate-limiting)
 * - সর্বোচ্চ ১০টা ফলাফল রিটার্ন করে
 * - Public/anonymous endpoint — কোনো token লাগে না
 */
function searchPatientNamesForAutocomplete(query) {
  if (!query || String(query).trim().length < 2) {
    return { success: true, results: [] };
  }

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Patients");
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  const idCol = headers.indexOf("PatientID");
  const nameCol = headers.indexOf("FullName");
  const ageCol = headers.indexOf("Age");
  const phoneCol = headers.indexOf("Phone");
  const lastVisitCol = headers.indexOf("LastVisit");

  const lowerQuery = String(query).trim().toLowerCase();
  const results = [];

  for (let i = 1; i < data.length; i++) {
    const fullName = String(data[i][nameCol] || "").trim();
    
    // Empty row skip করো
    if (!fullName) continue;

    if (fullName.toLowerCase().indexOf(lowerQuery) !== -1) {
      const phone = String(data[i][phoneCol] || "").trim();
      const phoneLastThree = phone.length >= 3 ? phone.slice(-3) : phone;
      
      const lastVisit = data[i][lastVisitCol];
      let lastVisitStr = "";
      if (lastVisit) {
        try {
          const d = new Date(lastVisit);
          lastVisitStr = Utilities.formatDate(d, Session.getScriptTimeZone(), "dd MMM yyyy");
        } catch (e) {
          lastVisitStr = "";
        }
      }

      results.push({
        patientId: data[i][idCol],
        fullName: fullName,
        age: data[i][ageCol] || "",
        phoneLastThree: phoneLastThree,
        lastVisit: lastVisitStr
      });

      // সর্বোচ্চ ১০টা ফলাফল
      if (results.length >= 10) break;
    }
  }

  return { success: true, results: results };
}

// ───────────────────────── নতুন: BRUTE-FORCE PROTECTION HELPER ─────────────────────────
/**
 * Lockout status চেক করো patient-এর জন্য
 * রিটার্ন করে: { isLocked: bool, remainingMinutes: number }
 */
function checkLoginLockout_(patientId) {
  const cache = CacheService.getScriptCache();
  const lockKey = "LOGIN_LOCKOUT_" + patientId;
  const attemptsKey = "LOGIN_ATTEMPTS_" + patientId;

  const lockTimestamp = cache.get(lockKey);
  if (lockTimestamp) {
    const lockTime = parseInt(lockTimestamp, 10);
    const now = new Date().getTime();
    const elapsedMinutes = (now - lockTime) / (1000 * 60);

    if (elapsedMinutes < BRUTE_FORCE_LOCKOUT_MINUTES) {
      const remaining = Math.ceil(BRUTE_FORCE_LOCKOUT_MINUTES - elapsedMinutes);
      return { isLocked: true, remainingMinutes: remaining };
    } else {
      // Lockout মেয়াদ শেষ, cache পরিষ্কার করো
      cache.remove(lockKey);
      cache.remove(attemptsKey);
      return { isLocked: false, remainingMinutes: 0 };
    }
  }

  return { isLocked: false, remainingMinutes: 0 };
}

/**
 * Failed attempt রেকর্ড করো
 */
function recordFailedLoginAttempt_(patientId) {
  const cache = CacheService.getScriptCache();
  const attemptsKey = "LOGIN_ATTEMPTS_" + patientId;
  
  let attempts = parseInt(cache.get(attemptsKey) || "0", 10);
  attempts += 1;
  
  cache.put(attemptsKey, String(attempts), BRUTE_FORCE_LOCKOUT_MINUTES * 60);

  if (attempts >= BRUTE_FORCE_MAX_ATTEMPTS) {
    const lockKey = "LOGIN_LOCKOUT_" + patientId;
    cache.put(lockKey, String(new Date().getTime()), BRUTE_FORCE_LOCKOUT_MINUTES * 60);
    return { isNowLocked: true };
  }

  return { isNowLocked: false, attemptsRemaining: BRUTE_FORCE_MAX_ATTEMPTS - attempts };
}

/**
 * Successful login এর পর attempt cache পরিষ্কার করো
 */
function clearLoginAttempts_(patientId) {
  const cache = CacheService.getScriptCache();
  cache.remove("LOGIN_ATTEMPTS_" + patientId);
}

// ───────────────────────── নতুন: PATIENT PORTAL LOGIN (নাম + মোবাইল দিয়ে) ─────────────────────────
/**
 * patientPortalLoginByName(patientId, mobileNumber)
 * নাম অটোকমপ্লিট থেকে আসা patient ID + মোবাইল নম্বর দিয়ে লগইন।
 * 
 * মোবাইল নম্বর normalize হয় (স্পেস/ড্যাশ বাদ দিয়ে শেষ ১১ ডিজিট)।
 * Brute-force protection সহ (5 attempts → 5 minutes lockout)।
 */
function patientPortalLoginByName(patientId, mobileNumber) {
  try {
    // === LOCKOUT চেক ===
    const lockStatus = checkLoginLockout_(patientId);
    if (lockStatus.isLocked) {
      return {
        success: false,
        error: "অনেক চেষ্টা ব্যর্থ হয়েছে। দয়া করে " + lockStatus.remainingMinutes + " মিনিট পরে আবার চেষ্টা করুন।",
        isLocked: true
      };
    }

    // === PATIENT খোঁজা (PatientID দিয়ে) ===
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const patientsSheet = ss.getSheetByName("Patients");
    if (!patientsSheet) return { success: false, error: "ডেটাবেস পাওয়া যায়নি।" };

    const data = patientsSheet.getDataRange().getValues();
    const headers = data[0];
    const idCol = headers.indexOf("PatientID");
    const nameCol = headers.indexOf("FullName");
    const phoneCol = headers.indexOf("Phone");
    const ageCol = headers.indexOf("Age");
    const genderCol = headers.indexOf("Gender");
    const addressCol = headers.indexOf("Address");
    const registeredDateCol = headers.indexOf("RegisteredDate");
    const lastVisitCol = headers.indexOf("LastVisit");
    const emailCol = headers.indexOf("Email");

    const normalizedInput = normalizePhoneNumber(mobileNumber);

    for (let i = 1; i < data.length; i++) {
      const sheetPatientId = String(data[i][idCol] || "").trim();
      
      if (sheetPatientId === String(patientId).trim()) {
        const sheetPhone = normalizePhoneNumber(String(data[i][phoneCol] || ""));

        // === PHONE MATCH ===
        if (sheetPhone === normalizedInput) {
          // Success — lockout clear করো
          clearLoginAttempts_(patientId);

          return {
            success: true,
            patient: {
              patientId: data[i][idCol],
              fullName: data[i][nameCol],
              phone: data[i][phoneCol],
              age: data[i][ageCol] || "",
              gender: data[i][genderCol] || "",
              address: data[i][addressCol] || "",
              registeredDate: data[i][registeredDateCol]
                ? Utilities.formatDate(new Date(data[i][registeredDateCol]), Session.getScriptTimeZone(), "dd MMM yyyy")
                : "",
              lastVisit: data[i][lastVisitCol]
                ? Utilities.formatDate(new Date(data[i][lastVisitCol]), Session.getScriptTimeZone(), "dd MMM yyyy")
                : "",
              email: emailCol > -1 ? (data[i][emailCol] || "") : ""
            }
          };
        } else {
          // Phone mismatch — record failed attempt
          const attemptResult = recordFailedLoginAttempt_(patientId);
          if (attemptResult.isNowLocked) {
            return {
              success: false,
              error: "অনেক চেষ্টা ব্যর্থ হয়েছে। দয়া করে " + BRUTE_FORCE_LOCKOUT_MINUTES + " মিনিট পরে আবার চেষ্টা করুন।",
              isLocked: true
            };
          } else {
            return {
              success: false,
              error: "মোবাইল নম্বর মেলে না। অবশিষ্ট চেষ্টা: " + attemptResult.attemptsRemaining
            };
          }
        }
      }
    }

    // Patient ID পাওয়া যায়নি
    recordFailedLoginAttempt_(patientId);
    return { success: false, error: "আপনার তথ্য খুঁজে পাওয়া যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।" };
  } catch (err) {
    return { success: false, error: "সার্ভার ত্রুটি: " + err.message };
  }
}

// ───────────────────────── PATIENT SEARCH (Admin Dashboard থেকে) ─────────────────────────
/**
 * নাম, ফোন, বা Patient ID দিয়ে সার্চ করা যাবে (partial match)।
 * Admin/Receptionist দুজনেই এই ফাংশন ব্যবহার করতে পারবে।
 */
function searchPatients(token, query) {
  requireDoctorOrReceptionist(token);

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Patients");
  const data  = sheet.getDataRange().getValues();

  // ── FIX: Sheet-এ শুধু header থাকলে empty array return করো ──
  if (data.length <= 1) {
    return { success: true, patients: [], count: 0 };
  }

  const headers = data[0];
  const results = [];

  // null বা empty query হলে সব rows return করো
  const lowerQuery = (query && query.trim()) ? query.trim().toLowerCase() : null;

  for (let i = 1; i < data.length; i++) {
    const row = data[i];

    // Empty row skip করো
    const hasContent = row.some(function(cell) { return String(cell).trim() !== ''; });
    if (!hasContent) continue;

    if (!lowerQuery) {
      // No query — সব valid row return করো
      const patientObj = {};
      headers.forEach(function(h, idx) { patientObj[h] = row[idx]; });
      results.push(patientObj);
    } else {
      // Query আছে — match করলে return করো
      const rowText = row.join(' ').toLowerCase();
      if (rowText.indexOf(lowerQuery) !== -1) {
        const patientObj = {};
        headers.forEach(function(h, idx) { patientObj[h] = row[idx]; });
        results.push(patientObj);
      }
    }
  }

  return { success: true, patients: results, count: results.length };
}

// ───────────────────────── PATIENT EDIT (Admin Dashboard থেকে) ─────────────────────────
function editPatient(token, patientId, updatedFields) {
  requireDoctorOrReceptionist(token);

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Patients");
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idCol = headers.indexOf("PatientID");

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idCol]).trim() === String(patientId).trim()) {
      headers.forEach(function (h, colIdx) {
        if (updatedFields.hasOwnProperty(h) && h !== "PatientID") {
          sheet.getRange(i + 1, colIdx + 1).setValue(updatedFields[h]);
        }
      });
      return { success: true, message: "পেশেন্টের তথ্য আপডেট হয়েছে।" };
    }
  }

  return { success: false, message: "Patient ID পাওয়া যায়নি।" };
}

// ───────────────────────── TEST UPLOAD — ADMIN (সরাসরি Approved) ─────────────────────────
/**
 * fileData = { base64, mimeType, fileName, testName, testDate, remarks }
 * uploadedByName = "Doctor" বা "Receptionist" (UI থেকে role অনুযায়ী পাঠানো হবে)
 */
function adminUploadTestResult(token, patientId, fileData, uploadedByName) {
  const session = requireDoctorOrReceptionist(token);

  const result = saveTestFile(patientId, fileData);
  if (!result.success) return result;

  const recordId = addTestRecord({
    patientId: patientId,
    testName: fileData.testName,
    testDate: fileData.testDate,
    fileLink: result.fileUrl,
    uploadedBy: uploadedByName + " (Admin)",
    status: "Approved",
    approvedBy: session.identifier,
    approvedDate: new Date(),
    remarks: fileData.remarks || "",
  });

  return { success: true, message: "টেস্ট ফাইল সফলভাবে আপলোড হয়েছে এবং অনুমোদিত হয়েছে।", recordId: recordId };
}

// ───────────────────────── TEST UPLOAD — PATIENT SELF-UPLOAD (Pending Approval) ─────────────────────────
function patientUploadTestResult(token, fileData) {
  const session = requirePatient(token); // গার্ড — শুধু Patient
  const patientId = session.identifier;

  const result = saveTestFile(patientId, fileData);
  if (!result.success) return result;

  const recordId = addTestRecord({
    patientId: patientId,
    testName: fileData.testName,
    testDate: fileData.testDate,
    fileLink: result.fileUrl,
    uploadedBy: "Patient (Self-Upload)",
    status: "Pending Approval", // অ্যাডমিন অ্যাপ্রুভ না করা পর্যন্ত পেন্ডিং
    approvedBy: "",
    approvedDate: "",
    remarks: fileData.remarks || "",
  });

  return { success: true, message: "ফাইল আপলোড হয়েছে। Doctor/Receptionist অনুমোদনের পর এটা আপনার রেকর্ডে দেখা যাবে।", recordId: recordId };
}

// ───────────────────────── হেল্পার: ফাইল Drive-এ সেভ করা (Admin ও Patient দুজনের জন্যই reuse হয়) ─────────────────────────
function saveTestFile(patientId, fileData) {
  if (!fileData || !fileData.base64 || !fileData.fileName) {
    return { success: false, message: "ফাইল ডেটা পাওয়া যায়নি।" };
  }

  try {
    const folder = getPatientFolder(patientId);
    const decoded = Utilities.base64Decode(fileData.base64);
    const blob = Utilities.newBlob(decoded, fileData.mimeType, fileData.fileName);
    const file = folder.createFile(blob);

    // ফাইলটা যেন patient নিজে link থাকলে দেখতে পারে (Admin/Doctor অ্যাকাউন্টের ভেতরেই থাকছে, শুধু link-share)
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    return { success: true, fileUrl: file.getUrl(), fileId: file.getId() };
  } catch (e) {
    return { success: false, message: "ফাইল সেভ করতে সমস্যা হয়েছে: " + e.message };
  }
}

// ───────────────────────── হেল্পার: TestRecords Tab-এ নতুন এন্ট্রি অ্যাড করা ─────────────────────────
function addTestRecord(record) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("TestRecords");
  const data = sheet.getDataRange().getValues();

  let maxNumber = 0;
  for (let i = 1; i < data.length; i++) {
    const id = String(data[i][0]);
    const match = id.match(/TR-(\d+)/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNumber) maxNumber = num;
    }
  }
  const newRecordId = "TR-" + String(maxNumber + 1).padStart(4, "0");

  sheet.appendRow([
    newRecordId,
    record.patientId,
    record.testName,
    record.testDate,
    record.fileLink,
    record.uploadedBy,
    record.status,
    record.approvedBy,
    record.approvedDate,
    record.remarks,
  ]);

  return newRecordId;
}

// ───────────────────────── PENDING APPROVALS লিস্ট (Admin Dashboard-এ দেখানোর জন্য) ─────────────────────────
function getPendingApprovals(token) {
  requireDoctorOrReceptionist(token);

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("TestRecords");
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const statusCol = headers.indexOf("Status");

  const pending = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i][statusCol] === "Pending Approval") {
      const recordObj = {};
      headers.forEach(function (h, idx) {
        recordObj[h] = data[i][idx];
      });
      recordObj["_rowIndex"] = i + 1; // approve/reject করার সময় কাজে লাগবে
      pending.push(recordObj);
    }
  }

  return { success: true, pendingRecords: pending, count: pending.length };
}

// ───────────────────────── APPROVE / REJECT অ্যাকশন (Admin Dashboard থেকে) ─────────────────────────
function reviewTestUpload(token, recordId, decision, remarksIfRejected) {
  const session = requireDoctorOrReceptionist(token);

  if (decision !== "Approved" && decision !== "Rejected") {
    return { success: false, message: "Decision অবশ্যই 'Approved' বা 'Rejected' হতে হবে।" };
  }

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("TestRecords");
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idCol = headers.indexOf("RecordID");
  const patientIdCol = headers.indexOf("PatientID");
  const testNameCol = headers.indexOf("TestName");
  const testDateCol = headers.indexOf("TestDate");
  const fileLinkCol = headers.indexOf("FileLink");
  const statusCol = headers.indexOf("Status");
  const approvedByCol = headers.indexOf("ApprovedBy");
  const approvedDateCol = headers.indexOf("ApprovedDate");
  const remarksCol = headers.indexOf("Remarks");

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idCol]).trim() === String(recordId).trim()) {
      const patientId = data[i][patientIdCol];
      const testName  = data[i][testNameCol];
      const testDate  = data[i][testDateCol];
      const fileLink  = data[i][fileLinkCol];

      sheet.getRange(i + 1, statusCol + 1).setValue(decision);
      sheet.getRange(i + 1, approvedByCol + 1).setValue(session.identifier);
      sheet.getRange(i + 1, approvedDateCol + 1).setValue(new Date());
      if (decision === "Rejected" && remarksIfRejected) {
        sheet.getRange(i + 1, remarksCol + 1).setValue(remarksIfRejected);
      }

      // ── v2.1 (Phase 4): শুধু "Approved" হলেই patient-কে notify করা হবে ──
      let emailSent = false;
      let whatsappLink = "";
      if (decision === "Approved") {
        const patient = findPatientById_(patientId);
        if (patient) {
          if (patient.email) {
            try {
              sendTestResultEmail(patient.email, patient.fullName, patientId, testName, testDate, fileLink);
              emailSent = true;
            } catch (e) {
              Logger.log("Test result email error: " + e.message);
            }
          }
          if (patient.phone) {
            whatsappLink = buildTestResultWhatsAppLink_(patient.phone, patient.fullName, testName, fileLink);
          }
        }
      }

      return {
        success: true,
        message: "রেকর্ড " + decision + " করা হয়েছে।",
        emailSent: emailSent,
        whatsappLink: whatsappLink,
      };
    }
  }

  return { success: false, message: "Record ID পাওয়া যায়নি।" };
}

// ───────────────────────── PATIENT-এর নিজের ডেটা দেখা (My Records পোর্টাল) ─────────────────────────
/**
 * রিটার্ন করে: প্রোফাইল ইনফো + অ্যাপয়েন্টমেন্ট হিস্টোরি + অ্যাপ্রুভড টেস্ট রেজাল্ট।
 * Pending/Rejected টেস্ট রেজাল্ট patient-কে দেখানো হয় না (ইচ্ছাকৃতভাবে ফিল্টার করা)।
 */
function getMyRecords(token) {
  const session = requirePatient(token);
  const patientId = session.identifier;

  // প্রোফাইল
  const patientsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Patients");
  const pData = patientsSheet.getDataRange().getValues();
  const pHeaders = pData[0];
  let profile = null;
  for (let i = 1; i < pData.length; i++) {
    if (String(pData[i][0]).trim() === patientId) {
      profile = {};
      pHeaders.forEach(function (h, idx) { profile[h] = pData[i][idx]; });
      break;
    }
  }

  // অ্যাপয়েন্টমেন্ট হিস্টোরি
  const apptSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Appointments");
  const aData = apptSheet.getDataRange().getValues();
  const aHeaders = aData[0];
  const appointments = [];
  for (let i = 1; i < aData.length; i++) {
    if (String(aData[i][1]).trim() === patientId) { // কলাম 1 = PatientID
      const apptObj = {};
      aHeaders.forEach(function (h, idx) { apptObj[h] = aData[i][idx]; });
      appointments.push(apptObj);
    }
  }

  // অ্যাপ্রুভড টেস্ট রেজাল্ট (শুধু Approved দেখানো হচ্ছে)
  const testSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("TestRecords");
  const tData = testSheet.getDataRange().getValues();
  const tHeaders = tData[0];
  const statusCol = tHeaders.indexOf("Status");
  const testPatientCol = tHeaders.indexOf("PatientID");
  const testRecords = [];
  for (let i = 1; i < tData.length; i++) {
    if (String(tData[i][testPatientCol]).trim() === patientId && tData[i][statusCol] === "Approved") {
      const testObj = {};
      tHeaders.forEach(function (h, idx) { testObj[h] = tData[i][idx]; });
      testRecords.push(testObj);
    }
  }

  return {
    success: true,
    profile: profile,
    appointments: appointments,
    testRecords: testRecords,
  };
}
