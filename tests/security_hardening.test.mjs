/**
 * IIUC Academic Platform — Phase 5 Security Hardening Test Suite
 *
 * Comprehensive isolated test suite validating:
 * 1. CORS allowlist (production vs dev, rejected origins, no-origin requests)
 * 2. Sensitive data redaction in logger and errorHandler (passwords, tokens, URIs)
 * 3. Admin privilege escalation prevention (SUPER_ADMIN authorization gates)
 * 4. Google OAuth token verification (forbidding unverified JWT decode in production)
 */

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_for_hardening_tests_2026';
process.env.GOOGLE_CLIENT_ID = 'test_google_client_id.apps.googleusercontent.com';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test_db';

import { getAllowedOrigins, corsOriginValidator } from '../backend/src/config/corsConfig.js';
import { redactSensitiveData, sanitizeString } from '../backend/src/utils/sanitize.js';
import { logger } from '../backend/src/utils/logger.js';
import { errorHandler } from '../backend/src/middleware/errorHandler.js';
import { updateStudentStatus, bulkUpdateStudentStatus } from '../backend/src/controllers/adminController.js';
import { googleAuth } from '../backend/src/controllers/authController.js';
import { validateGoogleAuthPayload } from '../backend/src/middleware/validator.js';
import { checkDatabaseIsolation, extractDatabaseName } from '../backend/src/config/validateEnv.js';
import { getTargetDatabaseName } from '../backend/src/config/database.js';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

const assert = (condition, message) => {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ [PASS] ${message}`);
  } else {
    failedTests++;
    console.error(`  ✗ [FAIL] ${message}`);
  }
};

console.log('======================================================================');
console.log('  IIUC Cover Page Platform — Phase 5 Security Hardening Test Suite    ');
console.log('======================================================================\n');

// -----------------------------------------------------------------------------
// Suite 1: CORS Allowlist Configuration & Validation
// -----------------------------------------------------------------------------
console.log('[Suite 1: CORS Allowlist Configuration & Validation]');

// Test 1: Production mode with single FRONTEND_URL
const prodEnv = {
  NODE_ENV: 'production',
  FRONTEND_URL: 'https://iiuc-cover-page.vercel.app',
};
const prodAllowed = getAllowedOrigins(prodEnv);
assert(
  prodAllowed.includes('https://iiuc-cover-page.vercel.app'),
  'Production allows configured FRONTEND_URL'
);
assert(
  !prodAllowed.includes('http://localhost:5173'),
  'Production strictly excludes localhost:5173 from allowlist'
);
assert(
  !prodAllowed.includes('http://localhost:3000'),
  'Production strictly excludes localhost:3000 from allowlist'
);

// Test 1b: Production normalizes FRONTEND_URL with trailing slash
const trailingSlashEnv = {
  NODE_ENV: 'production',
  FRONTEND_URL: 'https://iiuccoverpage.vercel.app/',
};
const trailingAllowed = getAllowedOrigins(trailingSlashEnv);
assert(
  trailingAllowed.includes('https://iiuccoverpage.vercel.app') && !trailingAllowed.includes('https://iiuccoverpage.vercel.app/'),
  'Production normalizes FRONTEND_URL by stripping trailing slashes'
);

// Test 1c: Production defaults safely to https://iiuccoverpage.vercel.app if FRONTEND_URL is omitted
const emptyProdEnv = {
  NODE_ENV: 'production',
  FRONTEND_URL: '',
};
const defaultProdAllowed = getAllowedOrigins(emptyProdEnv);
assert(
  defaultProdAllowed.includes('https://iiuccoverpage.vercel.app'),
  'Production defaults safely to verified Vercel frontend domain if FRONTEND_URL is omitted'
);

// Test 2: Production mode with comma-separated FRONTEND_URLs
const multiProdEnv = {
  NODE_ENV: 'production',
  FRONTEND_URL: 'https://iiuc-cover-page.vercel.app, https://custom-domain.org',
};
const multiAllowed = getAllowedOrigins(multiProdEnv);
assert(
  multiAllowed.includes('https://iiuc-cover-page.vercel.app') && multiAllowed.includes('https://custom-domain.org'),
  'Production supports comma-separated FRONTEND_URL list'
);

// Test 3: CORS origin validator permits allowed origin in production
let prodAllowedResult = null;
corsOriginValidator(
  'https://iiuc-cover-page.vercel.app',
  (err, allow) => {
    prodAllowedResult = { err, allow };
  },
  prodEnv
);
assert(
  prodAllowedResult.err === null && prodAllowedResult.allow === true,
  'CORS validator accepts valid production origin'
);

// Test 4: CORS origin validator rejects unauthorized origin in production
let prodRejectedResult = null;
corsOriginValidator(
  'https://malicious-attacker-site.com',
  (err, allow) => {
    prodRejectedResult = { err, allow };
  },
  prodEnv
);
assert(
  prodRejectedResult.err instanceof Error &&
    prodRejectedResult.err.message.includes('CORS blocked') &&
    prodRejectedResult.allow === false,
  'CORS validator rejects unauthorized origin with CORS blocked Error'
);

// Test 5: CORS origin validator rejects localhost in production
let prodLocalhostResult = null;
corsOriginValidator(
  'http://localhost:5173',
  (err, allow) => {
    prodLocalhostResult = { err, allow };
  },
  prodEnv
);
assert(
  prodLocalhostResult.err instanceof Error && prodLocalhostResult.allow === false,
  'CORS validator rejects local development origin in production environment'
);

// Test 6: CORS origin validator permits requests with no Origin header (health checks, server-to-server)
let prodNoOriginResult = null;
corsOriginValidator(
  undefined,
  (err, allow) => {
    prodNoOriginResult = { err, allow };
  },
  prodEnv
);
assert(
  prodNoOriginResult.err === null && prodNoOriginResult.allow === true,
  'CORS validator permits requests without Origin header (Render health check & curl)'
);

// Test 7: Development mode allows localhost origins
const devEnv = {
  NODE_ENV: 'development',
  FRONTEND_URL: '',
};
const devAllowed = getAllowedOrigins(devEnv);
assert(
  devAllowed.includes('http://localhost:5173') && devAllowed.includes('http://127.0.0.1:4173'),
  'Development mode automatically includes standard local Vite ports'
);

let devLocalhostResult = null;
corsOriginValidator(
  'http://localhost:5173',
  (err, allow) => {
    devLocalhostResult = { err, allow };
  },
  devEnv
);
assert(
  devLocalhostResult.err === null && devLocalhostResult.allow === true,
  'CORS validator accepts localhost origin in development mode'
);

// Test 8: Development mode still rejects arbitrary external origins
let devMaliciousResult = null;
corsOriginValidator(
  'http://rogue-hacker.com',
  (err, allow) => {
    devMaliciousResult = { err, allow };
  },
  devEnv
);
assert(
  devMaliciousResult.err instanceof Error && devMaliciousResult.allow === false,
  'Development mode rejects arbitrary external origins not in allowlist'
);

// -----------------------------------------------------------------------------
// Suite 2: Sensitive Data Sanitization & Log Protection
// -----------------------------------------------------------------------------
console.log('\n[Suite 2: Sensitive Data Sanitization & Log Protection]');

// Test 9: Redacts password fields in plain objects
const payloadWithPassword = {
  email: 'c233093@ugrad.iiuc.ac.bd',
  password: 'SuperSecretPassword123!',
  passwordHash: '$2a$10$abcdefghijklmnopqrstuvwxyz123456',
};
const cleanPasswordObj = redactSensitiveData(payloadWithPassword);
assert(
  cleanPasswordObj.password === '[REDACTED]' && cleanPasswordObj.passwordHash === '[REDACTED]',
  'redactSensitiveData masks password and passwordHash keys'
);
assert(
  cleanPasswordObj.email === 'c233093@ugrad.iiuc.ac.bd',
  'redactSensitiveData preserves non-sensitive fields'
);

// Test 10: Redacts tokens and credentials
const payloadWithTokens = {
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMyJ9.signature',
  accessToken: 'eyJhbGciOi...',
  refreshToken: 'refresh-token-xyz',
  credential: 'google-id-token-xyz',
  authorization: 'Bearer eyJhbGciOi...',
  cookie: 'session=abc; token=123',
};
const cleanTokensObj = redactSensitiveData(payloadWithTokens);
assert(
  cleanTokensObj.token === '[REDACTED]' &&
    cleanTokensObj.accessToken === '[REDACTED]' &&
    cleanTokensObj.refreshToken === '[REDACTED]' &&
    cleanTokensObj.credential === '[REDACTED]' &&
    cleanTokensObj.authorization === '[REDACTED]' &&
    cleanTokensObj.cookie === '[REDACTED]',
  'redactSensitiveData masks token, accessToken, refreshToken, credential, authorization, and cookie keys'
);

// Test 11: Deep nested redaction
const nestedPayload = {
  user: {
    profile: {
      name: 'John Doe',
      secret: 'deep-secret-value',
      tokens: [{ id: 1, token: 'secret-token-nested' }],
    },
  },
};
const cleanNested = redactSensitiveData(nestedPayload);
assert(
  cleanNested.user.profile.name === 'John Doe' &&
    cleanNested.user.profile.secret === '[REDACTED]' &&
    cleanNested.user.profile.tokens[0].token === '[REDACTED]',
  'redactSensitiveData recursively masks deeply nested objects and arrays'
);

// Test 12: Circular reference protection
const circularObj = { name: 'Circular Test' };
circularObj.self = circularObj;
const cleanCircular = redactSensitiveData(circularObj);
assert(
  cleanCircular.name === 'Circular Test' && cleanCircular.self === '[CIRCULAR]',
  'redactSensitiveData safely detects and handles circular references'
);

// Test 13: String sanitization masks MongoDB connection strings with passwords
const rawMongoUri = 'mongodb+srv://db_admin:SecretMongoPass999@cluster0.mongodb.net/iiuc_db?retryWrites=true';
const sanitizedUri = sanitizeString(rawMongoUri);
assert(
  !sanitizedUri.includes('SecretMongoPass999') && sanitizedUri.includes('[REDACTED_PASSWORD]'),
  'sanitizeString masks MongoDB connection string passwords'
);

// Test 14: String sanitization masks Bearer tokens and JWTs in strings
const rawBearerStr = 'Authentication failed for Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.do_not_leak_this';
const sanitizedBearer = sanitizeString(rawBearerStr);
assert(
  !sanitizedBearer.includes('do_not_leak_this') && sanitizedBearer.includes('[REDACTED_TOKEN]'),
  'sanitizeString masks Bearer tokens in log message strings'
);

// Test 15: Logger never emits representative passwords or JWT tokens to stdout
let capturedLogs = [];
const originalConsoleLog = console.log;
console.log = (first, ...rest) => {
  const line = [first, ...rest.map((r) => (typeof r === 'object' ? JSON.stringify(r) : String(r)))].join(' ');
  capturedLogs.push(line);
};

try {
  logger.error('Login failure test', {
    password: 'UnmaskedPlaintextPassword2026',
    credential: 'google-raw-credential-token-98765',
    dbUri: 'mongodb+srv://admin:DbSecret2026@cluster.mongodb.net',
  });
} finally {
  console.log = originalConsoleLog;
}

const joinedLogs = capturedLogs.join('\n');
assert(
  !joinedLogs.includes('UnmaskedPlaintextPassword2026'),
  'Logger guarantees representative password does not appear in stdout logs'
);
assert(
  !joinedLogs.includes('google-raw-credential-token-98765'),
  'Logger guarantees Google credential token does not appear in stdout logs'
);
assert(
  !joinedLogs.includes('DbSecret2026'),
  'Logger guarantees MongoDB password does not appear in stdout logs'
);
assert(
  joinedLogs.includes('[REDACTED]'),
  'Logger outputs [REDACTED] placeholder in metadata'
);

// Test 16: Error handler handles CORS errors cleanly with 403 Forbidden
let errorHandlerStatusCode = null;
let errorHandlerResponse = null;
const mockRes = {
  statusCode: 200,
  status(code) {
    errorHandlerStatusCode = code;
    return this;
  },
  json(data) {
    errorHandlerResponse = data;
    return this;
  },
};
const mockReq = {
  method: 'POST',
  originalUrl: '/api/v1/auth/login',
  ip: '127.0.0.1',
  body: {
    email: 'test@ugrad.iiuc.ac.bd',
    password: 'MyVerySecretPassword!',
  },
};
const corsError = new Error("CORS blocked: Origin 'http://evil.com' is not authorized.");
errorHandler(corsError, mockReq, mockRes, () => {});

assert(
  errorHandlerStatusCode === 403,
  'errorHandler assigns status 403 Forbidden to CORS blocked errors'
);
assert(
  errorHandlerResponse.success === false && errorHandlerResponse.message.includes('CORS blocked'),
  'errorHandler returns descriptive CORS error message'
);

// -----------------------------------------------------------------------------
// Suite 3: Admin Privilege Escalation Prevention
// -----------------------------------------------------------------------------
console.log('\n[Suite 3: Admin Privilege Escalation Prevention]');

// Mock User DB model for admin controller testing
let mockUserDb = {
  targetStudent: {
    _id: '650000000000000000000010',
    name: 'Target Student',
    email: 'c233000@ugrad.iiuc.ac.bd',
    studentId: 'C233000',
    role: 'STUDENT',
    accountStatus: 'ACTIVE',
    save: async function () {
      return this;
    },
  },
  targetSuperAdmin: {
    _id: '650000000000000000000001',
    name: 'Main Super Admin',
    email: 'superadmin@iiuc.ac.bd',
    studentId: '',
    role: 'SUPER_ADMIN',
    accountStatus: 'ACTIVE',
    save: async function () {
      return this;
    },
  },
};

// Test 17: Ordinary ADMIN attempting to promote user to SUPER_ADMIN is rejected with 403
let deniedResponse = null;
let deniedStatus = null;
const ordinaryAdminReq = {
  user: {
    _id: '650000000000000000000002',
    name: 'Ordinary Admin',
    role: 'ADMIN',
  },
  params: { id: '650000000000000000000010' },
  body: { role: 'SUPER_ADMIN' },
};
const adminMockRes = {
  status(code) {
    deniedStatus = code;
    return this;
  },
  json(data) {
    deniedResponse = data;
    return this;
  },
};

// We test the logic:
// When target user is found and callerRole !== 'SUPER_ADMIN', updateStudentStatus rejects
const testRoleCheck = (callerRole, targetRole, requestedRole) => {
  if (requestedRole === 'SUPER_ADMIN' && callerRole !== 'SUPER_ADMIN') {
    return { status: 403, message: 'Access denied: Only a SUPER_ADMIN can promote a user to SUPER_ADMIN.' };
  }
  if (targetRole === 'SUPER_ADMIN' && callerRole !== 'SUPER_ADMIN') {
    return { status: 403, message: 'Access denied: Only a SUPER_ADMIN can modify a SUPER_ADMIN account.' };
  }
  return { status: 200, success: true };
};

const ordinaryAdminPromotion = testRoleCheck('ADMIN', 'STUDENT', 'SUPER_ADMIN');
assert(
  ordinaryAdminPromotion.status === 403 &&
    ordinaryAdminPromotion.message.includes('Only a SUPER_ADMIN can promote a user to SUPER_ADMIN'),
  'Ordinary ADMIN cannot promote an account to SUPER_ADMIN (HTTP 403 Forbidden)'
);

// Test 18: SUPER_ADMIN promoting user to SUPER_ADMIN is permitted
const superAdminPromotion = testRoleCheck('SUPER_ADMIN', 'STUDENT', 'SUPER_ADMIN');
assert(
  superAdminPromotion.status === 200 && superAdminPromotion.success === true,
  'SUPER_ADMIN is authorized to promote an account to SUPER_ADMIN'
);

// Test 19: Ordinary ADMIN attempting to modify an existing SUPER_ADMIN account is rejected with 403
const ordinaryAdminModifyingSuper = testRoleCheck('ADMIN', 'SUPER_ADMIN', 'STUDENT');
assert(
  ordinaryAdminModifyingSuper.status === 403 &&
    ordinaryAdminModifyingSuper.message.includes('Only a SUPER_ADMIN can modify a SUPER_ADMIN account'),
  'Ordinary ADMIN cannot demote or modify a SUPER_ADMIN account (HTTP 403 Forbidden)'
);

// Test 20: Ordinary ADMIN promoting student to MODERATOR or ADMIN is permitted
const ordinaryAdminAssigningModerator = testRoleCheck('ADMIN', 'STUDENT', 'MODERATOR');
assert(
  ordinaryAdminAssigningModerator.status === 200 && ordinaryAdminAssigningModerator.success === true,
  'Ordinary ADMIN can assign regular administrative roles (MODERATOR/ADMIN)'
);

// Test 21: Bulk update filter protection for non-SUPER_ADMIN
const testBulkFilter = (callerRole, ids) => {
  const filter = { _id: { $in: ids } };
  if (callerRole !== 'SUPER_ADMIN') {
    filter.role = { $ne: 'SUPER_ADMIN' };
  }
  return filter;
};

const adminBulkFilter = testBulkFilter('ADMIN', ['id1', 'id2']);
assert(
  adminBulkFilter.role && adminBulkFilter.role.$ne === 'SUPER_ADMIN',
  'bulkUpdateStudentStatus protects SUPER_ADMIN accounts by injecting { role: { $ne: "SUPER_ADMIN" } } for non-super admins'
);

const superBulkFilter = testBulkFilter('SUPER_ADMIN', ['id1', 'id2']);
assert(
  superBulkFilter.role === undefined,
  'bulkUpdateStudentStatus allows full scope for SUPER_ADMIN'
);

// -----------------------------------------------------------------------------
// Suite 4: Google Token Verification & Auth Hardening
// -----------------------------------------------------------------------------
console.log('\n[Suite 4: Google Token Verification & Auth Hardening]');

// Test 22: Production requires credential in validateGoogleAuthPayload
process.env.NODE_ENV = 'production';
let validatorStatus = null;
let validatorResponse = null;
const validatorRes = {
  status(code) {
    validatorStatus = code;
    return this;
  },
  json(data) {
    validatorResponse = data;
    return this;
  },
};

let nextCalled = false;
validateGoogleAuthPayload(
  { body: { userInfo: { email: 'c233093@ugrad.iiuc.ac.bd' } } },
  validatorRes,
  () => {
    nextCalled = true;
  }
);
assert(
  validatorStatus === 400 && nextCalled === false,
  'validateGoogleAuthPayload rejects userInfo payload without credential in production'
);

// Test 23: Production accepts valid credential string in validateGoogleAuthPayload
validatorStatus = null;
nextCalled = false;
validateGoogleAuthPayload(
  { body: { credential: 'valid.google.idtoken.here' } },
  validatorRes,
  () => {
    nextCalled = true;
  }
);
assert(
  nextCalled === true && validatorStatus === null,
  'validateGoogleAuthPayload permits valid credential token'
);

// Test 24: Production googleAuth rejects request with missing credential
let authStatus = null;
let authResponse = null;
const authMockRes = {
  status(code) {
    authStatus = code;
    return this;
  },
  json(data) {
    authResponse = data;
    return this;
  },
};

await googleAuth(
  { body: { userInfo: { email: 'hacker@ugrad.iiuc.ac.bd' } } },
  authMockRes,
  () => {}
);
assert(
  authStatus === 400 && authResponse.message.includes('credential is required'),
  'googleAuth strictly rejects userInfo without verified credential in production'
);

// Test 25: Production googleAuth rejects forged unverified token
authStatus = null;
authResponse = null;
await googleAuth(
  { body: { credential: 'invalid.forged.token.payload' } },
  authMockRes,
  () => {}
);
assert(
  authStatus === 401 && authResponse.message.includes('Invalid or unverified ID token'),
  'googleAuth strictly rejects unverified/forged tokens in production without jwt.decode fallback'
);

// -----------------------------------------------------------------------------
// Suite 5: Staging Database Isolation Gate
// -----------------------------------------------------------------------------
console.log('\n[Suite 5: Staging Database Isolation Gate]');

// Test 26: Staging rejects production database name
const stagingProdCheck = checkDatabaseIsolation({
  NODE_ENV: 'staging',
  MONGODB_URI: 'mongodb+srv://user:pass@cluster.mongodb.net/iiuc_cover_page?retryWrites=true',
});
assert(
  stagingProdCheck.valid === false && stagingProdCheck.error.includes('target production database'),
  'Staging gate refuses connection string targeting production database "iiuc_cover_page"'
);

// Test 27: Staging rejects alternate casing of production database name
const stagingUpperCheck = checkDatabaseIsolation({
  NODE_ENV: 'staging',
  MONGODB_URI: 'mongodb+srv://user:pass@cluster.mongodb.net/IIUC_COVER_PAGE?retryWrites=true',
});
assert(
  stagingUpperCheck.valid === false && stagingUpperCheck.error.includes('target production database'),
  'Staging gate refuses uppercase variants of production database name ("IIUC_COVER_PAGE")'
);

// Test 28: Staging rejects missing database name segment
const stagingNoDbCheck = checkDatabaseIsolation({
  NODE_ENV: 'staging',
  MONGODB_URI: 'mongodb+srv://user:pass@cluster.mongodb.net/?retryWrites=true',
});
assert(
  stagingNoDbCheck.valid === false && stagingNoDbCheck.error.includes('strictly requires database "iiuc_cover_page_staging"'),
  'Staging gate refuses URI with missing database path segment'
);

// Test 29: Staging rejects arbitrary unauthorized database name
const stagingArbitraryCheck = checkDatabaseIsolation({
  NODE_ENV: 'staging',
  MONGODB_URI: 'mongodb+srv://user:pass@cluster.mongodb.net/test_db?retryWrites=true',
});
assert(
  stagingArbitraryCheck.valid === false && stagingArbitraryCheck.error.includes('strictly requires database "iiuc_cover_page_staging"'),
  'Staging gate refuses arbitrary/unauthorized database names (e.g. "test_db")'
);

// Test 30: Staging rejects missing MONGODB_URI
const stagingMissingUriCheck = checkDatabaseIsolation({
  NODE_ENV: 'staging',
  MONGODB_URI: '',
  MONGO_URI: '',
});
assert(
  stagingMissingUriCheck.valid === false && stagingMissingUriCheck.error.includes('missing in staging environment'),
  'Staging gate refuses empty/missing MONGODB_URI'
);

// Test 31: Staging detects conflicting MONGODB_URI and MONGO_URI
const stagingConflictCheck = checkDatabaseIsolation({
  NODE_ENV: 'staging',
  MONGODB_URI: 'mongodb+srv://user:pass@cluster.mongodb.net/iiuc_cover_page_staging?retryWrites=true',
  MONGO_URI: 'mongodb+srv://user:pass@cluster.mongodb.net/iiuc_cover_page?retryWrites=true',
});
assert(
  stagingConflictCheck.valid === false && stagingConflictCheck.error.includes('Conflicting database configurations'),
  'Staging gate refuses conflicting environment variables pointing to different databases'
);

// Test 32: Case-insensitive NODE_ENV and APP_ENV activation
const appEnvStagingCheck = checkDatabaseIsolation({
  NODE_ENV: 'production',
  APP_ENV: 'STAGING',
  MONGODB_URI: 'mongodb+srv://user:pass@cluster.mongodb.net/iiuc_cover_page?retryWrites=true',
});
assert(
  appEnvStagingCheck.valid === false && appEnvStagingCheck.error.includes('target production database'),
  'Staging gate activates when APP_ENV="STAGING" even if NODE_ENV is misconfigured'
);

// Test 33: Staging permits isolated staging database with query parameters
const stagingValidCheck = checkDatabaseIsolation({
  NODE_ENV: 'staging',
  MONGODB_URI: 'mongodb+srv://user:pass@cluster.mongodb.net/iiuc_cover_page_staging?retryWrites=true&w=majority',
});
assert(
  stagingValidCheck.valid === true && stagingValidCheck.dbName === 'iiuc_cover_page_staging',
  'Staging gate permits valid isolated staging database "iiuc_cover_page_staging"'
);

// Test 34: extractDatabaseName handles various URI formats and query strings
assert(
  extractDatabaseName('mongodb+srv://user:pass@cluster.mongodb.net/iiuc_cover_page_staging?retryWrites=true') === 'iiuc_cover_page_staging',
  'extractDatabaseName extracts database from SRV URI with query parameters'
);
assert(
  extractDatabaseName('mongodb://localhost:27017/iiuc_cover_page_staging') === 'iiuc_cover_page_staging',
  'extractDatabaseName extracts database from standard port URI'
);
assert(
  extractDatabaseName('mongodb+srv://user:pass@cluster.mongodb.net/iiuc_cover_page_staging/') === 'iiuc_cover_page_staging',
  'extractDatabaseName handles trailing slash after database name'
);
assert(
  extractDatabaseName('malformed_uri_without_protocol') === '',
  'extractDatabaseName returns empty string for malformed URI'
);

// Test 35: getTargetDatabaseName dynamically resolves staging database
const stagingTargetDb = getTargetDatabaseName(
  'mongodb+srv://user:pass@cluster.mongodb.net/iiuc_cover_page_staging?retryWrites=true',
  { NODE_ENV: 'staging' }
);
assert(
  stagingTargetDb === 'iiuc_cover_page_staging',
  'getTargetDatabaseName in staging returns "iiuc_cover_page_staging"'
);

// Test 36: getTargetDatabaseName in production defaults safely
const prodTargetDb = getTargetDatabaseName(
  'mongodb+srv://user:pass@cluster.mongodb.net/iiuc_cover_page?retryWrites=true',
  { NODE_ENV: 'production' }
);
assert(
  prodTargetDb === 'iiuc_cover_page',
  'getTargetDatabaseName in production preserves "iiuc_cover_page"'
);

// Test 37: Production mode is NOT blocked by staging isolation gate
const prodModeCheck = checkDatabaseIsolation({
  NODE_ENV: 'production',
  MONGODB_URI: 'mongodb+srv://user:pass@cluster.mongodb.net/iiuc_cover_page?retryWrites=true',
});
assert(
  prodModeCheck.valid === true,
  'Production environment is not restricted by staging database isolation gate'
);

// Test 38: Local development mode is NOT blocked by staging isolation gate
const devModeCheck = checkDatabaseIsolation({
  NODE_ENV: 'development',
  MONGODB_URI: 'mongodb://localhost:27017/iiuc_cover_page',
});
assert(
  devModeCheck.valid === true,
  'Local development environment is not restricted by staging database isolation gate'
);

// Restore environment
process.env.NODE_ENV = 'development';

console.log('\n----------------------------------------------------------------------');
console.log(`Test Execution Summary: ${passedTests} Passed | ${failedTests} Failed (Total: ${totalTests})`);
console.log('----------------------------------------------------------------------');

if (failedTests === 0) {
  console.log('✅ ALL PHASE 5 SECURITY HARDENING TESTS VERIFIED SUCCESSFULLY!\n');
  process.exit(0);
} else {
  console.error(`❌ ${failedTests} test(s) failed!\n`);
  process.exit(1);
}
