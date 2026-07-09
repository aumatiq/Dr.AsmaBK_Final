# PART 2 — Patient Portal Login System (নাম-অটোকমপ্লিট + মোবাইল পাসওয়ার্ড)
## Integration Guide

---

## 📋 কী কী যোগ হয়েছে

### ১. **PatientModule.gs** — নতুন functions
- `searchPatientNamesForAutocomplete(query)` — autocomplete সার্চ
- `patientPortalLoginByName(patientId, mobileNumber)` — নতুন login method
- `normalizePhoneNumber(phone)` — মোবাইল নম্বর normalize
- Brute-force protection functions (5 attempts → 5 minutes lockout)

### ২. **PublicWebsite.html** — UI আপডেট
- Name field with autocomplete dropdown (live সার্চ)
- Mobile "Password" field (existing phone field এর উন্নত সংস্করণ)
- Dropdown displays: নাম + বয়স + ফোনের শেষ ৩ ডিজিট + শেষ ভিজিটের তারিখ
- Keyboard navigation (Arrow Up/Down + Enter)
- Error messages (EN + BN dual language)

### ৩. **Code.gs** — কোনো পরিবর্তন নেই
পুরনো `patientPortalLogin(patientId, phone)` ফাংশন থাকবে (fallback হিসেবে)

---

## 🚀 Integration Steps

### **Step 1: PatientModule.gs আপডেট করো**

1. ডা. আসমার Google Apps Script project খুলো
2. **PatientModule.gs** ফাইল খুলো
3. **সম্পূর্ণ ফাইলটা নিচের কোড দিয়ে replace করো:**
   - ফাইল: `PatientModule_Part2.gs` (যা আমরা তৈরি করেছি)
   - এতে সব পুরনো functions + নতুন 3টি function থাকবে

**Verification:**
```
সব functions present আছে কিনা চেক করো:
✓ generatePatientId()
✓ createPatient()
✓ findPatientByPhone()
✓ findPatientById_()
✓ searchPatientNamesForAutocomplete() ← নতুন
✓ patientPortalLoginByName() ← নতুন
✓ normalizePhoneNumber() ← নতুন
✓ checkLoginLockout_() ← নতুন
✓ recordFailedLoginAttempt_() ← নতুন
✓ clearLoginAttempts_() ← নতুন
✓ searchPatients()
✓ editPatient()
... ইত্যাদি
```

---

### **Step 2: PublicWebsite.html আপডেট করো**

#### **Step 2A: Portal Section HTML Replace**

1. **PublicWebsite.html** খুলো
2. **Line 1436-1492** খুঁজে বের করো:
   ```html
   <!-- PATIENT PORTAL -->
   <section class="portal-sec sec" id="portal">
   ...
   </section>
   ```
3. **এই সম্পূর্ণ section** টা নিচের দিয়ে replace করো:
   - ফাইল: `PublicWebsite_Part2_LoginSection.html`
   - **HTML section শুধু শুরু থেকে `</section>` পর্যন্ত**

**তারপর:**

#### **Step 2B: JavaScript Login Functions Replace**

1. **PublicWebsite.html**-এ `function doLogin()` খুঁজো (line ~1778)
2. **এই function block:**
   ```javascript
   function doLogin() { ... }
   function doLogout() { ... }
   ```
   **টা নিচের দিয়ে replace করো:**
   - ফাইল: `PublicWebsite_Part2_LoginSection.html`-এর `<script>` section
   - **সব নতুন functions যোগ করো:**
     - `handleNameInput(element)`
     - `handleNameKeydown(event)`
     - `updateDropdownSelection(items)`
     - `selectDropdownItem(element)`
     - `doLoginPart2()`
     - `escapeHtml(text)`
     - `doLogout()` (updated)

#### **Step 2C: CSS যোগ করো**

1. **PublicWebsite.html** খুলো
2. **`<style>` section খুঁজো** (document-এর মাথার দিকে)
3. **এই CSS rules যোগ করো** (existing styles-এর সাথে):
   ```css
   /* Dropdown container */
   .name-dropdown {
     border: 1px solid var(--bd);
     border-top: none;
     border-radius: 0 0 8px 8px;
     max-height: 250px;
     overflow-y: auto;
     box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
     scrollbar-width: thin;
     scrollbar-color: var(--ind) var(--bg);
   }

   .name-dropdown::-webkit-scrollbar {
     width: 6px;
   }

   .name-dropdown::-webkit-scrollbar-track {
     background: transparent;
   }

   .name-dropdown::-webkit-scrollbar-thumb {
     background: var(--ind);
     border-radius: 3px;
   }

   .name-dropdown-item {
     padding: 10px 14px;
     border-bottom: 1px solid var(--bd);
     cursor: pointer;
     transition: background 0.2s;
     font-size: 13px;
     line-height: 1.5;
   }

   .name-dropdown-item:last-child {
     border-bottom: none;
   }

   .name-dropdown-item:hover {
     background-color: var(--ind);
   }
   ```

---

## 🧪 Testing Checklist

### **Manual Testing**

1. **নাম অটোকমপ্লিট:**
   - [ ] "আ" টাইপ করলে dropdown দেখা যায়
   - [ ] "আস" টাইপ করলে matching নাম দেখা যায়
   - [ ] Dropdown-এ Age, Phone (last 3), Last Visit দেখা যায়
   - [ ] Dropdown item click করলে name field fill হয়

2. **মোবাইল নম্বর normalization:**
   - [ ] "+88 01712 068684" → login হয়
   - [ ] "01712-068684" → login হয়
   - [ ] "017120 68684" → login হয়
   - [ ] "01712068684" → login হয়

3. **Keyboard navigation:**
   - [ ] Arrow Down দিয়ে dropdown items navigate হয়
   - [ ] Arrow Up দিয়ে পিছিয়ে যায়
   - [ ] Enter দিয়ে select হয়
   - [ ] Escape দিয়ে dropdown বন্ধ হয়

4. **Brute-force protection:**
   - [ ] ভুল নম্বর ৫ বার দিলে lockout হয়
   - [ ] Lockout message দেখা যায়: "অনেক চেষ্টা ব্যর্থ হয়েছে..."
   - [ ] ৫ মিনিট পরে আবার লগইন চেষ্টা করা যায়

5. **Error messages (EN + BN):**
   - [ ] নাম খালি থাকলে: "Please enter both fields."
   - [ ] মোবাইল খালি থাকলে: "Please enter both fields."
   - [ ] ভুল মোবাইল: "মোবাইল নম্বর মেলে না। অবশিষ্ট চেষ্টা: X"
   - [ ] Successful login → Records panel দেখা যায়

6. **Links:**
   - [ ] "নতুন? প্রথম অ্যাপয়েন্টমেন্ট বুক করুন" (#bk-তে যায়)
   - [ ] "New patient? Book your first appointment" (#bk-তে যায়)

---

## 🔐 Security Notes

### ✓ যা implement করেছি:
1. **Brute-force protection:** 5 attempts → 5 minutes lockout (cache-based)
2. **Phone normalization:** সব format handle করে (+88, spaces, dashes)
3. **XSS protection:** `escapeHtml()` দিয়ে dropdown text escape করা
4. **Rate-limiting:** Autocomplete minimum 2 characters (অপ্রয়োজনীয় requests কমায়)
5. **Dropdown limit:** Max 10 results return (performance)
6. **Data minimization:** Autocomplete শুধু নাম + age + phone (last 3) + date রিটার্ন করে (সম্পূর্ণ ডেটা না)

### ⚠️ Part 17 (Security Hardening)-এ আরও করা হবে:
- Complete audit log implementation
- XSS/CSRF mitigation on all endpoints
- Session token hardening
- ...

---

## 📝 File Locations

```
Google Apps Script Project:
├── PatientModule.gs (সম্পূর্ণ replace)
├── Code.gs (কোনো change নেই)
├── Auth.gs (কোনো change নেই)
└── PublicWebsite.html
    ├── <section class="portal-sec"> ... </section> (replace)
    ├── <script> ... doLogin/doLogout functions (replace + নতুন যোগ)
    └── <style> ... name-dropdown CSS (যোগ করো)
```

---

## 🔧 Troubleshooting

### **Autocomplete dropdown দেখা যাচ্ছে না**
- [ ] CSS `.name-dropdown` class আছে কিনা চেক করো
- [ ] `handleNameInput()` function-এ `google.script.run` call হচ্ছে কিনা
- [ ] Browser console-এ error আছে কিনা

### **Login fail হচ্ছে**
- [ ] PatientModule.gs-এ সব 3টি নতুন function আছে কিনা
- [ ] `patientPortalLoginByName()` function-এ `normalizePhoneNumber()` call হচ্ছে কিনা
- [ ] Patients sheet-এ LastVisit column আছে কিনা

### **Dropdown items ভুল দেখা যাচ্ছে**
- [ ] Patients sheet-এ ডেটা correct আছে কিনা
- [ ] Age, Phone, LastVisit columns names exact match করছে কিনা (case-sensitive)

---

## 📌 Next Steps (Part 2 পরে)

পরবর্তী Parts-এ যা যুক্ত হবে:
- **Part 3:** Patient Portal Dashboard (রেকর্ড view/download/print)
- **Part 4:** Doctor Dashboard core
- **Part 5:** Appointment booking
- ...

---

## ✅ Completion Checklist

- [ ] PatientModule.gs সম্পূর্ণভাবে replace করেছি
- [ ] PublicWebsite.html portal section replace করেছি
- [ ] PublicWebsite.html JavaScript functions update করেছি
- [ ] CSS styling যোগ করেছি
- [ ] সব testing items pass করেছি
- [ ] GitHub commit করেছি: `[feat]: Part 2 — Patient login autocomplete + brute-force protection`

---

**v2.0 — জুলাই ৯, ২০২৬**
