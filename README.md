# AFM Paddy AI 🌾

AFM Paddy AI is an intelligent, full-stack web application designed for Malaysian paddy (rice) farmers. It leverages cutting-edge Generative AI (Gemini 2.5 Flash) and real-time data sources to analyze farm conditions, track crop health, generate actionable farming plans, and persist all intelligence in a Firebase backend — all powered by a modern Next.js 16 App Router architecture.

---

## 🚀 Features Implemented

### 🤖 AI Farm Plan Generation
- Accepts crop health, market conditions, and optimization goals
- Powered by **Google Gemini 2.5 Flash** via native `fetch()` — no external SDK
- Returns a fully structured JSON plan including:
  - 30-day action timeline (water, fertilizer, pest, harvest, monitor, soil)
  - Hidden risk identification
  - Market strategy
  - AI reasoning explanations
  - Confidence score
  - Image analysis (when crop photo is provided)
- **Automatic retry system**: If Gemini returns a 503 busy error, the system automatically waits 1.5s and retries once before failing

### 🌤️ Live Weather Integration
- Real-time weather data fetched from **OpenWeatherMap API**
- Hosted at `/api/weather`
- Returns temperature, humidity, and rain probability
- Weather is automatically injected into every AI farm plan — no manual entry required
- Default location: **Kedah, Malaysia**

### 🔔 Smart Alert System
- Automatically generates farm-specific alerts based on real-time data:
  - Rain probability > 70% → warns to delay fertilizer
  - Temperature > 35°C → heat stress warning
  - Humidity > 85% → fungal disease risk alert
  - Active pest presence → immediate action alert
  - High overall farm risk → priority follow-up alert

### 🔥 Firebase Firestore Persistence
- Every AI-generated farm plan is **automatically saved** to Firestore (`farmPlans` collection)
- Includes: weather snapshot, crop health, market data, AI plan, alerts, and timestamp
- Prepared with optional `imageUrl` field for future image analysis integration
- Non-fatal write: if Firestore is unavailable, the API still responds to the user

### 📜 Farm History API
- Hosted at `/api/farm-history`
- Fetches the **latest 10 farm plans** ordered by `createdAt DESC`
- Includes **pattern detection** — analyzes last 5 entries for recurring issues:
  - Nitrogen deficiency
  - Rice blast risk
  - Pest activity
  - High rain probability
  - Fungal disease risk
  - Drought/water stress

### 👤 User Profile System
- Hosted at `/api/user`
- `POST /api/user` — Save or update user profile (userId, location, cropType)
- `GET /api/user?userId=xxx` — Retrieve user profile
- Stored in Firestore `users` collection with merge support

### 🖼️ Firebase Storage Support (Helper Ready)
- `uploadImage(file: Blob)` helper exported from `lib/firebase.ts`
- Uploads images to Firebase Storage under `farm-images/`
- Returns public download URL
- Ready to integrate with crop image analysis feature

### 🧪 Firebase Test Endpoint
- `/api/test-firebase` — Quick connectivity check for Firestore

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16 (App Router)](https://nextjs.org/) |
| **UI Library** | [React 19](https://react.dev/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) |
| **Language** | TypeScript |
| **AI/LLM** | [Google Gemini 2.5 Flash](https://ai.google.dev/) |
| **Weather** | [OpenWeatherMap API](https://openweathermap.org/api) |
| **Database** | [Firebase Firestore](https://firebase.google.com/products/firestore) |
| **Storage** | [Firebase Storage](https://firebase.google.com/products/storage) |

---

## 📁 Project Structure

```
afm-paddy-ai/
├── app/
│   ├── api/
│   │   ├── generate-plan/   # Core AI farm plan generation
│   │   ├── weather/         # Real-time OpenWeather integration
│   │   ├── farm-history/    # Firestore history + pattern detection
│   │   ├── user/            # User profile CRUD
│   │   └── test-firebase/   # Firebase connectivity test
│   ├── components/          # FarmForm, ResultDisplay, RiskMeter, etc.
│   ├── page.tsx             # Main application UI
│   └── layout.tsx
├── lib/
│   └── firebase.ts          # Firebase init, db, storage, uploadImage()
├── .env.local               # API keys (never committed)
└── README.md
```

---

## 📦 Prerequisites

- **Node.js** v20.x or higher — [nodejs.org](https://nodejs.org/)
- **Git** — to clone and manage the repository
- **Gemini API Key** — from [Google AI Studio](https://aistudio.google.com/app/apikey)
- **OpenWeather API Key** — free key from [openweathermap.org](https://openweathermap.org/api)
- **Firebase Project** — from [console.firebase.google.com](https://console.firebase.google.com/)
  - Enable **Firestore Database** (Start in Test Mode)
  - Enable **Firebase Storage**

---

## 🛠 How to Set Up and Run Locally

### 1. Clone the Repository
```bash
git clone https://github.com/KapArnav/afm-paddy-ai.git
cd afm-paddy-ai
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables
Create a `.env.local` file in the root directory:

```env
# AI
GEMINI_API_KEY=your_gemini_api_key_here

# Weather
WEATHER_API_KEY=your_openweather_api_key_here

# Firebase (from your Firebase project settings)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

> ⚠️ Never commit `.env.local` to GitHub. It is already protected by `.gitignore`.

### 4. Start the Development Server
```bash
npm run dev
```

### 5. Open the App
Visit [http://localhost:3000](http://localhost:3000)

---

## 🔌 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/generate-plan` | Generate AI farm plan (saves to Firestore) |
| `GET` | `/api/weather` | Fetch real-time weather for Kedah |
| `GET` | `/api/farm-history` | Fetch last 10 plans + pattern detection |
| `POST` | `/api/user` | Save/update user profile |
| `GET` | `/api/user?userId=xxx` | Fetch user profile |
| `GET` | `/api/test-firebase` | Test Firestore connectivity |

---

## 🌿 Branch Strategy

| Branch | Purpose |
|---|---|
| `main` | Stable, production-ready code |
| `feature/weather-api` | OpenWeather API integration |
| `feature/integrate-weather` | Injecting weather data into AI prompt |
| `feature/firebase-integration` | Full Firebase persistence layer |

---

## 💡 Future Enhancements
- Crop image upload with AI visual disease detection
- Multi-language support (Malay/English)
- Notifications and offline PWA mode
- Real-time Firestore listeners for live dashboard updates
- Tighten Firebase Security Rules before production deployment
