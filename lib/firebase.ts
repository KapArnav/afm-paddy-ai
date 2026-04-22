import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "demo",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "demo",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "demo",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "demo",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "demo",
};

// Initialize Firebase for both browser and server
// During build, this will use the "demo" fallbacks but shouldn't crash
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

/**
 * Upload a Blob image to Firebase Storage under "farm-images/"
 * Returns the public download URL of the uploaded file.
 */
async function uploadImage(file: Blob): Promise<string> {
  if (typeof window === "undefined" || !storage) {
    throw new Error("Firebase storage is not initialized or not in browser");
  }
  const filename = `farm-images/${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;
  const storageRef = ref(storage, filename);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  return url;
}

export { app, db, storage, auth, uploadImage };
