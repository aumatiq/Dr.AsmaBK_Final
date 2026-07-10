/**
 * AUMATIQ — Doctor & Clinic Automation System
 * DashboardAdapter.gs — v3.0
 * ─────────────────────────────────────────────
 * কেন এই ফাইল লাগলো:
 * DoctorDashboard.html (সাইডবার + বেল আইকন ভার্সন) মূলত একটা ভিন্ন,
 * অস্তিত্বহীন backend API-এর নামে (getPatientsData, saveAppointmentData,
 * ইত্যাদি) call করছিল যেগুলো Code.gs / Auth.gs / PatientModule.gs /
 * AppointmentFinance.gs — কোথাও define ছিল না। এই ফাইলটা সেই ফাঁক পূরণ
 * করে: dashboard যেই নামে/যেই shape-এ ডেটা আশা করে, সেটাকে আসল
 * database function-এর সাথে সংযুক্ত (bridge) করে।
 */

// ───────────────────────── 1. PATIENTS ─────────────────────────
function getPatientsData(token) {
  requireDoctorOrReceptionist(token);

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Patients");
  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  const emailCol = headers.indexOf("Email"); // পুরনো sheet-এ নাও থাকতে পারে — গ্রেসফুলি হ্যান্ডেল করা হচ্ছে

  const prefCol = headers.indexOf("PreferredContact"); // Part 10 — পুরনো শীটে নাও থাকতে পারে

  const idx = {
    id: headers.indexOf("PatientID"),
    name: headers.indexOf("FullName"),
    phone: headers.indexOf("Phone"),
    age: headers.indexOf("Age"),
    gender: headers.indexOf("Gender"),
    address: headers.indexOf("Address"),
    registered: headers.indexOf("RegisteredDate"),
    lastVisit: headers.indexOf("LastVisit"),
    notes: headers.indexOf("Notes"),
  };

  const patients = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[idx.id]) continue;
    patients.push({
      patientId: row[idx.id],
      fullName: row[idx.name],
      phone: row[idx.phone],
      age: row[idx.age],
      gender: row[idx.gender],
      address: row[idx.address],
      email: emailCol > -1 ? row[emailCol] : "",
      preferredContact: prefCol > -1 ? (row[prefCol] || "Both") : "Both",
      registeredDate: row[idx.registered],
      lastVisit: row[idx.lastVisit],
      notes: row[idx.notes],
    });
  }

  return { success: true, patients: patients };
}

// ───────────────────────── 2. APPOINTMENTS ─────────────────────────
function getAppointmentsData(token) {
  requireDoctorOrReceptionist(token);

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const apptSheet = ss.getSheetByName("Appointments");
  const apptData = apptSheet.getDataRange().getValues();
  const apptHeaders = apptData[0];

  // Patient নাম দ্রুত lookup করার জন্য একটা ম্যাপ বানানো হচ্ছে
  const patientsSheet = ss.getSheetByName("Patients");
  const pData = patientsSheet.getDataRange().getValues();
  const nameByPid = {};
  const phoneByPid = {};
  for (let i = 1; i < pData.length; i++) {
    nameByPid[pData[i][0]] = pData[i][1];
    phoneByPid[pData[i][0]] = pData[i][2];
  }

  const idx = {
    id: apptHeaders.indexOf("AppointmentID"),
    pid: apptHeaders.indexOf("PatientID"),
    date: apptHeaders.indexOf("Date"),
    slot: apptHeaders.indexOf("TimeSlot"),
    reason: apptHeaders.indexOf("Reason"),
    status: apptHeaders.indexOf("Status"),
    created: apptHeaders.indexOf("CreatedAt"),
  };

  const appointments = [];
  for (let i = 1; i < apptData.length; i++) {
    const row = apptData[i];
    if (!row[idx.id]) continue;
    const pid = row[idx.pid];
    let dateStr = row[idx.date];
    try { dateStr = Utilities.formatDate(new Date(row[idx.date]), Session.getScriptTimeZone(), "yyyy-MM-dd"); } catch (e) {}

    appointments.push({
      appointmentId: row[idx.id],
      patientId: pid,
      patientName: nameByPid[pid] || "",
      phone: phoneByPid[pid] || "",
      date: dateStr,
      timeSlot: row[idx.slot],
      reason: row[idx.reason],
      status: row[idx.status],
      createdAt: row[idx.created],
    });
  }

  return { success: true, appointments: appointments };
}

/**
 * data = {patientId, patientName, phone, date, timeSlot, status, reason, editId}
 * editId খালি হলে → নতুন appointment (দরকার হলে নতুন Patient-ও তৈরি হবে)।
 * editId থাকলে → বিদ্যমান appointment-এর Date/TimeSlot/Reason/Status আপডেট হবে।
 */
function saveAppointmentData(token, data) {
  requireDoctorOrReceptionist(token);

  if (data.editId) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Appointments");
    const sData = sheet.getDataRange().getValues();
    const headers = sData[0];
    const idCol = headers.indexOf("AppointmentID");
    const dateCol = headers.indexOf("Date");
    const slotCol = headers.indexOf("TimeSlot");
    const reasonCol = headers.indexOf("Reason");
    const statusCol = headers.indexOf("Status");

    for (let i = 1; i < sData.length; i++) {
      if (String(sData[i][idCol]).trim() === String(data.editId).trim()) {
        sheet.getRange(i + 1, dateCol + 1).setValue(new Date(data.date));
        sheet.getRange(i + 1, slotCol + 1).setValue(data.timeSlot);
        sheet.getRange(i + 1, reasonCol + 1).setValue(data.reason || "");
        sheet.getRange(i + 1, statusCol + 1).setValue(data.status || "Pending");
        return { success: true, appointmentId: data.editId, message: "Appointment আপডেট হয়েছে।" };
      }
    }
    return { success: false, error: "Appointment ID পাওয়া যায়নি।" };
  }

  // নতুন appointment — bookAppointment() আগে থেকেই আছে (Patient match/create + slot check + row insert)
  const result = bookAppointment({
    fullName: data.patientName,
    phone: data.phone,
    date: data.date,
    timeSlot: data.timeSlot,
    reason: data.reason,
  });

  if (!result.success) return { success: false, error: result.message };
  return { success: true, appointmentId: result.appointmentId, patientId: result.patientId, message: result.message };
}

// ───────────────────────── 3. TEST RECORDS ─────────────────────────
function getTestRecordsData(token) {
  requireDoctorOrReceptionist(token);

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("TestRecords");
  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  const patientsSheet = ss.getSheetByName("Patients");
  const pData = patientsSheet.getDataRange().getValues();
  const nameByPid = {};
  for (let i = 1; i < pData.length; i++) nameByPid[pData[i][0]] = pData[i][1];

  const idx = {
    id: headers.indexOf("RecordID"),
    pid: headers.indexOf("PatientID"),
    testName: headers.indexOf("TestName"),
    testDate: headers.indexOf("TestDate"),
    fileLink: headers.indexOf("FileLink"),
    uploadedBy: headers.indexOf("UploadedBy"),
    status: headers.indexOf("Status"),
    approvedBy: headers.indexOf("ApprovedBy"),
    approvedDate: headers.indexOf("ApprovedDate"),
    remarks: headers.indexOf("Remarks"),
  };

  const records = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[idx.id]) continue;
    records.push({
      recordId: row[idx.id],
      patientId: row[idx.pid],
      patientName: nameByPid[row[idx.pid]] || "",
      testName: row[idx.testName],
      testDate: row[idx.testDate],
      fileLink: row[idx.fileLink],
      uploadedBy: row[idx.uploadedBy],
      status: row[idx.status],
      approvedBy: row[idx.approvedBy],
      approvedDate: row[idx.approvedDate],
      remarks: row[idx.remarks],
    });
  }
  records.reverse();

  return { success: true, records: records };
}

/**
 * ক্লিনিক স্টাফ/ডাক্তার সরাসরি টেস্ট রেজাল্ট আপলোড করলে — সবসময় সাথে সাথে Approved হয়ে যায়
 * (adminUploadTestResult()-এর বিদ্যমান আচরণ, নিরাপত্তার জন্য approvedBy সবসময় লগইন করা ইউজারের পরিচয় থেকে নেওয়া হয়)
 */
function clinicStaffUpload(token, patientId, base64, mimeType, fileName, testName, testDate, status, approvedBy, uploadedBy, remarks) {
  const fileData = {
    base64: base64,
    mimeType: mimeType,
    fileName: fileName,
    testName: testName,
    testDate: testDate,
    remarks: remarks || "",
  };
  const result = adminUploadTestResult(token, patientId, fileData, uploadedBy);
  if (!result.success) return { success: false, error: result.message };
  return { success: true, recordId: result.recordId, message: result.message };
}

function approveTestRecord(token, recordId, doctorName) {
  const result = reviewTestUpload(token, recordId, "Approved", "");
  if (!result.success) return { success: false, error: result.message };
  return {
    success: true,
    message: result.message,
    emailSent: result.emailSent,
    whatsappLink: result.whatsappLink,
  };
}

// ── v2.1 (Phase 4): নতুন — Reject Adapter (আগে এটাই ছিল না, Reject বাটন কাজই করত না) ──
function rejectTestRecord(token, recordId, reason) {
  const result = reviewTestUpload(token, recordId, "Rejected", reason || "");
  if (!result.success) return { success: false, error: result.message };
  return { success: true, message: result.message };
}

// ───────────────────────── 4. SETTINGS + CATEGORIES ─────────────────────────
function getSettingsData(token) {
  requireDoctor(token);

  const catResult = getAllCategories(token); // {success, categories: {groupName: {active:[], deleted:[]}}}
  const flatCategories = [];
  if (catResult.success) {
    Object.keys(catResult.categories).forEach(function (group) {
      catResult.categories[group].active.forEach(function (c) {
        flatCategories.push({ group: group, value: c.Value, active: true });
      });
      catResult.categories[group].deleted.forEach(function (c) {
        flatCategories.push({ group: group, value: c.Value, active: false });
      });
    });
  }

  return { success: true, settings: {}, categories: flatCategories };
}

function removeCategoryValue(token, categoryGroup, value) {
  return deleteCategoryValue(token, categoryGroup, value);
}

// ───────────────────────── 5. DOCTOR PROFILE (Settings ট্যাব সেভ) ─────────────────────────
/**
 * DoctorProfile সংক্রান্ত ফিল্ড → "DoctorProfile" শীটে (Field/Value ফরম্যাট)।
 * ক্লিনিক আওয়ার/স্লট সংক্রান্ত ফিল্ড → "Settings" শীটে (Public Booking সিস্টেমের সাথে sync থাকার জন্য)।
 */
function saveDoctorProfile(token, data) {
  requireDoctor(token);

  const profileFields = [
    "DoctorName", "ClinicName", "Specialty", "Degree", "ContactPhone",
    "ContactEmail", "ClinicAddress", "Bio", "WebsiteURL", "WhatsAppNumber",
    "YearsExperience", "PhotoURL"
  ];
  const settingsFields = ["WorkingDays", "SlotDuration", "OpeningTime", "ClosingTime"];

  const profileSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("DoctorProfile");
  const pData = profileSheet.getDataRange().getValues();

  profileFields.forEach(function (field) {
    if (data[field] === undefined) return;
    let found = false;
    for (let i = 0; i < pData.length; i++) {
      if (pData[i][0] === field) {
        profileSheet.getRange(i + 1, 2).setValue(data[field]);
        found = true;
        break;
      }
    }
    if (!found) profileSheet.appendRow([field, data[field]]);
  });

  settingsFields.forEach(function (field) {
    if (data[field] !== undefined) setSettingValue(field, data[field]);
  });

  return { success: true, message: "প্রোফাইল ও সেটিংস সেভ হয়েছে।" };
}

// ───────────────────────── 6. FOLLOW-UP ইমেইল/WhatsApp ─────────────────────────
/**
 * Part 10: এটা একটা single-patient real-time action (Dashboard-এ Follow-up
 * Queue-এর "Send" বাটনে ক্লিক করলে চলে — Doctor/Assistant তখনই সামনে থাকে)।
 * তাই patientId থেকে সরাসরি শীট লুকআপ করে PreferredContact অনুযায়ী
 * Email পাঠানো হয় এবং/অথবা WhatsApp লিংক ফেরত দেওয়া হয় (frontend auto-open করবে)।
 */
function sendFollowUpEmailFromDashboard(token, patientId, visitDate, diagnosis, nextVisit) {
  requireDoctorOrReceptionist(token);

  const patient = findPatientById_(patientId);
  if (!patient) return { success: false, message: "Patient খুঁজে পাওয়া যায়নি।" };

  const channels = resolveContactChannels_(patient.preferredContact);
  let emailSent = false;
  let whatsappLink = "";

  if (channels.sendEmail && patient.email) {
    try {
      sendFollowUpEmail(patient.email, patient.fullName, patientId, visitDate, diagnosis || "", nextVisit || "");
      emailSent = true;
    } catch (e) {
      Logger.log("Follow-up email error: " + e.message);
    }
  }

  if (channels.sendWhatsApp && patient.phone) {
    const msg =
      "প্রিয় " + patient.fullName + ",\n\n" +
      "আপনার শেষ ভিজিটের পর কেমন আছেন জানতে চাচ্ছি। কোনো সমস্যা হলে বা " +
      "পরবর্তী ভিজিট বুক করতে চাইলে যোগাযোগ করুন।\n\n" +
      "Patient ID: " + patientId + "\n\n" +
      "ধন্যবাদান্তে,\nClinic Team";
    whatsappLink = "https://wa.me/" + cleanPhoneForWhatsApp_(patient.phone) + "?text=" + encodeURIComponent(msg);
  }

  if (!emailSent && !whatsappLink) {
    return { success: false, message: "এই Patient-এর জন্য কোনো Email বা Phone পাওয়া যায়নি।" };
  }

  return { success: true, message: "Follow-up পাঠানো হয়েছে।", emailSent: emailSent, whatsappLink: whatsappLink };
}

/**
 * Part 10: যেসব patient-এর শেষ ভিজিট ২৫–৩৫ দিন আগে হয়েছে, তাদের সবাইকে
 * একসাথে follow-up পাঠানো হয় — PreferredContact অনুযায়ী:
 *  - Email/Both  → সরাসরি email পাঠানো হয় (Gmail নিজে থেকে পাঠাতে পারে)
 *  - WhatsApp/Both → wa.me লিংক একসাথে অনেকগুলো auto-open করা স্প্যামের মতো
 *    দেখাবে, তাই Dashboard-এর "Pending WhatsApp Sends" Queue-তে যোগ হয়,
 *    স্টাফ পরে এক-এক করে পাঠাবে (ফ্রি)।
 */
function runFollowUpEmailBatch(token) {
  requireDoctorOrReceptionist(token);

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Patients");
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const emailCol = headers.indexOf("Email");
  const phoneCol = headers.indexOf("Phone");
  const idCol = headers.indexOf("PatientID");
  const nameCol = headers.indexOf("FullName");
  const lastVisitCol = headers.indexOf("LastVisit");
  const prefCol = headers.indexOf("PreferredContact");

  const now = new Date();
  let emailCount = 0;
  let queuedCount = 0;

  for (let i = 1; i < data.length; i++) {
    const email = emailCol > -1 ? data[i][emailCol] : "";
    const phone = phoneCol > -1 ? data[i][phoneCol] : "";
    const lastVisit = data[i][lastVisitCol];
    if ((!email && !phone) || !lastVisit) continue;

    const visitDate = new Date(lastVisit);
    const daysSince = Math.floor((now - visitDate) / (1000 * 60 * 60 * 24));
    if (daysSince < 25 || daysSince > 35) continue;

    const patientId = data[i][idCol];
    const name = data[i][nameCol];
    const preferredContact = prefCol > -1 ? (data[i][prefCol] || "Both") : "Both";
    const channels = resolveContactChannels_(preferredContact);

    if (channels.sendEmail && email) {
      try {
        sendFollowUpEmail(email, name, patientId, lastVisit, "", "");
        emailCount++;
      } catch (e) {
        Logger.log("Follow-up batch email error for " + patientId + ": " + e.message);
      }
    }

    if (channels.sendWhatsApp && phone) {
      const msg =
        "প্রিয় " + name + ",\n\n" +
        "আপনার শেষ ভিজিটের পর কেমন আছেন জানতে চাচ্ছি। কোনো সমস্যা হলে বা " +
        "পরবর্তী ভিজিট বুক করতে চাইলে যোগাযোগ করুন।\n\n" +
        "Patient ID: " + patientId + "\n\n" +
        "ধন্যবাদান্তে,\nClinic Team";
      addToWhatsAppQueue_(patientId, name, phone, "FollowUp", msg, patientId);
      queuedCount++;
    }
  }

  return {
    success: true,
    message: emailCount + " জনকে ইমেইল পাঠানো হয়েছে, " + queuedCount + " জনকে WhatsApp Queue-তে যোগ করা হয়েছে।",
    emailCount: emailCount,
    queuedCount: queuedCount,
  };
}

// ───────────────────────── 7. PATIENT SAVE (Create/Edit) ─────────────────────────
/**
 * data.patientId থাকলে → editPatient(), না থাকলে → createPatient()
 */
function savePatientData(token, data) {
  requireDoctorOrReceptionist(token);

  if (data.patientId) {
    const editFields = {
      FullName: data.fullName,
      Phone: data.phone,
      Age: data.age,
      Gender: data.gender,
      Address: data.address,
      Notes: data.notes,
      Email: data.email,
    };
    // Part 10: শুধু তখনই পাঠানো হবে যদি ফ্রন্টএন্ড আসলেই কিছু পাঠায় — নাহলে
    // পুরনো ভ্যালু ভুলবশত খালি হয়ে যাবে না
    if (data.preferredContact) editFields.PreferredContact = data.preferredContact;
    const result = editPatient(token, data.patientId, editFields);
    if (!result.success) return { success: false, error: result.message };
    return { success: true, patientId: data.patientId, message: "Patient তথ্য আপডেট হয়েছে।" };
  }

  const result = createPatient({
    fullName: data.fullName,
    phone: data.phone,
    age: data.age,
    gender: data.gender,
    address: data.address,
    notes: data.notes,
    email: data.email,
    preferredContact: data.preferredContact, // Part 10
  });

  if (!result.success) return { success: false, error: result.message };
  return { success: true, patientId: result.patientId, message: result.message };
}