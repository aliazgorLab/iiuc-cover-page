# IIUC Academic Document Platform — REST API Documentation

**Base URL:** `http://localhost:5000/api/v1`
**Version:** 1.0.0
**Security:** JWT Bearer Token + Refresh Token Architecture
**Rate Limits:** Auth endpoints — 30 req/15min | All API — 300 req/15min per IP

---

## Table of Contents

1. [Standard Response Format](#standard-response-format)
2. [Authentication APIs](#authentication-apis)
3. [User APIs](#user-apis)
4. [Cover APIs](#cover-apis)
5. [Template APIs](#template-apis)
6. [Admin APIs](#admin-apis)
7. [Error Codes](#error-codes)
8. [Environment Variables](#environment-variables)
9. [MongoDB Indexes](#mongodb-indexes)

---

## Standard Response Format

**Success:**
```json
{ "success": true, "message": "...", "data": { ... } }
```

**Error:**
```json
{ "success": false, "message": "...", "errors": "stack (dev only)" }
```

---

## Authentication APIs

### POST /auth/google

Authenticate via Google OAuth 2.0 ID Token. Enforces IIUC academic email domain policy.

**Rate Limit:** 30 req / 15 min per IP

**Request Body:**
```json
{ "credential": "eyJhbGciOiJSUzI1NiIsInR..." }
```

**Allowed Domains:** @ugrad.iiuc.ac.bd | @student.iiuc.ac.bd | @iiuc.ac.bd

**Response 200:**
```json
{
  "token": "<access_jwt>",
  "refreshToken": "<refresh_jwt>",
  "user": {
    "id": "64a1f2b3...",
    "name": "Ali Azgor",
    "email": "c233093@ugrad.iiuc.ac.bd",
    "studentId": "C233093",
    "department": "Dept. of Computer Science & Engineering",
    "avatar": "https://...",
    "role": "STUDENT",
    "provider": "google"
  }
}
```

**Errors:** 400 (missing email) | 403 (non-IIUC domain) | 429 (rate limit)

---

### POST /auth/refresh

Exchange refresh token for a new access + refresh token pair.

**Request Body:** `{ "refreshToken": "<token>" }`

**Response 200:** `{ "token": "...", "refreshToken": "..." }`

**Errors:** 400 (missing token) | 401 (invalid/expired)

---

### POST /auth/logout

Invalidates refresh token. Requires Bearer token.

**Response 200:** `{ "success": true, "message": "Logged out successfully" }`

---

### POST /auth/register

Register with email + password (IIUC academic email required).

**Request Body:**
```json
{
  "name": "Ali Azgor",
  "email": "c233093@ugrad.iiuc.ac.bd",
  "password": "securepassword123",
  "studentId": "C233093",
  "department": "Dept. of CSE"
}
```

**Response 201:** `{ "message": "Account registered successfully.", "userId": "..." }`

---

## User APIs

All endpoints require: `Authorization: Bearer <access_token>`

---

### GET /users/profile

Retrieve authenticated student profile.

**Response 200:**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "_id": "64a1f2b3...",
    "name": "Ali Azgor",
    "email": "c233093@ugrad.iiuc.ac.bd",
    "studentId": "C233093",
    "department": "Dept. of Computer Science & Engineering",
    "batch": "27",
    "semester": "7th",
    "section": "A",
    "avatar": "https://...",
    "role": "STUDENT",
    "provider": "google",
    "emailVerified": true,
    "createdAt": "2026-01-15T10:00:00.000Z"
  }
}
```

---

### PUT /users/profile

Update academic profile. Google identity fields (email, googleId, provider) are immutable.

**Validation:** name (required) | studentId (required) | department (required)

**Request Body:**
```json
{
  "name": "Ali Azgor Hossain",
  "studentId": "C233093",
  "department": "Dept. of Computer Science & Engineering",
  "batch": "27",
  "semester": "7th",
  "section": "A"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": { "id": "...", "name": "...", "email": "...", "studentId": "...", ... }
}
```

---

## Cover APIs

Save / history endpoints require: `Authorization: Bearer <access_token>`

---

### POST /covers/save

Save structured cover data to cloud history.

**Request Body:**
```json
{
  "coverType": "ASSIGNMENT",
  "templateId": "iiuc-official-assignment",
  "coverData": {
    "courseName": "Software Engineering",
    "courseCode": "CSE421",
    "teacherName": "Dr. Mohammad Ali",
    "topicTitle": "Design Patterns Analysis",
    "submissionDate": "2026-09-15",
    "studentId": "C233093",
    "studentName": "Ali Azgor",
    "semester": "7th",
    "section": "A",
    "department": "Dept. of CSE",
    "batch": "27"
  }
}
```

**Valid coverType:** ASSIGNMENT | LAB_REPORT | LAB_INDEX | PROJECT

**Response 201:**
```json
{
  "success": true,
  "message": "Cover page saved to cloud history successfully!",
  "data": { "_id": "...", "userId": "...", "coverType": "ASSIGNMENT", "coverData": {...}, "createdAt": "..." }
}
```

---

### GET /covers/history

Retrieve all saved covers for the authenticated student (sorted newest first).

**Response 200:**
```json
{
  "success": true,
  "message": "Cover history retrieved successfully",
  "data": [ { "_id": "...", "coverType": "ASSIGNMENT", "coverData": {...}, "createdAt": "..." } ]
}
```

---

### GET /covers/:id

Retrieve a specific saved cover (must belong to authenticated user).

**Errors:** 404 (not found)

---

### DELETE /covers/:id

Permanently delete a saved cover (must belong to authenticated user).

**Response 200:** `{ "success": true, "message": "Cover removed from cloud history successfully." }`

**Errors:** 404 (not found or unauthorized)

---

## Template APIs

Listing is public. Creation requires admin token.

---

### GET /templates

Retrieve all ACTIVE templates. Auto-seeds default IIUC templates if collection is empty.

**Auth:** None (public)

**Response 200:**
```json
{
  "success": true,
  "message": "Templates retrieved successfully",
  "data": [
    {
      "_id": "64d2a1b3...",
      "name": "Official IIUC Assignment Cover",
      "slug": "iiuc-official-assignment",
      "type": "ASSIGNMENT",
      "department": "All Departments",
      "university": "IIUC",
      "status": "ACTIVE",
      "isDefault": true
    }
  ]
}
```

---

### GET /templates/:id

Retrieve a specific template by MongoDB ID. **Auth:** None.

**Errors:** 404 (not found)

---

### POST /templates

Create a new template. **Auth:** Admin token required.

**Request Body:**
```json
{
  "name": "Custom Department Cover",
  "slug": "custom-dept-cover",
  "type": "ASSIGNMENT",
  "description": "...",
  "department": "Dept. of EEE",
  "university": "IIUC",
  "status": "ACTIVE",
  "isDefault": false,
  "configuration": {}
}
```

---

## Admin APIs

All admin endpoints require `Authorization: Bearer <token>` with role ADMIN or SUPER_ADMIN.

---

### GET /admin/dashboard-stats

Aggregate institutional statistics.

**Response 200:**
```json
{
  "success": true,
  "message": "Admin dashboard stats retrieved",
  "data": {
    "totalStudents": 1248,
    "totalAdmins": 3,
    "totalTemplates": 4,
    "totalCovers": 892,
    "totalDepartments": 8
  }
}
```

---

### GET /admin/users

Paginated user directory with optional filters.

**Query Params:**
- `role` — STUDENT | ADMIN | SUPER_ADMIN
- `department` — department name
- `search` — searches name, email, studentId
- `page` — page number (default: 1)
- `limit` — results per page (default: 50)

**Response 200:**
```json
{
  "success": true,
  "data": { "users": [...], "total": 1248, "page": 1, "limit": 50 }
}
```

---

### GET /admin/templates

All templates including DRAFT and ARCHIVED.

**Query Params:** `status` | `type`

---

## Error Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Resource created |
| 400 | Bad request / validation failure |
| 401 | Unauthorized / expired JWT |
| 403 | Forbidden / non-IIUC domain |
| 404 | Resource not found |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| MONGO_URI | YES | MongoDB Atlas connection string |
| JWT_SECRET | YES | JWT signing secret |
| GOOGLE_CLIENT_ID | YES | Google OAuth 2.0 Client ID |
| PORT | No | Server port (default: 5000) |
| NODE_ENV | No | development or production |
| JWT_EXPIRES_IN | No | Access token TTL (default: 7d) |
| FRONTEND_URL | No | CORS allowed origin |

---

## MongoDB Indexes

### User Collection
| Field | Type | Purpose |
|-------|------|---------|
| email | Unique | Auth lookup |
| studentId | Standard | Student search |
| department | Standard | Dept filtering |
| role | Standard | Role queries |
| createdAt | Descending | Pagination |

### Cover Collection
| Field | Type | Purpose |
|-------|------|---------|
| userId | Standard | User history |
| coverType | Standard | Type filter |
| createdAt | Descending | Sorting |
| (userId, createdAt) | Compound | Optimized history per user |

### Template Collection
| Field | Type | Purpose |
|-------|------|---------|
| slug | Unique | Slug lookup |
| status | Standard | Active filter |
| type | Standard | Type filter |
| university | Standard | Multi-university |
| (isDefault, createdAt) | Compound | Default-first sort |
