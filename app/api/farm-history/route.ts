import { NextRequest, NextResponse } from "next/server";
import { firestoreServer } from "../../../lib/firestore-server";

export async function GET(req: NextRequest) {
  try {
    // Safety: Do NOT trust userId from query parameters
    const userId = req.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Authentication Failure: Unverified UID context" },
        { status: 401 }
      );
    }

    const querySnapshot = await firestoreServer
      .collection("farmPlans")
      .where("userId", "==", userId)
      .get();
    const plans = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json({ success: true, history: plans });
  } catch (error: unknown) {
    console.error("farm-history GET error:", error);
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { success: false, error: "Failed to fetch farm history", detail: message },
      { status: 500 }
    );
  }
}
