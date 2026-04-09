# TalentMetrics — AI-Powered Interview Platform

> **Automating First-Round Interviews with AI — Screening, Scoring, and Ranking Candidates Efficiently**

A full-stack web application that automates the first round of interviews using AI. Candidates apply, take AI-based screening, and are evaluated, scored, and ranked automatically. Recruiters get a real-time leaderboard to shortlist top talent instantly.

---

## Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Frontend   | React.js 18 + React Router v6           |
| Styling    | Pure CSS (custom design system)         |
| Backend    | Node.js + Express.js                    |
| Auth       | Firebase Authentication (Email/Password)|
| Database   | Firebase Firestore                      |
| API Client | Axios (auto Bearer token injection)     |

---

## Project Structure

```
TalentMetrics/
│
├── backend/
│   ├── .env.example                  ← Firebase Admin SDK config template
│   ├── package.json
│   └── src/
│       ├── index.js                  ← Express server entry point
│       ├── config/
│       │   └── firebase.js           ← Firebase Admin SDK initialization
│       ├── middleware/
│       │   └── auth.js               ← verifyToken + requireRole guards
│       └── routes/
│           ├── auth.js               ← POST /register, POST /login, GET /me
│           └── interview.js          ← start-interview, submit-answers,
│                                        get-results, get-ranking,
│                                        my-results, all-candidates
│
└── frontend/
    ├── .env.example                  ← Firebase Web SDK config template
    ├── package.json
    ├── public/
    │   └── index.html
    └── src/
        ├── index.js                  ← React entry point
        ├── App.jsx                   ← Router + PrivateRoute + PublicOnly guards
        ├── context/
        │   └── AuthContext.js        ← Firebase signUp/signIn/logOut + state
        ├── utils/
        │   ├── firebase.js           ← Firebase client SDK init
        │   └── api.js                ← Axios wrapper with auto Bearer token
        ├── components/
        │   ├── Navbar.jsx            ← Top navigation bar
        │   ├── Sidebar.jsx           ← Dashboard side navigation
        │   ├── Modal.jsx             ← Reusable modal dialog
        │   ├── Loader.jsx            ← Full-screen loading screen
        │   └── Toast.jsx             ← Global toast notifications
        ├── pages/
        │   ├── LandingPage.jsx       ← Hero + Features + HIW + CTA + Footer
        │   ├── AuthPage.jsx          ← Login + Register (real Firebase Auth)
        │   ├── CandidateDashboard.jsx← Jobs, History, Results, Profile tabs
        │   ├── InterviewPage.jsx     ← Timer, MCQ, Written, Submit
        │   ├── ResultsPage.jsx       ← Score ring, AI feedback, Leaderboard
        │   └── RecruiterDashboard.jsx← Overview, Candidates, Jobs, Settings
        └── styles/
            ├── globals.css           ← Design tokens + shared components
            ├── landing.css           ← Hero, features, HIW sections
            ├── auth.css              ← Login/register split layout
            ├── dashboard.css         ← Candidate dashboard extras
            ├── interview.css         ← Interview page styles
            ├── results.css           ← Results + leaderboard styles
            └── recruiter.css         ← Recruiter dashboard styles
```

---

## API Routes

### Auth Routes
| Method | Route               | Auth Required | Description                              |
|--------|---------------------|---------------|------------------------------------------|
| POST   | /api/auth/register  | ❌ No         | Create Firestore profile + set role claim |
| POST   | /api/auth/login     | ✅ Yes        | Verify token + return Firestore profile   |
| GET    | /api/auth/me        | ✅ Yes        | Return current user's profile             |

### Interview Routes
| Method | Route                              | Auth | Role      | Description                    |
|--------|------------------------------------|------|-----------|--------------------------------|
| POST   | /api/interview/start-interview     | ✅   | candidate | Start session, return questions|
| POST   | /api/interview/submit-answers      | ✅   | candidate | Score + store result           |
| GET    | /api/interview/get-results/:id     | ✅   | any       | Fetch one result               |
| GET    | /api/interview/get-ranking/:jobId  | ✅   | any       | Leaderboard for a role         |
| GET    | /api/interview/my-results          | ✅   | candidate | All results for this candidate |
| GET    | /api/interview/all-candidates      | ✅   | recruiter | All submissions (recruiter only)|

---

## Setup Instructions

### Step 1 — Create Firebase Project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project** → name it `talentmetrics` → Create
3. In your project, go to **Authentication** → **Get started** → **Email/Password** → Enable → Save
4. Go to **Firestore Database** → **Create database** → choose **Start in test mode** → Select your region → Done

### Step 2 — Get Firebase Web Config (for Frontend)

1. Go to **Project Settings** (gear icon) → **Your apps** tab
2. Click **Add app** → Web icon `</>`
3. Register app with nickname `TalentMetrics Web` → **Register app**
4. Copy the `firebaseConfig` object — you'll need these values for `frontend/.env`

### Step 3 — Get Firebase Admin SDK (for Backend)

1. Go to **Project Settings** → **Service accounts** tab
2. Click **Generate new private key** → **Generate key**
3. A JSON file downloads — open it and copy values for `backend/.env`

### Step 4 — Set Firestore Security Rules

In Firebase Console → Firestore → **Rules** tab, paste:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users can read/write their own profile
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }

    // Interviews: candidates can read their own; backend writes via Admin SDK
    match /interviews/{id} {
      allow read: if request.auth != null;
      allow write: if false; // Admin SDK only
    }

    // Results: authenticated users can read; backend writes via Admin SDK
    match /results/{id} {
      allow read: if request.auth != null;
      allow write: if false; // Admin SDK only
    }
  }
}
```

Click **Publish**.

---

### Step 5 — Configure Backend

```bash
cd backend

# Copy environment template
cp .env.example .env
```

Open `backend/.env` and fill in the values from your downloaded Firebase Admin JSON:

```env
PORT=5000
FRONTEND_URL=http://localhost:3000

FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nYOUR_ACTUAL_KEY\n-----END RSA PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=123456789
FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com
```

> ⚠️ Important: The `FIREBASE_PRIVATE_KEY` must have `\n` (literal backslash-n) for line breaks, not actual newlines.

Install dependencies and start:

```bash
npm install
npm run dev     # development (nodemon)
# OR
npm start       # production
```

You should see:
```
╔══════════════════════════════════════╗
║     TalentMetrics API Server         ║
║     http://localhost:5000            ║
╚══════════════════════════════════════╝

✅  Firebase Admin SDK ready — Project: your-project-id
```

---

### Step 6 — Configure Frontend

```bash
cd frontend

# Copy environment template
cp .env.example .env
```

Open `frontend/.env` and fill in values from your Firebase Web App config:

```env
REACT_APP_FIREBASE_API_KEY=AIzaSy...
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abcdef

REACT_APP_API_URL=https://talent-metrics-backend.vercel.app/api
```

Install and start:

```bash
npm install
npm start
```

App opens at **http://localhost:3000**

---

## How Firebase Auth Works End-to-End

```
REGISTER FLOW
─────────────
1. User fills form → clicks "Create Account"
2. React calls: createUserWithEmailAndPassword(auth, email, password)
   → Firebase creates account, returns credential with UID
3. React calls: POST /api/auth/register { uid, name, email, role }
   → Backend calls: admin.auth().setCustomUserClaims(uid, { role })
   → Backend writes Firestore doc: users/{uid}
4. React calls: user.getIdToken(true) to force token refresh
   → New token now contains the role claim
5. User redirected to /dashboard or /recruiter

LOGIN FLOW
──────────
1. User enters credentials → clicks "Sign In"
2. React calls: signInWithEmailAndPassword(auth, email, password)
   → Firebase validates, returns credential
3. React calls: POST /api/auth/login  (Authorization: Bearer <idToken>)
   → Backend verifies token via admin.auth().verifyIdToken()
   → Backend fetches Firestore profile, returns name + role
4. User redirected based on role

EVERY API CALL
──────────────
1. Axios interceptor calls: auth.currentUser.getIdToken()
2. Token attached as: Authorization: Bearer <firebase-id-token>
3. Backend middleware verifies with: admin.auth().verifyIdToken(token)
4. req.user = { uid, email, role } available in all route handlers
```

---

## Available Job Roles & Question Types

| Role               | Questions | Types              |
|--------------------|-----------|--------------------|
| Software Engineer  | 8         | 5 MCQ + 3 Written  |
| Data Analyst       | 8         | 5 MCQ + 3 Written  |
| Product Manager    | 8         | 5 MCQ + 3 Written  |
| UX Designer        | 8         | 5 MCQ + 3 Written  |
| DevOps Engineer    | 8         | 5 MCQ + 3 Written  |
| Marketing Analyst  | 6         | 3 MCQ + 3 Written  |

### AI Scoring Logic
- **MCQ**: Full points for correct answer, 0 for wrong
- **Written (50+ words)**: Full points — "Well-detailed answer"
- **Written (20–49 words)**: 60% points — "Adequate but needs more depth"
- **Written (5–19 words)**: 25% points — "Too brief"
- **Written (<5 words)**: 0 points — "No meaningful answer"
- **Passing threshold**: 60%

---

## Pages Overview

| Page                  | Route               | Access    |
|-----------------------|---------------------|-----------|
| Landing Page          | /                   | Public    |
| Auth (Login/Register) | /auth               | Public    |
| Candidate Dashboard   | /dashboard          | Candidate |
| AI Interview          | /interview/:jobId   | Candidate |
| Results & Ranking     | /results/:resultId  | Any auth  |
| Recruiter Dashboard   | /recruiter          | Recruiter |

---

## Color Theme

| Token          | Hex       | Usage                        |
|----------------|-----------|------------------------------|
| `--forest`     | `#0d2b1e` | Primary dark green           |
| `--emerald`    | `#16a34a` | Action green                 |
| `--gold-light` | `#f0c040` | Gold accent                  |
| `--cream`      | `#fafaf7` | Page background              |
| `--ink`        | `#0a1628` | Primary text                 |

---

## Common Issues & Fixes

**`FIREBASE_PRIVATE_KEY` newline error**
```
# Wrong in .env:
FIREBASE_PRIVATE_KEY=-----BEGIN RSA PRIVATE KEY-----
your key here
-----END RSA PRIVATE KEY-----

# Correct in .env (literal \n):
FIREBASE_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nYOUR_KEY\n-----END RSA PRIVATE KEY-----\n"
```

**CORS error from frontend**
- Ensure `FRONTEND_URL=http://localhost:3000` is in `backend/.env`
- Make sure backend is running on port 5000
- Check `REACT_APP_API_URL=http://localhost:5000/api` in `frontend/.env`

**"User profile not found" on login**
- User registered via Firebase Auth but `/api/auth/register` was not called
- Solution: Delete the user in Firebase Console → Auth → Users, then re-register through the app

**Custom role claim not working**
- After `setCustomUserClaims`, the frontend must call `user.getIdToken(true)` to force a token refresh
- This is already handled in `AuthContext.js` `signUp` function

---

## Deployment

### Backend (Railway / Render / Fly.io)
```bash
cd backend
# Add all .env variables to your hosting platform's environment settings
# Deploy command:
npm start
```

### Frontend (Vercel / Netlify)
```bash
cd frontend
npm run build
# Deploy the /build folder
# Add all REACT_APP_* environment variables in platform settings
```

---

*Built with ❤️ using React, Node.js, Express, and Firebase*
