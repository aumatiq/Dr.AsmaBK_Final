# AUMATIQ — Dr. Asma Doctor Automation System
## Master Project Plan + Part-Prompts (v3.0 — English, condensed)

**Updated:** July 11, 2026 (v3.0 — rewritten in English for lower token cost;
synced with Part 13 delivery + cross-cutting rebrand/theme work)
**Client:** Dr. Asma Binte Khair (Gynaecologist & Obstetrician, Laparoscopic Surgeon)

**Repo:**
- Historical anchor: `https://github.com/aumatiq/DA-P3WD-Pink-SkyBlue`
- **Working repo used for Part 13 session (per user instruction, use this
  instead of the anchor unless told otherwise):**
  `https://github.com/aumatiq/Dr.AsmaBK_Final`
- ⚠️ Confirm with the client which repo is canonical going forward — the two
  may have diverged. Always `git clone` and read the actual file contents
  before trusting any status table (including this one).

---

## How to use this document
Upload only this file to a new chat, then say "Do Part 7" / "Start Part 12"
etc. Everything Claude needs (repo, stack, schema, roles, brand) is in this
one file — no other copy-paste needed.

---

## 🔒 Universal protocol — before starting ANY part (mandatory)

**Step 1 — Silent self-prep.** Clone/re-clone the repo and read current
state. If access fails, stop and say so before doing anything else. Silently
identify and read whichever Claude skill(s) fit the part (frontend-design for
UI, pdf for print assets, docx for handover docs, xlsx for spreadsheet
exports, etc.) — no need to announce this step.

**Step 2 — Clarifying questions (mandatory, before writing any code).**
Each Part below has an example "🔎 Clarifying questions" list. Ask the
relevant ones (plus new ones if needed), covering:
1. Anything still ambiguous in that Part's scope.
2. **Output format** — full downloadable file(s) vs. a diff/patch; deliver
   everything at once vs. section-by-section review.
3. Any role/permission decision not already settled in Part 0.

**When an interactive tool for tappable/clickable questions is available
(e.g. a button-based question tool), prefer it over a plain-text
A/B/C list** — it's faster for the client to answer on mobile. Fall back to
plain-text lettered options only when no such tool is available. Either way,
proceed only after getting answers; reasonable assumptions are fine for minor
details (state them in one line and continue), but never skip confirmation
on scope or output-format for anything non-trivial.

**Step 3 — Delivery.** Follow the Delivery Standard in Part 0: complete,
copy-paste-ready, placeholder-free, with exact file destinations stated.

---

## Repo status snapshot + gap list

| File | Contents |
|---|---|
| `Code.gs` | `doGet()` router, public booking, patient portal login (PatientID+Phone), all email templates, daily reminder trigger |
| `Auth.gs` | Role-based session (15-min sliding), guards |
| `PatientModule.gs` | Patient CRUD, name/phone search (no autocomplete UI yet) |
| `AppointmentFinance.gs` | Slot booking; Finance already Doctor-only |
| `Prescription.gs` | Prescription save + PDF + WhatsApp/Email delivery |
| `DashboardAdapter.gs` | Dashboard data adapter |
| `PWASetup.gs` + `manifest.json` | Two separate PWA manifests — **was referenced by `doGet()` but the file itself was missing (install was silently broken); fixed in the Part 13 session below** |
| `DoctorDashboard.html` | Live clock w/ seconds + Bangla/Hijri date already present; device-default dark/light auto-theme already present (no manual override before this session) |
| `PublicWebsite.html` | All core sections present; language toggle still missing; **had no dark/light theme at all before this session** |
| `CNAME` | `drasma.aumatiq.com` configured |

### Gap analysis (rolling list — ✅ = resolved)
1. Patient login flow needs name-autocomplete + mobile-number password. — open
2. **Permission bug:** `saveAppointmentData()`/`savePatientData()` allow
   Assistant in Edit mode too; no Delete function exists. — open (Part 7)
3. Language toggle (EN/BN) missing. — open
4. ~~Dark/Light auto theme missing.~~ ✅ Dashboard already had it (Part 6);
   **PublicWebsite now has it too (Part 13 session)**, plus both apps now
   also have a **manual Light/Dark/Auto override**, not just automatic.
5. ~~Visiting card missing.~~ ✅ v1 delivered (Part 12); **v2 regenerated in
   the Part 13 session** — see notes below.
6. Two-URL clean subdomain setup missing (query param only). — open (Part 11)
7. Future-app-tab scaffold missing. — open (Part 9)
8. **Time slot free-text entry bug** — causes format-mismatch sync bugs
   (booking + dashboard). — open (Part 16)
9. **Settings → Website auto-sync** not explicitly verified. — open (Part 8)
10. **Finance module has no future-export-ready structure** for the planned
    separate Personal Finance App. — open (Part 6)
11. **Broad security hardening** not yet audited (XSS, brute-force, sheet
    sharing, audit log). — open (Part 17)
12. **Doctor's Blog/Articles module** missing entirely. — open (Part 18)
13. **Recommended Doctors module** missing entirely. — open (Part 19)
14. **(new) `PWASetup.gs` was missing** — `?file=manifest` and
    `?file=manifest-dashboard` both 500-errored, so PWA install never
    actually worked despite the HTML `<link rel="manifest">` tags being in
    place. ✅ Fixed in the Part 13 session.
15. **(new) Brand mark was a 🌸 flower emoji** used as the clinic logo
    everywhere (public site nav/footer, all email headers) — inconsistent
    with a medical brand. ✅ Replaced with a custom stethoscope mark
    (Rose→Teal gradient) across PublicWebsite, email templates, PWA icons,
    and the visiting card, in the Part 13 session.

---

## ✅ Part 13 session — what was actually delivered (read this before Part 14/15)

Scope grew beyond the original Part 13 prompt below because the client asked
for a system-wide rebrand + theme pass alongside it. Delivered as
`*_Part-13` files:

1. **`PWASetup.gs`** (new file) — defines `getPublicManifestJson_()` and
   `getDashboardManifestJson_()`, fixing the broken install flow. Two
   visually distinct manifests: patient app (Rose→Teal) at
   `drasma.aumatiq.com`, staff app (Plum→Indigo) at
   `admin.drasma.aumatiq.com`.
2. **New icon set** (`/icons/*.png` + `/icons/staff/*.png`) — stethoscope
   glyph replacing the old generic cross/plus mark, in both color variants,
   at 512/192/apple-touch/favicon sizes.
3. **`manifest.json`** (static, GitHub Pages root) updated to match.
4. **Brand mark replaced everywhere** the 🌸 emoji was used: `PublicWebsite`
   nav logo + footer logo (inline SVG stethoscope), and both email-template
   logo spots in `Code.gs` (🩺 emoji, chosen for email-client safety over an
   embedded image).
5. **Dark/Light theme, both apps:**
   - `DoctorDashboard`: kept its existing device-default auto theme, added a
     manual Light/Dark/Auto toggle (topbar icon button + a proper
     "Appearance" section in Settings), backed by `body.theme-light-force` /
     `body.theme-dark-force` CSS classes that override the media query, and
     `sessionStorage` (not `localStorage` — unreliable in the Apps Script
     sandbox per Part 0 rules).
   - `PublicWebsite`: had **no** light mode before; added a full
     `@media (prefers-color-scheme: light)` block (mirroring the Dashboard's
     palette mapping) **plus** the same manual-override mechanism and a
     toggle button in the nav + mobile menu.
   - ⚠️ Not exhaustively audited component-by-component for light-mode
     contrast — spot-checked the obvious risk spots (hardcoded white text)
     and confirmed they all sit on fixed-dark decorative sections, not the
     page background. A full visual pass belongs in **Part 14 (QA)**.
6. **"Add to Home Screen" install card** — added to both apps (Dashboard:
   Settings page + modal; PublicWebsite: footer link + modal), Android +
   iPhone steps in Bangla.
7. **Visiting card v2** (`dr_asma_visiting_card_front_back_Part-13.pdf` +
   preview PNG) — same Rose Pink/Deep Plum/Teal palette and layout intent as
   v1, but: the decorative background flower/pinwheel graphic and the
   flower-shaped monogram are both replaced with a stethoscope motif; the
   doctor's name now uses Instrument Serif Italic (elegant, still highly
   legible) instead of the previous serif; QR code defaults to deep-linking
   to the booking section (`/#bk`) — **confirm this is the right target**,
   it wasn't explicitly re-confirmed this session.
8. **This master plan** — rewritten in English, synced with the above.

**Not done, still needs a decision:**
- Whether `admin.drasma.aumatiq.com` (used for staff manifest icon URLs) is
  actually the live staff subdomain — Part 11's guide names it that way, but
  confirm before relying on it.
- A full light-mode visual QA pass on both apps (recommend folding into
  Part 14).

---

# PART 0 — SHARED FOUNDATION (Claude re-reads this whole file every time)

```
You are working for AUMATIQ, building one part of a complete Doctor
Automation System for Dr. Asma Binte Khair — a Gynaecologist & Obstetrician
and Laparoscopic Surgeon, Assistant Professor (gazetted government officer)
at Khulna Medical College Hospital, who also sits at two private chambers.

REPO — treat as anchor/baseline: keep what's good, improve it, never
regress anything. See the repo-selection note at the top of this document
for which URL to actually clone this session.

Stack & architecture (do not change):
- Backend: Google Apps Script + Google Sheets (database) + Gmail
- Frontend: single-file HTML (inline CSS+JS) — PublicWebsite.html,
  DoctorDashboard.html
- Deployment: Apps Script Web App (/exec); GitHub = code backup + (future)
  clasp auto-deploy
- WhatsApp: free wa.me click-to-chat links (not the paid API unless
  explicitly requested)
- Hosting stays fully free — if a paid tool is ever the only option, state
  the cost clearly before suggesting it

Google Sheets tabs (schema — new columns/tabs OK, never delete old columns):
- Patients (PatientID: PT-YYYY-XXXX)
- Appointments (AppointmentID)
- TestRecords
- Finance (Doctor-only; future-export-ready toward a separate Personal
  Finance App — see Part 6)
- DoctorProfile
- Settings (Doctor-only)
- Categories (CategoryGroup, Value, IsSystemDefault, IsActive, AddedBy,
  DateAdded)
- (Future: Articles, RecommendedDoctors, AuditLog — detailed in their Parts)

Roles & permissions (final):
- DOCTOR: everything (Add/Edit/Delete, Finance, Settings, Blog publish,
  Recommended Doctors, all reports)
- RECEPTIONIST/ASSISTANT: can only ADD patients/appointments, never
  Edit/Delete. No access at all to Finance/Settings/Blog-publish/
  Recommended-Doctors.
- PATIENT: view/download/print own records only, can book, can view public
  blog/recommended-doctors (no login needed for those).

Session: 15-minute sliding expiration — do not change.

🔐 Security — non-negotiable core principle in every Part (full audit in
Part 17):
- Nobody but the Doctor can ever see Finance data — no API response should
  accidentally include a finance field.
- Session tokens must not be predictable/guessable.
- Public endpoints (autocomplete, booking) need rate-limiting and
  minimal-data-exposure.
- The Google Sheet must always stay Private (Apps Script server-side
  execution never needs the sheet to be public).

💰 Future Personal Finance App integration:
The doctor's full personal finance (not just clinic income) will eventually
live in a *separate* web app, pulling this system's clinic-income entries in.
No live integration/webhook needed yet — just keep Finance entries
future-export-ready: stable unique EntryID, ISO 8601 timestamp,
Source: "DrAsmaClinicSystem" tag (details in Part 6).

🔄 Settings → Public Website auto-sync:
Whatever the Doctor updates in Settings/Profile (chamber address/hours,
bio/photo/degrees, clinic hours) must auto-reflect on the public website —
nothing hardcoded in PublicWebsite.html; everything comes dynamically via
getDoctorProfile()/getSettingsData()-type functions (Parts 1 & 8).

Brand identity (client's own, not AUMATIQ's brand):
- Rose Pink #E8608A | Deep Plum/Indigo #7C3AED | Teal (supporting)
- Elegant/luxury medical direction; refine the palette but never drift from
  this core identity.
- Typography: a distinctive display font + a readable body font (Google
  Fonts, or bundled OFL fonts where Google Fonts isn't reachable).

Language rule:
- Explanations/instructions to the client: Bangla. Code/filenames/variables:
  English.
- Website UI: naturally English + a full human-quality Bangla toggle (not
  robotic machine translation).

Doctor reference info:
- Name: Dr. Asma Binte Khair
- Degrees: MBBS (DMC), MS (BMU), BCS (Health)
- Specialty: Gynaecologist & Obstetrician, Laparoscopic Surgeon
- Title: Assistant Professor (Obs & Gynae), Khulna Medical College Hospital
- Special interests: infertility treatment, IUI, high-risk pregnancy,
  gynae-oncology, painless normal delivery
- Chamber 1: Islami Bank Hospital Khulna, 42 Khan Jahan Ali Road.
  3–5 PM. Serial: 01712-068684
- Chamber 2: Doctors Point Specialized Hospital, 49 KDA Avenue.
  5–7 PM. Serial: 01795-383803
- Email: clinic.drasma@gmail.com
- Domain: drasma.aumatiq.com

Delivery standard: complete, copy-paste-ready, no placeholders. Always state
exactly which file each piece goes into.
```

---

# PART 1 — Public Website: Professional Redesign

```
Task: rebuild PublicWebsite.html as a full international-standard doctor
website, anchoring on existing sections (hero, about, svcs, stats, hrs,
testi, faq, bk, portal).

Requirements:
1. Hero, About/Credentials, Chambers/Locations (both chambers, address,
   hours, serial, Maps link), Services, Booking (backend unchanged).
2. Patient Portal entry shell (internal logic in Parts 2/3).
3. Doctor's Blog/Articles entry point (full module in Part 18 — nav link +
   section shell here only).
4. Recommended Doctors entry point (full module in Part 19 — nav link +
   section shell here only).
5. Language toggle (EN⇄BN) — sessionStorage/in-memory (localStorage
   unreliable in the Apps Script sandbox).
6. Dark/Light theme — prefers-color-scheme auto-detect + manual override.
   ✅ Delivered in the Part 13 session (see notes above) — re-verify it
   still matches whatever else changes here.
7. Fonts must never clip/overflow at any breakpoint (clamp(), 375px→desktop).
8. SEO — meta/OG tags.
9. 🔄 Settings→Website auto-sync (mandatory): no hardcoded chamber info /
   bio / photo / hours in the HTML — all via getDoctorProfile()/
   getSettingsData() at load time.
10. Design direction: elegant/luxury medical, refined Rose Pink + Deep
    Plum + Teal palette.

Output: complete new PublicWebsite.html (single file, GAS templating intact).
Dependencies: Parts 2/3 (portal internals), 18 (Blog), 19 (Recommended
Doctors), 8 (Settings backend).

🔎 Clarifying questions (example):
- Full design for Blog/Recommended-Doctors sections now, or placeholder
  cards only (filled in later)?
- Doctor photo in hero (needs upload) or initials/icon-based design for now?
- Output: whole file at once, or section-by-section review?
```

---

# PART 2 — Patient Portal Login (name-autocomplete + mobile-number password)

```
Task: patient portal login — username = name (live autocomplete),
password = registered mobile number.

Backend (new, don't remove old):
1. PatientModule.gs → searchPatientNamesForAutocomplete(query) — returns
   name+age+last-3-digits-of-phone (privacy-safe), nothing under 2
   characters, rate-limit aware (Part 17).
2. patientPortalLoginByName(patientId, mobileNumber) — keep the old
   patientPortalLogin(patientId, phone) as fallback.
3. Normalize mobile number (strip spaces/dashes/+88 prefix, compare last 11
   digits).
4. Security: temporary lockout after repeated wrong passwords (Part 17).

Frontend: live dropdown (300ms debounce), name+mobile fields, clear EN+BN
error messages, "New here? Book an appointment" link.

Dependencies: Part 1 (shell), Part 3 (uses this session), Part 17 (security).

🔎 Clarifying questions (example):
- If multiple patients share a name, what besides age+phone should the
  dropdown show (e.g. last visit date)?
- How many wrong attempts before lockout, and for how long?
- Output: new functions/diff only, or full file?
```

---

# PART 3 — Patient Portal Dashboard (view/download/print records)

```
Task: post-login Patient Portal Dashboard — profile summary,
upcoming/past appointments, prescriptions (preview+print), test records
(approved-only visible), self-upload, print-friendly @media print A4
layout. Patients must never see financial data.

Dependencies: Part 2 (session); reuse existing getMyRecords/
getMyPrescriptions/patientSelfUpload.

🔎 Clarifying questions (example):
- Show pending-review test reports as a status badge, or hide entirely?
- Can patients edit their own profile info (address/email), or must they
  call the clinic?
- Output format preference?
```

---

# PART 4 — Doctor Dashboard Core + Patient 360° Profile View

```
Task: improve DoctorDashboard.html, anchoring on the existing file.

Keep (may enhance): live clock with seconds + Bangla/Hijri date (colored,
each date-type with its own accent, without breaking fonts) — double-check
Gregorian date is present too.

New/improved:
1. Nav reorganization: Dashboard/Overview → Patients → Appointments →
   Follow-ups → Communications → Settings (doctor-only). New doctor-only
   items: Articles/Blog (Part 18), Recommended Doctors (Part 19) — visible
   to Doctor role only.
2. Patient Search → 360° Profile View (all visits/prescriptions/test
   history on one screen, entry point for a new prescription).
3. Role-based UI enforcement (Assistant: Edit/Delete/Finance/Settings/
   Blog/Recommended-Doctors hidden/disabled).
4. Appointment entry uses the click-to-select time slot UI (fixed in
   Part 16 — just hook the component in here).
5. Future App Tabs placeholder (MODULE_REGISTRY, detailed in Part 9).
6. Fonts/responsiveness 375px→desktop.

Dependencies: Parts 5, 6, 7, 9, 16, 17, 18, 19.

🔎 Clarifying questions (example):
- In the Overview summary, can Assistant see today's appointment count but
  not the income figure?
- Default sort for the Patients list — last visit / name / ID?
- Output: whole file at once, or tab-by-tab?
```

---

# PART 5 — Prescription Writing, Preview, Print

```
Task: reuse existing Prescription.gs functions to build write/edit/live
preview/review/print/WhatsApp-Email delivery flow (RX-XXXX ID).

Output: new support functions in Prescription.gs (if needed) + Dashboard
prescription writer UI.
Dependencies: Part 4 (entry point), Part 6 (handoff).

🔎 Clarifying questions (example):
- Autocomplete medicine names from the Categories sheet, or fully free-text?
- Need a "repeat prescription" (copy previous) option?
- Output format preference?
```

---

# PART 6 — Appointment Close + Financial Entry Flow (Doctor-only, future-app-ready)

```
Task: post-prescription appointment "Close" flow — Doctor sees a payment
modal (Amount, Method, Notes) → addFinanceEntry saves it + appointment
becomes "Completed". Assistant never sees the payment modal — status
becomes "Completed - Pending Payment Entry" and queues for the Doctor.

💰 Future Personal Finance App readiness:
The doctor's full personal finance will eventually live in a *separate* web
app, with this system's clinic income flowing in as entries. No live
integration/webhook yet — just:
1. Every Finance entry gets a stable unique EntryID, ISO 8601 timestamp,
   Source: "DrAsmaClinicSystem" tag, category, amount, payment method
   (migration-safe schema update to the Finance sheet).
2. New Doctor-only function exportFinanceEntriesForExternalApp(token,
   startDate, endDate) returning clean structured JSON (usable now as a
   manual export, and later as something the future app can pull via API).
3. Design it so it can later become a proper webhook/API endpoint with
   minimal rework — but a plain function is enough for now.

Output: AppointmentFinance.gs update + Close-Appointment/Payment modal +
Finance summary UI.
Dependencies: Part 5, Part 17 (Finance access security).

🔎 Clarifying questions (example):
- Show exportFinanceEntriesForExternalApp now as a "Download JSON" button,
  or keep it backend-only for future use?
- Payment method list (Cash/bKash/Nagad/Card...) comes from the Categories
  sheet — which methods should be pre-added now?
- Output format preference?
```

---

# PART 7 — Backend Permission Hardening (specific urgent bug fixes)

```
Task: independent, should be done first — specific bug fixes only (see
Part 17 for the broad security audit).

Gap 1 — saveAppointmentData(): when editId is present, add a separate
requireDoctor(token) check inside; new-record path keeps
requireDoctorOrReceptionist.

Gap 2 — savePatientData() and editPatient(): edit path always
requireDoctor (new-record path keeps requireDoctorOrReceptionist).

Gap 3 — no Delete function exists. Add (Doctor-only, soft-delete via an
IsDeleted column):
- PatientModule.gs → deletePatient(token, patientId)
- AppointmentFinance.gs → deleteAppointment(token, appointmentId)

Gap 4 — double-check every Finance/Settings function is guarded by
requireDoctor.

Output: updated PatientModule.gs, AppointmentFinance.gs,
DashboardAdapter.gs (highlight exactly what changed).
Dependencies: none — independent, do it early.

🔎 Clarifying questions (example):
- Should soft-deleted Patients/Appointments show in a "Recently Deleted"
  view with restore, or disappear from lists entirely?
- Output: diff/patch only, or full code for all three files?
```

---

# PART 8 — Settings Module improvements + Website Auto-Sync verification

```
Task: improve the existing Settings tab, anchored (never worse than before).

🔄 Mandatory — Settings→Website sync verification:
Confirm that anything the Doctor changes in Settings (chamber
address/hours/serial, bio/photo/degree list, clinic hours) — saved via
saveDoctorProfile/updateClinicHours — reflects on the next public-website
load automatically, with no caching layer holding stale data (Apps Script
rarely caches, but if PropertiesService/ScriptCache is used anywhere, keep
TTL short or invalidate on every save).

Other improvements: separate management UI for both chambers, password
change UI, cleaner Categories Add/Deactivate/Restore UI, WhatsApp/Email
template preview+edit UI.

Output: complete Settings section code + needed backend helpers.
Dependencies: Part 1 (consumes this data), Part 4 (shell).

🔎 Clarifying questions (example):
- Could a third chamber be added later? (affects whether the UI needs a
  dynamic "Add Chamber" button now)
- Use a Google Drive folder for the doctor's profile photo upload (a
  "ProfileAssets" folder, same pattern as PatientFiles)?
- Output format preference?
```

---

# PART 9 — Future App-Tabs Extensibility Scaffold

```
Task: MODULE_REGISTRY structure (id, label EN+BN, icon, enabled, renderFn,
roles) for adding future app modules — enabled:false hides it from nav.
Include a full dummy example in comments.

Output: diff + explanation for DoctorDashboard.html's nav-rendering section.
Dependencies: Part 4.

🔎 Clarifying questions (example):
- Fit Articles/Recommended-Doctors into this registry pattern too
  (enabled:true), or keep them as permanent/core nav items outside it?
- Output: code snippet/diff only, or full file?
```

---

# PART 10 — WhatsApp + Email Automation (free-first)

```
Task: review and complete existing email templates + wa.me click-to-chat
links — confirm every event (booking confirm, reminder, prescription, test
result) offers both Email+WhatsApp and respects the patient's
PreferredContact.

Cost note: clearly document wa.me's limitations (one click, not fully
automatic); mention the cheapest fully-automatic alternative (Twilio
WhatsApp) with its cost, but don't default to suggesting it.

Dependencies: Part 2, Parts 5/6.

🔎 Clarifying questions (example):
- Add a PreferredContact column to Patients now, or send both Email+
  WhatsApp always for now?
- Output: function code + a short markdown summary — is that enough?
```

---

# PART 11 — Domain, Hosting & Two-URL Architecture

```
Task: two clean subdomains (drasma.aumatiq.com for patients,
staff.drasma.aumatiq.com for staff) — free GitHub Pages branded redirect
pages forwarding to the ?page=dashboard query-param URL. Step-by-step
Bangla DNS guide for Hostinger hPanel CNAME setup.

Output: two redirect HTML files + updated DEPLOYMENT_GUIDE.md section + DNS
guide.
Dependencies: none — independent.

⚠️ Note from the Part 13 session: PWASetup.gs currently assumes the staff
subdomain is admin.drasma.aumatiq.com (matching DEPLOYMENT_GUIDE), not
staff.drasma.aumatiq.com as originally proposed here — confirm the actual
final subdomain name when this Part is (re)done, and update PWASetup.gs's
ICON_BASE_STAFF_ constant to match if it differs.

🔎 Clarifying questions (example):
- Is staff.drasma.aumatiq.com the right name, or something else
  (e.g. admin.drasma.aumatiq.com — which PWASetup.gs currently assumes)?
- Show a loading spinner only, or also the AUMATIQ/clinic logo on the
  redirect page?
```

---

# PART 12 — International-Standard Visiting Card

```
Task: front+back visiting card (3.5×2in + bleed), content pulled exactly
from Part 0's doctor info, Rose Pink+Deep Plum+Teal luxury palette, QR code
(to website/booking page), print-ready PDF + PNG preview.

Method: read the pdf skill, use Python (PIL/ReportLab) for exact
positioning.

Output: dr_asma_visiting_card_front_back.pdf + ..._preview.png.
Dependencies: Part 11 (final URL).

✅ v2 delivered in the Part 13 session — see notes above (stethoscope motif
replacing the flower graphic/monogram, Instrument Serif Italic name, QR
defaults to /#bk). Re-confirm QR destination and re-generate once Part 11's
final domain is locked in.

🔎 Clarifying questions (example):
- QR code should open the Booking section directly or the homepage?
  (defaulted to Booking this session — confirm)
- Monogram/icon: "AK" initials or an abstract medical icon? (used
  stethoscope motif this session — confirm this is the final direction)
```

---

# PART 13 — PWA Manifests, Icons & Install Experience

```
Original task: audit/finalize the two PWA manifests, icons, offline.html/
sw.js relevance, and an Add-to-Home-Screen instruction card (Android +
iPhone, Bangla).

✅ DONE — see the "Part 13 session" summary near the top of this document
for the full list of what was delivered (PWASetup.gs bug fix, dual
manifests, new stethoscope icon set, install cards in both apps) plus the
cross-cutting rebrand + dark/light work that rode along with it.

Follow-ups carried forward to later parts:
- Confirm staff subdomain name (see Part 11 note) and update
  ICON_BASE_STAFF_ in PWASetup.gs if needed.
- Fold a full light-mode visual QA pass into Part 14.
```

---

# PART 14 — QA: Fonts, Responsiveness, Dark/Light, Print

```
Task: paste the full file(s) and say "review" — check font rendering
(every breakpoint), dark/light contrast, language-toggle layout shift,
print CSS, role-based visibility, accessibility basics — deliver a
checklist-based bug+fix list (file+line references).

Should specifically include: a full light-mode visual pass on both
DoctorDashboard and PublicWebsite (the Part 13 session added the mechanism
but only spot-checked contrast, not a full audit).

Dependencies: after/alongside every other Part.

🔎 Clarifying questions (example):
- Review one specific file/section, or the whole repo at once?
```

---

# PART 15 — Client Handover Package

```
Task: update Client_Welcome_Packet.html, DEPLOYMENT_GUIDE.md,
WhatsApp_Templates..., Email_Template... — final URLs, step-by-step
non-technical guide (Doctor+Assistant workflows, Patient portal guide, card
printing instructions, Add-to-Home-Screen, troubleshooting).

Dependencies: after every other Part — do this last.

🔎 Clarifying questions (example):
- Handover package in both HTML+PDF, or is one format enough?
```

---

# PART 16 — Time Slot Selector Fix (Booking + Dashboard) 🆕

```
Task: fix the current bug — Appointment time slots can still be typed as
free-text/custom keyboard input (both the booking form and the Dashboard
Appointment Add/Edit form), causing format-mismatch sync bugs (e.g.
"6:00 PM" vs "06:00 PM" — zero-padding mismatch breaks string comparison,
causing double-booking/sync errors).

Fix (same component reused in both places):
1. No free-text time input anywhere. Replace with a clickable button-grid
   or dropdown, dynamically generated from the Doctor's configured clinic
   hours + slot duration (existing getClinicHours, getAvailableSlots,
   getPublicBookingSlots).
2. Already-booked slots show disabled/greyed-out.
3. Canonical format: store/compare time in one internal format everywhere
   (24-hour "HH:mm") — 12-hour AM/PM is a display-only conversion. Review/
   align existing timeStringToMinutes/minutesToDisplayTime with this rule.
4. Immediately mark a slot unavailable after a successful booking
   (optimistic client-side update + one refresh call — no websockets in
   Apps Script).
5. Same Time-Slot-Picker component powers both the Public Booking form
   (Part 1) and the Doctor Dashboard Appointment form (Part 4) — one shared
   JS function, not duplicated code.

Output: any slot-format fixes needed in AppointmentFinance.gs/Code.gs, plus
the complete shared Time-Slot-Picker HTML/CSS/JS (with instructions for
where it goes in both files).
Dependencies: Part 1, Part 4 (where it's used), Part 8 (clinic-hours config).

🔎 Clarifying questions (example):
- Can the Doctor change slot duration (15/20/30 min) from Settings, or is
  it fixed?
- How to handle two patients booking the same slot at once — "first come
  first served" error + refresh?
- Output format preference?
```

---

# PART 17 — Security & Data Protection Hardening (broad) 🆕

```
Task: Part 7 only fixes specific permission bugs — this Part is a full
security audit. Goal: "nobody but the Doctor can ever see the data or
compromise the system."

Checklist (verify each, fix any gaps found):
1. Data leak prevention: getPatientsData/getAppointmentsData/
   getTestRecordsData etc. — check no response accidentally includes a
   Finance-related field (use whitelist-based field selection, never send
   a raw row blindly).
2. Session security: tokens cryptographically random (Utilities.getUuid()
   or equivalent — not sequential/predictable), no readable PII embedded.
3. Brute-force protection: roleLogin (Doctor/Assistant) and the new Patient
   name+mobile login (Part 2) both need a simple attempt-counter
   (PropertiesService or a "LoginAttempts" sheet with
   identifier+timestamp+count) locking after 5 wrong attempts for ~15 min.
4. XSS prevention: any user input (patient name, notes, prescription
   free-text, Blog article body — Part 18) rendered back into HTML must be
   escaped/sanitized (avoid raw innerHTML; use textContent or an explicit
   escape helper). Blog bodies specifically need an allowlist (bold/
   italic/image/paragraph only, scripts stripped).
5. Autocomplete/public endpoint hardening: name-autocomplete (Part 2) is
   public/anonymous — confirm it never returns full phone/address/medical
   data, and cap results per request (e.g. max 10).
6. Sheet sharing: the backend Google Spreadsheet must stay Private
   (owner/editor = doctor's Google account only) — never "Anyone with the
   link" (Apps Script server-side execution doesn't need it public).
7. Audit log: propose a new AuditLog sheet tab (Timestamp, Role,
   ActionType, TargetID, Details) — Edit/Delete/Finance-entry actions get
   logged; only Doctor can view (getAuditLog(token), requireDoctor).
8. URL/SEO exposure: add <meta name="robots" content="noindex, nofollow">
   to the staff dashboard page; use rel="noreferrer" where relevant on the
   redirect page (Part 11).
9. HTTPS: confirm every link/redirect is HTTPS (Apps Script /exec and
   GitHub Pages both enforce this — double-check anyway).
10. Console/debug leak: grep the whole codebase for console.log(token),
    console.log(password) or similar sensitive-data logging and remove it.

Output: for each item — (a) what was found, (b) full updated code for any
file that needed a fix, (c) setup code for any new sheet/column needed.
Dependencies: Part 7 (basic fixes first), Part 2 (login flow), Part 18
(blog sanitization).

🔎 Clarifying questions (example):
- How long to retain Audit Log entries (unlimited, or auto-archive after
  e.g. 1 year)?
- Is 5 attempts/15 minutes the right brute-force threshold?
- Output: all 10 items at once, or reviewed in batches (e.g. 1–5, then
  6–10)?
```

---

# PART 18 — Doctor's Blog / Articles Module 🆕

```
Task: the doctor's personal blog/article system — write/upload/publish from
the Dashboard, nicely displayed on the Public Website.

New Sheet Tab: Articles (ArticleID, Title, BodyHtml/DriveDocLink,
CoverImageURL, Status [Draft/Published], AuthorName, PublishedDate,
LastEditedDate, Tags).

Dashboard — 3 ways to compose:
1. **Write directly** — rich text editor (bold/italic/heading/bullet/
   image-insert, no arbitrary script/HTML — follows Part 17's sanitization
   allowlist), inserted images get a clean inline+caption format.
2. **Upload** — an existing document (docx/pdf/text) gets its text
   extracted into the editor (still editable).
3. **Handwritten page photo → OCR:** uploading a photo of a handwritten
   page converts it to text. Free-stack approach: Google Drive's built-in
   OCR (upload to Drive, convert to Google Docs format via Drive Advanced
   Service / Drive.Files.copy with ocr:true, or the Docs API) — no extra
   cost within Google Workspace. Resulting text lands in the editor for
   mandatory doctor review/edit (Bangla handwriting OCR accuracy may be
   limited — say so clearly, and always require the review step).
4. Preview mode after writing, either method — edit or publish.
5. Published articles can be edited again anytime, images can be added.
6. Print: any article can be previewed, edited, then printed
   (window.print() + @media print A4 layout, images included).

Public Website:
- "Blog"/"Articles" section — card-grid (cover image, title, date,
  reading-time), click through to a full article page (clean typography,
  inline captioned images).
- Only Status:Published articles are public, never Drafts.
- Image storage: a new "ArticleAssets" Drive folder, same pattern as
  PatientFiles.

Output: new Articles.gs (or added to DashboardAdapter.gs) — createArticle,
editArticle, publishArticle, getPublishedArticles, ocrImageToText_ — plus
Dashboard Compose UI and Public Website Blog section, all complete code.
Dependencies: Part 1 (entry point), Part 4 (nav), Part 17 (sanitization
rules), Part 8 (Drive folder pattern reference).

🔎 Clarifying questions (example):
- Only Doctor writes/publishes, or can Assistant draft (Doctor publishes)?
- Bangla handwriting OCR accuracy may be limited — proceed anyway, or
  prioritize this feature for English handwriting only?
- Need Category/Tag support (e.g. "Pregnancy Tips", "PCOS")?
- Output format preference?
```

---

# PART 19 — Recommended Doctors Module 🆕

```
Task: the Doctor can add profiles of other doctors she recommends, from
Dashboard Settings, visible to patients on the Public Website.

New Sheet Tab: RecommendedDoctors (ID, Name, Specialty, PhotoURL/DriveLink,
Chamber/ContactInfo, Note/Reason, DisplayOrder, IsActive).

Dashboard (Doctor-only, inside Settings or its own small nav item):
- Add/Edit/Remove entries (name, specialty, photo, contact info, short
  reason/note, order).
- Photo storage: same Drive folder pattern as Parts 8/18.

Public Website:
- New "Recommended Doctors" section/page — cards (photo, name, specialty,
  short note, contact) — only IsActive:true entries, sorted by
  DisplayOrder.

Output: new backend functions (addRecommendedDoctor, editRecommendedDoctor,
removeRecommendedDoctor, getActiveRecommendedDoctors), Dashboard UI, Public
Website section — all complete code.
Dependencies: Part 1 (entry point), Part 4 (nav), Part 8 (Settings pattern).

🔎 Clarifying questions (example):
- Any cap on how many recommended doctors show at once?
- Make their phone/WhatsApp directly clickable, or display-only info?
- Output format preference?
```

---

## Suggested execution order (v3.0)

| # | Part | Why | Status |
|---|---|---|---|
| 1 | Part 7 (permission bug fix) | urgent, independent | open |
| 2 | Part 17 (security hardening) | right after Part 7, foundation for the rest | open |
| 3 | Part 11 (domain/URL) | everything else depends on this URL | open |
| 4 | Part 1 (public website shell) | | open |
| 5 | Part 2 (patient login) | | open |
| 6 | Part 3 (patient portal dashboard) | | open |
| 7 | Part 4 (doctor dashboard core) | | open |
| 8 | Part 16 (time slot fix) | ties into Part 1 & 4's booking forms | open |
| 9 | Part 5 (prescription) | | open |
| 10 | Part 6 (finance/close flow) | | open |
| 11 | Part 8 (settings + sync) | | open |
| 12 | Part 9 (future tabs scaffold) | | open |
| 13 | Part 18 (blog/articles) | | open |
| 14 | Part 19 (recommended doctors) | | open |
| 15 | Part 10 (WhatsApp/email) | | open |
| 16 | Part 12 (visiting card) | finalize once Part 11's URL is locked | v2 done, pending final QR/domain confirm |
| 17 | Part 13 (PWA/icons) | | **✅ done this session** |
| 18 | Part 14 (QA pass) | after everything else | open |
| 19 | Part 15 (handover package) | very last | open |
