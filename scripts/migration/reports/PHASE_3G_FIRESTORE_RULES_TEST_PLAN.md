# Phase 3G — Staging-Only Firestore Security Rules Verification & Test Plan

**Project:** IIUC Cover Page Platform  
**Target Branch:** `migration/firebase-zero-loss`  
**Staging Project ID:** `iiuc-cover-page-staging`  
**Production Project ID:** `iiuccoverpage-8edd3` (Strictly Off-Limits & Protected)  
**Execution Environment:** Windows Server / PowerShell / Node.js v24.15.0  
**Timestamp:** 2026-10-16T21:15:00+06:00  
**Status:** **TEST PLAN PREPARED & HALTED — ZERO CLOUD WRITES PERFORMED — AWAITING EXPLICIT APPROVAL**

---

## 1. Executive Summary & Strict Safety Bounds

This document establishes the official test plan for deploying and validating Firestore Security Rules strictly within the isolated **`iiuc-cover-page-staging`** cloud environment. 

### Hard Safety Boundaries Enforced:
1. **Zero Production Mutation:** The production Firebase project (`iiuccoverpage-8edd3`), MongoDB Atlas cluster (`iiuc_cover_page`), live Vercel frontend, and Render backend remain completely untouched and isolated.
2. **Zero Backup Import:** The 3,142-document canonical backup is **not** imported during this phase. Rules are validated independently before data migration.
3. **Zero Fake Token Bypasses:** Emulator `alg:none` tokens, `Bearer owner` root bypasses, and Admin SDK operations are explicitly distinguished from real Google Cloud Firestore security rule enforcement.
4. **Zero Account Creation:** No student or administrator accounts were created, modified, or deleted.
5. **No Rules Deployment without Approval:** The proposed deployment commands are fully formulated and verified, but **not executed**.
6. **Zero Secret Exposure:** No API keys, tokens, or passwords are logged or committed. Local `.env.staging.local` remains strictly Git-ignored and untracked.

---

## 2. Collection & Path Permissions Audit ([`firestore.rules`](file:///e:/Cover%20design%20web/iiuc-cover-page/firestore.rules))

All 14 collections in the IIUC Cover Page schema are audited below with their intended security postures:

| # | Collection Path | Guest / Unauthenticated | Authenticated Student | Authenticated Administrator (`ADMIN`/`SUPER_ADMIN`) | Security Mechanism |
| :-: | :--- | :---: | :---: | :---: | :--- |
| **1** | `/users/{userId}` | ❌ Denied | Read/Update own profile only (`isOwner`) | Full Read/Delete (`isAdmin`) | Academic email domain verified; `role`, `accountStatus`, and `permissions` cannot be modified by students. |
| **2** | `/covers/{coverId}` | ❌ Denied | Read/Create/Update/Delete own covers only | Full Read/Delete (`isAdmin`) | `request.resource.data.userId == request.auth.uid`; required payload keys enforced. |
| **3** | `/drafts/{draftId}` | ❌ Denied | Read/Create/Update/Delete own drafts only | ❌ Denied (Private to student) | Strict student ownership (`isOwner`). |
| **4** | `/labIndexRecords/{recordId}` | ❌ Denied | Read/Create/Update/Delete own records | Full Read (`isAdmin`) | Strict student ownership (`isOwner`). |
| **5** | `/courses/{courseId}` | ✅ Public Read | ✅ Public Read | Full Write (`isAdmin`) | Public read for cover generator auto-completion; admin-only writes. |
| **6** | `/teachers/{teacherId}` | ✅ Public Read | ✅ Public Read | Full Write (`isAdmin`) | Public read for teacher selector; admin-only writes. |
| **7** | `/templates/{templateId}` | ✅ Public Read | ✅ Public Read | Full Write (`isAdmin`) | Public read for template cards; admin-only writes. |
| **8** | `/departments/{deptId}` | ✅ Public Read | ✅ Public Read | Full Write (`isAdmin`) | Public read for brand colors and logo metadata; admin-only writes. |
| **9** | `/labexperiments/{experimentId}` | ✅ Public Read | ✅ Public Read | Full Write (`isAdmin`) | Public read for lab experiment catalog; admin-only writes. |
| **10** | `/adminActivities/{activityId}` | ❌ Denied | ❌ Denied | Full Read/Write (`isAdmin`) | Internal audit trail; completely invisible to non-admins. |
| **11** | `/adminNotifications/{notifId}` | ❌ Denied | ❌ Denied | Full Read/Write (`isAdmin`) | System alerts; admin-only. |
| **12** | `/broadcastLogs/{logId}` | ❌ Denied | ❌ Denied | Full Read/Write (`isAdmin`) | Broadcast history; admin-only. |
| **13** | `/teacherImportLogs/{logId}` | ❌ Denied | ❌ Denied | Full Read/Write (`isAdmin`) | CSV scrape/sync logs; admin-only. |
| **14** | `/userSessions/{sessionId}` | ❌ Denied | Read own sessions only | Full Read/Write (`isAdmin`) | Direct student creation/write is denied (server-logged). |
| **--** | `/{document=**}` (Fallback) | ❌ Denied | ❌ Denied | ❌ Denied | Catch-all default fallback deny (`allow read, write: if false;`). |

---

## 3. Deep Dive: Legacy MongoDB ObjectId vs. Firebase UID Mismatch

### A. The Structural Incompatibility
1. **Source MongoDB Structure:**
   - Every user in the backup has a 24-character hexadecimal ObjectId: e.g. `_id: "6a7ebc6edf85c8fcd46865d6"`.
   - Every relational record points to this string: `covers.userId = "6a7ebc6edf85c8fcd46865d6"`, `drafts.userId = "6a7ebc6edf85c8fcd46865d6"`.
2. **Firebase Authentication Structure:**
   - When a student signs in via Google OAuth on Firebase Auth, Firebase generates a distinct alphanumeric UID: e.g. `request.auth.uid = "vK9xLm2Pq8R4t..."`.
3. **The Security Rules Conflict:**
   - In [`firestore.rules`](file:///e:/Cover%20design%20web/iiuc-cover-page/firestore.rules):
     ```javascript
     function isOwner(userId) {
       return isSignedIn() && request.auth.uid == userId;
     }
     ```
   - If direct client-side SDK requests are issued:
     * Requesting `/users/6a7ebc6edf85c8fcd46865d6` compares `"vK9xLm2Pq8R4t..." == "6a7ebc6edf85c8fcd46865d6"`, which evaluates to **`false`**.
     * Querying `/covers` where `userId == request.auth.uid` returns 0 of the 495 migrated historical covers.

### B. Secure Authorization & Identity-Mapping Recommendations

#### Recommendation 1: Dual-Key Custom Token Claims (Enterprise Standard)
When a student signs in with their IIUC Google account:
1. Client receives initial Firebase ID Token.
2. A secure backend endpoint verifies the token and resolves the student's legacy record using the cryptographic Google Subject ID (`decodedToken.firebase.identities['google.com'][0] == user._identityVerification.googleSubjectId`).
3. The server sets a Custom User Claim via Firebase Admin SDK:
   ```javascript
   await admin.auth().setCustomUserClaims(decodedToken.uid, {
     mongoId: user.legacyMongoId,
     role: user.role,
     department: user.department,
   });
   ```
4. Client refreshes token: `await auth.currentUser.getIdToken(true)`.
5. The rule helper is updated to:
   ```javascript
   function isOwner(userId) {
     return isSignedIn() && (
       request.auth.uid == userId ||
       ('mongoId' in request.auth.token && request.auth.token.mongoId == userId)
     );
   }
   ```
   *Benefits:* Zero rewrite of legacy foreign keys; zero data loss; cryptographically tamper-proof (clients cannot fabricate custom claims).

#### Recommendation 2: Backend-Mediated API (Transitional Zero-Risk Baseline)
- Continue routing data reads/writes through the Express backend via `api/v1/*`.
- The Express backend uses `admin.auth().verifyIdToken()` to authenticate requests and uses the Firebase Admin SDK to fetch records from Firestore.
- *Benefits:* Requires zero changes to client code or security rules during staging.

---

## 4. Firebase CLI Authentication Audit & Instructions

### A. Current Status
Execution of `.\backend\node_modules\.bin\firebase.cmd projects:list` returned:
```
Error: Failed to authenticate, have you run firebase login?
```
The Firebase CLI is currently **unauthenticated** on this system.

### B. Safe Authentication Instructions for the Project Owner
To authenticate the CLI safely without exposing credentials or mixing projects:
1. Open PowerShell in the workspace root (`e:\Cover design web\iiuc-cover-page`).
2. Run the interactive login command:
   ```powershell
   .\backend\node_modules\.bin\firebase.cmd login --no-localhost
   ```
   *(Or standard login: `.\backend\node_modules\.bin\firebase.cmd login` if on a local desktop with browser access).*
3. Sign in using the Google account that owns **`iiuc-cover-page-staging`**.
4. Confirm active project selection:
   ```powershell
   .\backend\node_modules\.bin\firebase.cmd use iiuc-cover-page-staging
   ```
5. Verify that `iiuccoverpage-8edd3` is **never** selected.

---

## 5. Staging-Only Deployment Command & Target Verification

> [!WARNING]
> **DO NOT EXECUTE THESE COMMANDS UNTIL FORMALLY AUTHORIZED BY THE OWNER.**

### A. Target Verification Guard (Fail-Closed)
Before deploying, execute:
```powershell
# Must return "Active project: iiuc-cover-page-staging"
.\backend\node_modules\.bin\firebase.cmd use
```
If the output mentions `iiuccoverpage-8edd3` or any production alias, **ABORT IMMEDIATELY**.

### B. Proposed Deployment Command
```powershell
.\backend\node_modules\.bin\firebase.cmd deploy --only firestore:rules --project iiuc-cover-page-staging
```
*Key Safeguard:* The explicit `--project iiuc-cover-page-staging` flag overrides any ambient configuration and guarantees that rules are deployed **only** to the staging project.

---

## 6. Comprehensive 7-Scenario Security Rules Test Matrix

| # | Scenario | Request Method & Path | Authentication State | Expected HTTP Status / Error | Security Principle Validated |
| :-: | :--- | :--- | :--- | :-: | :--- |
| **1** | **Unauthenticated Access Denial** | `GET /users/test_student_id`<br>`GET /covers/test_cover_id` | `None` (Unauthenticated) | `403 Forbidden`<br>(`permission-denied`) | Default-deny; private collections inaccessible to guests. |
| **2** | **Student Reading Own Profile** | `GET /users/{studentUid}` | Authenticated Student (`uid == studentUid`) | `200 OK` | Principle of least privilege; student can view own profile. |
| **3** | **Cross-Student Read Denial** | `GET /users/{otherStudentUid}`<br>`GET /covers/{otherCoverId}` | Authenticated Student A requesting Student B's document | `403 Forbidden`<br>(`permission-denied`) | Tenant isolation; students cannot inspect peer data. |
| **4** | **Privilege Escalation Denial** | `PATCH /users/{studentUid}`<br>`{ "role": "SUPER_ADMIN" }` | Authenticated Student | `403 Forbidden`<br>(`permission-denied`) | `diff().affectedKeys()` blocks tampering with role/permissions. |
| **5** | **Public Catalog Reads vs. Unauthorized Writes** | `GET /courses/cse_101`<br>`POST /courses` | Read: `None`<br>Write: Authenticated Student | Read: `200 OK`<br>Write: `403 Forbidden` | Catalog auto-complete is public; catalog mutations require admin. |
| **6** | **Authorized Administrator Operations** | `GET /adminActivities/act_01`<br>`PATCH /courses/cse_101` | User with Custom Claim `role == 'SUPER_ADMIN'` | `200 OK` | `isAdmin()` grants administrative access to designated roles only. |
| **7** | **Mismatched / Invalid Domain Access** | `POST /users/{uid}` | Authenticated user with `@gmail.com` | `403 Forbidden`<br>(`permission-denied`) | `isAcademicEmail()` strictly rejects non-IIUC email domains. |

---

## 7. Local Emulation vs. Real Cloud Test Distinction

| Attribute | Local Firebase Emulator (`127.0.0.1:8080`) | Live Staging Cloud (`iiuc-cover-page-staging`) |
| :--- | :--- | :--- |
| **Token Verification** | Decodes header payloads directly (`alg:none` permitted for offline speed). | **Strict RS256 cryptographic verification** against Google discovery endpoint. |
| **Administrative Bypass** | Allows `Bearer owner` header to seed data without rule checks. | Rejects `Bearer owner`; requires Google Cloud OAuth 2.0 service account credentials. |
| **Network & Latency** | Instantaneous loopback (~1ms). | Real cloud round-trip latency (100–300ms); Google Cloud IAM evaluation. |
| **Testing Role** | Rapid offline rule debugging & unit regression testing. | **Definitive ground truth** for cloud production readiness. |

---

## 8. Minimum Setup for Live Cloud Staging Security Verification

If real cloud verification is approved, the **absolute minimum, non-destructive setup** required is:

1. **Zero Backup Import:** Do not import the 3,142-document backup.
2. **Two Isolated Probe Documents:**
   - Write `/staging_security_probes/unauth_probe` via Firebase Console (for testing guest denial).
   - Write `/staging_security_probes/admin_probe` via Firebase Console (for testing admin access).
3. **One Dedicated Staging Test Account:**
   - The owner logs in once via the staging web app using a test academic email (e.g. `staging.test@ugrad.iiuc.ac.bd`) to mint 1 genuine RS256 Firebase ID token.
4. **Execution of Automated Probe Script:**
   - Execute a minimal verification script (`scripts/migration/probe_staging_rules.mjs`) that attempts the 7 test scenarios using the real ID token and unauthenticated headers against `firestore.googleapis.com`.
5. **Immediate Probe Cleanup:**
   - Delete `/staging_security_probes/*` after testing.

---

## 9. Rollback & Fail-Safe Procedures

If any unexpected error or rule misconfiguration occurs during staging deployment:

1. **Immediate Rules Rollback:**
   Restore previous permissive or lock-down rule via:
   ```powershell
   # Deploys locked-down rules if staging needs immediate freeze
   .\backend\node_modules\.bin\firebase.cmd deploy --only firestore:rules --project iiuc-cover-page-staging
   ```
2. **Production Immunity:**
   Because production uses `iiuccoverpage-8edd3` and MongoDB Atlas, **zero production services will be impacted regardless of any staging outcome**.
3. **Database Reset:**
   If any erroneous documents are written to staging, the staging Firestore database can be cleared via Firebase Console or staging purge script without affecting MongoDB Atlas.

---

## 10. Next Steps Requiring Explicit Owner Authorization

To proceed with Phase 3G verification, the owner must explicitly provide approval for:
1. Running `firebase login` to authenticate the CLI.
2. Executing the deployment command:
   `.\backend\node_modules\.bin\firebase.cmd deploy --only firestore:rules --project iiuc-cover-page-staging`
3. Running the non-destructive cloud probe tests.

*Execution is halted awaiting owner review and authorization.*
