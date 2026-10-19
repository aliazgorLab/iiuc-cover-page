/**
 * Frontend Firebase Configuration & Staging Isolation Automated Test Suite
 *
 * Validates fail-closed safety gates, zero hardcoded production fallbacks,
 * and staging project isolation invariants.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  validateFirebaseConfig,
  getFirebaseConfig,
  STAGING_PROJECT_ID,
  PRODUCTION_PROJECT_ID,
  REQUIRED_FIREBASE_KEYS,
} from '../src/config/firebase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDir = path.resolve(__dirname, '..');

let passedTests = 0;
let failedTests = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    passedTests++;
    console.log(`  ✓ [PASS] ${testName}`);
  } else {
    failedTests++;
    console.error(`  ✗ [FAIL] ${testName}`);
    if (details) console.error(`    Details: ${details}`);
  }
}

console.log('======================================================================');
console.log('  IIUC Cover Page Platform — Frontend Staging Configuration Test Suite');
console.log('======================================================================\n');

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 1: STAGING VALIDATION LOGIC TESTS
// ─────────────────────────────────────────────────────────────────────────────
console.log('[Suite 1: Staging Environment Isolation & Fail-Closed Gates]');

// Test 1: Clean Staging Configuration (Positive)
const validStagingEnv = {
  MODE: 'staging',
  VITE_APP_ENV: 'staging',
  VITE_FIREBASE_PROJECT_ID: STAGING_PROJECT_ID,
  VITE_FIREBASE_API_KEY: 'AIzaSyFakeKeyForStagingUnitTesting12345',
  VITE_FIREBASE_AUTH_DOMAIN: `${STAGING_PROJECT_ID}.firebaseapp.com`,
  VITE_FIREBASE_STORAGE_BUCKET: `${STAGING_PROJECT_ID}.firebasestorage.app`,
  VITE_FIREBASE_MESSAGING_SENDER_ID: '987654321098',
  VITE_FIREBASE_APP_ID: '1:987654321098:web:abcdef1234567890',
};

const res1 = validateFirebaseConfig(validStagingEnv);
assert(res1.valid === true, 'Test 1: Valid staging configuration accepted');
assert(res1.isStaging === true, 'Test 1b: Environment correctly flagged as staging');
assert(res1.config.projectId === STAGING_PROJECT_ID, 'Test 1c: Project ID matches staging project');

// Test 2: Production Spoof Protection (Critical Negative Gate)
const productionSpoofEnv = {
  ...validStagingEnv,
  VITE_FIREBASE_PROJECT_ID: PRODUCTION_PROJECT_ID,
};
const res2 = validateFirebaseConfig(productionSpoofEnv);
assert(res2.valid === false, 'Test 2: Rejects staging configuration targeting production project');
assert(
  res2.errors.some((e) => e.includes('[SECURITY REFUSAL]')),
  'Test 2b: Triggers critical security refusal error'
);

// Test 3: Rogue Project ID Rejection
const rogueProjectEnv = {
  ...validStagingEnv,
  VITE_FIREBASE_PROJECT_ID: 'unauthorized-random-project',
};
const res3 = validateFirebaseConfig(rogueProjectEnv);
assert(res3.valid === false, 'Test 3: Rejects staging configuration with rogue project ID');
assert(
  res3.errors.some((e) => e.includes('[FAIL-CLOSED GATE]')),
  'Test 3b: Triggers fail-closed gate error'
);

// Test 4: Missing Required Project ID
const missingProjectEnv = {
  ...validStagingEnv,
  VITE_FIREBASE_PROJECT_ID: '',
};
const res4 = validateFirebaseConfig(missingProjectEnv);
assert(res4.valid === false, 'Test 4: Rejects staging configuration with missing project ID');

// Test 5: Missing Required API Key
const missingApiKeyEnv = {
  ...validStagingEnv,
  VITE_FIREBASE_API_KEY: '',
};
const res5 = validateFirebaseConfig(missingApiKeyEnv);
assert(res5.valid === false, 'Test 5: Rejects staging configuration with missing API key');
assert(
  res5.errors.some((e) => e.includes('Missing required staging variable: VITE_FIREBASE_API_KEY')),
  'Test 5b: Identifies missing API key precisely'
);

// Test 6: Missing Required App ID
const missingAppIdEnv = {
  ...validStagingEnv,
  VITE_FIREBASE_APP_ID: '',
};
const res6 = validateFirebaseConfig(missingAppIdEnv);
assert(res6.valid === false, 'Test 6: Rejects staging configuration with missing App ID');
assert(
  res6.errors.some((e) => e.includes('Missing required staging variable: VITE_FIREBASE_APP_ID')),
  'Test 6b: Identifies missing App ID precisely'
);

// Test 7: Unreplaced Placeholder Detection
const placeholderEnv = {
  ...validStagingEnv,
  VITE_FIREBASE_API_KEY: 'your_staging_api_key_here',
};
const res7 = validateFirebaseConfig(placeholderEnv);
assert(res7.valid === false, 'Test 7: Rejects staging configuration with unreplaced placeholder API key');
assert(
  res7.errors.some((e) => e.includes('Unreplaced placeholder value detected')),
  'Test 7b: Explicitly detects placeholder strings'
);

// Test 8: getFirebaseConfig Throws on Invalid Staging
let threwExpectedError = false;
try {
  getFirebaseConfig(productionSpoofEnv);
} catch (e) {
  threwExpectedError = e.message.includes('[Firebase Configuration Failure]');
}
assert(threwExpectedError, 'Test 8: getFirebaseConfig throws fail-closed exception on invalid config');

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 2: SOURCE CODE & FILE INTEGRITY TESTS
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n[Suite 2: Zero-Hardcoded Secrets & Gitignore Compliance]');

// Test 9: Zero Hardcoded Fallbacks in firebase.js
const firebaseJsPath = path.join(frontendDir, 'src', 'config', 'firebase.js');
const firebaseJsContent = fs.readFileSync(firebaseJsPath, 'utf8');

const hasProductionFallback = firebaseJsContent.includes('"AIzaSyCZtbOipboeS_8KplHltvgWaFRK2poH71w"');
const hasHardcodedProdIdFallback = /projectId:\s*['"]iiuccoverpage-8edd3['"]/.test(firebaseJsContent);

assert(!hasProductionFallback, 'Test 9: No hardcoded production API key exists in firebase.js');
assert(!hasHardcodedProdIdFallback, 'Test 9b: No hardcoded production project ID fallback exists in firebase.js');

// Test 10: .env.example Sanitization Check
const envExamplePath = path.join(frontendDir, '.env.example');
const envExampleContent = fs.readFileSync(envExamplePath, 'utf8');

assert(
  envExampleContent.includes('VITE_FIREBASE_PROJECT_ID=iiuc-cover-page-staging'),
  'Test 10: .env.example references iiuc-cover-page-staging'
);
assert(
  envExampleContent.includes('your_staging_firebase_api_key_here'),
  'Test 10b: .env.example uses placeholder values only'
);
assert(
  !envExampleContent.includes('AIzaSyCZtbOipboeS_8KplHltvgWaFRK2poH71w'),
  'Test 10c: .env.example contains zero production keys'
);

// Test 11: .gitignore Coverage for Staging Files
const gitignorePath = path.join(frontendDir, '.gitignore');
const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');

assert(gitignoreContent.includes('.env.*'), 'Test 11: frontend/.gitignore covers .env.* wildcard');
assert(gitignoreContent.includes('!.env.example'), 'Test 11b: frontend/.gitignore preserves !.env.example');

// ─────────────────────────────────────────────────────────────────────────────
// SUITE 3: BUILD-TIME FAIL-CLOSED INTEGRATION TESTS (Vite build runner)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n[Suite 3: Vite Build-Time Fail-Closed Gates]');

import { execSync } from 'child_process';

// Test 12: Vite build rejects production project spoof
let build12Refused = false;
try {
  execSync('npx vite build --mode staging', {
    cwd: frontendDir,
    env: { ...process.env, VITE_FIREBASE_PROJECT_ID: PRODUCTION_PROJECT_ID },
    stdio: 'pipe',
  });
} catch (err) {
  const combined = (err.stdout ? err.stdout.toString() : '') + '\n' + (err.stderr ? err.stderr.toString() : '');
  build12Refused = combined.includes('[SECURITY REFUSAL]') && combined.includes(PRODUCTION_PROJECT_ID);
}
assert(build12Refused, 'Test 12: Vite build immediately halts if staging targets production project ID');

// Test 13: Vite build rejects rogue project ID
let build13Refused = false;
try {
  execSync('npx vite build --mode staging', {
    cwd: frontendDir,
    env: { ...process.env, VITE_FIREBASE_PROJECT_ID: 'rogue-unauthorized-project' },
    stdio: 'pipe',
  });
} catch (err) {
  const combined = (err.stdout ? err.stdout.toString() : '') + '\n' + (err.stderr ? err.stderr.toString() : '');
  build13Refused = combined.includes('[FAIL-CLOSED GATE]') && combined.includes(STAGING_PROJECT_ID);
}
assert(build13Refused, 'Test 13: Vite build immediately halts if staging targets rogue project ID');

// ─────────────────────────────────────────────────────────────────────────────
// SUMMARY & VERDICT
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n----------------------------------------------------------------------');
console.log(`Test Execution Summary: ${passedTests} Passed | ${failedTests} Failed`);
console.log('----------------------------------------------------------------------');

if (failedTests > 0) {
  console.error('❌ CONFIGURATION VALIDATION FAILED!');
  process.exit(1);
} else {
  console.log('✅ ALL STAGING CONFIGURATION GATES VERIFIED SUCCESSFULLY!\n');
  process.exit(0);
}
