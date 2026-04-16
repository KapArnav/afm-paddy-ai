# AFM Paddy AI 🌾

AFM Paddy AI is an intelligent, responsive web application designed for Malaysian paddy (rice) farmers. It leverages cutting-edge Generative AI (Gemini 2.5 Flash) to analyze farm conditions, track crop health, and provide actionable, optimized farming plans to maximize yield and farmer profit while mitigating environmental risks.

---

## 🚀 Features Implemented So Far

- **Interactive Farm Input Form**: A comprehensive UI allowing farmers to input weather conditions, growth stages, leaf colors, pricing trends, and market demands.
- **Crop Image Analysis Upload**: Farmers can upload an image of their crop. The system converts it to Base64 and passes it to the AI to visually detect diseases, nutrient deficiencies, or pest presence.
- **Dynamic Risk Meter UI**: A beautifully designed, color-coded visual indicator displaying the overall calculated risk level of the farm at a glance.
- **Gemini API Integration**: A server-side Next.js route (`/api/generate-plan/route.ts`) that acts as a secure bridge, calling the Google Gemini 2.5 Flash API directly using native `fetch()`. No external SDKs are required.
- **Smart Analytics Engine**: The AI returns structured JSON containing:
  - Timeline of actions (water, fertilizer, pest management)
  - Immediate hidden risk identification
  - Market selling strategy
  - AI reasoning and insight explanations
- **Responsive UI Dashboard**: Entirely built with modern Next.js 16, React 19, and the brand-new Tailwind CSS v4 for a seamless mobile-and-desktop experience. Includes polished loading spinners and animated result displays.

---

## 🛠 Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **AI/LLM**: [Google Gemini 2.5 Flash](https://ai.google.dev/)
- **Language**: TypeScript

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js**: Version 20.x or higher is recommended. You can download it from [nodejs.org](https://nodejs.org/).
- **Git**: To clone and manage your project repository.
- **Gemini API Key**: You will need a developer API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

---

## 🛠 How to Set Up and Run Locally

### 1. Clone the Repository
If you haven't already, clone the project to your local machine:
```bash
git clone https://github.com/KapArnav/afm-paddy-ai.git
cd afm-paddy-ai
```

### 2. Install Dependencies
Run the following command inside the `afm-paddy-ai` folder to install all required packages:
```bash
npm install
```

### 3. Set Up Environment Variables
Create a file named `.env.local` in the root directory (`afm-paddy-ai/`) and add your Gemini API Key:

```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
```
*(Note: Never commit your `.env.local` to GitHub. The project already uses `.gitignore` to prevent this.)*

### 4. Start the Development Server
Run the local dev server:
```bash
npm run dev
```

### 5. View Your App
Open [http://localhost:3000](http://localhost:3000) in your browser. You can now use the forms, upload images, and watch the AI dynamically generate optimal farming strategies!

---

## 💡 Future Enhancements
- Save generated plans and historical data to a database.
- Multi-language support (Malay/English).
- Notifications and offline PWA mode for low-connectivity farm areas.
