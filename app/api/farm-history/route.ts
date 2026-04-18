import { NextRequest, NextResponse } from "next/server";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../lib/firebase";

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

    const plansRef = collection(db, "farmPlans");
    // Order by createdAt descending
    const q = query(
      plansRef, 
      where("userId", "==", userId)
    );
    
    const querySnapshot = await getDocs(q);
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
