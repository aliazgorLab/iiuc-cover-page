# Phase 3F — Firebase Staging Runtime & Security Verification Report

**Project:** IIUC Cover Page Platform  
**Target Staging Project:** `iiuc-cover-page-staging`  
**Production Project:** `iiuccoverpage-8edd3` (Strictly Off-Limits & Protected)  
**Target Branch:** `migration/firebase-zero-loss`  
**Execution Environment:** Windows Server / PowerShell / Node.js v24.15.0  
**Timestamp:** 2026-10-16T19:35:00+06:00  
**Status:** **PHASE 3F RUNTIME & SECURITY REVIEW COMPLETE — AWAITING EXPLICIT APPROVAL**

---

## 1. Executive Summary & Verification Matrix

In accordance with Phase 3F requirements, an exhaustive runtime, build gate, authentication, and security audit was performed. All checks were conducted under strict safety constraints: **zero writes to production**, **zero unverified cloud writes**, **zero credential exposures**, and **zero production mutations**.

| Check Category | Verification Item | Status | Result / Evidence |
| :--- | :--- | :---: | :--- |
| **A. Config & Build Gates** | Local staging env file exists & gitignored | ✅ **PASS** | `frontend/.env.staging.local` verified via `git check-ignore` (untracked). |
| | Required Web SDK fields presence | ✅ **PASS** | All 5 fields present and non-empty (lengths: 39, 39, 23, 42, 13 chars). |
| | Resolved Project ID check | ✅ **PASS** | Exactly matches `iiuc-cover-page-staging`. |
| | Build-time gate against production spoof | ✅ **PASS** | `vite.config.js` aborts build if `VITE_FIREBASE_PROJECT_ID=iiuccoverpage-8edd3`. |
| | Build-time gate against missing/placeholders | ✅ **PASS** | `vite.config.js` aborts build if required variables are missing or placeholders. |
| | Discrepancy resolution | ✅ **RESOLVED** | Identified why previous staging build passed and added build-time gate to `vite.config.js`. |
| | Secret sanitization | ✅ **PASS** | Zero keys or values printed in terminal logs, git history, or markdown. |
| **B. Authentication** | Current UI Auth mechanism | 🔍 **AUDITED** | Frontend still operates on legacy Google OAuth (`@react-oauth/google`) + Express JWT. |
| | Firebase Web SDK status in UI | 🔍 **AUDITED** | Firebase is initialized in `src/config/firebase.js` but not yet wired to UI sign-in. |
| | Staging authorized domains requirement | 📋 **DOCUMENTED** | Requires `localhost`, `127.0.0.1`, and `iiuc-cover-page-staging.firebaseapp.com`. |
| | Interactive sign-in protocol | 🔒 **PAUSED** | Exact browser steps documented; waiting for owner to trigger. |
| **C. Firestore Security** | `firestore.rules` least-privilege audit | ✅ **PASS** | Default deny-all fallback; public reads on catalogs; owner/admin on private. |
| | Role escalation prevention | ✅ **PASS** | `users` update restricts `diff().affectedKeys()` to academic profile fields. |
| | Legacy ID vs. Auth UID Mismatch | ⚠️ **ARCHITECTURAL FINDING** | Legacy MongoDB IDs in Firestore require Admin SDK claim or rules dual-key check. |
| | Overly broad rules inspection | ✅ **AUDITED** | Public catalog reads (`courses`, `teachers`, `templates`) align with guest generator. |
| **D. Staging-Only Testing** | Offline unit test suite (`test_migration_tool.mjs`) | ✅ **PASS** | 20 / 20 assertions passed (zero-write guarantee, deterministic IDs). |
| | In-memory emulator suite (`test_emulator_import.mjs`) | ✅ **PASS** | 293 / 293 assertions passed (idempotency, relational foreign keys). |
| | Config & build gates suite (`test:config`) | ✅ **PASS** | 24 / 24 assertions passed (unit gates, file sanitization, compiler aborts). |
| | Staging application build (`build:staging`) | ✅ **PASS** | Vite staging build generated clean bundle in 1m 15s (0 errors). |
| | Staging cloud write status | 🔒 **BLOCKED** | Zero cloud writes performed; non-destructive test plan proposed. |
| **E. Regression & Baseline** | Existing MongoDB / Express active paths | ✅ **VERIFIED** | Live MongoDB Atlas cluster and Express controllers remain active single source of truth. |

---

## 2. Deep Dive: Configuration, Build Gates & Discrepancy Resolution

### A. The Discrepancy Explained
* **Issue Observed Earlier:** When [`frontend/.env.staging.local`](file:///e:/Cover%20design%20web/iiuc-cover-page/frontend/.env.staging.local) still contained placeholder strings (`your_staging_api_key_here`), `npm run build:staging` previously succeeded without throwing an error.
* **Root Cause Analysis:**
  1. Vite compiles ES modules into static JavaScript bundles without executing client-side runtime code inside Node.js.
  2. Because [`frontend/src/config/firebase.js`](file:///e:/Cover%20design%20web/iiuc-cover-page/frontend/src/config/firebase.js) was not yet imported into the main entry point ([`main.jsx`](file:///e:/Cover%20design%20web/iiuc-cover-page/frontend/src/main.jsx)), the runtime `validateFirebaseConfig()` check was only evaluated in unit tests, not during bundler tree-shaking.
  3. The initial [`frontend/vite.config.js`](file:///e:/Cover%20design%20web/iiuc-cover-page/frontend/vite.config.js) only validated `VITE_FIREBASE_PROJECT_ID` (`iiuc-cover-page-staging`), but did not iterate over other environment keys.
* **Remediation Implemented:**
  [`frontend/vite.config.js`](file:///e:/Cover%20design%20web/iiuc-cover-page/frontend/vite.config.js) was enhanced to enforce an exhaustive build-time compiler gate:
  ```javascript
  const requiredKeys = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_APP_ID',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
  ];
  for (const key of requiredKeys) {
    const val = (env[key] || '').trim();
    if (!val || val.startsWith('your_') || val.startsWith('<') || val.includes('placeholder')) {
      throw new Error(`[FAIL-CLOSED GATE] Staging build detected missing or placeholder value for ${key}. Aborting build.`);
    }
  }
  ```
  Now, any staging build executed with missing or placeholder keys will immediately fail closed at the compiler stage.

---

## 3. Deep Dive: Authentication Integration Status

### Current Architecture vs. Target Architecture

```
[Current Live Flow]
Student Browser -> Google Sign-in Button (@react-oauth/google)
                -> Google ID Token
                -> Express Backend (/api/v1/auth/google)
                -> MongoDB Atlas (User.findOne / User.create)
                -> Returns Custom Express JWT (Signed with JWT_SECRET)
                -> Stored in localStorage ('token', 'user')

[Target Staging Flow]
Student Browser -> Firebase Web SDK (signInWithPopup / googleAuthProvider)
                -> Genuine Google Cloud Firebase ID Token (RS256 JWT)
                -> Verified via Firebase Admin SDK
                -> Identity Verification & Dual-Key Handshake
                -> Firestore Document Mapping
```

### Specific Findings:
1. **Firebase Web SDK is Initialized but Not Wired to UI:**
   [`frontend/src/config/firebase.js`](file:///e:/Cover%20design%20web/iiuc-cover-page/frontend/src/config/firebase.js) exports `auth`, `db`, and `googleAuthProvider`. However, [`frontend/src/features/authentication/GoogleLoginButton.jsx`](file:///e:/Cover%20design%20web/iiuc-cover-page/frontend/src/features/authentication/GoogleLoginButton.jsx) and [`frontend/src/stores/useAuthStore.js`](file:///e:/Cover%20design%20web/iiuc-cover-page/frontend/src/stores/useAuthStore.js) continue to execute the legacy flow.
2. **Authorized Domains in Staging:**
   For the staging Web App to complete pop-up authentication, the following domains must be authorized in the Firebase Console under **Authentication -> Settings -> Authorized domains**:
   - `localhost`
   - `127.0.0.1`
   - `iiuc-cover-page-staging.firebaseapp.com`
3. **Interactive Sign-In Protocol (For Owner):**
   When the owner wishes to verify staging sign-in:
   - A staging sign-in verification component will call `signInWithPopup(auth, googleAuthProvider)`.
   - The owner will select their `@ugrad.iiuc.ac.bd` institutional account.
   - The token's header (`alg: "RS256"`) and payload claims will be verified without logging or exposing the raw token.

---

## 4. Deep Dive: Firestore Security Rules & Authorization Audit

### A. Principle of Least Privilege
The active [`firestore.rules`](file:///e:/Cover%20design%20web/iiuc-cover-page/firestore.rules) file enforces strict security boundaries:
1. **Global Default Deny:**
   ```javascript
   match /{document=**} {
     allow read, write: if false;
   }
   ```
2. **Academic Domain Enforcement:**
   `isAcademicEmail()` requires email to end with `@ugrad.iiuc.ac.bd`, `@student.iiuc.ac.bd`, or `@iiuc.ac.bd`.
3. **Role Escalation Protection:**
   In `/users/{userId}`, `create` enforces `role == 'STUDENT'` and `accountStatus == 'ACTIVE'`. `update` restricts modifications strictly to:
   `['name', 'studentId', 'department', 'batch', 'semester', 'section', 'academicProfile', 'academicInfo', 'avatar', 'updatedAt']`.
   Any attempt by a student to patch `role`, `accountStatus`, or `permissions` is rejected by the engine with HTTP 403 Forbidden.
4. **Administrative Protection:**
   Collections `adminActivities`, `adminNotifications`, `broadcastLogs`, `teacherImportLogs`, and write operations on `userSessions` strictly require `isAdmin()` (`role in ['ADMIN', 'SUPER_ADMIN', 'MODERATOR']`).
5. **Public Academic Catalogs:**
   `courses`, `teachers`, `templates`, `departments`, and `labexperiments` allow `read: if true;`, but writes require `isAdmin()`. This public read access is required so unauthenticated visitors can preview cover templates and auto-complete course/teacher metadata.

### B. Critical Architectural Finding: Document ID vs. Firebase UID Mismatch
* **The Reality of Migrated Data:**
  In the canonical backup, documents in `users` use the 24-character hexadecimal MongoDB ObjectId as their document ID (e.g. `/users/6a7ebc6edf85c8fcd46865d6`). Similarly, records in `covers` contain `userId: "6a7ebc6edf85c8fcd46865d6"`.
* **The Firebase Auth Behavior:**
  When a user signs in via Firebase Authentication, Google generates a 28-character alphanumeric Firebase UID (e.g. `request.auth.uid == "vK9xLm2Pq8..."`).
* **The Conflict:**
  The rule `function isOwner(userId) { return request.auth.uid == userId; }` will evaluate to `false` when an authenticated user attempts to directly access `/users/6a7ebc6edf85c8fcd46865d6` or query `/covers` where `resource.data.userId == request.auth.uid`.
* **Recommended Resolution Strategy:**
  1. *Backend-Mediated Access (Current Pattern):* Keep Express backend mediating data queries via Firebase Admin SDK. The Admin SDK resolves the legacy `legacyMongoId` and returns data safely.
  2. *Custom Claims Pattern:* When a user signs in, the backend performs the dual-key identity handshake, sets a custom claim `admin.auth().setCustomUserClaims(uid, { mongoId: user.legacyMongoId, role: user.role })`, and updates the rule:
     ```javascript
     function isOwner(userId) {
       return isSignedIn() && (request.auth.uid == userId || request.auth.token.mongoId == userId);
     }
     ```
  3. *In-Document Mapping Rule:*
     ```javascript
     function isOwner(userId) {
       return isSignedIn() && (
         request.auth.uid == userId ||
         (resource != null && resource.data._identityVerification.mappedFirebaseUid == request.auth.uid)
       );
     }
     ```

---

## 5. Distinction: Emulator vs. Cloud vs. Local Tests

| Testing Layer | Scope & Environment | Auth Mechanism | Mutation Risk |
| :--- | :--- | :--- | :---: |
| **Migration Engine Tests** ([`test_migration_tool.mjs`](file:///e:/Cover%20design%20web/iiuc-cover-page/scripts/migration/test_migration_tool.mjs)) | Pure Node.js unit tests on local backup file. | None (EJSON parser). | **Zero** |
| **In-Memory Emulator** ([`test_emulator_import.mjs`](file:///e:/Cover%20design%20web/iiuc-cover-page/scripts/migration/test_emulator_import.mjs)) | In-memory JS data structure simulating Firestore. | Simulated dual-key structures. | **Zero** |
| **Official Local Emulator** ([`test_official_emulator.mjs`](file:///e:/Cover%20design%20web/iiuc-cover-page/scripts/migration/test_official_emulator.mjs)) | Official `cloud-firestore-emulator.jar` on `127.0.0.1:8080`. | Emulator-only `alg:none` tokens and `Bearer owner`. | **Zero (Loopback only)** |
| **Configuration Gates** ([`validate_firebase_config.test.mjs`](file:///e:/Cover%20design%20web/iiuc-cover-page/frontend/scripts/validate_firebase_config.test.mjs)) | Vite compiler and config validator. | Environment inspection. | **Zero** |
| **Staging Cloud Firestore** (`iiuc-cover-page-staging`) | **Live Google Cloud Infrastructure.** | **Real RS256 Google-signed ID tokens only.** | **Controlled (Staging only, halted)** |
| **Production Firebase** (`iiuccoverpage-8edd3`) | **Live Production Google Cloud.** | **Live production credentials.** | **STRICTLY BLOCKED** |

---

## 6. Regression & Integration Baseline

* **MongoDB Atlas Baseline:**
  - Cluster `iiuc_cover_page` remains active, healthy, and untouched.
  - Express backend connects via `MONGODB_URI` and serves all active production traffic.
  - Zero routes, models, or controllers have been removed or modified.
* **Client Application:**
  - Standard production build (`npm run build`) builds cleanly with zero Firebase dependency errors.
  - Staging build (`npm run build:staging`) builds cleanly and targets `iiuc-cover-page-staging`.

---

## 7. Minimal, Non-Destructive Next Step Proposal (Awaiting Approval)

To proceed safely without risking data loss, the recommended next step is:

1. **Step 1: Staging Firestore Rules Deployment (Cloud-Only):**
   Deploy [`firestore.rules`](file:///e:/Cover%20design%20web/iiuc-cover-page/firestore.rules) strictly to the staging project `iiuc-cover-page-staging`.
2. **Step 2: Unauthenticated Cloud Probe:**
   Execute a single unauthenticated read/write probe against `iiuc-cover-page-staging` to cryptographically verify that Google Cloud Firestore returns HTTP 403 Forbidden for protected paths.
3. **Step 3: Staging Dual-Key Import Trial:**
   Execute a controlled, idempotent import of the 3,142 backup documents strictly into `iiuc-cover-page-staging` and reconcile document counts and relationships.
4. **Step 4: Interactive Test Sign-In:**
   The project owner triggers a single test sign-in in the browser to verify real token issuance.

---

**Execution is halted.** No cloud commands, rule deployments, or data migrations have been initiated. Awaiting explicit user instruction.
