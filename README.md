# AFM Paddy AI: Autonomous Farm Manager 🌾🤖

AFM Paddy AI is a production-ready, multi-agent AI framework designed specifically for paddy farmers in Malaysia. It utilizes the Gemini AI engine to synthesize environmental, visual, and market data into actionable farming strategies.

## ✨ Project Evolution & Implementation History

Since inception, the project has evolved from a basic prototype to a hardened multi-agent production system. Key milestones include:

1.  **Multi-Agent Orchestration**: Refactored the core engine from parallel processing (which hit quota limits) to a **Sequential Orchestration** model. Each agent (Weather, Market, Vision, Strategist) executes in a strict order with safety delays.
2.  **Vertex AI Migration**: Transitioned from the standard Google AI SDK to the enterprise-grade **`@google-cloud/vertexai` SDK**, enabling Zero-Key authentication within Google Cloud Run.
3.  **Production Hardening**: 
    - Implemented a **Global Gemini Queue** to serialize AI calls across the entire instance.
    - Added **Safe JSON Parsing** with raw-text fallbacks to prevent runtime crashes.
    - Integrated **Vision Caching** to reduce redundant API calls and save tokens.
4.  **Zero-Trust Security**: Removed all hardcoded API keys. The system now uses the **Cloud Run Service Account** for all GCP resource interactions.
5.  **Infrastructure as Code**: Optimized deployment specifically for `asia-southeast1`.

## 🛠️ Tech Stack
- **Frontend**: Next.js 14, Tailwind CSS, Vanilla CSS (Premium Finish).
- **Backend**: Next.js API Routes (Serverless).
- **AI**: Google Gemini 1.5 Flash (via Vertex AI SDK).
- **Database**: Firebase Firestore (NoSQL).
- **Auth**: Firebase Authentication.

## ⚠️ Current Status & Known Issues

### Vertex AI Permission Lock (Active)
As of the latest deployment, the production environment is experiencing a **403 Permission Denied** error when accessing Vertex AI.
- **Root Cause**: The Cloud Run Service Account (`738090758944-compute`) requires the `roles/aiplatform.user` IAM role, which needs to be finalized in the GCP Console.
- **Resilience Strategy**: The app is currently configured with a **Fail-Soft Logic**. If the permission error persists, the Master Strategist will automatically fall back to a **Static Contingency Plan** to ensure the farm management dashboard remains usable for the farmer.

## 📦 Getting Started

### 1. Environment Configuration
Create a `.env.local` file with the following:
```env
GOOGLE_CLOUD_PROJECT=your-gcp-project-id
GOOGLE_CLOUD_LOCATION=asia-southeast1
WEATHER_API_KEY=your_openweather_api_key

# Shared Firebase Config
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-gcp-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...
```

Important: keep `GOOGLE_CLOUD_PROJECT` and `NEXT_PUBLIC_FIREBASE_PROJECT_ID` aligned to the same project unless you are intentionally splitting infrastructure. A mixed setup will cause Vertex AI, Firestore, and Firebase Auth to point at different backends.

### 2. Manual IAM Fix
To resolve the current 403 error, run:
```bash
gcloud projects add-iam-policy-binding afm-paddy-ai-493808 \
  --member="serviceAccount:738090758944-compute@developer.gserviceaccount.com" \
  --role="roles/aiplatform.user"
```

---
Built with ❤️ for the future of Malaysian Agriculture.
