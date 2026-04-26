import { NextRequest, NextResponse } from "next/server";
import { firestoreServer } from "../../../lib/firestore-server";

export async function POST(req: NextRequest) {
  try {
    const { userId, planId } = await req.json();

    if (!userId || !planId) {
      return NextResponse.json(
        { success: false, error: "Authentication Failure: Missing UID or PlanID in context" },
        { status: 401 }
      );
    }

    // 1. Update the farm plan status
    await firestoreServer.collection("farmPlans").doc(planId).update({
      status: "active",
      appliedAt: new Date(),
    });

    // 2. Link it as the user's active plan
    await firestoreServer.collection("users").doc(userId).set({
      activePlanId: planId,
      updatedAt: new Date(),
    }, { merge: true });

    return NextResponse.json({ success: true, message: "Plan applied successfully" });
  } catch (error: unknown) {
    console.error("apply-plan error:", error);
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { success: false, error: "Failed to apply plan", detail: message },
      { status: 500 }
    );
  }
}
