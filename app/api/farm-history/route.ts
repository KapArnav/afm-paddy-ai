import { NextResponse } from "next/server";
import { collection, getDocs, orderBy, query, limit } from "firebase/firestore";
import { db } from "../../../lib/firebase";

// ── Keyword-based pattern detection ─────────────────────────────────
const PATTERN_KEYWORDS: Record<string, string> = {
  nitrogen: "Recurring nitrogen deficiency detected",
  blast: "Recurring rice blast risk detected",
  pest: "Frequent pest activity detected",
  rain: "Frequent high rain probability detected",
  fungal: "Recurring fungal disease risk detected",
  drought: "Recurring drought/water stress detected",
  potassium: "Recurring potassium deficiency detected",
};

function detectPatterns(entries: any[]): string[] {
  const counts: Record<string, number> = {};

  for (const entry of entries) {
    const timelineText = JSON.stringify(entry?.farmPlan?.timeline ?? "").toLowerCase();
    const reasoningText = JSON.stringify(entry?.farmPlan?.ai_reasoning ?? "").toLowerCase();
    const combined = timelineText + reasoningText;

    for (const keyword of Object.keys(PATTERN_KEYWORDS)) {
      if (combined.includes(keyword)) {
        counts[keyword] = (counts[keyword] ?? 0) + 1;
      }
    }
  }

  // Flag keyword as a pattern if it appears in 2+ of the last 5 entries
  return Object.entries(counts)
    .filter(([, count]) => count >= 2)
    .map(([keyword]) => PATTERN_KEYWORDS[keyword]);
}

// ── GET /api/farm-history ────────────────────────────────────────────
export async function GET() {
  try {
    const plansRef = collection(db, "farmPlans");
    const q = query(plansRef, orderBy("createdAt", "desc"), limit(10));
    const snapshot = await getDocs(q);

    const plans = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      // Convert Firestore Timestamp to ISO string for clean JSON response
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() ?? null,
    }));

    // Pattern detection on last 5 entries
    const patterns = detectPatterns(plans.slice(0, 5));

    return NextResponse.json({
      success: true,
      count: plans.length,
      patterns,
      plans,
    });
  } catch (error: any) {
    console.error("farm-history error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch farm history", detail: error.message },
      { status: 500 }
    );
  }
}
