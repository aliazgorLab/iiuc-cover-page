# IIUC Cover Page Platform — Firestore Migration & Identity Architecture

This directory houses the architecture specifications and migration scaffolding for transitioning from MongoDB Atlas to Cloud Firestore & Firebase Authentication with **Zero Data Loss**.

---

## 1. Safety & Non-Destructive Invariants

1. **MongoDB is 100% Read-Only:**  
   The migration tool uses a read-only MongoDB connection (`readPreference: 'secondaryPreferred'`). No write, update, delete, or schema-altering commands are ever permitted.
2. **Default Dry-Run Mode:**  
   Every migration script runs in `--dry-run` mode by default, validating schemas and mapping relationships without committing writes to Firestore.
3. **Resumable & Idempotent:**  
   Every migrated document retains its origin metadata (`legacyMongoId`, `migratedAt`). Re-running the script checks destination existence before writing, avoiding duplicates.
4. **Strict Isolation from Git:**  
   Service account private keys (`serviceAccountKey.json`) and database export archives are explicitly excluded by `.gitignore` and must never be placed within the repository tree.

---

## 2. Secure Identity-Mapping Design (Google OAuth Federation)

### The Risk of Naive Email-Only Matching
All 253 existing production users authenticated via Google OAuth with their institutional email (`*@ugrad.iiuc.ac.bd`). Linking accounts merely by checking `user.email == firestoreUser.email` introduces security risks if an account is registered through an unverified provider or alias.

### Dual-Factor Identity Reconciliation Specification

```
┌───────────────────────────────────────┐       ┌──────────────────────────────────────┐
│        MongoDB Legacy Document        │       │       Firebase Auth / Google         │
├───────────────────────────────────────┤       ├──────────────────────────────────────┤
│ _id: ObjectId("65...")                │       │ uid: "FB_UID_abc123"                 │
│ email: "c233093@ugrad.iiuc.ac.bd"     │       │ email: "c233093@ugrad.iiuc.ac.bd"    │
│ googleId: "109845729182374619283"     │       │ providerData[0].uid: "1098457291..." │
│ role: "STUDENT"                       │       │ emailVerified: true                  │
│ studentId: "C233093"                  │       └──────────────────┬───────────────────┘
└──────────────────┬────────────────────┘                          │
                   │                                               │
                   ▼                                               ▼
         ┌──────────────────────────────────────────────────────────────────┐
         │              Identity Verification Engine (Dual Key)             │
         │  1. Check: googleId === providerData[0].uid                      │
         │  2. Check: email.toLowerCase() === providerEmail.toLowerCase()   │
         │  3. Check: emailVerified === true                                │
         │  4. Check: domain in [@ugrad.iiuc.ac.bd, @iiuc.ac.bd]            │
         └─────────────────────────────────┬────────────────────────────────┘
                                           │
                        ┌──────────────────┴──────────────────┐
                        │ All 4 Checks Pass                   │ Any Mismatch
                        ▼                                     ▼
         ┌───────────────────────────────┐     ┌───────────────────────────────┐
         │     SECURE LINK CONFIRMED     │     │      QUARANTINE CONFLICT      │
         │ Link mongoId <-> firebaseUid  │     │ Flag for Admin Investigation  │
         │ Migrate user profile + covers │     │ Zero writes to production     │
         └───────────────────────────────┘     └───────────────────────────────┘
```

1. **Google Subject ID Matching:**  
   MongoDB stores Google's unique subject identifier as `googleId` (extracted during token verification). Firebase Authentication Google Provider returns Google's immutable subject identifier as `user.providerData[0].uid`.
2. **Domain & Verification Gate:**  
   The email must end in `@ugrad.iiuc.ac.bd`, `@student.iiuc.ac.bd`, or `@iiuc.ac.bd`, and have `emailVerified === true`.
3. **Relationship Preservation:**  
   Each user document in Firestore (`users/{firebaseUid}`) records `legacyMongoId: mongoUser._id`.  
   Each migrated cover in Firestore (`covers/{coverId}`) records:
   - `userId`: `firebaseUid` (enabling immediate query by `request.auth.uid`)
   - `legacyUserId`: `mongoUser._id` (enabling historic audit & rollback verification)

---

## 3. Trusted Server-Side Scaffolding

- **Location:** Dedicated Node.js CLI script (e.g., `scripts/migration/migrate.mjs`).
- **Execution:** Runs in a protected administrative terminal (never in client browser).
- **Credentials:** Uses `FIREBASE_SERVICE_ACCOUNT_KEY` path loaded via external environment variable.
- **Batching:** Operations are chunked in batches of 400 documents (below Firestore's 500-operation transaction limit).
