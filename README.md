# IIUC Academic Document Platform & Cover Page Generator

A production-grade full-stack platform for International Islamic University Chittagong (IIUC) students to generate standardized academic cover pages (Assignments, Lab Reports, Lab Indexes, and Group Project Reports).

---

## 🏗️ Repository Architecture (Full-Stack Setup)

```
iiuc-cover-page/
│
├── frontend/                         # React 19 + Vite SPA Client
│   ├── src/
│   │   ├── app/                      # Application setup & routing
│   │   ├── components/               # Reusable UI primitives (FormInput, A4Preview, etc.)
│   │   ├── features/                 # Modular feature domains
│   │   │   ├── cover-generator/      # Assignment, Lab Report, Lab Index, Project modules
│   │   │   ├── authentication/       # Academic email auth forms
│   │   │   ├── dashboard/            # Student Portal & Admin views
│   │   │   └── templates/            # Academic template catalog
│   │   ├── stores/                   # Zustand global state stores
│   │   ├── services/                 # API client services with offline fallbacks
│   │   └── utils/                    # PDF/JPG exporters and validators
│   ├── public/                       # Static public assets
│   ├── index.html                    # HTML entry point
│   ├── vite.config.js                # Vite build config
│   ├── tailwind.config.js            # Styling & brand tokens
│   └── package.json
│
├── backend/                          # Node.js + Express REST API Server
│   ├── src/
│   │   ├── config/                   # MongoDB connection client
│   │   ├── models/                   # Mongoose schemas (User, Teacher, Course, etc.)
│   │   ├── controllers/              # REST route handlers
│   │   ├── routes/                   # API endpoint routes
│   │   ├── middleware/               # JWT authentication & RBAC middleware
│   │   ├── services/                 # IIUC academic email verification
│   │   ├── scripts/                  # Data migration & database seeding
│   │   └── server.js                 # Express application entry point
│   ├── .env.example
│   └── package.json
│
└── README.md                         # Root repository documentation
```

---

## ⚡ Quick Start Guide

### 1. Frontend Client Setup
```bash
cd frontend
npm install
npm run dev
```
Runs the Vite development server at `http://localhost:5173`.

### 2. Backend Server Setup
```bash
cd backend
npm install
npm start
```
Runs the Express REST API server at `http://localhost:5000`.

### 3. Database Seeding (MongoDB)
```bash
cd backend
npm run seed
```
Migrates static faculty members (350+ records) and course syllabi (670+ records) into your MongoDB database.

---

## 🛡️ Key Features & System Capabilities

- **Assignment Cover Page**: Official IIUC topic name and teacher box layout.
- **Lab Report Cover Page**: Dedicated experiment number and experiment name fields.
- **Lab Index Table**: Dynamic table matrix with minimum 10 auto-padded rows for handwriting space.
- **Group Project Cover Page**: Flexbox grid card balance supporting **1, 2, 3, or 4 group members**.
- **Teacher & Course Auto-Suggest**: Bi-directional search with guest faculty manual override.
- **Export Engine**: Pixel-perfect A4 vector PDF export via `html2pdf.js` and high-res JPG export via `html2canvas`.
- **Hybrid Local & Cloud Storage**: 100% offline generation support for guest users with `localStorage` persistence, plus cloud history backup for authenticated students.

---

## 🎓 IIUC Academic Email Authentication

Registration is restricted to official IIUC email domains:
- `@ugrad.iiuc.ac.bd` (Undergraduate Students)
- `@student.iiuc.ac.bd` (General Students)
- `@iiuc.ac.bd` (Faculty & Admin)
