/* global process */
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Fail-closed staging build validation
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isStaging = mode === 'staging' || env.VITE_APP_ENV === 'staging';

  if (isStaging) {
    const projectId = (env.VITE_FIREBASE_PROJECT_ID || '').trim();

    // Critical Gate 1: Staging must never target production
    if (projectId === 'iiuccoverpage-8edd3') {
      throw new Error(
        '[SECURITY REFUSAL] Staging build attempted to target production project "iiuccoverpage-8edd3"! Aborting build.'
      );
    }

    // Critical Gate 2: Staging must strictly target dedicated staging project
    if (projectId !== 'iiuc-cover-page-staging') {
      throw new Error(
        `[FAIL-CLOSED GATE] Staging build requires VITE_FIREBASE_PROJECT_ID="iiuc-cover-page-staging", received: "${projectId || 'EMPTY'}". Aborting build.`
      );
    }

    // Critical Gate 3: All required staging keys must be present and non-placeholder at build time
    const requiredKeys = [
      'VITE_FIREBASE_API_KEY',
      'VITE_FIREBASE_AUTH_DOMAIN',
      'VITE_FIREBASE_PROJECT_ID',
      'VITE_FIREBASE_APP_ID',
      'VITE_FIREBASE_MESSAGING_SENDER_ID',
    ];

    for (const key of requiredKeys) {
      const val = (env[key] || '').trim();
      if (!val) {
        throw new Error(`[FAIL-CLOSED GATE] Staging build missing required variable: ${key}. Aborting build.`);
      }
      if (val.startsWith('your_') || val.startsWith('<') || val.includes('placeholder')) {
        throw new Error(
          `[FAIL-CLOSED GATE] Staging build detected placeholder value for ${key}. Aborting build.`
        );
      }
    }
  }

  return {
    plugins: [react()],
  };
});
