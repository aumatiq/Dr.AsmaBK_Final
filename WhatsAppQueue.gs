/**
 * AUMATIQ — Doctor & Clinic Automation System
 * Part 10: WhatsApp + Email Automation — WhatsApp Send Queue (WhatsAppQueue.gs) — v1.0
 * ─────────────────────────────────────────────────────────────────────────────
 * কেন এই ফাইলটা দরকার:
 * wa.me লিংক আসলে একটা "click-to-chat" লিংক — কেউ ক্লিক না করা পর্যন্ত এটা
 * নিজে থেকে কোনো মেসেজ পাঠায় না (এটা ফ্রি হওয়ার শর্তই এটা)। Prescription আর
 * Test Result approval real-time action (ডাক্তার/স্টাফ তখনই ড্যাশবোর্ডে থাকে),
 * তাই ওখানে wa.me লিংক ফেরত দিয়ে সাথে সাথে auto-open করানো সম্ভব।
 *
 * কিন্তু Daily Reminder (রাত ৯টায় সার্ভার নিজে থেকে ট্রিগার করে) আর Follow-up
 * Batch (একসাথে অনেক patient-কে পাঠানো হয়) — এই দুই ক্ষেত্রে কোনো একজন মানুষ
 * তখন ব্রাউজারে বসে নেই যে wa.me লিংকে ক্লিক করবে। তাই এই দুই ইভেন্টের
 * WhatsApp অংশ এখানে "Pending" হিসেবে জমা থাকে — Doctor/Assistant দিনে
 * একবার Dashboard-এর WhatsApp Queue ট্যাবে গিয়ে এক-এক করে ক্লিক করে পাঠাবে
 * (সম্পূর্ণ ফ্রি, কোনো Twilio/paid API লাগবে না)।
 *
 * পুরোপুরি silent auto-send চাইলে একমাত্র উপায় Twilio WhatsApp Business API
 * (paid, প্রতি মেসেজ আনুমানিক ৳2-5 খরচ, প্লাস মাসিক number rental) — এটা এই
 * Part-এ ডিফল্ট হিসেবে সাজেস্ট করা হচ্ছে না, ভবিষ্যতে দরকার হলে আলাদা Part
 * হিসেবে যোগ করা যাবে।
 */

const WA_QUEUE_SHEET_NAME = "WhatsAppQueue";

// ───────────────────────── শীট নিশ্চিত করা (না থাকলে তৈরি করবে) ─────────────────────────
function ensureWhatsAppQueueSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(WA_QUEUE_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(WA_QUEUE_SHEET_NAME);
    sheet.appendRow([
      "QueueID", "PatientID", "PatientName", "Phone", "EventType",
      "Message", "WhatsAppLink", "RelatedID", "Status",
      "CreatedAt", "SentAt", "SentBy"
    ]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// ───────────────────────── ফোন নম্বর পরিষ্কার করা (শেয়ার্ড হেল্পার) ─────────────────────────
/**
 * সব wa.me লিংক-তৈরির জায়গায় একই নিয়মে ফোন নম্বর ক্লিন হওয়া উচিত —
 * এই ফাংশনটা নতুন কোডে ব্যবহার হবে (পুরনো buildXWhatsAppLink_ ফাংশনগুলো
 * নিজেদের ভেতরেই আলাদাভাবে এটা করে, ওগুলো অপরিবর্তিত রাখা হয়েছে যাতে
 * বিদ্যমান কিছু ভেঙে না যায়)।
 */
function cleanPhoneForWhatsApp_(phone) {
  let cleanPhone = String(phone || "").replace(/[^0-9]/g, "");
  if (cleanPhone.length === 11 && cleanPhone.indexOf("0") === 0) {
    cleanPhone = "88" + cleanPhone; // বাংলাদেশি নম্বরে কান্ট্রি কোড যোগ
  }
  return cleanPhone;
}

// ───────────────────────── Queue-তে নতুন এন্ট্রি যোগ করা ─────────────────────────
/**
 * eventType: "BookingConfirm" | "Reminder" | "FollowUp"
 * ফেরত দেয়: { queueId, whatsappLink }
 * phone খালি থাকলে কিছুই যোগ হবে না (null রিটার্ন করবে)।
 */
function addToWhatsAppQueue_(patientId, patientName, phone, eventType, message, relatedId) {
  if (!phone) return null;

  const sheet = ensureWhatsAppQueueSheet_();
  const cleanPhone = cleanPhoneForWhatsApp_(phone);
  if (!cleanPhone) return null;

  const whatsappLink = "https://wa.me/" + cleanPhone + "?text=" + encodeURIComponent(message);
  const now = new Date();
  const queueId = "WAQ-" + Utilities.formatDate(now, Session.getScriptTimeZone(), "yyyyMMddHHmmss") + "-" + Math.floor(Math.random() * 900 + 100);

  sheet.appendRow([
    queueId,
    patientId || "",
    patientName || "",
    phone,
    eventType || "",
    message,
    whatsappLink,
    relatedId || "",
    "Pending",
    now,
    "",
    ""
  ]);

  return { queueId: queueId, whatsappLink: whatsappLink };
}

// ───────────────────────── Queue দেখা (Doctor/Assistant) ─────────────────────────
/**
 * সবচেয়ে নতুনটা আগে দেখাবে। শুধু "Pending" স্ট্যাটাসের আইটেম রিটার্ন করে —
 * ইতিমধ্যে "Sent" হয়ে যাওয়া পুরনো এন্ট্রিগুলো দিয়ে তালিকা ভারী করার দরকার নেই।
 */
function getWhatsAppQueue(token) {
  requireDoctorOrReceptionist(token);

  const sheet = ensureWhatsAppQueueSheet_();
  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  const idx = {
    queueId: headers.indexOf("QueueID"),
    patientId: headers.indexOf("PatientID"),
    patientName: headers.indexOf("PatientName"),
    phone: headers.indexOf("Phone"),
    eventType: headers.indexOf("EventType"),
    message: headers.indexOf("Message"),
    link: headers.indexOf("WhatsAppLink"),
    relatedId: headers.indexOf("RelatedID"),
    status: headers.indexOf("Status"),
    createdAt: headers.indexOf("CreatedAt"),
  };

  const items = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[idx.queueId]) continue;
    if (String(row[idx.status]) !== "Pending") continue;
    items.push({
      queueId: row[idx.queueId],
      patientId: row[idx.patientId],
      patientName: row[idx.patientName],
      phone: row[idx.phone],
      eventType: row[idx.eventType],
      message: row[idx.message],
      whatsappLink: row[idx.link],
      relatedId: row[idx.relatedId],
      createdAt: row[idx.createdAt],
    });
  }

  items.reverse(); // নতুনটা আগে
  return { success: true, items: items, pendingCount: items.length };
}

// ───────────────────────── Queue আইটেম "Sent" মার্ক করা ─────────────────────────
function markWhatsAppQueueSent(token, queueId) {
  const session = requireDoctorOrReceptionist(token);

  const sheet = ensureWhatsAppQueueSheet_();
  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  const idCol = headers.indexOf("QueueID");
  const statusCol = headers.indexOf("Status");
  const sentAtCol = headers.indexOf("SentAt");
  const sentByCol = headers.indexOf("SentBy");

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idCol]).trim() === String(queueId).trim()) {
      sheet.getRange(i + 1, statusCol + 1).setValue("Sent");
      sheet.getRange(i + 1, sentAtCol + 1).setValue(new Date());
      sheet.getRange(i + 1, sentByCol + 1).setValue(session.identifier);
      return { success: true, message: "WhatsApp পাঠানো হিসেবে মার্ক করা হয়েছে।" };
    }
  }
  return { success: false, message: "Queue আইটেম খুঁজে পাওয়া যায়নি।" };
}

// ───────────────────────── Patient-এর PreferredContact অনুযায়ী কী কী পাঠাতে হবে ─────────────────────────
/**
 * preferredContact: "Email" | "WhatsApp" | "Both" (default "Both")
 * রিটার্ন করে { sendEmail: bool, sendWhatsApp: bool }
 */
function resolveContactChannels_(preferredContact) {
  const pref = String(preferredContact || "Both").trim();
  if (pref === "Email") return { sendEmail: true, sendWhatsApp: false };
  if (pref === "WhatsApp") return { sendEmail: false, sendWhatsApp: true };
  return { sendEmail: true, sendWhatsApp: true }; // "Both" বা খালি/অজানা হলে ডিফল্ট দুটোই
}
