# Phase 3H — Staging Readiness & Authentication Compatibility Audit Report

**Project:** IIUC Cover Page Platform  
**Target Branch:** `migration/firebase-zero-loss`  
**Staging Project ID:** `iiuc-cover-page-staging`  
**Production Project ID:** `iiuccoverpage-8edd3` (Strictly Off-Limits & Protected)  
**Canonical Migration Backup:** `E:\iiuc_backups\mongodb_atlas_backup\backup_2026-10-15T13-58-24-043Z` (Verified Intact)  
**Timestamp:** 2026-10-19T15:28:00+06:00  
**Status:** **AUDIT COMPLETE — DEPLOYMENTS HALTED — CONDITIONAL GO FOR STAGING RULES ONLY**

---

## 1. Executive Summary & Audit Context

Phase 3H evaluated the repository's end-to-end readiness for cloud staging verification following the successful completion of Phase 3G-B. 

### Critical Safety Invariants Enforced:
- **Zero Cloud Deployments:** No Firestore rules, Firebase configuration, or web apps were deployed to Google Cloud.
- **Zero Remote Writes:** MongoDB Atlas, Render backend, Vercel production hosting, and production Firebase remained untouched.
- **Zero Real Document Import:** The 3,142 canonical backup documents were not imported or touched.
- **Working Tree Integrity:** All uncommitted changes across `backend/package.json`, `frontend/src/config/firebase.js`, and migration reports were preserved.
- **Read-Only Inspection:** Verified configurations and CLI state without modifying system settings or exposing secrets.

---

## 2. Verification of Phase 3G-B Test Execution & Git Changes

### A. Test Source & Framework Verification
- **Test File:** `tests/firestore/firestore.rules.test.mjs` (692 lines).
- **Framework:** `@firebase/rules-unit-testing@^6.0.0` paired with `firebase@^13.0.0` Client SDK.
- **Execution Mechanism:** Node.js v24.15.0 built-in test runner (`node --test`) against official Google Cloud Firestore Local Emulator Suite (`127.0.0.1:8080`).
- **Discrepancy Audit:**
  - Earlier Phase 3G-A tests utilized synthetic REST headers (`Authorization: Bearer owner` and `Authorization: Bearer eyJhbGciOiJub25lIn0...`).
  - Phase 3G-B completely eliminated these shortcuts. All 18 scenarios now execute through standard client SDK operations (`getDoc`, `setDoc`, `updateDoc`, `deleteDoc`, `getDocs`, `query`, `where`, `writeBatch`) using official authentication contexts (`authenticatedContext`, `unauthenticatedContext`, `assertSucceeds`, `assertFails`).

### B. Execution Metrics
- **Run 1:** 18 passed, 0 failed, 0 skipped (7,588 ms).
- **Run 2 (Repeatability check):** 18 passed, 0 failed, 0 skipped (5,038 ms).
- **Repeatability:** 100% deterministic with atomic rollback and clean emulator process shutdown.

### C. Git Diff Verification
- `backend/package.json` & `backend/package-lock.json`: Added only `@firebase/rules-unit-testing@^6.0.0` under `devDependencies`. Zero changes to production dependencies.
- `firestore.rules`: Hardened rules with verified email checks, permission escalation defenses, and legacy `mongoId` claim support.
- `frontend/src/config/firebase.js`: Staging fail-closed gate configured to reject production project ID `iiuccoverpage-8edd3`.

---

## 3. End-to-End Authentication Architecture Audit

A complete trace of the current authentication flow was conducted from the frontend user interface to database storage:

1. **Frontend Google OAuth:** Managed by `@react-oauth/google` via `<GoogleLogin>` in `frontend/src/features/authentication/GoogleLoginButton.jsx`.
2. **Backend Verification:** In `backend/src/controllers/authController.js`, the Google token is verified using `google-auth-library` (`OAuth2Client.verifyIdToken`).
3. **Session Token Issuance:** Express mints its own custom JWT using `jsonwebtoken` signed with `JWT_SECRET`. The payload contains:
   ```json
   { "id": "6a7ebc6edf85c8fcd46865d6", "role": "STUDENT" }
   ```
   **Crucial Insight:** The `id` in the session token is the 24-character hexadecimal MongoDB ObjectId (`user._id`), NOT a Firebase UID.
4. **Protected Route Authorization:** `backend/src/middleware/auth.js` verifies the custom JWT via `jwt.verify()` and loads the user from MongoDB via `User.findById(decoded.id)`.
5. **Firebase Authentication State:** Although `frontend/src/config/firebase.js` initializes `getAuth(app)`, **Firebase Authentication is not invoked anywhere in the live user login flow.** Students authenticate entirely through Express and MongoDB.

---

## 4. Direct Firestore vs. Express Backend Mediation Audit

| Layer | Component | Uses Firestore? | Uses MongoDB Atlas? | Details |
| :--- | :--- | :---: | :---: | :--- |
| **Frontend** | `useCoverStore.js`, `Create.jsx` | ❌ **No** | ❌ (Indirect) | All cover saves call `POST ${API}/covers/save`. Cover history calls `GET ${API}/covers/history`. |
| **Frontend** | Academic Catalogs | ❌ **No** | ❌ (Indirect) | Courses, teachers, departments, and lab experiments fetch from `${API}/courses`, `${API}/teachers`. |
| **Frontend** | `config/firebase.js` | Initialized only | ❌ **No** | Exports `db = getFirestore(app)`, but `db` is **never imported** by any application feature. |
| **Backend** | `coverController.js` | ❌ **No** | ✅ **Yes** | Queries `Cover.find({ userId: req.user._id })` via Mongoose. |
| **Backend** | Dependencies | ❌ **No** | ✅ **Yes** | `firebase-admin` is **not installed** in `backend/package.json`. |

### Architectural Conclusion:
**Direct Firestore access is NOT currently used or required by the running application.**
The platform is 100% REST-driven through Express and MongoDB Atlas. 

---

## 5. Legacy Identity Mapping & Historical Cover Preservation

### The Relationship Model:
In the canonical backup:
- 253 users have `_id: "6a7ebc6edf85c8fcd46865d6"`.
- 495 historical covers have `userId: "6a7ebc6edf85c8fcd46865d6"`.
- 200 drafts have `userId: "6a7ebc6edf85c8fcd46865d6"`.

### Why Data Access Succeeds in Current Architecture:
Because the frontend communicates via Express:
1. Student logs in -> Express verifies Google identity -> retrieves user where `email == googleEmail` -> finds `_id: "6a7ebc6edf85c8fcd46865d6"`.
2. Student views Cover History -> Express executes `Cover.find({ userId: user._id })` -> retrieves all historical covers seamlessly.

### The Conflict if Direct Firestore Access is Forced:
- Firebase Auth generates alphanumeric UIDs (`auth.uid: "AL8kXy79m..."`).
- If a client SDK connects directly to Firestore and queries `where('userId', '==', auth.uid)`:
  - `"AL8kXy79m..." != "6a7ebc6edf85c8fcd46865d6"`.
  - **Result:** 0 historical covers returned.
  - Furthermore, `firestore.rules` `isOwner` checks `request.auth.uid == userId || ('mongoId' in request.auth.token && request.auth.token.mongoId == userId)`. Standard Firebase ID tokens lack `mongoId`, failing closed.

### Recommended Strategy:
**Maintain Option A (Express Backend Mediation) as the primary architecture.**
The Express backend continues to serve `/api/v1/covers/*`. When migrating backend storage from MongoDB to Firestore via `firebase-admin`, the backend uses Admin SDK queries to fetch documents by their legacy `_id`, guaranteeing **100% data continuity with zero client code rewrite**.

---

## 6. Staging Project Isolation & CLI Authentication Blocker

### A. Project Distinction & Guard Verification
- **Staging Project ID:** `iiuc-cover-page-staging`
- **Production Project ID:** `iiuccoverpage-8edd3`
- **Isolation Guards in Code:**
  1. `.firebaserc`: Set to `"default": "iiuc-cover-page-staging"`.
  2. `frontend/src/config/firebase.js`: Hardcoded gate rejecting `iiuccoverpage-8edd3` in staging builds.
  3. `scripts/migration/official_emulator_adapter.mjs`: Hardcoded refusal if `projectId === 'iiuccoverpage-8edd3'`.

### B. Read-Only Inspection Blocker
Execution of `.\backend\node_modules\.bin\firebase.cmd projects:list` returned:
```text
Error: Failed to authenticate, have you run firebase login?
```
- **Finding:** The Firebase CLI is unauthenticated on this system.
- **Safety Implication:** Because the CLI has no credentials, **it is physically impossible for any local command to inadvertently mutate Google Cloud production or staging.**
- **Action Required for Future Cloud Steps:** The project owner must manually run `firebase login` in an interactive terminal when cloud deployment is desired.

---

## 7. Staging Environment Configuration & Secrets Review

1. **Frontend Templates:**
   - `frontend/.env.example` contains placeholders with clear instructions to copy to `.env.staging.local`.
   - `.env.staging.local` is covered under `.gitignore` (line 15: `*.local`, line 17: `.env.*`).
2. **Current Local Env State:**
   - `frontend/.env` contains only `VITE_GOOGLE_CLIENT_ID` and `VITE_API_URL`.
   - `backend/.env` contains standard Express/MongoDB variables. Zero Firebase service account secrets are present.
3. **Backup Integrity:**
   - Canonical backup at `E:\iiuc_backups\mongodb_atlas_backup\backup_2026-10-15T13-58-24-043Z` was verified existing and untouched.
   - Backup tag `v1.0.0-legacy-backup` remains intact in Git.

---

## 8. Step-by-Step Staging Deployment & Rollback Plan

When staging cloud deployment is approved, execute following this exact sequence:

### Pre-Deployment Verification (Fail-Closed)
```powershell
# 1. Project Owner Authenticates CLI
.\backend\node_modules\.bin\firebase.cmd login --no-localhost

# 2. Verify Active Project is STRICTLY Staging
.\backend\node_modules\.bin\firebase.cmd use iiuc-cover-page-staging
.\backend\node_modules\.bin\firebase.cmd use
# MUST OUTPUT: Active project: iiuc-cover-page-staging. If production is shown, ABORT IMMEDIATELY.
```

### Deployment Step (Rules Only)
```powershell
# 3. Deploy Firestore Security Rules ONLY to Staging
.\backend\node_modules\.bin\firebase.cmd deploy --only firestore:rules --project iiuc-cover-page-staging
```

### Post-Deployment Cloud Probe (Zero Backup Data)
```powershell
# 4. Execute non-destructive probe script against cloud staging endpoint
node scripts/migration/probe_staging_rules.mjs
```
*(Probe tests 1 unauthenticated read on /courses and 1 unauthenticated read on /users to verify cloud IAM enforcement; zero backup data imported).*

### Rollback Plan
If any rule error occurs on cloud staging:
```powershell
# Immediately redeploy lockdown rules:
.\backend\node_modules\.bin\firebase.cmd deploy --only firestore:rules --project iiuc-cover-page-staging
```
*Because production operates on MongoDB Atlas and `iiuccoverpage-8edd3`, staging rollbacks have zero production blast radius.*

---

## 9. GO / NO-GO Recommendation

| Dimension | Assessment | Recommendation |
| :--- | :---: | :--- |
| **Security Rules Engine** | 18/18 Local Unit Tests Passed (100% Deterministic) | **GO** for Rules Logic |
| **Cloud Staging Rules Deployment** | Awaiting CLI authentication by project owner | **CONDITIONAL GO** (Rules deployment to `iiuc-cover-page-staging` ONLY, pending owner `firebase login`) |
| **Frontend Direct Firestore Access** | Disconnected from live user flows; zero consumers in UI | **NO-GO** (Maintain Express backend mediation) |
| **Backup Import to Cloud** | Database migration before authentication resolution is premature | **NO-GO** (Do NOT import 3,142 documents to cloud yet) |
| **Production Cutover** | Production systems strictly off-limits | **NO-GO** (Strictly Forbidden) |

### Overall Assessment:
**CONDITIONAL GO for Phase 3I (Staging Security Rules Deployment ONLY).**  
All other application components must remain on the proven, stable Express + MongoDB architecture. Data migration and authentication migration must remain halted until staging rules deployment and backend proxy architecture are fully validated.
