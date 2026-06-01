# PROJECT.md — RA Olympics 2026 (Avriti)

---

## 1. PROJECT OVERVIEW

### What the App Does
A mobile-first web app for **Rohan Avriti** apartment residents (Whitefield, Bangalore) to register for the internal sports festival **RA Olympics 2026**. Residents set up a one-time profile (name, phone, block, flat) and register themselves or family members for 18 sports. The admin can manage registrations, assign coordinators (PICs), post announcements, export data, and control feature visibility. A sports quiz with leaderboard is also included.

### Tech Stack
| Layer | Technology |
|---|---|
| Frontend | Vanilla HTML5, CSS3, JavaScript (ES Modules) |
| Database | Firebase Firestore (v10.12.0) |
| Hosting | Vercel (auto-deploy from GitHub) |
| Charts | Chart.js v4.4.3 (CDN) |
| Image capture | html2canvas v1.4.1 (CDN for share card download) |
| Fonts | Google Fonts — Outfit (UI) + Space Mono (numeric) |

### Firebase Project ID
`raolympics2026`

### Apartment Name & Context
**Rohan Avriti**, Whitefield, Bangalore — a gated community with blocks A through E. The app is shared via WhatsApp with residents. No authentication (no OTP/login) — users are identified by phone number. Data is stored in the creator's private Firebase account and will be deleted after the event.

---

## 2. FILE STRUCTURE

```
files/
├── index.html               ← Single-page app — all screens defined here
├── css/
│   └── style.css            ← All styles, CSS variables, animations
├── js/
│   └── main.js              ← All app logic + Firebase (ES Module, 3557 lines)
├── images/
│   ├── RA_image.png         ← Brand hero image (profile screen)
│   ├── carrom.png           ← Carrom sport tile image
│   ├── rubiks.png           ← Rubik's Cube sport tile image
│   ├── sudoku.png           ← Sudoku sport tile image
│   └── rubik_poster.jpeg    ← Rubik's Cube event poster (shown on details screen)
├── upload_questions.html    ← Admin utility to bulk-upload quiz questions to Firestore
└── README.md                ← Firebase + Vercel setup guide (generic template)
```

---

## 3. CSS VARIABLES

All defined in `:root` in `css/style.css` (lines 4–26):

| Variable | Value | Purpose |
|---|---|---|
| `--bg` | `#05101f` | Darkest background (screen base) |
| `--bg2` | `#081628` | Tab bar background |
| `--bg3` | `#0d1f38` | Input field backgrounds |
| `--surface` | `#112a4a` | Card / panel surfaces |
| `--border` | `rgba(0,140,255,0.14)` | Subtle card borders |
| `--border2` | `rgba(0,140,255,0.25)` | Focused / interactive borders |
| `--blue` | `#0080ff` | Primary blue accent |
| `--blue-light` | `#40aaff` | Lighter blue for back buttons / links |
| `--orange` | `#ff6a00` | Primary orange accent |
| `--orange-light` | `#ff9a3c` | Lighter orange |
| `--accent` | `#0080ff` | Alias for `--blue` (used for active states) |
| `--accent2` | `#ff6a00` | Alias for `--orange` |
| `--text` | `#e8f3ff` | Primary text colour |
| `--text2` | `#7aaac8` | Secondary/muted text |
| `--text3` | `#3d6482` | Tertiary/placeholder text |
| `--green` | `#00e5a0` | Success states (checkmark, tick) |
| `--radius` | `16px` | Standard card border radius |
| `--radius-sm` | `10px` | Smaller element border radius |
| `--font` | `'Outfit', sans-serif` | Primary UI font |
| `--font-mono` | `'Space Mono', monospace` | Numbers, phone, flat display |
| `--shadow` | `0 4px 32px rgba(0,60,160,0.35)` | Card drop shadow |

---

## 4. ALL SCREEN IDs

Every `<div id="screen-X">` in `index.html`:

| Screen ID | Description |
|---|---|
| `screen-admin-pin` | Admin PIN verification (shown before entering app for admin phone) |
| `screen-profile` | Profile setup — name, phone, block, flat (shown on first launch; `active` by default) |
| `screen-sports` | Home — sport tile grid + announcement banner |
| `screen-details` | Sport detail view — date/venue/age/rules/PIC/subcategory pills/register button |
| `screen-form` | Registration form — name, age, grade, gender, regtype, partner, Open Mic / Track fields |
| `screen-success` | Registration success confirmation |
| `screen-registrations` | My List — all registrations from this phone, grouped by registrant name |
| `screen-quiz` | Sports quiz — 500 questions, progress bar, leaderboard |
| `screen-graph` | Block-wise stacked bar chart (Chart.js) — separate graph screen (participant view) |
| `screen-dashboard` | Dashboard — block/sport charts, PIC sport buttons, admin full data |
| `screen-pic-sport` | PIC sport detail — participant cards with filter panel + PDF/CSV/TXT download |
| `screen-admin` | Admin Control Centre — 6-tile grid |
| `screen-admin-manage-sports` | Admin: toggle registration open/closed per sport + dashboard graph visibility |
| `screen-admin-sport-details` | Admin: edit datetime, venue, contact, age group, rules per sport |
| `screen-admin-announcements` | Admin: post / clear announcement banner on home screen |
| `screen-admin-export-data` | Admin: download all registrations or per-sport CSV |
| `screen-admin-all-registrations` | Admin: searchable list of all registrations, grouped by sport |
| `screen-admin-manage-users` | Admin: manage user roles (participant → PIC), assign sports |

**Tab-bar screens** (tab bar visible): `screen-sports`, `screen-dashboard`, `screen-registrations`, `screen-admin`, `screen-quiz`

---

## 5. FIREBASE COLLECTIONS

### `users`
Document ID: auto-generated by Firestore (`addDoc`)
Lookup key: `phone`

| Field | Type | Notes |
|---|---|---|
| `name` | string | Full name |
| `phone` | string | 10-digit, used as unique identifier |
| `flat` | string | Format: `"B-1104"` (block-flatNum) |
| `role` | string | `"participant"` \| `"pic"` \| `"admin"` |
| `picSports` | array | List of sport names this user coordinates |
| `createdAt` | timestamp | serverTimestamp() |

---

### `registrations`
Document ID: auto-generated (`addDoc`)

| Field | Type | Notes |
|---|---|---|
| `sport` | string | Sport name from SPORTS array |
| `sportEmoji` | string | Sport emoji |
| `subcategory` | string\|null | e.g. `"Singles"`, `"Doubles"`, `"Mixed Doubles"`, multi-select joined by `" | "` |
| `name` | string | Participant's full name |
| `ageCategory` | string\|null | `"18+"` \| `"Under 18"` \| `"Senior Citizen"` |
| `grade` | string\|null | School grade (Under 18 only) |
| `gender` | string | `"Male"` \| `"Female"` |
| `regtype` | string | `"Self"` \| `"Kid"` \| `"Family"` \| `"Partner"` (auto for partner entries) |
| `phone` | string | Registering user's phone |
| `flat` | string | Registering user's flat (`"B-1104"` or `"Block B, Flat 1104"` for partner entries) |
| `block` | string\|null | Single letter (partner auto-reg only) |
| `registeredBy` | string | Name of the user who submitted the form |
| `isPartnerEntry` | boolean | `true` for auto-created partner documents |
| `partnerOf` | string\|null | Partner's phone (partner entries only) |
| `partnerOfName` | string\|null | Partner's name (partner entries only) |
| `partnerName` | string\|null | Partner's name (primary registrant doc) |
| `partnerPhone` | string\|null | Partner's phone |
| `partnerGender` | string\|null | Partner's gender |
| `partnerBlock` | string\|null | Partner's block letter |
| `partnerFlatNum` | string\|null | Partner's flat number (digits only, e.g. `"1104"`) |
| `partnerFlat` | string\|null | Partner's full flat string `"Block B, Flat 1104"` |
| `actType` | string\|null | Open Mic only — type of act |
| `openMicCategory` | string\|null | Open Mic only — `"Solo"` \| `"Group"` |
| `withInstrument` | string\|null | Open Mic only — `"Yes"` \| `"No"` |
| `instrumentName` | string\|null | Open Mic only — instrument name |
| `trackEvents` | array\|null | Track Events only — selected sub-events |
| `registeredAt` | timestamp | serverTimestamp() |

---

### `sportSettings`
Document ID: **sport name** (e.g. `"Badminton"`, `"Box Cricket"`)

| Field | Type | Notes |
|---|---|---|
| `registrationOpen` | boolean | `false` = registration closed for this sport |
| `datetime` | string | Overrides SPORTS array value |
| `venue` | string | Overrides SPORTS array value |
| `contact` | string | Overrides SPORTS array value |
| `ageGroup` | string | Overrides SPORTS array value |
| `rules` | array | Overrides SPORTS array value |

---

### `config` (single-document sub-collection)

**`config/announcement`**
| Field | Type |
|---|---|
| `message` | string |
| `active` | boolean |
| `createdAt` | timestamp |

**`config/adminPin`**
| Field | Type |
|---|---|
| `pin` | number/string |

**`config/registrationSummary`** ← Summary doc (1 read for dashboard)
| Field | Type |
|---|---|
| `totalRegistrations` | number |
| `byBlock` | object `{ A: n, B: n, … }` |
| `bySport` | object `{ "Box Cricket": n, … }` |
| `lastUpdated` | timestamp |

**`config/dashboardSettings`**
| Field | Type | Default |
|---|---|---|
| `showBlockGraph` | boolean | true |
| `showSportGraph` | boolean | true |
| `showQuizTab` | boolean | true |
| `showCarromTile` | boolean | true |

---

### `quizQuestions`
Document ID: `"1"` through `"500"` (string)

| Field | Type |
|---|---|
| `q` | string — question text |
| `options` | array[4] — answer choices |
| `correct` | number — index of correct option (0–3) |
| `category` | string — topic category |
| `emoji` | string — category emoji |

---

### `quizProgress`
Document ID: **user's phone number**

| Field | Type |
|---|---|
| `phone` | string |
| `name` | string |
| `flat` | string |
| `currentIndex` | number |
| `totalScore` | number |
| `totalAnswered` | number |
| `answeredMap` | object `{ "0": true/false, "1": true/false, … }` |
| `lastUpdated` | timestamp |
| `completed` | boolean |

---

### `quizScores`
Document ID: **user's phone number**

| Field | Type |
|---|---|
| `phone` | string |
| `name` | string |
| `flat` | string |
| `totalPoints` | number |
| `totalAnswered` | number |
| `correctAnswers` | number |
| `updatedAt` | timestamp |

---

## 6. SPORTS LIST

All 18 sports in order as they appear in the `SPORTS` array in `js/main.js`:

| # | Name | Emoji | Image File | Subcategories | Multi-select |
|---|---|---|---|---|---|
| 1 | Box Cricket | 🏏 | — | (none) | — |
| 2 | Badminton | 🏸 | — | Singles, Doubles, Mixed Doubles | No |
| 3 | Basketball | 🏀 | — | (none) | — |
| 4 | Football | ⚽ | — | (none) | — |
| 5 | Water Sports | 🏊 | — | Kickboard — 10m × 2, Freestyle — 10m × 2, Backstroke — 10m × 2, Freestyle — 15m × 2, Backstroke — 15m × 2, Breaststroke — 15m × 2, Butterfly — 15m × 2, Medley Relay — 15m each (Team of 4) | **Yes** |
| 6 | Table Tennis | 🏓 | — | Singles, Doubles, Mixed Doubles | No |
| 7 | Chess | ♟️ | — | (none) | — |
| 8 | Pickleball | 🎾 | — | Singles, Doubles, Mixed Doubles | No |
| 9 | Track Events | 🏃 | — | (none — sub-events rendered dynamically by age/grade) | — |
| 10 | Kids Event (Under 6 years) | 🎈 | — | (none) | — |
| 11 | Open Mic | 🎤 | — | (none — special fields: Act Type, Solo/Group, Instrument) | — |
| 12 | Skating | ⛸️ | — | Individual | No |
| 13 | Squash | 🟡 | — | Singles | No |
| 14 | 8-Ball Pool | 🎱 | — | 8-Ball Pool | No |
| 15 | Mr/Ms/Mrs Avriti (Fitness) | 🏋️‍♀️ | — | (none) | — |
| 16 | Rubik's Cube | 🎲 | `images/rubiks.png` + poster `images/rubik_poster.jpeg` | (none) | — |
| 17 | Sudoku | 🔢 | `images/sudoku.png` | (none) | — |
| 18 | Carrom | 🟫 | `images/carrom.png` | Singles, Doubles | No |

### Track Events — Dynamic Sub-events

Sub-events shown in the form depend on `ageCategory` and `grade`:

| Group | Grades | Available Events |
|---|---|---|
| `18+` | — | 100m, 3KM Run, Fun Race, Relay Race, Couple Game(s) |
| `Senior Citizen` | — | Fast Walking / Slow Jogging, 1 Minute Games, 3KM Run |
| `Under 18` grades 1–3 | Pre-Nursery → 3rd Grade | 100m Race, 3KM Race, One Leg Hop Race, Fun Race |
| `Under 18` grades 4–6 | 4th → 6th Grade | 100m Race, 3KM Race, Book Balancing, Slow Cycling |
| `Under 18` grades 7–12 | 7th → 12th Grade | 100m Race, 3KM Race, Rope Skipping, Slow Cycling |

**Pre-school kids (Pre-Nursery, Nursery, KG-1, KG-2) are blocked from Track Events** — a toast error is shown and no events are listed.

### SPORT_MEDAL_CONFIG
Not present in this codebase.

---

## 7. USER ROLES

### Role Names and Permissions

| Role | How Assigned | Permissions |
|---|---|---|
| `participant` | Default on signup | Register for sports, view own registrations, view dashboard summary, take quiz |
| `pic` | Admin assigns via Manage Users | All participant permissions + view/filter/download full participant list for their assigned sports (on Dashboard) |
| `admin` | Auto-assigned on signup if phone matches `ADMIN_PHONE` | All permissions + Control Centre (manage sports, announcements, export, all registrations, manage users) + full dashboard with cached all-docs read |

### ADMIN_PHONE
```
const ADMIN_PHONE = "XXXXXXXXXX";   // actual: 994564XXXX
```
Value masked. Stored as a plain constant in `js/main.js:370`.

### How Admin PIN Works
1. Admin phone user opens app → app detects `userProfile.phone === ADMIN_PHONE` and `adminVerified === false`
2. Shows `screen-admin-pin` — user enters PIN (up to 6 digits)
3. `verifyAdminPin()` reads `config/adminPin` from Firestore and compares `entered === String(pinDoc.data().pin)`
4. On success: `adminVerified = true`, `localStorage.setItem('adminVerified', 'true')`, tab bar re-rendered with Admin tab
5. On next session, `localStorage.getItem('adminVerified') === 'true'` restores admin state without re-entering PIN
6. Admin can also tap "Continue as Participant" (`skipAdminVerification()`) to enter as a regular user from the same phone

---

## 8. ALL WINDOW FUNCTIONS

All exposed at the bottom of `js/main.js` (lines 3518–3556) to allow HTML `onclick` attributes to call ES Module functions:

| Function | Description |
|---|---|
| `window.saveProfile` | Validates and saves user profile to Firestore + localStorage; recovers existing profile by phone |
| `window.submitRegistration` | Validates form and writes registration doc(s) to Firestore; handles partner auto-registration |
| `window.selectAgeCategory` | Selects an age category pill (18+ / Under 18 / Senior Citizen) on the registration form |
| `window.showScreen` | Hides all screens, shows the given screen ID, manages tab bar visibility |
| `window.switchTab` | Switches tab bar active state and navigates to the corresponding screen |
| `window.openRegistrationForm` | Opens and resets the registration form screen for the selected sport/subcategory |
| `window.closeDeleteModal` | Closes the delete confirmation modal |
| `window.confirmDelete` | Reads registration doc, deletes it, decrements summary, invalidates dashboard cache |
| `window.resetProfile` | Double-tap confirmation: clears localStorage and reloads the app |
| `window.verifyAdminPin` | Fetches PIN from Firestore and compares to user input; grants admin access on match |
| `window.skipAdminVerification` | Enters the app as a participant, clearing any stored admin verification |
| `window.openPicSportDetail` | Fetches all registrations for a sport and opens the participant list screen |
| `window.filterAdminUsers` | Filters the admin user list by name or phone search input |
| `window.setAdminSort` | Sets sort mode for admin user list ('flat' or 'date') and re-renders |
| `window.showShareCard` | Generates and shows the participant share card modal |
| `window.closeShareCard` | Hides the share card modal |
| `window.downloadShareCard` | Uses html2canvas to download the share card as a PNG file |
| `window.toggleUserExpand` | Expands/collapses a user management card in the admin Manage Users screen |
| `window.toggleSportCheckbox` | Toggles a sport checkbox item's selected state in PIC assignment UI |
| `window.saveUserRole` | Updates a user's role and picSports array in Firestore; invalidates admin panel cache |
| `window.openAdminSection` | Navigates to an admin sub-screen and loads its data |
| `window.closeAdminSection` | Returns to the main Admin Control Centre screen |
| `window.toggleSportRegistration` | Optimistically updates UI then writes `registrationOpen` flag to `sportSettings` |
| `window.toggleDashboardGraph` | Writes a dashboard visibility flag to `config/dashboardSettings`; re-renders tab bar or grid if needed |
| `window.toggleSportEditCard` | Opens/closes the accordion for a sport's edit form in Admin > Sport Details |
| `window.saveSportDetails` | Writes edited sport details (date, venue, contact, age group, rules) to `sportSettings` |
| `window.postAnnouncement` | Writes announcement message to `config/announcement` with `active: true` |
| `window.clearAnnouncement` | Sets `active: false` on the announcement doc |
| `window.exportCSV` | Reads all or sport-filtered registrations and triggers a CSV file download |
| `window.filterAllRegs` | Filters the All Registrations search list by name, phone, or flat |
| `window.quizSelectOption` | Marks a quiz answer option as selected and enables the Submit button |
| `window.quizSubmitAnswer` | Scores the selected answer, updates state, saves progress to Firestore |
| `window.quizNextQuestion` | Advances quiz index and loads the next question |
| `window.quizPrevQuestion` | Goes back to the previous quiz question |
| `window.toggleFilterPanel` | Shows/hides the participant filter panel on the PIC sport screen |
| `window.toggleFilter` | Applies or removes a filter chip (gender/age/grade/subcategory) and re-renders participant list |
| `window.clearAllFilters` | Resets all active participant filters and re-renders the full list |
| `window.downloadParticipants` | Downloads the current participant list as PDF, CSV, or TXT |
| `window.rebuildSummaryFromScratch` | Admin maintenance: re-reads all registration docs and rebuilds `config/registrationSummary` |

---

## 9. BOTTOM TAB BAR

The tab bar is injected by `renderTabBar()` in `js/main.js:691` after the user's role is known. It is only visible when `TAB_SCREENS` screens are active.

### For Participants (non-admin)

| Tab | Icon | Label | Screen | Notes |
|---|---|---|---|---|
| 1 | 🏠 | Home | `screen-sports` | Sport tile grid |
| 2 | 📊 | Dashboard | `screen-dashboard` | Block/sport charts |
| 3 | 🧠 | Quiz | `screen-quiz` | Only if `showQuizTab` is `true` in Firestore |
| 4 | 📋 | My List | `screen-registrations` | Has orange badge with registration count |

### For Admin (PIN verified)

| Tab | Icon | Label | Screen | Notes |
|---|---|---|---|---|
| 1 | 🏠 | Home | `screen-sports` | |
| 2 | 📊 | Dashboard | `screen-dashboard` | Shows full data + sport detail buttons |
| 3 | 🧠 | Quiz | `screen-quiz` | Always shown for admin regardless of `showQuizTab` |
| 4 | 📋 | My List | `screen-registrations` | With badge count |
| 5 | 👑 | Admin | `screen-admin` | Gold accent; opens Control Centre |

---

## 10. KEY CONSTANTS AND VARIABLES

### Constants (`const`) — `js/main.js`

```js
ADMIN_PHONE              // "994564XXXX" — admin's phone number (masked here)
DASHBOARD_CACHE_DURATION // 5 * 60 * 1000 (5 minutes) — admin dashboard cache TTL
ADMIN_PANEL_CACHE_DURATION // 10 * 60 * 1000 (10 minutes) — manage-users cache TTL
TAB_SCREENS              // ['screen-sports','screen-dashboard','screen-registrations','screen-admin','screen-quiz']
SPORTS                   // Array of 18 sport config objects
BLOCKS                   // ['A','B','C','D','E']
BLOCK_COLORS             // 5 colors for the block-wise Chart.js graph
TRACK_EVENTS_MAP         // Maps age/grade group to available track sub-events
TRACK_GRADES_1_3         // Grades Pre-Nursery → 3rd Grade (first track group)
TRACK_GRADES_4_6         // Grades 4th → 6th Grade (second track group)
SUBCATEGORY_ICONS        // Map of subcategory name → { emoji, desc }
AVATAR_PALETTE           // 12 colors for deterministic name-hash avatar coloring
```

### State Variables (`let`) — cross-function state

```js
currentSport           // Currently viewed sport object from SPORTS array
currentSubcategory     // Selected subcategory string (null if none)
selectedSubcategories  // Array — for multi-select sports (Water Sports)
currentAgeCategory     // '18+' | 'Under 18' | 'Senior Citizen'
userProfile            // { name, phone, flat, role, picSports[], docId }
blockChart             // Chart.js instance (block-wise graph screen)
deleteTargetId         // Firestore doc ID of registration pending deletion
deleteTargetName       // Sport name of registration pending deletion
adminVerified          // Boolean — true once admin PIN confirmed this session
dashboardCache         // Cached array of all registration docs (admin only)
dashboardCacheTime     // Timestamp of last dashboard fetch (for cache TTL check)
graphVisibility        // { showBlockGraph, showSportGraph, showQuizTab, showCarromTile }
allParticipants        // All participants for current PIC sport screen
filteredParticipants   // Filtered subset after applying activeFilters
currentPICSport        // Sport name currently shown on screen-pic-sport
activeFilters          // { gender, ageCategory, grade, subcategory } — null = not active
quizCurrentIndex       // Current question index (0–499)
quizTotalScore         // Cumulative correct answers
quizTotalAnswered      // Total questions answered
quizAnsweredMap        // { "0": true/false, "1": true/false, … }
quizQuestionCache      // In-memory cache of fetched question docs
quizProgressDocExists  // Whether a progress doc exists in Firestore for this user
```

---

## 11. FIREBASE OPTIMISATIONS IN PLACE

### Summary Document (Primary Optimisation)
- **What:** `config/registrationSummary` stores pre-aggregated counts: `totalRegistrations`, `byBlock{}`, `bySport{}`
- **How it's used:** Participants and PICs read **only this one document** on dashboard load instead of fetching all registrations — 1 read vs. N reads
- **Maintenance:** Updated atomically on every registration (`updateRegistrationSummary`), decremented on deletion (`decrementRegistrationSummary`), and can be fully rebuilt by admin (`rebuildSummaryFromScratch`)

### Admin Dashboard Cache (5 Minutes)
- Admin dashboard fetches all registration docs once, stores in `dashboardCache`
- Subsequent loads within 5 minutes serve from cache; shows countdown timer in UI
- Cache is invalidated on registration delete or explicit refresh button click (`dashboardCacheTime = 0`)

### Admin Panel Cache (10 Minutes)
- Manage Users screen caches the full user list + registration count in `_adminPanelCache`
- Cache TTL: 10 minutes. Inline refresh button available. Invalidated on role save.

### Quiz Question Cache
- Individual quiz questions are cached in memory in `quizQuestionCache[index]`
- Prevents re-fetching the same question when navigating back and forth

### Two-path Dashboard
- **Admin path:** full `getDocs(registrations)` → cache → `renderDashboardFromData()`
- **Participant/PIC path:** single `getDoc(config/registrationSummary)` → `renderDashboardFromSummary()`

### Offline Persistence
- Not explicitly enabled — default Firebase SDK behaviour only (no `enableIndexedDbPersistence()` call)

---

## 12. CURRENT APP STATUS

### Features Completed
- Profile setup with `localStorage` persistence; phone-based profile recovery
- 18 sports with full detail pages (date, venue, age group, rules, PIC display)
- Sport registration with subcategory selection (single and multi-select)
- Age category pills (18+, Under 18, Senior Citizen) + grade dropdown for under-18
- Partner auto-registration (Doubles / Mixed Doubles)
- Track Events with dynamic sub-events per age group / grade
- Open Mic with Act Type, Solo/Group, Instrument fields
- Pre-school kids blocked from Track Events (toast warning shown)
- Delete registration with mandatory reason field
- Registration timestamp shown on each card
- Admin PIN verification with session persistence
- Admin Control Centre with 6 sub-sections
- Manage Sports: toggle registration open/closed per sport
- Dashboard graph visibility toggles (block graph, sport graph, quiz tab, carrom tile)
- Sport Details editor (date/venue/contact/age group/rules)
- Announcement banner system (post/clear, shown on home screen)
- CSV export (all registrations or per-sport)
- All Registrations admin view (searchable, grouped by sport, links to participant list)
- Manage Users: assign/remove PIC role, assign sports per user
- Dashboard (block chart + sport chart) with 5-minute cache and live-status indicator
- PIC participant list with filter panel (gender, age, grade, subcategory)
- Download buttons: PDF, CSV, TXT — filtered and complete sets
- Sports Quiz: 500 questions, progress saved per user, leaderboard (top 10)
- Share card generation with PNG download via html2canvas
- Collapsible My List grouped by registrant name with deterministic avatar colour
- Scroll nudge indicator (animated arrow) on sport detail and dashboard
- Admin maintenance: Rebuild Summary From Scratch button
- Sport poster image display on details screen (Rubik's Cube has a poster)
- Carrom tile can be hidden for participants by admin toggle

### Known Issues
None explicitly noted in the codebase.

---

## 13. DEVELOPER NOTES

### Rules to Follow When Making Changes

1. **Always add new functions to the `window` exports block** at the bottom of `main.js` (lines 3518+) if they are called from `onclick` attributes in `index.html`. ES Modules scope is isolated — functions not on `window` are invisible to inline event handlers.

2. **Flat number format has two variants** — always extract block using the regex helpers, never assume a format:
   - Primary users: `"B-1104"` (block letter + hyphen + number)
   - Partner auto-registrations: `"Block B, Flat 1104"` (verbose string)
   - Extraction pattern: `flat.match(/^([A-Fa-f])-/) || flat.match(/Block\s*([A-Fa-f])/i)`

3. **Keep `registrationSummary` in sync.** Any code that adds or removes registrations MUST call `updateRegistrationSummary()` on add and `decrementRegistrationSummary()` on delete. If you add bulk operations, call `rebuildSummaryFromScratch()` afterwards.

4. **TAB_SCREENS controls tab bar visibility.** If you add a new screen that should show the tab bar, add its ID to the `TAB_SCREENS` array at `js/main.js:2151`.

5. **Admin identity check requires BOTH conditions:** `userProfile.phone === ADMIN_PHONE && adminVerified === true`. Never check just the phone or just the flag — use the `isAdmin()` helper function.

6. **Pre-school grades are blocked from Track Events.** The list is `['Pre-Nursery', 'Nursery', 'KG-1', 'KG-2']` inside `updateTrackEventsList()`. Keep this list in sync with the `<select>` options in `index.html`.

7. **Sports order in `SPORTS` array = display order on home screen.** Do not reorder unless you intend to change tile layout.

8. **Carrom tile is conditionally hidden.** Controlled by `graphVisibility.showCarromTile`. The `buildSportsGrid()` function skips Carrom for participants if this flag is false. Admin always sees it.

9. **Quiz questions are stored as document IDs `"1"` through `"500"` (strings) in `quizQuestions`.** Do not use numeric IDs — Firestore treats `1` and `"1"` differently.

10. **Dashboard cache is invalidated on delete** (`dashboardCache = null; dashboardCacheTime = 0`). Always do this in any code path that modifies registration data.

### Common Mistakes to Avoid

- **Do not use `parseInt()` to parse flat numbers** — the format is `"B-1104"`, not a plain integer. The block letter is part of the string.
- **Do not read `registrations` collection on dashboard for non-admin users** — always use the summary doc. This is the key Firebase cost-saving measure.
- **Do not add new Firestore collections without updating this document.**
- **Do not commit the actual `ADMIN_PHONE` value to a public repo.**
- **Do not add `offline persistence` without testing** — `enableIndexedDbPersistence()` can conflict with multiple tabs.
- **Partner auto-registration entries have `isPartnerEntry: true`** — always filter these out when counting unique participants or showing "registered by" info.

### Deployment Command
No build step. Deployment is automatic via Vercel on every push to the `main` branch on GitHub. To deploy manually:
```
git add .
git commit -m "your message"
git push origin main
```
Vercel picks up the push and deploys within ~30 seconds. The live URL is the Vercel project URL shared with residents.
