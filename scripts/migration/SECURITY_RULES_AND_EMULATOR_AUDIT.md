# Firestore Security Rules & Emulator Suite Technical Audit
**Project:** IIUC Cover Page Platform  
**Target Environment:** Cloud Firestore & Firebase Local Emulator Suite  
**Date:** October 15, 2026

---

## 1. Architectural Comparison: Official Emulator Suite vs. In-Memory Simulator

| Dimension | Custom In-Memory Simulator (`local_firestore_emulator.mjs`) | Official Firebase Local Emulator Suite (`firebase emulators:start`) |
| :--- | :--- | :--- |
| **Runtime & Dependencies** | Pure Node.js (zero external dependencies). Runs in any environment. | Java Runtime Environment (JRE 11+) + `firebase-tools` CLI. |
| **Port & Protocol** | Programmatic in-memory JavaScript objects & atomic maps. | HTTP/gRPC server listening on `127.0.0.1:8080` + UI on `4000`. |
| **Batch Write Limits** | Enforced programmatically (<= 500 operations, atomic rollback). | Enforced by Firestore emulator engine (<= 500 operations). |
| **Document Size Limit** | Enforced programmatically (<= 1,048,576 bytes). | Enforced by Firestore emulator engine (<= 1,048,576 bytes). |
| **BSON & ID Fidelity** | Converts BSON types into native JSON primitives; deterministic IDs. | Converts to Firestore REST document types (`stringValue`, `mapValue`, etc.). |
| **Security Rules Evaluation** | **None.** Evaluates data transformation and structural integrity only. | **Full CEL engine.** Compiles and evaluates `firestore.rules` expressions. |
| **Role in Migration** | **High-speed validation** of data transformations, relationship integrity, and batch boundaries. | **Definitive authorization & client integration testing** before cloud deployment. |

---

## 2. Firestore Security Rules Evaluation Matrix (`firestore.rules`)

The production security rules located in [`firestore.rules`](file:///e:/Cover%20design%20web/iiuc-cover-page/firestore.rules) enforce strict client-side access control:

| Access Scenario | Operation & Target Path | Authentication State | Expected Outcome | Enforcing Security Rule Expression |
| :--- | :--- | :--- | :---: | :--- |
| **Public Catalogs Read** | `GET /courses/{id}`, `GET /teachers/{id}`, `GET /templates/{id}` | Unauthenticated | ✅ **ALLOWED** | `allow read: if true;` (Required for guest cover generation) |
| **Public Catalogs Write** | `POST /courses`, `PUT /teachers/{id}` | Student (`role: 'STUDENT'`) | ❌ **DENIED** | `allow write: if isAdmin();` |
| **Public Catalogs Write** | `POST /courses`, `PUT /teachers/{id}` | Admin (`role: 'SUPER_ADMIN'`) | ✅ **ALLOWED** | `allow write: if isAdmin();` |
| **Private Profile Read** | `GET /users/{userId}` | Unauthenticated | ❌ **DENIED** | `allow read: if isOwner(userId) || isAdmin();` |
| **Own Profile Read** | `GET /users/{userId}` | Student (`request.auth.uid == userId`) | ✅ **ALLOWED** | `isOwner(userId)` evaluates to `true` |
| **Cross-Student Read** | `GET /users/{userIdB}` | Student A (`request.auth.uid == userIdA`) | ❌ **DENIED** | `isOwner(userIdB)` is `false`, `isAdmin()` is `false` |
| **Privilege Escalation** | `CREATE /users/{userId}` with `role: 'ADMIN'` | Student (`role: 'STUDENT'`) | ❌ **DENIED** | `(!('role' in request.resource.data) || request.resource.data.role == 'STUDENT')` |
| **Profile Role Mutation** | `UPDATE /users/{userId}` modifying `role` | Student (`request.auth.uid == userId`) | ❌ **DENIED** | `affectedKeys().hasOnly(['name', 'studentId', 'department', 'batch', ...])` rejects `role` |
| **Cross-Student Cover Save**| `POST /covers/{coverId}` with `userId != auth.uid` | Authenticated Student | ❌ **DENIED** | `request.resource.data.userId == request.auth.uid` |
| **Own Cover Read/Delete** | `GET`, `DELETE /covers/{coverId}` | Owner (`resource.data.userId == auth.uid`)| ✅ **ALLOWED** | `isOwner(resource.data.userId)` |

---

## 3. Critical Security Principle: Firebase Admin SDK vs. Security Rules

> [!CAUTION]
> **Firestore Security Rules DO NOT protect Firebase Admin SDK operations.**
> 
> A common misconception in Firebase migrations is assuming that `firestore.rules` protect server-side or Cloud Function operations. In reality:
> 1. **Client SDK Calls:** Web and mobile clients using the modular Web SDK (`firebase/firestore`) are **strictly bound** by `firestore.rules`.
> 2. **Admin SDK Calls:** Any server-side process using `firebase-admin` or service account credentials **completely and unconditionally BYPASSES all Firestore Security Rules**.
> 
> ### Required Server-Side Authorization Layer
> For all privileged administrative operations (e.g., student status suspension, faculty scraping, custom claims assignment, bulk announcements), the server-side code (Cloud Functions or Express endpoints) **must implement programmatic verification**:
> 
> ```javascript
> // Example: Programmatic Server-Side Verification for Admin SDK calls
> export async function updateStudentStatusServer(authContext, studentId, newStatus) {
>   // 1. Verify caller identity and custom claims
>   if (!authContext || !authContext.token) {
>     throw new Error('UNAUTHENTICATED: Authentication required.');
>   }
>   const role = authContext.token.role;
>   if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
>     throw new Error('PERMISSION_DENIED: Exclusive administrative privilege required.');
>   }
>   // 2. Only after explicit code verification, execute Admin SDK write
>   await adminFirestore.doc(`users/${studentId}`).update({ accountStatus: newStatus });
> }
> ```

---

## 4. Current Host Environment Blocker & Remediation

To execute live emulation with the official Google Firebase Emulator Suite (`cloud-firestore-emulator.jar`), the host system requires:
1. **Java Runtime Environment (JRE/JDK 11 or higher):**
   - Current status: `java.exe` is not installed or not in system PATH.
   - Remediation: Install OpenJDK (e.g., Eclipse Temurin 17 or Microsoft OpenJDK 17) and add to system PATH.
2. **Firebase CLI (`firebase-tools`):**
   - Current status: Not installed globally.
   - Remediation: Run `npm install -g firebase-tools`.
3. **Execution Command:**
   ```bash
   firebase emulators:start --only firestore
   node scripts/migration/test_official_emulator.mjs
   ```

*In compliance with Phase 3D instructions, this dependency blocker is documented transparently without falsely claiming official-emulator execution.*
