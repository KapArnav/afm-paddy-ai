import { NextRequest, NextResponse } from "next/server";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../lib/firebase";

export async function POST(req: NextRequest) {
  try {
    const { userId, planId } = await req.json();

    if (!userId || !planId) {
      return NextResponse.json(
        { success: false, error: "userId and planId are required" },
        { status: 400 }
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

    return NextResponse.json({ success: true, message: "Plan successfully applied to your field" });
  } catch (error: any) {
    console.error("apply-plan error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to apply plan", detail: error.message },
      { status: 500 }
    );
  }
}
