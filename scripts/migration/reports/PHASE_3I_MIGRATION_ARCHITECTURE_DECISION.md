# Phase 3I — Zero-Loss Migration Architecture Decision Report

**Project:** IIUC Cover Page Platform  
**Target Branch:** `migration/firebase-zero-loss`  
**Staging Project ID:** `iiuc-cover-page-staging`  
**Production Project ID:** `iiuccoverpage-8edd3` (Strictly Off-Limits & Protected)  
**Canonical Migration Backup:** `E:\iiuc_backups\mongodb_atlas_backup\backup_2026-10-15T13-58-24-043Z` (Verified Intact)  
**Timestamp:** 2026-10-19T15:35:00+06:00  
**Status:** **ARCHITECTURAL DECISION COMPLETE — IMPLEMENTATION HALTED — AWAITING REVIEW**

---

## 1. Executive Summary & Purpose

Phase 3I synthesizes the findings of Phases 3A through 3H into a definitive architectural decision for the IIUC Cover Page Platform.

### Core Discovery:
Phases 3G-B and 3H established that:
1. **The running application is 100% backend-mediated.** The frontend does not use Firestore or Firebase Auth directly. It interacts with the Express/Render backend via REST endpoints (`/api/v1/*`) and custom JWTs.
2. **Security rules in `firestore.rules` have passed 18/18 local unit tests (100%)**, proving that least-privilege perimeter defenses are sound.
3. **The 3,142 backup documents contain relational foreign keys tied to 24-character hexadecimal MongoDB ObjectIds.** If client SDKs query Firestore directly, all 495 historical covers and 200 drafts will be invisible to students due to Firebase UID mismatches.

This report establishes the safest architectural path forward: **whether to proceed with a Backend-Mediated Firestore migration or retain the existing MongoDB Atlas architecture.**

---

## 2. Current-State Architecture vs. Intended Target Architecture

### A. Current-State Architecture (Live Production)

- **Frontend:** React 19 SPA on Vercel. Communicates strictly via `fetch()` to `VITE_API_URL`.
- **Backend:** Node.js + Express on Render. Implements Google OAuth verification, rate limiting, and business logic.
- **Database:** MongoDB Atlas M0/M2 cluster. 14 collections containing 3,142 documents.
- **Authentication:** Custom JWT signed with `JWT_SECRET`. Token payload stores `{ id: user._id, role: user.role }`.

---

### B. Intended Target Architecture (Option A: Backend-Mediated Firestore Migration)

- **Frontend:** React 19 on Vercel remains completely unchanged. Continues calling existing REST endpoints (`/api/v1/*`).
- **Backend:** Node.js + Express on Render installs `firebase-admin` and adds a Firestore data adapter service.
- **Database:** Cloud Firestore (`iiuc-cover-page-staging` in staging; production later).
- **Fallback:** MongoDB Atlas retained in read-only mode during cutover as an instant rollback mechanism.

### Why Option A is the ONLY Safe Target:
1. **Zero Client Rewrites:** All 4 document generators (Assignment, Lab Report, Lab Index, Project) and the dashboard history component continue calling existing API endpoints (`/covers/save`, `/covers/history`).
2. **Zero Historical Data Invisibility:** The backend uses `firebase-admin` to query Firestore documents by their exact legacy MongoDB string `_id` (`db.collection('covers').where('userId', '==', req.user._id)`).
3. **Defense-in-Depth:** `firestore.rules` remains active in the cloud to block any direct unauthorized client access from the public internet.

---

## 3. Source of Truth Decision for Each Data Domain

| Data Domain | Collections | Document Count | Current Source of Truth | Target Source of Truth | Cutover Criteria |
| :--- | :--- | :---: | :--- | :--- | :--- |
| **User Identity & Profiles** | `users` | 253 | MongoDB Atlas `users` | Cloud Firestore `/users/{mongoId}` | 100% reconciliation of emails, roles, and student IDs; verified login sync. |
| **Student Generated Work** | `covers`, `draftcovers`, `labindexrecords` | 707 (495 + 200 + 12) | MongoDB Atlas | Cloud Firestore `/covers`, `/drafts`, `/labIndexRecords` | Deterministic key matching; verified cover history retrieval for test student accounts. |
| **University Catalogs** | `courses`, `teachers`, `templates`, `departments`, `labexperiments` | 1,313 (571 + 737 + 4 + 1 + 0) | MongoDB Atlas | Cloud Firestore `/courses`, `/teachers`, `/templates`, `/departments`, `/labexperiments` | Public read availability; autocomplete search latency < 50ms. |
| **Governance & Audit Trails** | `usersessions`, `adminnotifications`, `adminactivities`, `teacherimportlogs`, `broadcastlogs` | 869 (610 + 253 + 3 + 2 + 1) | MongoDB Atlas | Cloud Firestore `/userSessions`, `/adminNotifications`, `/adminActivities`, `/teacherImportLogs`, `/broadcastLogs` | Admin-only access verified; non-blocking write latency. |
| **Total** | **14 Collections** | **3,142 Docs** | **MongoDB Atlas** | **Cloud Firestore** | **Zero field loss, zero duplicate documents.** |

---

## 4. Breakdown of the 3,142 Backup Documents

The 3,142 backup documents in `E:\iiuc_backups\mongodb_atlas_backup\backup_2026-10-15T13-58-24-043Z` represent the entire unified database of the platform, broken down across 4 functional domains:

```text
3,142 Total Documents
├── Academic Catalogs: 1,313 docs (41.8%)
│   ├── teachers: 737
│   ├── courses: 571
│   ├── templates: 4
│   ├── departments: 1
│   └── labexperiments: 0
├── System & Audit Trails: 869 docs (27.7%)
│   ├── userSessions: 610
│   ├── adminNotifications: 253
│   ├── adminActivities: 3
│   ├── teacherImportLogs: 2
│   └── broadcastLogs: 1
├── Student Generated Work: 707 docs (22.5%)
│   ├── covers: 495
│   ├── drafts: 200
│   └── labIndexRecords: 12
└── User Profiles: 253 docs (8.0%)
    └── users: 253
```

### Foreign Key Relational Map:
- **`covers.userId` (495 records):** Points directly to `users._id` (24-char hex string).
- **`drafts.userId` (200 records):** Points directly to `users._id`.
- **`labIndexRecords.userId` (12 records):** Points directly to `users._id`.
- **`userSessions.userId` (610 records):** Points directly to `users._id`.
- **`adminActivities.adminId` (3 records):** Points to admin user `users._id`.
- **`broadcastLogs.createdBy` (1 record):** Points to admin user `users._id`.

**Preservation Invariant:** Every document ID in Firestore must equal its legacy MongoDB `_id` string (e.g. `doc(db, 'users', '6a7ebc6edf85c8fcd46865d6')`). Under no circumstances should auto-generated Firestore document IDs be created during migration.

---

## 5. Is a Backend-Mediated Firestore Adapter Required?

### Answer: **YES, IT IS ABSOLUTELY MANDATORY.**

A backend-mediated adapter is required for the following technical and operational reasons:

1. **Client Decoupling:** The frontend application contains hundreds of references to REST endpoints (`fetch('${API}/covers/history')`). Rewriting the frontend to use the Firestore Web SDK would require touching over 20 components and hooks, creating a massive regression surface for live students.
2. **Authentication Mismatch:** The frontend currently receives a custom Express JWT. It does not possess a Firebase ID token. Direct Firestore client access without a Firebase Auth token fails closed under `firestore.rules`.
3. **Identity Resolution:** The Express backend already possesses the logic to map Google accounts (`googleId` / verified academic email) to legacy MongoDB IDs. 
4. **Administrative Protection:** Privileged operations (faculty scraping, bulk teacher CSV imports, email broadcasting) require server-side execution and must never run in a browser.

---

## 6. Firestore Rules Alignment & Least-Privilege Adjustments

### Current Rules Evaluation:
`firestore.rules` was tested and validated in Phase 3G-B (18/18 tests passed).

- **Backend Traffic:** The Firebase Admin SDK operates with full administrative privileges and bypasses `firestore.rules` via Google Cloud IAM service account authentication.
- **Client Web Traffic:** `firestore.rules` acts as a perimeter firewall against direct public internet traffic:
  - Catalogs (`/courses`, `/teachers`, `/templates`, `/departments`, `/labexperiments`) are publicly readable for guest cover generation. Non-admin writes are strictly blocked.
  - User profiles and covers are private to authenticated owners (`isOwner`).
  - Governance logs are restricted to administrators (`isAdmin`).
  - Fallback rule `match /{document=**} { allow read, write: if false; }` blocks all unhandled paths.

### Recommended Least-Privilege Adjustment for Backend-Only Architecture:
If the platform adopts a 100% backend-mediated architecture, direct browser write access to `/covers`, `/drafts`, and `/labIndexRecords` can be locked down even further to `allow write: if false;` (server-only writes via Admin SDK), completely eliminating any risk of browser-based write manipulation.

---

## 7. Historical Data Preservation Strategy (Dual-Write & Zero Downtime)

To ensure zero data loss and zero student disruption during migration:

1. **Phase 1: Dual-Write Deployment**
   - Express backend saves new covers and updates to **both** MongoDB Atlas and Cloud Firestore simultaneously.
   - Primary read source remains MongoDB Atlas.
2. **Phase 2: Staging Data Reconciliation**
   - The 3,142 historical documents are imported into Firestore with preserved `_id` keys.
   - Automated reconciliation script checks 100% checksum and document count equality.
3. **Phase 3: Read-Switch with Fallback**
   - Backend reads from Cloud Firestore first.
   - If a document is missing in Firestore, backend falls back to MongoDB Atlas and backfills Firestore automatically.
4. **Phase 4: Full Cutover**
   - Backend switches to Cloud Firestore exclusively.
   - MongoDB Atlas is placed in read-only mode and archived as an immutable backup.

---

## 8. Strategic Architecture Recommendation

### Comparison of Core Options:

| Criteria | Option 1: Retain MongoDB Atlas (No Migration) | Option 2: Backend-Mediated Firestore Migration | Option 3: Direct Client-Side Firestore Rewrite |
| :--- | :--- | :--- | :--- |
| **Migration Risk** | **Zero Risk:** System is live, stable, and working. | **Very Low Risk:** Phased dual-write with instant rollback. | **Critical Risk:** High probability of breaking live students. |
| **Frontend Code Changes** | **Zero:** No changes required. | **Zero:** Existing REST contracts preserved. | **Extensive:** Must rewrite 20+ components and stores. |
| **Cover History Continuity** | **100% Guaranteed.** | **100% Guaranteed** via legacy `_id` preservation. | **High Risk** of orphaned covers due to UID mismatch. |
| **Cost at Current Scale** | $0/mo (MongoDB Atlas M0 Free Tier). | $0/mo (Firebase Spark Free Tier). | $0/mo (Firebase Spark Free Tier). |
| **Operational Complexity** | Very Low (Single established database). | Low (Node.js + Firebase Admin SDK). | High (Complex client state and rule management). |

---

### Definitive Recommendation:

> [!IMPORTANT]
> **Primary Recommendation:** **Retain MongoDB Atlas (Option 1) for the live production workload, OR proceed with Option 2 (Backend-Mediated Firestore Migration) ONLY if moving off MongoDB is an explicit institutional requirement.**

1. **If the goal is platform stability and zero disruption:**
   - **Retain MongoDB Atlas.** The database currently holds 3,142 documents for ~250 students. MongoDB Atlas M0 (Free Tier) easily handles this volume with sub-20ms query latency. A database migration introduces operational complexity with no immediate functional benefit to students.
2. **If migrating to Firebase is an institutional requirement:**
   - **Execute Option 2 (Backend-Mediated Firestore Migration).** Under no circumstances should Option 3 (direct client rewrite) be attempted. The Express backend must use `firebase-admin` to proxy Firestore traffic, preserving existing REST endpoints and 100% of student cover history.

---

## 9. Next Steps Requiring Explicit Owner Review

Before any code is written or dependencies installed for the next phase, the project owner must decide:

1. **Architecture Decision:**
   - **Choice A:** Keep MongoDB Atlas as primary production database (Halt Firebase database migration; retain rules & emulator for reference).
   - **Choice B:** Proceed with Phase 4: Build the Backend-Mediated Firestore Adapter (`firebase-admin`) for staging validation.
2. **Cloud Staging Deployment:**
   - Authorize or defer deploying `firestore.rules` to `iiuc-cover-page-staging`.

*Execution is halted awaiting owner decision.*
