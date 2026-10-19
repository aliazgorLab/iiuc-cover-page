# Phase 6 — Pre-Deployment Review & Hosting Verification Report

**Document ID:** `PHASE_6_PREDEPLOYMENT_REVIEW`  
**Date:** October 19, 2026  
**Repository:** `iiuc-cover-page`  
**Branch:** `migration/firebase-zero-loss`  
**Environment:** Local Isolated Review (Zero Cloud State Mutations)  
**Final Pre-Deployment Recommendation:** **READY FOR STAGING**

---

## 1. Executive Summary

This Phase 6 Pre-Deployment Review conducts an exhaustive end-to-end verification of the Phase 5 security hardening changes, deployment architecture, and runtime integrations for the IIUC Cover Page Platform.

### Strict Safety Rules Adherence
- **Zero Cloud Deployments:** No deployments were executed to Vercel, Render, Firebase, or any cloud platform.
- **Zero Database Writes:** MongoDB Atlas production cluster remains completely untouched.
- **Zero Configuration Overwrites:** Cloud environment variables and settings remain unaltered.
- **Preservation of User History:** All pre-existing git modifications, migration tools, emulator scripts, and historical backup manifests were preserved intact.
- **Credential Protection:** No tokens, passwords, private keys, or connection strings are exposed in this report.

---

## 2. Complete Git Diff & Regression Analysis

A line-by-line inspection of the Git diff across all modified and untracked files confirms that changes are strictly isolated to security controls and test suites.

| File | Nature of Diff | Regression Risk | Review Finding |
| :--- | :--- | :--- | :--- |
| `backend/src/config/corsConfig.js` | Modular allowlist parser with trailing-slash normalization and safe canonical fallback. | **None** | Handles single, multiple, and trailing-slash URLs; allows headerless requests (health checks). |
| `backend/src/server.js` | Replaced permissive CORS callback with `corsOriginValidator`; conditioned DB and port listening for `NODE_ENV !== 'test'`. | **None** | All routes, middleware ordering, rate limiters, and error handling remain functionally intact. |
| `backend/src/utils/sanitize.js` | Recursive deep-redaction utility with circular reference protection and regex pattern masking. | **None** | Pure utility functions with zero side effects on request execution. |
| `backend/src/utils/logger.js` | Applied `sanitizeString` to messages and `redactSensitiveData` to metadata before console emission. | **None** | Logging interface (`info`, `warn`, `error`, `debug`) signatures preserved identically. |
| `backend/src/middleware/errorHandler.js` | Sanitized error metadata body; mapped CORS errors cleanly to HTTP 403 Forbidden. | **None** | 503 Mongoose buffering and 500 internal server error protections fully preserved. |
| `backend/src/controllers/adminController.js` | Enforced caller role verification (`SUPER_ADMIN`) for status/role modification and bulk query filtering. | **None** | Standard student management operations (`MANAGE_STUDENTS`) for ordinary administrators continue working uninterrupted. |
| `backend/src/controllers/authController.js` | Disabled unverified `jwt.decode` fallback in production; mandated `client.verifyIdToken`. | **None** | Legitimate Google OAuth login via `@ugrad.iiuc.ac.bd`, `@student.iiuc.ac.bd`, and `@iiuc.ac.bd` preserved. |
| `backend/src/middleware/validator.js` | Enforced required Google ID token credential in production mode. | **None** | Prevents malformed or unauthenticated requests from reaching the controller. |
| `backend/package.json` | Added `"test"` and `"test:security"` scripts. | **None** | Non-breaking developer tool addition. |
| `tests/security_hardening.test.mjs` | 36 isolated automated unit and integration tests. | **None** | Standalone test suite with zero impact on production runtime. |

**Regression Finding:** Zero unintended modifications. All cover generators (Assignment V1/V2, Lab Report, Lab Index, Project Cover), layout canvases, SVG/PNG assets, and client-side PDF/JPG export pipelines remain **100% untouched**.

---

## 3. CORS Configuration Review vs. Production Frontend Origin

### 3.1 Production Origin Verification
- **Verified Production Origin:** `https://iiuccoverpage.vercel.app`
- **Evidence:** Verified across all cover template footers (`AssignmentCover.jsx:128`, `LabReportCover.jsx:158`, `LabIndexCover.jsx:153`, `ProjectCover.jsx:207`, `AssignmentCoverV2.jsx:624`), admin broadcast templates, presentation views, and backend service defaults (`emailService.js:129`).

### 3.2 Evaluation of `corsConfig.js`
The implementation in `backend/src/config/corsConfig.js` resolves critical edge cases:
1. **Trailing-Slash Robustness:**  
   If an administrator configures `FRONTEND_URL=https://iiuccoverpage.vercel.app/` on Render, the parser normalizes it via `url.replace(/\/+$/, '')` to `https://iiuccoverpage.vercel.app`, matching standard browser `Origin` headers.
2. **Missing Environment Variable Fallback:**  
   If `FRONTEND_URL` is omitted on Render in production mode, `getAllowedOrigins()` automatically falls back to `https://iiuccoverpage.vercel.app`, preventing an accidental empty allowlist from blocking students.
3. **Multi-Domain Support:**  
   Supports comma-separated domain lists (e.g., `https://iiuccoverpage.vercel.app, https://custom-domain.org`).
4. **Headerless Request Preservation:**  
   Requests lacking an `Origin` header (such as Render health-check pings to `/api/health`, server-to-server calls, or curl diagnostic commands) are permitted via `callback(null, true)`.
5. **Unauthorized Origin Rejection:**  
   Any origin not present in the allowlist (including rogue external origins and local development origins when running in production mode) triggers `callback(new Error("CORS blocked: Origin '<origin>' is not authorized."), false)`.
6. **HTTP 403 Mapping:**  
   `errorHandler.js` catches the CORS rejection and responds with HTTP 403 Forbidden and `{ success: false, message: "CORS blocked: Origin '<origin>' is not authorized." }`.

**Conclusion on CORS Safety:** The current Vercel frontend (`https://iiuccoverpage.vercel.app`) can **safely and reliably communicate** with the Express backend under this configuration.

---

## 4. End-to-End Google OAuth Review

```mermaid
sequenceDiagram
    autonumber
    actor Student as IIUC Student
    participant Vercel as Vercel Frontend (React)
    participant Google as Google Identity Services
    participant Express as Render Backend (Express)
    participant Mongo as MongoDB Atlas

    Student->>Vercel: Clicks "Continue with Google"
    Vercel->>Google: OAuth 2.0 Auth Request (Client ID)
    Google-->>Vercel: Signed Google ID Token (Credential)
    Vercel->>Express: POST /api/v1/auth/google { credential }
    Note over Express: validateGoogleAuthPayload verifies token string presence
    Express->>Google: OAuth2Client.verifyIdToken({ idToken, audience })
    Google-->>Express: Verified Token Payload (sub, email, name, picture)
    Note over Express: Strict check: validateAcademicEmail(email)
    Express->>Mongo: User.findOne({ email })
    alt User does not exist
        Express->>Mongo: User.create({ role: 'STUDENT', emailVerified: true })
    else User exists
        Express->>Mongo: user.save() (Update profile, role unchanged)
    end
    Note over Express: generateTokens() creates 7d JWT & 30d Refresh Token
    Express->>Mongo: Store user.refreshToken
    Express-->>Vercel: HTTP 200 { token, refreshToken, user }
    Vercel-->>Student: Auth State Initialized & Profile Hydrated
```

### Verification Findings
1. **Frontend Submission:** `GoogleLoginButton.jsx` transmits only `credentialResponse.credential` (official Google signed ID token).
2. **Backend Verification:** `authController.js` invokes `client.verifyIdToken({ idToken: credential, audience: process.env.GOOGLE_CLIENT_ID })`. The cryptographic signature, issuer (`accounts.google.com`), and audience are validated by Google's official library.
3. **Unverified Claims Blocked:** In production (`NODE_ENV === 'production'`), unverified `jwt.decode` fallback is **completely disabled**. Unauthenticated `userInfo` objects are rejected with HTTP 400.
4. **Academic Domain Enforcement:** `validateAcademicEmail()` permits only `@ugrad.iiuc.ac.bd`, `@student.iiuc.ac.bd`, and `@iiuc.ac.bd`. Personal Gmail accounts are rejected with HTTP 403.
5. **Token Architecture:**
   - Access token: Signed with `JWT_SECRET`, expires in 7 days (`JWT_EXPIRES_IN`).
   - Refresh token: Signed with `JWT_SECRET`, expires in 30 days, stored in MongoDB for revocation control.
   - Refresh endpoint (`/auth/refresh`) validates signature and database match before rotating tokens.
   - Logout endpoint (`/auth/logout`) nullifies `user.refreshToken` in MongoDB.
   - Protected routes (`middleware/auth.js`) reject `accountStatus === 'SUSPENDED'` and `'BLOCKED'` with HTTP 403.

---

## 5. Admin Authorization & Privilege Escalation Review

1. **SUPER_ADMIN Promotion Protection:**  
   In `updateStudentStatus`, assigning `role: 'SUPER_ADMIN'` requires `(req.user?.role || '').toUpperCase() === 'SUPER_ADMIN'`. Ordinary administrators attempting to escalate any account to `SUPER_ADMIN` receive HTTP 403 Forbidden.
2. **SUPER_ADMIN Modification Protection:**  
   Ordinary administrators cannot modify the `role` or `accountStatus` of an existing `SUPER_ADMIN` account. Attempts are rejected with HTTP 403 Forbidden.
3. **Bulk Operation Isolation:**  
   In `bulkUpdateStudentStatus`, if the caller is not a `SUPER_ADMIN`, the Mongoose query filter automatically injects `{ role: { $ne: 'SUPER_ADMIN' } }`, preventing accidental or malicious batch suspension of super-admin accounts.
4. **Legitimate Administrative Workflows:**  
   Ordinary administrators with `MANAGE_STUDENTS` permission can continue performing legitimate student management (status updates to `ACTIVE`, `SUSPENDED`, `BLOCKED`, role assignment to `STUDENT`, `MODERATOR`, `ADMIN`, student search, and CSV export).

---

## 6. Sensitive Data Redaction & Logging Audit

Automated testing across Suite 2 of `tests/security_hardening.test.mjs` confirms zero credential leakage:

| Sensitive Target | Test Input Example | Sanitized Output | Leakage Status |
| :--- | :--- | :--- | :--- |
| **Plaintext Password** | `{ password: 'SuperSecret2026!' }` | `{ password: '[REDACTED]' }` | **PREVENTED** |
| **Password Hash** | `{ passwordHash: '$2a$10$abc...' }` | `{ passwordHash: '[REDACTED]' }` | **PREVENTED** |
| **Google ID Token / Credential** | `{ credential: 'eyJhbGci...' }` | `{ credential: '[REDACTED]' }` | **PREVENTED** |
| **JWT Access / Refresh Token** | `{ accessToken: 'eyJ...', refreshToken: '...' }` | `{ accessToken: '[REDACTED]', refreshToken: '[REDACTED]' }` | **PREVENTED** |
| **Auth Header / Bearer Token** | `"Authorization: Bearer eyJhbGci..."` | `"Authorization: Bearer [REDACTED_TOKEN]"` | **PREVENTED** |
| **Session Cookie** | `{ cookie: 'session=abc; token=123' }` | `{ cookie: '[REDACTED]' }` | **PREVENTED** |
| **MongoDB Atlas Connection URI** | `"mongodb+srv://admin:DbSecret@cluster.mongodb.net"` | `"mongodb+srv://admin:[REDACTED_PASSWORD]@cluster.mongodb.net"` | **PREVENTED** |
| **Deeply Nested Objects** | `{ a: { b: { secret: 'top-secret' } } }` | `{ a: { b: { secret: '[REDACTED]' } } }` | **PREVENTED** |
| **Circular References** | `obj.self = obj` | `{ self: '[CIRCULAR]' }` | **SAFE (No Crash)** |
| **Error Handler Request Body** | `req.body` containing credentials on `/auth/login` | Logged metadata uses `redactSensitiveData(req.body)` | **PREVENTED** |

---

## 7. Hosting & Deployment Verification

### 7.1 Configured Frontend API Base URL
- **Configuration File:** `frontend/src/config/apiConfig.js`
- **Logic:** Reads `import.meta.env.VITE_API_URL` and ensures standard `/api/v1` path normalization.
- **Local Dev Fallback:** `http://localhost:5000/api/v1`
- **Target Production Endpoint:** Documented in `RENDER_DEPLOYMENT.md` as `https://<render-service-name>.onrender.com/api/v1`.

### 7.2 Hosting Provider Review: Vercel vs. Render
- **Frontend (Vercel):**  
  Configuration verified in `frontend/vercel.json`. Uses standard SPA URL rewrites to `/index.html`.
- **Backend (Render):**  
  - Documented in `RENDER_DEPLOYMENT.md` (Node.js runtime, build: `npm install`, start: `node src/server.js`, health check: `/api/health`).
  - **No `render.yaml`** exists in the repository. Setup relies on manual Render Dashboard configuration.
- **Is Render Strictly Required?**  
  **YES.** The backend is an Express HTTP server with persistent MongoDB connection pools (`mongoose.connect`), memory-windowed rate limiting (`express-rate-limit`), and SMTP connection health verification. It cannot run directly on Vercel static/serverless hosting without a fundamental rewrite into serverless function handlers.
- **Is a Live Render Service Verified?**  
  **UNVERIFIED (Read-Only Safety Constraint).** While the code and documentation are fully prepared for Render deployment, the live operational status, cloud instance tier, and active environment variables of any remote Render service cannot be verified locally without Render Cloud Management credentials. No assumptions of remote cloud uptime are made.

---

## 8. Automated Test Execution Results

All verification tests were executed locally:

```bash
# 1. Backend Security Hardening Test Suite
cd backend
npm test
# Result: 36 Passed | 0 Failed (100% PASS)

# 2. Frontend Staging Isolation & Fail-Closed Gate Suite
cd frontend
npm run test:config
# Result: 24 Passed | 0 Failed (100% PASS)

# 3. Frontend Production Build
cd frontend
npm run build
# Result: Built cleanly in 22.87s (3,046 modules transformed, 0 errors)

# 4. Backend Syntax Verification
node --check backend/src/server.js backend/src/config/corsConfig.js backend/src/utils/sanitize.js backend/src/utils/logger.js backend/src/middleware/errorHandler.js backend/src/middleware/validator.js backend/src/controllers/adminController.js backend/src/controllers/authController.js
# Result: 100% PASS (Zero syntax errors)
```

*(Note: Live browser interaction with production Google identity servers is marked UNVERIFIED in accordance with read-only preservation rules.)*

---

## 9. Preservation of Pre-Existing User Changes

Inspection of `git status` confirms that unrelated historical changes on branch `migration/firebase-zero-loss` remain completely intact:
- Firebase emulator validation scripts (`scripts/migration/official_emulator_adapter.mjs`, `scripts/migration/test_official_emulator.mjs`, `scripts/migration/migrate.mjs`).
- Staging Firebase config rules and tests (`firestore.rules`, `frontend/scripts/validate_firebase_config.test.mjs`).
- Canonical migration backup (`E:\iiuc_backups\mongodb_atlas_backup\backup_2026-10-15T13-58-24-043Z`).
- All Phase 3, Phase 4, and Phase 5 reports.

---

## 10. Remaining Risks & Mitigations

1. **Render Environment Variable Drift:**  
   - *Risk:* If a maintainer configures mismatched `GOOGLE_CLIENT_ID` or `JWT_SECRET` in the Render dashboard, authentication would fail.  
   - *Mitigation:* `validateEnv.js` fails closed during boot if critical environment variables are absent.
2. **First-Time Cold Boot on Render Free Tier:**  
   - *Risk:* Render Free Web Services spin down after 15 minutes of inactivity, causing a ~50-second latency on the first student request.  
   - *Mitigation:* Documented in `RENDER_DEPLOYMENT.md`; Render Starter or Standard instance eliminates cold starts.
3. **Frontend Bundle Size (2.93 MB):**  
   - *Risk:* Heavy PDF and canvas libraries (`jspdf`, `html2canvas`) included in main chunk.  
   - *Mitigation:* Monitored and cached; recommended for code-splitting in the next optimization sprint.

---

## 11. Final Decision & Recommendation

### Recommendation: READY FOR STAGING

The codebase has passed all automated security checks, maintains strict backwards compatibility, preserves 100% of historical MongoDB data, and resolves every vulnerability identified in Phase 4.

### Suggested Staging Verification Steps Prior to Public Release:
1. Push branch `migration/firebase-zero-loss` (or a dedicated staging branch) to the repository.
2. Connect to a staging Render service configured with `NODE_ENV=production` and `FRONTEND_URL=https://iiuccoverpage.vercel.app`.
3. Perform a single live Google OAuth smoke test using an authorized `@ugrad.iiuc.ac.bd` test account.
4. Verify cover generation and PDF download on the live staging environment.
