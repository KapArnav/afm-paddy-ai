import { NextRequest, NextResponse } from "next/server";
import { collection, doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../lib/firebase";

// ── POST /api/user - Save or update user profile ─────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      userId, 
      name, 
      location, 
      cropType, 
      farmSize, 
      irrigationType, 
      growthStage, 
      soilCondition, 
      fertilizerUsage, 
      pestHistory 
    } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId is required" },
        { status: 400 }
      );
    }

    const userRef = doc(collection(db, "users"), userId);
    await setDoc(
      userRef,
      {
        uid: userId, // matching user schema requirement
        name: name ?? "Unknown Farmer",
        location: location ?? "Unknown Region",
        cropType: cropType ?? "Paddy",
        farmSize: farmSize ?? "Unknown",
        irrigationType: irrigationType ?? "Unknown",
        growthStage: growthStage ?? "Unknown",
        soilCondition: soilCondition ?? "Unknown",
        fertilizerUsage: fertilizerUsage ?? "Unknown",
        pestHistory: pestHistory ?? "Unknown",
        createdAt: serverTimestamp(), // user requested createdAt
        updatedAt: serverTimestamp(),
      },
      { merge: true } // Update without overwriting conditionally if needed, but merge true means it merges fields.
    );

    return NextResponse.json({ success: true, message: "User profile saved successfully" });
  } catch (error: any) {
    console.error("user POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save user profile", detail: error.message },
      { status: 500 }
    );
  }
}

// ── GET /api/user?userId=xxx - Fetch a user profile ──────────────────
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

    const userRef = doc(collection(db, "users"), userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: userSnap.id,
        ...userSnap.data(),
      },
    });
  } catch (error: any) {
    console.error("user GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch user profile", detail: error.message },
      { status: 500 }
    );
  }
}
