import { NextResponse } from "next/server";

export async function GET() {
  try {
    const trends: ("increasing" | "decreasing" | "stable")[] = ["increasing", "decreasing", "stable"];
    const demands: ("high" | "medium" | "low")[] = ["high", "medium", "low"];

    const price_trend = trends[Math.floor(Math.random() * trends.length)];
    const demand = demands[Math.floor(Math.random() * demands.length)];

    let recommendation: "sell" | "hold" | "wait" = "hold";

    if (demand === "high" && price_trend === "increasing") {
      recommendation = "sell";
    } else if (demand === "low" && price_trend === "decreasing") {
      recommendation = "wait";
    } else {
      recommendation = "hold";
    }

    return NextResponse.json({
      price_trend,
      demand,
      recommendation
    });
  } catch (error) {
    console.error("MARKET API ERROR:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
