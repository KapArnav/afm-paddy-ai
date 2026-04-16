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

// ── POST handler ────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  console.log("API HIT");

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
  } catch {
    return NextResponse.json(
      { error: "Invalid or missing JSON body" },
      { status: 400 }
    );
  }

  // 3. Extract form data with safe defaults
  const fd = body?.formData ?? {};
  
  const weatherRes = await fetch("http://localhost:3000/api/weather");
  if (!weatherRes.ok) {
    return NextResponse.json(
      { error: "Failed to fetch weather data" },
      { status: 500 }
    );
  }
  const weather = await weatherRes.json();

  const rainForecast = `${weather.rain_probability}% chance of rain`;
  const temperature = weather.temperature;
  const humidity = weather.humidity;
  const growthStage = fd.growthStage ?? "Tillering";
  const leafColor = fd.leafColor ?? "Normal Green";
  const pestPresence = fd.pestPresence ?? false;
  const priceTrend = fd.priceTrend ?? "Stable";
  const demand = fd.demand ?? "Medium";
  const optimizeFor = body.optimizeFor ?? "balanced";

  const hasImage = body.image && body.imageMimeType;

  // 4. Build prompt
  const optimizeInstruction =
    optimizeFor === "profit"
      ? "PRIORITIZE maximizing farmer profit. Recommend selling strategies, timing, and cost reduction."
      : optimizeFor === "yield"
        ? "PRIORITIZE maximizing crop yield. Recommend best agronomic practices regardless of short-term costs."
        : "BALANCE between profit and yield for sustainable farming.";

  const imageInstruction = hasImage
    ? `

IMPORTANT: An image of the crop has been provided. Analyze it carefully for:
- Visible diseases (blast, brown spot, bacterial leaf blight)
- Nutrient deficiency symptoms (nitrogen, phosphorus, potassium)
- Water stress or drought symptoms
- Pest damage signs
- General crop vigor
You MUST populate the "image_analysis" array with your findings from the image.`
    : "";

  const prompt = `You are an expert Malaysian paddy (rice) farming consultant with deep knowledge of agronomy, market dynamics, and precision farming.

Analyze the following farm data and produce an actionable, intelligent farm plan.

=== WEATHER ===
- Rain Forecast: ${rainForecast}
- Temperature: ${temperature}°C
- Humidity: ${humidity}%

=== CROP HEALTH ===
- Growth Stage: ${growthStage}
- Leaf Color: ${leafColor}
- Pest Presence: ${pestPresence ? "Yes" : "No"}

=== MARKET ===
- Price Trend: ${priceTrend}
- Demand: ${demand}

=== OPTIMIZATION ===
${optimizeInstruction}
${imageInstruction}

=== REASONING (CRITICAL) ===
You MUST explain your reasoning. Think like an agronomist + farmer + strategist.
Detect hidden risks such as:
- Heavy rain + nitrogen → leaching risk
- High humidity + warmth → fungal disease
- Yellowing leaves during tillering → yield loss
- Pest presence during panicle initiation → critical risk

Respond with ONLY valid JSON matching this exact schema — no markdown, no explanations, no text outside JSON:

{
  "farm_summary": {
    "overall_risk": "<Low|Medium|High>",
    "key_issue": "<one sentence describing the most critical issue>"
  },
  "confidence_score": <number 70-98, your confidence percentage in this plan based on data completeness>,
  "smart_insight": {
    "hidden_risk": "<describe ONE non-obvious hidden risk the farmer might miss, e.g. nutrient leaching, fungal outbreak window, timing conflict>",
    "recommendation": "<one-sentence actionable advice to mitigate this hidden risk>"
  },
  "image_analysis": ${hasImage ? `[
    "<finding 1 from crop image, e.g. 'Mild chlorosis detected on lower leaves'>",
    "<finding 2, e.g. 'No visible pest damage'>",
    "<finding 3, e.g. 'Possible nitrogen deficiency based on leaf color pattern'>"
  ]` : `[]`},
  "timeline": [
    {
      "day": <number 1-30>,
      "action": "<specific action the farmer should do>",
      "reason": "<why this action at this time>",
      "priority": "<High|Medium|Low>",
      "category": "<water|fertilizer|pest|harvest|monitor|soil>"
    }
  ],
  "market_strategy": {
    "action": "<specific selling/holding/pricing recommendation>",
    "reason": "<market-based justification>"
  },
  "ai_reasoning": [
    "<reasoning point 1 — explain a hidden risk or trade-off you detected>",
    "<reasoning point 2 — explain why a key decision was made>",
    "<reasoning point 3 — explain what would happen if farmer ignores this>",
    "<reasoning point 4 — explain an optimization insight>",
    "<reasoning point 5 — explain environmental or seasonal context>"
  ]
}

Include at least 6 timeline entries covering the full 30-day window.
Include exactly 5 ai_reasoning entries — keep each to 1-2 concise sentences.
Each timeline entry MUST have a category from: water, fertilizer, pest, harvest, monitor, soil.
Return ONLY the JSON object.`;

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

  // 6. Call Gemini API via fetch (NO SDK, v1 stable, gemini-2.5-flash)
  const endpoint = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

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
      if (geminiRes.ok) {
        break; // Success! Exit the retry loop.
      }
      errStatus = geminiRes.status;
      errDetail = await geminiRes.text();
      console.error(`Gemini API error (Attempt ${attempt}):`, errStatus, errDetail);
    } catch (err: unknown) {
      errDetail = err instanceof Error ? err.message : "Unknown fetch error";
      console.error(`Gemini fetch error (Attempt ${attempt}):`, errDetail);
    }

    if (attempt === 1) {
      console.log("Retrying Gemini API in 1.5 seconds...");
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
  }

  // 7. Check HTTP status after retries
  if (!geminiRes || !geminiRes.ok) {
    return NextResponse.json(
      { error: "Failed to reach Gemini API after retries", status: errStatus, detail: errDetail },
      { status: 502 }
    );
  }

  // 8. Parse Gemini response
  let data: GeminiResponse;
  try {
    data = await geminiRes.json();
  } catch {
    return NextResponse.json(
      { error: "Failed to parse Gemini response as JSON" },
      { status: 502 }
    );
  }

  // 9. Extract text from candidates
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) {
    console.error("No text in Gemini response:", JSON.stringify(data));
    return NextResponse.json(
      { error: "Gemini returned no text content", raw: data },
      { status: 502 }
    );
  }

  // 10. Clean & parse JSON
  let cleaned = rawText.trim();
  cleaned = cleaned.replace(/^```json\s*/i, "").replace(/^```\s*/i, "");
  cleaned = cleaned.replace(/\s*```$/i, "");
  cleaned = cleaned.trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    console.error("Failed to parse Gemini text as JSON:", cleaned);
    return NextResponse.json(
      { error: "Gemini response was not valid JSON", raw_text: cleaned },
      { status: 502 }
    );
  }

  // 11. Generate smart alerts from weather + plan
  const alerts: string[] = [];
  if (weather.rain_probability > 70) {
    alerts.push("High rain expected — delay fertilizer application to avoid leaching");
  }
  if (weather.temperature > 35) {
    alerts.push("Heat stress risk — ensure adequate irrigation and monitor crop health");
  }
  if (weather.humidity > 85) {
    alerts.push("High humidity — elevated fungal disease risk, consider preventive fungicide");
  }
  const planAny = parsed as any;
  if (planAny?.farm_summary?.overall_risk === "High") {
    alerts.push("High overall farm risk — follow the action plan closely");
  }
  if (pestPresence) {
    alerts.push("Active pest presence — prioritize pest management immediately");
  }

  // 12. Save plan to Firestore (non-blocking — won't fail the API if Firestore write fails)
  const imageUrl: string | null = null; // Will be populated when image upload is integrated
  try {
    await addDoc(collection(db, "farmPlans"), {
      weather: { temperature, humidity, rain_probability: weather.rain_probability },
      crop_health: { growthStage, leafColor, pestPresence },
      market: { priceTrend, demand },
      optimizeFor,
      imageUrl,
      farmPlan: parsed,
      alerts,
      createdAt: new Date(),
    });
    console.log("Farm plan saved to Firestore");
  } catch (firestoreErr: any) {
    console.error("Firestore save failed (non-fatal):", firestoreErr.message);
  }

  // 13. Return successful response
  console.log("API SUCCESS");
  return NextResponse.json({ success: true, plan: parsed, alerts });
}
