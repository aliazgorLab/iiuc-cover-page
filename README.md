# IIUC Cover Page Generator

A modern, user-friendly web application designed for **International Islamic University Chittagong (IIUC)** students to create professional cover pages for assignments, lab reports, and lab indexes with real-time preview and instant PDF download capabilities.

![Version](https://img.shields.io/badge/version-0.0.0-blue.svg)
![React](https://img.shields.io/badge/React-19.2.0-61dafb.svg)
![Vite](https://img.shields.io/badge/Vite-7.2.4-646cff.svg)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1.18-38bdf8.svg)

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage Guide](#usage-guide)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Contributing](#contributing)

## 🎯 Overview

The **IIUC Cover Page Generator** streamlines the process of creating standardized, university-compliant cover pages for academic submissions. Students can fill out digital forms and instantly generate professionally formatted PDF documents that meet IIUC's official formatting requirements.

### What This App Does:

- **Dynamic Form Generation**: Interactive forms for Assignment Covers, Lab Report Covers, and Lab Indexes
- **Live Preview**: Real-time A4-sized preview showing exactly how your cover page will look
- **Instant PDF Download**: One-click PDF generation with proper A4 formatting using html2pdf.js
- **Multiple Document Types**: Support for three different cover page formats
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## ✨ Key Features

### 🎨 Three Document Types

1. **Assignment Cover Page**
   - Course details (code, title, topic name)
   - Teacher information (name, designation, department)
   - Student details (name, ID, section, semester, department)
   - Submission date
   - Official IIUC branding and footer

2. **Lab Report Cover Page**
   - Experiment number and name
   - Course details
   - Teacher and student information
   - Submission date
   - Lab-specific formatting

3. **Lab Index Page**
   - Dynamic experiment list management
   - Add/remove multiple experiments
   - Track experiment numbers, dates, names, page numbers, and remarks
   - Student and course information

### 🔥 Core Features

- ✅ **Live Preview with Scaling**: Real-time scaled preview (60% zoom) of your A4 cover page
- ✅ **High-Quality PDF Export**: Professional PDF generation with proper A4 dimensions (210mm × 297mm)
- ✅ **Form Validation**: Clean, intuitive form inputs with placeholder guidance
- ✅ **Dynamic Experiment Management**: Add/delete experiments in Lab Index with ease
- ✅ **Official IIUC Branding**: Pre-loaded university logo, name images, and campus footer
- ✅ **Responsive Layout**: Split-screen design with sticky preview on desktop
- ✅ **Tab-Based Navigation**: Easy switching between document types
- ✅ **Modern UI/UX**: Clean, gradient-based design with smooth transitions

## 🛠️ Tech Stack

### Frontend Framework
- **React 19.2.0** - Modern UI library with hooks
- **React Router DOM 7.12.0** - Client-side routing

### Build Tools
- **Vite 7.2.4** - Lightning-fast build tool and dev server
- **ESLint** - Code quality and consistency

### Styling
- **TailwindCSS 4.1.18** - Utility-first CSS framework
- **PostCSS & Autoprefixer** - CSS processing

### PDF Generation
- **html2pdf.js 0.14.0** - HTML to PDF conversion
- **html2canvas 1.4.1** - HTML rendering to canvas
- **jsPDF 4.0.0** - PDF document generation

### Icons & UI
- **Lucide React 0.562.0** - Beautiful, consistent icon library

## 📦 Installation

### Prerequisites

- **Node.js** (v16 or higher recommended)
- **npm** or **yarn** package manager
- Modern web browser (Chrome, Firefox, Edge, Safari)

### Step-by-Step Setup

1. **Clone the Repository**

```bash
git clone https://github.com/yourusername/IIUC-Cover-Page.git
cd IIUC-Cover-Page
```

2. **Install Dependencies**

```bash
npm install
```

This will install all required packages including React, Vite, TailwindCSS, html2pdf.js, and other dependencies listed in `package.json`.

3. **Start Development Server**

```bash
npm run dev
```

The app will start on `http://localhost:5173` (or another port if 5173 is busy).

4. **Build for Production** (Optional)

```bash
npm run build
```

Production-ready files will be generated in the `dist/` folder.

5. **Preview Production Build** (Optional)

```bash
npm run preview
```

## 🚀 Usage Guide

### For Students:

1. **Navigate to Create Page**
   - Open the app and click "Create Cover Page" or navigate to `/create`

2. **Select Document Type**
   - Click one of the three tabs:
     - 📝 **Assignment Cover**
     - 🔬 **Lab Report Cover**
     - 📋 **Lab Index**

3. **Fill Out the Form**
   - Enter your course details (Course Code, Course Title)
   - Add teacher information (Name, Designation, Department)
   - Input student details (Name, Student ID, Section, Semester, Department)
   - For Lab Index: Add multiple experiments using the "+ Add Experiment" button

4. **Preview Your Cover Page**
   - View the live preview on the right side (desktop) or below the form (mobile)
   - The preview updates in real-time as you type

5. **Download PDF**
   - Click the **"Download PDF"** button at the bottom of the preview
   - Your cover page will be downloaded as a high-quality PDF file
   - Filename format: `Assignment_[StudentID]_Cover.pdf`

### Tips:
- All fields are optional, but fill in as much as possible for a complete cover page
- Use the date picker for accurate submission dates
- In Lab Index, you can delete experiments using the trash icon
- The preview shows exactly how your PDF will look

## 📁 Project Structure

```
iiuc-cover-page/
├── public/                      # Static assets
├── src/
│   ├── assets/                  # Images, fonts, etc.
│   ├── components/
│   │   └── Navbar.jsx          # Navigation component
│   ├── Design page/
│   │   └── assignment.html     # Original design reference
│   ├── Image/
│   │   ├── logo.png            # IIUC logo
│   │   ├── varsitityName.png   # University name image
│   │   └── footer.png          # Campus footer image
│   ├── layouts/
│   │   └── MainLayout.jsx      # Main app layout with navbar
│   ├── pages/
│   │   ├── Home.jsx            # Landing page
│   │   ├── Create.jsx          # Main cover page creator (902 lines)
│   │   ├── Guideline.jsx       # Usage guidelines page
│   │   └── About.jsx           # About page
│   ├── App.css                 # Global styles
│   ├── App.jsx                 # Root component with routing
│   ├── index.css               # Tailwind directives
│   └── main.jsx                # App entry point
├── .gitignore
├── eslint.config.js            # ESLint configuration
├── index.html                  # HTML template
├── package.json                # Dependencies and scripts
├── postcss.config.js           # PostCSS configuration
├── README.md                   # This file
├── tailwind.config.js          # Tailwind configuration
└── vite.config.js              # Vite configuration
```

### Key Files:

- **`src/pages/Create.jsx`** - Heart of the application containing:
  - Form components (`AssignmentForm`, `LabReportForm`, `LabIndexForm`)
  - Cover page templates (`AssignmentCover`, `LabReportCover`)
  - Live preview component (`LivePreview`)
  - PDF generation logic using html2pdf.js

- **`src/Image/`** - Official IIUC branding assets used in cover pages

- **`src/App.jsx`** - React Router setup with four main routes

## 📜 Available Scripts

```bash
# Start development server with hot reload
npm run dev

# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview

# Run ESLint for code quality checks
npm run lint
```

## 🎨 Design Highlights

- **Bento Card Design**: Modern card-based UI with shadows and rounded corners
- **Color Scheme**: IIUC official colors - Forest Green (#006A4E) and Golden Yellow (#F3CF45)
- **Typography**: "Times New Roman" for cover pages (formal academic style)
- **Responsive Grid**: Two-column layout on desktop, stacked on mobile
- **Sticky Preview**: Preview panel stays visible while scrolling through forms
- **Smooth Animations**: Transitions on buttons, tabs, and form interactions

## 🤝 Contributing

Contributions are welcome! If you'd like to improve this project:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is created for **International Islamic University Chittagong (IIUC)** students. Please use responsibly and ensure all generated documents comply with university guidelines.

## 👨‍💻 Developer Notes

### PDF Generation Implementation:
The app uses **html2pdf.js** for direct HTML-to-PDF conversion. Key settings:
- **Scale**: 2x for high quality
- **Format**: A4 (210mm × 297mm)
- **Margins**: 0 (cover pages are full-bleed designs)

### Live Preview Scaling:
The preview uses CSS transform `scale(0.60)` with `transformOrigin: 'top left'` to show a 60% scaled version of the full A4 page inside an 850px tall container.

---

**Built with ❤️ for IIUC Students** | **Powered by React + Vite + TailwindCSS**
