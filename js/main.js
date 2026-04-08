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
    name: "Billiards / Pool", emoji: "🎱",
    subcategories:   ["8-Ball Pool", "Billiards"],
    datetime:        "TBD",
    venue:           "Club House — Billiards Room",
    maxParticipants: "16 players",
    ageGroup:        "16 years & above",
    contact:         "TBD",
    rules: [
      "8-Ball Pool and Billiards — separate categories",
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
    name: "Rubik's Cube", emoji: "🎲", image: "images/rubiks.png",
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
    name: "Online Video Games", emoji: "🎮",
    subcategories:   ["BGMI / PUBG", "Free Fire", "FIFA / eFootball", "Other"],
    datetime:        "TBD",
    venue:           "Online — from your own device",
    maxParticipants: "40 players",
    ageGroup:        "12 years & above",
    contact:         "TBD",
    rules: [
      "Choose your game category at registration",
      "Matches coordinated via WhatsApp group",
      "Players must use their own device and internet",
      "Fair play — no hacks, mods or emulators",
      "Game ID / username required at registration",
      "Schedule shared 24 hours before match"
    ]
  },
];

// ============================================================
//  QUIZ QUESTIONS — 200 daily sports questions
//  Categories: Cricket(25), Football(20), Badminton(15),
//  Olympics(20), Swimming(15), Tennis(15), Basketball(15),
//  Athletics(15), Chess(10), TableTennis(10),
//  General Sports(20), Sports Science(10), Famous Athletes(10)
// ============================================================
const QUIZ_QUESTIONS = [
  // ── CRICKET (25) ──
  { q:"How many players are in a cricket team?", options:["9","10","11","12"], correct:2, emoji:"🏏", category:"Cricket" },
  { q:"How many balls make up one over in cricket?", options:["4","5","6","8"], correct:2, emoji:"🏏", category:"Cricket" },
  { q:"What is the length of a cricket pitch?", options:["18 yards","20 yards","22 yards","24 yards"], correct:2, emoji:"🏏", category:"Cricket" },
  { q:"In cricket, what is it called when a batsman is dismissed for zero runs?", options:["Blob","Duck","Egg","Zero"], correct:1, emoji:"🏏", category:"Cricket" },
  { q:"Which country has won the most ICC Cricket World Cups?", options:["India","West Indies","Australia","England"], correct:2, emoji:"🏏", category:"Cricket" },
  { q:"How many stumps are on each cricket wicket?", options:["2","3","4","5"], correct:1, emoji:"🏏", category:"Cricket" },
  { q:"What is it called when a bowler takes 3 wickets in 3 consecutive balls?", options:["Triple play","Hat-trick","Three-fer","Grand slam"], correct:1, emoji:"🏏", category:"Cricket" },
  { q:"What does 'LBW' stand for in cricket?", options:["Leg Before Wicket","Left Bat Width","Low Ball Warning","Lateral Bat Wicket"], correct:0, emoji:"🏏", category:"Cricket" },
  { q:"How many bails sit on top of the cricket stumps?", options:["1","2","3","4"], correct:1, emoji:"🏏", category:"Cricket" },
  { q:"How many runs are scored when the ball clears the boundary rope without bouncing?", options:["4","5","6","7"], correct:2, emoji:"🏏", category:"Cricket" },
  { q:"Which Indian cricketer has scored the most international centuries?", options:["Virat Kohli","Ricky Ponting","Sachin Tendulkar","Brian Lara"], correct:2, emoji:"🏏", category:"Cricket" },
  { q:"In cricket, what is a 'maiden over'?", options:["First over of a match","An over with no runs scored","An over by a left-handed bowler","Last over of the innings"], correct:1, emoji:"🏏", category:"Cricket" },
  { q:"What colour ball is used in Test cricket?", options:["White","Pink","Red","Orange"], correct:2, emoji:"🏏", category:"Cricket" },
  { q:"In T20 cricket, how many overs does each team bat?", options:["10","15","20","25"], correct:2, emoji:"🏏", category:"Cricket" },
  { q:"What is the famous cricket series between England and Australia called?", options:["The Crown","The Ashes","The Burns","The Torch"], correct:1, emoji:"🏏", category:"Cricket" },
  { q:"How many runs does a batsman score for a boundary along the ground?", options:["3","4","5","6"], correct:1, emoji:"🏏", category:"Cricket" },
  { q:"In cricket, what is a score of exactly 100 runs called?", options:["Double","Half-century","Century","Grand"], correct:2, emoji:"🏏", category:"Cricket" },
  { q:"Which country is the birthplace of cricket?", options:["India","Australia","England","West Indies"], correct:2, emoji:"🏏", category:"Cricket" },
  { q:"What does 'ODI' stand for in cricket?", options:["One Day International","Official Day Innings","Open Delivery Innings","One Division International"], correct:0, emoji:"🏏", category:"Cricket" },
  { q:"The 'Baggy Green' cap is associated with which cricket team?", options:["England","South Africa","New Zealand","Australia"], correct:3, emoji:"🏏", category:"Cricket" },
  { q:"What is the maximum number of overs per innings in an ODI match?", options:["40","45","50","60"], correct:2, emoji:"🏏", category:"Cricket" },
  { q:"What does 'DRS' stand for in cricket?", options:["Decision Review System","Direct Run Score","Delivery Rate Score","Default Response Signal"], correct:0, emoji:"🏏", category:"Cricket" },
  { q:"Who holds the record for the highest individual Test score of 400 not out?", options:["Don Bradman","Brian Lara","Sachin Tendulkar","Garfield Sobers"], correct:1, emoji:"🏏", category:"Cricket" },
  { q:"In cricket, what is a batsman's score of 50 runs called?", options:["Quarter-century","Half-century","Double digit","Silver mark"], correct:1, emoji:"🏏", category:"Cricket" },
  { q:"Which fielding position is directly behind the batsman in cricket?", options:["Slip","Gully","Fine Leg","Wicket Keeper"], correct:3, emoji:"🏏", category:"Cricket" },

  // ── FOOTBALL / SOCCER (20) ──
  { q:"How many players are on a football (soccer) team?", options:["9","10","11","12"], correct:2, emoji:"⚽", category:"Football" },
  { q:"How long is a standard football match?", options:["80 minutes","90 minutes","100 minutes","120 minutes"], correct:1, emoji:"⚽", category:"Football" },
  { q:"Which country has won the most FIFA World Cups?", options:["Germany","Italy","Argentina","Brazil"], correct:3, emoji:"⚽", category:"Football" },
  { q:"What does FIFA stand for?", options:["Fédération Internationale de Football Association","Federal International Football Agency","Football International Federation Association","Federation for International Football Activities"], correct:0, emoji:"⚽", category:"Football" },
  { q:"How many minutes is each half in a standard football match?", options:["40","45","50","60"], correct:1, emoji:"⚽", category:"Football" },
  { q:"What colour card causes a player to be sent off in football?", options:["Yellow","Orange","Red","Black"], correct:2, emoji:"⚽", category:"Football" },
  { q:"How many times has Brazil won the FIFA World Cup?", options:["3","4","5","6"], correct:2, emoji:"⚽", category:"Football" },
  { q:"Which country hosted the first FIFA World Cup in 1930?", options:["Brazil","France","Uruguay","Italy"], correct:2, emoji:"⚽", category:"Football" },
  { q:"In football, what is it called when a player scores three goals in one match?", options:["Triple","Hat-trick","Treble","Triple crown"], correct:1, emoji:"⚽", category:"Football" },
  { q:"Which footballer has won the most Ballon d'Or awards?", options:["Cristiano Ronaldo","Lionel Messi","Ronaldinho","Zinedine Zidane"], correct:1, emoji:"⚽", category:"Football" },
  { q:"Which country won the 2022 FIFA World Cup?", options:["France","Brazil","Argentina","England"], correct:2, emoji:"⚽", category:"Football" },
  { q:"In football, how many players can a team substitute in a standard match?", options:["3","4","5","6"], correct:2, emoji:"⚽", category:"Football" },
  { q:"In football, what is the basic principle of the offside rule?", options:["Cannot pass backwards","Attacker is ahead of last defender when ball is played","Cannot enter penalty box","Must stay in own half"], correct:1, emoji:"⚽", category:"Football" },
  { q:"How many black pentagons are on a traditional black and white football?", options:["10","12","14","16"], correct:1, emoji:"⚽", category:"Football" },
  { q:"Which football club has won the most UEFA Champions League titles?", options:["Barcelona","Bayern Munich","AC Milan","Real Madrid"], correct:3, emoji:"⚽", category:"Football" },
  { q:"In which city is the FIFA headquarters located?", options:["Paris","London","Zurich","Geneva"], correct:2, emoji:"⚽", category:"Football" },
  { q:"How many points does a team earn for a win in most football leagues?", options:["2","3","4","1"], correct:1, emoji:"⚽", category:"Football" },
  { q:"What happens when the goalkeeper catches the ball from a teammate's deliberate kick-back?", options:["Corner kick","Indirect free kick to opponents","Direct free kick","Penalty kick"], correct:1, emoji:"⚽", category:"Football" },
  { q:"From how many yards is a penalty kick taken in football?", options:["8 yards","10 yards","12 yards","16 yards"], correct:2, emoji:"⚽", category:"Football" },
  { q:"In football, what does a yellow card represent?", options:["Dismissal","Caution or warning","Penalty awarded","Injury stoppage"], correct:1, emoji:"⚽", category:"Football" },

  // ── BADMINTON (15) ──
  { q:"Which country is credited with inventing Badminton?", options:["China","India","Denmark","England"], correct:3, emoji:"🏸", category:"Badminton" },
  { q:"How many points make a standard badminton game?", options:["15","18","21","25"], correct:2, emoji:"🏸", category:"Badminton" },
  { q:"What is another common name for the shuttlecock in badminton?", options:["Birdie","Puck","Feather ball","Volley"], correct:0, emoji:"🏸", category:"Badminton" },
  { q:"How many feathers does a regulation badminton shuttlecock have?", options:["12","14","16","18"], correct:2, emoji:"🏸", category:"Badminton" },
  { q:"In badminton doubles, how many players are on each side of the net?", options:["1","2","3","4"], correct:1, emoji:"🏸", category:"Badminton" },
  { q:"In which year was badminton first included in the Olympic Games?", options:["1984","1988","1992","1996"], correct:2, emoji:"🏸", category:"Badminton" },
  { q:"What is the scoring format in a badminton match?", options:["First to 15 points","Best of 3 games to 21","Best of 5 games to 15","First to 30 points"], correct:1, emoji:"🏸", category:"Badminton" },
  { q:"PV Sindhu is a famous badminton player from which country?", options:["China","Thailand","Malaysia","India"], correct:3, emoji:"🏸", category:"Badminton" },
  { q:"What material is a professional badminton shuttlecock traditionally made from?", options:["Plastic feathers","Real goose or duck feathers","Synthetic fibre","Nylon mesh"], correct:1, emoji:"🏸", category:"Badminton" },
  { q:"In badminton, what must a player win by to secure a game?", options:["Exactly 21 points","By at least 2 clear points","By at least 3 points","First to 21 regardless"], correct:1, emoji:"🏸", category:"Badminton" },
  { q:"The Thomas Cup is a major team championship in which sport?", options:["Table Tennis","Tennis","Badminton","Squash"], correct:2, emoji:"🏸", category:"Badminton" },
  { q:"What is the maximum score at which a badminton game ends automatically?", options:["25","28","29","30"], correct:3, emoji:"🏸", category:"Badminton" },
  { q:"How high is the badminton net at the centre of the court?", options:["1.34 m","1.524 m","1.7 m","2.0 m"], correct:1, emoji:"🏸", category:"Badminton" },
  { q:"In which country are the famous All England Badminton Championships held?", options:["Denmark","China","Malaysia","England"], correct:3, emoji:"🏸", category:"Badminton" },
  { q:"How wide is a badminton singles court?", options:["4.6 m","5.18 m","6.1 m","7.0 m"], correct:1, emoji:"🏸", category:"Badminton" },

  // ── OLYMPICS (20) ──
  { q:"How many rings are on the Olympic flag?", options:["4","5","6","7"], correct:1, emoji:"🏅", category:"Olympics" },
  { q:"In which year were the first modern Olympic Games held?", options:["1886","1896","1900","1904"], correct:1, emoji:"🏅", category:"Olympics" },
  { q:"In which city were the first modern Olympics held?", options:["Paris","London","Rome","Athens"], correct:3, emoji:"🏅", category:"Olympics" },
  { q:"How often are the Summer Olympic Games held?", options:["Every 2 years","Every 3 years","Every 4 years","Every 5 years"], correct:2, emoji:"🏅", category:"Olympics" },
  { q:"What do the five Olympic rings represent?", options:["Five continents","Five original sports","Five founding members","Five Olympic values"], correct:0, emoji:"🏅", category:"Olympics" },
  { q:"Which country has won the most gold medals in Summer Olympics history?", options:["Russia","China","Great Britain","United States"], correct:3, emoji:"🏅", category:"Olympics" },
  { q:"What is the Olympic motto?", options:["Swifter, Higher, Stronger","Faster, Higher, Stronger — Together","Run, Jump, Swim","Play Fair, Win Fair"], correct:1, emoji:"🏅", category:"Olympics" },
  { q:"In which year did India win its first individual Olympic gold medal?", options:["1980","1996","2008","2012"], correct:2, emoji:"🏅", category:"Olympics" },
  { q:"Which swimmer has won the most Olympic gold medals in history?", options:["Ian Thorpe","Mark Spitz","Michael Phelps","Ryan Lochte"], correct:2, emoji:"🏅", category:"Olympics" },
  { q:"In which city were the 2020 Summer Olympics held?", options:["Paris","Tokyo","Seoul","Beijing"], correct:1, emoji:"🏅", category:"Olympics" },
  { q:"What material is an Olympic gold medal primarily made of?", options:["Pure gold","Gold-plated silver","Gold-plated bronze","Titanium"], correct:1, emoji:"🏅", category:"Olympics" },
  { q:"Which country hosted the 2016 Summer Olympics?", options:["Colombia","Argentina","Brazil","Chile"], correct:2, emoji:"🏅", category:"Olympics" },
  { q:"The Olympic flame is traditionally lit using the sun's rays at which location?", options:["Athens stadium","Olympia, Greece","Paris","Mount Olympus"], correct:1, emoji:"🏅", category:"Olympics" },
  { q:"In the Olympics, what colour is the first-place medal?", options:["Bronze","Silver","Gold","Platinum"], correct:2, emoji:"🏅", category:"Olympics" },
  { q:"Were women allowed to compete in the first modern Olympics in 1896?", options:["Yes, in all sports","Yes, but only in tennis","No, women were excluded","Yes, in swimming only"], correct:2, emoji:"🏅", category:"Olympics" },
  { q:"Which country hosted the 2024 Summer Olympics?", options:["Japan","USA","France","Germany"], correct:2, emoji:"🏅", category:"Olympics" },
  { q:"Which sport has featured in every Summer Olympics since 1896?", options:["Swimming","Athletics (Track & Field)","Cycling","Gymnastics"], correct:1, emoji:"🏅", category:"Olympics" },
  { q:"Paris hosted the Olympics in 1900, 1924 and again in which year?", options:["2012","2016","2020","2024"], correct:3, emoji:"🏅", category:"Olympics" },
  { q:"How many sports were featured at the original 1896 Olympic Games?", options:["5","9","14","20"], correct:1, emoji:"🏅", category:"Olympics" },
  { q:"Which athlete dominated the 1936 Berlin Olympics by winning four gold medals?", options:["Jesse Owens","Carl Lewis","Jim Thorpe","Bob Beamon"], correct:0, emoji:"🏅", category:"Olympics" },

  // ── SWIMMING (15) ──
  { q:"How long is an Olympic swimming pool?", options:["25 m","40 m","50 m","100 m"], correct:2, emoji:"🏊", category:"Swimming" },
  { q:"How many swimming strokes are used in the individual medley?", options:["2","3","4","5"], correct:2, emoji:"🏊", category:"Swimming" },
  { q:"Which swimming stroke requires swimmers to lie on their back?", options:["Freestyle","Butterfly","Backstroke","Breaststroke"], correct:2, emoji:"🏊", category:"Swimming" },
  { q:"What is the shortest Olympic swimming race distance?", options:["25 m","50 m","100 m","200 m"], correct:1, emoji:"🏊", category:"Swimming" },
  { q:"What do competitive swimmers wear on their eyes?", options:["Masks","Goggles","Visors","Glasses"], correct:1, emoji:"🏊", category:"Swimming" },
  { q:"In which swimming stroke do competitors move both arms simultaneously above the water?", options:["Breaststroke","Backstroke","Freestyle","Butterfly"], correct:3, emoji:"🏊", category:"Swimming" },
  { q:"What is it called when a swimmer starts before the starting signal?", options:["Early start","False start","Penalty start","Jump start"], correct:1, emoji:"🏊", category:"Swimming" },
  { q:"How many swimmers are in an Olympic 4×100 m relay team?", options:["2","3","4","5"], correct:2, emoji:"🏊", category:"Swimming" },
  { q:"What do swimmers use to reduce drag on their hair?", options:["Hair gel","Swimming cap","Headband","Braids"], correct:1, emoji:"🏊", category:"Swimming" },
  { q:"Which country is legendary swimmer Michael Phelps from?", options:["Australia","Great Britain","United States","Canada"], correct:2, emoji:"🏊", category:"Swimming" },
  { q:"How many Olympic gold medals did Michael Phelps win in his career?", options:["14","18","23","28"], correct:2, emoji:"🏊", category:"Swimming" },
  { q:"How wide is each lane in an Olympic swimming pool?", options:["1.5 m","2 m","2.5 m","3 m"], correct:2, emoji:"🏊", category:"Swimming" },
  { q:"In butterfly stroke, how many dolphin kicks are performed per arm cycle?", options:["1","2","3","4"], correct:1, emoji:"🏊", category:"Swimming" },
  { q:"What is the term for an electronic pad at each end of the pool that records finish times?", options:["Turn marker","Touch pad","Finish block","Time recorder"], correct:1, emoji:"🏊", category:"Swimming" },
  { q:"In which swimming stroke are both arms pulled simultaneously under water while the legs do a frog kick?", options:["Freestyle","Butterfly","Backstroke","Breaststroke"], correct:3, emoji:"🏊", category:"Swimming" },

  // ── TENNIS (15) ──
  { q:"In men's Grand Slam tennis, how many sets must a player win to win the match?", options:["2 sets","3 sets","4 sets","5 sets"], correct:1, emoji:"🎾", category:"Tennis" },
  { q:"What surface is the Wimbledon tennis championship played on?", options:["Clay","Hard court","Grass","Carpet"], correct:2, emoji:"🎾", category:"Tennis" },
  { q:"In tennis, what is the score called when both players are at 40-40?", options:["Tie","Deuce","Even","Equal"], correct:1, emoji:"🎾", category:"Tennis" },
  { q:"What is the name for a serve that the opponent cannot touch?", options:["Ace","Winner","Perfect serve","Clean serve"], correct:0, emoji:"🎾", category:"Tennis" },
  { q:"Who holds the record for the most Grand Slam singles titles in tennis history?", options:["Roger Federer","Novak Djokovic","Rafael Nadal","Pete Sampras"], correct:1, emoji:"🎾", category:"Tennis" },
  { q:"What does 'love' mean in tennis scoring?", options:["1 point","Zero (no points)","Game point","Advantage"], correct:1, emoji:"🎾", category:"Tennis" },
  { q:"What surface is the French Open (Roland Garros) played on?", options:["Grass","Hard court","Clay","Carpet"], correct:2, emoji:"🎾", category:"Tennis" },
  { q:"In tennis, what is it called when a set score reaches 6-6 and a deciding game is played?", options:["Super game","Tiebreak","Deuce set","Golden set"], correct:1, emoji:"🎾", category:"Tennis" },
  { q:"How many sets are played in a women's Grand Slam match?", options:["Best of 3","Best of 5","Best of 7","Single set"], correct:0, emoji:"🎾", category:"Tennis" },
  { q:"How many Grand Slam singles titles did Serena Williams win?", options:["15","20","23","28"], correct:2, emoji:"🎾", category:"Tennis" },
  { q:"Which tennis tournament is the oldest Grand Slam?", options:["US Open","French Open","Australian Open","Wimbledon"], correct:3, emoji:"🎾", category:"Tennis" },
  { q:"In tennis, what is it called when a server commits two faults in a row?", options:["Double fault","Double error","Service fault","Out serve"], correct:0, emoji:"🎾", category:"Tennis" },
  { q:"What are the four Grand Slam tournaments?", options:["Australian Open, French Open, Wimbledon, US Open","Australian Open, French Open, US Open, Canadian Open","Wimbledon, French Open, Miami Open, US Open","Australian Open, Indian Wells, Wimbledon, US Open"], correct:0, emoji:"🎾", category:"Tennis" },
  { q:"In tennis, a set won 6-0 is informally called what?", options:["Clean sweep","Bagel","Perfect set","Shutout"], correct:1, emoji:"🎾", category:"Tennis" },
  { q:"Who is nicknamed 'The King of Clay' in tennis?", options:["Roger Federer","Novak Djokovic","Rafael Nadal","Andre Agassi"], correct:2, emoji:"🎾", category:"Tennis" },

  // ── BASKETBALL (15) ──
  { q:"How many players are on a basketball court per team during play?", options:["4","5","6","7"], correct:1, emoji:"🏀", category:"Basketball" },
  { q:"How high is a standard basketball hoop from the ground?", options:["8 feet","9 feet","10 feet","11 feet"], correct:2, emoji:"🏀", category:"Basketball" },
  { q:"What is the diameter of a standard basketball hoop in inches?", options:["16 inches","18 inches","20 inches","22 inches"], correct:1, emoji:"🏀", category:"Basketball" },
  { q:"How many points is a shot from beyond the three-point line worth?", options:["2","3","4","5"], correct:1, emoji:"🏀", category:"Basketball" },
  { q:"How long is each quarter in NBA basketball?", options:["10 minutes","12 minutes","15 minutes","20 minutes"], correct:1, emoji:"🏀", category:"Basketball" },
  { q:"Which player is nicknamed 'His Airness' and is considered one of the greatest ever?", options:["LeBron James","Kobe Bryant","Michael Jordan","Magic Johnson"], correct:2, emoji:"🏀", category:"Basketball" },
  { q:"In the NBA, how many personal fouls before a player is disqualified?", options:["4","5","6","7"], correct:2, emoji:"🏀", category:"Basketball" },
  { q:"How many seconds does a team have to shoot in the NBA (shot clock)?", options:["14 seconds","20 seconds","24 seconds","30 seconds"], correct:2, emoji:"🏀", category:"Basketball" },
  { q:"Who invented the sport of basketball in 1891?", options:["Michael Jordan","James Naismith","Abraham Lincoln","Bill Russell"], correct:1, emoji:"🏀", category:"Basketball" },
  { q:"How many points is a free throw worth in basketball?", options:["1","2","3","4"], correct:0, emoji:"🏀", category:"Basketball" },
  { q:"What is the NBA championship trophy called?", options:["The Gold Trophy","Larry O'Brien Championship Trophy","The Ball Trophy","The Grand Cup"], correct:1, emoji:"🏀", category:"Basketball" },
  { q:"In basketball, what is a 'slam dunk'?", options:["A defensive block","Scoring by jumping and forcing ball through hoop","A behind-the-back pass","Stealing the ball"], correct:1, emoji:"🏀", category:"Basketball" },
  { q:"How many NBA teams are there?", options:["25","28","30","32"], correct:2, emoji:"🏀", category:"Basketball" },
  { q:"How many seconds does a team have to advance past half-court in the NBA?", options:["5 seconds","8 seconds","10 seconds","24 seconds"], correct:1, emoji:"🏀", category:"Basketball" },
  { q:"Which team has won the most NBA championships?", options:["Los Angeles Lakers","Boston Celtics","Chicago Bulls","Golden State Warriors"], correct:1, emoji:"🏀", category:"Basketball" },

  // ── ATHLETICS / TRACK & FIELD (15) ──
  { q:"How long is a standard marathon distance?", options:["40 km (24.8 miles)","42.195 km (26.2 miles)","45 km (28 miles)","50 km (31 miles)"], correct:1, emoji:"🏃", category:"Athletics" },
  { q:"How many hurdles are in a standard 110 m hurdles race?", options:["8","10","12","14"], correct:1, emoji:"🏃", category:"Athletics" },
  { q:"What is the standard length of an athletics track?", options:["200 m","300 m","400 m","500 m"], correct:2, emoji:"🏃", category:"Athletics" },
  { q:"How many runners are in a 4×100 m relay team?", options:["2","3","4","5"], correct:2, emoji:"🏃", category:"Athletics" },
  { q:"Which country's athlete Usain Bolt holds the 100 m world record?", options:["USA","Kenya","Jamaica","Nigeria"], correct:2, emoji:"🏃", category:"Athletics" },
  { q:"What is Usain Bolt's 100 m world record time?", options:["9.56 seconds","9.58 seconds","9.63 seconds","9.72 seconds"], correct:1, emoji:"🏃", category:"Athletics" },
  { q:"The decathlon consists of how many events?", options:["8","9","10","12"], correct:2, emoji:"🏃", category:"Athletics" },
  { q:"In athletics, what is the event where competitors throw a heavy metal ball called?", options:["Discus","Hammer","Shot put","Javelin"], correct:2, emoji:"🏃", category:"Athletics" },
  { q:"In athletics, what is the 'steeplechase' race?", options:["A race with hurdles and a water jump","A race on horseback","A cross-country race","A race with 3000 obstacles"], correct:0, emoji:"🏃", category:"Athletics" },
  { q:"Which regions have historically dominated long-distance running at the Olympics?", options:["USA","Kenya and Ethiopia","Jamaica","Germany"], correct:1, emoji:"🏃", category:"Athletics" },
  { q:"What is the high jump technique where the jumper goes over the bar backwards called?", options:["Fosbury Flop","Straddle","Scissors","Western Roll"], correct:0, emoji:"🏃", category:"Athletics" },
  { q:"The heptathlon athletics competition is for which gender?", options:["Men only","Women only","Both equally","Mixed teams"], correct:1, emoji:"🏃", category:"Athletics" },
  { q:"In track and field, which event involves athletes throwing a long spear-like implement?", options:["Discus","Hammer throw","Shot put","Javelin"], correct:3, emoji:"🏃", category:"Athletics" },
  { q:"In which event do athletes use a long pole to leap over a high bar?", options:["High jump","Pole vault","Long jump","Triple jump"], correct:1, emoji:"🏃", category:"Athletics" },
  { q:"Which Indian athlete won a historic gold medal at the 2020 Tokyo Olympics in javelin throw?", options:["Milkha Singh","P.T. Usha","Neeraj Chopra","Anju Bobby George"], correct:2, emoji:"🏃", category:"Athletics" },

  // ── CHESS (10) ──
  { q:"How many pieces does each player start with in chess?", options:["14","16","18","20"], correct:1, emoji:"♟️", category:"Chess" },
  { q:"How many squares are on a chessboard?", options:["48","56","64","72"], correct:2, emoji:"♟️", category:"Chess" },
  { q:"Which chess piece can only move diagonally?", options:["Rook","Knight","Bishop","King"], correct:2, emoji:"♟️", category:"Chess" },
  { q:"What is it called when the king is under direct attack in chess?", options:["Check","Checkmate","Stalemate","Fork"], correct:0, emoji:"♟️", category:"Chess" },
  { q:"Which is the most powerful piece in chess?", options:["King","Queen","Bishop","Rook"], correct:1, emoji:"♟️", category:"Chess" },
  { q:"What is it called when a player has no legal move but is not in check?", options:["Checkmate","Stalemate","Draw","Forfeit"], correct:1, emoji:"♟️", category:"Chess" },
  { q:"The knight in chess moves in which pattern?", options:["Straight line","Diagonal only","L-shape","Any direction one square"], correct:2, emoji:"♟️", category:"Chess" },
  { q:"What is 'pawn promotion' in chess?", options:["Moving a pawn forward 2 squares","Capturing with a pawn","Advancing a pawn to the last rank to become another piece","Protecting the king with pawns"], correct:2, emoji:"♟️", category:"Chess" },
  { q:"What is the highest title awarded by FIDE (the chess governing body)?", options:["Master","International Master","Grandmaster","Chess Champion"], correct:2, emoji:"♟️", category:"Chess" },
  { q:"Which Norwegian player became the youngest World Chess Champion in 2013?", options:["Bobby Fischer","Garry Kasparov","Magnus Carlsen","Vishy Anand"], correct:2, emoji:"♟️", category:"Chess" },

  // ── TABLE TENNIS (10) ──
  { q:"How many points win a standard table tennis game?", options:["9","11","15","21"], correct:1, emoji:"🏓", category:"Table Tennis" },
  { q:"What is the diameter of a standard table tennis ball?", options:["38 mm","40 mm","42 mm","44 mm"], correct:1, emoji:"🏓", category:"Table Tennis" },
  { q:"Which country has historically dominated world table tennis?", options:["Japan","South Korea","Germany","China"], correct:3, emoji:"🏓", category:"Table Tennis" },
  { q:"How high is the table tennis net?", options:["12.25 cm","15.25 cm","18.25 cm","20.25 cm"], correct:1, emoji:"🏓", category:"Table Tennis" },
  { q:"In which year was table tennis introduced to the Olympics?", options:["1980","1984","1988","1992"], correct:2, emoji:"🏓", category:"Table Tennis" },
  { q:"What colours must the two sides of a table tennis bat be?", options:["Red and blue","Red and black","Green and red","Yellow and black"], correct:1, emoji:"🏓", category:"Table Tennis" },
  { q:"How long is a standard table tennis table?", options:["2.4 m","2.74 m","3 m","3.5 m"], correct:1, emoji:"🏓", category:"Table Tennis" },
  { q:"What must happen at 10-10 in a table tennis game?", options:["A coin toss decides","Players must win by 2 clear points","A sudden death point","The server wins"], correct:1, emoji:"🏓", category:"Table Tennis" },
  { q:"In a table tennis serve, where must the ball bounce first?", options:["Opponent's side only","Server's side first, then over the net","Directly over the net without bouncing","Anywhere on the table"], correct:1, emoji:"🏓", category:"Table Tennis" },
  { q:"What does ITTF stand for in table tennis?", options:["International Table Tennis Federation","International Tournament for Tennis and Football","International Team Tennis Federation","International Table Tennis Forum"], correct:0, emoji:"🏓", category:"Table Tennis" },

  // ── GENERAL SPORTS (20) ──
  { q:"How many events are in a triathlon?", options:["2","3","4","5"], correct:1, emoji:"🏅", category:"General Sports" },
  { q:"Which sport uses a puck instead of a ball?", options:["Polo","Lacrosse","Ice Hockey","Curling"], correct:2, emoji:"🏒", category:"General Sports" },
  { q:"How many holes are in a standard golf course?", options:["9","12","18","24"], correct:2, emoji:"⛳", category:"General Sports" },
  { q:"How long is each round in professional boxing?", options:["2 minutes","3 minutes","4 minutes","5 minutes"], correct:1, emoji:"🥊", category:"General Sports" },
  { q:"In rugby union, how many points is a 'try' worth?", options:["3","4","5","6"], correct:2, emoji:"🏉", category:"General Sports" },
  { q:"Which sport uses terms like birdie, eagle and bogey?", options:["Tennis","Cricket","Golf","Badminton"], correct:2, emoji:"⛳", category:"General Sports" },
  { q:"How many players are on a volleyball team on the court?", options:["4","5","6","7"], correct:2, emoji:"🏐", category:"General Sports" },
  { q:"In football, what is a 'penalty corner'?", options:["Corner kick from the post","A corner kick in basketball","A set piece awarded in field hockey","A rugby corner penalty"], correct:2, emoji:"🏑", category:"General Sports" },
  { q:"What does 'par' mean in golf?", options:["A hole in one shot","The expected number of strokes for a hole","A score of one under expected","A missed putt"], correct:1, emoji:"⛳", category:"General Sports" },
  { q:"Which sport features the 'Tour de France' as its most famous race?", options:["Athletics","Horse racing","Cycling","Triathlon"], correct:2, emoji:"🚴", category:"General Sports" },
  { q:"How many players are on a baseball team in the field?", options:["8","9","10","11"], correct:1, emoji:"⚾", category:"General Sports" },
  { q:"In American football, how many points is a touchdown worth?", options:["4","5","6","7"], correct:2, emoji:"🏈", category:"General Sports" },
  { q:"What is the term for scoring one under par in golf?", options:["Eagle","Birdie","Bogey","Albatross"], correct:1, emoji:"⛳", category:"General Sports" },
  { q:"What sport takes place in a velodrome?", options:["Athletics","Swimming","Track Cycling","Roller Derby"], correct:2, emoji:"🚴", category:"General Sports" },
  { q:"How many players are in a netball team?", options:["5","6","7","8"], correct:2, emoji:"🏐", category:"General Sports" },
  { q:"In which sport would you perform a 'smash', a 'drop shot' and a 'lob'?", options:["Table Tennis","Tennis or Badminton","Squash","All of these"], correct:3, emoji:"🎾", category:"General Sports" },
  { q:"How many players are on a field hockey team?", options:["9","10","11","12"], correct:2, emoji:"🏑", category:"General Sports" },
  { q:"In which sport do players bowl, bat and field?", options:["Softball","Cricket","Baseball","Both cricket and baseball"], correct:3, emoji:"⚾", category:"General Sports" },
  { q:"The Ashes cricket series is played between England and which other country?", options:["India","New Zealand","South Africa","Australia"], correct:3, emoji:"🏏", category:"General Sports" },
  { q:"What is it called when a golfer completes a hole in just one stroke?", options:["Par","Eagle","Hole in one","Albatross"], correct:2, emoji:"⛳", category:"General Sports" },

  // ── SPORTS SCIENCE (10) ──
  { q:"What does 'aerobic' exercise primarily use for energy?", options:["Creatine","Glycogen only","Oxygen","Fat stores only"], correct:2, emoji:"🔬", category:"Sports Science" },
  { q:"What is the typical resting heart rate for a healthy adult?", options:["40–50 bpm","60–100 bpm","100–120 bpm","120–140 bpm"], correct:1, emoji:"🔬", category:"Sports Science" },
  { q:"What does 'BMI' stand for?", options:["Body Mass Index","Basic Muscle Intensity","Body Movement Index","Balance Measurement Indicator"], correct:0, emoji:"🔬", category:"Sports Science" },
  { q:"Which muscle is commonly called the 'calf muscle'?", options:["Bicep","Tricep","Gastrocnemius","Quadriceps"], correct:2, emoji:"🔬", category:"Sports Science" },
  { q:"What is the medical term for a pulled muscle?", options:["Fracture","Sprain","Strain","Contusion"], correct:2, emoji:"🔬", category:"Sports Science" },
  { q:"How many bones are in an adult human body?", options:["186","206","226","246"], correct:1, emoji:"🔬", category:"Sports Science" },
  { q:"What does 'RICE' stand for in sports injury first aid?", options:["Run, Ice, Compress, Elevate","Rest, Ice, Compression, Elevation","Recover, Immobilize, Cool, Examine","Relax, Inject, Cool, Evaluate"], correct:1, emoji:"🔬", category:"Sports Science" },
  { q:"Approximately what percentage of the adult human body is made up of water?", options:["40–50%","50–55%","60–65%","70–80%"], correct:2, emoji:"🔬", category:"Sports Science" },
  { q:"Which nutrient is the primary fuel source for high-intensity exercise?", options:["Protein","Fat","Carbohydrates","Vitamins"], correct:2, emoji:"🔬", category:"Sports Science" },
  { q:"What is 'lactic acid' most associated with in sport?", options:["Improved endurance","Muscle fatigue and burning sensation","Instant energy","Better hydration"], correct:1, emoji:"🔬", category:"Sports Science" },

  // ── FAMOUS ATHLETES (10) ──
  { q:"Which Indian cricketer is known as the 'God of Cricket'?", options:["MS Dhoni","Virat Kohli","Sachin Tendulkar","Kapil Dev"], correct:2, emoji:"⭐", category:"Famous Athletes" },
  { q:"Muhammad Ali was a legendary world champion in which sport?", options:["Wrestling","Boxing","Judo","MMA"], correct:1, emoji:"⭐", category:"Famous Athletes" },
  { q:"Roger Federer is one of the greatest players in which sport?", options:["Football","Swimming","Tennis","Badminton"], correct:2, emoji:"⭐", category:"Famous Athletes" },
  { q:"Which country does footballer Lionel Messi represent?", options:["Brazil","Spain","Portugal","Argentina"], correct:3, emoji:"⭐", category:"Famous Athletes" },
  { q:"Neeraj Chopra won India's historic Olympic gold medal in which event?", options:["100 m sprint","Long jump","Javelin throw","Triple jump"], correct:2, emoji:"⭐", category:"Famous Athletes" },
  { q:"Michael Schumacher held records as a driver in which sport?", options:["Rallying","Formula 1","NASCAR","MotoGP"], correct:1, emoji:"⭐", category:"Famous Athletes" },
  { q:"P.V. Sindhu became a world champion in which sport?", options:["Tennis","Squash","Table Tennis","Badminton"], correct:3, emoji:"⭐", category:"Famous Athletes" },
  { q:"Which basketball player was nicknamed 'Black Mamba'?", options:["LeBron James","Michael Jordan","Kobe Bryant","Shaquille O'Neal"], correct:2, emoji:"⭐", category:"Famous Athletes" },
  { q:"Milkha Singh was nicknamed 'The Flying Sikh'. In which sport did he excel?", options:["Cycling","Swimming","Athletics (sprinting)","Boxing"], correct:2, emoji:"⭐", category:"Famous Athletes" },
  { q:"Which female tennis player won a record 23 Grand Slam singles titles?", options:["Steffi Graf","Martina Navratilova","Serena Williams","Venus Williams"], correct:2, emoji:"⭐", category:"Famous Athletes" },
];

function getTodaysQuestion() {
  const startDate = new Date('2026-04-01');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  startDate.setHours(0, 0, 0, 0);
  const daysDiff = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
  const index = ((daysDiff % QUIZ_QUESTIONS.length) + QUIZ_QUESTIONS.length) % QUIZ_QUESTIONS.length;
  return { question: QUIZ_QUESTIONS[index], questionIndex: index, dayNumber: daysDiff + 1 };
}

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
let currentSubcategory = null;
let currentAgeCategory = null;
let userProfile        = null;
let blockChart         = null;
let deleteTargetId     = null;
let deleteTargetName   = null;

// ── Quiz state ──
let _quizSelectedAnswer  = null;
let _quizCurrentQuestion = null;
let _quizCurrentIndex    = null;

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
};

// ── Block graph config ──
const BLOCKS       = ['A', 'B', 'C', 'D', 'E'];
const BLOCK_COLORS = ['#0080ff', '#ff6a00', '#00e5a0', '#c84bff', '#f1c40f'];

// ── Init on page load ──
document.addEventListener('DOMContentLoaded', () => {
  buildSportsGrid();
  loadProfile();

  // Strip non-digits from flat number inputs as the user types
  ['p-flat', 'f-partner-flat'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', () => {
      el.value = el.value.replace(/\D/g, '').slice(0, 4);
    });
  });
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

function enterApp() {
  document.getElementById('greeting-name').textContent =
    `Hi, ${userProfile.name.split(' ')[0]}! 👋`;
  // Admin phone without verified PIN → show PIN screen first
  if (userProfile.phone === ADMIN_PHONE && !adminVerified) {
    document.getElementById('tab-bar').style.display = 'none';
    document.getElementById('admin-pin-input').value = '';
    showScreen('screen-admin-pin');
    return;
  }
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
    <div class="tab-item" data-tab="quiz" onclick="switchTab('quiz')">
      <span class="tab-icon">🧠</span>
      <span class="tab-dot"></span>
      <span class="tab-label">Quiz</span>
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
  currentSport       = sport;
  currentSubcategory = null;

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
        showToast('Please select a category first', true);
        return;
      }
      openRegistrationForm(sport);
    };
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
  document.getElementById('f-partner-flat').value  = '';
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

  showScreen('screen-form');
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

  // Partner fields (only when section is visible)
  const partnerVisible = document.getElementById('partner-section').style.display !== 'none';
  let partnerName = null, partnerPhone = null, partnerFlat = null;
  if (partnerVisible) {
    partnerName  = document.getElementById('f-partner-name').value.trim();
    partnerPhone = document.getElementById('f-partner-phone').value.trim();
    partnerFlat  = document.getElementById('f-partner-flat').value.trim();
    if (!partnerName)                      return showToast('Please enter partner name', true);
    if (partnerPhone.length < 10)          return showToast("Please enter partner's 10-digit phone", true);
    if (!partnerFlat)                      return showToast('Please enter partner flat number', true);
    if (!/^\d{1,4}$/.test(partnerFlat))    return showToast('Partner flat must be digits only (max 4)', true);
  }

  showLoading(true);
  try {
    await addDoc(collection(db, 'registrations'), {
      sport:        currentSport.name,
      sportEmoji:   currentSport.emoji,
      subcategory:  currentSubcategory || null,
      name,
      ageCategory,
      grade:        ageCategory === 'Under 18' ? grade : null,
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
            <span class="reg-tag">${d.ageCategory || (d.age ? 'Age ' + d.age : '')}</span>
            ${d.grade ? `<span class="reg-tag">${d.grade}</span>` : ''}
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

// ── PIC participant detail section — sport selection buttons ──
function renderPicSection(container, sports, allDocs) {
  const wrap = document.createElement('div');
  wrap.innerHTML = '<div class="admin-section-title teal">🟢 List of Sports I am Coordinating</div>';
  sports.forEach(sportName => {
    const sportObj  = SPORTS.find(s => s.name === sportName);
    const iconHTML  = sportObj && sportObj.image
      ? `<img src="${sportObj.image}" style="width:32px;height:32px;object-fit:contain" alt="${sportName}">`
      : (sportObj ? sportObj.emoji : '🏆');
    const count    = allDocs.filter(d => d.sport === sportName).length;
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
    <div class="reg-detail-card">
      <div class="reg-detail-name">${d.name || '—'}</div>
      <div class="reg-detail-tags">
        <span class="reg-detail-tag">${d.ageCategory || (d.age ? 'Age ' + d.age : '—')}</span>
        ${d.grade ? `<span class="reg-detail-tag">${d.grade}</span>` : ''}
        <span class="reg-detail-tag">${d.gender || '—'}</span>
        <span class="reg-detail-tag">Flat ${d.flat || '—'}</span>
        <span class="reg-detail-tag phone">${d.phone ? makeWhatsAppLink(d.phone, d.phone, 'small') : '—'}</span>
        ${d.subcategory ? `<span class="reg-detail-tag">${d.subcategory}</span>` : ''}
        ${d.regtype     ? `<span class="reg-detail-tag">${d.regtype}</span>`     : ''}
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

    container.innerHTML = SPORTS.map(sport => {
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
    }).join('');
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
      const slug     = sport.name.toLowerCase().replace(/\s+/g, '-');
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
              <button class="btn-save" onclick="saveSportDetails('${sport.name}')">Save Changes</button>
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
  const slug     = sportName.toLowerCase().replace(/\s+/g, '-');
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
                     'Subcategory','Partner Name','Partner Phone','Partner Flat','Registered At'];
    const rows = snap.docs.map(d => {
      const r = d.data();
      return [r.sport, r.name, r.ageCategory || '', r.grade || '', r.gender, r.regtype, r.phone, r.flat,
              r.subcategory || '', r.partnerName || '', r.partnerPhone || '',
              r.partnerFlat || '', formatTimestamp(r.registeredAt)].map(escapeCsvVal);
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
        <input type="text" id="all-regs-search" placeholder="Search by name, phone or flat…"
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
    .map(s => `
      <div class="pic-sport-heading" style="margin-top:16px">
        <span>${s.emoji}</span><span>${s.name}</span>
        <span class="reg-detail-tag">${bySport[s.name].length}</span>
      </div>
      ${bySport[s.name].map(d => `
        <div class="reg-detail-card">
          <div class="reg-detail-name">${d.name || '—'}</div>
          <div style="font-size:11px;color:var(--text3);margin-bottom:4px">
            ${d.ageCategory || (d.age ? 'Age ' + d.age : '')}${d.grade ? ' · ' + d.grade : ''} · ${d.gender || '—'} · ${d.regtype || '—'}
          </div>
          <div class="reg-detail-tags">
            <span class="reg-detail-tag phone">${d.phone ? makeWhatsAppLink(d.phone, d.phone, 'small') : '—'}</span>
            <span class="reg-detail-tag">Flat ${d.flat || '—'}</span>
            ${d.subcategory ? `<span class="reg-detail-tag">${d.subcategory}</span>` : ''}
          </div>
          ${d.partnerName || d.partnerPhone ? `
          <div style="font-size:11px;color:var(--text3);margin-top:6px">
            Partner: ${d.partnerName || '—'} · ${d.partnerPhone ? makeWhatsAppLink(d.partnerPhone, d.partnerPhone, 'small') : '—'} · ${d.partnerFlat || '—'}
          </div>` : ''}
        </div>`).join('')}`)
    .join('');
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
  const headers = ['Name','Gender','Age Category','Grade','Subcategory','Registrant Type','Flat','Phone','Partner Name','Partner Phone','Partner Flat'];
  const esc = val => {
    if (!val && val !== 0) return '';
    const s = String(val);
    return (s.includes(',') || s.includes('"') || s.includes('\n')) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  const rows = data.map(p => [
    esc(p.name), esc(p.gender), esc(p.ageCategory || ''), esc(p.grade || ''),
    esc(p.subcategory || ''), esc(p.regtype || ''), esc(p.flat),
    esc(p.phone), esc(p.partnerName || ''), esc(p.partnerPhone || ''), esc(p.partnerFlat || '')
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
      lines.push(`   Partner Flat: ${p.partnerFlat || '-'}`);
    }
    lines.push('');
  });
  lines.push('─'.repeat(50));
  lines.push('RA Olympics 2026');
  triggerDownload(lines.join('\n'), filename + '.txt', 'text/plain');
  showToast(`Downloading ${data.length} records as TXT`);
}

function downloadPDF(data, filename, sport, date) {
  const rows = data.map((p, i) => `
    <tr>
      <td>${i + 1}</td>
      <td><strong>${p.name || ''}</strong></td>
      <td>${p.gender || ''}</td>
      <td>${p.ageCategory || ''}${p.grade ? '<br/><small>' + p.grade + '</small>' : ''}</td>
      <td>${p.subcategory || '-'}</td>
      <td>${p.regtype || ''}</td>
      <td>${p.flat || ''}</td>
      <td>${p.partnerName ? p.partnerName + '<br/><small>' + (p.partnerFlat || '') + '</small>' : '-'}</td>
    </tr>`).join('');
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
    <thead><tr><th>#</th><th>Name</th><th>Gender</th><th>Age</th><th>Category</th><th>Type</th><th>Flat</th><th>Partner</th></tr></thead>
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
  const today   = new Date();
  const dateStr = today.toISOString().split('T')[0];

  const dayNames   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const monthNames = ['January','February','March','April','May','June',
                      'July','August','September','October','November','December'];
  const dayName   = dayNames[today.getDay()];
  const dayNum    = String(today.getDate()).padStart(2, '0');
  const monthName = monthNames[today.getMonth()];
  const year      = today.getFullYear();

  const { question, questionIndex, dayNumber } = getTodaysQuestion();

  document.getElementById('quiz-date-banner').innerHTML = `
    <div class="date-banner-card">
      <div class="date-banner-day">${dayNum}</div>
      <div class="date-banner-info">
        <div class="date-banner-weekday">${dayName}</div>
        <div class="date-banner-full">${monthName} ${year} · Question #${dayNumber}</div>
      </div>
      <div class="date-banner-emoji">${question.emoji}</div>
    </div>`;

  const answerDocId = userProfile.phone + '_' + dateStr;
  showLoading(true);
  try {
    const answerSnap = await getDoc(doc(db, 'quizAnswers', answerDocId));
    const scoreSnap  = await getDoc(doc(db, 'quizScores', userProfile.phone));
    const totalPoints    = scoreSnap.exists() ? scoreSnap.data().totalPoints    : 0;
    const correctAnswers = scoreSnap.exists() ? scoreSnap.data().correctAnswers : 0;
    const totalAnswered  = scoreSnap.exists() ? scoreSnap.data().totalAnswered  : 0;

    document.getElementById('quiz-score-pill').textContent = totalPoints + ' pts';

    if (answerSnap.exists()) {
      renderQuizAnswered(question, answerSnap.data(), totalPoints, correctAnswers, totalAnswered);
    } else {
      renderQuizQuestion(question, questionIndex);
    }
    loadQuizLeaderboard();
  } catch (err) {
    console.error(err);
    document.getElementById('quiz-content').innerHTML =
      '<div class="quiz-error">Could not load quiz. Please try again.</div>';
  } finally {
    showLoading(false);
  }
}

function renderQuizQuestion(question, questionIndex) {
  _quizSelectedAnswer  = null;
  _quizCurrentQuestion = question;
  _quizCurrentIndex    = questionIndex;

  const letters = ['A', 'B', 'C', 'D'];
  document.getElementById('quiz-content').innerHTML = `
    <div class="quiz-q-card">
      <div class="quiz-q-category">${question.category}</div>
      <span class="quiz-q-emoji">${question.emoji}</span>
      <div class="quiz-q-text">${question.q}</div>
    </div>
    <div class="quiz-options" id="quiz-options-list">
      ${question.options.map((opt, i) => `
        <button class="quiz-option" data-index="${i}" onclick="selectQuizOption(${i})">
          <span class="quiz-option-letter">${letters[i]}</span>
          <span>${opt}</span>
        </button>`).join('')}
    </div>
    <button class="quiz-submit-btn" id="quiz-submit-btn" disabled onclick="submitQuizAnswerWrap()">
      Submit Answer →
    </button>`;
}

function selectQuizOption(index) {
  _quizSelectedAnswer = index;
  document.querySelectorAll('.quiz-option').forEach((el, i) => {
    el.classList.toggle('selected', i === index);
  });
  const btn = document.getElementById('quiz-submit-btn');
  if (btn) btn.disabled = false;
}

function submitQuizAnswerWrap() {
  submitQuizAnswer(_quizCurrentQuestion, _quizCurrentIndex, _quizSelectedAnswer);
}

async function submitQuizAnswer(question, questionIndex, selectedIndex) {
  if (selectedIndex === null) return;

  const today   = new Date();
  const dateStr = today.toISOString().split('T')[0];
  const isCorrect = selectedIndex === question.correct;
  const points    = isCorrect ? 10 : 0;

  showLoading(true);
  try {
    const answerDocId = userProfile.phone + '_' + dateStr;
    await setDoc(doc(db, 'quizAnswers', answerDocId), {
      phone:          userProfile.phone,
      name:           userProfile.name,
      date:           dateStr,
      questionIndex:  questionIndex,
      selectedAnswer: selectedIndex,
      isCorrect:      isCorrect,
      points:         points,
      answeredAt:     serverTimestamp()
    });

    const scoreRef  = doc(db, 'quizScores', userProfile.phone);
    const scoreSnap = await getDoc(scoreRef);
    if (scoreSnap.exists()) {
      const ex = scoreSnap.data();
      await setDoc(scoreRef, {
        phone:          userProfile.phone,
        name:           userProfile.name,
        flat:           userProfile.flat,
        totalPoints:    ex.totalPoints    + points,
        totalAnswered:  ex.totalAnswered  + 1,
        correctAnswers: ex.correctAnswers + (isCorrect ? 1 : 0),
        lastAnswered:   dateStr,
        updatedAt:      serverTimestamp()
      });
    } else {
      await setDoc(scoreRef, {
        phone:          userProfile.phone,
        name:           userProfile.name,
        flat:           userProfile.flat,
        totalPoints:    points,
        totalAnswered:  1,
        correctAnswers: isCorrect ? 1 : 0,
        lastAnswered:   dateStr,
        updatedAt:      serverTimestamp()
      });
    }

    loadQuizScreen();
  } catch (err) {
    console.error(err);
    showToast('Could not save answer. Try again.', true);
  } finally {
    showLoading(false);
  }
}

function renderQuizAnswered(question, answerData, totalPoints, correctAnswers, totalAnswered) {
  const letters   = ['A', 'B', 'C', 'D'];
  const selected  = answerData.selectedAnswer;
  const correct   = question.correct;
  const isCorrect = answerData.isCorrect;

  const resultHTML = isCorrect
    ? `<div class="quiz-result-correct">
        <div class="quiz-result-icon">🎉</div>
        <div class="quiz-result-title">Correct!</div>
        <div class="quiz-result-sub">You earned +10 points. Well done!</div>
       </div>`
    : `<div class="quiz-result-wrong">
        <div class="quiz-result-icon">😔</div>
        <div class="quiz-result-title">Not quite!</div>
        <div class="quiz-result-sub">Better luck tomorrow!</div>
        <div class="quiz-result-correct-answer">
          Correct answer: <strong>${letters[correct]}. ${question.options[correct]}</strong>
        </div>
       </div>`;

  const optionsHTML = question.options.map((opt, i) => {
    let cls = 'quiz-option disabled';
    if (i === correct)                     cls += ' correct';
    else if (i === selected && !isCorrect) cls += ' wrong';
    return `<div class="${cls}">
      <span class="quiz-option-letter">${letters[i]}</span>
      <span>${opt}</span>
    </div>`;
  }).join('');

  document.getElementById('quiz-content').innerHTML = `
    <div class="quiz-answered-banner">You have already answered today's question.</div>
    ${resultHTML}
    <div class="quiz-q-card" style="margin-bottom:14px">
      <div class="quiz-q-category">${question.category}</div>
      <span class="quiz-q-emoji">${question.emoji}</span>
      <div class="quiz-q-text">${question.q}</div>
    </div>
    <div class="quiz-options" style="margin-bottom:16px">${optionsHTML}</div>
    <div class="quiz-personal-score">
      <div class="quiz-score-value">${totalPoints}</div>
      <div class="quiz-score-label">total points · ${correctAnswers} correct out of ${totalAnswered} answered</div>
    </div>
    <div class="quiz-tomorrow-text">Come back tomorrow for the next question!</div>`;
}

async function loadQuizLeaderboard() {
  const lb = document.getElementById('quiz-leaderboard');
  if (!lb) return;
  lb.innerHTML = '<div class="leaderboard-loading">Loading…</div>';
  try {
    const snap = await getDocs(collection(db, 'quizScores'));
    const all  = snap.docs.map(d => d.data());
    all.sort((a, b) => b.totalPoints - a.totalPoints);
    const top10 = all.slice(0, 10);

    if (!top10.length) {
      lb.innerHTML = '<div class="leaderboard-loading">No scores yet. Be the first!</div>';
      return;
    }

    lb.innerHTML = top10.map((entry, i) => {
      const rank = i + 1;
      const rankClass = rank === 1 ? 'gold' : rank === 2 ? 'silver' : rank === 3 ? 'bronze' : '';
      const isMe = entry.phone === userProfile.phone;
      return `
        <div class="leaderboard-row${isMe ? ' me' : ''}">
          <div class="leaderboard-rank ${rankClass}">${rank}</div>
          <div class="leaderboard-info">
            <div class="leaderboard-name">${entry.name}${isMe ? ' (You)' : ''}</div>
            <div class="leaderboard-flat">Flat ${entry.flat || '—'}</div>
          </div>
          <div>
            <div class="leaderboard-points">${entry.totalPoints}</div>
            <div class="leaderboard-correct">${entry.correctAnswers || 0} correct</div>
          </div>
        </div>`;
    }).join('');
  } catch (err) {
    console.error(err);
    lb.innerHTML = '<div class="leaderboard-loading">Could not load leaderboard.</div>';
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
window.toggleSportEditCard     = toggleSportEditCard;
window.saveSportDetails        = saveSportDetails;
window.postAnnouncement        = postAnnouncement;
window.clearAnnouncement       = clearAnnouncement;
window.exportCSV               = exportCSV;
window.filterAllRegs           = filterAllRegs;
window.selectQuizOption        = selectQuizOption;
window.submitQuizAnswerWrap    = submitQuizAnswerWrap;
window.toggleFilterPanel       = toggleFilterPanel;
window.toggleFilter            = toggleFilter;
window.clearAllFilters         = clearAllFilters;
window.downloadParticipants    = downloadParticipants;
