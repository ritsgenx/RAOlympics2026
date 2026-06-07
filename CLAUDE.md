# RA Olympics 2026 (Avriti) — Developer Context

## Project
Mobile-first web app for Rohan Avriti apartment residents (Whitefield, Bangalore) to register for RA Olympics 2026. 18 sports, no auth (phone = unique key), admin access via PIN. Auto-deployed to Vercel on push to `main`.

**Stack:** Vanilla HTML/CSS/JS (ES Modules) · Firebase Firestore v10.12.0 · Chart.js v4.4.3 CDN · html2canvas v1.4.1 CDN · Google Fonts (Outfit + Space Mono)

**Firebase project:** `raolympics2026` · Data stored in creator's private account, deleted after event.

## File Structure
```
files/
├── index.html            ← Single-page app — all screens as <div id="screen-*">
├── css/style.css         ← All styles; CSS variables in :root lines 4–26
├── js/main.js            ← All app logic + Firebase (ES Module, ~4500 lines)
├── images/               ← RA_image.png, carrom.png, rubiks.png, sudoku.png, rubik_poster.jpeg
└── upload_questions.html ← Admin utility: bulk-upload quiz questions to Firestore
```

## Firestore Collections
- **`users`** — profile; lookup key is `phone`. Flat stored as `"B-1104"` format.
- **`registrations`** — one doc per registration. Non-obvious fields: `isPartnerEntry` (bool), `partnerOf` (phone), `trackEvents[]`, `regtype` ("Self"/"Kid"/"Family"/"Partner").
- **`sportSettings`** — doc ID = sport name; overrides SPORTS array defaults (registrationOpen, datetime, venue, contact, ageGroup, rules[]).
- **`results`** — one doc per medal entry. Fields: sport, medalType (Gold/Silver/Bronze), category, subCategory, entryType ("single"/"multiple"), participants[] ({name, block, flatNumber, phone}), note, createdAt, updatedAt.
- **`quizQuestions`** — doc IDs are strings `"1"`–`"500"`. **Not numbers** — Firestore treats `1` and `"1"` differently.
- **`quizProgress`** / **`quizScores`** — doc ID = user's phone number.
- **`config/announcement`** — active: bool, message: string.
- **`config/adminPin`** — pin: number/string.
- **`config/registrationSummary`** — pre-aggregated: totalRegistrations, byBlock{A–E: n}, bySport{name: n}. Updated on every reg add/delete.
- **`config/resultsSummary`** — pre-aggregated: totalMedals, byBlock{A–E:{Gold,Silver,Bronze}}, bySport{name:{hasResults,count}}. Updated on every result save/edit/delete.
- **`config/dashboardSettings`** — showBlockGraph, showSportGraph, showQuizTab, showCarromTile (all boolean, default true).

---

## Architecture — Non-obvious Decisions

### Two-path dashboard (primary Firebase cost control)
- **Non-admin users:** read ONLY `config/registrationSummary` (1 doc). **Never** touch the `registrations` collection.
- **Admin:** reads all `registrations` docs once → 5-min client-side cache (`dashboardCache / dashboardCacheTime`).
- **Results screen** mirrors this: reads `config/resultsSummary` on screen open; individual `results` docs only fetched when a sport row is expanded (lazy) → cached 5 min per sport in `sportResultsCache[sportName]`.

### Summary docs must always stay in sync
| Action | Required call |
|---|---|
| Registration added | `updateRegistrationSummary()` |
| Registration deleted | `decrementRegistrationSummary()` + invalidate `dashboardCache` |
| Result saved | `updateResultsSummaryOnSave()` |
| Result edited or deleted | `rebuildResultsSummary()` — full rebuild, not decrement |

`rebuildResultsSummary()` is a full re-read of all `results` docs because per-participant medal counting makes safe decrements unreliable.

### Admin identity is two-factor
`isAdmin()` requires **both** conditions: `userProfile.phone === ADMIN_PHONE` **AND** `adminVerified === true`. Never check just one. PIN verification persists via `localStorage('adminVerified')`. `ADMIN_PHONE` is a constant in `main.js` — never commit its real value to a public repo.

### Flat number has two formats — never assume one
- Primary users: `"B-1104"` (block letter + hyphen + number)
- Partner auto-registrations: `"Block B, Flat 1104"` (verbose)
- Always extract block via regex: `flat.match(/^([A-Fa-f])-/) || flat.match(/Block\s*([A-Fa-f])/i)`
- **Never use `parseInt()`** on a flat string — it silently drops the block letter.

### ES Module scope — onclick functions need window export
All functions called from HTML `onclick=` attributes must be added to the `window.*` exports block at the bottom of `main.js`. ES Module scope is isolated — functions not on `window` are invisible to inline handlers.

### Tab bar visibility
`TAB_SCREENS` constant controls which screens render the tab bar. If you add a tab-visible screen, add its ID there. Current tab screens: screen-sports, screen-dashboard, screen-quiz, screen-results, screen-registrations, screen-admin.

---

## Critical Rules

1. **Never read `registrations` for non-admin users** — always use `config/registrationSummary`. This is the key Firebase cost control.
2. **Always invalidate caches after any mutation:** `dashboardCache = null`, `dashboardCacheTime = 0`, `resultsSummaryCache = null`, `resultsSummaryCacheTime = 0`, `sportResultsCache[sportName] = null`.
3. **Partner entries** (`isPartnerEntry: true`) are auto-created companion docs. Filter them out when counting unique participants or showing "registered by" info.
4. **Pre-school grades** `['Pre-Nursery','Nursery','KG-1','KG-2']` are blocked from Track Events in `updateTrackEventsList()`. Keep this list in sync with the `<select>` options in `index.html`.
5. **Carrom tile** hidden for participants when `graphVisibility.showCarromTile === false` (`buildSportsGrid()`). Admin always sees it.
6. **Results excluded sports:** Kids Event (Under 6 years) and Open Mic are excluded from the Results accordion. Defined as `RESULTS_EXCLUDED_SPORTS` inline in `renderResultsFromSummary()` — add new fun/non-competitive sports there.
7. **Trophy badge** on sport home tiles is a fire-and-forget background `getDoc` on home screen load — if it fails the badge simply won't appear. This is intentional to avoid blocking home screen render.
8. **Sports order** in the `SPORTS` array = home screen tile display order. Don't reorder casually.
9. **`entryType` on results** controls display only (`"multiple"` adds rank numbers to participant rows). It doesn't affect how data is stored or queried.
10. **Phone is optional** in result participant entries — only render the WhatsApp deep-link when `p.phone` is truthy.

---

## Deployment
No build step. Push to `main` → Vercel auto-deploys in ~30 seconds.
```
git push origin main
```
