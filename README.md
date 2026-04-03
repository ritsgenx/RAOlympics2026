# Apartment Sports Fest App
## Complete setup guide — Firebase + Vercel (both free)

---

## STEP 1 — Set up Firebase (5 minutes)

1. Go to https://console.firebase.google.com
2. Click **Add project** → name it "apartment-sports" → click Continue
3. Disable Google Analytics (not needed) → click **Create project**
4. Once created, click **Firestore Database** in the left menu
5. Click **Create database** → choose **Start in test mode** → click Next
6. Select region: **asia-south1 (Mumbai)** → click **Enable**

### Create the two collections (your database tables):

**Collection 1 — users**
- Click **Start collection** → Collection ID: `users` → click Next
- Add first document with fields:
  - name (string): "test"
  - phone (string): "0000000000"
  - flat (string): "1A"
- Click **Save**

**Collection 2 — registrations**
- Click **Start collection** → Collection ID: `registrations` → click Next
- Add first document with fields:
  - sport (string): "test"
  - name (string): "test"
  - phone (string): "0000000000"
  - flat (string): "1A"
  - age (number): 0
  - gender (string): "test"
  - regtype (string): "test"
- Click **Save**

*(You can delete these test documents later — they are just to create the collection structure)*

---

## STEP 2 — Get your Firebase config (2 minutes)

1. In Firebase console, click the **gear icon** (⚙️) → **Project Settings**
2. Scroll down to **Your apps** section
3. Click the **</>** (Web) button
4. Give your app a nickname: "apartment-sports-web" → click **Register app**
5. You will see a code block like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "apartment-sports.firebaseapp.com",
  projectId: "apartment-sports",
  storageBucket: "apartment-sports.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

6. Copy these values — you need them in the next step.

---

## STEP 3 — Add your Firebase config to the app (1 minute)

Open the file: `js/main.js`

Find this section near the top:

```javascript
const firebaseConfig = {
  apiKey:            "REPLACE_WITH_YOUR_API_KEY",
  authDomain:        "REPLACE_WITH_YOUR_PROJECT_ID.firebaseapp.com",
  projectId:         "REPLACE_WITH_YOUR_PROJECT_ID",
  storageBucket:     "REPLACE_WITH_YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "REPLACE_WITH_YOUR_MESSAGING_SENDER_ID",
  appId:             "REPLACE_WITH_YOUR_APP_ID"
};
```

Replace each "REPLACE_WITH_..." value with the real values from Step 2.

**Example after filling in:**
```javascript
const firebaseConfig = {
  apiKey:            "AIzaSyAbc123xyz",
  authDomain:        "apartment-sports.firebaseapp.com",
  projectId:         "apartment-sports",
  storageBucket:     "apartment-sports.appspot.com",
  messagingSenderId: "987654321",
  appId:             "1:987654321:web:def456"
};
```

Save the file.

---

## STEP 4 — Fix Firebase security rules (important!)

By default Firestore is in test mode (open for 30 days). To make it permanently readable/writable without login:

1. In Firebase console → Firestore Database → **Rules** tab
2. Replace the rules with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

3. Click **Publish**

*(This is fine for a private community app. Nobody outside your apartment will know the URL.)*

---

## STEP 5 — Deploy to Vercel (3 minutes)

1. Go to https://github.com and create a free account if you don't have one
2. Click **+** → **New repository** → name it "apartment-sports"
3. Set it to **Public** → click **Create repository**
4. Upload your files:
   - Click **uploading an existing file**
   - Drag and drop all your files (index.html, css/, js/ folders)
   - Click **Commit changes**

5. Go to https://vercel.com → Sign up with your GitHub account
6. Click **Add New Project** → Import your "apartment-sports" repository
7. Click **Deploy** (no settings to change)
8. Vercel gives you a free URL like: `apartment-sports.vercel.app`

**Share this URL with your residents via WhatsApp! 🎉**

---

## STEP 6 — Monitor registrations (as admin)

To see all registrations:
1. Go to https://console.firebase.google.com
2. Click your project → **Firestore Database**
3. Click the **registrations** collection
4. You see every registration from every resident in real time!

To export to Excel:
- In Firestore, there's no direct export on free plan
- But you can use https://tableplus.com or simply read each document
- Or add a simple admin view — let me know if you want that

---

## File structure
```
apartment-sports/
├── index.html          ← Main app (all 5 screens)
├── css/
│   └── style.css       ← All styles
├── js/
│   └── main.js         ← App logic + Firebase (edit this)
└── README.md           ← This guide
```

---

## Customising your app

**Change the app name:**
In `index.html`, find "Sports Fest" and "Apartment Community · 2025" and change them.

**Add or remove sports:**
In `js/main.js`, find the `SPORTS` array and edit the list.

**Change the year:**
In `index.html`, find "2025" and update it.

---

## Total cost: ₹0 forever
- Firebase free tier: 50,000 reads/day, 20,000 writes/day (you'll use ~500/day max)
- Vercel free tier: unlimited bandwidth for static sites
- GitHub free: unlimited public repos
