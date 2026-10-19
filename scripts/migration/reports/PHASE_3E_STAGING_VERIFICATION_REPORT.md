# Phase 3E: Isolated Firebase Cloud Staging Verification & Blocker Report

**Project:** IIUC Cover Page Platform  
**Target Branch:** `migration/firebase-zero-loss`  
**Execution Environment:** Windows Server / PowerShell / Node.js v24.15.0  
**Audit Timestamp:** 2026-10-16T18:35:00+06:00  
**Phase Status:** **HALTED AT REQUIREMENT 3 GATEWAY (BLOCKER DETECTED)**  
**Safety Status:** 100% Zero-Production-Mutation Preserved  

---

## 1. Executive Verdict & Strict Safety Compliance

In accordance with Phase 3E Requirement 3:
> *"First verify the Firebase project configuration and identify a dedicated staging Firebase project. If staging isolation or permissions cannot be confirmed, STOP and report the blocker."*

**Execution has been deliberately and safely halted.** No writes have been dispatched to Google Cloud Firestore or Firebase Authentication.

### Invariants Strictly Preserved:
1. **Live Production Infrastructure Untouched:**
   - Live Vercel frontend: Unchanged.
   - Live Render backend: Unchanged.
   - Production MongoDB Atlas cluster (`iiuc_cover_page`): Completely untouched; zero write operations.
2. **Production Firebase Protection:**
   - Production project `iiuccoverpage-8edd3`: Zero network requests, zero writes, zero credential lookups.
   - Migration engine fail-closed gates remain active and enforced.
3. **Canonical Backup Integrity:**
   - Immutable backup at `E:/iiuc_backups/mongodb_atlas_backup/backup_2026-10-15T13-58-24-043Z` was re-verified via SHA256 checksums (14/14 files match 100%).

---

## 2. Requirement 3 Investigation: Firebase Configuration & Staging Isolation

### A. Current Project Configuration Audit

| Configuration Source | Configured Value | Status / Risk Evaluation |
| :--- | :--- | :--- |
| `.firebaserc` | `"default": "iiuc-cover-page-staging"` | Points to staging alias name. |
| `firebase.json` | Rules: `firestore.rules`, Ports: Firestore 8080, UI 4000 | Configured for local emulation. |
| `frontend/src/config/firebase.js` | `projectId: "iiuccoverpage-8edd3"`, `apiKey: "AIzaSyCZtbOipboeS_8KplHltvgWaFRK2poH71w"` | ⚠️ **HAZARD:** Hardcoded fallback values point directly to the **PRODUCTION** Firebase project if environment variables are not supplied. |
| `frontend/.env` | `VITE_GOOGLE_CLIENT_ID`, `VITE_API_URL` | Contains **NO** `VITE_FIREBASE_*` variables for staging. |
| `backend/.env` | `MONGO_URI`, `JWT_SECRET`, `SMTP_*`, `GOOGLE_CLIENT_ID` | Contains **NO** Firebase Admin SDK credentials. |

### B. Cloud Staging Project Discovery & Authentication Check

1. **CLI Authentication Check:**
   - Command: `.\backend\node_modules\.bin\firebase.cmd projects:list`
   - Output: `Error: Failed to authenticate, have you run firebase login?`
   - Result: The Firebase CLI on this machine is completely unauthenticated.
2. **Configstore Credential Inspection:**
   - Inspected `C:\Users\ASUS\.config\configstore\firebase-tools.json`.
   - Result: Contains only `['motd']`; zero user credentials or OAuth refresh tokens stored.
3. **Environment & Service Account Key Search:**
   - Executed recursive search across environment variables and file directories for `GOOGLE_APPLICATION_CREDENTIALS` and service account JSON keys.
   - Result: Zero credentials found. No service account key exists on the filesystem.
4. **Staging Project Existence:**
   - Because no credentials exist, the existence, provisioning status, Firestore database mode (Native vs. Datastore), and Firebase Auth state of project `iiuc-cover-page-staging` **cannot be confirmed**.

### C. Formal Blocker Determination

> [!CAUTION]
> **BLOCKER IDENTIFIED (REQUIREMENT 3 GATEWAY):**
> 1. There is no active authentication for the Firebase CLI or Google Cloud SDK.
> 2. No staging service account JSON key or staging client API keys (`VITE_FIREBASE_*`) have been provided for `iiuc-cover-page-staging`.
> 3. Cloud staging isolation cannot be cryptographically proven without authenticated access to verify that `iiuc-cover-page-staging` is completely separate from `iiuccoverpage-8edd3`.
> 
> Therefore, per directive Requirement 3, cloud staging execution has **STOPPED**.

---

## 3. Shortest Safe Path to Unblock Phase 3E

To unblock Phase 3E cloud staging without risking production, the following minimal actions are required:

### Action 1: Provide Staging Service Account Credentials
Provide a Google Cloud service account JSON key file for the isolated staging project `iiuc-cover-page-staging` (with `Cloud Datastore User` / `Firebase Admin SDK Administrator Service Agent` role):
- Place the key file securely outside the Git repository (e.g. at `C:\Users\ASUS\.config\firebase\iiuc-cover-page-staging-adminsdk.json`).
- Or export: `$env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\staging-key.json"`.

### Action 2: Provide Staging Web App Configuration
Provide the public Web SDK configuration for `iiuc-cover-page-staging` to populate `frontend/.env.staging`:
```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=iiuc-cover-page-staging.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=iiuc-cover-page-staging
VITE_FIREBASE_STORAGE_BUCKET=iiuc-cover-page-staging.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=1:...
```

### Action 3: Sanitize `frontend/src/config/firebase.js`
Remove the hardcoded production fallback strings from `frontend/src/config/firebase.js` so that unconfigured environments fail closed rather than silently falling back to production `iiuccoverpage-8edd3`.

---

## 4. Verification of Other Phase 3E Requirements (Audit & Readiness)

### A. Requirement 4 & 9: Verified Backup Reconciliation
The backup at `E:/iiuc_backups/mongodb_atlas_backup/backup_2026-10-15T13-58-24-043Z` was audited against canonical manifests:
- **Total Records:** 3,142 documents across 14 collections.
- **Relational Integrity:** 1,321 / 1,321 foreign key links valid (zero orphans).
- **Checksum Match:** 14 / 14 SHA-256 signatures verified.
- **Controlled Import Readiness:** The migration engine (`scripts/migration/migrate.mjs`) is fully prepared with batch chunking (400 documents), automatic retry, deterministic ObjectId preservation, and idempotent upsert logic.

### B. Requirement 5: Real Firebase Authentication vs. Emulator Limitations
- **Emulator Tokens:** `alg: none` tokens and `Bearer owner` root headers are valid **only** on loopback `127.0.0.1:8080`.
- **Cloud Requirement:** Google Cloud Firestore and backend token verification require RS256 JWTs signed by Google (`https://securetoken.google.com/<project-id>`).
- **Test User Provisioning Plan:** Once staging is authenticated, create a test student user (`test.student@ugrad.iiuc.ac.bd`) and a test admin user (`test.admin@ugrad.iiuc.ac.bd`) in the staging Firebase Auth tenant to test genuine token generation and verification.

### C. Requirement 6: Dual-Key Identity Mapping Verification
- **Anti-Hijacking Invariant:** Zero email-only auto-linking.
- **Mapping Structure:**
  * Document ID: Legacy MongoDB ObjectId (24 hex characters).
  * Field: `_identityVerification.googleSubjectId` (numeric Google sub ID).
  * Field: `_identityVerification.requiresDualKeyValidation: true`.
  * Field: `_identityVerification.mappedFirebaseUid: null`.
- **Firestore Security Rules Nuance:**
  Because migrated user document IDs are legacy ObjectIds (`6a7ebc...`) and not Firebase Auth UIDs, client-side rule `isOwner(userId) { return request.auth.uid == userId; }` will deny direct client access unless:
  1. The backend Admin SDK performs the verification and cutover handshake, OR
  2. The custom claims on the token include the `legacyMongoId`, OR
  3. The rule is updated to check:
     `isOwner(userId) { return request.auth.uid == userId || (resource != null && resource.data._identityVerification.mappedFirebaseUid == request.auth.uid); }`

### D. Requirement 7: Application Flow Readiness Audit
1. **Registration / Sign-In:** Current flow uses Google OAuth button calling backend `POST /api/v1/auth/google`. For Firebase staging, flow will exchange Firebase ID token with backend staging endpoint.
2. **Profile Loading:** `GET /api/v1/users/profile` and `GET /api/v1/auth/me` operate on authenticated user context.
3. **Cover Creation & Save:** `POST /api/v1/covers/save` validated with Joi schema.
4. **Draft & History:** `GET /api/v1/covers/history` and `GET /api/v1/drafts`.
5. **PDF / JPG Export:** 100% client-side via `pdfExporter.js` (`html2pdf.js` and `pdf-lib`). Completely database-agnostic.
6. **Role-Based Admin Access:** Enforced via `role` property (`STUDENT`, `ADMIN`, `SUPER_ADMIN`).

### E. Requirement 8: Firestore Security Rules Authorization Review
- `firestore.rules` audited:
  * Public read-only collections: `courses`, `teachers`, `templates`, `departments`, `labexperiments`.
  * Owner-scoped collections: `users`, `covers`, `drafts`, `labIndexRecords`.
  * Admin-restricted collections: `adminActivities`, `adminNotifications`, `broadcastLogs`, `teacherImportLogs`, `userSessions`.
  * Server-side privileged operations bypass rules via Firebase Admin SDK; API middleware enforces RBAC before dispatching Admin SDK mutations.

---

## 5. Rollback & Fail-Safe Procedures

If at any point during Phase 3E staging tests an anomaly occurs:
1. **Production Unaffected:** Production MongoDB Atlas cluster remains online and active.
2. **Immediate Staging Purge:**
   If staging data requires reset, execute:
   `node scripts/migration/purge_staging.mjs --projectId=iiuc-cover-page-staging`
   *(Safety check ensures script never purges `iiuccoverpage-8edd3`)*.
3. **Backend Fallback:**
   The backend relies on `MONGODB_URI`. If staging flags are removed, the backend reverts to MongoDB Atlas in 0ms.

---

## 6. Current Status & Next Actions

| Work Stream | Status | Note |
| :--- | :---: | :--- |
| **Phase 3D Review** | ✅ COMPLETED | Validated on local emulator (43/43 assertions passed). |
| **Backup Integrity** | ✅ COMPLETED | 14/14 SHA-256 files verified (3,142 records). |
| **Migration Engine** | ✅ COMPLETED | Safe chunking, idempotent upserts, fail-closed guards. |
| **Phase 3E Staging Config Audit** | ✅ COMPLETED | Found missing staging credentials & unauthenticated CLI. |
| **Cloud Staging Execution** | ⏸️ **STOPPED** | Awaiting staging credentials / confirmation per Req 3. |
| **Production Cutover** | 🔒 LOCKED | Requires explicit user approval following successful staging. |
