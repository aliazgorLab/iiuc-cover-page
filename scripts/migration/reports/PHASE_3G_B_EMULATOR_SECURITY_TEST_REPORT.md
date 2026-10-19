# Phase 3G-B — Official Firestore Emulator Security Testing Report

**Project:** IIUC Cover Page Platform  
**Target Branch:** `migration/firebase-zero-loss`  
**Staging Project ID:** `iiuc-cover-page-staging`  
**Production Project ID:** `iiuccoverpage-8edd3` (Strictly Off-Limits & Protected)  
**Execution Environment:** Windows Server / PowerShell / Node.js v24.15.0 / Java Zulu 21.36.17 LTS  
**Test Suite Path:** `tests/firestore/firestore.rules.test.mjs`  
**Rules Audited:** `firestore.rules`  
**Status:** **PHASE 3G-B COMPLETE — 18/18 TESTS PASSED (100%) — ZERO CLOUD WRITES**

---

## 1. Executive Summary & Strict Safety Adherence

In Phase 3G-B, the security test runner was transitioned from synthetic REST/bearer simulations to the official `@firebase/rules-unit-testing` framework paired with the official Firebase Client SDK.

### Safety Invariants Maintained:
- **Zero Production Mutation:** The production Firebase project (`iiuccoverpage-8edd3`), production MongoDB Atlas cluster, live Render backend, and Vercel hosting remained completely untouched and isolated.
- **Zero Real Document Import:** The 3,142 canonical backup documents were **not** imported or touched. All tests operated exclusively on synthetic fixtures seeded via `withSecurityRulesDisabled()` and cleared between test runs.
- **Zero Cloud Deployments:** No rules or cloud resources were deployed.
- **Strictly Local Emulator:** All operations ran against the local emulator on loopback address `127.0.0.1:8080`.
- **Zero REST Token Shortcuts:** No `Bearer owner` bypasses or unverified `alg:none` bearer strings were used to prove security rules enforcement.
- **Working Tree Integrity:** Preserved all existing uncommitted and untracked user files without resets, stashes, or overwrites.

---

## 2. Dependency Audit & Package Changes

In accordance with authorization, the minimum necessary dependency was installed:

| Package | Version | Type | Location | Purpose |
| :--- | :---: | :---: | :--- | :--- |
| **`@firebase/rules-unit-testing`** | `^6.0.0` | `devDependency` | `backend/package.json` | Provides `initializeTestEnvironment()`, `authenticatedContext()`, `unauthenticatedContext()`, `assertSucceeds()`, and `assertFails()`. |
| **`firebase`** | `^13.0.0` | Peer dependency | `backend/node_modules/firebase` | Auto-resolved peer dependency matching `frontend/package.json`. |

- **Production Dependencies Changed:** **ZERO.**
- **Lockfile & Config Modifications:** Only `backend/package.json` and `backend/package-lock.json` were updated under `devDependencies`.
- **Module Resolution:** Directory junctions were created within `.gitignore`-covered `node_modules` (`node_modules/@firebase` and `node_modules/firebase`) to allow seamless standard ESM imports (`import ... from '@firebase/rules-unit-testing'`) without polluting Git.

---

## 3. Test Suite Implementation & Verification Architecture

The test suite in `tests/firestore/firestore.rules.test.mjs` was implemented using official client SDK patterns:

1. **Environment Initialization:**
   ```javascript
   testEnv = await initializeTestEnvironment({
     projectId: 'iiuc-cover-page-staging',
     firestore: {
       host: '127.0.0.1',
       port: 8080,
       rules: fs.readFileSync('firestore.rules', 'utf8'),
     },
   });
   ```
2. **Deterministic Setup & Fixture Isolation:**
   - Before every test: `await testEnv.clearFirestore();`
   - Synthetic fixtures seeded via `testEnv.withSecurityRulesDisabled()` exclusively for setup.
3. **Official Authentication Contexts:**
   - Unauthenticated: `testEnv.unauthenticatedContext().firestore()`
   - Authenticated Student: `testEnv.authenticatedContext(uid, { email, email_verified: true, role: 'STUDENT', mongoId })`
   - Authenticated Administrator: `testEnv.authenticatedContext(uid, { email, email_verified: true, role: 'SUPER_ADMIN' })`
4. **Reliable Cleanup:**
   - In `after()`: `await testEnv.cleanup()` runs unconditionally.
   - Emulator process and listening sockets on `127.0.0.1:8080` were cleanly terminated following test execution.

---

## 4. Test Results & Detailed Scenario Matrix

The test suite was executed twice to prove determinism and repeatability. Both runs completed with **100% pass mark (18 passed, 0 failed, 0 skipped)**.

### Detailed Test Execution Log

| # | Test Scenario | Authentication Context | Operation & Target | Expected Result | Actual Result | Status |
| :-: | :--- | :--- | :--- | :-: | :-: | :-: |
| **1** | **Unauthenticated Access Denial** | `unauthenticatedContext()` | `getDoc(users/student_01)`, `covers`, `drafts`, `labIndexRecords`, `userSessions` | `assertFails()` | `PERMISSION_DENIED` | **PASS** |
| **2** | **Student Permitted Profile Read** | Student A (`studentA_uid`) | `getDoc(users/studentA_uid)` | `assertSucceeds()` | `200 OK` | **PASS** |
| **3** | **Cross-Student Read Denial** | Student A (`studentA_uid`) | `getDoc(users/studentB_uid)` | `assertFails()` | `PERMISSION_DENIED` | **PASS** |
| **4** | **Role Escalation Defense (Create)** | New Student UID | `setDoc(users/newUid)` with `role: 'ADMIN'` / `role: 'SUPER_ADMIN'` / `permissions: [...]` | `assertFails()` (All 3 attempts) | `PERMISSION_DENIED` | **PASS** |
| **5** | **Protected Role Mutation Defense (Update)** | Student A (`studentA_uid`) | `updateDoc(users/studentA_uid)` with `role: 'SUPER_ADMIN'`, `accountStatus: 'SUSPENDED'`, or `permissions: [...]` | `assertFails()` (All 3 attempts) | `PERMISSION_DENIED` | **PASS** |
| **6** | **Cover & Draft Ownership & Transfer Denial** | Student A & Student B | Read own: OK; Read peer: Fail; Create spoofed: Fail; Update own: OK; Transfer ownership: Fail; Delete peer: Fail; Delete own: OK | Read/Write own: Success; Cross-access & transfer: Fail | As Expected | **PASS** |
| **7** | **Public Catalog Reads Permitted** | `unauthenticatedContext()` | `getDoc(courses/cse_101)`, `teachers`, `templates`, `departments`, `labexperiments`, `getDocs(collection('courses'))` | `assertSucceeds()` | `200 OK` | **PASS** |
| **8** | **Student Writes to Public Catalogs Denied** | Student A (`studentA_uid`) | `setDoc(courses/cse_999)`, `updateDoc(teachers/tea_01)`, `deleteDoc(templates/tpl_01)`, `departments`, `labexperiments` | `assertFails()` (All attempts) | `PERMISSION_DENIED` | **PASS** |
| **9** | **Administrator Governance Access** | Admin (`SUPER_ADMIN` / `MODERATOR`) | `updateDoc(courses/cse_101)`, `getDoc(adminActivities/act_01)`, `adminNotifications`, `broadcastLogs`, `teacherImportLogs`, `users/studentA_uid` | `assertSucceeds()` for admin; `assertFails()` for student | As Expected | **PASS** |
| **10** | **Identity-Mapping Fail-Closed** | Student A without claim vs Student with verified claim | Legacy doc `users/6a7ebc6edf85c8fcd46865d6`: without claim -> Fail; wrong claim -> Fail; verified matching claim -> Succeeds | Fail-closed without verified claim; Succeeds with verified claim | As Expected | **PASS** |
| **11** | **Default Fallback Deny** | Student A (`studentA_uid`) | `getDoc(unlistedCollection/doc123)`, `setDoc(...)`, `getDoc(users/.../secretTokens/tok1)`, `courses/.../examQuestions/q1` | `assertFails()` (All attempts) | `PERMISSION_DENIED` | **PASS** |
| **12** | **Batch Write Authorization Defense** | Student A (`studentA_uid`) | `writeBatch()` containing 1 valid cover write + 1 unauthorized catalog write | `assertFails()`; verified with `rulesDisabled` that valid cover was rolled back | Rollback confirmed; 0 docs mutated | **PASS** |
| **13** | **Institutional Email Domain & Verification** | Student with `email_verified: false` & User with `@gmail.com` | `setDoc(users/uid)` with unverified IIUC email or `@gmail.com` | `assertFails()` for both; verified institutional email succeeds | As Expected | **PASS** |
| **14** | **Allowed-Fields Whitelist Defense** | Student A (`studentA_uid`) | `updateDoc(users/studentA_uid)` with unwhitelisted fields `cgpa: 4.0` or `creditsCompleted: 140` | `assertFails()`; whitelisted `academicProfile` succeeds | As Expected | **PASS** |
| **15** | **Collection Query Data Isolation** | Student A (`studentA_uid`) | `getDocs(collection('covers'))` without filter -> Denied; `query(collection('covers'), where('userId', '==', studentA_uid))` -> Succeeds | Firestore rule query filter invariant validated | As Expected | **PASS** |
| **16** | **User Sessions Protection** | Student A & Student B | Direct client write to `userSessions` -> Denied; Read own session -> Succeeds; Read peer session -> Denied | As Expected | **PASS** |
| **17** | **User Profile Deletion Admin-Only** | Student A vs Admin | Student deleting own profile -> Denied; Admin deleting student profile -> Succeeds | As Expected | **PASS** |
| **18** | **Malformed/Untrusted Role Claims Fail Closed** | User with claim `role: 'SUPER_USER'` | Access `adminActivities` or write catalog | `assertFails()` | `PERMISSION_DENIED` | **PASS** |

### Execution Metrics:
- **Run 1:** 18 passed, 0 failed, 0 skipped in 7,588 ms.
- **Run 2:** 18 passed, 0 failed, 0 skipped in 5,038 ms.
- **Repeatability:** 100% deterministic across fresh emulator resets.

---

## 5. Security & Architectural Insights Confirmed by Test Execution

1. **Atomic Rollback Confirmed (Test 12):**
   When a student client attempts a batched write containing an unauthorized operation alongside an authorized one, Firestore rules reject the batch atomically. The authorized cover was confirmed absent from the database.
2. **Fail-Closed Identity Mapping Confirmed (Test 10):**
   A standard Firebase Authentication UID cannot access a legacy MongoDB ObjectId document unless a cryptographic claim (`mongoId`) is present in `request.auth.token`. This validates our architectural finding: **client-side reads of historical data require server-minted custom claims**.
3. **Query Filter Invariant Confirmed (Test 15):**
   Firestore rules strictly reject collection-level queries (`getDocs(collection(db, 'covers'))`) because the rule cannot guarantee that every document in the collection belongs to the caller. When the frontend transitions to Firestore Client SDK, all collection queries must explicitly include `where('userId', '==', currentAuthUid)`.
4. **Admin Role Claims Confirmed (Tests 9 & 18):**
   Only verified tokens containing `role == 'ADMIN'`, `'SUPER_ADMIN'`, or `'MODERATOR'` can access governance endpoints or modify academic catalogs. Unrecognized role strings (`'SUPER_USER'`, `'HACKER'`) fail closed.

---

## 6. Changed Files Summary

```text
M backend/package.json         (Added devDependency: @firebase/rules-unit-testing)
M backend/package-lock.json    (Resolved @firebase/rules-unit-testing and firebase peer dep)
M tests/firestore/firestore.rules.test.mjs (Implemented official @firebase/rules-unit-testing suite)
?? scripts/migration/reports/PHASE_3G_B_EMULATOR_SECURITY_TEST_REPORT.md (This report)
```

- **Live Application Code Changed:** **ZERO.**
- **Production MongoDB Atlas / Cloud Firebase Changed:** **ZERO.**

---

## 7. Remaining Risks & Recommended Next Phase

### Remaining Risks
1. **Frontend Authentication Disconnect:**
   As identified in Phase 3F, `frontend/src/stores/useAuthStore.js` and `frontend/src/features/authentication/GoogleLoginButton.jsx` still use Google Identity Services (`@react-oauth/google`) to send a Google token to the Express backend (`/api/v1/auth/google`), which returns a custom backend JWT. Firebase Authentication client SDK is initialized but never invoked on student login.
2. **Missing Token Claims in Production:**
   Standard Google OAuth sign-in via Firebase Auth does **not** include `token.mongoId` or `token.role`. Unless a server-side hook (`firebase-admin`) sets custom user claims, direct client SDK reads will fail `isOwner` for legacy documents.
3. **Staging Cloud Rules Not Yet Deployed:**
   `firestore.rules` has been thoroughly validated offline on the local emulator suite, but has not yet been deployed to the isolated staging project `iiuc-cover-page-staging`.

### Recommended Next Phase: Phase 3H — Staging Cloud Rules Deployment & Live Probe Verification
1. **Step 1:** The project owner logs in via Firebase CLI: `firebase login --no-localhost`.
2. **Step 2:** Deploy the verified `firestore.rules` exclusively to staging:
   ```powershell
   .\backend\node_modules\.bin\firebase.cmd deploy --only firestore:rules --project iiuc-cover-page-staging
   ```
3. **Step 3:** Execute a non-destructive staging probe using 1 dedicated test account (zero backup documents) to verify Google Cloud IAM rules evaluation.
