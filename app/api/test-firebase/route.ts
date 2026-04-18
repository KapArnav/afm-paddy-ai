import { NextResponse } from "next/server";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase"; // adjust path as needed if you use @ alias

export async function GET() {
  try {
    console.log("Testing Firestore connection...");

    // Create a reference to a temporary testing collection
    const testCollectionRef = collection(db, "test_collection");

    // Write a sample document
    const docRef = await addDoc(testCollectionRef, {
      message: "Hello from AFM Paddy AI!",
      status: "Firebase connection successful!",
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: "Successfully wrote to Firestore database!",
      documentId: docRef.id
    });
  } catch (error: unknown) {
    console.error("test-firebase error:", error);
    const message = error instanceof Error ? error.message : "Database connection failed";
    return NextResponse.json(
      { success: false, error: "Database connection failed", detail: message },
      { status: 500 }
    );
  }
}
