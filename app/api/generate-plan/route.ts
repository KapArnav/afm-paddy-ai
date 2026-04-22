import { NextRequest, NextResponse } from "next/server";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
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
          ["gemini-1.5-flash"],
          {
            contents: [{ parts: [
              { text: visionPrompt },
              { inlineData: { mimeType: imageMimeType || "image/jpeg", data: base64Data } }
            ]}]
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
    let strategistModel = "gemini-1.5-flash-001";

    const masterPrompt = `
      You are the Master Paddy Farming Strategist.
      Generate the MOST OPTIMIZED plan within the given context.
      If situational constraints (like rain or pests) make a low-cost plan impossible, 
      generate the closest possible plan and explain the adjustments in the warning field.
      
      SITUATIONAL CONTEXT:
      - Weather: ${JSON.stringify(weather)}
      - Market: ${JSON.stringify(marketData)}
      - Vision Report: ${visionFindings}
      
      FARM PARAMETERS:
      - Growth Stage: ${formData?.growthStage || "Tillering"}
      - Logic Mode: ${optimizeFor}
      - Manual Pest Flag: ${formData?.pestPresence ? "Yes" : "No"}
      
      REQUIREMENT: Return ONLY a valid JSON object.
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
          { contents: [{ parts: [{ text: masterPrompt }] }] }
        );

        if (strategistRes.ok) {
          const rawText = strategistRes.text.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
          try {
            planData = JSON.parse(rawText);
          } catch (e) {
            console.warn("[Orchestrator] Invalid JSON from Gemini, using raw text fallback");
            planData = {
              farm_summary: { overall_risk: "Medium", key_issue: "Parsing Error" },
              total_estimated_cost: 0,
              warning: "Plan generated but structure was non-standard. Displaying raw output.",
              smart_insight: { hidden_risk: "Unknown", recommendation: rawText },
              timeline: [],
              market_strategy: { action: "Hold", reason: "AI output parsing failed" },
              ai_reasoning: ["Raw output fallback used"]
            };
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
      const docRef = await addDoc(collection(db, "farmPlans"), {
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
        contextScore: (geminiCallCount/MAX_GEMINI_CALLS) * 100
      });
    } catch (e) {
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
