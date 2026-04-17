import { NextRequest, NextResponse } from "next/server";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId is required" },
        { status: 400 }
      );
    }

    // 1. Get user document to find activePlanId
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const userData = userSnap.data();
    const activePlanId = userData.activePlanId;

    if (!activePlanId) {
      return NextResponse.json({ success: true, activePlan: null });
    }

    // 2. Fetch the actual plan data
    const planRef = doc(db, "farmPlans", activePlanId);
    const planSnap = await getDoc(planRef);

    if (!planSnap.exists()) {
      return NextResponse.json({ success: true, activePlan: null }); // or handle as broken link
    }

    return NextResponse.json({
      success: true,
      activePlan: {
        id: planSnap.id,
        ...planSnap.data(),
      },
    });
  } catch (error: any) {
    console.error("active-plan error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch active plan", detail: error.message },
      { status: 500 }
    );
  }
}
