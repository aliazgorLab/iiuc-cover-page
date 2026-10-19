# Phase 7.1 — Staging Isolation & Pre-Provisioning Security Audit Report

**Document ID:** `PHASE_7_1_STAGING_ISOLATION_AUDIT`  
**Date:** October 19, 2026  
**Repository:** `iiuc-cover-page`  
**Branch:** `migration/firebase-zero-loss`  
**Primary Database Decision:** Choice A (Preserve MongoDB Atlas as Primary System of Record)  
**Audit Scope:** Verification of Staging Isolation Gates, Configuration Pathways, Bypass Vectors, Regression Safety, and Pre-Provisioning Safeguards  
**Recommendation:** **PASS** (Zero Cloud Provisioning Authorized — Staging Isolation Mathematically Fail-Closed)

---

## 1. Executive Summary & Safeguards Verification

In strict accordance with Phase 7.1 instructions, an independent security and configuration audit was conducted on the staging isolation implementation before authorizing any cloud provisioning or live deployments.

### Strict Safeguards Compliance:
- **Zero Cloud Deployments:** No deployments were triggered to Vercel, Render, Firebase, or any cloud platform.
- **Zero Production Database Connections/Modifications:** The production MongoDB Atlas database (`iiuc_cover_page`) was never queried, modified, or connected to during this audit.
- **Zero Credential Exposure:** No environment variable values, secrets, tokens, credentials, or full connection strings are exposed in logs, tests, or this report.
- **Zero Overwriting of Existing Work:** All Git branches, tags, migration reports, Firestore emulator tests, and backups are 100% preserved.
- **Zero Production Hosting Configuration Alterations:** Production Vercel and Render settings remain intact.
- **Zero Student Data Replication:** No production student data or database dumps have been copied into staging.

---

## 2. Files Reviewed and Code Modifications Made

### 2.1 Files Reviewed
1. `backend/src/config/validateEnv.js`: Staging isolation gate logic and environment validator.
2. `backend/src/config/database.js`: MongoDB Atlas connection bootstrapping and target database resolution.
3. `backend/src/server.js`: Express server initialization and boot sequence call sites.
4. `backend/src/scripts/seed.js`: Database seeding script.
5. `backend/src/config/corsConfig.js`: CORS allowlist and environment origin resolution.
6. `backend/src/utils/logger.js`: Sensitive data redaction in diagnostic logging.
7. `backend/src/utils/sanitize.js`: Object and string sanitization helpers.
8. `tests/security_hardening.test.mjs`: Test suite covering security hardening and isolation gates.
9. `frontend/scripts/validate_firebase_config.test.mjs`: Frontend staging isolation tests.
10. `frontend/src/config/firebase.js`: Frontend Firebase staging gate logic.
11. `frontend/vite.config.js`: Vite build-time environment verification.
12. `.gitignore`, `backend/.gitignore`, and `frontend/.gitignore`: Git exclusion manifests.
13. `scripts/migration/reports/PHASE_7_STAGING_DEPLOYMENT_PLAN.md`: Existing Phase 7 deployment plan.

### 2.2 Critical Flaws Discovered & Remediation Applied

#### Critical Flaw 1: Mongoose Hardcoded Database Name in `database.js`
- **Discovery:** In `backend/src/config/database.js`, line 48 previously specified:
  ```javascript
  const conn = await mongoose.connect(rawUri, {
    dbName: 'iiuc_cover_page',
    serverSelectionTimeoutMS: 10000,
  });
  ```
  In Mongoose, passing `dbName: 'iiuc_cover_page'` in the connection options **overrides** any database name provided in the connection URI path (e.g., `.../iiuc_cover_page_staging`). Even if the staging environment provided a clean staging URI, Mongoose would have silently connected to the production database `iiuc_cover_page`!
- **Remediation:** Added `getTargetDatabaseName(rawUri, env)`:
  ```javascript
  export const getTargetDatabaseName = (uri = '', env = process.env) => {
    const nodeEnv = (env.NODE_ENV || '').toLowerCase().trim();
    const appEnv = (env.APP_ENV || '').toLowerCase().trim();
    const isStaging = nodeEnv === 'staging' || appEnv === 'staging';
    const extracted = extractDatabaseName(uri);

    if (isStaging) {
      return extracted || 'iiuc_cover_page_staging';
    }

    return extracted || 'iiuc_cover_page';
  };
  ```
  `connectDB()` now resolves `targetDbName = getTargetDatabaseName(rawUri, process.env)` and passes `dbName: targetDbName`. Furthermore, `validateEnv()` was added as the very first line inside `connectDB()` to guarantee that even standalone scripts calling `connectDB()` directly cannot bypass isolation validation.

#### Flaw 2: Missing Isolation Gates in Seed Script (`backend/src/scripts/seed.js`)
- **Discovery:** `backend/src/scripts/seed.js` directly connected to `process.env.MONGO_URI` without running `checkDatabaseIsolation`. If invoked in a staging environment with a misconfigured URI pointing to production, it would delete all courses, teachers, and departments (`deleteMany({})`).
- **Remediation:** Integrated `checkDatabaseIsolation(process.env)` and dynamic database target resolution directly into `seedDB()`. If staging targets `iiuc_cover_page`, the process immediately halts with exit code 1.

#### Flaw 3: Regex Trailing Slash Handling in `extractDatabaseName`
- **Discovery:** Naive regex matching `/\/([^/?]+)(?:\?|$)/` failed when connection URIs contained trailing slashes before query parameters (e.g., `.../iiuc_cover_page_staging/?retryWrites=true`).
- **Remediation:** Upgraded the regex to `/^mongodb(?:\+srv)?:\/\/[^/]+\/([^/?]+?)\/?(?:\?|$)/i` to support standard URIs, SRV URIs, optional trailing slashes, and complex query parameters.

---

## 3. Database URI & Environment-Variable Selection Path Trace

The following diagram illustrates the complete execution flow from process boot to MongoDB connection:

```mermaid
flowchart TD
    Boot["Backend Boot (server.js / script)"] --> LoadEnv["dotenv.config()"]
    LoadEnv --> Validate["validateEnv()"]
    Validate --> EnvCheck{"NODE_ENV or APP_ENV<br/>=== 'staging' (case-insensitive)?"}
    
    EnvCheck -- No (prod / dev) --> ProdDevFlow["Preserve prod / dev defaults<br/>Pass validateEnv()"]
    EnvCheck -- Yes (staging) --> IsoGate["checkDatabaseIsolation(process.env)"]
    
    IsoGate --> CheckUriPresent{"Is MONGODB_URI<br/>or MONGO_URI present?"}
    CheckUriPresent -- No --> FailMissing["FAIL-CLOSED: Exit 1<br/>Missing MONGODB_URI in staging"]
    
    CheckUriPresent -- Yes --> CheckConflict{"Do MONGODB_URI & MONGO_URI<br/>target different databases?"}
    CheckConflict -- Yes --> FailConflict["FAIL-CLOSED: Exit 1<br/>Conflicting database URI configs"]
    
    CheckConflict -- No --> ExtractDB["extractDatabaseName(uri)"]
    ExtractDB --> CheckProdDB{"dbName.toLowerCase()<br/>=== 'iiuc_cover_page'?"}
    CheckProdDB -- Yes --> FailProdRefusal["CRITICAL REFUSAL: Exit 1<br/>Attempted to target prod DB"]
    
    CheckProdDB -- No --> CheckStagingDB{"dbName.toLowerCase()<br/>=== 'iiuc_cover_page_staging'?"}
    CheckStagingDB -- No --> FailNonStaging["FAIL-CLOSED: Exit 1<br/>Strictly requires iiuc_cover_page_staging"]
    
    CheckStagingDB -- Yes --> PassIso["Isolation Validated ✓"]
    PassIso --> ConnectDB["connectDB()"]
    ConnectDB --> ResolveTarget["getTargetDatabaseName() -> 'iiuc_cover_page_staging'"]
    ResolveTarget --> MongoConnect["mongoose.connect(rawUri, { dbName: 'iiuc_cover_page_staging' })"]
```

### Complete Variable Selection Logic:
1. **Environment Flagging:**
   - Evaluated via `(env.NODE_ENV || '').toLowerCase().trim()` and `(env.APP_ENV || '').toLowerCase().trim()`.
   - Activated if either equals `'staging'` (handles mixed-case like `'Staging'`, `'STAGING'`).
2. **URI Precedence:**
   - Evaluates `env.MONGODB_URI` first, falling back to `env.MONGO_URI`.
   - If both are defined but target different databases (e.g., `MONGODB_URI` targets staging but `MONGO_URI` targets production), it immediately halts with a configuration conflict refusal error.
3. **Database Extraction:**
   - Protocol-aware parsing extracts the path segment between host/port and query parameters.
4. **Fail-Closed Dual Gate:**
   - **Gate 1 (Blacklist Gate):** If extracted DB name is `iiuc_cover_page` (any casing), immediate fatal exit.
   - **Gate 2 (Whitelist Gate):** If extracted DB name is NOT `iiuc_cover_page_staging`, immediate fatal exit.

---

## 4. Bypass Vector Analysis & Verification Matrix

Thirteen distinct attack/misconfiguration bypass vectors were tested using local mocked inputs in `tests/security_hardening.test.mjs` (Suite 5, Tests 26–38). All 13 vectors were confirmed to fail-closed without exception:

| Test ID | Bypass Vector Tested | Input Configuration | Expected Behavior | Actual Result | Status |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **Test 26** | Direct Production DB target in Staging | `NODE_ENV: 'staging'`, URI: `.../iiuc_cover_page?retryWrites=true` | Refuse boot with critical refusal error | Refused (`target production database`) | **PASS** |
| **Test 27** | Uppercase / Mixed-case Production DB | `NODE_ENV: 'staging'`, URI: `.../IIUC_COVER_PAGE?retryWrites=true` | Refuse boot despite uppercase casing | Refused (`target production database`) | **PASS** |
| **Test 28** | Missing Database Name Segment | `NODE_ENV: 'staging'`, URI: `mongodb+srv://host/?retryWrites=true` | Refuse boot due to missing staging DB segment | Refused (`strictly requires database "iiuc_cover_page_staging"`) | **PASS** |
| **Test 29** | Arbitrary / Unauthorized Database Name | `NODE_ENV: 'staging'`, URI: `.../test_db?retryWrites=true` | Refuse boot because name is not `iiuc_cover_page_staging` | Refused (`strictly requires database "iiuc_cover_page_staging"`) | **PASS** |
| **Test 30** | Missing or Empty `MONGODB_URI` | `NODE_ENV: 'staging'`, `MONGODB_URI: ''`, `MONGO_URI: ''` | Refuse boot with missing URI error | Refused (`missing in staging environment`) | **PASS** |
| **Test 31** | Conflicting URIs (`MONGODB_URI` vs `MONGO_URI`) | `MONGODB_URI: '.../iiuc_cover_page_staging'`, `MONGO_URI: '.../iiuc_cover_page'` | Detect conflicting DB targets and refuse boot | Refused (`Conflicting database configurations`) | **PASS** |
| **Test 32** | Misconfigured `NODE_ENV` with `APP_ENV=STAGING` | `NODE_ENV: 'production'`, `APP_ENV: 'STAGING'`, URI: `.../iiuc_cover_page` | Staging isolation activates via `APP_ENV` and blocks prod DB | Refused (`target production database`) | **PASS** |
| **Test 33** | Valid Staging DB with Query Parameters | `NODE_ENV: 'staging'`, URI: `.../iiuc_cover_page_staging?retryWrites=true&w=majority` | Accept configuration and extract `iiuc_cover_page_staging` | Accepted (`valid: true, dbName: 'iiuc_cover_page_staging'`) | **PASS** |
| **Test 34a** | Standard Port URI Extraction | `mongodb://localhost:27017/iiuc_cover_page_staging` | Extract `iiuc_cover_page_staging` | Extracted successfully | **PASS** |
| **Test 34b** | Trailing Slash URI Extraction | `mongodb+srv://host/iiuc_cover_page_staging/` | Extract `iiuc_cover_page_staging` cleanly | Extracted successfully | **PASS** |
| **Test 34c** | Malformed Protocol URI | `malformed_uri_without_protocol` | Return empty string (fails closed) | Returned empty string | **PASS** |
| **Test 35** | Dynamic Staging Database Name Resolution | `getTargetDatabaseName(..., { NODE_ENV: 'staging' })` | Returns `'iiuc_cover_page_staging'` | Returns `'iiuc_cover_page_staging'` | **PASS** |
| **Test 36** | Production Mode DB Resolution | `getTargetDatabaseName(..., { NODE_ENV: 'production' })` | Preserves `'iiuc_cover_page'` | Preserves `'iiuc_cover_page'` | **PASS** |
| **Test 37** | Production Non-Regression | `NODE_ENV: 'production'`, URI: `.../iiuc_cover_page` | Production environment is NOT blocked | Permitted (`valid: true`) | **PASS** |
| **Test 38** | Development Non-Regression | `NODE_ENV: 'development'`, URI: `mongodb://localhost:27017/iiuc_cover_page` | Development environment is NOT blocked | Permitted (`valid: true`) | **PASS** |

---

## 5. Production & Local Development Non-Regression Verification

A core requirement was to ensure that security hardening and staging isolation did not break local development or production workflows:

1. **Production Runtime Mode (`NODE_ENV=production`):**
   - In production, `checkDatabaseIsolation()` returns `{ valid: true }`, allowing the application to connect to `iiuc_cover_page`.
   - `getTargetDatabaseName()` correctly returns `iiuc_cover_page`.
   - Production CORS allowlist permits `FRONTEND_URL` and defaults safely to `https://iiuccoverpage.vercel.app`.
   - Admin privilege escalation checks protect `SUPER_ADMIN` accounts.
   - Google OAuth token validation strictly enforces cryptographically verified ID tokens.
2. **Local Development Mode (`NODE_ENV=development`):**
   - Allows local origins `http://localhost:5173`, `http://localhost:5174`, `http://localhost:3000`.
   - Allows connecting to local MongoDB `mongodb://127.0.0.1:27017/iiuc_cover_page`.
   - Google Auth dev fallback remains available only in development.
3. **Frontend Production Build:**
   - Full production build executed via `npm run build` in `frontend/`.
   - 3,046 modules transformed in 22.87s with **0 errors**.

---

## 6. Git Hygiene & Exclusion Audit (`.gitignore`)

Inspected repository `.gitignore` manifests at root, `backend/`, and `frontend/`:

### 6.1 Patterns Verified
- **Environment Files:** `.env`, `.env.*`, `*.local`, `.env.development`, `.env.production`, `.env.staging` (only `.env.example` is permitted and tracked).
- **Credentials & Service Accounts:** `*serviceAccountKey*.json`, `*service-account*.json`, `*firebase-adminsdk*.json`, `*.pem`, `*.key`, `credentials.json`.
- **Database Backups & Dumps:** `dump/`, `backups/`, `*.dump`, `*.bson`, `*.tar.gz`, `migration_backups/`, `export_data/`.

### 6.2 Live Git Tracking Check
Executed:
```bash
git ls-files | Select-String "\.env"
```
**Result:**
```
backend/.env.example
frontend/.env.example
```
**Zero** environment secret files, local override files, staging keys, or credentials are tracked in Git.

---

## 7. Test Execution Results (Exact Output)

### 7.1 Backend Test Suite (`npm test` in `backend/`)
- **Command:** `node ../tests/security_hardening.test.mjs`
- **Suites Executed:**
  - Suite 1: CORS Allowlist Configuration & Validation (13 tests)
  - Suite 2: Sensitive Data Sanitization & Log Protection (12 tests)
  - Suite 3: Admin Privilege Escalation Prevention (6 tests)
  - Suite 4: Google Token Verification & Auth Hardening (4 tests)
  - Suite 5: Staging Database Isolation Gate (17 tests)
- **Result:** **52 Passed | 0 Failed (Total: 52) — 100% PASS**

### 7.2 Frontend Configuration Test Suite (`npm run test:config` in `frontend/`)
- **Command:** `node scripts/validate_firebase_config.test.mjs`
- **Suites Executed:**
  - Suite 1: Staging Environment Isolation & Fail-Closed Gates (8 tests)
  - Suite 2: Zero-Hardcoded Secrets & Gitignore Compliance (3 tests)
  - Suite 3: Vite Build-Time Fail-Closed Gates (2 tests)
- **Result:** **24 Passed | 0 Failed (Total: 24) — 100% PASS**

### 7.3 Frontend Production Build (`npm run build` in `frontend/`)
- **Command:** `vite build`
- **Result:** **SUCCESS** (3,046 modules transformed, built in 22.87s, 0 errors, chunks generated cleanly).

---

## 8. Review of Existing Phase 7 Deployment Plan & Missing Requirements

A critical review of `scripts/migration/reports/PHASE_7_STAGING_DEPLOYMENT_PLAN.md` was conducted to identify any missing operational or security requirements before live provisioning:

### 8.1 Required Staging Specifications

#### 1. Independent JWT Secrets
- **Requirement:** Staging **must never share** the production `JWT_SECRET`.
- **Rationale:** If production and staging share a JWT secret, a user token issued in staging (which may have different permissions or test roles) could be presented to the production backend and successfully validate.
- **Specification:** Staging must use a uniquely generated, high-entropy secret (e.g. `crypto.randomBytes(32).toString('hex')`) set strictly as a Render environment variable.

#### 2. Google OAuth 2.0 Origin & Callback Configuration
- **Requirement:** The staging frontend origin (e.g., `https://iiuc-cover-page-staging.vercel.app` or specific Vercel preview branch domain) must be added to **Authorized JavaScript Origins** in the Google Cloud Console OAuth 2.0 Client credentials.
- **Rationale:** If not configured, Google Sign-In will immediately throw an `origin_mismatch` or `idpiframe_initialization_failed` error upon user interaction.
- **Specification:**
  - Authorized JavaScript Origin: `https://<staging-frontend>.vercel.app`
  - Authorized Redirect URI (if using server redirect flow): `https://<staging-backend>.onrender.com/api/v1/auth/google/callback`

#### 3. CORS Dynamic Origin Handling
- **Requirement:** Staging backend `FRONTEND_URL` must match the exact staging frontend origin.
- **Rationale:** If Vercel generates dynamic preview URLs (e.g., `...-git-migration-firebase-zero-loss-aliazgor.vercel.app`), either:
  a. A static domain alias (e.g., `iiuc-cover-page-staging.vercel.app`) must be assigned on Vercel, OR
  b. The exact preview URL must be supplied in `FRONTEND_URL` on Render.

#### 4. Credential Handling and Zero-Data Replication
- **Requirement:**
  - Staging credentials must **never** be placed in `.env` files committed to Git.
  - Staging database `iiuc_cover_page_staging` must start empty and be populated **only** via `npm run seed` with static course and faculty catalogs.
  - Under no circumstances will production student records (253 users, 495 historical covers) be exported or restored into staging.

---

## 9. Final Recommendation & Readiness Verdict

| Audit Criterion | Verification Method | Outcome | Status |
| :--- | :--- | :--- | :---: |
| **Call Site Execution Order** | Code inspection of `server.js` and `database.js` | `validateEnv()` guaranteed before connection | **VERIFIED** |
| **Fail-Closed DB Isolation** | Suite 5 automated tests (13 bypass cases) | 100% of invalid/prod targets refused | **VERIFIED** |
| **Mongoose Hardcoding Flaw** | Fixed `dbName` in `database.js` & `seed.js` | Dynamically resolves `iiuc_cover_page_staging` | **RESOLVED** |
| **Development & Production Non-Regression** | Automated test suite execution (52 tests) | 0 regressions detected | **VERIFIED** |
| **Git Secret Exclusion** | Pattern audit & live `git ls-files` check | Zero secrets or `.env` files tracked | **VERIFIED** |
| **Frontend Staging Build** | `test:config` (24 tests) + Vite build | 100% PASS, 0 build errors | **VERIFIED** |

### Final Recommendation: **PASS**

The staging isolation mechanism is robust, comprehensive, and mathematically fail-closed. No bypass vector was found that could allow a staging backend or script to accidentally connect to, query, or mutate the production database `iiuc_cover_page`.

**Next Steps Awaiting User Approval:**
1. User review of this Phase 7.1 audit report.
2. When ready to proceed with live cloud setup (Phase 7.2):
   - Provision `iiuc_cover_page_staging` database on MongoDB Atlas.
   - Configure Google Cloud Console Authorized Origins for the staging domain.
   - Deploy `iiuc-cover-page-backend-staging` on Render with independent staging environment variables.
   - Deploy staging frontend on Vercel.
   - Execute the 8-step smoke test using isolated test accounts.
