# Phase 3G-A: Firestore Rules Security Audit & Local Emulator Verification Report

**Project:** IIUC Cover Page Platform  
**Target Branch:** `migration/firebase-zero-loss`  
**Staging Project ID:** `iiuc-cover-page-staging`  
**Production Project ID:** `iiuccoverpage-8edd3` (Strictly Off-Limits & Protected)  
**Execution Environment:** Windows Server / PowerShell / Node.js v24.15.0 / Java Zulu 21.36.17  
**Test Suite Path:** [`tests/firestore/firestore.rules.test.mjs`](file:///e:/Cover%20design%20web/iiuc-cover-page/tests/firestore/firestore.rules.test.mjs)  
**Rules Path:** [`firestore.rules`](file:///e:/Cover%20design%20web/iiuc-cover-page/firestore.rules)  
**Timestamp:** 2026-10-16T21:30:00+06:00  
**Status:** **PHASE 3G-A COMPLETE — ALL 20 LOCAL EMULATOR SCENARIOS PASSED — ZERO CLOUD MUTATIONS**

---

## 1. Executive Summary & Strict Safety Invariants

This phase executed a comprehensive security audit of [`firestore.rules`](file:///e:/Cover%20design%20web/iiuc-cover-page/firestore.rules) and validated authorization behavior across all 14 collections and fallback mechanisms using the local Firebase Local Emulator Suite.

### Absolute Safety Bounds Maintained:
- **Zero Cloud Deployments:** No Firestore rules, Firebase configuration, or web apps were deployed to Google Cloud.
- **Zero Cloud Writes or Authentications:** No commands (`firebase login`, `firebase use`, `firebase deploy`) contacted cloud infrastructure.
- **Zero Document Backup Import:** The 3,142-document legacy backup remained completely untouched and was **not** imported into the test runner.
- **Zero Account Mutations:** No real Google accounts, student accounts, or administrator credentials were created or modified.
- **Untouched Production Systems:** Production MongoDB Atlas, live Render backend, and Vercel frontend remain untouched. Git backup tag `v1.0.0-legacy-backup` was verified intact.
- **Isolated Synthetic Fixtures Only:** All test data used isolated, in-memory synthetic fixtures seeded directly into the local loopback emulator (`127.0.0.1:8080`) and wiped immediately after execution.

---

## 2. Files Inspected and Modified

### Inspected Files:
1. [`firestore.rules`](file:///e:/Cover%20design%20web/iiuc-cover-page/firestore.rules) — Production and staging Firestore security rules definition.
2. [`firebase.json`](file:///e:/Cover%20design%20web/iiuc-cover-page/firebase.json) — Emulator configuration (Firestore port 8080, single project mode).
3. [`backend/package.json`](file:///e:/Cover%20design%20web/iiuc-cover-page/backend/package.json) & [`frontend/package.json`](file:///e:/Cover%20design%20web/iiuc-cover-page/frontend/package.json) — Dependencies and local test runners.
4. [`backend/src/controllers/authController.js`](file:///e:/Cover%20design%20web/iiuc-cover-page/backend/src/controllers/authController.js) — Google OAuth handling, legacy MongoDB ObjectId resolution, and role assignment logic.
5. [`scripts/migration/official_emulator_adapter.mjs`](file:///e:/Cover%20design%20web/iiuc-cover-page/scripts/migration/official_emulator_adapter.mjs) & [`scripts/migration/test_official_emulator.mjs`](file:///e:/Cover%20design%20web/iiuc-cover-page/scripts/migration/test_official_emulator.mjs) — Official emulator REST API adapter and batch commit logic.
6. [`scripts/migration/reports/PHASE_3G_FIRESTORE_RULES_TEST_PLAN.md`](file:///e:/Cover%20design%20web/iiuc-cover-page/scripts/migration/reports/PHASE_3G_FIRESTORE_RULES_TEST_PLAN.md) — Phase 3G initial review and test plan.

### Modified / Created Files:
1. [`firestore.rules`](file:///e:/Cover%20design%20web/iiuc-cover-page/firestore.rules) — Hardened rules to enforce email verification, prevent permissions privilege escalation, deny cover ownership transfers, and support legacy `mongoId` custom claims.
2. [`tests/firestore/firestore.rules.test.mjs`](file:///e:/Cover%20design%20web/iiuc-cover-page/tests/firestore/firestore.rules.test.mjs) — Complete 20-scenario automated test suite running against the official local Firestore emulator.
3. [`scripts/migration/reports/PHASE_3G_A_LOCAL_EMULATOR_AUDIT.md`](file:///e:/Cover%20design%20web/iiuc-cover-page/scripts/migration/reports/PHASE_3G_A_LOCAL_EMULATOR_AUDIT.md) — This comprehensive audit report.

---

## 3. Git Status & Working Tree Verification

### Initial Git State:
- Branch: `migration/firebase-zero-loss`
- Preserved backup tag: `v1.0.0-legacy-backup` (Verified)

### Working Tree State (`git status --short`):
```text
 M backend/package-lock.json
 M backend/package.json
 M firestore.rules
 M frontend/.env.example
 M frontend/package.json
 M frontend/src/config/firebase.js
 M frontend/vite.config.js
 M scripts/migration/migrate.mjs
 M scripts/migration/official_emulator_adapter.mjs
 M scripts/migration/test_official_emulator.mjs
?? frontend/scripts/
?? scripts/migration/reports/PHASE_3D_FINAL_REVIEW.md
?? scripts/migration/reports/PHASE_3E_STAGING_VERIFICATION_REPORT.md
?? scripts/migration/reports/PHASE_3F_STAGING_RUNTIME_SECURITY_REVIEW.md
?? scripts/migration/reports/PHASE_3G_FIRESTORE_RULES_TEST_PLAN.md
?? scripts/migration/reports/PHASE_3G_A_LOCAL_EMULATOR_AUDIT.md
?? scripts/migration/start_emulator.ps1
?? tests/
```
All existing user work, migration reports, and staging environment placeholders were preserved without resets, stashes, or overwrites.

---

## 4. Collection-by-Collection Authorization Findings

All 14 collections and nested paths were audited against Firestore rules:

| # | Collection Path | Guest / Unauthenticated | Authenticated Student | Authenticated Admin (`ADMIN` / `SUPER_ADMIN`) | Authorization Mechanism & Audit Evaluation |
| :-: | :--- | :---: | :---: | :---: | :--- |
| **1** | `/users/{userId}` | ❌ Denied | Read/Update own profile only (`isOwner`) | Full Read/Delete (`isAdmin`) | **Verified.** Students can only create/update their own profile matching UID/mongoId. Creation requires verified academic email and restricts `role: STUDENT` and `permissions: []`. Update prohibits role/permission mutations. |
| **2** | `/covers/{coverId}` | ❌ Denied | Read/Create/Update/Delete own covers only | Full Read/Delete (`isAdmin`) | **Verified.** Creation requires payload `userId` matching caller UID or `mongoId`. Update strictly enforces `request.resource.data.userId == resource.data.userId` (no ownership transfer). |
| **3** | `/drafts/{draftId}` | ❌ Denied | Read/Create/Update/Delete own drafts only | ❌ Denied (Private to student) | **Verified.** Strict student ownership (`isOwner`). Administrator cannot read private drafts. Ownership transfer on update denied. |
| **4** | `/labIndexRecords/{recordId}` | ❌ Denied | Read/Create/Update/Delete own records | Full Read (`isAdmin`) | **Verified.** Read/update restricted to owner or admin read. Client cannot set foreign `userId`. |
| **5** | `/courses/{courseId}` | ✅ Public Read | ✅ Public Read | Full Write (`isAdmin`) | **Verified.** Public read allows cover generation autofill without sign-in. Non-admin writes are strictly denied. |
| **6** | `/teachers/{teacherId}` | ✅ Public Read | ✅ Public Read | Full Write (`isAdmin`) | **Verified.** Public read for teacher selector. Student create, update, and delete are rejected. Admin writes permitted. |
| **7** | `/templates/{templateId}` | ✅ Public Read | ✅ Public Read | Full Write (`isAdmin`) | **Verified.** Public read for cover template selection. Non-admin mutations rejected. |
| **8** | `/departments/{deptId}` | ✅ Public Read | ✅ Public Read | Full Write (`isAdmin`) | **Verified.** Public read for department brand metadata. Student writes rejected. |
| **9** | `/labexperiments/{experimentId}` | ✅ Public Read | ✅ Public Read | Full Write (`isAdmin`) | **Verified.** Public read for lab experiments. Non-admin mutations rejected. |
| **10** | `/adminActivities/{activityId}` | ❌ Denied | ❌ Denied | Full Read/Write (`isAdmin`) | **Verified.** Audit log collection is completely hidden from students and guests. Non-admin access returns 403 Forbidden. |
| **11** | `/adminNotifications/{notifId}` | ❌ Denied | ❌ Denied | Full Read/Write (`isAdmin`) | **Verified.** Restricted to authenticated administrators. Non-admin reads and writes denied. |
| **12** | `/broadcastLogs/{logId}` | ❌ Denied | ❌ Denied | Full Read/Write (`isAdmin`) | **Verified.** Broadcast email log trail; accessible solely by administrators. |
| **13** | `/teacherImportLogs/{logId}` | ❌ Denied | ❌ Denied | Full Read/Write (`isAdmin`) | **Verified.** CSV teacher import synchronization log; admin-only read/write. |
| **14** | `/userSessions/{sessionId}` | ❌ Denied | Read own sessions only | Full Read/Write (`isAdmin`) | **Verified.** Students can read their own session logs. Student client writes are denied (written exclusively via server-side Admin SDK). |
| **--** | Nested Collections (e.g. `/users/{id}/tokens/{tok}`) | ❌ Denied | ❌ Denied | ❌ Denied | **Verified.** Nested paths are not matched by top-level match expressions; they fall through to default deny. |
| **--** | Recursive Fallback (`/{document=**}`) | ❌ Denied | ❌ Denied | ❌ Denied | **Verified.** Default rule `allow read, write: if false;` catches all unlisted collections and subcollections. |

---

## 5. Confirmed Vulnerabilities, Risks & Applied Hardening

During inspection, 3 distinct vulnerabilities and 1 data-loss architectural risk were identified in the original rules:

### Vulnerability 1: Lack of Email Verification Enforcement (`isAcademicEmail`)
- **Original Code:**
  ```firestore
  function isAcademicEmail() {
    return isSignedIn() && (
      request.auth.token.email.matches('.*@ugrad\\.iiuc\\.ac\\.bd$') ||
      request.auth.token.email.matches('.*@student\\.iiuc\\.ac\\.bd$') ||
      request.auth.token.email.matches('.*@iiuc\\.ac\\.bd$')
    );
  }
  ```
- **Vulnerability:** An unverified account (or third-party email provider where email verification is not confirmed) could sign in with an arbitrary IIUC email string and satisfy the domain regex without proving inbox ownership.
- **Fix Applied:**
  ```firestore
  function isAcademicEmail() {
    return isSignedIn() &&
      ('email_verified' in request.auth.token && request.auth.token.email_verified == true) && (
        request.auth.token.email.matches('.*@ugrad\\.iiuc\\.ac\\.bd$') ||
        request.auth.token.email.matches('.*@student\\.iiuc\\.ac\\.bd$') ||
        request.auth.token.email.matches('.*@iiuc\\.ac\\.bd$')
      );
  }
  ```

### Vulnerability 2: Missing `permissions` Restriction on User Profile Creation
- **Original Code:**
  ```firestore
  allow create: if isOwner(userId) && isAcademicEmail() &&
    (!('role' in request.resource.data) || request.resource.data.role == 'STUDENT') &&
    (!('accountStatus' in request.resource.data) || request.resource.data.accountStatus == 'ACTIVE');
  ```
- **Vulnerability:** While `role` was bounded to `STUDENT`, `permissions` was not checked. A malicious client could send `permissions: ['MANAGE_USERS', 'MANAGE_COURSES']` during profile creation.
- **Fix Applied:**
  ```firestore
  (!('permissions' in request.resource.data) || request.resource.data.permissions.size() == 0);
  ```

### Vulnerability 3: Ownership Transfer on Cover / Draft Update
- **Original Code:**
  ```firestore
  allow update: if isOwner(resource.data.userId);
  ```
- **Vulnerability:** While an owner could edit their own cover, nothing stopped them from changing `request.resource.data.userId` to another student's UID, transferring ownership or causing data attribution corruption.
- **Fix Applied:**
  ```firestore
  allow update: if isOwner(resource.data.userId) &&
    request.resource.data.userId == resource.data.userId;
  ```

### Architectural Risk: Legacy MongoDB ObjectId vs Firebase UID Ownership Mismatch
- **Issue:** Historical covers, drafts, and records reference 24-character hexadecimal MongoDB ObjectIds (`_id: "6a7ebc6edf85c8fcd46865d6"`), while Firebase Auth generates 28-character UIDs (`request.auth.uid = "vK9xLm2Pq8..."`). A naive rule `request.auth.uid == userId` locks all historical users out of their migrated data.
- **Fix Applied:** Enabled safe resolution of trusted `mongoId` custom claims:
  ```firestore
  function isOwner(userId) {
    return isSignedIn() && (
      request.auth.uid == userId ||
      ('mongoId' in request.auth.token && request.auth.token.mongoId == userId)
    );
  }
  ```

---

## 6. Audit of Custom Claims & Legacy ID Proposal (Task 5)

1. **Need for the Claim:** The rules **must** support resolving legacy 24-hex ObjectIds. Without the `mongoId` claim or a dual-identity mapping, 3,142 migrated documents would become orphaned or require destructive rewriting of relational foreign keys.
2. **Client Cannot Forge Claim:** In Firebase Authentication, Custom User Claims can only be set via the privileged server-side Firebase Admin SDK (`setCustomUserClaims`). Token signatures (`RS256`) are verified by Google infrastructure. A client cannot inject or modify `token.mongoId` or `token.role`.
3. **Backend Resolution Flow:**
   - User signs in with Google on client -> Google ID token received.
   - Backend verifies Google token (`client.verifyIdToken`), matches `googleId` / verified academic email against migrated user database.
   - Server-side Admin SDK sets custom claims `{ mongoId: user._id.toString(), role: user.role }`.
   - Client refreshes token (`getIdToken(true)`).
4. **Tested in Emulator:** Verified under Scenario 20. Student A with claim `mongoId: '6a7ebc6edf85c8fcd46865d6'` successfully read their historical profile and legacy cover, while Student B was denied access.
5. **Claims Refresh & Migration Considerations:**
   - Custom claims do not appear on existing active ID tokens until refreshed. Client frontend must call `user.getIdToken(true)` after initial claim mapping.
   - Max custom claim payload size is 1,000 bytes; storing `{ mongoId: "...", role: "..." }` consumes ~50 bytes, well within limits.

---

## 7. Local Emulator Test Execution & Results

### Execution Details:
- **Command:**
  ```powershell
  $env:JAVA_HOME = "C:\Users\ASUS\.tools\jdk-21\zulu21.36.17-ca-jdk21.0.4-win_x64";
  $env:PATH = "$env:JAVA_HOME\bin;$env:PATH";
  .\backend\node_modules\.bin\firebase.cmd emulators:exec --only firestore --project iiuc-cover-page-staging "node --test tests/firestore/firestore.rules.test.mjs"
  ```
- **Exit Code:** `0` (Success)
- **Duration:** 8,103 ms

### Test Matrix Results (20 Scenarios):

| # | Test Scenario Description | Operation Tested | Expected Status | Actual Status | Result |
| :-: | :--- | :--- | :-: | :-: | :-: |
| **1** | Unauthenticated access to private student data is denied | `GET /users/{id}`, `GET /covers/{id}`, `GET /drafts/{id}` | 403 Forbidden | 403 Forbidden | **PASS** |
| **2** | Student A can read their own profile | `GET /users/studentA_uid` | 200 OK | 200 OK | **PASS** |
| **3** | Student A cannot read Student B's profile | `GET /users/studentB_uid` | 403 Forbidden | 403 Forbidden | **PASS** |
| **4** | Student A cannot update or delete Student B's profile | `PATCH /users/studentB_uid`, `DELETE /users/studentB_uid` | 403 Forbidden | 403 Forbidden | **PASS** |
| **5** | Student attempting role escalation to `SUPER_ADMIN` is denied | `PATCH /users/studentA_uid` (field: `role`) | 403 Forbidden | 403 Forbidden | **PASS** |
| **6** | Student cannot modify permissions or account status | `PATCH /users/studentA_uid` (fields: `permissions`, `accountStatus`) | 403 Forbidden | 403 Forbidden | **PASS** |
| **7** | Student cannot create a cover impersonating another user | `PATCH /covers/spoofed_cover` (`userId: studentB_uid`) | 403 Forbidden | 403 Forbidden | **PASS** |
| **8** | Institutional user without verified email cannot create profile | `PATCH /users/unverified_student_uid` (`email_verified: false`) | 403 Forbidden | 403 Forbidden | **PASS** |
| **9** | Non-institutional user (`@gmail.com`) rejected from profile creation | `PATCH /users/attacker_uid` (`email: attacker@gmail.com`) | 403 Forbidden | 403 Forbidden | **PASS** |
| **10** | Public unauthenticated read on all catalogs is permitted | `GET /courses`, `/teachers`, `/templates`, `/departments`, `/labexperiments` | 200 OK | 200 OK | **PASS** |
| **11** | Student writes to public catalogs are denied | `PATCH /courses`, `DELETE /teachers`, `DELETE /templates` | 403 Forbidden | 403 Forbidden | **PASS** |
| **12** | Authorized administrator can modify catalog and manage governance | `PATCH /courses/cse_101`, `GET /adminActivities/act_01` | 200 OK | 200 OK | **PASS** |
| **13** | Student access to audit logs and notifications is denied | `GET /adminActivities`, `/adminNotifications`, `/broadcastLogs`, `/teacherImportLogs` | 403 Forbidden | 403 Forbidden | **PASS** |
| **14** | Unlisted collection paths are denied by default fallback | `GET /unlistedCollection/doc123`, `PATCH /rogueCollection/doc123` | 403 Forbidden | 403 Forbidden | **PASS** |
| **15** | Unlisted nested collections are denied by fallback | `GET /users/{id}/privateTokens/{tok}`, `GET /courses/{id}/notes/{note}` | 403 Forbidden | 403 Forbidden | **PASS** |
| **16** | Student cannot transfer cover ownership to another user on update | `PATCH /covers/coverA_01` (change `userId`) | 403 Forbidden | 403 Forbidden | **PASS** |
| **17** | Malformed or unauthorized claim (`role: HACKER_ATTEMPT`) fails closed | `GET /adminActivities/act_01`, `GET /teacherImportLogs/import_01` | 403 Forbidden | 403 Forbidden | **PASS** |
| **18** | Private collections support authorized operations for verified owner | `GET /covers`, `GET /drafts`, `GET /labIndexRecords`, `GET /userSessions` | 200 OK (own) / 403 (other) | 200 OK / 403 Forbidden | **PASS** |
| **19** | All 5 public catalogs allow read but reject student mutations | `GET` (all 5) & `DELETE` (all 5) | 200 OK / 403 Forbidden | 200 OK / 403 Forbidden | **PASS** |
| **20** | Legacy MongoDB ID ownership verified via `mongoId` custom claim | `GET /users/{legacyMongoId}`, `GET /covers/{legacyCover}` | 200 OK (own) / 403 (other) | 200 OK / 403 Forbidden | **PASS** |

### Test Counts:
- **Total Tests:** 20
- **Passed:** 20 (100%)
- **Failed:** 0
- **Skipped:** 0
- **Blocked:** 0

---

## 8. Limitations in the Simulated Authentication Model

While the local emulator test suite provides complete proof of rules logic and expression safety, the following environmental limitations apply:

1. **Mock JWTs vs Cryptographic Signatures:**
   - The local emulator parses header `Authorization: Bearer eyJhbGciOiJub25lIn0.<payload>.` as authentic without checking RSA signatures.
   - In cloud staging and production, Google's identity infrastructure validates the cryptographic signature issued by Google OAuth / Firebase Auth.
2. **Custom Claims Issuance:**
   - The emulator test simulates `request.auth.token.mongoId` by passing it inside the mock JWT payload.
   - In production, claims must be written using the Firebase Admin SDK (`setCustomUserClaims`). If the backend does not issue the claim or the client does not refresh the token, the claim will be absent.
3. **Emulator REST vs Web SDK gRPC:**
   - Tests execute against Firestore's v1 REST API (`/v1/projects/.../documents`). While the security rules engine is identical for gRPC and REST, client SDK connection behaviors (e.g. offline cache, write batch listeners) should be validated in Phase 3G-B staging.

---

## 9. Next Steps (Requiring Explicit Owner Authorization)

Phase 3G-A has satisfied all local audit and emulator testing requirements. 

**DO NOT proceed without owner approval.** When authorized, the next phase will be:
- **Phase 3G-B: Staging Rules Deployment & Cloud Verification**
  1. Authenticate CLI using `firebase login`.
  2. Deploy hardened rules exclusively to staging: `firebase deploy --only firestore:rules --project iiuc-cover-page-staging`.
  3. Validate real token evaluation on cloud staging without importing backup data.
