import { NextRequest, NextResponse } from "next/server";
import { collection, doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { z } from "zod";

const UserSchema = z.object({
  userId: z.string().min(5),
  name: z.string().min(2).max(100),
  location: z.string().min(2).max(100),
  cropType: z.string().max(50),
  farmSize: z.string().max(50),
  irrigationType: z.string().max(50),
  growthStage: z.string().max(50).optional(),
  soilCondition: z.string().max(50),
  fertilizerUsage: z.string().max(50),
  pestHistory: z.string().max(200)
});

// ── POST /api/user - Save or update user profile ─────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Validate input payload
    const validation = UserSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Invalid Input", details: validation.error.format() },
        { status: 400 }
      );
    }

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
    } = validation.data;

    // Safety: Only accept UID from the body in POST context
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Authentication Failure: Missing userId in context" },
        { status: 401 }
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
  } catch (error: unknown) {
    console.error("user POST error:", error);
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { success: false, error: "Failed to save user profile", detail: message },
      { status: 500 }
    );
  }
}

// ── GET /api/user?userId=xxx - Fetch a user profile ──────────────────
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

    const userRef = doc(collection(db, "users"), userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return NextResponse.json(
        { success: true, user: null, message: "User not found" }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: userSnap.id,
        ...userSnap.data(),
      },
    });
  } catch (error: unknown) {
    console.error("user GET error:", error);
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { success: false, error: "Failed to fetch user profile", detail: message },
      { status: 500 }
    );
  }
}
