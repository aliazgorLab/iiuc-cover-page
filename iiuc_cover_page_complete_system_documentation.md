# IIUC Cover Page - Complete System Documentation

---

## 1. Project Overview

**Project Name:** IIUC Cover Page Generator  
**Live URL:** [https://iiuccoverpage.vercel.app](https://iiuccoverpage.vercel.app)  
**Author / Lead Developer:** Md Ali Azgor (CSE Undergraduate Student, IIUC)  
**Target Audience:** Students of International Islamic University Chittagong (IIUC)  
**Primary Purpose:** Standardize and automate the generation of official IIUC academic cover pages (Assignments, Lab Reports, Lab Indexes, and Group Project Reports). Eliminates manual formatting headaches, ensures pixel-perfect A4 printing standards, and provides instant PDF/JPG exports.

---

## 2. Overall Architecture

### 2.1 Technical Stack Overview

```
+-------------------------------------------------------------------+
|                           CLIENT BROWSER                          |
|                                                                   |
|   +-----------------------------------------------------------+   |
|   |                       REACT 19 SPA                        |   |
|   |   (React Router DOM v7, React-Toastify, Lucide Icons)     |   |
|   +-----------------------------+-----------------------------+   |
|                                 |                                 |
|                                 v                                 |
|   +-----------------------------------------------------------+   |
|   |                     CLIENT-SIDE STATE                     |   |
|   |  - React useState (Active Tab, Form State, Auto-suggest)  |   |
|   |  - Browser LocalStorage (Persisted Student Profiles)      |   |
|   |  - Static Datasets (courses.js & teachers.js)             |   |
|   +-----------------------------+-----------------------------+   |
|                                 |                                 |
|                                 v                                 |
|   +-----------------------------------------------------------+   |
|   |                    EXPORT ENGINE (DOM)                    |   |
|   |  - html2pdf.js / jsPDF (A4 Vector PDF Generation)         |   |
|   |  - html2canvas (Raster Canvas -> High Quality JPG)        |   |
|   +-----------------------------------------------------------+   |
+---------------------------------+---------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
|                        DEPLOYMENT PLATFORM                        |
|   - Vercel (Edge Hosting for Static SPA Assets)                   |
|   - Vercel Web Analytics (@vercel/analytics)                      |
+-------------------------------------------------------------------+
```

### 2.2 Architectural Layers
- **Framework:** React 19 (`react` ^19.2.0, `react-dom` ^19.2.0) built with **Vite 7** (`vite` ^7.2.4) using modern ES Module bundling (`"type": "module"`).
- **Frontend Architecture:** Single Page Application (SPA) driven by `react-router-dom` (v7.12.0) with Client-Side Routing and Layout Outlets.
- **Backend / API Structure:** **Serverless / No Backend (Client-Side Only)**. All computational tasks, state management, search filtering, document rendering, auto-saving, and PDF/JPG exports run 100% locally inside the user's browser.
- **Database Structure:** **No Server-Side Database**. Data persistence is handled via browser `localStorage` for saving recurring student attributes (`studentName`, `studentID`, `departmentName`). Static lookup data is embedded directly in client JS bundles (`src/data/courses.js` & `src/data/teachers.js`).
- **Authentication System:** **None (Open Utility)**. Zero friction onboarding — students can start generating cover pages immediately without registering, logging in, or providing credentials.
- **Deployment Configuration:** Deployed on **Vercel** with single-page app fallback rewrite configured in `vercel.json` (`/.*` -> `/index.html`).
- **Environment Variables Usage:** No environment variables currently used; static assets and telemetry are configured out-of-the-box.

---

## 3. Folder & File Structure

```
iiuc-cover-page/
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── postcss.config.js
├── README.md
├── tailwind.config.js
├── vercel.json
├── vite.config.js
├── public/
│   ├── google149dc857b1b778ad.html
│   ├── logo.png
│   └── vite.svg
└── src/
    ├── App.css
    ├── App.jsx
    ├── index.css
    ├── main.jsx
    ├── Design page/
    │   └── assignment.html
    ├── Image/
    │   ├── banner.png
    │   ├── footer.png
    │   ├── hero.png
    │   ├── logo.png
    │   └── varsitityName.png
    ├── assets/
    ├── components/
    │   ├── Footer.jsx
    │   ├── Navbar.jsx
    │   ├── ScrollToTop.jsx
    │   ├── covers/
    │   │   └── ProjectCover.jsx
    │   └── home/                      [Unused / Standalone Components]
    │       ├── Features.jsx
    │       ├── FinalCTA.jsx
    │       ├── Hero.jsx
    │       ├── HomeFooter.jsx
    │       ├── HowItWorks.jsx
    │       └── Testimonials.jsx
    ├── data/
    │   ├── courses.js
    │   └── teachers.js
    ├── hooks/                         [Empty directory reserved for custom React hooks]
    ├── layouts/
    │   └── MainLayout.jsx
    └── pages/
        ├── About.jsx
        ├── Create.jsx
        ├── Guideline.jsx
        ├── Home.jsx
        └── Presentation.jsx
```

### 3.1 Explanation of Important Files & Entry Points

| File / Folder | Purpose & Responsibility |
| :--- | :--- |
| `index.html` | Entry HTML document. Configured with full OpenGraph / Twitter meta tags, Google Webmaster verification, SEO descriptions, and standard HTML root target `<div id="root"></div>`. |
| `src/main.jsx` | React entry script. Mounts the `<App />` component into `#root` wrapped in `<StrictMode>`. Imports `index.css` and `react-toastify` CSS. |
| `src/App.jsx` | Top-level application wrapper. Declares global router (`BrowserRouter`), `ScrollToTop` trigger, application route hierarchy, global `<ToastContainer />`, and `<Analytics />` tracking. |
| `src/layouts/MainLayout.jsx` | Shared structural layout for public site pages (`Home`, `Create`, `Guideline`, `About`). Renders `<Navbar />`, dynamic route content via `<Outlet />`, and `<Footer />`. |
| `src/pages/Create.jsx` | **Core Engine File (~1840 lines)**. Contains tab state management, tab data forms (`AssignmentForm`, `LabReportForm`, `LabIndexForm`, `ProjectForm`), auto-suggest lookups for teachers & courses, auto-save `localStorage` synchronization, live scaled A4 preview, hidden DOM print refs, form validation, and export functions (`handleDownloadPDF`, `handleDownloadJPG`). |
| `src/components/covers/ProjectCover.jsx` | Specialized preview & export layout component for Group Project Cover Pages. Features flexbox multi-card student layouts (up to 4 members) and centered university headers. |
| `src/data/courses.js` | Static dataset containing 672+ lines of course objects (`{ code, title }`) covering IIUC CSE, Pharmacy, EEE, and General Education departments. |
| `src/data/teachers.js` | Static dataset containing 350+ lines of teacher objects (`{ name, designation, department }`) covering IIUC CSE, CCE, BA, EEE, Pharmacy, Law, and GS departments. |
| `src/pages/Home.jsx` | Landing page featuring full-screen hero image backdrop, real-time animated number counters (`Counter` component using `requestAnimationFrame`), bento grid features, and call-to-action blocks. |
| `src/pages/Guideline.jsx` | User tutorial page outlining 3-step usage guides, pro tips for group projects and auto-suggest, and export hints. |
| `src/pages/About.jsx` | System mission breakdown, technology stack badges, project contact links, and developer social profile card. |
| `src/pages/Presentation.jsx` | Interactive 3D showcase page featuring a skewed live rendered `iframe` of `assignment.html`, tech badges, and presenter overview. |
| `src/Design page/assignment.html` | Standalone raw HTML/CSS A4 cover page blueprint used inside the Presentation mode live iframe. |
| `vercel.json` | Vercel deployment route rewrite config to ensure all client routes route to `/index.html`. |
| `tailwind.config.js` & `src/index.css` | Styling foundation. Configures Tailwind CSS directives, IIUC brand colors (`#006A4E`, `#F3CF45`), glassmorphism utility classes, bento cards, button presets, custom animations (`fadeInUp`, `float`, `shimmer`), and CSS `@media print` directives for A4 page sizing. |

---

## 4. Routing Structure & Component Hierarchy

### 4.1 Application Route Map

```
/                            -> MainLayout -> Home Page
/create                      -> MainLayout -> Create Page (Cover Page Generator)
/guideline                   -> MainLayout -> Guideline Page
/about                       -> MainLayout -> About Page
/presentation                -> Presentation Page (Standalone 3D View, No MainLayout)
```

### 4.2 Component Hierarchy Tree

```
<BrowserRouter>
 ├── <ScrollToTop />  (Hooks into location pathname, scrolls window to (0,0))
 ├── <Routes>
 │    ├── <Route path="/presentation" element={<Presentation />} />
 │    └── <Route path="/" element={<MainLayout />}>
 │         ├── <Route index element={<Home />} />
 │         ├── <Route path="create" element={<Create />} />
 │         ├── <Route path="guideline" element={<Guideline />} />
 │         └── <Route path="about" element={<About />} />
 ├── <ToastContainer />  (Top-right notifications, autoClose 3000ms)
 └── <Analytics />       (Vercel Web Analytics)
```

---

## 5. UI/UX System & Design Guidelines

### 5.1 Color Palette & Brand Tokens

| Token Name | Hex Code | Purpose / Application |
| :--- | :--- | :--- |
| `IIUC Primary Green` | `#006A4E` | Brand headers, primary buttons, scrollbars, active tab states, highlights. |
| `IIUC Green Light` | `#00805d` | Button gradients, hover transitions. |
| `IIUC Green Dark` | `#004d38` | Dark background containers (`glass-dark`), text contrast against gold. |
| `IIUC Gold` | `#F3CF45` | CTA primary buttons, secondary accent text, active badges, particle glows. |
| `IIUC Gold Light` | `#F8E186` | Button hover gradient end states, subtle text shimmer. |
| `Background Light` | `#F0FDF4` | Body background color with dual diagonal repeating green grid patterns. |
| `Print Frame Navy` | `#1a1a50` | Border frame for official A4 printable cover page documents. |

### 5.2 Typography System
- **Web UI Font:** `'Poppins', 'Inter', system-ui, sans-serif` (Loaded via Google Fonts in `index.css`).
- **Academic Print Font:** `'Times New Roman', Times, serif` (Hardcoded in preview wrappers for strict adherence to official IIUC assignment submission standards).

### 5.3 Design Effects & CSS Utilities
- **Glassmorphism (`.glass` & `.glass-dark`):** Semi-transparent backdrop blur (`backdrop-filter: blur(16px)`), white border highlights, translucent shadows.
- **Bento Grid Cards (`.bento-card`):** Rounded borders (`border-radius: 24px`), 10px backdrop blur, subtle transform-y lift on hover with green shadow tint.
- **Responsive A4 Scaled Preview (`.scale-[0.45]` to `.scale-[0.65]`):** Renders the exact 210mm x 296mm printable element at real size in the DOM, then applies CSS `transform: scale(...)` inside an overflow-hidden container to ensure desktop and mobile screen fit without layout distortion.

---

## 6. Core Features & Business Logic

### 6.1 Assignment Cover Page Generator
- **User Flow:** User selects "Assignment Cover" tab -> enters Course Code/Title, Topic Name, Teacher Name, Student Name, ID, Section, Semester, Department, Submission Date.
- **Business Logic:** Automatically formats topic and course titles in uppercase serif font. Generates a standard single-student box and a teacher destination box. Includes a blank "REMARK" evaluation box on the bottom right.

### 6.2 Lab Report Cover Page Generator
- **User Flow:** User selects "Lab Report Cover" tab -> enters Experiment No, Experiment Name, Course Code/Title, Teacher Info, Student Info, Date.
- **Business Logic:** Similar to Assignment cover, but replaces "Topic Name" with dedicated "EXPERIMENT NO" and "EXPERIMENT NAME" fields.

### 6.3 Lab Report Index Generator
- **User Flow:** User selects "Lab Index" tab -> inputs course details & section -> dynamically adds/removes table rows containing Experiment Number, Date, and Experiment Name.
- **Business Logic:** Renders a structured academic evaluation matrix table (`Sl. No`, `Date`, `Experiment Name`, `Report`, `Viva`, `Class Performance`, `Signature`). Ensures a minimum of 10 rows (padding empty rows if fewer experiments are provided) to accommodate physical teacher signatures and handwriting space.

### 6.4 Group Project Cover Page Generator
- **User Flow:** User selects "Project Report" tab -> inputs Project Title, Course Code/Title, Supervising Teacher, Department Name, Submission Date -> dynamically adds group members (between 1 and 4 max).
- **Business Logic:** Uses `ProjectCover.jsx` component. Employs flexbox layout (`.students-flex`) to distribute member cards evenly across the A4 page, supporting 1, 2, 3, or 4 students cleanly.

### 6.5 Intelligent Auto-Suggest System
- **Teacher Lookup:** As the user types into the "Teacher Name" field, real-time filtering queries `teachersData`. Selecting a teacher auto-fills Designation and Department.
- **Guest Teacher Toggle:** A checkbox allows overriding auto-suggest to type custom/visiting faculty details manually.
- **Course Bi-Directional Search:** Typing into either "Course Code" or "Course Title" triggers a search against `coursesData`. Selecting a match populates both code and title simultaneously.

### 6.6 Auto-Save Persistence
- **State Trigger:** `useEffect` listens to student input changes across forms (`studentName`, `studentId`, `studentDept`, `departmentName`, `groupMembers[0]`).
- **Persistence Engine:** Automatically saves non-empty values to `localStorage` under `studentName`, `studentID`, and `departmentName`.
- **Restoration:** On initial page mount, saved values are hydrated into state across all 4 tab forms automatically.

### 6.7 Dual Export Engine (PDF & JPG)
- **Validation:** Runs `validateForm()`. If mandatory fields are missing, displays toast notification and inline error text.
- **PDF Export:** Uses `html2pdf.js` pointing to a hidden full-scale off-screen DOM ref (`position: absolute; left: -9999px`). Configures A4 portrait canvas at 2x scale and saves `${filePrefix}_${studentId}.pdf`.
- **JPG Export:** Uses `html2canvas` at 2x scale with `useCORS: true` and `#ffffff` background, converts canvas to base64 JPEG data URL, and triggers automated browser file download.

---

## 7. Data Models & State Schemas

### 7.1 Form State Definitions

```typescript
// 1. Assignment Form State
interface AssignmentData {
  assignmentTitle: string;
  courseCode: string;
  courseTitle: string;
  teacherName: string;
  teacherDesignation: string;
  teacherDept: string;
  studentName: string;
  studentId: string;
  section: string;
  semester: string;
  studentDept: string;
  submissionDate: string;
}

// 2. Lab Report Form State
interface LabReportData {
  experimentNo: string;
  experimentName: string;
  courseCode: string;
  courseTitle: string;
  teacherName: string;
  teacherDesignation: string;
  teacherDept: string;
  studentName: string;
  studentId: string;
  section: string;
  semester: string;
  studentDept: string;
  submissionDate: string;
}

// 3. Lab Index Form State
interface ExperimentItem {
  no: string;
  date: string;
  name: string;
}

interface LabIndexData {
  courseCode: string;
  courseTitle: string;
  studentName: string;
  studentId: string;
  section: string;
  experiments: ExperimentItem[];
}

// 4. Project Form State
interface GroupMember {
  name: string;
  id: string;
}

interface ProjectData {
  projectTitle: string;
  courseCode: string;
  courseTitle: string;
  teacherName: string;
  teacherDesignation: string;
  teacherDept: string;
  date: string;
  departmentName: string;
  groupMembers: GroupMember[];
}
```

### 7.2 LocalStorage Schema

| Key | Type | Description |
| :--- | :--- | :--- |
| `studentName` | String | User's full name (e.g. "Md. Ali Azgor"). |
| `studentID` | String | User's university ID (e.g. "C201085"). |
| `departmentName` | String | User's department (e.g. "Computer Science & Engineering"). |

### 7.3 Data Validation Rules

| Template Type | Required Validation Fields | Max Boundaries / Limits |
| :--- | :--- | :--- |
| **Assignment** | `studentName`, `studentId`, `courseCode`, `courseTitle`, `assignmentTitle`, `teacherName` | N/A |
| **Lab Report** | `studentName`, `studentId`, `courseCode`, `courseTitle`, `experimentNo`, `experimentName`, `teacherName` | N/A |
| **Lab Index** | `studentName`, `studentId`, `courseCode`, `courseTitle`, `section` | Table dynamically pads up to 10 minimum rows |
| **Project Report** | `projectTitle`, `courseCode`, `courseTitle`, `teacherName`, `departmentName`, At least 1 member with Name & ID | Maximum 4 Group Members |

---

## 8. User Roles & Permissions

- **Public / Student Role:** Unlimited access to generate cover pages, download PDFs/JPGs, perform searches, auto-save profile.
- **Admin Role:** **None**. There is no backend admin panel or database administration console.
- **Permission System:** Purely browser-isolated. No API keys, credentials, or session cookies required.

---

## 9. Step-by-Step Complete User Journey

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            1. VISIT LANDING PAGE                            │
│ User enters website -> views hero section, live stats counter (1000+        │
│ students), bento feature highlights -> clicks "Create Now".                 │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │
                                     v
┌─────────────────────────────────────────────────────────────────────────────┐
│                            2. ENTER GENERATOR PAGE                          │
│ User navigates to /create -> LocalStorage automatically populates           │
│ studentName, studentID, and departmentName into inputs.                     │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │
                                     v
┌─────────────────────────────────────────────────────────────────────────────┐
│                            3. SELECT COVER TYPE                             │
│ User selects tab: [Assignment | Lab Report | Lab Index | Project].           │
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │
                                     v
┌─────────────────────────────────────────────────────────────────────────────┐
│                        4. INPUT & AUTO-SUGGEST DATA                         │
│ User types Course Code/Title -> select from dropdown -> course code & title │
│ auto-fill. User types Teacher Name -> dropdown shows matched faculty ->     │
│ selecting auto-fills Designation & Department. Live preview updates instantly.│
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │
                                     v
┌─────────────────────────────────────────────────────────────────────────────┐
│                            5. VALIDATION & EXPORT                           │
│ User clicks "Download PDF" or "Download JPG" -> system validates form ->     │
│ html2pdf/html2canvas captures hidden 100% scale A4 element -> file downloads│
│ to user's device with filename `Prefix_ID.pdf`.                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 10. Code Quality, Technical Debt & Risk Review

### 10.1 Key Strengths
- **Zero Friction & High Performance:** Fast initial load time with zero backend latencies or cold start delays.
- **Pixel-Perfect Print Fidelity:** Dedicated CSS print stylesheets and hidden off-screen 1:1 scale container guarantee exact 210mm x 296mm rendering without browser header/footer margins.
- **User UX Enhancements:** Auto-suggest for 670+ courses and 350+ faculty members saves immense manual typing effort. LocalStorage auto-save prevents accidental data loss.

### 10.2 Technical Debt & Code Smells

```
[ CRITICAL TECHNICAL DEBT ]
1. Monolithic Component Structure (src/pages/Create.jsx):
   Create.jsx contains 1840 lines of code and embeds over 10 distinct sub-components
   (AssignmentForm, LabReportForm, LabIndexForm, ProjectForm, CourseDetailsForm,
   PersonDetailsForm, AssignmentCover, LabReportCover, LabIndex, LivePreview, FormSection, InputField).
   --> Risk: Extremely difficult to maintain, test, or extend.

2. Unused Home Components (src/components/home/):
   Six standalone component files exist in src/components/home/ (Hero.jsx, Features.jsx, etc.)
   which are completely un-imported because Home.jsx duplicated their markup inline.
   --> Risk: Code duplication, bundle bloat, developer confusion.

3. Hardcoded In-Memory Data Arrays (src/data/):
   courses.js (41KB) and teachers.js (35KB) are static JavaScript objects bundled into client JS.
   --> Risk: Adding/updating new teachers or course codes requires a full codebase re-build & redeployment.

4. Duplicated Inline CSS Style Injection:
   Every preview component (AssignmentCover, LabReportCover, LabIndex, ProjectCover)
   injects redundant <style> tags into the DOM on every render.
```

### 10.3 Risk & Security Evaluation
- **XSS & Injection Risks:** Currently, user inputs are rendered into React JSX, which natively escapes string content. However, in `assignment.html`, direct raw DOM insertion must be sanitized if modified dynamically.
- **LocalStorage Data Collision:** `studentName` and `studentID` are saved in shared browser storage. On shared campus computer lab terminals, a subsequent student might inadvertently see the previous user's name/ID unless cleared.
- **Export Library Failure Edge Cases:** Extremely long project titles or experiment titles can overflow fixed A4 container boundaries (`274mm` frame height) causing visual overflow truncation in PDF export.

---

## 11. Third-Party Services & Dependencies

| Package / Service | Type | Purpose |
| :--- | :--- | :--- |
| `react` / `react-dom` | Core Framework | UI rendering and component architecture (v19.2.0). |
| `react-router-dom` | Navigation | Client-side page routing (v7.12.0). |
| `html2pdf.js` | PDF Export | Canvas-to-PDF engine leveraging `jsPDF` and `html2canvas` (v0.14.0). |
| `html2canvas` | JPG Export | Client-side HTML DOM node screenshot generator (v1.4.1). |
| `jspdf` | PDF Engine | Low-level PDF binary generator (v4.0.0). |
| `lucide-react` & `react-icons` | Design Assets | Vector UI icons (FileText, Sparkles, Plus, Trash2, FaLinkedin, etc.). |
| `react-toastify` | Notifications | User-friendly toast popups for download statuses and validation alerts. |
| `@vercel/analytics` | Analytics | Traffic tracking and real-time visitor telemetry on Vercel deployment. |
| `tailwindcss` | CSS Framework | Utility-first styling with custom keyframe animations and PostCSS. |

---

## 12. Upgrade Recommendations & Developer Roadmap

For any developer taking over this codebase after 7+ months, follow this structured upgrade blueprint to transition the app into an enterprise-grade university portal.

### Phase 1: Architectural Refactoring (High Priority)
1. **Deconstruct `Create.jsx`:** Split the 1840-line file into a modular file structure:
   - `src/features/create/components/AssignmentForm.jsx`
   - `src/features/create/components/LabReportForm.jsx`
   - `src/features/create/components/LabIndexForm.jsx`
   - `src/features/create/components/ProjectForm.jsx`
   - `src/features/create/components/LivePreview.jsx`
   - `src/features/create/components/covers/AssignmentCover.jsx`
   - `src/features/create/components/covers/LabReportCover.jsx`
   - `src/features/create/components/covers/LabIndexCover.jsx`
2. **Clean Unused Components:** Remove or integrate the dormant files in `src/components/home/`.
3. **Consolidate Cover Styles:** Extract duplicate CSS block declarations from preview components into a single `src/styles/covers.css` file.

### Phase 2: Database & Backend Integration (Medium Priority)
1. **Backend Service (Next.js / Node.js + Supabase / PostgreSQL):**
   - Move `teachers` and `courses` into a relational database.
   - Implement an Admin Panel so department heads can update faculty lists and course syllabi dynamically without developer code commits.
2. **User Authentication (Supabase Auth / Firebase / NextAuth):**
   - Allow students to create accounts, save cloud cover page drafts, store multiple profile templates, and access submission histories.

### Phase 3: Enhanced Features & Platform Expansion (Feature Ideas)
1. **Dynamic Font & Color Customization:** Allow students to tweak font sizes or select specific department color variants (e.g. EEE blue, CSE green, Pharmacy purple).
2. **Batch Generation:** Allow uploading a CSV file of group members or experiment lists to bulk-generate covers for an entire class.
3. **Multi-University Standardization:** Extend support to other public/private universities by introducing dynamic logo uploaders and customizable border frame rules.

---
*Document compiled and verified for developer handover.*  
*Current system date: August 13, 2026.*
