import { NextRequest, NextResponse } from "next/server";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../../../lib/firebase";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId query parameter is required" },
        { status: 400 }
      );
    }

    const plansRef = collection(db, "farmPlans");
    // Order by createdAt descending
    const q = query(
      plansRef, 
      where("userId", "==", userId)
    );
    
    const querySnapshot = await getDocs(q);
    const plans: any[] = [];
    
    querySnapshot.forEach((doc) => {
      plans.push({ id: doc.id, ...doc.data() });
    });

    return NextResponse.json({ success: true, history: plans });
  } catch (error: any) {
    console.error("farm-history GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch farm history", detail: error.message },
      { status: 500 }
    );
  }
}
