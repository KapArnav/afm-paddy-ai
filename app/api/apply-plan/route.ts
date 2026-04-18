import { NextRequest, NextResponse } from "next/server";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../lib/firebase";

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
    const planRef = doc(db, "farmPlans", planId);
    await updateDoc(planRef, {
      status: "active",
      appliedAt: serverTimestamp(),
    });

    // 2. Link it as the user's active plan
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      activePlanId: planId,
      updatedAt: serverTimestamp(),
    });

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
