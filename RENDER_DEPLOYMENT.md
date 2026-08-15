# Production Deployment Guide — Render & Vercel
## IIUC Cover Page Generator & Student Portal

This guide provides step-by-step instructions for deploying the **IIUC Cover Page Platform** backend to **Render Web Service**, connecting to **MongoDB Atlas**, and linking to the **Vercel** frontend.

---

## 1. System Architecture Overview

- **Frontend**: React + Vite (Deployed on Vercel)
- **Backend**: Node.js + Express (Deploying on Render)
- **Database**: MongoDB Atlas (Cloud Cluster, Database: `iiuc_cover_page`)
- **Authentication**: JWT & Google OAuth 2.0

---

## 2. MongoDB Atlas Configuration

1. **Database Name**: Ensure your Atlas cluster contains or creates the database `iiuc_cover_page`.
2. **Network Access (IP Whitelist)**:
   - Go to **MongoDB Atlas** -> **Network Access** -> **Add IP Address**.
   - Select **Allow Access From Anywhere** (`0.0.0.0/0`). This is required because Render assigns dynamic IP addresses to web services.
3. **Database User Credentials**:
   - Go to **Database Access** -> Ensure a database user exists with read/write permissions to `iiuc_cover_page`.
   - Copy your MongoDB Connection String:
     ```
     mongodb+srv://<username>:<password>@<cluster-url>.mongodb.net/iiuc_cover_page?retryWrites=true&w=majority
     ```

---

## 3. Render Backend Web Service Deployment

### Step A: Create Render Web Service
1. Log in to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository (`iiuc-cover-page`).

### Step B: Service Settings
- **Name**: `iiuc-cover-page-backend` (or custom name)
- **Region**: Choose region closest to your users or MongoDB cluster (e.g., Singapore / Oregon)
- **Branch**: `main` (or production branch)
- **Root Directory**: `backend`
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start` (Executes `node src/server.js`)
- **Instance Type**: Free / Starter / Standard

### Step C: Health Check Path
- **Health Check Path**: `/api/health`
- Render will poll this endpoint to verify deployment status. Expected response:
  ```json
  {
    "status": "OK",
    "environment": "production",
    "database": "connected"
  }
  ```

### Step D: Environment Variables on Render
Under the **Environment** tab, add the following key-value pairs:

| Key | Example Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enables production optimizations & logs |
| `PORT` | `5000` | Internal server port (Render auto-routes HTTP/HTTPS) |
| `MONGODB_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/iiuc_cover_page` | MongoDB Atlas SRV URI |
| `JWT_SECRET` | `your_production_super_secret_jwt_key` | Secret key for signing authentication tokens |
| `JWT_EXPIRES_IN` | `7d` | Token validity duration |
| `GOOGLE_CLIENT_ID` | `123456-abc.apps.googleusercontent.com` | Google OAuth 2.0 Client ID |
| `GOOGLE_CLIENT_SECRET` | `GOCSPX-your_google_client_secret` | Google OAuth 2.0 Client Secret |
| `FRONTEND_URL` | `https://your-vercel-domain.vercel.app` | Production frontend domain for CORS security |

---

## 4. Google OAuth 2.0 Production Setup

1. Open [Google Cloud Console](https://console.cloud.google.com/).
2. Navigate to **APIs & Services** -> **Credentials**.
3. Select your **OAuth 2.0 Client ID**.
4. **Authorized JavaScript origins**:
   - Add: `https://your-vercel-domain.vercel.app`
5. **Authorized redirect URIs**:
   - Add: `https://your-render-backend-url.onrender.com/api/v1/auth/google/callback`
6. Save changes.

---

## 5. Vercel Frontend Configuration

In your Vercel Dashboard for `iiuc-cover-page` (Frontend):

1. Go to **Settings** -> **Environment Variables**.
2. Add / Update the following variables:
   - `VITE_API_URL`: `https://your-render-backend-url.onrender.com/api/v1`
   - `VITE_GOOGLE_CLIENT_ID`: `your_google_client_id.apps.googleusercontent.com`
3. Trigger a redeploy on Vercel to rebuild the production bundle with the new API endpoint URL.

---

## 6. Local Production Test Verification

To verify the backend locally before deploying to Render:

```bash
cd backend
npm install
$env:NODE_ENV="production"; $env:MONGODB_URI="<your-atlas-uri>"; $env:JWT_SECRET="test"; $env:GOOGLE_CLIENT_ID="test"; npm start
```

Verify the endpoint with curl / browser:
```http
GET http://localhost:5000/api/health
```

Expected Response:
```json
{
  "status": "OK",
  "environment": "production",
  "database": "connected"
}
```

---

## 7. Troubleshooting & Production Checklist

- [x] **CORS Errors**: Ensure `FRONTEND_URL` on Render matches your exact Vercel URL (without trailing slash).
- [x] **Database Timeouts**: Ensure `0.0.0.0/0` is added to MongoDB Atlas IP Access List.
- [x] **Google Login Error**: Ensure origin URL matches between Google Cloud Console and Vercel domain.
- [x] **Memory Storage**: Cover downloads, PDFs, and image exports run entirely client-side / in-memory, requiring zero disk persistence on Render.
