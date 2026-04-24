/**
 * lib/vision-cache.ts
 * Firestore-backed caching for vision analysis results to save on Gemini TPM quota.
 * Uses existing server-side Firebase initialization.
 */
import { firestoreServer } from "./firestore-server";
import { FieldValue, Timestamp } from "@google-cloud/firestore";

export interface VisionResult {
  findings: string;
  timestamp: any;
}

/**
 * Generate a cache key from userId and image base64 prefix.
 * Uses first 500 chars to identify unique images within a session.
 */
export function getVisionCacheKey(userId: string, imageBase64: string): string {
  // Extract raw base64 if it has prefix
  const rawBase64 = imageBase64.includes(",") ? imageBase64.split(",")[1] : imageBase64;
  const hash = rawBase64.substring(0, 500).replace(/[^a-zA-Z0-9]/g, "");
  return `${userId}_${hash}`;
}

/**
 * Check if a fresh ( < 24h ) vision result exists in cache.
 */
export async function checkVisionCache(userId: string, imageBase64: string): Promise<string | null> {
  try {
    const cacheKey = getVisionCacheKey(userId, imageBase64);
    const docSnap = await firestoreServer.collection("visionCache").doc(cacheKey).get();

    if (docSnap.exists) {
      const data = docSnap.data();
      if (!data) return null;
      const ts = data.timestamp as Timestamp;
      
      if (ts) {
        const ageMs = Date.now() - ts.toMillis();
        const oneDayMs = 24 * 60 * 60 * 1000;
        
        if (ageMs < oneDayMs) {
          console.log(`[Vision Cache] HIT for key: ${cacheKey}`);
          return data.findings || null;
        }
      }
    }
    
    console.log(`[Vision Cache] MISS for user: ${userId}`);
    return null;
  } catch (err) {
    console.error("[Vision Cache] Error checking cache:", err);
    return null;
  }
}

/**
 * Store vision findings in cache.
 */
export async function setVisionCache(userId: string, imageBase64: string, findings: string): Promise<void> {
  try {
    const cacheKey = getVisionCacheKey(userId, imageBase64);
    await firestoreServer.collection("visionCache").doc(cacheKey).set({
      userId,
      findings,
      timestamp: FieldValue.serverTimestamp()
    });
    
    console.log(`[Vision Cache] SET entry for key: ${cacheKey}`);
  } catch (err) {
    console.error("[Vision Cache] Error setting cache:", err);
  }
}
