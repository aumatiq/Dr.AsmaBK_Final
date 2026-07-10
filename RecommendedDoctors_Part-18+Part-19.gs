/**
 * ══════════════════════════════════════════════════════════════
 *  RecommendedDoctors.gs — PART 19: Recommended Doctors Module
 *  AUMATIQ — Dr. Asma Doctor Automation System
 * ══════════════════════════════════════════════════════════════
 *  নতুন ফাইল — এটাও রিপোর নতুন Google Apps Script ফাইল হিসেবে যোগ করো
 *  (Extensions → Apps Script → নতুন ফাইল → নাম দাও "RecommendedDoctors"
 *  → এই কনটেন্ট পেস্ট করো)।
 *
 *  Sheet Tab: "RecommendedDoctors"
 *  Columns: ID | Name | Specialty | PhotoURL | Chamber | ContactInfo |
 *           Note | DisplayOrder | IsActive | CreatedDate
 *
 *  নোট (assumption stated): মূল প্ল্যানে "Chamber/ContactInfo" একটাই
 *  ফিল্ড হিসেবে লেখা ছিল — আমরা সেটাকে স্পষ্টভাবে দুইটা কলামে ভাগ
 *  করেছি: "Chamber" (ঠিকানা/চেম্বার লোকেশন টেক্সট) আর "ContactInfo"
 *  (একটা ফোন নাম্বার — call এবং WhatsApp দুটো লিংকই এই একই নাম্বার
 *  থেকে জেনারেট হবে, যেহেতু ইউজার ক্লিকযোগ্য call/WhatsApp link চেয়েছে)।
 *
 *  Permission: Add/Edit/Remove/Toggle — Doctor-only।
 *  getActiveRecommendedDoctors() পাবলিক — কোনো token লাগে না।
 *
 *  Photo Storage: "RecommendedDoctorPhotos" নামে Drive root folder।
 * ══════════════════════════════════════════════════════════════
 */

var RECDOC_SHEET_NAME = 'RecommendedDoctors';
var RECDOC_HEADERS = [
  'ID', 'Name', 'Specialty', 'PhotoURL', 'Chamber', 'ContactInfo',
  'Note', 'DisplayOrder', 'IsActive', 'CreatedDate'
];
var RECDOC_PHOTO_FOLDER_NAME = 'RecommendedDoctorPhotos';

// ─────────────────────────────────────────────────────────────
// 0. SHEET SETUP (idempotent)
// ─────────────────────────────────────────────────────────────
function getRecommendedDoctorsSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(RECDOC_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(RECDOC_SHEET_NAME);
    sheet.appendRow(RECDOC_HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, RECDOC_HEADERS.length).setFontWeight('bold');
  }
  return sheet;
}

/** ম্যানুয়ালি একবার রান করার জন্য (Apps Script Editor → Run) */
function setupRecommendedDoctorsSheet() {
  getRecommendedDoctorsSheet_();
  return { success: true, message: 'RecommendedDoctors sheet ready.' };
}

function getRecDocPhotoFolder_() {
  var folders = DriveApp.getFoldersByName(RECDOC_PHOTO_FOLDER_NAME);
  return folders.hasNext() ? folders.next() : DriveApp.createFolder(RECDOC_PHOTO_FOLDER_NAME);
}

// ─────────────────────────────────────────────────────────────
// 1. PHOTO UPLOAD — Doctor-only
// ─────────────────────────────────────────────────────────────
function uploadRecommendedDoctorPhoto(token, base64Data, mimeType, fileName) {
  var check = requireDoctor(token);
  if (!check.valid) return { success: false, error: check.error || 'Unauthorized.' };
  try {
    var cleanBase64 = base64Data.indexOf(',') > -1 ? base64Data.split(',')[1] : base64Data;
    var blob = Utilities.newBlob(Utilities.base64Decode(cleanBase64), mimeType, fileName || ('doctor-photo-' + new Date().getTime()));
    var folder = getRecDocPhotoFolder_();
    var file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    var directUrl = 'https://drive.google.com/uc?export=view&id=' + file.getId();
    return { success: true, url: directUrl, fileId: file.getId() };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────
// 2. CRUD — Doctor-only
// ─────────────────────────────────────────────────────────────

function addRecommendedDoctor(token, data) {
  var check = requireDoctor(token);
  if (!check.valid) return { success: false, error: check.error || 'Unauthorized.' };

  try {
    var sheet = getRecommendedDoctorsSheet_();
    var id = 'RD-' + Utilities.getUuid().substring(0, 8).toUpperCase();
    var lastRow = sheet.getLastRow();
    var displayOrder = data.displayOrder || lastRow; // ডিফল্টে লিস্টের শেষে বসবে

    sheet.appendRow([
      id,
      data.name || '',
      data.specialty || '',
      data.photoURL || '',
      data.chamber || '',
      data.contactInfo || '',
      data.note || '',
      displayOrder,
      data.isActive === false ? false : true, // ডিফল্ট: active
      new Date()
    ]);

    return { success: true, id: id };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function editRecommendedDoctor(token, id, data) {
  var check = requireDoctor(token);
  if (!check.valid) return { success: false, error: check.error || 'Unauthorized.' };

  try {
    var sheet = getRecommendedDoctorsSheet_();
    var rows = sheet.getDataRange().getValues();
    var idCol = RECDOC_HEADERS.indexOf('ID');

    for (var i = 1; i < rows.length; i++) {
      if (rows[i][idCol] === id) {
        var row = i + 1;
        sheet.getRange(row, RECDOC_HEADERS.indexOf('Name') + 1).setValue(data.name || '');
        sheet.getRange(row, RECDOC_HEADERS.indexOf('Specialty') + 1).setValue(data.specialty || '');
        sheet.getRange(row, RECDOC_HEADERS.indexOf('PhotoURL') + 1).setValue(data.photoURL || '');
        sheet.getRange(row, RECDOC_HEADERS.indexOf('Chamber') + 1).setValue(data.chamber || '');
        sheet.getRange(row, RECDOC_HEADERS.indexOf('ContactInfo') + 1).setValue(data.contactInfo || '');
        sheet.getRange(row, RECDOC_HEADERS.indexOf('Note') + 1).setValue(data.note || '');
        if (data.displayOrder !== undefined && data.displayOrder !== null && data.displayOrder !== '') {
          sheet.getRange(row, RECDOC_HEADERS.indexOf('DisplayOrder') + 1).setValue(data.displayOrder);
        }
        return { success: true };
      }
    }
    return { success: false, error: 'Recommended doctor not found.' };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/** পুরোপুরি মুছে ফেলা (Doctor-only, permanent) */
function removeRecommendedDoctor(token, id) {
  var check = requireDoctor(token);
  if (!check.valid) return { success: false, error: check.error || 'Unauthorized.' };
  try {
    var sheet = getRecommendedDoctorsSheet_();
    var rows = sheet.getDataRange().getValues();
    var idCol = RECDOC_HEADERS.indexOf('ID');
    for (var i = 1; i < rows.length; i++) {
      if (rows[i][idCol] === id) {
        sheet.deleteRow(i + 1);
        return { success: true };
      }
    }
    return { success: false, error: 'Recommended doctor not found.' };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/** পাবলিক সাইটে দেখানো/লুকানো — দ্রুত টগল (delete না করেই সাময়িক হাইড) */
function toggleRecommendedDoctorActive(token, id, isActive) {
  var check = requireDoctor(token);
  if (!check.valid) return { success: false, error: check.error || 'Unauthorized.' };
  try {
    var sheet = getRecommendedDoctorsSheet_();
    var rows = sheet.getDataRange().getValues();
    var idCol = RECDOC_HEADERS.indexOf('ID');
    var activeCol = RECDOC_HEADERS.indexOf('IsActive') + 1;
    for (var i = 1; i < rows.length; i++) {
      if (rows[i][idCol] === id) {
        sheet.getRange(i + 1, activeCol).setValue(!!isActive);
        return { success: true };
      }
    }
    return { success: false, error: 'Recommended doctor not found.' };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────
// 3. READ — Dashboard (Doctor-only, সব) + Public (শুধু active)
// ─────────────────────────────────────────────────────────────

function rowToRecDocObj_(row) {
  return {
    id:            row[0],
    name:          row[1],
    specialty:     row[2],
    photoURL:      row[3],
    chamber:       row[4],
    contactInfo:   row[5],
    note:          row[6],
    displayOrder:  row[7],
    isActive:      row[8] === true || row[8] === 'TRUE' || row[8] === 'true',
    createdDate:   row[9] ? new Date(row[9]).toISOString() : ''
  };
}

/** Dashboard-এর জন্য সব (active + inactive) — Doctor-only */
function getAllRecommendedDoctors(token) {
  var check = requireDoctor(token);
  if (!check.valid) return { success: false, error: check.error || 'Unauthorized.' };
  try {
    var sheet = getRecommendedDoctorsSheet_();
    var rows = sheet.getDataRange().getValues();
    var list = [];
    for (var i = 1; i < rows.length; i++) {
      if (!rows[i][0]) continue;
      list.push(rowToRecDocObj_(rows[i]));
    }
    list.sort(function (a, b) { return (a.displayOrder || 0) - (b.displayOrder || 0); });
    return { success: true, doctors: list };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/** পাবলিক ওয়েবসাইট — শুধু active, DisplayOrder অনুযায়ী সাজানো, token লাগে না */
function getActiveRecommendedDoctors() {
  try {
    var sheet = getRecommendedDoctorsSheet_();
    var rows = sheet.getDataRange().getValues();
    var list = [];
    for (var i = 1; i < rows.length; i++) {
      var obj = rowToRecDocObj_(rows[i]);
      if (obj.id && obj.isActive) list.push(obj);
    }
    list.sort(function (a, b) { return (a.displayOrder || 0) - (b.displayOrder || 0); });
    return { success: true, doctors: list };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
