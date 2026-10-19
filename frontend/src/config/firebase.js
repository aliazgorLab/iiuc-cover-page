/**
 * Firebase Client SDK Initialization & Staging Isolation Guard
 *
 * SAFETY INVARIANTS:
 * 1. Zero Hardcoded Fallbacks: Never silently fall back to production credentials.
 * 2. Fail-Closed Staging Gate: Staging mode strictly requires 'iiuc-cover-page-staging'.
 * 3. Production Protection: Staging builds explicitly reject production project 'iiuccoverpage-8edd3'.
 * 4. Environment Isolation: All configuration is derived from framework-standard VITE_ variables.
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const STAGING_PROJECT_ID = 'iiuc-cover-page-staging';
export const PRODUCTION_PROJECT_ID = 'iiuccoverpage-8edd3';

export const REQUIRED_FIREBASE_KEYS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_APP_ID',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
];

/**
 * Validates Firebase environment configuration.
 * Fails closed if in staging mode and:
 * - Project ID is not 'iiuc-cover-page-staging'
 * - Project ID attempts to target production 'iiuccoverpage-8edd3'
 * - Any required key is missing or is an unreplaced placeholder
 *
 * @param {Object|null} rawEnv - Optional environment override (for testing)
 * @returns {{ valid: boolean, isStaging: boolean, errors: string[], config: Object }}
 */
export function validateFirebaseConfig(rawEnv = null) {
  const env = rawEnv || (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {});
  const mode = env.MODE || env.NODE_ENV || 'development';
  const appEnv = env.VITE_APP_ENV || mode;
  const projectId = (env.VITE_FIREBASE_PROJECT_ID || '').trim();
  const apiKey = (env.VITE_FIREBASE_API_KEY || '').trim();
  const authDomain = (env.VITE_FIREBASE_AUTH_DOMAIN || '').trim();
  const storageBucket = (env.VITE_FIREBASE_STORAGE_BUCKET || '').trim();
  const messagingSenderId = (env.VITE_FIREBASE_MESSAGING_SENDER_ID || '').trim();
  const appId = (env.VITE_FIREBASE_APP_ID || '').trim();

  const isStaging = mode === 'staging' || appEnv === 'staging' || projectId === STAGING_PROJECT_ID;
  const errors = [];

  // Critical Gate 1: Staging cannot target production
  if (isStaging && projectId === PRODUCTION_PROJECT_ID) {
    errors.push(
      `[SECURITY REFUSAL] Staging environment attempted to target production project "${PRODUCTION_PROJECT_ID}". Staging must strictly target "${STAGING_PROJECT_ID}".`
    );
  }

  // Critical Gate 2: Staging must explicitly target staging project ID
  if (isStaging && projectId !== STAGING_PROJECT_ID) {
    errors.push(
      `[FAIL-CLOSED GATE] Staging environment requires VITE_FIREBASE_PROJECT_ID="${STAGING_PROJECT_ID}", but received "${projectId || 'EMPTY/UNDEFINED'}".`
    );
  }

  // Critical Gate 3: Check required keys in staging
  if (isStaging) {
    for (const key of REQUIRED_FIREBASE_KEYS) {
      const val = (env[key] || '').trim();
      if (!val) {
        errors.push(`Missing required staging variable: ${key}`);
      } else if (val.startsWith('your_') || val.startsWith('<') || val.includes('placeholder')) {
        errors.push(`Unreplaced placeholder value detected for required staging variable: ${key} ("${val}")`);
      }
    }
  }

  const config = {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
  };

  return {
    valid: errors.length === 0,
    isStaging,
    errors,
    config,
  };
}

/**
 * Retrieves validated Firebase configuration or throws if validation fails.
 */
export function getFirebaseConfig(rawEnv = null) {
  const result = validateFirebaseConfig(rawEnv);
  if (!result.valid) {
    const errorMsg = `[Firebase Configuration Failure]\n` + result.errors.map((e) => `  ✗ ${e}`).join('\n');
    throw new Error(errorMsg);
  }
  return result.config;
}

// In-app singleton initialization
const currentEnv = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {};
const validation = validateFirebaseConfig(currentEnv);

if (!validation.valid && validation.isStaging) {
  // Fail closed immediately during staging build or runtime
  throw new Error(`[Firebase Fail-Closed Staging Gate]\n` + validation.errors.map((e) => `  ✗ ${e}`).join('\n'));
}

// Only initialize Firebase if a valid API key and project ID are present
let app = null;
let authInstance = null;
let dbInstance = null;

if (validation.valid && validation.config.apiKey && validation.config.projectId) {
  app = getApps().length === 0 ? initializeApp(validation.config) : getApp();
  authInstance = getAuth(app);
  dbInstance = getFirestore(app);
}

export const auth = authInstance;
export const db = dbInstance;

// Pre-configured Google Auth Provider for IIUC Academic Accounts
export const googleAuthProvider = new GoogleAuthProvider();
googleAuthProvider.setCustomParameters({
  prompt: 'select_account',
  hd: 'ugrad.iiuc.ac.bd',
});

export default app;
