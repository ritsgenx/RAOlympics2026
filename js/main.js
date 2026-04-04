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
    name: "Cricket", emoji: "🏏",
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
    name: "Swimming", emoji: "🏊",
    subcategories:   [],
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
    name: "Kids Event", emoji: "🎈",
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
    name: "Yoga", emoji: "🧘",
    subcategories:   [],
    datetime:        "TBD",
    venue:           "Terrace Garden / Open Lawn",
    maxParticipants: "40 participants",
    ageGroup:        "8 years & above",
    contact:         "TBD",
    rules: [
      "Group session led by a certified instructor",
      "Duration: 60 minutes",
      "Bring your own yoga mat",
      "Wear comfortable, stretchable clothing",
      "Avoid heavy meals at least 2 hours before",
      "Modifications available for beginners and seniors"
    ]
  },
];

// ── Admin phone — change this to your phone number ──
const ADMIN_PHONE = "9945648475";

// NOTE: This is client-side role checking suitable for
// a trusted community app. For production apps requiring
// strict security, implement Firebase Security Rules
// and Firebase Authentication.
function isAdmin() {
  return userProfile && userProfile.phone === ADMIN_PHONE;
}

// ── App state ──
let currentSport       = null;
let currentSubcategory = null;
let userProfile        = null;
let blockChart         = null;
let deleteTargetId     = null;
let deleteTargetName   = null;

// ── Subcategory icon map ──
const SUBCATEGORY_ICONS = {
  'Singles':       { emoji: '👤', desc: 'Play solo' },
  'Doubles':       { emoji: '👥', desc: 'Same gender pair' },
  'Mixed Doubles': { emoji: '🔀', desc: 'Mixed gender pair' },
};

// ── Block graph config ──
const BLOCKS       = ['A', 'B', 'C', 'D', 'E'];
const BLOCK_COLORS = ['#0080ff', '#ff6a00', '#00e5a0', '#c84bff', '#f1c40f'];

// ── Init on page load ──
document.addEventListener('DOMContentLoaded', () => {
  buildSportsGrid();
  loadProfile();
});

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

  if (!name)               return showToast('Please enter your name', true);
  if (phone.length < 10)   return showToast('Please enter a valid 10-digit phone number', true);
  if (!block)              return showToast('Please select your block', true);
  if (!flatNo)             return showToast('Please enter your flat number', true);

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

function enterApp() {
  document.getElementById('greeting-name').textContent =
    `Hi, ${userProfile.name.split(' ')[0]}! 👋`;
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
    </div>` : ''}
  `;
  updateMyListBadge();
}

// ── Sports grid ──
function buildSportsGrid() {
  const grid = document.getElementById('sports-grid');
  SPORTS.forEach(sport => {
    const tile = document.createElement('div');
    tile.className = 'sport-tile';
    tile.innerHTML = `
      <span class="sport-emoji">${sport.emoji}</span>
      <span class="sport-label">${sport.name}</span>
    `;
    tile.addEventListener('click', () => openSportDetails(sport));
    grid.appendChild(tile);
  });
}

// ── Sport details ──
function openSportDetails(sport) {
  currentSport       = sport;
  currentSubcategory = null;

  document.getElementById('det-emoji').textContent    = sport.emoji;
  document.getElementById('det-name').textContent     = sport.name;
  document.getElementById('det-datetime').textContent = sport.datetime;
  document.getElementById('det-venue').textContent    = sport.venue;
  document.getElementById('det-max').textContent      = sport.maxParticipants;
  document.getElementById('det-age').textContent      = sport.ageGroup;
  document.getElementById('det-contact').textContent  = sport.contact;

  document.getElementById('det-rules').innerHTML =
    sport.rules.map(r => `<li class="details-rule-item">${r}</li>`).join('');

  // ── Subcategory pills ──
  const subSection = document.getElementById('subcategory-section');
  const pillsEl    = document.getElementById('subcategory-pills');
  if (sport.subcategories.length > 0) {
    pillsEl.innerHTML = sport.subcategories.map(sub => {
      const meta = SUBCATEGORY_ICONS[sub] || { emoji: '🎯', desc: '' };
      return `
        <button class="subcategory-pill" data-sub="${sub}">
          <span class="subcategory-pill-icon">${meta.emoji}</span>
          <span class="subcategory-pill-label">${sub}</span>
          <span class="subcategory-pill-desc">${meta.desc}</span>
        </button>`;
    }).join('');
    pillsEl.querySelectorAll('.subcategory-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        pillsEl.querySelectorAll('.subcategory-pill').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        currentSubcategory = btn.dataset.sub;
      });
    });
    subSection.style.display = 'block';
  } else {
    subSection.style.display = 'none';
  }

  document.getElementById('det-register-label').textContent = `Register for ${sport.name} →`;
  document.getElementById('det-register-btn').onclick = () => {
    if (sport.subcategories.length > 0 && !currentSubcategory) {
      showToast('Please select a category first', true);
      return;
    }
    openRegistrationForm(sport);
  };

  showScreen('screen-details');
}

// ── Registration form ──
function openRegistrationForm(sport) {
  currentSport = sport;

  const titleSuffix = currentSubcategory ? ` — ${currentSubcategory}` : '';
  document.getElementById('form-sport-icon').textContent    = sport.emoji;
  document.getElementById('form-sport-name').textContent    = sport.name;
  document.getElementById('form-title-sport').textContent   = sport.name + titleSuffix;
  document.getElementById('form-phone-display').textContent = userProfile.phone;
  document.getElementById('form-flat-display').textContent  = `Flat ${userProfile.flat}`;

  document.getElementById('f-name').value         = '';
  document.getElementById('f-age').value           = '';
  document.getElementById('f-partner-name').value  = '';
  document.getElementById('f-partner-phone').value = '';
  document.getElementById('f-partner-flat').value  = '';
  document.querySelectorAll('input[name="regtype"]').forEach(r => r.checked = false);
  document.querySelectorAll('input[name="gender"]').forEach(r => r.checked = false);

  const needsPartner = currentSubcategory === 'Doubles' || currentSubcategory === 'Mixed Doubles';
  document.getElementById('partner-section').style.display = needsPartner ? 'block' : 'none';

  showScreen('screen-form');
}

async function submitRegistration() {
  const name    = document.getElementById('f-name').value.trim();
  const age     = document.getElementById('f-age').value.trim();
  const gender  = document.querySelector('input[name="gender"]:checked')?.value;
  const regtype = document.querySelector('input[name="regtype"]:checked')?.value;

  if (!name)    return showToast('Please enter participant name', true);
  if (!age)     return showToast('Please enter age', true);
  if (!gender)  return showToast('Please select gender', true);
  if (!regtype) return showToast('Please select registrant type', true);

  // Partner fields (only when section is visible)
  const partnerVisible = document.getElementById('partner-section').style.display !== 'none';
  let partnerName = null, partnerPhone = null, partnerFlat = null;
  if (partnerVisible) {
    partnerName  = document.getElementById('f-partner-name').value.trim();
    partnerPhone = document.getElementById('f-partner-phone').value.trim();
    partnerFlat  = document.getElementById('f-partner-flat').value.trim();
    if (!partnerName)            return showToast('Please enter partner name', true);
    if (partnerPhone.length < 10) return showToast("Please enter partner's 10-digit phone", true);
    if (!partnerFlat)            return showToast('Please enter partner block & flat', true);
  }

  showLoading(true);
  try {
    await addDoc(collection(db, 'registrations'), {
      sport:        currentSport.name,
      sportEmoji:   currentSport.emoji,
      subcategory:  currentSubcategory || null,
      name,
      age:          parseInt(age),
      gender,
      regtype,
      phone:        userProfile.phone,
      flat:         userProfile.flat,
      registeredBy: userProfile.name,
      partnerName,
      partnerPhone,
      partnerFlat,
      registeredAt: serverTimestamp()
    });
    const sportLabel = currentSubcategory
      ? `${currentSport.name} (${currentSubcategory})`
      : currentSport.name;
    document.getElementById('success-msg').textContent =
      `${name} is registered for ${sportLabel}! See you at the event.`;
    updateMyListBadge();
    showScreen('screen-success');
  } catch (err) {
    console.error(err);
    showToast('Registration failed. Please try again.', true);
  } finally {
    showLoading(false);
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
      card.className = 'reg-card';
      const cls        = d.regtype === 'Self' ? 'self' : d.regtype === 'Kid' ? 'kid' : '';
      const sportLabel = d.subcategory ? `${d.sport} — ${d.subcategory}` : d.sport;
      card.innerHTML = `
        <div class="reg-card-icon">${d.sportEmoji || '🏆'}</div>
        <div class="reg-card-info">
          <div class="reg-card-sport">${sportLabel}</div>
          <div class="reg-card-details">
            <span class="reg-tag">${d.name}</span>
            <span class="reg-tag">Age ${d.age}</span>
            <span class="reg-tag">${d.gender}</span>
            <span class="reg-tag ${cls}">${d.regtype}</span>
            <span class="reg-tag">Flat ${d.flat}</span>
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
      const block = d.flat?.split('-')[0];
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
  const chartEl      = document.getElementById('dash-chart');
  const sportChartEl = document.getElementById('dash-sport-chart');
  chartEl.innerHTML      = '<p class="dash-loading">Loading...</p>';
  sportChartEl.innerHTML = '';
  document.getElementById('dash-total').textContent  = '—';
  document.getElementById('dash-blocks').textContent = '—';
  document.getElementById('dash-sports').textContent = '—';

  try {
    const snap = await getDocs(collection(db, 'registrations'));
    const docs = snap.docs.map(d => d.data());

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

    const showPic   = userProfile.role === 'pic' && (userProfile.picSports || []).length > 0;
    const showAdminData = isAdmin();
    if (showPic || showAdminData) {
      const roleSection = document.createElement('div');
      roleSection.id = 'dash-role-section';
      document.querySelector('#screen-dashboard .screen-inner').appendChild(roleSection);
      if (showPic)       renderPicSection(roleSection, userProfile.picSports, docs);
      if (showAdminData) renderAdminDataSection(roleSection, docs);
    }

  } catch (err) {
    console.error(err);
    chartEl.innerHTML = '<div class="empty-state">Could not load data. Try again later.</div>';
  }
}

// ── PIC participant detail section ──
function renderPicSection(container, sports, allDocs) {
  const wrap = document.createElement('div');
  wrap.innerHTML = '<div class="admin-section-title teal">🟢 Your Sports — Participant Details</div>';
  sports.forEach(sportName => {
    const sportObj = SPORTS.find(s => s.name === sportName);
    const emoji    = sportObj ? sportObj.emoji : '🏆';
    const regs     = allDocs.filter(d => d.sport === sportName);
    const div      = document.createElement('div');
    div.className  = 'pic-sport-section';
    div.innerHTML  = `
      <div class="pic-sport-heading">
        <span>${emoji}</span><span>${sportName}</span>
        <span class="reg-detail-tag">${regs.length} entr${regs.length === 1 ? 'y' : 'ies'}</span>
      </div>
      ${regs.length === 0
        ? '<p class="dash-loading">No registrations yet</p>'
        : regs.map(d => `
          <div class="reg-detail-card">
            <div class="reg-detail-name">${d.name || '—'}</div>
            <div class="reg-detail-tags">
              <span class="reg-detail-tag">Age ${d.age || '—'}</span>
              <span class="reg-detail-tag">${d.gender || '—'}</span>
              <span class="reg-detail-tag">Flat ${d.flat || '—'}</span>
              <span class="reg-detail-tag phone">${d.phone || '—'}</span>
              ${d.subcategory ? `<span class="reg-detail-tag">${d.subcategory}</span>` : ''}
            </div>
          </div>`).join('')}`;
    wrap.appendChild(div);
  });
  container.appendChild(wrap);
}

// ── Admin full data section ──
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
    const regs = bySport[sportObj.name] || [];
    if (!regs.length) return;
    hasData = true;
    const div     = document.createElement('div');
    div.className = 'pic-sport-section';
    div.innerHTML = `
      <div class="pic-sport-heading">
        <span>${sportObj.emoji}</span><span>${sportObj.name}</span>
        <span class="reg-detail-tag">${regs.length} entr${regs.length === 1 ? 'y' : 'ies'}</span>
      </div>
      ${regs.map(d => `
        <div class="reg-detail-card">
          <div class="reg-detail-name">${d.name || '—'}</div>
          <div class="reg-detail-tags">
            <span class="reg-detail-tag">Age ${d.age || '—'}</span>
            <span class="reg-detail-tag">${d.gender || '—'}</span>
            <span class="reg-detail-tag">Flat ${d.flat || '—'}</span>
            <span class="reg-detail-tag phone">${d.phone || '—'}</span>
            ${d.subcategory ? `<span class="reg-detail-tag">${d.subcategory}</span>` : ''}
          </div>
        </div>`).join('')}`;
    wrap.appendChild(div);
  });
  if (!hasData) wrap.innerHTML += '<p class="dash-loading">No registrations yet</p>';
  container.appendChild(wrap);
}

// ── Navigation ──
const TAB_SCREENS = ['screen-sports', 'screen-dashboard', 'screen-registrations', 'screen-admin'];

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0, 0);
  document.getElementById('tab-bar').style.display =
    TAB_SCREENS.includes(id) ? 'flex' : 'none';
  if (id === 'screen-registrations') loadRegistrations();
  if (id === 'screen-dashboard')     loadDashboard();
  if (id === 'screen-graph')         loadBlockGraph();
  if (id === 'screen-admin')         loadAdminPanel();
}

function switchTab(tabName) {
  const screenMap = {
    home:      'screen-sports',
    dashboard: 'screen-dashboard',
    mylist:    'screen-registrations',
    admin:     'screen-admin'
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

// ── Admin panel ──
let _adminAllUsers = [];

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
    _adminAllUsers = usersSnap.docs.map(d => ({ docId: d.id, ...d.data() }));
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
    ? _adminAllUsers.filter(u =>
        (u.name || '').toLowerCase().includes(q) || (u.phone || '').includes(q))
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
    const picTags = role === 'pic' && u.picSports?.length
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
            <div class="user-card-sub">${u.phone || '—'} · Flat ${u.flat || '—'}</div>
            ${picTags}
          </div>
          <div style="display:flex;align-items:center;gap:8px;flex-shrink:0">
            <span class="role-badge ${role}">${role}</span>
            ${role !== 'admin'
              ? `<button class="user-card-expand" onclick="toggleUserExpand('${u.docId}')">Manage</button>`
              : ''}
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
  if (role === 'admin') return '<p style="font-size:13px;color:var(--text3)">This is an admin account.</p>';

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
  if (newRole === 'pic') {
    const body = document.getElementById(`ubody-${docId}`);
    picSports  = Array.from(body.querySelectorAll('input[type="checkbox"]:checked'))
      .map(cb => cb.value);
    if (!picSports.length) {
      showToast('Select at least one sport for PIC', true);
      return;
    }
  }

  showLoading(true);
  try {
    await updateDoc(doc(db, 'users', docId), { role: newRole, picSports });
    showToast(newRole === 'pic'
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
    localStorage.clear();
    window.location.reload();
  }
}

// ── Expose functions to HTML onclick handlers ──
window.saveProfile          = saveProfile;
window.submitRegistration   = submitRegistration;
window.showScreen           = showScreen;
window.switchTab            = switchTab;
window.openRegistrationForm = openRegistrationForm;
window.closeDeleteModal     = closeDeleteModal;
window.confirmDelete        = confirmDelete;
window.resetProfile         = resetProfile;
window.filterAdminUsers     = filterAdminUsers;
window.toggleUserExpand     = toggleUserExpand;
window.toggleSportCheckbox  = toggleSportCheckbox;
window.saveUserRole         = saveUserRole;
