import { NextRequest, NextResponse } from "next/server";
import { firestoreServer } from "@/lib/firestore-server";
import { z } from "zod";
import { callVertexWithRetry } from "@/lib/gemini-client";
import { checkVisionCache, setVisionCache } from "@/lib/vision-cache";

const RequestBodySchema = z.object({
  formData: z.object({
    growthStage: z.string().optional(),
    pestPresence: z.boolean().optional(),
  }).optional(),
  image: z.string().nullable().optional(),
  imageMimeType: z.string().nullable().optional(),
  optimizeFor: z.enum(["balanced", "profit", "yield"]).default("balanced"),
  userId: z.string().min(5),
});

function extractJsonObject(raw: string): string | null {
  const trimmed = raw.trim();
  const fenced = trimmed
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  if (fenced.startsWith("{") && fenced.endsWith("}")) {
    return fenced;
  }

  const firstBrace = fenced.indexOf("{");
  const lastBrace = fenced.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return fenced.slice(firstBrace, lastBrace + 1);
  }

  return null;
}

function escapeNewlinesInsideStrings(raw: string): string {
  let result = "";
  let inString = false;
  let escaping = false;

  for (const char of raw) {
    if (escaping) {
      result += char;
      escaping = false;
      continue;
    }

    if (char === "\\") {
      result += char;
      escaping = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      result += char;
      continue;
    }

    if (inString && (char === "\n" || char === "\r")) {
      result += "\\n";
      continue;
    }

    result += char;
  }

  return result;
}

function buildFallbackTimeline(
  keyIssue: string,
  warning: string | null,
  weather: { rain_probability: number }
) {
  return [
    {
      day: 1,
      action: "Inspect field drainage and crop condition",
      reason: warning || keyIssue || "Start with a direct field inspection before applying interventions.",
      priority: "High",
      category: "monitor",
      steps: ["Walk the field", "Check standing water", "Inspect lower leaves and tillers"],
    },
    {
      day: 7,
      action: weather.rain_probability > 70 ? "Review water movement after rainfall" : "Reassess crop stress indicators",
      reason: "Use the first week to verify whether rainfall or humidity is increasing field stress.",
      priority: "High",
      category: "water",
      steps: ["Inspect wet patches", "Check drainage flow", "Adjust irrigation if needed"],
    },
    {
      day: 14,
      action: "Recheck disease and pest pressure",
      reason: "Mid-cycle monitoring helps catch spread before it affects tiller development.",
      priority: "Medium",
      category: "pest",
      steps: ["Inspect sample rows", "Look for lesions or pest damage", "Prepare treatment if necessary"],
    },
    {
      day: 30,
      action: "Review outcomes and prepare the next cycle",
      reason: "Close the 30-day window with a fresh assessment for the next strategy update.",
      priority: "Medium",
      category: "monitor",
      steps: ["Compare crop condition", "Record costs and outcomes", "Plan the next optimization run"],
    },
  ];
}

function normalizePlanData(planData: any, weather: { rain_probability: number }) {
  const confidence =
    typeof planData?.confidence_score === "number"
      ? planData.confidence_score <= 1
        ? Math.round(planData.confidence_score * 100)
        : Math.round(planData.confidence_score)
      : 75;

  return {
    farm_summary: {
      overall_risk: planData?.farm_summary?.overall_risk || "Medium",
      key_issue: planData?.farm_summary?.key_issue || "Maintain close observation of crop condition.",
    },
    total_estimated_cost: typeof planData?.total_estimated_cost === "number" ? planData.total_estimated_cost : 0,
    warning: typeof planData?.warning === "string" ? planData.warning : null,
    confidence_score: confidence,
    smart_insight: {
      hidden_risk: planData?.smart_insight?.hidden_risk || "Weather volatility may hide early crop stress.",
      recommendation: planData?.smart_insight?.recommendation || "Continue field monitoring and review the plan after the next inspection.",
    },
    timeline:
      Array.isArray(planData?.timeline) && planData.timeline.length > 0
        ? planData.timeline.map((item: any, index: number) => {
          const normalizedItem: {
            day: number;
            action: string;
            reason: string;
            priority: string;
            category: string;
            steps?: string[];
          } = {
            day: typeof item?.day === "number" ? item.day : index + 1,
            action: item?.action || `Field action ${index + 1}`,
            reason: item?.reason || "Follow the recommended farm management step.",
            priority: item?.priority || "Medium",
            category: item?.category || "monitor",
          };

          if (Array.isArray(item?.steps) && item.steps.length > 0) {
            normalizedItem.steps = item.steps;
          }

          return normalizedItem;
        })
        : buildFallbackTimeline(
          planData?.farm_summary?.key_issue || "",
          typeof planData?.warning === "string" ? planData.warning : null,
          weather
        ),
    market_strategy: {
      action: planData?.market_strategy?.action || "MAINTAIN POSITION",
      reason: planData?.market_strategy?.reason || "Current market signals suggest continuing with the existing strategy while monitoring volatility.",
    },
    ai_reasoning:
      Array.isArray(planData?.ai_reasoning) && planData.ai_reasoning.length > 0
        ? planData.ai_reasoning
        : [
          planData?.farm_summary?.key_issue || "Primary field risk was assessed from current conditions.",
          planData?.smart_insight?.hidden_risk || "Weather and field conditions may create delayed risks.",
          planData?.smart_insight?.recommendation || "The recommended strategy balances protection and practicality.",
        ],
  };
}

export async function POST(req: NextRequest) {
  console.log("[Orchestrator] Starting Sequential Multi-Agent Analysis");

  try {
    const rawBody = await req.json();
    const body = RequestBodySchema.parse(rawBody);
    const { userId, image, imageMimeType, optimizeFor, formData } = body;
    const baseUrl = req.nextUrl.origin;

    let geminiCallCount = 0;
    const MAX_GEMINI_CALLS = 4;
    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

    // --- AGENT 1: Weather Agent (REST) ---
    console.log("[Orchestrator] Agent 1: Fetching Weather Data");
    let weather = { temperature: 28, humidity: 75, rain_probability: 20 };
    try {
      const weatherRes = await fetch(`${baseUrl}/api/weather`, {
        headers: { 'x-user-id': userId },
        cache: 'no-store'
      });
      if (weatherRes.ok) weather = await weatherRes.json();
    } catch (e) {
      console.warn("[Orchestrator] Weather Agent failed, using fail-soft defaults.");
    }

    await delay(500); // Standard spacing

    // --- AGENT 2: Market Agent (REST) ---
    console.log("[Orchestrator] Agent 2: Fetching Market Trends");
    let marketData = { price_trend: "stable", demand: "medium", recommendation: "hold" };
    try {
      const marketRes = await fetch(`${baseUrl}/api/market`, {
        headers: { 'x-user-id': userId },
        cache: 'no-store'
      });
      if (marketRes.ok) marketData = await marketRes.json();
    } catch (e) {
      console.warn("[Orchestrator] Market Agent failed, using fail-soft defaults.");
    }

    await delay(500);

    // --- AGENT 3: Vision Agent (Gemini) ---
    let visionFindings = "Vision analysis skipped or unavailable.";
    let base64Data = image || "";
    if (base64Data.includes(",")) base64Data = base64Data.split(",")[1];

    if (base64Data && geminiCallCount < MAX_GEMINI_CALLS) {
      console.log("[Orchestrator] Agent 3: Vision Analysis Start");

      // Check Cache first
      const cached = await checkVisionCache(userId, base64Data);
      if (cached) {
        visionFindings = `Vision Analysis (Cached): ${cached}`;
      } else {
        geminiCallCount++;
        const visionPrompt = "Identify visible crop issues: nutrient deficiencies, pest damage, disease, or discoloration. Return only JSON: { issues: string[] }";

        const visionRes = await callVertexWithRetry(
          ["gemini-2.5-flash"],
          {
            contents: [{
              role: "user",
              parts: [
                { text: visionPrompt },
                { inlineData: { mimeType: imageMimeType || "image/jpeg", data: base64Data } }
              ]
            }]
          }
        );

        if (visionRes.ok) {
          const cleaned = visionRes.text.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
          await setVisionCache(userId, base64Data, cleaned);
          visionFindings = `Vision Analysis: ${cleaned}`;
        } else {
          console.warn("[Orchestrator] Vision Agent failed-soft.");
        }
      }
    }

    await delay(500);

    // --- AGENT 4: Master Strategist (Gemini) ---
    const DEFAULT_BUDGET = 5000; // RM
    let planData: any = null;
    let strategistModel = "gemini-2.5-flash";

    const masterPrompt = `
      You are the Master Paddy Farming Strategist.
      Generate the MOST OPTIMIZED plan within the given context.
      If situational constraints (like rain or pests) make a low-cost plan impossible, 
      generate the closest possible plan and explain the adjustments in the warning field.
      Return ONLY valid JSON.
      Do not use markdown.
      Do not wrap the response in code fences.
      Do not add explanations before or after the JSON.
      Every key must be present.
      Use double quotes for all strings.
      confidence_score must be a number from 0 to 100.
      total_estimated_cost must be a number.
      timeline must always be an array, even if empty.
      ai_reasoning must always be an array of strings.
      
      SITUATIONAL CONTEXT:
      - Weather: ${JSON.stringify(weather)}
      - Market: ${JSON.stringify(marketData)}
      - Vision Report: ${visionFindings}
      
      FARM PARAMETERS:
      - Growth Stage: ${formData?.growthStage || "Tillering"}
      - Logic Mode: ${optimizeFor}
      - Manual Pest Flag: ${formData?.pestPresence ? "Yes" : "No"}
      
      REQUIREMENT: Return ONLY a valid JSON object.
      Keep the response compact.
      Do not exceed 900 characters total.
      warning must be one short sentence.
      smart_insight.hidden_risk must be one short sentence.
      smart_insight.recommendation must be one short sentence.
      timeline must contain at most 4 items.
      ai_reasoning must contain exactly 3 short bullet strings.

      {
        "farm_summary": { "overall_risk": "Low/Medium/High", "key_issue": "string" },
        "total_estimated_cost": number, 
        "warning": "string or null",
        "confidence_score": number,
        "smart_insight": { "hidden_risk": "string", "recommendation": "string" },
        "timeline": [{ "day": number, "action": "string", "reason": "string", "priority": "High/Medium/Low" }],
        "market_strategy": { "action": "string", "reason": "string" },
        "ai_reasoning": string[]
      }
    `;

    if (geminiCallCount < MAX_GEMINI_CALLS) {
      console.log("[Orchestrator] Agent 4: Master Strategist Start");
      geminiCallCount++;

      try {
        const strategistRes = await callVertexWithRetry(
          [strategistModel],
          {
            contents: [{
              role: "user",
              parts: [{ text: masterPrompt }]
            }]
          }
        );

        if (strategistRes.ok) {
          const rawText = strategistRes.text.trim();
          console.log("[Orchestrator] Strategist raw output:", rawText);
          const extractedJson = extractJsonObject(rawText);

          try {
            if (!extractedJson) {
              throw new Error("No JSON object found in model response");
            }
            planData = JSON.parse(escapeNewlinesInsideStrings(extractedJson));
          } catch (e) {
            console.warn("[Orchestrator] Initial JSON parse failed, attempting repair...");

            // Repair Logic: Ask Gemini to fix the truncated/invalid JSON
            const repairRes = await callVertexWithRetry(
              [strategistModel],
              {
                contents: [{
                  role: "user",
                  parts: [{ text: `The following JSON response was incomplete or invalid. Please return ONLY the complete and valid JSON object: \n\n${rawText}` }]
                }]
              }
            );

            if (repairRes.ok) {
              const repairedText = extractJsonObject(repairRes.text.trim());
              try {
                if (repairedText) {
                  planData = JSON.parse(escapeNewlinesInsideStrings(repairedText));
                  console.log("[Orchestrator] JSON repaired successfully.");
                }
              } catch (innerE) {
                console.error("[Orchestrator] JSON repair failed.");
              }
            }
          }
        }
      } catch (e) {
        console.warn("[Orchestrator] Master Strategist API failure, moving to fallback.");
      }
    }

    // --- FALLBACK: If everything failed, use static contingency plan ---
    if (!planData) {
      console.warn("[Orchestrator] Using static Fallback Strategy (API Failure)");
      planData = {
        farm_summary: { overall_risk: "Medium", key_issue: "Offline Mode" },
        total_estimated_cost: 0,
        warning: "Advanced optimization unavailable, using generic fallback strategy.",
        confidence_score: 50,
        smart_insight: {
          hidden_risk: "Limited real-time data",
          recommendation: "Maintain standard irrigation and check for pests manually."
        },
        timeline: [
          { day: 1, action: "Manual Inspection", reason: "AI Strategist unreachable", priority: "High" }
        ],
        market_strategy: { action: "Buffer", reason: "Network issue" },
        ai_reasoning: ["System fallback triggered"]
      };
    }

    planData = normalizePlanData(planData, weather);

    // Budget check logic (Guideline only)
    if (planData.total_estimated_cost > DEFAULT_BUDGET && !planData.warning) {
      planData.warning = "Estimated cost exceeds standard budget guidelines. Consider scaling or reviewing inputs.";
    }

    // Alerts logic
    const alerts: string[] = [];
    if (weather.rain_probability > 70) alerts.push("Heavy rain expected — adjust water management.");
    if (planData.farm_summary?.overall_risk === "High") alerts.push("High-risk scenario detected.");

    // Save to Firestore
    try {
      const docRef = await firestoreServer.collection("farmPlans").add({
        userId,
        plan: planData,
        weather,
        market: marketData,
        vision: visionFindings,
        alerts,
        createdAt: new Date(),
        callBudget: geminiCallCount
      });

      return NextResponse.json({
        success: true,
        plan: planData,
        alerts,
        planId: docRef.id,
        contextScore: (geminiCallCount / MAX_GEMINI_CALLS) * 100
      });
    } catch (e) {
      console.error("[Orchestrator] Firestore save failed:", e);
      return NextResponse.json({ success: true, plan: planData, alerts });
    }

  } catch (error: any) {
    console.error("[Orchestrator] Fatal Error:", error.message);
    return NextResponse.json(
      { success: false, error: error.message || "Pipeline collapse" },
      { status: 500 }
    );
  }
}
