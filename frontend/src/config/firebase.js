/**
 * Firebase Client SDK Initialization (Vite Modular Web SDK v11/v12/v13)
 *
 * Configured for IIUC Cover Page Platform (Project ID: iiuccoverpage-8edd3)
 * Uses framework-standard VITE_ environment variables with safe defaults.
 *
 * NOTE: Firebase Web client configuration contains public project identifiers.
 * Privileged operations are restricted by Firestore Security Rules and server-side components.
 * Firebase Admin SDK service account keys must NEVER be placed in client code.
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCZtbOipboeS_8KplHltvgWaFRK2poH71w",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "iiuccoverpage-8edd3.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "iiuccoverpage-8edd3",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "iiuccoverpage-8edd3.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "495703858731",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:495703858731:web:85c0e3c6db9546e716146e",
};

// Singleton pattern prevents re-initialization during HMR in Vite
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);

// Pre-configured Google Auth Provider for IIUC Academic Accounts
export const googleAuthProvider = new GoogleAuthProvider();
googleAuthProvider.setCustomParameters({
  prompt: 'select_account',
  // Note: While hd parameter provides a hint to Google login UI,
  // strict security enforcement must be verified against email domain in code & rules.
  hd: 'ugrad.iiuc.ac.bd',
});

export default app;
