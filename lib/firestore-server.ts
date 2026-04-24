import { Firestore } from '@google-cloud/firestore';

const PROJECT_ID =
  process.env.FIRESTORE_PROJECT_ID ||
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
  "afm-ai-95d0d";

/**
 * Server-side Firestore client using Google Cloud SDK.
 * This client uses Application Default Credentials (ADC),
 * which works automatically on the server if gcloud auth is set.
 */
export const firestoreServer = new Firestore({
  projectId: PROJECT_ID,
});
