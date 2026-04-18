# AFM Paddy AI: Autonomous Farm Manager 🌾🤖

AFM Paddy AI is a production-ready, multi-agent AI framework designed specifically for paddy farmers in Malaysia. It utilizes the Gemini AI engine to synthesize environmental, visual, and market data into actionable farming strategies.

## 🚀 Core Features
- **Parallel Agent Orchestration**: Synthesizes inputs from Weather, Market, and Visual agents simultaneously for optimal latency.
- **AI Vision Analysis**: Identifies pests, diseases, and nutrient deficiencies from field photos.
- **Dynamic 30-Day Planning**: Generates day-by-day action timelines tailored to crop growth stages.
- **Market Intel**: Provides "Buy/Sell/Wait" strategies based on real-time market signals.
- **Zero-Trust Security**: Implements strict UID verification across all API routes to ensure user data isolation.

## 🛠️ Tech Stack
- **Frontend**: Next.js 14, Tailwind CSS, Lucide Icons.
- **Backend**: Next.js API Routes (Serverless).
- **AI**: Google Gemini Pro & Gemini Flash 2.5.
- **Database**: Firebase Firestore (NoSQL).
- **Auth**: Firebase Authentication.

## 📦 Getting Started

### 1. Environment Configuration
Create a `.env.local` file with the following keys:
```env
GEMINI_API_KEY=your_key_here
WEATHER_API_KEY=your_key_here
# Firebase Config (Shared)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
```

### 2. Installation
```bash
npm install
```

### 3. Launch Development Server
```bash
npm run dev
```

## 🛡️ Production Hardening (Audit Certified)
The current codebase has undergone a comprehensive system audit (see `AUDIT_LOG.md`) focusing on:
1. **API Authentication**: Mandatory `x-user-id` header context.
2. **Onboarding Integrity**: Enforced profile checks in the auth lifecycle.
3. **AI Resilience**: Safe JSON parsing with robust fallbacks.
4. **Performance**: Optimized parallel fetch orchestration.

---
Built with ❤️ for the future of Malaysian Agriculture.
