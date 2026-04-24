import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCphllpl5vaD8u2d2eTjyLNQarP9pd848I",
  authDomain: "afm-ai-95d0d.firebaseapp.com",
  projectId: "afm-ai-95d0d",
  storageBucket: "afm-ai-95d0d.firebasestorage.app",
  messagingSenderId: "366051982224",
  appId: "1:366051982224:web:4a3c70c9d00aef733fd115",
  measurementId: "G-GK14MLY2GJ"
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
