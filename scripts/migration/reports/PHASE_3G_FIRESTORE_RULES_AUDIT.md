# Phase 3G — Firestore Security Rules Audit & Staging Test Preparation Report

**Project:** IIUC Cover Page Platform  
**Target Branch:** `migration/firebase-zero-loss`  
**Staging Project ID:** `iiuc-cover-page-staging`  
**Production Project ID:** `iiuccoverpage-8edd3` (Strictly Off-Limits & Protected)  
**Rules File Audited:** `firestore.rules`  
**Status:** **AUDIT COMPLETE — TEST PREPARATION STAGED — DEPENDENCY APPROVAL REQUIRED**

---

## 1. Absolute Safety & Environment Verification

All Phase 3G operations have been performed under strict, non-destructive safety boundaries:

1. **Production Isolation:** No access, connection, rule deployment, or data write was made to production Firebase (`iiuccoverpage-8edd3`), production MongoDB Atlas, Render backend, or Vercel production hosting.
2. **Zero Data Import:** The 3,142 backup documents in `E:\iiuc_backups\mongodb_atlas_backup` were **not** imported or touched.
3. **Zero Cloud Deployments:** No `firebase deploy` or cloud writes were executed.
4. **Git Tree Integrity:** Preserved all existing uncommitted and untracked changes across `backend/package.json`, `frontend/src/config/firebase.js`, and migration reports. No user work was stashed, reset, or overwritten.
5. **No Unauthorized Package Installations:** Inspected dependency trees without modifying `package.json` or lockfiles.

---

## 2. Comprehensive Collection-by-Collection Rules Audit

Every collection and path in `firestore.rules` was evaluated against least-privilege access, role escalation risks, query compatibility, and browser-versus-backend exposure.

### Summary Matrix

| # | Collection / Path | Guest / Unauthenticated | Authenticated Student | Authenticated Admin | Sensitive Fields & Role Escalation Defense | Query / Filter Compatibility | Recommended Access Architecture |
| :-: | :--- | :---: | :---: | :---: | :--- | :--- | :--- |
| **1** | `/users/{userId}` | ❌ Denied | Read/Update own profile only (`isOwner`) | Full Read/Delete (`isAdmin`) | Student creation restricted to `role == 'STUDENT'`, `accountStatus == 'ACTIVE'`, `permissions.size() == 0`. Updates guarded by `.hasOnly(['name', 'studentId', 'department', 'batch', 'semester', 'section', 'academicProfile', 'academicInfo', 'avatar', 'updatedAt'])`. | Collection queries (e.g. `collection('users')`) without doc ID are denied to students. Direct doc read `doc('users', auth.uid)` succeeds. | **Hybrid:** Student reads/updates own document directly via Client SDK; administrative governance mediated via Backend. |
| **2** | `/covers/{coverId}` | ❌ Denied | Read/Create/Update/Delete own covers | Full Read/Delete (`isAdmin`) | Creation requires `userId` matching `request.auth.uid` (or verified `token.mongoId`). Update strictly enforces `request.resource.data.userId == resource.data.userId` (ownership transfer denied). | Queries require `where('userId', '==', auth.uid)`. Collection queries without this filter fail closed with `permission-denied`. | **Direct Client SDK** for student cover CRUD; **Backend** for bulk admin reporting. |
| **3** | `/drafts/{draftId}` | ❌ Denied | Read/Create/Update/Delete own drafts | ❌ Denied (Private to student) | Document ownership strictly enforced. Ownership transfer denied on update. Admins cannot view private drafts. | Queries require `where('userId', '==', auth.uid)`. | **Direct Client SDK** (client auto-save). |
| **4** | `/labIndexRecords/{recordId}` | ❌ Denied | Read/Create/Update/Delete own records | Full Read (`isAdmin`) | `userId` match required. Transfer prohibited on update. | Queries require `where('userId', '==', auth.uid)`. | **Direct Client SDK** for student entries; **Backend** for department exports. |
| **5** | `/courses/{courseId}` | ✅ Public Read | ✅ Public Read | Full Write (`isAdmin`) | Non-admin writes are completely denied. Admins can create/update/delete. | `collection('courses')` queries allowed for all clients. | **Direct Client SDK** (read-only); **Backend** (admin mutations). |
| **6** | `/teachers/{teacherId}` | ✅ Public Read | ✅ Public Read | Full Write (`isAdmin`) | Non-admin writes are completely denied. | `collection('teachers')` queries allowed for all clients. | **Direct Client SDK** (read-only); **Backend** (sync/scraper jobs). |
| **7** | `/templates/{templateId}` | ✅ Public Read | ✅ Public Read | Full Write (`isAdmin`) | Non-admin writes are completely denied. | `collection('templates')` queries allowed for all clients. | **Direct Client SDK** (read-only); **Backend** (admin template editor). |
| **8** | `/departments/{deptId}` | ✅ Public Read | ✅ Public Read | Full Write (`isAdmin`) | Non-admin writes are completely denied. | `collection('departments')` queries allowed for all clients. | **Direct Client SDK** (read-only); **Backend** (admin settings). |
| **9** | `/labexperiments/{experimentId}` | ✅ Public Read | ✅ Public Read | Full Write (`isAdmin`) | Non-admin writes are completely denied. | `collection('labexperiments')` queries allowed for all clients. | **Direct Client SDK** (read-only); **Backend** (curriculum management). |
| **10** | `/adminActivities/{activityId}` | ❌ Denied | ❌ Denied | Full Read/Write (`isAdmin`) | Hidden from non-admins. Completely inaccessible to guests and students. | Only admins can query. | **Backend Mediated Only:** Clients should never read or write governance audit logs directly. |
| **11** | `/adminNotifications/{notifId}` | ❌ Denied | ❌ Denied | Full Read/Write (`isAdmin`) | System alerts visible only to administrators. | Only admins can query. | **Backend Mediated Only.** |
| **12** | `/broadcastLogs/{logId}` | ❌ Denied | ❌ Denied | Full Read/Write (`isAdmin`) | Email broadcast audit history. Non-admin access denied. | Only admins can query. | **Backend Mediated Only.** |
| **13** | `/teacherImportLogs/{logId}` | ❌ Denied | ❌ Denied | Full Read/Write (`isAdmin`) | University faculty scraping and CSV sync logs. Non-admin access denied. | Only admins can query. | **Backend Mediated Only.** |
| **14** | `/userSessions/{sessionId}` | ❌ Denied | Read own session history (`isOwner`) | Full Read/Write (`isAdmin`) | Direct client writes are denied (`allow write: if isAdmin()`). Prevents students from forging IP, user agent, or session tokens. | Queries require `where('userId', '==', auth.uid)`. | **Backend Mediated Only for Writes** (logged via Express auth handler / Cloud Functions); **Direct Client SDK for Read-Only**. |
| **--** | `/{document=**}` (Fallback) | ❌ Denied | ❌ Denied | ❌ Denied | Deny-by-default catches all undefined collections, root paths, and subcollections. | All queries denied. | Blocked completely. |

---

### Detailed Findings & Critical Observations

#### 1. Public Catalog Reads Justification
The application supports **guest cover generation** where students generate and download assignment/lab covers without signing in. For the generator to autocomplete course codes, teacher designations, departments, lab experiments, and render template thumbnails, the catalogs (`/courses`, `/teachers`, `/templates`, `/departments`, `/labexperiments`) must permit public reads (`allow read: if true;`). However, all write operations (`create`, `update`, `delete`) are strictly gated to authenticated administrators (`isAdmin()`).

#### 2. Query Compatibility & Security Rules Behavior
In Firestore, **security rules are not query filters**. 
- If a client runs `getDocs(collection(db, 'covers'))`, Firestore checks whether the rule allows reading *every possible document* in the collection. Because `covers` requires `isOwner(resource.data.userId)`, Firestore rejects the query with `FirebaseError: Missing or insufficient permissions`.
- For student queries to succeed, the client code must explicitly filter by their authenticated identity:
  ```javascript
  query(collection(db, 'covers'), where('userId', '==', currentAuthUid))
  ```
- This behavior is consistent across `covers`, `drafts`, `labIndexRecords`, and `userSessions`.

#### 3. Role Escalation & Privilege Hardening
- **Create Protection:** A student cannot supply `role: 'ADMIN'` or `permissions: ['ALL']` during profile creation. The rule mandates `(!('role' in request.resource.data) || request.resource.data.role == 'STUDENT')` and `permissions.size() == 0`.
- **Update Protection:** The `update` rule strictly enforces `affectedKeys().hasOnly([...])`, omitting `role`, `permissions`, `accountStatus`, and `email`. Any payload attempting to elevate privileges or alter account standing is rejected.
- **Ownership Transfer Defense:** In `covers`, `drafts`, and `labIndexRecords`, the update rule explicitly enforces `request.resource.data.userId == resource.data.userId`, preventing a student from transferring records to or impersonating another student.

---

## 3. Identity-Mapping Design Resolution

### The Problem
The canonical MongoDB backup contains 3,142 documents referencing 24-character hexadecimal ObjectIds (`_id: "6a7ebc6edf85c8fcd46865d6"`). Firebase Authentication issues 28-character alphanumeric UIDs (`auth.uid: "AL8kXy79m..."`). 

If client SDKs query Firestore directly using `request.auth.uid == userId`, all 495 historical covers and 200 drafts will appear empty, resulting in complete historical data invisibility.

### Architectural Comparison

| Dimension | Option A: Express Backend Mediation | Option B: Server-Managed Dual-Key Custom Claims (`token.mongoId`) | Option C: Client-Supplied Identity / Client Migration |
| :--- | :--- | :--- | :--- |
| **How It Works** | Client passes Firebase ID token to Express API. Backend verifies token via Firebase Admin SDK, maps user by email, and queries Firestore using Admin SDK. | On student sign-in, backend Admin SDK inspects verified email / Google sub, resolves MongoDB `_id`, and calls `setCustomUserClaims(uid, { mongoId, role })`. Firestore rules check `auth.token.mongoId`. | Client reads legacy ID from local storage or sends both IDs in request body to claim document. |
| **Migration Complexity** | **Very Low:** Zero schema rewrites on 3,142 migrated documents. No need to update 495 foreign keys in `covers`. | **Low to Moderate:** One backend claim-minting hook on login; client calls `user.getIdToken(true)` once. | **High:** Requires multi-pass batch updates and complex client state handling. |
| **Security & Tamper Resistance** | **Absolute:** Client never interacts directly with Firestore. All authorization is evaluated in trusted Node.js runtime. | **Very High:** Custom claims can only be set by server-side Admin SDK. RS256 token signatures are tamper-proof. Client cannot forge `token.mongoId`. | **Fatal Flaw:** Insecure. Client-supplied IDs allow spoofing and authorization bypass. |
| **Backward Compatibility** | **100% Seamless:** Preserves existing Express API contracts. Zero breaking changes to existing web app frontend. | **High:** Enables direct serverless reads while maintaining legacy relational links. | **Poor:** Fragile transitional state; high probability of broken queries. |
| **Effect on Cover Ownership & History** | All 495 covers remain perfectly mapped and visible through existing API routes. | All 495 covers accessible directly via Firestore rules `token.mongoId == resource.data.userId`. | High risk of orphaned records during cutover. |

### Architectural Recommendation
**Adopt Option A (Express Backend Mediation) for initial cutover and immediate zero-loss stability, transitioning to Option B (Server-Managed Custom Claims) for direct client Firestore access.**

1. **Immediate Zero-Risk Baseline (Option A):**
   - The Express backend handles authentication verification via Firebase Admin SDK (`verifyIdToken`).
   - All 3,142 documents remain keyed by their original canonical MongoDB ObjectIds.
   - The frontend continues to use existing REST endpoints, ensuring zero disruption to live students.
2. **Phase 2 Direct-Access Optimization (Option B):**
   - When student logins are transitioned to Firebase Auth, the backend sync endpoint sets custom claim `{ mongoId: user._id, role: user.role }`.
   - Security rules in `firestore.rules` are already prepared to recognize `request.auth.token.mongoId`:
     ```firestore
     function isOwner(userId) {
       return isSignedIn() && (
         request.auth.uid == userId ||
         ('mongoId' in request.auth.token && request.auth.token.mongoId == userId)
       );
     }
     ```
   - **Critical Rule:** Never trust a client-supplied legacy ID or role without server-side cryptographic claim issuance.

---

## 4. Test Suite Audit & The Missing Dependency Blocker

### Audit of Existing Test Files
1. `scripts/migration/test_official_emulator.mjs` & `scripts/migration/official_emulator_adapter.mjs`:
   - Uses `Authorization: Bearer owner` for root emulator data seeding.
   - Uses handcrafted REST headers `Authorization: Bearer eyJhbGciOiJub25lIn0.<payload>.` to simulate users.
   - **Classification:** **Adapter/Synthetic REST Simulation**, NOT client-grade SDK authorization proof. `Bearer owner` bypasses rules completely, and `alg:none` is an emulator-specific REST shortcut that will fail on real Google Cloud staging.
2. `tests/firestore/firestore.rules.test.mjs`:
   - While it tests rules expressions across 20 scenarios, it communicates via raw HTTP REST with synthetic bearer tokens.

### The Missing Dependency Blocker
To execute client-grade, trustworthy rules tests using official Firebase test contexts:
- **Missing Dependency:** `@firebase/rules-unit-testing` is **NOT installed** in either `backend/package.json` or `frontend/package.json`.
- **Impact:** We cannot invoke `initializeTestEnvironment()`, `authenticatedContext()`, `assertFails()`, or `assertSucceeds()` without this package.
- **Smallest Necessary Change:**
  Install `@firebase/rules-unit-testing` as a `devDependency` in `backend` (or test root):
  ```powershell
  npm install --save-dev @firebase/rules-unit-testing --prefix backend
  ```
  *(Pending user review and explicit approval).*

---

## 5. Trustworthy 12-Point Emulator Test Matrix

The following test suite structure is prepared for execution once `@firebase/rules-unit-testing` is approved. It uses **isolated synthetic fixtures only** (zero backup documents, zero cloud connections):

| # | Test Scenario | Authentication Context | Target Operation | Expected Result | Safety Invariant Tested |
| :-: | :--- | :--- | :--- | :-: | :--- |
| **1** | **Unauthenticated Access Denial** | `unauthenticatedContext()` | `getDoc(doc(db, 'users/student_01'))`<br>`getDoc(doc(db, 'covers/cover_01'))` | `assertFails()` | Protected student collections inaccessible to unauthenticated guests. |
| **2** | **Student Access to Own Profile** | `authenticatedContext('student_01', { email: 's1@ugrad.iiuc.ac.bd', email_verified: true, role: 'STUDENT' })` | `getDoc(doc(db, 'users/student_01'))` | `assertSucceeds()` | Student can access their own permitted profile. |
| **3** | **Cross-Student Read Denial** | `authenticatedContext('student_01', ...)` | `getDoc(doc(db, 'users/student_02'))` | `assertFails()` | Student cannot access another student's protected profile. |
| **4** | **Role Escalation Denial (Create)** | `authenticatedContext('student_01', ...)` | `setDoc(doc(db, 'users/student_01'), { role: 'ADMIN', ... })` | `assertFails()` | Student cannot assign themselves an administrator role. |
| **5** | **Protected Role Mutation Denial (Update)** | `authenticatedContext('student_01', ...)` | `updateDoc(doc(db, 'users/student_01'), { role: 'SUPER_ADMIN' })` | `assertFails()` | Student cannot alter protected role or permissions fields. |
| **6** | **Cover & Draft Ownership Policy** | `authenticatedContext('student_01', ...)` | `setDoc(doc(db, 'covers/cov_01'), { userId: 'student_01', ... })`<br>`updateDoc(..., { userId: 'student_02' })` | Create: `assertSucceeds()`<br>Transfer: `assertFails()` | Student CRUD follows ownership; ownership transfer prohibited. |
| **7** | **Public Catalog Reads Permitted** | `unauthenticatedContext()` | `getDocs(collection(db, 'courses'))`<br>`getDocs(collection(db, 'teachers'))` | `assertSucceeds()` | Public catalog reads work for guest cover generation. |
| **8** | **Unauthorized Catalog Writes Denied** | `authenticatedContext('student_01', ...)` | `setDoc(doc(db, 'courses/new_course'), { ... })` | `assertFails()` | Non-admin clients cannot modify university catalogs. |
| **9** | **Administrator Governance Access** | `authenticatedContext('admin_01', { role: 'SUPER_ADMIN' })` | `getDocs(collection(db, 'adminActivities'))`<br>`setDoc(doc(db, 'courses/cse_101'), { ... })` | `assertSucceeds()` | Administrator operations allowed under trustworthy role claim. |
| **10** | **Identity-Mapping Fail-Closed** | `authenticatedContext('student_01', { /* no mongoId claim */ })` | `getDoc(doc(db, 'users/legacy_mongo_id_123'))` | `assertFails()` | Missing, invalid, or mismatched identity mappings fail closed. |
| **11** | **Default Fallback Deny** | `authenticatedContext('student_01', ...)` | `getDoc(doc(db, 'unlisted_collection/doc_01'))`<br>`getDoc(doc(db, 'users/s1/secret_tokens/tok1'))` | `assertFails()` | Unknown collections and nested subcollections denied by default. |
| **12** | **Batch Write Authorization Defense** | `authenticatedContext('student_01', ...)` | `writeBatch()` writing 1 own cover + 1 unauthorized catalog change | `assertFails()` (Atomic Rollback) | Batch writes cannot bypass intended authorization rules. |

---

## 6. Staging-Only Verification Roadmap

To verify rules safely against Google Cloud Staging (`iiuc-cover-page-staging`):
1. **Approval Gate 1:** User reviews rules audit and identity-mapping design.
2. **Approval Gate 2:** User authorizes installing `@firebase/rules-unit-testing` in `backend` for local SDK-level rules testing.
3. **Execution Gate 3:** Run local emulator unit test suite with 100% pass mark.
4. **Cloud Gate 4 (Optional & Strictly Authorized):**
   - Project owner authenticates Firebase CLI: `firebase login --no-localhost`.
   - Verify active project is strictly `iiuc-cover-page-staging`: `firebase use`.
   - Deploy rules exclusively to staging: `firebase deploy --only firestore:rules --project iiuc-cover-page-staging`.
   - Execute probe script using 1 staging test account (zero backup documents).
