/**
 * AUMATIQ — Dr. Asma Doctor Automation System
 * Part 14: Soft Delete + Restore (Patients & Appointments)
 * ─────────────────────────────────────────────────────────
 * সিদ্ধান্ত (client confirmed, Part 14):
 *   • Delete = SOFT delete. Row কখনো Sheet থেকে মোছা হয় না —
 *     শুধু "Archived" কলাম TRUE করে দেওয়া হয়, তাই ভুলে Delete
 *     করলেও Restore করে ফেরত আনা যায়।
 *   • Permission: Doctor + Assistant দুজনেই delete/restore করতে
 *     পারবে (editPatient()-এর existing permission pattern অনুসরণ
 *     করা হয়েছে — requireDoctorOrReceptionist)।
 *   • এই ফাইলটা idempotent: প্রথমবার কোনো function চালানোর সময়
 *     "Archived" কলাম না থাকলে নিজে থেকেই যোগ করে নেয়, তাই আলাদা
 *     করে migration চালানোর দরকার নেই।
 */

// ═══════════════════════════════════════════════
// SECTION 1 — HELPER: Archived কলাম নিশ্চিত করা (self-healing)
// ═══════════════════════════════════════════════
function ensureArchivedColumn_(sheet) {
  const lastCol = sheet.getLastColumn();
  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  let archivedCol = headers.indexOf("Archived") + 1; // 1-indexed, 0 = not found

  if (archivedCol === 0) {
    archivedCol = lastCol + 1;
    sheet.getRange(1, archivedCol).setValue("Archived")
      .setFontWeight("bold").setBackground("#7C3AED").setFontColor("#FFFFFF");
  }
  return archivedCol; // 1-indexed column number
}

function findRowById_(sheet, idColHeader, idValue) {
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idCol = headers.indexOf(idColHeader);
  if (idCol === -1) return -1;
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idCol]).trim() === String(idValue).trim()) return i + 1; // 1-indexed row
  }
  return -1;
}

// ═══════════════════════════════════════════════
// SECTION 2 — PATIENTS: Archive / Restore / List
// ═══════════════════════════════════════════════
function archivePatient(token, patientId) {
  const session = requireDoctorOrReceptionist(token);
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Patients");
  if (!sheet) return { success: false, message: "Patients sheet পাওয়া যায়নি।" };

  const archivedCol = ensureArchivedColumn_(sheet);
  const row = findRowById_(sheet, "PatientID", patientId);
  if (row === -1) return { success: false, message: "Patient ID পাওয়া যায়নি।" };

  sheet.getRange(row, archivedCol).setValue(true);
  logAuditEvent_(session, "PATIENT_ARCHIVED", patientId, "Soft-deleted by " + session.role);
  return { success: true, message: "পেশেন্ট Archive করা হয়েছে। প্রয়োজনে Restore করা যাবে।" };
}

function restorePatient(token, patientId) {
  const session = requireDoctorOrReceptionist(token);
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Patients");
  if (!sheet) return { success: false, message: "Patients sheet পাওয়া যায়নি।" };

  const archivedCol = ensureArchivedColumn_(sheet);
  const row = findRowById_(sheet, "PatientID", patientId);
  if (row === -1) return { success: false, message: "Patient ID পাওয়া যায়নি।" };

  sheet.getRange(row, archivedCol).setValue(false);
  logAuditEvent_(session, "PATIENT_RESTORED", patientId, "Restored by " + session.role);
  return { success: true, message: "পেশেন্ট ফিরিয়ে আনা হয়েছে।" };
}

function listArchivedPatients(token) {
  const session = requireDoctorOrReceptionist(token);
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Patients");
  if (!sheet) return { success: false, message: "Patients sheet পাওয়া যায়নি।" };

  const archivedCol = ensureArchivedColumn_(sheet);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const out = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i][archivedCol - 1] === true) {
      const obj = {};
      headers.forEach(function (h, idx) { obj[h] = data[i][idx]; });
      out.push(obj);
    }
  }
  return { success: true, patients: out };
}

// ═══════════════════════════════════════════════
// SECTION 3 — APPOINTMENTS: Archive / Restore / List
// ═══════════════════════════════════════════════
function archiveAppointment(token, appointmentId) {
  const session = requireDoctorOrReceptionist(token);
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Appointments");
  if (!sheet) return { success: false, message: "Appointments sheet পাওয়া যায়নি।" };

  const archivedCol = ensureArchivedColumn_(sheet);
  const row = findRowById_(sheet, "AppointmentID", appointmentId);
  if (row === -1) return { success: false, message: "Appointment ID পাওয়া যায়নি।" };

  sheet.getRange(row, archivedCol).setValue(true);
  logAuditEvent_(session, "APPOINTMENT_ARCHIVED", appointmentId, "Soft-deleted by " + session.role);
  return { success: true, message: "অ্যাপয়েন্টমেন্ট Archive করা হয়েছে। প্রয়োজনে Restore করা যাবে।" };
}

function restoreAppointment(token, appointmentId) {
  const session = requireDoctorOrReceptionist(token);
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Appointments");
  if (!sheet) return { success: false, message: "Appointments sheet পাওয়া যায়নি।" };

  const archivedCol = ensureArchivedColumn_(sheet);
  const row = findRowById_(sheet, "AppointmentID", appointmentId);
  if (row === -1) return { success: false, message: "Appointment ID পাওয়া যায়নি।" };

  sheet.getRange(row, archivedCol).setValue(false);
  logAuditEvent_(session, "APPOINTMENT_RESTORED", appointmentId, "Restored by " + session.role);
  return { success: true, message: "অ্যাপয়েন্টমেন্ট ফিরিয়ে আনা হয়েছে।" };
}

function listArchivedAppointments(token) {
  const session = requireDoctorOrReceptionist(token);
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Appointments");
  if (!sheet) return { success: false, message: "Appointments sheet পাওয়া যায়নি।" };

  const archivedCol = ensureArchivedColumn_(sheet);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const out = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i][archivedCol - 1] === true) {
      const obj = {};
      headers.forEach(function (h, idx) { obj[h] = data[i][idx]; });
      out.push(obj);
    }
  }
  return { success: true, appointments: out };
}

/**
 * NOTE for anything that LISTS patients/appointments elsewhere in the
 * codebase (searchPatients, getMyRecords, dashboard listing calls, etc.):
 * those functions were written BEFORE the Archived column existed, so
 * they simply won't see it and will keep returning archived rows too.
 * DoctorDashboard.html Part 14 UI filters out Archived===true client-side
 * for the main list views (see "isArchived" checks in the Patients /
 * Appointments render functions), and offers a separate "Archived" tab
 * powered by listArchivedPatients()/listArchivedAppointments() above.
 */
