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

// ── Sports list ──
const SPORTS = [
  { name: "Cricket",      emoji: "🏏" },
  { name: "Badminton",    emoji: "🏸" },
  { name: "Basketball",   emoji: "🏀" },
  { name: "Football",     emoji: "⚽" },
  { name: "Swimming",     emoji: "🏊" },
  { name: "Table Tennis", emoji: "🏓" },
  { name: "Chess",        emoji: "♟️" },
  { name: "Pickleball",   emoji: "🎾" },
  { name: "Track Events", emoji: "🏃" },
  { name: "Kids Event",   emoji: "🎈" },
  { name: "Open Mic",     emoji: "🎤" },
  { name: "Yoga",         emoji: "🧘" },
];

// ── App state ──
let currentSport = null;
let userProfile  = null;
let blockChart   = null;

// ── Block graph config ──
const BLOCKS       = ['A', 'B', 'C', 'D', 'E'];
const BLOCK_COLORS = ['#0080ff', '#ff6a00', '#00e5a0', '#c84bff', '#f1c40f'];

// ── Init on page load ──
document.addEventListener('DOMContentLoaded', () => {
  buildSportsGrid();
  loadProfile();
});

// ── Profile ──
function loadProfile() {
  const saved = localStorage.getItem('sportsFestProfile');
  if (saved) {
    userProfile = JSON.parse(saved);
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
    await addDoc(collection(db, 'users'), {
      name, phone, flat,
      createdAt: serverTimestamp()
    });
    userProfile = { name, phone, flat };
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
  loadRegCount();
  showScreen('screen-sports');
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
    tile.addEventListener('click', () => openRegistrationForm(sport));
    grid.appendChild(tile);
  });
}

// ── Registration form ──
function openRegistrationForm(sport) {
  currentSport = sport;
  document.getElementById('form-sport-icon').textContent    = sport.emoji;
  document.getElementById('form-sport-name').textContent    = sport.name;
  document.getElementById('form-title-sport').textContent   = sport.name;
  document.getElementById('form-phone-display').textContent = userProfile.phone;
  document.getElementById('form-flat-display').textContent  = `Flat ${userProfile.flat}`;
  document.getElementById('f-name').value = '';
  document.getElementById('f-age').value  = '';
  document.querySelectorAll('input[name="regtype"]').forEach(r => r.checked = false);
  document.querySelectorAll('input[name="gender"]').forEach(r => r.checked = false);
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

  showLoading(true);
  try {
    await addDoc(collection(db, 'registrations'), {
      sport:        currentSport.name,
      sportEmoji:   currentSport.emoji,
      name,
      age:          parseInt(age),
      gender,
      regtype,
      phone:        userProfile.phone,
      flat:         userProfile.flat,
      registeredBy: userProfile.name,
      registeredAt: serverTimestamp()
    });
    document.getElementById('success-msg').textContent =
      `${name} is registered for ${currentSport.name}! See you at the event.`;
    loadRegCount();
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
  const list = document.getElementById('reg-list');
  list.innerHTML = '<div class="empty-state">Loading...</div>';
  try {
    const q    = query(collection(db, 'registrations'), where('phone', '==', userProfile.phone));
    const snap = await getDocs(q);
    const docs = snap.docs.map(d => d.data());

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
      const cls = d.regtype === 'Self' ? 'self' : d.regtype === 'Kid' ? 'kid' : '';
      card.innerHTML = `
        <div class="reg-card-icon">${d.sportEmoji || '🏆'}</div>
        <div class="reg-card-info">
          <div class="reg-card-sport">${d.sport}</div>
          <div class="reg-card-details">
            <span class="reg-tag">${d.name}</span>
            <span class="reg-tag">Age ${d.age}</span>
            <span class="reg-tag">${d.gender}</span>
            <span class="reg-tag ${cls}">${d.regtype}</span>
            <span class="reg-tag">Flat ${d.flat}</span>
          </div>
        </div>
      `;
      list.appendChild(card);
    });
  } catch (err) {
    console.error(err);
    list.innerHTML = '<div class="empty-state">Error loading registrations.</div>';
  }
}

async function loadRegCount() {
  try {
    const q    = query(collection(db, 'registrations'), where('phone', '==', userProfile.phone));
    const snap = await getDocs(q);
    document.getElementById('reg-count-badge').textContent = snap.size;
  } catch (e) { /* silently fail */ }
}

// ── Block-wise graph ──
async function loadBlockGraph() {
  const emptyEl = document.getElementById('graph-empty');
  const wrapEl  = document.getElementById('graph-wrap');

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

    // tally: data[sportName][block] = count
    const tally = {};
    SPORTS.forEach(s => {
      tally[s.name] = {};
      BLOCKS.forEach(b => tally[s.name][b] = 0);
    });
    docs.forEach(d => {
      const block = d.flat?.split('-')[0];
      if (tally[d.sport] && BLOCKS.includes(block)) {
        tally[d.sport][block]++;
      }
    });

    // only show sports that have at least 1 registration
    const activeSports = SPORTS.filter(s => BLOCKS.some(b => tally[s.name][b] > 0));

    const labels   = activeSports.map(s => s.emoji + ' ' + s.name);
    const datasets = BLOCKS.map((block, i) => ({
      label: 'Block ' + block,
      data: activeSports.map(s => tally[s.name][block]),
      backgroundColor: BLOCK_COLORS[i],
      borderRadius: 4,
      borderSkipped: false,
    }));

    // build legend
    const legendEl = document.getElementById('graph-legend');
    legendEl.innerHTML = BLOCKS.map((b, i) =>
      `<span class="legend-dot" style="background:${BLOCK_COLORS[i]}"></span><span class="legend-label">Block ${b}</span>`
    ).join('');

    if (blockChart) blockChart.destroy();

    const ctx = document.getElementById('block-chart').getContext('2d');
    // set canvas height based on number of sports
    document.getElementById('block-chart').parentElement.style.height =
      Math.max(320, activeSports.length * 52) + 'px';

    blockChart = new Chart(ctx, {
      type: 'bar',
      data: { labels, datasets },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: items => items[0].label,
              label: item => ` Block ${item.dataset.label.split(' ')[1]}: ${item.raw} registrations`,
            }
          }
        },
        scales: {
          x: {
            stacked: true,
            ticks: { color: '#7aaccc', font: { family: 'Outfit' }, stepSize: 1 },
            grid:  { color: 'rgba(0,140,255,0.08)' },
            border:{ color: 'rgba(0,140,255,0.15)' },
          },
          y: {
            stacked: true,
            ticks: { color: '#e8f3ff', font: { family: 'Outfit', size: 12 } },
            grid:  { display: false },
            border:{ display: false },
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

// ── Navigation ──
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0, 0);
  if (id === 'screen-registrations') loadRegistrations();
  if (id === 'screen-graph')         loadBlockGraph();
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

// ── Expose functions to HTML onclick handlers ──
window.saveProfile           = saveProfile;
window.submitRegistration    = submitRegistration;
window.showScreen            = showScreen;
