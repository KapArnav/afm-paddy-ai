import { NextRequest, NextResponse } from "next/server";
import { firestoreServer } from "../../../lib/firestore-server";

export async function GET(req: NextRequest) {
  try {
    // Safety: Do NOT trust userId from query parameters
    const userId = req.headers.get("x-user-id");

    if (!userId || userId === "null" || userId === "undefined") {
      return NextResponse.json(
        { success: false, error: "Authentication Failure: Unverified UID context" },
        { status: 401 }
      );
    }

    // 1. Get user document to find activePlanId
    const userSnap = await firestoreServer.collection("users").doc(userId).get();

    if (!userSnap.exists) {
      return NextResponse.json({ success: true, activePlan: null, message: "User profile not found" });
    }

    const userData = userSnap.data();
    if (!userData) {
      return NextResponse.json({ success: true, activePlan: null });
    }
    const activePlanId = userData.activePlanId;

    if (!activePlanId) {
      return NextResponse.json({ success: true, activePlan: null });
    }

    // 2. Fetch the actual plan data
    const planSnap = await firestoreServer.collection("farmPlans").doc(activePlanId).get();

    if (!planSnap.exists) {
      return NextResponse.json({ success: true, activePlan: null }); // or handle as broken link
    }

    return NextResponse.json({
      success: true,
      activePlan: {
        id: planSnap.id,
        ...planSnap.data(),
      },
    });
  } catch (error: unknown) {
    console.error("active-plan error:", error);
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { success: false, error: "Failed to fetch active plan", detail: message },
      { status: 500 }
    );
  }
}
