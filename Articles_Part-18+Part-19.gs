/**
 * ══════════════════════════════════════════════════════════════
 *  Articles.gs — PART 18: Doctor's Blog / Articles Module
 *  AUMATIQ — Dr. Asma Doctor Automation System
 * ══════════════════════════════════════════════════════════════
 *  নতুন ফাইল — এটা রিপোর নতুন Google Apps Script ফাইল হিসেবে যোগ করো
 *  (Extensions → Apps Script → নতুন ফাইল → নাম দাও "Articles" → এই
 *  কনটেন্ট পেস্ট করো)।
 *
 *  Sheet Tab: "Articles"
 *  Columns:  ArticleID | Title | BodyHtml | CoverImageURL | Status |
 *            AuthorName | Tags | PublishedDate | LastEditedDate |
 *            CreatedDate
 *  (নোট: মূল প্ল্যানে ছিল ArticleID, Title, BodyHtml/DriveDocLink,
 *  CoverImageURL, Status, AuthorName, PublishedDate, LastEditedDate,
 *  Tags — আমরা এখানে ২টা reasonable সংযোজন করেছি: "CreatedDate"
 *  (audit/sort-এর জন্য দরকারি) এবং BodyHtml সবসময় ডাইরেক্ট sanitized
 *  HTML হিসেবেই সেভ হবে, DriveDocLink আলাদা রাখিনি — কারণ upload/OCR
 *  থেকে আসা টেক্সটও শেষমেশ editor-এ বসে HTML হিসেবেই সেভ হয়।)
 *
 *  Permission: শুধু DOCTOR write+publish করতে পারবে (ইউজার-কনফার্মড
 *  সিদ্ধান্ত)। getPublishedArticles() / getPublicArticleById() পাবলিক
 *  — কোনো token লাগে না।
 *
 *  Image Storage: "ArticleAssets" নামে Drive root folder (PatientFiles-
 *  এর প্যাটার্ন অনুসরণ করে — Code.gs / PatientModule.gs দ্রষ্টব্য)।
 *
 *  ⚠️ IMPORTANT — Advanced Drive Service লাগবে:
 *  Apps Script Editor → বামে "Services" (+) → "Drive API" → Add করো।
 *  (appsscript.json patch নিচের প্যাচ ডকুমেন্টে দেওয়া আছে — সেটাও
 *  আপডেট করে দিও, নাহলে OCR/Doc-upload কাজ করবে না।)
 *
 *  ⚠️ SANITIZATION NOTE: sanitizeArticleHtml_() একটা কাজ-চালানো
 *  allowlist sanitizer — Part 17 (Security Hardening) শেষ হলে এটা
 *  রিভিউ/হার্ডেন করা হবে (Part 17-এর ডিপেন্ডেন্সি নোট অনুযায়ী)।
 * ══════════════════════════════════════════════════════════════
 */

var ARTICLES_SHEET_NAME = 'Articles';
var ARTICLES_HEADERS = [
  'ArticleID', 'Title', 'BodyHtml', 'CoverImageURL', 'Status',
  'AuthorName', 'Tags', 'PublishedDate', 'LastEditedDate', 'CreatedDate'
];
var ARTICLE_ASSETS_FOLDER_NAME = 'ArticleAssets';

// ─────────────────────────────────────────────────────────────
// 0. SHEET SETUP (idempotent — বারবার চালালেও সমস্যা নেই)
// ─────────────────────────────────────────────────────────────
function getArticlesSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(ARTICLES_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(ARTICLES_SHEET_NAME);
    sheet.appendRow(ARTICLES_HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, ARTICLES_HEADERS.length).setFontWeight('bold');
  }
  return sheet;
}

/** ম্যানুয়ালি একবার রান করার জন্য (Apps Script Editor → Run) — শুধু
 *  Articles ট্যাব নিশ্চিত করে বানিয়ে রাখে, ডেটা কিছু বদলায় না। */
function setupArticlesSheet() {
  getArticlesSheet_();
  return { success: true, message: 'Articles sheet ready.' };
}

function getArticleAssetsFolder_() {
  var folders = DriveApp.getFoldersByName(ARTICLE_ASSETS_FOLDER_NAME);
  return folders.hasNext() ? folders.next() : DriveApp.createFolder(ARTICLE_ASSETS_FOLDER_NAME);
}

// ─────────────────────────────────────────────────────────────
// 1. HTML SANITIZATION (allowlist-based, server-side regex)
//    Allowed tags: p, br, b, strong, i, em, u, h2, h3, h4,
//                  ul, ol, li, blockquote, img, figure, figcaption
// ─────────────────────────────────────────────────────────────
function sanitizeArticleHtml_(rawHtml) {
  if (!rawHtml) return '';
  var html = String(rawHtml);

  // ১. <script>/<style> ব্লক পুরোপুরি বাদ (ট্যাগ+ভেতরের কনটেন্ট সহ)
  html = html.replace(/<script[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<style[\s\S]*?<\/style>/gi, '');

  // ২. javascript: / data:text/html জাতীয় dangerous URI স্কিম বাদ
  html = html.replace(/javascript\s*:/gi, '');
  html = html.replace(/data\s*:\s*text\/html/gi, '');

  // ৩. on* ইভেন্ট হ্যান্ডলার অ্যাট্রিবিউট বাদ (onclick, onerror, ইত্যাদি)
  html = html.replace(/\son\w+\s*=\s*"[^"]*"/gi, '');
  html = html.replace(/\son\w+\s*=\s*'[^']*'/gi, '');
  html = html.replace(/\son\w+\s*=\s*[^\s>]+/gi, '');

  var allowedTags = ['p', 'br', 'b', 'strong', 'i', 'em', 'u', 'h2', 'h3', 'h4',
                      'ul', 'ol', 'li', 'blockquote', 'img', 'figure', 'figcaption'];

  // ৪. প্রতিটা ট্যাগ পাস করে — allowlist-এ না থাকলে ট্যাগটা (কনটেন্ট
  //    রেখে) সরিয়ে দেয়; allowlist-এ থাকলে শুধু নির্দিষ্ট অ্যাট্রিবিউট
  //    (img-এর জন্য src/alt) ছাড়া বাকি সব অ্যাট্রিবিউট strip করে।
  html = html.replace(/<\/?([a-zA-Z0-9]+)([^>]*)>/g, function (match, tagName, attrs) {
    var tag = tagName.toLowerCase();
    var isClosing = match.charAt(1) === '/';

    if (allowedTags.indexOf(tag) === -1) return ''; // disallowed ট্যাগ বাদ

    if (isClosing) return '</' + tag + '>';

    if (tag === 'img') {
      var srcMatch = attrs.match(/src\s*=\s*["']([^"']*)["']/i);
      var altMatch = attrs.match(/alt\s*=\s*["']([^"']*)["']/i);
      var src = srcMatch ? srcMatch[1] : '';
      // শুধু https:// (বা Drive) সোর্স allow — javascript:/data: ইতিমধ্যে উপরে স্ট্রিপ হয়েছে
      if (!/^https?:\/\//i.test(src)) src = '';
      var alt = altMatch ? altMatch[1].replace(/[<>"]/g, '') : '';
      return '<img src="' + src + '" alt="' + alt + '" style="max-width:100%;border-radius:8px;">';
    }

    return '<' + tag + '>'; // অন্য সব allowed ট্যাগ — কোনো অ্যাট্রিবিউট ছাড়াই
  });

  return html.trim();
}

// ─────────────────────────────────────────────────────────────
// 2. FILE → TEXT CONVERSION (docx/pdf upload + handwritten OCR)
//    ⚠️ Advanced "Drive API" service enable থাকতে হবে (উপরে নোট দ্রষ্টব্য)
// ─────────────────────────────────────────────────────────────
function convertFileToText_(base64Data, mimeType, fileName, useOcr) {
  try {
    var cleanBase64 = base64Data.indexOf(',') > -1 ? base64Data.split(',')[1] : base64Data;
    var blob = Utilities.newBlob(Utilities.base64Decode(cleanBase64), mimeType, fileName || 'upload');

    var resource = { title: 'AUMATIQ_Convert_' + new Date().getTime() };
    var options = { convert: true };
    if (useOcr) {
      options.ocr = true;
      options.ocrLanguage = 'bn'; // বাংলা প্রাধান্য — ইংরেজি লেখাও মোটামুটি ধরবে
    }

    var converted = Drive.Files.insert(resource, blob, options);
    var doc = DocumentApp.openById(converted.id);
    var text = doc.getBody().getText();

    // টেম্প কনভার্টেড ফাইল Trash-এ পাঠিয়ে দাও (ক্লিনআপ)
    DriveApp.getFileById(converted.id).setTrashed(true);

    return { success: true, text: text };
  } catch (err) {
    return {
      success: false,
      error: 'Convert/OCR failed: ' + err.message +
        ' — নিশ্চিত করো Apps Script Editor-এ "Drive API" Advanced Service enable করা আছে।'
    };
  }
}

/** ডকুমেন্ট আপলোড (docx/pdf) → টেক্সট এক্সট্র্যাক্ট — Doctor-only, ড্যাশবোর্ড থেকে কল হবে */
function uploadArticleDocument(token, base64Data, mimeType, fileName) {
  var check = requireDoctor(token);
  if (!check.valid) return { success: false, error: check.error || 'Unauthorized.' };
  return convertFileToText_(base64Data, mimeType, fileName, false);
}

/** হাতে-লেখা পাতার ছবি → OCR টেক্সট — Doctor-only
 *  ⚠️ বাংলা হাতের লেখার OCR accuracy সীমিত হতে পারে — ফ্রন্টএন্ডে এই
 *  disclaimer দেখানো হয় এবং Preview/Review ধাপ বাধ্যতামূলক রাখা হয়েছে। */
function ocrHandwrittenImage(token, base64Data, mimeType, fileName) {
  var check = requireDoctor(token);
  if (!check.valid) return { success: false, error: check.error || 'Unauthorized.' };
  return convertFileToText_(base64Data, mimeType, fileName, true);
}

/** কভার/ইনলাইন ইমেজ আপলোড → ArticleAssets ফোল্ডারে সেভ, পাবলিক-ভিউ URL রিটার্ন */
function uploadArticleImage(token, base64Data, mimeType, fileName) {
  var check = requireDoctor(token);
  if (!check.valid) return { success: false, error: check.error || 'Unauthorized.' };
  try {
    var cleanBase64 = base64Data.indexOf(',') > -1 ? base64Data.split(',')[1] : base64Data;
    var blob = Utilities.newBlob(Utilities.base64Decode(cleanBase64), mimeType, fileName || ('article-image-' + new Date().getTime()));
    var folder = getArticleAssetsFolder_();
    var file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    var directUrl = 'https://drive.google.com/uc?export=view&id=' + file.getId();
    return { success: true, url: directUrl, fileId: file.getId() };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────
// 3. CRUD — Doctor-only
// ─────────────────────────────────────────────────────────────

/** নতুন আর্টিকেল তৈরি (Draft বা সরাসরি Publish) */
function createArticle(token, articleData) {
  var check = requireDoctor(token);
  if (!check.valid) return { success: false, error: check.error || 'Unauthorized.' };

  try {
    var sheet = getArticlesSheet_();
    var now = new Date();
    var articleId = 'ART-' + Utilities.getUuid().substring(0, 8).toUpperCase();
    var status = (articleData.status === 'Published') ? 'Published' : 'Draft';
    var cleanBody = sanitizeArticleHtml_(articleData.bodyHtml || '');

    sheet.appendRow([
      articleId,
      articleData.title || 'Untitled',
      cleanBody,
      articleData.coverImageURL || '',
      status,
      articleData.authorName || 'Dr. Asma',
      articleData.tags || '',
      status === 'Published' ? now : '',
      now,
      now
    ]);

    return { success: true, articleId: articleId };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/** বিদ্যমান আর্টিকেল এডিট (draft বা published — যেকোনো অবস্থায়) */
function editArticle(token, articleId, articleData) {
  var check = requireDoctor(token);
  if (!check.valid) return { success: false, error: check.error || 'Unauthorized.' };

  try {
    var sheet = getArticlesSheet_();
    var data = sheet.getDataRange().getValues();
    var idCol = ARTICLES_HEADERS.indexOf('ArticleID');

    for (var i = 1; i < data.length; i++) {
      if (data[i][idCol] === articleId) {
        var row = i + 1;
        var cleanBody = sanitizeArticleHtml_(articleData.bodyHtml || '');
        sheet.getRange(row, ARTICLES_HEADERS.indexOf('Title') + 1).setValue(articleData.title || 'Untitled');
        sheet.getRange(row, ARTICLES_HEADERS.indexOf('BodyHtml') + 1).setValue(cleanBody);
        sheet.getRange(row, ARTICLES_HEADERS.indexOf('CoverImageURL') + 1).setValue(articleData.coverImageURL || '');
        sheet.getRange(row, ARTICLES_HEADERS.indexOf('Tags') + 1).setValue(articleData.tags || '');
        sheet.getRange(row, ARTICLES_HEADERS.indexOf('LastEditedDate') + 1).setValue(new Date());
        return { success: true };
      }
    }
    return { success: false, error: 'Article not found.' };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/** Draft → Published (PublishedDate সেট হয়) */
function publishArticle(token, articleId) {
  var check = requireDoctor(token);
  if (!check.valid) return { success: false, error: check.error || 'Unauthorized.' };
  return setArticleStatus_(articleId, 'Published', true);
}

/** Published → Draft (আবার প্রাইভেট করে ফেলা — bonus, edit-এর সময় দরকার হতে পারে) */
function unpublishArticle(token, articleId) {
  var check = requireDoctor(token);
  if (!check.valid) return { success: false, error: check.error || 'Unauthorized.' };
  return setArticleStatus_(articleId, 'Draft', false);
}

function setArticleStatus_(articleId, status, setPublishedDate) {
  try {
    var sheet = getArticlesSheet_();
    var data = sheet.getDataRange().getValues();
    var idCol = ARTICLES_HEADERS.indexOf('ArticleID');
    var statusCol = ARTICLES_HEADERS.indexOf('Status') + 1;
    var pubCol = ARTICLES_HEADERS.indexOf('PublishedDate') + 1;
    var editCol = ARTICLES_HEADERS.indexOf('LastEditedDate') + 1;

    for (var i = 1; i < data.length; i++) {
      if (data[i][idCol] === articleId) {
        var row = i + 1;
        sheet.getRange(row, statusCol).setValue(status);
        if (setPublishedDate) sheet.getRange(row, pubCol).setValue(new Date());
        sheet.getRange(row, editCol).setValue(new Date());
        return { success: true };
      }
    }
    return { success: false, error: 'Article not found.' };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/** সম্পূর্ণ মুছে ফেলা (Doctor-only, permanent) */
function deleteArticle(token, articleId) {
  var check = requireDoctor(token);
  if (!check.valid) return { success: false, error: check.error || 'Unauthorized.' };
  try {
    var sheet = getArticlesSheet_();
    var data = sheet.getDataRange().getValues();
    var idCol = ARTICLES_HEADERS.indexOf('ArticleID');
    for (var i = 1; i < data.length; i++) {
      if (data[i][idCol] === articleId) {
        sheet.deleteRow(i + 1);
        return { success: true };
      }
    }
    return { success: false, error: 'Article not found.' };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────
// 4. READ — Dashboard (Doctor-only, সব দেখাবে) + Public (শুধু Published)
// ─────────────────────────────────────────────────────────────

function rowToArticleObj_(row) {
  return {
    articleId:      row[0],
    title:          row[1],
    bodyHtml:       row[2],
    coverImageURL:  row[3],
    status:         row[4],
    authorName:     row[5],
    tags:           row[6],
    publishedDate:  row[7] ? new Date(row[7]).toISOString() : '',
    lastEditedDate: row[8] ? new Date(row[8]).toISOString() : '',
    createdDate:    row[9] ? new Date(row[9]).toISOString() : ''
  };
}

/** Dashboard-এর জন্য সব আর্টিকেল (Draft + Published) — Doctor-only */
function getAllArticles(token) {
  var check = requireDoctor(token);
  if (!check.valid) return { success: false, error: check.error || 'Unauthorized.' };

  try {
    var sheet = getArticlesSheet_();
    var data = sheet.getDataRange().getValues();
    var list = [];
    for (var i = 1; i < data.length; i++) {
      if (!data[i][0]) continue;
      list.push(rowToArticleObj_(data[i]));
    }
    list.sort(function (a, b) {
      return new Date(b.lastEditedDate || b.createdDate) - new Date(a.lastEditedDate || a.createdDate);
    });
    return { success: true, articles: list };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/** নির্দিষ্ট একটা আর্টিকেল (এডিট ফর্মে লোড করার জন্য) — Doctor-only */
function getArticleById(token, articleId) {
  var check = requireDoctor(token);
  if (!check.valid) return { success: false, error: check.error || 'Unauthorized.' };
  try {
    var sheet = getArticlesSheet_();
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === articleId) return { success: true, article: rowToArticleObj_(data[i]) };
    }
    return { success: false, error: 'Article not found.' };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/** পাবলিক ওয়েবসাইট — শুধু Published আর্টিকেলের লিস্ট, কোনো token লাগে না */
function getPublishedArticles() {
  try {
    var sheet = getArticlesSheet_();
    var data = sheet.getDataRange().getValues();
    var list = [];
    for (var i = 1; i < data.length; i++) {
      if (data[i][4] === 'Published') {
        var obj = rowToArticleObj_(data[i]);
        delete obj.bodyHtml; // লিস্ট ভিউতে ফুল বডি দরকার নেই — payload হালকা রাখা
        list.push(obj);
      }
    }
    list.sort(function (a, b) { return new Date(b.publishedDate) - new Date(a.publishedDate); });
    return { success: true, articles: list };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/** পাবলিক ওয়েবসাইট — একটা নির্দিষ্ট Published আর্টিকেল (ফুল বডি সহ) */
function getPublicArticleById(articleId) {
  try {
    var sheet = getArticlesSheet_();
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === articleId && data[i][4] === 'Published') {
        return { success: true, article: rowToArticleObj_(data[i]) };
      }
    }
    return { success: false, error: 'Article not found or not published.' };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
