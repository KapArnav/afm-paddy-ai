# AFM Paddy AI 🌾 — Strategic Farm Intelligence

AFM Paddy AI is an elite, autonomous farm management platform designed for Malaysian paddy (rice) farmers. By synthesizing real-time data from weather, market, and visual agents with **Google Gemini 1.5 Flash**, it provides high-precision, actionable farming strategies that evolve with the environment.

---

## 🌟 Elite Features

### 🧠 Multi-Agent AI Strategist
- **Autonomous Synthesis**: Combines **Weather**, **Market**, and **Visual** agent data into a cohesive 30-day operational plan.
- **Actionable Roadmaps**: Generates exactly **3 professional implementation steps** for every timeline task, providing a granular guide from seed to harvest.
- **Deep Strategic Reasoning**: Provides the "Why" behind every action (e.g., explaining moisture management based on precise rainfall forecasts).

### 📊 Real-Time Connectivity
- **🌤️ Dynamic Weather Agent**: Injects live Kedah-region weather forecasts (temperature, rain, humidity) directly into AI planning logic.
- **📉 Market Intelligence Agent**: Analyzes crop price trends and demand to recommend high-yield "Sell/Hold" strategies.
- **🔬 Visual Guard (Vision API)**: Analyzes crop photos to detect nutrient deficiencies, pests, and leaf discoloration with AI precision.

### ⚡ Professional Farm Dashboard
- **Expandable Strategy Roadmap**: An interactive 30-day timeline where every task can be expanded to reveal implementation steps and reasoning.
- **Intelligence Notification Center**: A dedicated alert panel for real-time farm warnings (e.g., rainfall stress, pest peaks, market fluctuations).
- **Synchronized State**: The dashboard automatically hydrates from an active AI strategy, calculating "Today's Primary Task" dynamically based on elapsed time.

### 🗂️ Farm Intelligence Archive (History)
- **Deep Historical Recall**: Access every strategy ever generated. 
- **Plan Detail Restoration**: Clicking any historical record restores the full Result View, allowing for detailed comparative analysis of past strategies.
- **Data Integrity**: Powered by **Firebase Firestore**, ensuring lightning-fast persistence and secure cross-device synchronization.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 15 (App Router)](https://nextjs.org/) |
| **UI Library** | [React 19](https://react.dev/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) |
| **Core AI** | [Google Gemini 1.5 Flash](https://ai.google.dev/) |
| **Persistence** | [Firebase (Firestore & Auth)](https://firebase.google.com/) |
| **Icons** | [Lucide React](https://lucide.dev/) |

---

## 🚀 Getting Started

### 1. Requirements
- **Gemini API Key** (Google AI Studio)
- **Firebase Project** (Firestore & Auth enabled)
- **OpenWeather API Key**

### 2. Environment Setup (`.env.local`)
```env
GEMINI_API_KEY=your_key
WEATHER_API_KEY=your_key

# Firebase Config
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

### 3. Deployment
```bash
npm install
npm run dev
```

---

## 🛡️ Audit & Certification
This platform has undergone a comprehensive **System-Wide Audit (Lead Auditor Sweep)**.
- **UX Stability**: Navigation flows, loading states, and auth-redirections are 100% verified.
- **Feature Connectivity**: All historical records are active and restorable.
- **Data Integrity**: Hardened Firestore/LocalStorage synchronization logic.

*Detailed logs available in [AUDIT_LOG.md](./AUDIT_LOG.md).*

---

## 🌿 Project Structure
- `/app/api`: Autonomous agents (Weather, Market, Visual, Strategy).
- `/app/generate`: Multi-step strategic planning flow.
- `/app/history`: Archive of farming intelligence.
- `/components`: Premium UI components (Timeline, RiskBadge, MarketWidget).

---

Developed for the future of Malaysian Agriculture. 🚜💨
