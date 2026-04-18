import { NextRequest, NextResponse } from "next/server";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";


// ── Types ───────────────────────────────────────────────────────────
interface FormInput {
  rainForecast?: string;
  temperature?: number;
  humidity?: number;
  growthStage?: string;
  leafColor?: string;
  pestPresence?: boolean;
  priceTrend?: string;
  demand?: string;
}

interface RequestBody {
  formData?: FormInput;
  image?: string | null;       // base64
  imageMimeType?: string | null;
  optimizeFor?: string;        // "balanced" | "profit" | "yield"
  userId?: string;             // Linking plan to user
}

interface GeminiCandidate {
  content?: {
    parts?: { text?: string }[];
  };
}

interface GeminiResponse {
  candidates?: GeminiCandidate[];
  error?: { message?: string };
}

interface AgentResult {
  temperature?: number;
  humidity?: number;
  rain_probability?: number;
  price_trend?: string;
  demand?: string;
  recommendation?: string;
  issues?: string[];
  confidence?: number;
}

// ── POST handler ────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  console.log("API HIT: Autonomous Multi-Agent System");

  // 1. Check API key
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your_key_here") {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not configured in .env.local" },
      { status: 500 }
    );
  }

  // 2. Parse body safely
  let body: RequestBody;
  try {
    body = await req.json();
    
    // Safety: Ensure UID is provided in the authenticated body context
    if (!body.userId) {
      return NextResponse.json(
        { success: false, error: "Authentication Failure: Missing userId in context" },
        { status: 401 }
      );
    }
  } catch (error: unknown) {
    console.error("Master Orchestrator Failure:", error);
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { success: false, error: "AI Generation collapsed", detail: message },
      { status: 500 }
    );
  }

  // 3. Setup dynamic base URL for internal agents
  const baseUrl = req.nextUrl.origin;
  const userId = body.userId;

  // --- AGENTS: PARALLEL ORCHESTRATION ---
  console.log("[Master Orchestrator] Triggering specialized agents in parallel...");
  const hasImage = !!(body.image && body.imageMimeType);

  const [weather, marketData, imageAnalysis] = await Promise.all([
    // Weather Agent
    fetch(`${baseUrl}/api/weather`, { headers: { 'x-user-id': userId } })
      .then(res => res.ok ? res.json() as Promise<AgentResult> : Promise.reject("Offline"))
      .catch(() => ({ temperature: 28, humidity: 75, rain_probability: 20 } as AgentResult)),
    
    // Market Agent
    fetch(`${baseUrl}/api/market`, { headers: { 'x-user-id': userId } })
      .then(res => res.ok ? res.json() : Promise.reject("Offline"))
      .catch(() => ({ price_trend: "stable", demand: "medium", recommendation: "hold" } as AgentResult)),
    
    // Visual Agent (Optional)
    hasImage 
      ? fetch(`${baseUrl}/api/analyze-image`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "x-user-id": userId || ""
          },
          body: JSON.stringify({ image: body.image })
        }).then(res => res.ok ? res.json() as Promise<AgentResult> : { issues: [], confidence: 0 } as AgentResult)
      : Promise.resolve({ issues: [], confidence: 0 } as AgentResult)
  ]) as [AgentResult, AgentResult, AgentResult];

  const temperature = weather.temperature || 28;
  const humidity = weather.humidity || 75;

  // 4. Build Enriched Autonomous Strategist Prompt
  const fd = body?.formData ?? {};
  const growthStage = fd.growthStage ?? "Tillering";
  const leafColor = fd.leafColor ?? "Normal Green";
  const pestPresence = fd.pestPresence ?? false;
  const optimizeFor = body.optimizeFor ?? "balanced";

  const imageIssues = imageAnalysis.issues || [];
  const imageContext = imageIssues.length > 0 
    ? `VISUAL AGENT FINDINGS: ${imageIssues.join(", ")} (Confidence: ${Math.round((imageAnalysis.confidence || 0) * 100)}%)`
    : "VISUAL AGENT: No critical visual issues reported or image not provided.";

  const prompt = `You are a Multi-Agent Autonomous Farm Strategist.
Your intelligence is synthesized from specialized vision, weather, and market agents.

SYNTHESIZED INPUT DATA:

=== ENVIRONMENTAL DATA (WEATHER AGENT) ===
- Rain Probability: ${weather.rain_probability}%
- Temperature: ${temperature}°C
- Humidity: ${humidity}%

=== CROP HEALTH DATA (USER + VISION AGENT) ===
- Growth Stage: ${growthStage}
- Leaf Color Indicator: ${leafColor}
- Manual Pest Detection: ${pestPresence ? "Yes" : "No"}
- ${imageContext}

=== MARKET DATA (MARKET AGENT) ===
- Price Trend: ${marketData.price_trend}
- Demand Level: ${marketData.demand}
- Market Agent Logic: ${marketData.recommendation}

=== OBJECTIVE ===
Optimize for ${optimizeFor.toUpperCase()}.

INSTRUCTIONS:
1. Synthesize all data points (Vision, Weather, Market). Detect non-obvious correlations (e.g., high rain probability + market sell signals -> prioritize immediate harvest vs fertilization).
2. Generate a 30-day action timeline.
3. Formulate a specific Market Strategy. You MUST provide a clear "action" (e.g. SELL, HOLD, WAIT, SCALE) and a compelling "reason" based on the synthesized agents.
4. Detect hidden risks.

Return ONLY valid JSON:
{
  "farm_summary": { "overall_risk": "Low/Medium/High", "key_issue": "string" },
  "confidence_score": number (70-98),
  "smart_insight": { "hidden_risk": "string", "recommendation": "string" },
  "image_analysis": string[],
  "timeline": [{ 
    "day": number, 
    "action": "string", 
    "reason": "string", 
    "steps": string[], // exactly 3 specific implementation steps
    "priority": "High/Medium/Low", 
    "category": "water/fertilizer/pest/harvest/monitor/soil" 
  }],
  "market_strategy": { "action": "string (MUST BE NON-EMPTY)", "reason": "string (MUST BE NON-EMPTY)" },
  "ai_reasoning": string[] // exactly 5 concise bullets
}

Return ONLY raw JSON. No markdown.`;

  // 5. Build request parts
  const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [
    { text: prompt },
  ];

  if (hasImage && body.image && body.imageMimeType) {
    parts.push({
      inlineData: {
        mimeType: body.imageMimeType,
        data: body.image,
      },
    });
  }

  // 6. Call Gemini API via fetch (v1beta, gemini-flash-latest)
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;

  const fetchOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4096,
      },
    }),
  };

  let geminiRes: Response | undefined;
  let errStatus = 502;
  let errDetail = "";

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      geminiRes = await fetch(endpoint, fetchOptions);
      if (geminiRes.ok) break;
      errStatus = geminiRes.status;
      errDetail = await geminiRes.text();
    } catch (err: unknown) {
      errDetail = err instanceof Error ? err.message : String(err);
    }
    if (attempt === 1) await new Promise(r => setTimeout(r, 1500));
  }

  if (!geminiRes || !geminiRes.ok) {
    return NextResponse.json({ error: "Gemini API failure", status: errStatus, detail: errDetail }, { status: 502 });
  }

  // 7. Parse & Clean JSON
  const resultData: GeminiResponse = await geminiRes.json();
  const rawText = resultData?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) return NextResponse.json({ error: "Empty AI response" }, { status: 502 });

  const cleaned = rawText.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
  let parsed: Record<string, any>;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err: unknown) {
    console.error("AI Generation Parsing Failure:", err, cleaned);
    // Safe fallback to prevent system crash
    parsed = {
      farm_summary: { overall_risk: "Low", key_issue: "Standard monitoring required." },
      confidence_score: 80,
      timeline: [{ day: 1, action: "Standard field inspection", reason: "Fallback logic triggered", steps: ["Check soil moisture", "Inspect leaves", "Boundary check"], priority: "Medium", category: "monitor" }],
      market_strategy: { action: "HOLD", reason: "AI response formatting error, using safe default" }
    };
  }

  // 8. Generate Enriched Alerts
  const alerts: string[] = [];
  if ((weather.rain_probability ?? 0) > 70) alerts.push("High rain expected — delay fertilizer application.");
  if ((weather.temperature ?? 0) > 35) alerts.push("Extreme heat detected — ensure extra irrigation.");
  
  if (marketData.price_trend === "decreasing" && marketData.demand === "high") {
    alerts.push("Market Alert: Price falling despite high demand. Consider selling soon.");
  }
  // Explicit type check for plan data
  const farmSummary = parsed.farm_summary as Record<string, any>;
  if (farmSummary?.overall_risk === "High") alerts.push("Risk Alert: Farm is in a high-risk state.");

  // 9. Save to Firestore (Enriched Schema)
  try {
    const docData: Record<string, unknown> = {
      weather: { 
        temperature: temperature, 
        humidity: humidity, 
        rain_probability: weather.rain_probability ?? 0 
      },
      crop_health: { growthStage, leafColor, pestPresence },
      market: marketData,
      image_issues: imageAnalysis.issues || [],
      imageUrl: hasImage ? "Image provided (Base64)" : null,
      farmPlan: parsed,
      alerts,
      createdAt: new Date(),
    };
    if (body.userId) {
      docData.userId = body.userId;
    }
    const docRef = await addDoc(collection(db, "farmPlans"), docData);
    console.log("Autonomous plan saved to Firestore with ID:", docRef.id);
    return NextResponse.json({ success: true, plan: parsed, alerts, planId: docRef.id });
  } catch (firestoreErr: unknown) {
    const message = firestoreErr instanceof Error ? firestoreErr.message : String(firestoreErr);
    console.error("Firestore persistence skipped:", message);
    return NextResponse.json({ success: true, plan: parsed, alerts, planId: null });
  }
}
