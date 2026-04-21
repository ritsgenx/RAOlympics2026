// ============================================================
//  main.js — Entry point (ES Module)
//  This file imports Firebase and wires everything together.
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ============================================================
//  STEP 1: REPLACE THESE WITH YOUR FIREBASE CONFIG VALUES
//  How to get them:
//  1. Go to https://console.firebase.google.com
//  2. Create a project (or open existing one)
//  3. Click gear icon → Project Settings
//  4. Scroll to "Your apps" → click </> (Web app)
//  5. Register app → copy the config object below
// ============================================================
const firebaseConfig = {
  apiKey:            "AIzaSyAo6lHM4Vy3MF9EN9d6128zEh1XM617hMs",
  authDomain:        "raolympics2026.firebaseapp.com",
  projectId:         "raolympics2026",
  storageBucket:     "raolympics2026.firebasestorage.app",
  messagingSenderId: "676796656550",
  appId:             "1:676796656550:web:daf55b99ab9cc34c92fd67"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

// ============================================================
//  SPORTS DATA — Edit this section to update sport details
//  Fields: name, emoji, datetime, venue, maxParticipants,
//          ageGroup, contact, rules (array of strings)
// ============================================================
const SPORTS = [
  {
    name: "Box Cricket", emoji: "🏏",
    subcategories:   [],
    datetime:        "TBD",
    venue:           "Apartment Main Ground",
    maxParticipants: "60 players (10 teams of 6)",
    ageGroup:        "16 years & above",
    contact:         "TBD",
    rules: [
      "6-a-side box cricket format (T10)",
      "Tape ball only — no hard ball allowed",
      "10 overs per innings, 2 overs max per bowler",
      "Teams drawn block-wise on event day",
      "No-ball and wide ball rules apply",
      "Umpire's decision is final"
    ]
  },
  {
    name: "Badminton", emoji: "🏸",
    subcategories:   ["Singles", "Doubles", "Mixed Doubles"],
    datetime:        "TBD",
    venue:           "Badminton Court — Club House",
    maxParticipants: "32 players",
    ageGroup:        "Open for all ages",
    contact:         "TBD",
    rules: [
      "Singles and Doubles categories (knockout format)",
      "Best of 3 sets, 21 points each",
      "Shuttles provided by organizers",
      "Separate Men, Women & Mixed Doubles brackets",
      "Wear non-marking sports shoes on court",
      "Players must report 10 min before scheduled time"
    ]
  },
  {
    name: "Basketball", emoji: "🏀",
    subcategories:   [],
    datetime:        "TBD",
    venue:           "Basketball Court",
    maxParticipants: "40 players (8 teams of 5)",
    ageGroup:        "16 years & above",
    contact:         "TBD",
    rules: [
      "3-vs-3 half-court format (knockout)",
      "10 minutes per game or first team to 21 points",
      "Each team must have min 3, max 5 players",
      "Ball will be provided by organizers",
      "Standard NBA 3-point and foul rules apply",
      "No pushing, charging or rough play"
    ]
  },
  {
    name: "Football", emoji: "⚽",
    subcategories:   [],
    datetime:        "TBD",
    venue:           "Apartment Main Ground",
    maxParticipants: "70 players (7 teams of 10)",
    ageGroup:        "16 years & above",
    contact:         "TBD",
    rules: [
      "5-vs-5 format on a smaller pitch (knockout)",
      "15 minutes each half with a 5-min break",
      "Min 5, max 7 registered players per team",
      "No offside rule — small-sided game format",
      "Shin guards are strongly recommended",
      "Yellow & red card rules apply"
    ]
  },
  {
    name: "Water Sports", emoji: "🏊",
    multiSelect: true,
    subcategories: [
      "Kickboard — 10m × 2",
      "Freestyle — 10m × 2",
      "Backstroke — 10m × 2",
      "Freestyle — 15m × 2",
      "Backstroke — 15m × 2",
      "Breaststroke — 15m × 2",
      "Butterfly — 15m × 2",
      "Medley Relay — 15m each (Team of 4)"
    ],
    datetime:        "TBD",
    venue:           "Apartment Swimming Pool",
    maxParticipants: "50 swimmers",
    ageGroup:        "Kids (8–14), Adults (15+), Seniors (50+)",
    contact:         "TBD",
    rules: [
      "Individual freestyle races: 25m and 50m",
      "4×25m block relay race for teams",
      "Swimwear and swim cap are mandatory",
      "Separate heats for each age category",
      "Dive starts — no jumping or bombing",
      "Lifeguard on duty throughout the event"
    ]
  },
  {
    name: "Table Tennis", emoji: "🏓",
    subcategories:   ["Singles", "Doubles", "Mixed Doubles"],
    datetime:        "TBD",
    venue:           "Club House — Indoor Hall",
    maxParticipants: "32 players",
    ageGroup:        "8 years & above",
    contact:         "TBD",
    rules: [
      "Singles knockout — separate Men & Women brackets",
      "Best of 3 games, 11 points each game",
      "Win by a margin of 2 points required",
      "Bats and balls provided by organizers",
      "Service must be behind the end line",
      "Players must be ready at table when called"
    ]
  },
  {
    name: "Chess", emoji: "♟️",
    subcategories:   [],
    datetime:        "TBD",
    venue:           "Club House — Conference Room",
    maxParticipants: "32 players",
    ageGroup:        "6 years & above",
    contact:         "TBD",
    rules: [
      "Swiss system — 5 rounds",
      "Time control: 10 min + 5 sec increment per player",
      "Boards and pieces provided by organizers",
      "Separate Junior category (under 15 years)",
      "Touch-move rule strictly enforced",
      "Mobile phones must be switched off during play"
    ]
  },
  {
    name: "Pickleball", emoji: "🎾",
    subcategories:   ["Singles", "Doubles", "Mixed Doubles"],
    datetime:        "TBD",
    venue:           "Multi-purpose Court",
    maxParticipants: "32 players (16 pairs)",
    ageGroup:        "12 years & above",
    contact:         "TBD",
    rules: [
      "Doubles format — round robin then knockout",
      "First to 11 points, must win by 2",
      "Paddles and balls provided",
      "Kitchen (non-volley zone) rules apply",
      "Serve must be underhand and diagonal",
      "Beginners welcome — brief coaching available"
    ]
  },
  {
    name: "Track Events", emoji: "🏃",
    subcategories:   [],
    datetime:        "TBD",
    venue:           "Apartment Track / Main Ground",
    maxParticipants: "80 athletes",
    ageGroup:        "Kids (8–14), Adults (15+), Seniors (50+)",
    contact:         "TBD",
    rules: [
      "Events: 100m Sprint, 200m, 4×100m Relay",
      "Heats run first; top finishers go to finals",
      "False start results in disqualification",
      "Age-category medals: Gold, Silver & Bronze",
      "Wear running shoes and comfortable clothing",
      "Athletes must report 15 min before their event"
    ]
  },
  {
    name: "Kids Event (Under 5 years)", emoji: "🎈",
    subcategories:   [],
    datetime:        "TBD",
    venue:           "Apartment Garden / Ground",
    maxParticipants: "Unlimited (all kids welcome)",
    ageGroup:        "5 to 14 years",
    contact:         "TBD",
    rules: [
      "Events: Sack race, Lemon & spoon, Tug of war",
      "Separate heats for age 5–9 and 10–14",
      "Every participant receives a goodie bag",
      "Parents and guardians must be present",
      "No rough play — safety is the priority",
      "Fun and participation valued over winning!"
    ]
  },
  {
    name: "Open Mic", emoji: "🎤",
    subcategories:   [],
    datetime:        "TBD",
    venue:           "Amphitheatre / Club House Stage",
    maxParticipants: "20 acts",
    ageGroup:        "Open for all ages",
    contact:         "TBD",
    rules: [
      "Solo or group performances welcome",
      "Max 5 minutes per act — strictly enforced",
      "Accepted formats: Singing, Dance, Poetry, Stand-up",
      "Sound system and microphone provided",
      "No offensive or political content allowed",
      "Register your act name & type at the time of sign-up"
    ]
  },
  {
    name: "Carrom", emoji: "🟫", image: "images/carrom.png",
    subcategories:   ["Singles", "Doubles"],
    datetime:        "TBD",
    venue:           "Club House — Indoor Hall",
    maxParticipants: "32 players",
    ageGroup:        "Open for all ages",
    contact:         "TBD",
    rules: [
      "Singles and Doubles categories (knockout format)",
      "Standard Carrom Federation rules apply",
      "Board and coins provided by organizers",
      "Strike must be flicked with a finger — no pushing",
      "Queen must be covered immediately after pocketing",
      "Players must report 10 min before their match"
    ]
  },
  {
    name: "Squash", emoji: "🟡",
    subcategories:   ["Singles"],
    datetime:        "TBD",
    venue:           "Squash Court — Club House",
    maxParticipants: "16 players",
    ageGroup:        "16 years & above",
    contact:         "TBD",
    rules: [
      "Singles knockout format",
      "Best of 3 games to 11 points (PAR scoring)",
      "Racket and balls provided by organizers",
      "Non-marking shoes mandatory on court",
      "Players must warm up before the match",
      "Safety glasses strongly recommended"
    ]
  },
  {
    name: "8-Ball Pool", emoji: "🎱",
    subcategories:   ["8-Ball Pool"],
    datetime:        "TBD",
    venue:           "Club House — Billiards Room",
    maxParticipants: "16 players",
    ageGroup:        "16 years & above",
    contact:         "TBD",
    rules: [
      "8-Ball Pool — single category",
      "Single elimination knockout format",
      "Cues, balls and table provided by organizers",
      "Standard World Pool rules apply",
      "No rough handling of equipment",
      "Players must report 10 min before scheduled match"
    ]
  },
  {
    name: "Mr/Ms/Mrs Avriti (Fitness)", emoji: "🏋️‍♀️",
    subcategories:   ["Mr Avriti", "Ms Avriti", "Mrs Avriti"],
    datetime:        "TBD",
    venue:           "Club House Stage / Amphitheatre",
    maxParticipants: "30 participants",
    ageGroup:        "18 years & above",
    contact:         "TBD",
    rules: [
      "Fitness & personality contest — three categories",
      "Round 1: Introduction & fitness showcase (2 min)",
      "Round 2: Question & Answer round",
      "Round 3: Talent / freestyle fitness display",
      "Judged on fitness, confidence and personality",
      "Appropriate sportswear must be worn throughout"
    ]
  },
  {
    name: "Rubik's Cube", emoji: "🎲", image: "images/rubiks.png", poster: "images/rubik_poster.jpeg",
    subcategories:   [],
    datetime:        "TBD",
    venue:           "Club House — Conference Room",
    maxParticipants: "30 participants",
    ageGroup:        "Open for all ages",
    contact:         "TBD",
    rules: [
      "Standard 3×3 speedsolve — fastest time wins",
      "3 timed attempts; best time counts",
      "Participants may bring their own cube",
      "Inspection time: 15 seconds before each solve",
      "WCA (World Cube Association) rules apply",
      "Separate Junior (under 15) and Open categories"
    ]
  },
  {
    name: "Sudoku", emoji: "🔢", image: "images/sudoku.png",
    subcategories:   [],
    datetime:        "TBD",
    venue:           "Club House — Conference Room",
    maxParticipants: "40 participants",
    ageGroup:        "Open for all ages",
    contact:         "TBD",
    rules: [
      "Written round — printed puzzle sheets provided",
      "Two puzzles: Medium and Hard difficulty",
      "Winner decided by most correct + fastest time",
      "No electronic devices allowed during the round",
      "Duration: 30 minutes per round",
      "Separate Junior (under 15) and Open categories"
    ]
  },
  {
    name: "Skating", emoji: "⛸️",
    subcategories:   ["Individual"],
    datetime:        "TBD",
    venue:           "Apartment Skating Rink / Open Ground",
    maxParticipants: "40 participants",
    ageGroup:        "Kids (6–14), Adults (15+)",
    contact:         "TBD",
    rules: [
      "Individual category — knockout format",
      "Helmet, knee pads, and elbow pads are mandatory",
      "Participants must bring their own skates",
      "Separate age brackets: Kids (6–14) and Adults (15+)",
      "Judged on speed, form, and control",
      "Participants must report 15 min before their event"
    ]
  },
];


// ── Admin phone — change this to your phone number ──
const ADMIN_PHONE = "9945648475";

// NOTE: This is client-side role checking suitable for
// a trusted community app. For production apps requiring
// strict security, implement Firebase Security Rules
// and Firebase Authentication.
let adminVerified = false;
function isAdmin() {
  return userProfile && userProfile.phone === ADMIN_PHONE && adminVerified === true;
}

// ── App state ──
let currentSport       = null;
let currentSubcategory    = null;
let selectedSubcategories = [];
let currentAgeCategory = null;
let userProfile        = null;
let blockChart         = null;
let deleteTargetId     = null;
let deleteTargetName   = null;

// ── Quiz state ──
let quizCurrentIndex      = 0;
let quizTotalScore        = 0;
let quizTotalAnswered     = 0;
let quizAnsweredMap       = {};
let quizCurrentQuestion   = null;
let quizSelectedAnswer    = null;
let quizQuestionCache     = {};
let quizProgressDocExists = false;

// ── Dashboard cache ──
let dashboardCache = null;
let dashboardCacheTime = 0;
let graphVisibility = { showBlockGraph: true, showSportGraph: true, showQuizTab: true };
const DASHBOARD_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// ── PIC participant filter state ──
let allParticipants      = [];
let filteredParticipants = [];
let currentPICSport      = null;
let activeFilters        = {
  gender: null, ageCategory: null,
  grade: null,  subcategory: null
};

// ── Subcategory icon map ──
const SUBCATEGORY_ICONS = {
  'Singles':       { emoji: '👤', desc: 'Play solo' },
  'Doubles':       { emoji: '👥', desc: 'Same gender pair' },
  'Mixed Doubles': { emoji: '🔀', desc: 'Mixed gender pair' },
  // Skating
  'Individual':    { emoji: '⛸️', desc: 'Solo skating' },
  // Water Sports
  'Kickboard — 10m × 2':            { emoji: '🏊', desc: '' },
  'Freestyle — 10m × 2':            { emoji: '🏊', desc: '' },
  'Backstroke — 10m × 2':           { emoji: '🏊', desc: '' },
  'Freestyle — 15m × 2':            { emoji: '🏊', desc: '' },
  'Backstroke — 15m × 2':           { emoji: '🏊', desc: '' },
  'Breaststroke — 15m × 2':         { emoji: '🏊', desc: '' },
  'Butterfly — 15m × 2':            { emoji: '🦋', desc: '' },
  'Medley Relay — 15m each (Team of 4)': { emoji: '🏅', desc: '' },
};

// ── Block graph config ──
const BLOCKS       = ['A', 'B', 'C', 'D', 'E'];
const BLOCK_COLORS = ['#0080ff', '#ff6a00', '#00e5a0', '#c84bff', '#f1c40f'];

// ── Init on page load ──
document.addEventListener('DOMContentLoaded', () => {
  buildSportsGrid();
  loadProfile();

  // Strip non-digits from flat number inputs as the user types
  const pFlatEl = document.getElementById('p-flat');
  if (pFlatEl) pFlatEl.addEventListener('input', () => {
    pFlatEl.value = pFlatEl.value.replace(/\D/g, '').slice(0, 4);
  });

  // Auto-update partner gender whenever registrant gender changes
  document.querySelectorAll('input[name="gender"]').forEach(r => {
    r.addEventListener('change', updatePartnerGender);
  });

  // Show/hide instrument name field when instrument radio changes
  document.querySelectorAll('input[name="openmic-instrument"]').forEach(r => {
    r.addEventListener('change', () => toggleInstrumentName(r.value));
  });
});

function updatePartnerGender() {
  const partnerSection = document.getElementById('partner-section');
  if (!partnerSection || partnerSection.style.display === 'none') return;

  const registrantGender = document.querySelector('input[name="gender"]:checked')?.value;
  const maleInput        = document.querySelector('input[name="partner-gender"][value="Male"]');
  const femaleInput      = document.querySelector('input[name="partner-gender"][value="Female"]');
  const note             = document.getElementById('partner-gender-note');

  if (!maleInput || !femaleInput) return;

  if (!registrantGender) {
    maleInput.checked   = false;
    femaleInput.checked = false;
    if (note) note.textContent = 'Select your gender above to auto-fill';
    return;
  }

  let partnerGender;
  if (currentSubcategory === 'Mixed Doubles') {
    partnerGender = registrantGender === 'Male' ? 'Female' : 'Male';
    if (note) note.textContent = 'Opposite gender — required for Mixed Doubles';
  } else {
    partnerGender = registrantGender;
    if (note) note.textContent = 'Same gender — required for Doubles';
  }

  maleInput.checked   = (partnerGender === 'Male');
  femaleInput.checked = (partnerGender === 'Female');
}

// ── Profile ──
async function loadProfile() {
  const saved = localStorage.getItem('sportsFestProfile');
  if (saved) {
    userProfile = JSON.parse(saved);
    // Refresh role and picSports from Firestore in case admin changed them
    try {
      const snap = await getDocs(
        query(collection(db, 'users'), where('phone', '==', userProfile.phone))
      );
      if (!snap.empty) {
        const docSnap = snap.docs[0];
        const data    = docSnap.data();
        userProfile.role      = data.role      ?? 'participant';
        userProfile.picSports = data.picSports ?? [];
        userProfile.docId     = docSnap.id;
        localStorage.setItem('sportsFestProfile', JSON.stringify(userProfile));
      }
    } catch (e) { /* use cached role on network error */ }
    // Restore admin verification from previous session
    if (userProfile.phone === ADMIN_PHONE &&
        localStorage.getItem('adminVerified') === 'true') {
      adminVerified = true;
    }
    enterApp();
  } else {
    showScreen('screen-profile');
  }
}

async function saveProfile() {
  const name  = document.getElementById('p-name').value.trim();
  const phone = document.getElementById('p-phone').value.trim();
  const block = document.querySelector('input[name="p-block"]:checked')?.value;
  const flatNo = document.getElementById('p-flat').value.trim();
  const flat  = block && flatNo ? `${block}-${flatNo}` : '';

  if (!name)                        return showToast('Please enter your name', true);
  if (phone.length < 10)            return showToast('Please enter a valid 10-digit phone number', true);
  if (!block)                       return showToast('Please select your block', true);
  if (!flatNo)                      return showToast('Please enter your flat number', true);
  if (!/^\d{1,4}$/.test(flatNo))    return showToast('Flat number must be digits only (max 4)', true);

  showLoading(true);
  try {
    // Check if phone already registered — prevent
    // duplicates and recover existing profiles
    const existing = await getDocs(
      query(collection(db, 'users'), where('phone', '==', phone))
    );

    if (!existing.empty) {
      const docSnap = existing.docs[0];
      const data    = docSnap.data();
      userProfile   = {
        name:      data.name,
        phone:     data.phone,
        flat:      data.flat,
        role:      data.role      ?? null,
        picSports: data.picSports ?? [],
        docId:     docSnap.id,
      };
      localStorage.setItem('sportsFestProfile', JSON.stringify(userProfile));
      showLoading(false);
      showToast(`Welcome back, ${data.name.split(' ')[0]}! Your profile was found.`, false);
      enterApp();
      return;
    }

    const newRole = phone === ADMIN_PHONE ? 'admin' : 'participant';
    const docRef  = await addDoc(collection(db, 'users'), {
      name, phone, flat,
      role: newRole, picSports: [],
      createdAt: serverTimestamp()
    });
    userProfile = { name, phone, flat, role: newRole, picSports: [], docId: docRef.id };
    localStorage.setItem('sportsFestProfile', JSON.stringify(userProfile));
    enterApp();
  } catch (err) {
    console.error(err);
    showToast('Could not save profile. Check Firebase config.', true);
  } finally {
    showLoading(false);
  }
}

async function enterApp() {
  document.getElementById('greeting-name').textContent =
    `Hi, ${userProfile.name.split(' ')[0]}! 👋`;
  // Admin phone without verified PIN → show PIN screen first
  if (userProfile.phone === ADMIN_PHONE && !adminVerified) {
    document.getElementById('tab-bar').style.display = 'none';
    document.getElementById('admin-pin-input').value = '';
    showScreen('screen-admin-pin');
    return;
  }
  // Load quiz tab visibility before rendering tab bar
  try {
    const gvSnap = await getDoc(doc(db, 'config', 'dashboardSettings'));
    if (gvSnap.exists()) graphVisibility.showQuizTab = gvSnap.data().showQuizTab !== false;
  } catch (e) { /* keep default true */ }
  renderTabBar();
  switchTab('home');
}

// ── Admin PIN verification ──
async function verifyAdminPin() {
  const entered = document.getElementById('admin-pin-input').value.trim();
  if (!entered) return showToast('Please enter your PIN', true);

  showLoading(true);
  try {
    const pinDoc = await getDoc(doc(db, 'config', 'adminPin'));
    if (!pinDoc.exists()) {
      showToast('PIN not configured. Contact support.', true);
      return;
    }
    if (entered === String(pinDoc.data().pin)) {
      adminVerified = true;
      localStorage.setItem('adminVerified', 'true');
      showToast('Welcome, Admin!');
      renderTabBar();
      switchTab('home');
    } else {
      showToast('Incorrect PIN', true);
      document.getElementById('admin-pin-input').value = '';
    }
  } catch (err) {
    console.error(err);
    showToast('Could not verify PIN. Try again.', true);
  } finally {
    showLoading(false);
  }
}

function skipAdminVerification() {
  adminVerified = false;
  localStorage.removeItem('adminVerified');
  renderTabBar();
  switchTab('home');
}

// ── Tab bar renderer — called after profile loads so admin tab is conditional ──
function renderTabBar() {
  const inner = document.querySelector('.tab-bar-inner');
  inner.innerHTML = `
    <div class="tab-item" data-tab="home" onclick="switchTab('home')">
      <span class="tab-icon">🏠</span>
      <span class="tab-dot"></span>
      <span class="tab-label">Home</span>
    </div>
    <div class="tab-item" data-tab="dashboard" onclick="switchTab('dashboard')">
      <span class="tab-icon">📊</span>
      <span class="tab-dot"></span>
      <span class="tab-label">Dashboard</span>
    </div>
    ${isAdmin() || graphVisibility.showQuizTab ? `<div class="tab-item" data-tab="quiz" onclick="switchTab('quiz')">
      <span class="tab-icon">🧠</span>
      <span class="tab-dot"></span>
      <span class="tab-label">Quiz</span>
    </div>` : ''}
    <div class="tab-item" data-tab="mylist" onclick="switchTab('mylist')">
      <div class="tab-icon-wrap">
        <span class="tab-icon">📋</span>
        <span class="tab-badge" id="tab-mylist-badge"></span>
      </div>
      <span class="tab-dot"></span>
      <span class="tab-label">My List</span>
    </div>
    ${isAdmin() ? `<div class="tab-item admin-tab" data-tab="admin" onclick="switchTab('admin')">
      <span class="tab-icon">👑</span>
      <span class="tab-dot"></span>
      <span class="tab-label">Admin</span>
    </div>` : ''}`;
  updateMyListBadge();
}

// ── PIC Section renderer ──
function renderPICSection(picUsers) {
  const container = document.getElementById('details-pic-list');
  const heading   = document.getElementById('details-pic-heading');
  if (!container) return;

  if (picUsers.length === 0) {
    if (heading) heading.textContent = 'Person in Charge';
    container.innerHTML = `
      <div class="pic-empty-card">
        <div class="pic-empty-icon">👤</div>
        <div class="pic-empty-text">No coordinator assigned yet</div>
        <div class="pic-empty-sub">Contact the organiser for queries</div>
      </div>`;
    return;
  }

  if (heading) heading.textContent = picUsers.length === 1 ? 'Person in Charge' : 'People in Charge';

  const avatarGradients = [
    'linear-gradient(135deg, #f0a500, #ff6b35)',
    'linear-gradient(135deg, #534AB7, #89b4fa)',
    'linear-gradient(135deg, #1D9E75, #5DCAA5)',
  ];

  const waSVG = `<svg width="12" height="12" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle;flex-shrink:0;"><circle cx="16" cy="16" r="16" fill="#25D366"/><path fill="#fff" d="M23 20.5c-.3.8-1.5 1.5-2.4 1.7-.6.1-1.5.2-4.3-.9-3.6-1.5-5.9-5.1-6.1-5.4-.2-.2-1.4-1.9-1.4-3.6 0-1.7.9-2.6 1.2-2.9.3-.4.7-.4.9-.4h.7c.2 0 .5-.1.8.6.3.7 1 2.4 1.1 2.6.1.2.1.4 0 .6-.1.2-.2.4-.4.6-.2.2-.4.5-.5.6-.2.2-.4.4-.1.7.2.4.9 1.5 2 2.4 1.3 1.2 2.5 1.6 2.8 1.7.3.2.6.1.8-.1.2-.2.9-1 1.1-1.4.2-.3.5-.3.8-.2.3.1 2.1 1 2.4 1.1.3.2.6.3.7.4.1.2.1.9-.2 1.7z"/></svg>`;

  container.innerHTML = '';
  picUsers.forEach((pic, index) => {
    const initial  = pic.name ? pic.name.charAt(0).toUpperCase() : '?';
    const gradient = avatarGradients[index % avatarGradients.length];
    const waNumber = pic.phone.toString().replace(/\D/g, '');
    const waUrl    = 'https://wa.me/91' + waNumber;

    const card = document.createElement('div');
    card.className = 'pic-avatar-card';
    card.innerHTML = `
      <div class="pic-avatar-circle" style="background:${gradient}">${initial}</div>
      <div class="pic-avatar-info">
        <div class="pic-avatar-top">
          <div class="pic-avatar-name">${pic.name}</div>
          <div class="pic-role-badge">PIC</div>
        </div>
        <div class="pic-avatar-flat">${pic.flat ? `Flat ${pic.flat}` : ''}</div>
        <a href="${waUrl}" target="_blank" class="pic-wa-button">${waSVG}<span>WhatsApp</span></a>
      </div>`;
    container.appendChild(card);
  });
}

// ── WhatsApp link helper ──
function makeWhatsAppLink(phone, displayText, extraClass) {
  const cleaned = phone.toString().replace(/\D/g, '');
  const url     = 'https://wa.me/91' + cleaned;
  const cls     = extraClass ? `wa-link ${extraClass}` : 'wa-link';
  return `<a href="${url}" target="_blank" class="${cls}"><span class="wa-icon">💬</span>${displayText || phone}</a>`;
}

// ── Sports grid ──
function buildSportsGrid() {
  const grid = document.getElementById('sports-grid');
  SPORTS.forEach(sport => {
    const tile = document.createElement('div');
    tile.className = 'sport-tile';
    tile.innerHTML = `
      ${sport.image
        ? `<img src="${sport.image}" class="sport-emoji" style="width:36px;height:36px;object-fit:contain" alt="${sport.name}">`
        : `<span class="sport-emoji">${sport.emoji}</span>`}
      <span class="sport-label">${sport.name}</span>
    `;
    tile.addEventListener('click', () => openSportDetails(sport));
    grid.appendChild(tile);
  });
}

// ── Sport details ──
async function openSportDetails(sport) {
  currentSport          = sport;
  currentSubcategory    = null;
  selectedSubcategories = [];

  document.getElementById('det-emoji').innerHTML = sport.image
    ? `<img src="${sport.image}" style="width:56px;height:56px;object-fit:contain" alt="${sport.name}">`
    : sport.emoji;
  document.getElementById('det-name').textContent  = sport.name;

  // Defaults from SPORTS array
  let datetime         = sport.datetime;
  let venue            = sport.venue;
  let contact          = sport.contact;
  let ageGroup         = sport.ageGroup;
  let rules            = sport.rules;
  let registrationOpen = true;

  // Fetch Firestore overrides from sportSettings
  try {
    const settingDoc = await getDoc(doc(db, 'sportSettings', sport.name));
    if (settingDoc.exists()) {
      const d = settingDoc.data();
      if (d.datetime)                    datetime = d.datetime;
      if (d.venue)                       venue    = d.venue;
      if (d.contact)                     contact  = d.contact;
      if (d.ageGroup)                    ageGroup = d.ageGroup;
      if (d.rules && d.rules.length)     rules    = d.rules;
      if (d.registrationOpen === false)  registrationOpen = false;
    }
  } catch (e) { /* use hardcoded values on network error */ }

  document.getElementById('det-datetime').textContent = datetime;
  document.getElementById('det-venue').textContent    = venue;
  document.getElementById('det-age').textContent      = ageGroup;
  document.getElementById('det-rules').innerHTML =
    rules.map(r => `<li class="details-rule-item">${r}</li>`).join('');

  // ── Person in Charge — dynamic from Firestore ──
  const picContainer = document.getElementById('details-pic-list');
  if (picContainer) picContainer.innerHTML = '<div class="pic-loading">Loading coordinators…</div>';
  try {
    const picSnap = await getDocs(query(
      collection(db, 'users'),
      where('picSports', 'array-contains', sport.name)
    ));
    const picUsers = picSnap.docs.map(d => d.data());
    renderPICSection(picUsers);
  } catch (e) {
    if (picContainer) picContainer.innerHTML = `<div class="pic-empty-card"><div class="pic-empty-text">Could not load coordinator info</div></div>`;
  }

  // ── Subcategory pills ──
  const subSection = document.getElementById('subcategory-section');
  const subTitle   = subSection.querySelector('.subcategory-title');
  const pillsEl    = document.getElementById('subcategory-pills');
  if (sport.subcategories.length > 0) {
    const isMulti = !!sport.multiSelect;
    subTitle.textContent = isMulti ? 'Select Events — choose all that apply. You can choose more than one.' : 'Select Category';
    subTitle.classList.toggle('subcategory-title--multi', isMulti);
    pillsEl.className = isMulti ? 'subcategory-pills subcategory-pills--grid' : 'subcategory-pills';
    pillsEl.innerHTML = sport.subcategories.map(sub => {
      const meta = SUBCATEGORY_ICONS[sub] || { emoji: '🎯', desc: '' };
      return `
        <button class="subcategory-pill" data-sub="${sub}">
          <span class="subcategory-pill-icon">${meta.emoji}</span>
          <span class="subcategory-pill-label">${sub}</span>
          ${meta.desc ? `<span class="subcategory-pill-desc">${meta.desc}</span>` : ''}
        </button>`;
    }).join('');
    pillsEl.querySelectorAll('.subcategory-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        if (isMulti) {
          btn.classList.toggle('selected');
          const sub = btn.dataset.sub;
          if (btn.classList.contains('selected')) {
            selectedSubcategories.push(sub);
          } else {
            selectedSubcategories = selectedSubcategories.filter(s => s !== sub);
          }
          currentSubcategory = selectedSubcategories.length ? selectedSubcategories.join(' | ') : null;
        } else {
          pillsEl.querySelectorAll('.subcategory-pill').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          currentSubcategory = btn.dataset.sub;
        }
      });
    });
    subSection.style.display = 'block';
  } else {
    subSection.style.display = 'none';
  }

  // ── Register button — respect registrationOpen flag ──
  const btn    = document.getElementById('det-register-btn');
  const label  = document.getElementById('det-register-label');
  const notice = document.getElementById('det-closed-notice');

  if (!registrationOpen) {
    label.textContent     = 'Registration Closed';
    btn.disabled          = true;
    btn.style.opacity     = '0.5';
    btn.style.cursor      = 'not-allowed';
    btn.onclick           = null;
    notice.style.display  = 'block';
  } else {
    label.textContent     = `Register for ${sport.name} →`;
    btn.disabled          = false;
    btn.style.opacity     = '';
    btn.style.cursor      = '';
    notice.style.display  = 'none';
    btn.onclick = () => {
      if (sport.subcategories.length > 0 && !currentSubcategory) {
        showToast(sport.multiSelect ? 'Please select at least one event' : 'Please select a category first', true);
        return;
      }
      openRegistrationForm(sport);
    };
  }

  // Show poster if sport has one
  const posterWrap = document.getElementById('sport-poster-wrap');
  const posterImg  = document.getElementById('sport-poster-img');
  if (sport.poster && posterWrap && posterImg) {
    posterImg.src = sport.poster;
    posterImg.alt = sport.name + ' Event Poster';
    posterWrap.style.display = 'block';
  } else {
    if (posterWrap) posterWrap.style.display = 'none';
    if (posterImg)  posterImg.src = '';
  }

  showScreen('screen-details');
}

// ── Registration form ──
function selectAgeCategory(category) {
  currentAgeCategory = category;

  const pillAdult   = document.getElementById('pill-adult');
  const pillUnder   = document.getElementById('pill-under18');
  const gradeSection = document.getElementById('grade-section');

  pillAdult.classList.remove('selected');
  pillUnder.classList.remove('selected');

  if (category === '18+') {
    pillAdult.classList.add('selected');
    gradeSection.style.display = 'none';
    document.getElementById('f-grade').value = '';
  } else {
    pillUnder.classList.add('selected');
    gradeSection.style.display = 'block';
  }
}

function openRegistrationForm(sport) {
  currentSport = sport;

  const titleSuffix = currentSubcategory ? ` — ${currentSubcategory}` : '';
  document.getElementById('form-sport-icon').textContent    = sport.emoji;
  document.getElementById('form-sport-name').textContent    = sport.name;
  document.getElementById('form-title-sport').textContent   = sport.name + titleSuffix;
  document.getElementById('form-phone-display').innerHTML = makeWhatsAppLink(userProfile.phone);
  document.getElementById('form-flat-display').textContent  = `Flat ${userProfile.flat}`;

  document.getElementById('f-name').value         = '';
  document.getElementById('f-partner-name').value  = '';
  document.getElementById('f-partner-phone').value = '';
  document.querySelectorAll('input[name="partner-block"]').forEach(r => r.checked = false);
  document.querySelectorAll('input[name="partner-gender"]').forEach(r => r.checked = false);
  const pgNote = document.getElementById('partner-gender-note');
  if (pgNote) pgNote.textContent = 'Select your gender above to auto-fill';
  const pfn = document.getElementById('f-partner-flat-num');
  if (pfn) pfn.value = '';
  document.querySelectorAll('input[name="regtype"]').forEach(r => r.checked = false);
  document.querySelectorAll('input[name="gender"]').forEach(r => r.checked = false);

  currentAgeCategory = null;
  const pillAdult   = document.getElementById('pill-adult');
  const pillUnder   = document.getElementById('pill-under18');
  if (pillAdult) pillAdult.classList.remove('selected');
  if (pillUnder) pillUnder.classList.remove('selected');
  const gradeSection = document.getElementById('grade-section');
  if (gradeSection) gradeSection.style.display = 'none';
  const gradeSelect = document.getElementById('f-grade');
  if (gradeSelect) gradeSelect.value = '';

  const needsPartner = currentSubcategory === 'Doubles' || currentSubcategory === 'Mixed Doubles';
  document.getElementById('partner-section').style.display = needsPartner ? 'block' : 'none';

  // Open Mic specific fields
  const isOpenMic = sport.name === 'Open Mic';
  document.getElementById('openmic-fields').style.display = isOpenMic ? 'block' : 'none';
  if (isOpenMic) {
    document.getElementById('f-act-type').value = '';
    document.querySelectorAll('input[name="openmic-category"]').forEach(r => r.checked = false);
    document.querySelectorAll('input[name="openmic-instrument"]').forEach(r => r.checked = false);
    document.getElementById('instrument-name-section').style.display = 'none';
    document.getElementById('f-instrument-name').value = '';
  }

  showScreen('screen-form');
}

function toggleInstrumentName(value) {
  document.getElementById('instrument-name-section').style.display = value === 'Yes' ? 'block' : 'none';
  if (value === 'No') document.getElementById('f-instrument-name').value = '';
}

async function submitRegistration() {
  const name        = document.getElementById('f-name').value.trim();
  const ageCategory = currentAgeCategory;
  const grade       = document.getElementById('f-grade').value;
  const gender      = document.querySelector('input[name="gender"]:checked')?.value;
  const regtype     = document.querySelector('input[name="regtype"]:checked')?.value;

  if (!name)        return showToast('Please enter participant name', true);
  if (!ageCategory) return showToast('Please select age category', true);
  if (ageCategory === 'Under 18' && !grade) return showToast('Please select grade', true);
  if (!gender)      return showToast('Please select gender', true);
  if (!regtype)     return showToast('Please select registrant type', true);

  // Open Mic specific validation
  const isOpenMic = currentSport.name === 'Open Mic';
  let actType = null, openMicCategory = null, withInstrument = null, instrumentName = null;
  if (isOpenMic) {
    actType          = document.getElementById('f-act-type').value.trim();
    openMicCategory  = document.querySelector('input[name="openmic-category"]:checked')?.value || null;
    withInstrument   = document.querySelector('input[name="openmic-instrument"]:checked')?.value || null;
    instrumentName   = document.getElementById('f-instrument-name').value.trim() || null;
    if (!actType)         return showToast('Please enter your type of act', true);
    if (!openMicCategory) return showToast('Please select Solo or Group', true);
    if (!withInstrument)  return showToast('Please select whether you will perform with an instrument', true);
    if (withInstrument === 'Yes' && !instrumentName) return showToast('Please enter the instrument name', true);
    if (withInstrument === 'No') instrumentName = null;
  }

  // Partner fields (only when section is visible)
  const partnerVisible = document.getElementById('partner-section').style.display !== 'none';
  let partnerName = null, partnerPhone = null, partnerBlock = null, partnerFlatNum = null, partnerFlatFull = null, partnerGender = null;
  if (partnerVisible) {
    partnerName    = document.getElementById('f-partner-name').value.trim();
    partnerPhone   = document.getElementById('f-partner-phone').value.trim();
    partnerGender  = document.querySelector('input[name="partner-gender"]:checked')?.value || null;
    partnerBlock   = document.querySelector('input[name="partner-block"]:checked')?.value || null;
    partnerFlatNum = document.getElementById('f-partner-flat-num')?.value?.trim() || null;
    if (!partnerName)                       return showToast('Please enter partner name', true);
    if (!partnerPhone || partnerPhone.length < 10) return showToast("Please enter partner's 10-digit phone", true);
    if (!partnerGender)                     return showToast('Please select your gender to determine partner gender', true);
    if (!partnerBlock)                      return showToast('Please select partner block', true);
    if (!partnerFlatNum)                    return showToast('Please enter partner flat number', true);
    if (String(partnerFlatNum).length > 4)  return showToast('Flat number must be 4 digits or less', true);
    partnerFlatFull = `Block ${partnerBlock}, Flat ${partnerFlatNum}`;
  }

  showLoading(true);
  try {
    // Duplicate partner check (non-blocking)
    if (partnerVisible && partnerPhone) {
      const partnerCheckSnap = await getDocs(query(
        collection(db, 'registrations'),
        where('phone', '==', partnerPhone),
        where('sport', '==', currentSport.name),
        where('isPartnerEntry', '==', false)
      ));
      if (!partnerCheckSnap.empty) {
        showLoading(false);
        showToast(`⚠️ ${partnerName} is already registered for ${currentSport.name}! Proceeding anyway…`, false);
        await new Promise(r => setTimeout(r, 2000));
        showLoading(true);
      }
    }

    // Primary registrant document
    await addDoc(collection(db, 'registrations'), {
      sport:         currentSport.name,
      sportEmoji:    currentSport.emoji,
      subcategory:   currentSubcategory || null,
      name,
      ageCategory,
      grade:         ageCategory === 'Under 18' ? grade : null,
      gender,
      regtype,
      phone:         userProfile.phone,
      flat:          userProfile.flat,
      registeredBy:  userProfile.name,
      isPartnerEntry: false,
      partnerName:   partnerName   || null,
      partnerPhone:  partnerPhone  || null,
      partnerGender: partnerGender || null,
      partnerBlock:  partnerBlock  || null,
      partnerFlatNum: partnerFlatNum || null,
      partnerFlat:   partnerFlatFull || null,
      actType:        actType        || null,
      openMicCategory: openMicCategory || null,
      withInstrument:  withInstrument  || null,
      instrumentName:  instrumentName  || null,
      registeredAt:  serverTimestamp()
    });

    // Partner auto-registration document
    if (partnerName && partnerPhone && partnerBlock && partnerFlatNum) {
      const myBlock = userProfile.flat.split('-')[0] || null;
      await addDoc(collection(db, 'registrations'), {
        sport:         currentSport.name,
        sportEmoji:    currentSport.emoji,
        subcategory:   currentSubcategory || null,
        name:          partnerName,
        gender:        partnerGender || null,
        ageCategory:   null,
        grade:         null,
        regtype:       'Partner',
        phone:         partnerPhone,
        flat:          partnerFlatFull,
        block:         partnerBlock,
        registeredBy:  userProfile.name,
        isPartnerEntry: true,
        partnerOf:     userProfile.phone,
        partnerOfName: userProfile.name,
        partnerName:   name,
        partnerPhone:  userProfile.phone,
        partnerBlock:  myBlock,
        partnerFlat:   userProfile.flat,
        registeredAt:  serverTimestamp()
      });
    }

    // Update registration summary (non-blocking — fails silently inside the function)
    const userBlock = userProfile.flat ? userProfile.flat.charAt(0).toUpperCase() : 'Unknown';
    await updateRegistrationSummary(currentSport.name, userBlock, partnerBlock);

    const sportLabel = currentSubcategory
      ? `${currentSport.name} (${currentSubcategory})`
      : currentSport.name;
    document.getElementById('success-msg').textContent = (partnerName && partnerPhone)
      ? `${name} and ${partnerName} are both registered for ${sportLabel}! See you at the event.`
      : `${name} is registered for ${sportLabel}! See you at the event.`;
    updateMyListBadge();
    showScreen('screen-success');
  } catch (err) {
    console.error(err);
    showToast('Registration failed. Please try again.', true);
  } finally {
    showLoading(false);
  }
}

// ── Registration summary updater ──
async function updateRegistrationSummary(sportName, block, partnerBlock) {
  try {
    const summaryRef  = doc(db, 'config', 'registrationSummary');
    const summarySnap = await getDoc(summaryRef);

    let summary = { totalRegistrations: 0, byBlock: {}, bySport: {}, lastUpdated: null };
    if (summarySnap.exists()) summary = summarySnap.data();

    // Primary registrant
    summary.totalRegistrations = (summary.totalRegistrations || 0) + 1;
    const blockKey = block || 'Unknown';
    summary.byBlock[blockKey] = (summary.byBlock[blockKey] || 0) + 1;
    summary.bySport[sportName] = (summary.bySport[sportName] || 0) + 1;
    summary.lastUpdated = serverTimestamp();
    await setDoc(summaryRef, summary);

    // Partner registrant — re-fetch to avoid race condition
    if (partnerBlock) {
      const freshSnap    = await getDoc(summaryRef);
      const freshSummary = freshSnap.data();
      freshSummary.totalRegistrations = (freshSummary.totalRegistrations || 0) + 1;
      freshSummary.byBlock[partnerBlock] = (freshSummary.byBlock[partnerBlock] || 0) + 1;
      freshSummary.bySport[sportName]    = (freshSummary.bySport[sportName]    || 0) + 1;
      freshSummary.lastUpdated = serverTimestamp();
      await setDoc(summaryRef, freshSummary);
    }
  } catch(err) {
    console.error('Summary update failed:', err);
  }
}

// ── My registrations ──
async function loadRegistrations() {
  const firstName = userProfile.name.split(' ')[0];
  document.getElementById('reg-greeting-text').textContent =
    `Here are all your entries, ${firstName}! 🏅`;

  const list = document.getElementById('reg-list');
  list.innerHTML = '<div class="empty-state">Loading...</div>';
  try {
    const q    = query(collection(db, 'registrations'), where('phone', '==', userProfile.phone));
    const snap = await getDocs(q);
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    document.getElementById('stat-total').textContent  = docs.length;
    document.getElementById('stat-sports').textContent = new Set(docs.map(d => d.sport)).size;

    if (docs.length === 0) {
      list.innerHTML = '<div class="empty-state">No registrations yet.<br/>Go pick a sport! 🏆</div>';
      return;
    }
    list.innerHTML = '';
    docs.forEach(d => {
      const card = document.createElement('div');
      card.className = 'reg-card' + (d.isPartnerEntry ? ' partner-entry-card' : '');
      const cls        = d.regtype === 'Self' ? 'self' : d.regtype === 'Kid' ? 'kid' : d.regtype === 'Partner' ? 'partner' : '';
      const sportLabel = d.subcategory ? `${d.sport} — ${d.subcategory}` : d.sport;
      const partnerTag = d.isPartnerEntry
        ? `<span class="reg-tag partner-entry">👥 Added as partner by ${d.partnerOfName || 'someone'}</span>`
        : (d.partnerName
          ? `<span class="reg-tag">Partner: ${d.partnerName} · Blk ${d.partnerBlock || ''} Flat ${d.partnerFlatNum || d.partnerFlat || ''}</span>`
          : '');
      card.innerHTML = `
        <div class="reg-card-icon">${d.sportEmoji || '🏆'}</div>
        <div class="reg-card-info">
          <div class="reg-card-sport">${sportLabel}</div>
          <div class="reg-card-details">
            <span class="reg-tag">${d.name}</span>
            ${d.ageCategory ? `<span class="reg-tag">${d.ageCategory}</span>` : (d.age ? `<span class="reg-tag">Age ${d.age}</span>` : '')}
            ${d.grade ? `<span class="reg-tag">${d.grade}</span>` : ''}
            ${d.gender ? `<span class="reg-tag">${d.gender}</span>` : ''}
            <span class="reg-tag ${cls}">${d.regtype}</span>
            <span class="reg-tag">Flat ${d.flat}</span>
            ${d.actType ? `<span class="reg-tag">🎤 ${d.actType}</span>` : ''}
            ${d.openMicCategory ? `<span class="reg-tag">${d.openMicCategory}</span>` : ''}
            ${d.withInstrument ? `<span class="reg-tag">🎵 ${d.withInstrument === 'Yes' ? (d.instrumentName || 'With Instrument') : 'No Instrument'}</span>` : ''}
            ${partnerTag}
          </div>
        </div>
        <button class="reg-delete-btn" title="Delete registration">🗑️</button>
      `;
      card.querySelector('.reg-delete-btn').addEventListener('click', () => {
        openDeleteModal(d.id, sportLabel);
      });
      list.appendChild(card);
    });
  } catch (err) {
    console.error(err);
    list.innerHTML = '<div class="empty-state">Error loading registrations.</div>';
  }
}

async function updateMyListBadge() {
  try {
    const q    = query(collection(db, 'registrations'), where('phone', '==', userProfile.phone));
    const snap = await getDocs(q);
    const badge = document.getElementById('tab-mylist-badge');
    if (snap.size > 0) {
      badge.textContent   = snap.size;
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  } catch (e) { /* silently fail */ }
}

// ── Block-wise graph ──
async function loadBlockGraph() {
  const emptyEl = document.getElementById('graph-empty');

  showLoading(true);
  try {
    const snap = await getDocs(collection(db, 'registrations'));
    const docs = snap.docs.map(d => d.data());

    if (docs.length === 0) {
      emptyEl.classList.remove('hidden');
      document.querySelector('.graph-wrap').style.display = 'none';
      return;
    }
    emptyEl.classList.add('hidden');
    document.querySelector('.graph-wrap').style.display = 'block';

    // tally: tally[block][sportName] = count
    const tally = {};
    BLOCKS.forEach(b => {
      tally[b] = {};
      SPORTS.forEach(s => tally[b][s.name] = 0);
    });
    docs.forEach(d => {
      // Support both "B-1104" (primary) and explicit block field (partner auto-reg)
      const raw   = d.block || d.flat?.split('-')[0] || '';
      const block = raw.length === 1 ? raw : (d.flat?.match(/Block\s+([A-E])/i)?.[1] || '');
      if (BLOCKS.includes(block) && tally[block][d.sport] !== undefined) {
        tally[block][d.sport]++;
      }
    });

    // only include sports that have at least 1 registration across all blocks
    const activeSports = SPORTS.filter(s => BLOCKS.some(b => tally[b][s.name] > 0));

    // X-axis = blocks, each dataset = one sport (stacked)
    const sportColors = [
      '#0080ff','#ff6a00','#00e5a0','#c84bff','#f1c40f',
      '#ff4d6d','#40aaff','#ff9a3c','#00cfb4','#a78bfa',
      '#fb923c','#34d399'
    ];

    const labels   = BLOCKS.map(b => 'Block ' + b);
    const datasets = activeSports.map((s, i) => ({
      label: s.emoji + ' ' + s.name,
      data: BLOCKS.map(b => tally[b][s.name]),
      backgroundColor: sportColors[i % sportColors.length],
      borderRadius: 4,
      borderSkipped: false,
    }));

    // build legend (one entry per active sport)
    const legendEl = document.getElementById('graph-legend');
    legendEl.innerHTML = activeSports.map((s, i) =>
      `<span class="legend-dot" style="background:${sportColors[i % sportColors.length]}"></span>` +
      `<span class="legend-label">${s.emoji} ${s.name}</span>`
    ).join('');

    if (blockChart) blockChart.destroy();

    document.querySelector('.graph-wrap').style.height = '340px';
    const ctx = document.getElementById('block-chart').getContext('2d');

    blockChart = new Chart(ctx, {
      type: 'bar',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: item => ` ${item.dataset.label}: ${item.raw} registrations`,
            }
          }
        },
        scales: {
          x: {
            stacked: true,
            ticks: { color: '#e8f3ff', font: { family: 'Outfit', size: 13 } },
            grid:  { display: false },
            border:{ display: false },
          },
          y: {
            stacked: true,
            ticks: { color: '#7aaccc', font: { family: 'Outfit' }, stepSize: 1 },
            grid:  { color: 'rgba(0,140,255,0.08)' },
            border:{ color: 'rgba(0,140,255,0.15)' },
          }
        }
      }
    });
  } catch (err) {
    console.error(err);
    showToast('Could not load graph data.', true);
  } finally {
    showLoading(false);
  }
}

// ── Dashboard ──
async function loadDashboard() {
  // Fetch graph visibility settings from Firestore
  try {
    const gvSnap = await getDoc(doc(db, 'config', 'dashboardSettings'));
    if (gvSnap.exists()) {
      const d = gvSnap.data();
      graphVisibility.showBlockGraph = d.showBlockGraph !== false;
      graphVisibility.showSportGraph = d.showSportGraph !== false;
      graphVisibility.showQuizTab    = d.showQuizTab !== false;
    } else {
      graphVisibility = { showBlockGraph: true, showSportGraph: true, showQuizTab: true };
    }
  } catch (e) {
    graphVisibility = { showBlockGraph: true, showSportGraph: true, showQuizTab: true };
  }

  // PIC / Admin personalised greeting
  const greetEl   = document.getElementById('dash-pic-greeting');
  const firstName = userProfile.name.split(' ')[0];
  const picSports = userProfile.picSports || [];
  const isPic     = (userProfile.role === 'pic' || isAdmin()) && picSports.length > 0;

  if (isPic) {
    greetEl.innerHTML = `
      <div class="dash-pic-banner">
        <div class="dash-pic-hello">Hi, ${firstName}! 👋</div>
        <div class="dash-pic-label">You are coordinating</div>
        <div class="dash-pic-sports">
          ${picSports.map(s => {
            const sport = SPORTS.find(x => x.name === s);
            return `<span class="dash-pic-chip">${sport ? sport.emoji : '🏆'} ${s}</span>`;
          }).join('')}
        </div>
      </div>`;
  } else {
    greetEl.innerHTML = '';
  }

  // Inject refresh button into header (once)
  const dashHeader = document.querySelector('#screen-dashboard .dash-header');
  if (dashHeader && !document.getElementById('dash-refresh-btn')) {
    const refreshBtn = document.createElement('button');
    refreshBtn.id        = 'dash-refresh-btn';
    refreshBtn.title     = 'Refresh data';
    refreshBtn.innerHTML = '🔄';
    Object.assign(refreshBtn.style, {
      position: 'absolute', top: '14px', right: '16px',
      background: 'none', border: 'none', fontSize: '20px',
      cursor: 'pointer', opacity: '0.75', lineHeight: '1'
    });
    dashHeader.style.position = 'relative';
    refreshBtn.addEventListener('click', () => {
      dashboardCache     = null;
      dashboardCacheTime = 0;
      loadDashboard();
    });
    dashHeader.appendChild(refreshBtn);
  }

  // Inject cache-status element below stats (once)
  if (!document.getElementById('dash-cache-status')) {
    const statsEl = document.querySelector('#screen-dashboard .dash-stats');
    if (statsEl) {
      const statusEl = document.createElement('div');
      statusEl.id = 'dash-cache-status';
      Object.assign(statusEl.style, {
        textAlign: 'center', fontSize: '11px',
        color: 'rgba(255,255,255,0.4)', marginBottom: '4px'
      });
      statsEl.insertAdjacentElement('afterend', statusEl);
    }
  }

  const chartEl      = document.getElementById('dash-chart');
  const sportChartEl = document.getElementById('dash-sport-chart');

  if (isAdmin()) {
    // ── Admin path: fetch all docs, cache for 5 minutes ──
    const now = Date.now();
    if (dashboardCache && (now - dashboardCacheTime) < DASHBOARD_CACHE_DURATION) {
      renderDashboardFromData(dashboardCache, 'cached');
      return;
    }
    chartEl.innerHTML      = '<p class="dash-loading">Loading...</p>';
    sportChartEl.innerHTML = '';
    document.getElementById('dash-total').textContent  = '—';
    document.getElementById('dash-blocks').textContent = '—';
    document.getElementById('dash-sports').textContent = '—';
    try {
      const snap = await getDocs(collection(db, 'registrations'));
      const docs = snap.docs.map(d => d.data());
      dashboardCache     = docs;
      dashboardCacheTime = Date.now();
      renderDashboardFromData(docs, 'live');
    } catch (err) {
      console.error(err);
      chartEl.innerHTML = '<div class="empty-state">Could not load data. Try again later.</div>';
    }
  } else {
    // ── Participant / PIC path: 1 read from summary doc ──
    chartEl.innerHTML      = '<p class="dash-loading">Loading...</p>';
    sportChartEl.innerHTML = '';
    document.getElementById('dash-total').textContent  = '—';
    document.getElementById('dash-blocks').textContent = '—';
    document.getElementById('dash-sports').textContent = '—';
    try {
      const summarySnap = await getDoc(doc(db, 'config', 'registrationSummary'));
      renderDashboardFromSummary(summarySnap.exists() ? summarySnap.data() : null);
    } catch (err) {
      console.error(err);
      chartEl.innerHTML = '<div class="empty-state">Could not load data. Try again later.</div>';
    }
  }
}

function renderDashboardFromData(docs, source) {
  const chartEl      = document.getElementById('dash-chart');
  const sportChartEl = document.getElementById('dash-sport-chart');

  // Update cache / live status indicator
  const statusEl = document.getElementById('dash-cache-status');
  if (statusEl) {
    const style = 'text-align:center;font-size:11px;color:var(--text3);margin-bottom:4px;font-style:italic';
    statusEl.style.cssText = style;
    if (source === 'cached' && dashboardCacheTime) {
      const minsRemaining = Math.max(1, Math.ceil((DASHBOARD_CACHE_DURATION - (Date.now() - dashboardCacheTime)) / 60000));
      statusEl.innerHTML = `📊 Cached · Refreshes in ${minsRemaining} min${minsRemaining !== 1 ? 's' : ''} <button onclick="dashboardCache=null;dashboardCacheTime=0;loadDashboard()" title="Refresh now" style="background:none;border:none;cursor:pointer;font-size:13px;padding:0 2px;opacity:0.7;vertical-align:middle">🔄</button>`;
    } else {
      statusEl.textContent = '📊 Live data · Just loaded';
    }
  }

  if (docs.length === 0) {
    document.getElementById('dash-total').textContent  = '0';
    document.getElementById('dash-blocks').textContent = '0';
    document.getElementById('dash-sports').textContent = '0';
    chartEl.innerHTML = '<div class="empty-state">No registrations yet. Go pick a sport!</div>';
    return;
  }

  // Extract block — flat is stored as "A-1104"
  function extractBlock(flat) {
    if (!flat) return '?';
    const first = flat.charAt(0).toUpperCase();
    return (first >= 'A' && first <= 'Z') ? first : '?';
  }

  const blockCounts = {};
  const sportCounts = {};
  docs.forEach(d => {
    const b = extractBlock(d.flat);
    blockCounts[b] = (blockCounts[b] || 0) + 1;
    const s = d.sport || 'Unknown';
    sportCounts[s] = (sportCounts[s] || 0) + 1;
  });

  const validBlocks = Object.keys(blockCounts).filter(b => b !== '?');
  document.getElementById('dash-total').textContent  = docs.length;
  document.getElementById('dash-blocks').textContent = validBlocks.length;
  document.getElementById('dash-sports').textContent = Object.keys(sportCounts).length;

  // Block chart
  const sortedBlocks = Object.entries(blockCounts)
    .filter(([b]) => b !== '?')
    .sort(([a], [b]) => a.localeCompare(b));
  const maxBlock = Math.max(...sortedBlocks.map(([, c]) => c), 1);
  chartEl.innerHTML = sortedBlocks.map(([block, count]) => {
    const pct = ((count / maxBlock) * 100).toFixed(1);
    return `<div class="chart-row">
      <div class="chart-label">Block ${block}</div>
      <div class="chart-track"><div class="chart-bar" style="width:0%" data-w="${pct}%"></div></div>
      <div class="chart-count">${count}</div>
    </div>`;
  }).join('');

  // Sport chart
  const sortedSports = Object.entries(sportCounts).sort(([, a], [, b]) => b - a);
  const maxSport = Math.max(...sortedSports.map(([, c]) => c), 1);
  sportChartEl.innerHTML = sortedSports.map(([sport, count]) => {
    const pct = ((count / maxSport) * 100).toFixed(1);
    return `<div class="chart-row">
      <div class="chart-label">${sport}</div>
      <div class="chart-track"><div class="chart-bar" style="width:0%" data-w="${pct}%"></div></div>
      <div class="chart-count">${count}</div>
    </div>`;
  }).join('');

  // Apply graph visibility (admin-controlled)
  const blockVisible = graphVisibility.showBlockGraph;
  const sportVisible = graphVisibility.showSportGraph;
  document.getElementById('dash-block-title').style.display = blockVisible ? '' : 'none';
  document.getElementById('dash-chart').style.display        = blockVisible ? '' : 'none';
  document.getElementById('dash-sport-title').style.display  = sportVisible ? '' : 'none';
  document.getElementById('dash-sport-chart').style.display  = sportVisible ? '' : 'none';

  // Animate bars after paint
  requestAnimationFrame(() => {
    setTimeout(() => {
      document.querySelectorAll('.chart-bar').forEach(bar => {
        bar.style.width = bar.dataset.w;
      });
    }, 50);
  });

  // Role-based participant detail sections
  const oldRoleSection = document.getElementById('dash-role-section');
  if (oldRoleSection) oldRoleSection.remove();

  const showPic       = userProfile.role === 'pic' && (userProfile.picSports || []).length > 0;
  const showAdminData = isAdmin();
  if (showPic || showAdminData) {
    const roleSection = document.createElement('div');
    roleSection.id = 'dash-role-section';
    document.querySelector('#screen-dashboard .screen-inner').appendChild(roleSection);
    if (showPic)       renderPicSection(roleSection, userProfile.picSports, docs);
    if (showAdminData) renderAdminDataSection(roleSection, docs);
  }
}

// ── Dashboard renderer for participant / PIC view (reads from summary doc) ──
function renderDashboardFromSummary(summary) {
  const chartEl      = document.getElementById('dash-chart');
  const sportChartEl = document.getElementById('dash-sport-chart');
  const statusEl     = document.getElementById('dash-cache-status');
  const styleStr     = 'text-align:center;font-size:11px;color:var(--text3);margin-bottom:4px;font-style:italic';

  if (!summary || !summary.totalRegistrations) {
    document.getElementById('dash-total').textContent  = '0';
    document.getElementById('dash-blocks').textContent = '0';
    document.getElementById('dash-sports').textContent = '0';
    chartEl.innerHTML      = '<div class="empty-state">No registrations yet. Go pick a sport!</div>';
    sportChartEl.innerHTML = '';
    if (statusEl) { statusEl.style.cssText = styleStr; statusEl.textContent = '📊 No registrations yet'; }
    return;
  }

  // Status indicator — show time since last summary update
  if (statusEl) {
    statusEl.style.cssText = styleStr;
    let lastStr = 'recently';
    if (summary.lastUpdated && summary.lastUpdated.toDate) {
      const mins = Math.floor((Date.now() - summary.lastUpdated.toDate().getTime()) / 60000);
      lastStr = mins === 0 ? 'just now' : `${mins} min${mins !== 1 ? 's' : ''} ago`;
    }
    statusEl.textContent = `📊 Live counts · Updated ${lastStr}`;
  }

  const byBlock  = summary.byBlock  || {};
  const bySport  = summary.bySport  || {};

  const validBlocks = Object.keys(byBlock).filter(b => b !== 'Unknown' && b !== '?');
  document.getElementById('dash-total').textContent  = summary.totalRegistrations;
  document.getElementById('dash-blocks').textContent = validBlocks.length;
  document.getElementById('dash-sports').textContent = Object.keys(bySport).length;

  // Block chart
  const sortedBlocks = Object.entries(byBlock)
    .filter(([b]) => b !== 'Unknown' && b !== '?')
    .sort(([a], [b]) => a.localeCompare(b));
  const maxBlock = Math.max(...sortedBlocks.map(([, c]) => c), 1);
  chartEl.innerHTML = sortedBlocks.map(([block, count]) => {
    const pct = ((count / maxBlock) * 100).toFixed(1);
    return `<div class="chart-row">
      <div class="chart-label">Block ${block}</div>
      <div class="chart-track"><div class="chart-bar" style="width:0%" data-w="${pct}%"></div></div>
      <div class="chart-count">${count}</div>
    </div>`;
  }).join('');

  // Sport chart
  const sortedSports = Object.entries(bySport).sort(([, a], [, b]) => b - a);
  const maxSport = Math.max(...sortedSports.map(([, c]) => c), 1);
  sportChartEl.innerHTML = sortedSports.map(([sport, count]) => {
    const pct = ((count / maxSport) * 100).toFixed(1);
    return `<div class="chart-row">
      <div class="chart-label">${sport}</div>
      <div class="chart-track"><div class="chart-bar" style="width:0%" data-w="${pct}%"></div></div>
      <div class="chart-count">${count}</div>
    </div>`;
  }).join('');

  // Apply graph visibility (admin-controlled)
  const blockVisible = graphVisibility.showBlockGraph;
  const sportVisible = graphVisibility.showSportGraph;
  document.getElementById('dash-block-title').style.display = blockVisible ? '' : 'none';
  document.getElementById('dash-chart').style.display        = blockVisible ? '' : 'none';
  document.getElementById('dash-sport-title').style.display  = sportVisible ? '' : 'none';
  document.getElementById('dash-sport-chart').style.display  = sportVisible ? '' : 'none';

  // Animate bars after paint
  requestAnimationFrame(() => {
    setTimeout(() => {
      document.querySelectorAll('.chart-bar').forEach(bar => {
        bar.style.width = bar.dataset.w;
      });
    }, 50);
  });

  // PIC section — show sport buttons with counts from summary
  const oldRoleSection = document.getElementById('dash-role-section');
  if (oldRoleSection) oldRoleSection.remove();

  const showPic = userProfile.role === 'pic' && (userProfile.picSports || []).length > 0;
  if (showPic) {
    const roleSection = document.createElement('div');
    roleSection.id = 'dash-role-section';
    document.querySelector('#screen-dashboard .screen-inner').appendChild(roleSection);
    renderPicSection(roleSection, userProfile.picSports, null, summary);
  }
}

// ── PIC participant detail section — sport selection buttons ──
function renderPicSection(container, sports, allDocs, summary) {
  const wrap = document.createElement('div');
  wrap.innerHTML = '<div class="admin-section-title teal">🟢 List of Sports I am Coordinating</div>';
  sports.forEach(sportName => {
    const sportObj  = SPORTS.find(s => s.name === sportName);
    const iconHTML  = sportObj && sportObj.image
      ? `<img src="${sportObj.image}" style="width:32px;height:32px;object-fit:contain" alt="${sportName}">`
      : (sportObj ? sportObj.emoji : '🏆');
    const count = summary
      ? ((summary.bySport || {})[sportName] || 0)
      : allDocs.filter(d => d.sport === sportName).length;
    const btn      = document.createElement('button');
    btn.className  = 'pic-sport-btn';
    btn.innerHTML  = `
      <span class="pic-sport-btn-emoji">${iconHTML}</span>
      <div class="pic-sport-btn-info">
        <div class="pic-sport-btn-title">List of participants for ${sportName}</div>
        <div class="pic-sport-btn-count">${count} registration${count !== 1 ? 's' : ''}</div>
      </div>
      <span class="pic-sport-btn-arrow">→</span>`;
    btn.addEventListener('click', () => openPicSportDetail(sportName));
    wrap.appendChild(btn);
  });
  container.appendChild(wrap);
}

// ── PIC sport detail screen ──
async function openPicSportDetail(sportName) {
  const sportObj      = SPORTS.find(s => s.name === sportName);
  const headerIconHTML = sportObj && sportObj.image
    ? `<img src="${sportObj.image}" style="width:28px;height:28px;object-fit:contain;vertical-align:middle" alt="${sportName}">`
    : (sportObj ? sportObj.emoji : '🏆');

  document.getElementById('pic-sport-icon').innerHTML         = headerIconHTML;
  document.getElementById('pic-sport-screen-name').textContent = sportName;

  showScreen('screen-pic-sport');

  const listEl = document.getElementById('pic-sport-list');
  listEl.innerHTML = '<div class="empty-state">Loading…</div>';

  // Reset filter state for new sport
  currentPICSport      = sportName;
  allParticipants      = [];
  filteredParticipants = [];
  activeFilters        = { gender: null, ageCategory: null, grade: null, subcategory: null };

  showLoading(true);
  try {
    const snap = await getDocs(
      query(collection(db, 'registrations'), where('sport', '==', sportName))
    );
    const regs = snap.docs.map(d => d.data());

    if (!regs.length) {
      listEl.innerHTML = '<div class="empty-state">No registrations yet for this sport.</div>';
      return;
    }

    allParticipants      = regs;
    filteredParticipants = regs;

    // Show/hide subcategory filter group
    const hasSubcats = regs.some(p => p.subcategory);
    const subcatGroup = document.getElementById('subcategory-filter-group');
    if (subcatGroup) subcatGroup.style.display = hasSubcats ? 'block' : 'none';

    // Show stats row + filter toggle
    const statsRow = document.getElementById('pic-stats-row');
    const filterBtn = document.getElementById('filter-toggle-btn');
    if (statsRow)  statsRow.style.display  = 'grid';
    if (filterBtn) filterBtn.style.display = 'flex';

    // Reset filter panel to closed
    const filterPanel = document.getElementById('filter-panel');
    const filterArrow = document.getElementById('filter-toggle-arrow');
    if (filterPanel) filterPanel.style.display = 'none';
    if (filterArrow) filterArrow.textContent   = '▼';

    buildGradeChips();
    updateFilterChipStyles();
    updateStats(allParticipants);
    renderDownloadButtons();
    updateActiveFilterSummary();
    renderParticipantCards(allParticipants);

  } catch (err) {
    console.error(err);
    listEl.innerHTML = '<div class="empty-state">Could not load data. Try again.</div>';
  } finally {
    showLoading(false);
  }
}

function renderParticipantCards(list) {
  const listEl = document.getElementById('pic-sport-list');
  if (!listEl) return;
  if (!list.length) {
    listEl.innerHTML = '<div class="empty-state">No participants match the current filters.</div>';
    return;
  }
  listEl.innerHTML = list.map(d => `
    <div class="reg-detail-card${d.isPartnerEntry ? ' partner-entry-card' : ''}">
      <div class="reg-detail-name">${d.name || '—'}${d.isPartnerEntry ? ' <span class="reg-detail-tag partner-entry" style="font-size:10px;vertical-align:middle">👥 Partner Entry</span>' : ''}</div>
      <div class="reg-detail-tags">
        ${d.isPartnerEntry
          ? `<span class="reg-detail-tag partner-entry">Added by ${d.partnerOfName || '—'}</span>`
          : `<span class="reg-detail-tag">${d.ageCategory || (d.age ? 'Age ' + d.age : '—')}</span>`}
        ${!d.isPartnerEntry && d.grade ? `<span class="reg-detail-tag">${d.grade}</span>` : ''}
        ${d.gender ? `<span class="reg-detail-tag">${d.gender}</span>` : ''}
        <span class="reg-detail-tag">Flat ${d.flat || '—'}</span>
        <span class="reg-detail-tag phone">${d.phone ? makeWhatsAppLink(d.phone, d.phone, 'small') : '—'}</span>
        ${d.subcategory ? `<span class="reg-detail-tag">${d.subcategory}</span>` : ''}
        ${d.regtype     ? `<span class="reg-detail-tag">${d.regtype}</span>`     : ''}
        ${d.actType        ? `<span class="reg-detail-tag">🎤 ${d.actType}</span>` : ''}
        ${d.openMicCategory ? `<span class="reg-detail-tag">${d.openMicCategory}</span>` : ''}
        ${d.withInstrument  ? `<span class="reg-detail-tag">🎵 ${d.withInstrument === 'Yes' ? (d.instrumentName || 'With Instrument') : 'No Instrument'}</span>` : ''}
      </div>
    </div>`).join('');
}

// ── Admin full data section — sport selection buttons ──
function renderAdminDataSection(container, allDocs) {
  const wrap = document.createElement('div');
  wrap.innerHTML = '<div class="admin-section-title gold">👑 All Sports — Full Registration Data</div>';
  const bySport = {};
  allDocs.forEach(d => {
    if (!bySport[d.sport]) bySport[d.sport] = [];
    bySport[d.sport].push(d);
  });
  let hasData = false;
  SPORTS.forEach(sportObj => {
    const count = (bySport[sportObj.name] || []).length;
    if (!count) return;
    hasData   = true;
    const btn = document.createElement('button');
    const adminIconHTML = sportObj.image
      ? `<img src="${sportObj.image}" style="width:32px;height:32px;object-fit:contain" alt="${sportObj.name}">`
      : sportObj.emoji;
    btn.className = 'pic-sport-btn admin-sport-btn';
    btn.innerHTML = `
      <span class="pic-sport-btn-emoji">${adminIconHTML}</span>
      <div class="pic-sport-btn-info">
        <div class="pic-sport-btn-title">List of participants for ${sportObj.name}</div>
        <div class="pic-sport-btn-count admin-count">${count} registration${count !== 1 ? 's' : ''}</div>
      </div>
      <span class="pic-sport-btn-arrow">→</span>`;
    btn.addEventListener('click', () => openPicSportDetail(sportObj.name));
    wrap.appendChild(btn);
  });
  if (!hasData) wrap.innerHTML += '<p class="dash-loading">No registrations yet</p>';
  container.appendChild(wrap);
}

// ── Rebuild registration summary from all existing docs ──
async function rebuildSummaryFromScratch() {
  showLoading(true);
  try {
    showToast('Rebuilding summary…');
    const snap = await getDocs(collection(db, 'registrations'));

    const summary = { totalRegistrations: 0, byBlock: {}, bySport: {}, lastUpdated: serverTimestamp() };

    snap.forEach(docSnap => {
      const data = docSnap.data();
      summary.totalRegistrations++;

      // Handle both "A-1104" (primary) and "Block B, Flat 1104" (partner) flat formats
      const flat = data.flat || '';
      const blockMatch = flat.match(/^([A-Fa-f])-/) || flat.match(/Block\s*([A-Fa-f])/i);
      const blockKey = blockMatch
        ? blockMatch[1].toUpperCase()
        : (data.block && /^[A-Fa-f]$/i.test(data.block) ? data.block.toUpperCase() : 'Unknown');
      summary.byBlock[blockKey] = (summary.byBlock[blockKey] || 0) + 1;

      const sport = data.sport || 'Unknown';
      summary.bySport[sport] = (summary.bySport[sport] || 0) + 1;
    });

    await setDoc(doc(db, 'config', 'registrationSummary'), summary);

    // Clear dashboard cache so admin view also reloads fresh
    dashboardCache     = null;
    dashboardCacheTime = 0;

    showToast(`Summary rebuilt — ${summary.totalRegistrations} registrations counted`);
    loadDashboard();
  } catch(err) {
    console.error(err);
    showToast('Rebuild failed: ' + err.message, true);
  } finally {
    showLoading(false);
  }
}

// ── Admin Maintenance section — injected dynamically (no HTML changes needed) ──
function setupAdminMaintenanceSection() {
  if (!isAdmin()) return;
  if (document.getElementById('admin-maintenance-section')) return;

  const grid = document.querySelector('#screen-admin .admin-control-grid');
  if (!grid) return;

  const section = document.createElement('div');
  section.id = 'admin-maintenance-section';
  section.style.cssText = 'padding:4px 16px 20px';
  section.innerHTML = `
    <div class="admin-section-title gold" style="margin-bottom:12px">🔧 Maintenance</div>
    <button class="btn-secondary" onclick="rebuildSummaryFromScratch()" style="width:100%;text-align:center">
      🔄 Rebuild Registration Summary
    </button>
    <p style="font-size:11px;color:var(--text3);margin-top:8px;text-align:center">
      Run once after deploying to sync existing registrations
    </p>`;
  grid.insertAdjacentElement('afterend', section);
}

// ── Navigation ──
const TAB_SCREENS = ['screen-sports', 'screen-dashboard', 'screen-registrations', 'screen-admin', 'screen-quiz'];

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0, 0);
  document.getElementById('tab-bar').style.display =
    TAB_SCREENS.includes(id) ? 'flex' : 'none';
  if (id === 'screen-registrations') loadRegistrations();
  if (id === 'screen-dashboard')     loadDashboard();
  if (id === 'screen-graph')         loadBlockGraph();
  if (id === 'screen-sports')        loadAnnouncementBanner();
  if (id === 'screen-quiz')          loadQuizScreen();
  if (id === 'screen-admin')         setupAdminMaintenanceSection();
}

function switchTab(tabName) {
  const screenMap = {
    home:      'screen-sports',
    dashboard: 'screen-dashboard',
    mylist:    'screen-registrations',
    admin:     'screen-admin',
    quiz:      'screen-quiz'
  };
  showScreen(screenMap[tabName]);
  document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
  const activeEl = document.querySelector(`.tab-item[data-tab="${tabName}"]`);
  if (activeEl) activeEl.classList.add('active');
}

// ── Delete registration ──
function openDeleteModal(id, sportName) {
  deleteTargetId   = id;
  deleteTargetName = sportName;
  document.getElementById('modal-sport-name').textContent = sportName;
  document.getElementById('delete-reason').value = '';
  document.getElementById('delete-modal').classList.remove('hidden');
}

function closeDeleteModal() {
  document.getElementById('delete-modal').classList.add('hidden');
  deleteTargetId   = null;
  deleteTargetName = null;
}

async function confirmDelete() {
  const reason = document.getElementById('delete-reason').value.trim();
  if (!reason) return showToast('Please enter a reason for deletion', true);

  showLoading(true);
  try {
    await deleteDoc(doc(db, 'registrations', deleteTargetId));
    closeDeleteModal();
    showToast(`"${deleteTargetName}" registration deleted successfully!`);
    updateMyListBadge();
    loadRegistrations();
  } catch (err) {
    console.error(err);
    showToast('Could not delete. Please try again.', true);
  } finally {
    showLoading(false);
  }
}

// ── Admin Control Centre navigation ──
function openAdminSection(section) {
  const screenMap = {
    'manage-sports':     'screen-admin-manage-sports',
    'sport-details':     'screen-admin-sport-details',
    'announcements':     'screen-admin-announcements',
    'export-data':       'screen-admin-export-data',
    'all-registrations': 'screen-admin-all-registrations',
    'manage-users':      'screen-admin-manage-users',
  };
  const screenId = screenMap[section];
  if (!screenId) return;
  showScreen(screenId); // tab bar hidden automatically (sub-screens not in TAB_SCREENS)
  if (section === 'manage-sports')     loadManageSports();
  if (section === 'sport-details')     loadSportDetailsEdit();
  if (section === 'announcements')     loadAnnouncements();
  if (section === 'export-data')       loadExportData();
  if (section === 'all-registrations') loadAllRegistrations();
  if (section === 'manage-users')      loadAdminPanel();
}

function closeAdminSection() {
  showScreen('screen-admin');
}

// ── Manage Sports (enable / disable registrations) ──
async function loadManageSports() {
  const container = document.getElementById('admin-manage-sports-content');
  container.innerHTML = '<div class="empty-state">Loading…</div>';
  try {
    const snap     = await getDocs(collection(db, 'sportSettings'));
    const settings = {};
    snap.docs.forEach(d => { settings[d.id] = d.data(); });

    // Fetch dashboard graph visibility settings
    let showBlockGraph = true;
    let showSportGraph = true;
    let showQuizTab    = true;
    try {
      const gvSnap = await getDoc(doc(db, 'config', 'dashboardSettings'));
      if (gvSnap.exists()) {
        const d = gvSnap.data();
        showBlockGraph = d.showBlockGraph !== false;
        showSportGraph = d.showSportGraph !== false;
        showQuizTab    = d.showQuizTab !== false;
      }
    } catch (e) { /* keep defaults */ }

    container.innerHTML =
      SPORTS.map(sport => {
        const isOpen = settings[sport.name]?.registrationOpen !== false;
        return `
          <div class="sport-setting-row">
            <span style="font-size:22px">${sport.emoji}</span>
            <div class="sport-setting-info">
              <div class="sport-setting-name">${sport.name}</div>
              <div class="sport-setting-status ${isOpen ? 'open' : 'closed'}" id="status-${sport.name}">
                ${isOpen ? 'Open' : 'Closed'}
              </div>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" ${isOpen ? 'checked' : ''}
                onchange="toggleSportRegistration('${sport.name}', this.checked, this)"/>
              <span class="toggle-slider"></span>
            </label>
          </div>`;
      }).join('') +
      `<div class="admin-section-title" style="margin-top:24px;margin-bottom:4px">📊 Dashboard Graph Visibility</div>
       <div class="sport-setting-row">
         <span style="font-size:22px">📊</span>
         <div class="sport-setting-info">
           <div class="sport-setting-name">Registrations by Block</div>
           <div class="sport-setting-status ${showBlockGraph ? 'open' : 'closed'}" id="status-blockGraph">
             ${showBlockGraph ? 'Visible' : 'Hidden'}
           </div>
         </div>
         <label class="toggle-switch">
           <input type="checkbox" ${showBlockGraph ? 'checked' : ''}
             onchange="toggleDashboardGraph('showBlockGraph', this.checked, this)"/>
           <span class="toggle-slider"></span>
         </label>
       </div>
       <div class="sport-setting-row">
         <span style="font-size:22px">🏅</span>
         <div class="sport-setting-info">
           <div class="sport-setting-name">Registrations by Sport</div>
           <div class="sport-setting-status ${showSportGraph ? 'open' : 'closed'}" id="status-sportGraph">
             ${showSportGraph ? 'Visible' : 'Hidden'}
           </div>
         </div>
         <label class="toggle-switch">
           <input type="checkbox" ${showSportGraph ? 'checked' : ''}
             onchange="toggleDashboardGraph('showSportGraph', this.checked, this)"/>
           <span class="toggle-slider"></span>
         </label>
       </div>
       <div class="sport-setting-row">
         <span style="font-size:22px">🧠</span>
         <div class="sport-setting-info">
           <div class="sport-setting-name">Sports Quiz Tab</div>
           <div class="sport-setting-status ${showQuizTab ? 'open' : 'closed'}" id="status-quizTab">
             ${showQuizTab ? 'Visible' : 'Hidden'}
           </div>
         </div>
         <label class="toggle-switch">
           <input type="checkbox" ${showQuizTab ? 'checked' : ''}
             onchange="toggleDashboardGraph('showQuizTab', this.checked, this)"/>
           <span class="toggle-slider"></span>
         </label>
       </div>`;
  } catch (err) {
    console.error(err);
    container.innerHTML = '<div class="empty-state">Could not load sport settings.</div>';
  }
}

async function toggleSportRegistration(sportName, newValue, checkbox) {
  // Optimistic UI update
  const statusEl = document.getElementById(`status-${sportName}`);
  if (statusEl) {
    statusEl.textContent = newValue ? 'Open' : 'Closed';
    statusEl.className   = `sport-setting-status ${newValue ? 'open' : 'closed'}`;
  }
  try {
    await setDoc(doc(db, 'sportSettings', sportName), { registrationOpen: newValue }, { merge: true });
    showToast(`${sportName} registration ${newValue ? 'opened' : 'closed'}`);
  } catch (err) {
    console.error(err);
    showToast('Could not update. Try again.', true);
    if (checkbox) checkbox.checked = !newValue; // revert toggle
  }
}

async function toggleDashboardGraph(field, newValue, checkbox) {
  const labels   = { showBlockGraph: 'Block Graph', showSportGraph: 'Sport Graph', showQuizTab: 'Quiz Tab' };
  const statusIds = { showBlockGraph: 'status-blockGraph', showSportGraph: 'status-sportGraph', showQuizTab: 'status-quizTab' };
  const statusEl = document.getElementById(statusIds[field]);
  if (statusEl) {
    statusEl.textContent = newValue ? 'Visible' : 'Hidden';
    statusEl.className   = `sport-setting-status ${newValue ? 'open' : 'closed'}`;
  }
  try {
    await setDoc(doc(db, 'config', 'dashboardSettings'), { [field]: newValue }, { merge: true });
    graphVisibility[field] = newValue;
    if (field === 'showQuizTab') renderTabBar();
    showToast(`${labels[field]} ${newValue ? 'shown' : 'hidden'}`);
  } catch (err) {
    console.error(err);
    showToast('Could not update. Try again.', true);
    if (checkbox) checkbox.checked = !newValue;
  }
}

// ── Edit Sport Details ──
async function loadSportDetailsEdit() {
  const container = document.getElementById('admin-sport-details-content');
  container.innerHTML = '<div class="empty-state">Loading…</div>';
  try {
    const snap     = await getDocs(collection(db, 'sportSettings'));
    const settings = {};
    snap.docs.forEach(d => { settings[d.id] = d.data(); });

    container.innerHTML = SPORTS.map(sport => {
      const s        = settings[sport.name] || {};
      const slug     = sport.name.toLowerCase().replace(/'/g, '').replace(/\s+/g, '-');
      const safeName = sport.name.replace(/'/g, "\\'");
      const datetime = s.datetime  || sport.datetime;
      const venue    = s.venue     || sport.venue;
      const contact  = s.contact   || sport.contact;
      const ageGroup = s.ageGroup  || sport.ageGroup;
      const rules    = (s.rules    || sport.rules).join('\n');
      return `
        <div class="sport-edit-card">
          <div class="sport-edit-header" onclick="toggleSportEditCard('${slug}')">
            <div style="display:flex;align-items:center;gap:10px">
              <span style="font-size:22px">${sport.emoji}</span>
              <span style="font-size:14px;font-weight:600;color:var(--text)">${sport.name}</span>
            </div>
            <span style="color:var(--text3);font-size:20px;line-height:1">›</span>
          </div>
          <div class="sport-edit-body" id="edit-body-${slug}">
            <div class="edit-field-label">Date &amp; Time</div>
            <input class="edit-field-input" id="edit-datetime-${slug}" type="text" value="${datetime}"/>
            <div class="edit-field-label">Venue</div>
            <input class="edit-field-input" id="edit-venue-${slug}" type="text" value="${venue}"/>
            <div class="edit-field-label">Contact Person</div>
            <input class="edit-field-input" id="edit-contact-${slug}" type="text" value="${contact}"/>
            <div class="edit-field-label">Age Group</div>
            <input class="edit-field-input" id="edit-agegroup-${slug}" type="text" value="${ageGroup}"/>
            <div class="edit-field-label">Rules (one per line)</div>
            <textarea class="edit-field-input" id="edit-rules-${slug}">${rules}</textarea>
            <p style="font-size:11px;color:var(--text3);margin-top:4px">Enter each rule on a new line</p>
            <div class="edit-actions">
              <button class="btn-save" onclick="saveSportDetails('${safeName}')">Save Changes</button>
              <button class="btn-cancel" onclick="toggleSportEditCard('${slug}')">Cancel</button>
            </div>
          </div>
        </div>`;
    }).join('');
  } catch (err) {
    console.error(err);
    container.innerHTML = '<div class="empty-state">Could not load sport settings.</div>';
  }
}

function toggleSportEditCard(slug) {
  document.getElementById(`edit-body-${slug}`).classList.toggle('open');
}

async function saveSportDetails(sportName) {
  const slug     = sportName.toLowerCase().replace(/'/g, '').replace(/\s+/g, '-');
  const datetime = document.getElementById(`edit-datetime-${slug}`).value.trim();
  const venue    = document.getElementById(`edit-venue-${slug}`).value.trim();
  const contact  = document.getElementById(`edit-contact-${slug}`).value.trim();
  const ageGroup = document.getElementById(`edit-agegroup-${slug}`).value.trim();
  const rules    = document.getElementById(`edit-rules-${slug}`).value
    .split('\n').map(r => r.trim()).filter(r => r.length > 0);

  showLoading(true);
  try {
    await setDoc(doc(db, 'sportSettings', sportName), { datetime, venue, contact, ageGroup, rules }, { merge: true });
    showToast('Sport details updated');
    toggleSportEditCard(slug);
  } catch (err) {
    console.error(err);
    showToast('Could not save. Try again.', true);
  } finally {
    showLoading(false);
  }
}

// ── Announcements ──
async function loadAnnouncements() {
  const container = document.getElementById('admin-announcements-content');
  container.innerHTML = '<div class="empty-state">Loading…</div>';
  try {
    const annoDoc  = await getDoc(doc(db, 'config', 'announcement'));
    const current  = annoDoc.exists() && annoDoc.data().active ? annoDoc.data().message : null;
    container.innerHTML = `
      <div class="admin-section-title gold">Current Announcement</div>
      <div style="margin-bottom:20px">
        ${current
          ? `<div class="announcement-banner" style="margin:0 0 4px;display:flex">
               <span class="announcement-icon">📢</span>
               <span class="announcement-text">${current}</span>
             </div>`
          : '<p class="dash-loading">No active announcement</p>'}
      </div>
      <div class="admin-section-title gold">Post New Announcement</div>
      <div class="form-group" style="margin-bottom:12px">
        <textarea id="announcement-text" class="edit-field-input" rows="4"
          placeholder="Type your announcement here…">${current || ''}</textarea>
      </div>
      <button class="btn-primary" onclick="postAnnouncement()" style="margin-bottom:10px">
        <span>📢 Post Announcement</span>
      </button>
      <button class="btn-secondary" onclick="clearAnnouncement()">Clear Announcement</button>`;
  } catch (err) {
    console.error(err);
    container.innerHTML = '<div class="empty-state">Could not load announcements.</div>';
  }
}

async function postAnnouncement() {
  const msg = (document.getElementById('announcement-text').value || '').trim();
  if (!msg) return showToast('Please enter a message', true);
  showLoading(true);
  try {
    await setDoc(doc(db, 'config', 'announcement'), { message: msg, active: true, createdAt: serverTimestamp() });
    showToast('Announcement posted!');
    loadAnnouncements();
  } catch (err) {
    console.error(err);
    showToast('Could not post. Try again.', true);
  } finally { showLoading(false); }
}

async function clearAnnouncement() {
  showLoading(true);
  try {
    await setDoc(doc(db, 'config', 'announcement'), { active: false }, { merge: true });
    showToast('Announcement cleared');
    loadAnnouncements();
  } catch (err) {
    console.error(err);
    showToast('Could not clear. Try again.', true);
  } finally { showLoading(false); }
}

async function loadAnnouncementBanner() {
  const banner = document.getElementById('announcement-banner');
  if (!banner) return;
  try {
    const annoDoc = await getDoc(doc(db, 'config', 'announcement'));
    if (annoDoc.exists() && annoDoc.data().active && annoDoc.data().message) {
      document.getElementById('announcement-text-display').textContent = annoDoc.data().message;
      banner.style.display = 'flex';
    } else {
      banner.style.display = 'none';
    }
  } catch (e) { banner.style.display = 'none'; }
}

// ── Export Data ──
function loadExportData() {
  const container  = document.getElementById('admin-export-data-content');
  const sportOpts  = SPORTS.map(s => `<option value="${s.name}">${s.emoji} ${s.name}</option>`).join('');
  container.innerHTML = `
    <div class="admin-section-title gold">Export All Registrations</div>
    <p class="card-desc" style="margin-bottom:16px">Download every registration as a single CSV file.</p>
    <button class="btn-primary" onclick="exportCSV(null)" style="margin-bottom:28px">
      <span>📥 Download All as CSV</span>
    </button>
    <div class="admin-section-title gold">Export by Sport</div>
    <p class="card-desc" style="margin-bottom:12px">Download registrations for a specific sport.</p>
    <div class="form-group">
      <select id="export-sport-select" class="edit-field-input">${sportOpts}</select>
    </div>
    <button class="btn-primary" onclick="exportCSV(document.getElementById('export-sport-select').value)">
      <span>📥 Download Sport CSV</span>
    </button>`;
}

function escapeCsvVal(val) {
  if (val == null) return '';
  const s = String(val);
  return (s.includes(',') || s.includes('"') || s.includes('\n'))
    ? `"${s.replace(/"/g, '""')}"` : s;
}

function formatTimestamp(ts) {
  if (!ts) return '';
  try {
    const d   = ts.toDate ? ts.toDate() : new Date(ts.seconds * 1000);
    const pad = n => String(n).padStart(2, '0');
    return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch { return ''; }
}

async function exportCSV(sportFilter) {
  showLoading(true);
  try {
    const q    = sportFilter
      ? query(collection(db, 'registrations'), where('sport', '==', sportFilter))
      : collection(db, 'registrations');
    const snap = await getDocs(q);

    if (snap.empty) { showToast('No registrations found', true); return; }

    const headers = ['Sport','Name','Age Category','Grade','Gender','Registrant Type','Phone','Flat',
                     'Subcategory','Partner Name','Partner Phone','Partner Gender','Partner Block','Partner Flat No',
                     'Act Type','Category (Solo/Group)','With Instrument','Instrument Name',
                     'Registered At'];
    const rows = snap.docs.map(d => {
      const r = d.data();
      return [r.sport, r.name, r.ageCategory || '', r.grade || '', r.gender, r.regtype, r.phone, r.flat,
              r.subcategory || '', r.partnerName || '', r.partnerPhone || '',
              r.partnerGender || '', r.partnerBlock || '', r.partnerFlatNum || r.partnerFlat || '',
              r.actType || '', r.openMicCategory || '', r.withInstrument || '', r.instrumentName || '',
              formatTimestamp(r.registeredAt)].map(escapeCsvVal);
    });

    const csv   = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob  = new Blob([csv], { type: 'text/csv' });
    const url   = URL.createObjectURL(blob);
    const today = new Date().toISOString().slice(0, 10);
    const fname = sportFilter
      ? `registrations-${sportFilter.toLowerCase().replace(/\s+/g, '-')}-${today}.csv`
      : `registrations-all-${today}.csv`;
    const a = document.createElement('a');
    a.href = url; a.download = fname;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Downloading ${snap.size} registration${snap.size !== 1 ? 's' : ''}…`);
  } catch (err) {
    console.error(err);
    showToast('Export failed. Try again.', true);
  } finally { showLoading(false); }
}

// ── All Registrations (admin view) ──
let _allRegs = [];

async function loadAllRegistrations() {
  const container = document.getElementById('admin-all-registrations-content');
  container.innerHTML = '<div class="empty-state">Loading…</div>';
  try {
    const snap = await getDocs(collection(db, 'registrations'));
    _allRegs   = snap.docs.map(d => d.data());
    container.innerHTML = `
      <div class="form-group">
        <input type="text" id="all-regs-search" placeholder="Filter sports by name, phone or flat…"
          autocomplete="off" oninput="filterAllRegs()"/>
      </div>
      <p id="all-regs-count" class="dash-loading" style="margin-bottom:12px"></p>
      <div id="all-regs-list"></div>`;
    renderAllRegs(_allRegs);
  } catch (err) {
    console.error(err);
    container.innerHTML = '<div class="empty-state">Could not load registrations.</div>';
  }
}

function filterAllRegs() {
  const q = (document.getElementById('all-regs-search').value || '').trim().toLowerCase();
  renderAllRegs(q
    ? _allRegs.filter(d =>
        (d.name  || '').toLowerCase().includes(q) ||
        (d.phone || '').includes(q) ||
        (d.flat  || '').toLowerCase().includes(q))
    : _allRegs);
}

function renderAllRegs(regs) {
  const countEl = document.getElementById('all-regs-count');
  const listEl  = document.getElementById('all-regs-list');
  if (!countEl || !listEl) return;
  const uniqueSports = new Set(regs.map(r => r.sport)).size;
  countEl.textContent = `${regs.length} registration${regs.length !== 1 ? 's' : ''} across ${uniqueSports} sport${uniqueSports !== 1 ? 's' : ''}`;
  if (!regs.length) {
    listEl.innerHTML = '<div class="empty-state">No registrations found.</div>';
    return;
  }
  const bySport = {};
  regs.forEach(d => {
    if (!bySport[d.sport]) bySport[d.sport] = [];
    bySport[d.sport].push(d);
  });
  listEl.innerHTML = SPORTS
    .filter(s => bySport[s.name])
    .map(s => {
      const iconHTML = s.image
        ? `<img src="${s.image}" style="width:24px;height:24px;object-fit:contain;vertical-align:middle" alt="${s.name}">`
        : s.emoji;
      const count = bySport[s.name].length;
      return `
        <button class="pic-sport-btn admin-sport-btn" style="margin-top:16px"
          onclick="openPicSportDetail('${s.name.replace(/'/g, "\\'")}')">
          <span class="pic-sport-btn-emoji">${iconHTML}</span>
          <div class="pic-sport-btn-info">
            <div class="pic-sport-btn-title">${s.name}</div>
            <div class="pic-sport-btn-count admin-count">${count} registration${count !== 1 ? 's' : ''} — tap to filter &amp; download</div>
          </div>
          <span class="pic-sport-btn-arrow">→</span>
        </button>`;
    })
    .join('');
}

// ── Admin panel ──
let _adminAllUsers = [];

function sortUsersByFlat(users) {
  return [...users].sort((a, b) => {
    const parseFlat = flat => {
      if (!flat) return { block: '\xFF', num: Infinity };
      const m = flat.match(/^([A-Za-z])-(\d+)$/);
      if (!m) return { block: flat.charAt(0).toUpperCase() || '\xFF', num: Infinity };
      return { block: m[1].toUpperCase(), num: parseInt(m[2], 10) };
    };
    const fa = parseFlat(a.flat), fb = parseFlat(b.flat);
    if (fa.block !== fb.block) return fa.block < fb.block ? -1 : 1;
    return fa.num - fb.num;
  });
}

async function loadAdminPanel() {
  const listEl = document.getElementById('admin-user-list');
  listEl.innerHTML = '<div class="empty-state">Loading…</div>';
  document.getElementById('admin-stat-users').textContent = '—';
  document.getElementById('admin-stat-pics').textContent  = '—';
  document.getElementById('admin-stat-regs').textContent  = '—';
  const searchEl = document.getElementById('admin-search');
  if (searchEl) searchEl.value = '';

  try {
    const [usersSnap, regsSnap] = await Promise.all([
      getDocs(collection(db, 'users')),
      getDocs(collection(db, 'registrations'))
    ]);
    _adminAllUsers = sortUsersByFlat(usersSnap.docs.map(d => ({ docId: d.id, ...d.data() })));
    const totalPics = _adminAllUsers.filter(u => u.role === 'pic').length;

    document.getElementById('admin-stat-users').textContent = _adminAllUsers.length;
    document.getElementById('admin-stat-pics').textContent  = totalPics;
    document.getElementById('admin-stat-regs').textContent  = regsSnap.size;
    renderAdminUserList(_adminAllUsers);
  } catch (err) {
    console.error(err);
    listEl.innerHTML = '<div class="empty-state">Could not load users.</div>';
  }
}

function filterAdminUsers() {
  const q = (document.getElementById('admin-search').value || '').trim().toLowerCase();
  const filtered = q
    ? sortUsersByFlat(_adminAllUsers.filter(u =>
        (u.name || '').toLowerCase().includes(q) || (u.phone || '').includes(q)))
    : _adminAllUsers;
  renderAdminUserList(filtered);
}

function renderAdminUserList(users) {
  const listEl = document.getElementById('admin-user-list');
  if (!users.length) {
    listEl.innerHTML = '<div class="empty-state">No users found.</div>';
    return;
  }
  listEl.innerHTML = users.map(u => {
    const role    = u.role || 'participant';
    const picTags = (role === 'pic' || role === 'admin') && u.picSports?.length
      ? `<div style="margin-top:6px;display:flex;gap:4px;flex-wrap:wrap">${
          u.picSports.map(s =>
            `<span class="reg-detail-tag" style="color:#1D9E75;border:1px solid rgba(29,158,117,0.3)">${s}</span>`
          ).join('')}</div>`
      : '';
    return `
      <div class="user-mgmt-card" id="ucard-${u.docId}">
        <div class="user-card-header">
          <div>
            <div class="user-card-name">${u.name || '—'}</div>
            <div class="user-card-sub">${u.phone ? makeWhatsAppLink(u.phone, u.phone, 'small') : '—'} · Flat ${u.flat || '—'}</div>
            ${u.createdAt ? `<div class="user-card-sub" style="font-size:11px;color:var(--text3);margin-top:2px">Joined: ${formatTimestamp(u.createdAt)}</div>` : ''}
            ${picTags}
          </div>
          <div style="display:flex;align-items:center;gap:8px;flex-shrink:0">
            <span class="role-badge ${role}">${role}</span>
            <button class="user-card-expand" onclick="toggleUserExpand('${u.docId}')">Manage</button>
          </div>
        </div>
        <div class="user-card-body" id="ubody-${u.docId}" style="display:none">
          ${renderRoleManagement(u)}
        </div>
      </div>`;
  }).join('');
}

function renderRoleManagement(u) {
  const role = u.role || 'participant';
  if (role === 'admin') {
    const sportCheckboxes = SPORTS.map(s => {
      const checked = (u.picSports || []).includes(s.name);
      return `<label class="sport-checkbox-item${checked ? ' selected' : ''}" onclick="toggleSportCheckbox(this)">
        <input type="checkbox" value="${s.name}"${checked ? ' checked' : ''} style="display:none"/>
        ${s.emoji} ${s.name}
      </label>`;
    }).join('');
    return `
      <p style="font-size:12px;color:var(--text3);margin-bottom:10px">
        Admin account — assign your PIC sports below:
      </p>
      <div class="sport-checkbox-grid">${sportCheckboxes}</div>
      <button class="btn-primary" style="margin-top:10px" onclick="saveUserRole('${u.docId}','admin')">
        <span>Save My Sports</span>
      </button>`;
  }

  const sportCheckboxes = SPORTS.map(s => {
    const checked = (u.picSports || []).includes(s.name);
    return `<label class="sport-checkbox-item${checked ? ' selected' : ''}" onclick="toggleSportCheckbox(this)">
      <input type="checkbox" value="${s.name}"${checked ? ' checked' : ''} style="display:none"/>
      ${s.emoji} ${s.name}
    </label>`;
  }).join('');

  if (role === 'participant') {
    return `
      <p style="font-size:12px;color:var(--text3);margin-bottom:10px">
        Current role: <span class="role-badge participant">participant</span>
      </p>
      <p style="font-size:12px;color:var(--text2);margin-bottom:6px">Select sports to assign as PIC:</p>
      <div class="sport-checkbox-grid">${sportCheckboxes}</div>
      <button class="btn-primary" style="margin-top:10px" onclick="saveUserRole('${u.docId}','pic')">
        <span>Confirm PIC Role</span>
      </button>`;
  }
  // role === 'pic'
  return `
    <p style="font-size:12px;color:var(--text3);margin-bottom:10px">
      Current role: <span class="role-badge pic">pic</span>
    </p>
    <p style="font-size:12px;color:var(--text2);margin-bottom:6px">Edit assigned sports:</p>
    <div class="sport-checkbox-grid">${sportCheckboxes}</div>
    <div style="display:flex;flex-direction:column;gap:8px;margin-top:10px">
      <button class="btn-primary" onclick="saveUserRole('${u.docId}','pic')">
        <span>Save Changes</span>
      </button>
      <button class="btn-secondary" onclick="saveUserRole('${u.docId}','participant')">
        Remove PIC Role
      </button>
    </div>`;
}

function toggleUserExpand(docId) {
  const card = document.getElementById(`ucard-${docId}`);
  const body = document.getElementById(`ubody-${docId}`);
  const open = body.style.display !== 'none';
  body.style.display = open ? 'none' : 'block';
  card.classList.toggle('expanded', !open);
  const btn = document.querySelector(`#ucard-${docId} .user-card-expand`);
  if (btn) btn.textContent = open ? 'Manage' : 'Close';
}

function toggleSportCheckbox(label) {
  label.classList.toggle('selected');
  const cb = label.querySelector('input[type="checkbox"]');
  cb.checked = !cb.checked;
}

async function saveUserRole(docId, newRole) {
  const user = _adminAllUsers.find(u => u.docId === docId);
  if (!user) return;

  let picSports = [];
  if (newRole === 'pic' || newRole === 'admin') {
    const body = document.getElementById(`ubody-${docId}`);
    picSports  = Array.from(body.querySelectorAll('input[type="checkbox"]:checked'))
      .map(cb => cb.value);
    if (newRole === 'pic' && !picSports.length) {
      showToast('Select at least one sport for PIC', true);
      return;
    }
  }

  // Admin keeps their role; only picSports is updated
  const updateData = newRole === 'admin'
    ? { picSports }
    : { role: newRole, picSports };

  showLoading(true);
  try {
    await updateDoc(doc(db, 'users', docId), updateData);
    showToast(newRole === 'admin'
      ? `Your PIC sports updated: ${picSports.length ? picSports.join(', ') : 'none'}`
      : newRole === 'pic'
        ? `${user.name} is now PIC for: ${picSports.join(', ')}`
        : `${user.name}'s role reset to participant`);
    await loadAdminPanel();
  } catch (err) {
    console.error(err);
    showToast('Could not update role. Try again.', true);
  } finally {
    showLoading(false);
  }
}

// ── Helpers ──
function showLoading(v) {
  document.getElementById('loading').classList.toggle('hidden', !v);
}
let _toastTimer;
function showToast(msg, isError = false) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className   = 'toast' + (isError ? ' error' : '');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => t.classList.add('hidden'), 3200);
}

// ── Reset profile ──
let _resetPending = false;
let _resetTimer   = null;
function resetProfile() {
  if (!_resetPending) {
    _resetPending = true;
    showToast('Are you sure? Tap again to confirm', false);
    _resetTimer = setTimeout(() => { _resetPending = false; }, 3000);
  } else {
    clearTimeout(_resetTimer);
    _resetPending = false;
    adminVerified = false;
    localStorage.clear();
    window.location.reload();
  }
}

// ── PIC PARTICIPANT FILTER & DOWNLOAD FUNCTIONS ──

function toggleFilterPanel() {
  const panel = document.getElementById('filter-panel');
  const arrow = document.getElementById('filter-toggle-arrow');
  const isOpen = panel.style.display !== 'none';
  panel.style.display = isOpen ? 'none' : 'block';
  arrow.textContent   = isOpen ? '▼' : '▲';
}

function toggleFilter(filterType, value) {
  activeFilters[filterType] = activeFilters[filterType] === value ? null : value;
  if (filterType === 'ageCategory' && value !== 'Under 18') {
    activeFilters.grade = null;
  }
  applyFilters();
  updateFilterChipStyles();
  updateActiveFilterSummary();
  renderDownloadButtons();
}

function clearAllFilters() {
  activeFilters = { gender: null, ageCategory: null, grade: null, subcategory: null };
  applyFilters();
  updateFilterChipStyles();
  updateActiveFilterSummary();
  renderDownloadButtons();
}

function applyFilters() {
  filteredParticipants = allParticipants.filter(p => {
    if (activeFilters.gender      && p.gender      !== activeFilters.gender)      return false;
    if (activeFilters.ageCategory && p.ageCategory !== activeFilters.ageCategory) return false;
    if (activeFilters.grade       && p.grade       !== activeFilters.grade)       return false;
    if (activeFilters.subcategory && p.subcategory !== activeFilters.subcategory) return false;
    return true;
  });
  renderParticipantCards(filteredParticipants);
  updateStats(filteredParticipants);
}

function updateStats(participants) {
  const male   = participants.filter(p => p.gender === 'Male').length;
  const female = participants.filter(p => p.gender === 'Female').length;
  const showEl   = document.getElementById('stat-showing');
  const maleEl   = document.getElementById('stat-male');
  const femaleEl = document.getElementById('stat-female');
  const totalEl  = document.getElementById('pic-stat-total');
  if (showEl)   showEl.textContent   = participants.length;
  if (maleEl)   maleEl.textContent   = male;
  if (femaleEl) femaleEl.textContent = female;
  if (totalEl)  totalEl.textContent  = allParticipants.length;
}

function updateFilterChipStyles() {
  const chipMap = {
    'fc-male':    { type: 'gender',      val: 'Male'         },
    'fc-female':  { type: 'gender',      val: 'Female'       },
    'fc-adult':   { type: 'ageCategory', val: '18+'          },
    'fc-under18': { type: 'ageCategory', val: 'Under 18'     },
    'fc-singles': { type: 'subcategory', val: 'Singles'      },
    'fc-doubles': { type: 'subcategory', val: 'Doubles'      },
    'fc-mixed':   { type: 'subcategory', val: 'Mixed Doubles' },
  };
  Object.entries(chipMap).forEach(([id, f]) => {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('active', activeFilters[f.type] === f.val);
  });
  document.querySelectorAll('.grade-chip').forEach(chip => {
    chip.classList.toggle('active', activeFilters.grade === chip.dataset.grade);
  });
}

function updateActiveFilterSummary() {
  const summary = document.getElementById('active-filter-summary');
  if (!summary) return;
  const active = [
    activeFilters.gender,
    activeFilters.ageCategory,
    activeFilters.grade,
    activeFilters.subcategory
  ].filter(Boolean);
  if (active.length === 0) {
    summary.style.display = 'none';
  } else {
    summary.style.display = 'block';
    summary.textContent   = 'Filtered by: ' + active.join(' · ');
  }
}

function buildGradeChips() {
  const gradeOrder = [
    'Pre-Nursery','Nursery','KG-1','KG-2',
    '1st Grade','2nd Grade','3rd Grade','4th Grade','5th Grade',
    '6th Grade','7th Grade','8th Grade',
    '9th Grade','10th Grade','11th Grade','12th Grade'
  ];
  const gradesInData = [...new Set(
    allParticipants.filter(p => p.grade).map(p => p.grade)
  )].sort((a, b) => gradeOrder.indexOf(a) - gradeOrder.indexOf(b));

  const container = document.getElementById('grade-chips-row');
  if (!container) return;
  if (gradesInData.length === 0) {
    container.innerHTML = '<span style="font-size:11px;color:var(--text3)">No under-18 participants</span>';
    return;
  }
  container.innerHTML = '';
  gradesInData.forEach(grade => {
    const btn = document.createElement('button');
    btn.className      = 'filter-chip grade-chip';
    btn.dataset.grade  = grade;
    btn.textContent    = grade;
    btn.onclick        = () => toggleFilter('grade', grade);
    container.appendChild(btn);
  });
}

function renderDownloadButtons() {
  const container = document.getElementById('download-section');
  if (!container) return;
  const hasFilters = Object.values(activeFilters).some(v => v !== null);
  const sport = currentPICSport || 'Sport';

  if (!hasFilters) {
    container.innerHTML = `
      <div class="download-label">Download all ${allParticipants.length} participants:</div>
      <div class="download-btn-row">
        <button class="dl-btn dl-pdf" onclick="downloadParticipants('pdf','all')">📄 PDF</button>
        <button class="dl-btn dl-csv" onclick="downloadParticipants('csv','all')">📊 CSV</button>
        <button class="dl-btn dl-txt" onclick="downloadParticipants('txt','all')">📝 TXT</button>
      </div>`;
  } else {
    container.innerHTML = `
      <div class="download-label">Download filtered (${filteredParticipants.length} shown):</div>
      <div class="download-btn-row">
        <button class="dl-btn dl-pdf" onclick="downloadParticipants('pdf','filtered')">📄 PDF</button>
        <button class="dl-btn dl-csv" onclick="downloadParticipants('csv','filtered')">📊 CSV</button>
        <button class="dl-btn dl-txt" onclick="downloadParticipants('txt','filtered')">📝 TXT</button>
      </div>
      <div class="download-label" style="margin-top:8px;">Download complete list (${allParticipants.length} total):</div>
      <div class="download-btn-row">
        <button class="dl-btn dl-pdf dl-secondary" onclick="downloadParticipants('pdf','all')">📄 PDF</button>
        <button class="dl-btn dl-csv dl-secondary" onclick="downloadParticipants('csv','all')">📊 CSV</button>
        <button class="dl-btn dl-txt dl-secondary" onclick="downloadParticipants('txt','all')">📝 TXT</button>
      </div>`;
  }
}

function downloadParticipants(format, scope) {
  const data = scope === 'filtered' ? filteredParticipants : allParticipants;
  if (data.length === 0) { showToast('No participants to download', true); return; }
  const dateStr = new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
  const filename = `${currentPICSport || 'Sport'}-participants-${scope}-${dateStr}`;
  if (format === 'csv') downloadCSV(data, filename);
  else if (format === 'txt') downloadTXT(data, filename, currentPICSport || 'Sport', dateStr);
  else if (format === 'pdf') downloadPDF(data, filename, currentPICSport || 'Sport', dateStr);
}

function downloadCSV(data, filename) {
  const headers = ['Name','Gender','Age Category','Grade','Subcategory','Registrant Type','Flat','Phone','Partner Name','Partner Phone','Partner Gender','Partner Block','Partner Flat No','Act Type','Category (Solo/Group)','With Instrument','Instrument Name'];
  const esc = val => {
    if (!val && val !== 0) return '';
    const s = String(val);
    return (s.includes(',') || s.includes('"') || s.includes('\n')) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  const rows = data.map(p => [
    esc(p.name), esc(p.gender), esc(p.ageCategory || ''), esc(p.grade || ''),
    esc(p.subcategory || ''), esc(p.regtype || ''), esc(p.flat),
    esc(p.phone), esc(p.partnerName || ''), esc(p.partnerPhone || ''),
    esc(p.partnerGender || ''), esc(p.partnerBlock || ''), esc(p.partnerFlatNum || p.partnerFlat || ''),
    esc(p.actType || ''), esc(p.openMicCategory || ''), esc(p.withInstrument || ''), esc(p.instrumentName || '')
  ].join(','));
  triggerDownload([headers.join(','), ...rows].join('\n'), filename + '.csv', 'text/csv');
  showToast(`Downloading ${data.length} records as CSV`);
}

function downloadTXT(data, filename, sport, date) {
  const lines = [];
  lines.push('═'.repeat(50));
  lines.push(`  ${sport.toUpperCase()} — PARTICIPANT LIST`);
  lines.push(`  Generated: ${date}`);
  lines.push(`  Total: ${data.length} participants`);
  lines.push('═'.repeat(50));
  lines.push('');
  data.forEach((p, i) => {
    lines.push(`${i + 1}. ${p.name}`);
    lines.push(`   Flat: ${p.flat || '-'}`);
    lines.push(`   Gender: ${p.gender || '-'}`);
    lines.push(`   Age: ${p.ageCategory || '-'}${p.grade ? ' (' + p.grade + ')' : ''}`);
    if (p.subcategory) lines.push(`   Category: ${p.subcategory}`);
    if (p.regtype)     lines.push(`   Type: ${p.regtype}`);
    if (p.partnerName) {
      lines.push(`   Partner: ${p.partnerName}`);
      const pFlat = p.partnerBlock && p.partnerFlatNum
        ? `Block ${p.partnerBlock}, Flat ${p.partnerFlatNum}`
        : (p.partnerFlat || '-');
      lines.push(`   Partner Flat: ${pFlat}`);
    }
    if (p.actType)         lines.push(`   Act Type: ${p.actType}`);
    if (p.openMicCategory) lines.push(`   Solo/Group: ${p.openMicCategory}`);
    if (p.withInstrument)  lines.push(`   With Instrument: ${p.withInstrument}${p.instrumentName ? ' (' + p.instrumentName + ')' : ''}`);
    lines.push('');
  });
  lines.push('─'.repeat(50));
  lines.push('RA Olympics 2026');
  triggerDownload(lines.join('\n'), filename + '.txt', 'text/plain');
  showToast(`Downloading ${data.length} records as TXT`);
}

function downloadPDF(data, filename, sport, date) {
  const isOpenMic = data.some(p => p.actType || p.openMicCategory || p.withInstrument);
  const rows = data.map((p, i) => `
    <tr>
      <td>${i + 1}</td>
      <td><strong>${p.name || ''}</strong></td>
      <td>${p.gender || ''}</td>
      <td>${p.ageCategory || ''}${p.grade ? '<br/><small>' + p.grade + '</small>' : ''}</td>
      <td>${p.subcategory || '-'}</td>
      <td>${p.regtype || ''}</td>
      <td>${p.flat || ''}</td>
      <td>${p.partnerName ? p.partnerName + '<br/><small>' + (p.partnerBlock ? 'Blk ' + p.partnerBlock + ' · ' : '') + (p.partnerFlatNum || p.partnerFlat || '') + '</small>' : '-'}</td>
      ${isOpenMic ? `<td>${p.actType || '-'}</td><td>${p.openMicCategory || '-'}</td><td>${p.withInstrument || '-'}${p.instrumentName ? '<br/><small>' + p.instrumentName + '</small>' : ''}</td>` : ''}
    </tr>`).join('');
  const openMicHeaders = isOpenMic ? '<th>Act Type</th><th>Solo/Group</th><th>Instrument</th>' : '';
  const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"/>
<title>${sport} Participants</title>
<style>
  body{font-family:Arial,sans-serif;font-size:12px;margin:20px;color:#333}
  h1{font-size:18px;color:#1a1a2e;margin-bottom:4px}
  .meta{font-size:11px;color:#666;margin-bottom:16px}
  table{width:100%;border-collapse:collapse;font-size:11px}
  th{background:#1a1a2e;color:#fff;padding:8px 6px;text-align:left}
  td{padding:7px 6px;border-bottom:1px solid #eee;vertical-align:top}
  tr:nth-child(even) td{background:#f9f9f9}
  small{color:#888;font-size:10px}
  .footer{margin-top:20px;font-size:10px;color:#999;text-align:center}
  @media print{body{margin:10px}}
</style></head>
<body>
  <h1>🏆 ${sport} — Participant List</h1>
  <div class="meta">Generated: ${date} &nbsp;·&nbsp; Total: ${data.length} participants &nbsp;·&nbsp; RA Olympics 2026</div>
  <table>
    <thead><tr><th>#</th><th>Name</th><th>Gender</th><th>Age</th><th>Category</th><th>Type</th><th>Flat</th><th>Partner</th>${openMicHeaders}</tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="footer">RA Olympics 2026 · Generated by Sports Registration App</div>
  <script>window.print();<\/script>
</body></html>`;
  const win = window.open('', '_blank');
  if (win) { win.document.write(html); win.document.close(); }
  else     { showToast('Allow popups to download PDF', true); return; }
  showToast(`Opening PDF — use "Save as PDF" in the print dialog`);
}

function triggerDownload(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── QUIZ FUNCTIONS ──

async function loadQuizScreen() {
  showLoading(true);
  try {
    const progressRef = doc(db, 'quizProgress', userProfile.phone);
    const progressSnap = await getDoc(progressRef);

    if (progressSnap.exists()) {
      const data = progressSnap.data();
      quizCurrentIndex      = data.currentIndex   || 0;
      quizTotalScore        = data.totalScore      || 0;
      quizTotalAnswered     = data.totalAnswered   || 0;
      quizAnsweredMap       = data.answeredMap     || {};
      quizProgressDocExists = true;
    } else {
      quizCurrentIndex      = 0;
      quizTotalScore        = 0;
      quizTotalAnswered     = 0;
      quizAnsweredMap       = {};
      quizProgressDocExists = false;
    }

    document.getElementById('quiz-score-pill').textContent = quizTotalScore + ' pts';
    await loadAndShowQuestion(quizCurrentIndex);
    loadQuizLeaderboard();

  } catch(err) {
    console.error(err);
    document.getElementById('quiz-content').innerHTML =
      '<div class="quiz-error">Could not load quiz. Please try again.</div>';
  } finally {
    showLoading(false);
  }
}

async function loadAndShowQuestion(index) {
  if (quizQuestionCache[index]) {
    quizCurrentQuestion = quizQuestionCache[index];
    renderQuestion(index);
    return;
  }

  const totalQuestions = 500;
  const questionId = (index % totalQuestions) + 1;

  try {
    const qRef  = doc(db, 'quizQuestions', String(questionId));
    const qSnap = await getDoc(qRef);

    if (qSnap.exists()) {
      quizCurrentQuestion        = qSnap.data();
      quizQuestionCache[index]   = quizCurrentQuestion;
      renderQuestion(index);
    } else {
      document.getElementById('quiz-content').innerHTML =
        '<div class="quiz-error">Question not found. Please try again.</div>';
    }
  } catch(err) {
    console.error(err);
    document.getElementById('quiz-content').innerHTML =
      '<div class="quiz-error">Could not load question.</div>';
  }
}

function renderQuestion(index) {
  const q             = quizCurrentQuestion;
  const totalQuestions = 500;
  const questionNum   = index + 1;
  const progressPct   = (index / totalQuestions) * 100;

  document.getElementById('quiz-progress-text').textContent =
    `Question ${questionNum} of ${totalQuestions}`;
  document.getElementById('quiz-progress-fill').style.width = progressPct + '%';

  const alreadyAnswered = quizAnsweredMap.hasOwnProperty(String(index));
  const wasCorrect      = quizAnsweredMap[String(index)];
  quizSelectedAnswer    = null;

  const letters = ['A', 'B', 'C', 'D'];
  const optionsHtml = q.options.map((opt, i) => {
    let cls = 'quiz-option';
    if (alreadyAnswered) {
      if (i === q.correct) cls += ' correct';
      else cls += ' disabled';
    }
    const clickHandler = alreadyAnswered ? '' : `quizSelectOption(this, ${i})`;
    return `<div class="${cls}" data-index="${i}" onclick="${clickHandler}">` +
           `<div class="quiz-option-letter">${letters[i]}</div>` +
           `<span>${opt}</span></div>`;
  }).join('');

  let resultHtml = '';
  if (alreadyAnswered) {
    if (wasCorrect) {
      resultHtml =
        '<div class="quiz-result-correct">' +
        '<div class="quiz-result-icon">\u2705</div>' +
        '<div class="quiz-result-title">Correct! +1 point</div>' +
        '</div>';
    } else {
      resultHtml =
        '<div class="quiz-result-wrong">' +
        '<div class="quiz-result-icon">\u274c</div>' +
        '<div class="quiz-result-title">Incorrect</div>' +
        `<div class="quiz-result-sub">Correct answer: ${letters[q.correct]}. ${q.options[q.correct]}</div>` +
        '</div>';
    }
  }

  const submitHtml = !alreadyAnswered
    ? `<button class="quiz-submit-btn" id="quiz-submit-btn" disabled onclick="quizSubmitAnswer(${index})">Submit Answer</button>`
    : '';

  document.getElementById('quiz-content').innerHTML =
    `<div class="quiz-q-card">` +
    `<div class="quiz-q-category">${q.emoji} ${q.category}</div>` +
    `<div class="quiz-q-text">${q.q}</div>` +
    `</div>` +
    resultHtml +
    `<div class="quiz-options">${optionsHtml}</div>` +
    submitHtml;

  const prevBtn = document.getElementById('quiz-prev-btn');
  const nextBtn = document.getElementById('quiz-next-btn');
  if (prevBtn) prevBtn.disabled = (index === 0);
  if (nextBtn) nextBtn.textContent = (index >= totalQuestions - 1) ? 'Finish \uD83C\uDF89' : 'Next \u2192';
}

function quizSelectOption(el, optionIndex) {
  document.querySelectorAll('.quiz-option').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
  quizSelectedAnswer = optionIndex;
  const submitBtn = document.getElementById('quiz-submit-btn');
  if (submitBtn) submitBtn.disabled = false;
}

async function quizSubmitAnswer(index) {
  if (quizSelectedAnswer === null) return;

  const isCorrect = (quizSelectedAnswer === quizCurrentQuestion.correct);
  const points    = isCorrect ? 1 : 0;

  quizAnsweredMap[String(index)] = isCorrect;
  quizTotalAnswered++;
  quizTotalScore += points;

  document.getElementById('quiz-score-pill').textContent = quizTotalScore + ' pts';
  renderQuestion(index);
  await saveQuizProgress();
  loadQuizLeaderboard();
}

async function saveQuizProgress() {
  try {
    const progressRef = doc(db, 'quizProgress', userProfile.phone);
    await setDoc(progressRef, {
      phone:         userProfile.phone,
      name:          userProfile.name,
      flat:          userProfile.flat,
      currentIndex:  quizCurrentIndex,
      totalScore:    quizTotalScore,
      totalAnswered: quizTotalAnswered,
      answeredMap:   quizAnsweredMap,
      lastUpdated:   serverTimestamp(),
      completed:     quizTotalAnswered >= 500
    });

    const scoreRef = doc(db, 'quizScores', userProfile.phone);
    await setDoc(scoreRef, {
      phone:          userProfile.phone,
      name:           userProfile.name,
      flat:           userProfile.flat,
      totalPoints:    quizTotalScore,
      totalAnswered:  quizTotalAnswered,
      correctAnswers: quizTotalScore,
      updatedAt:      serverTimestamp()
    });
  } catch(err) {
    console.error('Progress save error:', err);
  }
}

async function quizNextQuestion() {
  if (quizCurrentIndex >= 499) {
    showToast('\uD83C\uDF89 You completed all 500 questions!');
    return;
  }
  quizCurrentIndex++;
  showLoading(true);
  await loadAndShowQuestion(quizCurrentIndex);
  showLoading(false);

  if (quizCurrentIndex % 10 === 0) {
    saveQuizProgress();
  }

  document.getElementById('quiz-content')?.scrollIntoView({ behavior: 'smooth' });
}

async function quizPrevQuestion() {
  if (quizCurrentIndex <= 0) return;
  quizCurrentIndex--;
  showLoading(true);
  await loadAndShowQuestion(quizCurrentIndex);
  showLoading(false);

  document.getElementById('quiz-content')?.scrollIntoView({ behavior: 'smooth' });
}

async function loadQuizLeaderboard() {
  const container = document.getElementById('quiz-leaderboard');
  if (!container) return;
  container.innerHTML = '<div class="leaderboard-loading">Loading...</div>';

  try {
    const snap   = await getDocs(collection(db, 'quizScores'));
    const scores = snap.docs
      .map(d => d.data())
      .sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0))
      .slice(0, 10);

    if (scores.length === 0) {
      container.innerHTML = '<div class="leaderboard-loading">No scores yet. Be the first!</div>';
      return;
    }

    container.innerHTML = '';
    scores.forEach((s, i) => {
      const isMe      = s.phone === userProfile.phone;
      const rankClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
      const card      = document.createElement('div');
      card.className  = 'leaderboard-row' + (isMe ? ' me' : '');
      card.innerHTML  =
        `<div class="leaderboard-rank ${rankClass}">${i + 1}</div>` +
        `<div class="leaderboard-info">` +
        `<div class="leaderboard-name">${s.name}${isMe ? ' (You)' : ''}</div>` +
        `<div class="leaderboard-flat">${s.flat || ''}</div></div>` +
        `<div><div class="leaderboard-points">${s.totalPoints || 0}</div>` +
        `<div class="leaderboard-correct">${s.totalAnswered || 0} answered</div></div>`;
      container.appendChild(card);
    });
  } catch(err) {
    container.innerHTML = '<div class="leaderboard-loading">Could not load leaderboard.</div>';
  }
}


// ── Expose functions to HTML onclick handlers ──
window.saveProfile          = saveProfile;
window.submitRegistration   = submitRegistration;
window.selectAgeCategory    = selectAgeCategory;
window.showScreen           = showScreen;
window.switchTab            = switchTab;
window.openRegistrationForm = openRegistrationForm;
window.closeDeleteModal     = closeDeleteModal;
window.confirmDelete        = confirmDelete;
window.resetProfile         = resetProfile;
window.verifyAdminPin       = verifyAdminPin;
window.skipAdminVerification = skipAdminVerification;
window.openPicSportDetail   = openPicSportDetail;
window.filterAdminUsers     = filterAdminUsers;
window.toggleUserExpand     = toggleUserExpand;
window.toggleSportCheckbox  = toggleSportCheckbox;
window.saveUserRole            = saveUserRole;
window.openAdminSection        = openAdminSection;
window.closeAdminSection       = closeAdminSection;
window.toggleSportRegistration = toggleSportRegistration;
window.toggleDashboardGraph    = toggleDashboardGraph;
window.toggleSportEditCard     = toggleSportEditCard;
window.saveSportDetails        = saveSportDetails;
window.postAnnouncement        = postAnnouncement;
window.clearAnnouncement       = clearAnnouncement;
window.exportCSV               = exportCSV;
window.filterAllRegs           = filterAllRegs;
window.quizSelectOption = quizSelectOption;
window.quizSubmitAnswer = quizSubmitAnswer;
window.quizNextQuestion = quizNextQuestion;
window.quizPrevQuestion = quizPrevQuestion;
window.toggleFilterPanel       = toggleFilterPanel;
window.toggleFilter            = toggleFilter;
window.clearAllFilters         = clearAllFilters;
window.downloadParticipants    = downloadParticipants;
window.rebuildSummaryFromScratch = rebuildSummaryFromScratch;
