import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import dns from 'dns';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try { dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']); } catch (e) {}
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import LabExperimentTemplate from '../models/LabExperimentTemplate.js';

const EXPANDED_TEMPLATES = [
  // ── CSE LAB COURSES ─────────────────────────────────────────────────────────────
  {
    courseCode: 'CSE-1122',
    courseTitle: 'Computer Programming I Lab',
    department: 'CSE',
    experiments: [
      { number: '01', title: 'Environment Setup, Hello World & Data Types in C' },
      { number: '02', title: 'Branching Control Statements (if-else, switch-case)' },
      { number: '03', title: 'Iteration & Loop Control Structures (for, while, do-while)' },
      { number: '04', title: '1D & 2D Array Processing & String Operations' },
      { number: '05', title: 'User Defined Functions & Recursion' },
      { number: '06', title: 'Pointers & Dynamic Memory Management' },
      { number: '07', title: 'Structures, Unions & File I/O Operations' },
      { number: '08', title: 'Comprehensive Capstone Practical Exam & Viva' },
    ],
  },
  {
    courseCode: 'CSE-1222',
    courseTitle: 'Data Structures Lab',
    department: 'CSE',
    experiments: [
      { number: '01', title: 'Array Element Insertion, Deletion and Traversal' },
      { number: '02', title: 'Singly and Doubly Linked List Operations' },
      { number: '03', title: 'Stack Data Structure (Array & Linked List Implementation)' },
      { number: '04', title: 'Queue & Circular Queue Implementation' },
      { number: '05', title: 'Binary Search Tree (BST) Insertion and Traversals' },
      { number: '06', title: 'Graph Representation & Traversal (BFS & DFS)' },
      { number: '07', title: 'Sorting Algorithms Benchmark (Quick, Merge, Heap Sort)' },
      { number: '08', title: 'Final Practical Examination & Viva' },
    ],
  },
  {
    courseCode: 'CSE-2322',
    courseTitle: 'Database Systems Lab',
    department: 'CSE',
    experiments: [
      { number: '01', title: 'DDL Commands: Table Creation, Alteration and Schema Constraints' },
      { number: '02', title: 'DML Commands: Data Insertion, Update, Delete & Selection' },
      { number: '03', title: 'Complex Queries using Relational Operators & Aggregate Functions' },
      { number: '04', title: 'Nested Subqueries & Set Operations (UNION, INTERSECT)' },
      { number: '05', title: 'SQL Joins (Inner, Left Outer, Right Outer, Full Outer)' },
      { number: '06', title: 'Database Triggers & Stored Procedures' },
      { number: '07', title: 'PL/SQL Cursor Operations & Exception Handling' },
      { number: '08', title: 'Full Stack Web App Database Integration Project' },
    ],
  },
  {
    courseCode: 'CSE-3322',
    courseTitle: 'Software Engineering & Capstone Lab',
    department: 'CSE',
    experiments: [
      { number: '01', title: 'Software Requirement Specification (SRS) Document' },
      { number: '02', title: 'UML Modeling: Use Case Diagrams & Class Diagrams' },
      { number: '03', title: 'UML Sequence Diagrams & State Chart Diagrams' },
      { number: '04', title: 'System Architecture & ER Diagram Design' },
      { number: '05', title: 'Agile Sprint Planning & Project Tracking' },
      { number: '06', title: 'Unit Testing & Automated Integration Testing' },
      { number: '07', title: 'Final System Prototype Deployment & Project Viva' },
    ],
  },

  // ── EEE LAB COURSES ─────────────────────────────────────────────────────────────
  {
    courseCode: 'EEE-1122',
    courseTitle: 'Electrical Circuit Lab',
    department: 'EEE',
    experiments: [
      { number: '01', title: 'Verification of Ohm\'s Law' },
      { number: '02', title: 'Series Circuit Analysis & Voltage Division' },
      { number: '03', title: 'Parallel Circuit Analysis & Current Division' },
      { number: '04', title: 'Verification of Kirchhoff\'s Current Law (KCL)' },
      { number: '05', title: 'Verification of Kirchhoff\'s Voltage Law (KVL)' },
      { number: '06', title: 'Superposition Theorem Verification' },
      { number: '07', title: 'Thevenin\'s Theorem Verification' },
      { number: '08', title: 'Maximum Power Transfer Theorem' },
      { number: '09', title: 'Final Project Demonstration & Viva' },
    ],
  },
  {
    courseCode: 'EEE-1222',
    courseTitle: 'Electronics Lab',
    department: 'EEE',
    experiments: [
      { number: '01', title: 'PN Junction Diode V-I Characteristics' },
      { number: '02', title: 'Half-Wave and Full-Wave Rectifier Circuits' },
      { number: '03', title: 'Zener Diode Voltage Regulation Characteristics' },
      { number: '04', title: 'Bipolar Junction Transistor (BJT) Input & Output Characteristics' },
      { number: '05', title: 'BJT Common Emitter Amplifier Analysis' },
      { number: '06', title: 'Operational Amplifier (Op-Amp) Inverting & Non-Inverting Amplifiers' },
      { number: '07', title: 'Op-Amp Summing & Differentiating Amplifiers' },
      { number: '08', title: 'Electronics Lab Practical Exam' },
    ],
  },
  {
    courseCode: 'EEE-2222',
    courseTitle: 'Digital Logic Design Lab',
    department: 'EEE',
    experiments: [
      { number: '01', title: 'Verification of Basic Logic Gates (AND, OR, NOT, NAND, NOR, XOR)' },
      { number: '02', title: 'Implementation of Half Adder & Full Adder Circuits' },
      { number: '03', title: 'Implementation of Half Subtractor & Full Subtractor' },
      { number: '04', title: 'Design & Verification of 4-to-1 Multiplexer & 1-to-4 Demultiplexer' },
      { number: '05', title: 'Verification of RS, D, JK and T Flip-Flops' },
      { number: '06', title: 'Design of Synchronous & Asynchronous Binary Counters' },
      { number: '07', title: '7-Segment Display Driver Circuit Implementation' },
      { number: '08', title: 'Final Digital Systems Design Project' },
    ],
  },
  {
    courseCode: 'EEE-3222',
    courseTitle: 'Power System Lab',
    department: 'EEE',
    experiments: [
      { number: '01', title: 'Transmission Line Parameter Calculation & Modeling' },
      { number: '02', title: 'Power Factor Correction & Reactive Power Control' },
      { number: '03', title: 'Symmetrical Fault Analysis on Transmission Network' },
      { number: '04', title: 'Unsymmetrical Fault Analysis using Symmetrical Components' },
      { number: '05', title: 'Overcurrent Relay Testing & Coordination' },
      { number: '06', title: 'Load Flow Analysis using Newton-Raphson Method' },
      { number: '07', title: 'Final Power Systems Lab Viva & Report' },
    ],
  },

  // ── PHYSICS LAB COURSES ─────────────────────────────────────────────────────────
  {
    courseCode: 'PHY-1102',
    courseTitle: 'Physics Lab I',
    department: 'Physics',
    experiments: [
      { number: '01', title: 'Determination of Young\'s Modulus using Vernier Callipers' },
      { number: '02', title: 'Determination of Acceleration due to Gravity by Simple Pendulum' },
      { number: '03', title: 'Determination of Specific Resistance by Meter Bridge' },
      { number: '04', title: 'Determination of Wavelength of Light by Newton\'s Rings' },
      { number: '05', title: 'Determination of Focal Length of a Concave Lens' },
      { number: '06', title: 'Final Physics Lab Practical Examination' },
    ],
  },
  {
    courseCode: 'PHY-1202',
    courseTitle: 'Physics Lab II',
    department: 'Physics',
    experiments: [
      { number: '01', title: 'Determination of Magnetic Field Strength by Tangent Galvanometer' },
      { number: '02', title: 'Verification of Inverse Square Law using Photometer' },
      { number: '03', title: 'Determination of Refractive Index of Glass Prism' },
      { number: '04', title: 'Measurement of Planck\'s Constant using LEDs' },
      { number: '05', title: 'Final Physics Lab II Practical Exam' },
    ],
  },

  // ── CHEMISTRY LAB COURSES ───────────────────────────────────────────────────────
  {
    courseCode: 'CHEM-2302',
    courseTitle: 'Chemistry Lab',
    department: 'Chemistry',
    experiments: [
      { number: '01', title: 'Preparation of Standard Primary Solution' },
      { number: '02', title: 'Standardization of Sodium Hydroxide Solution' },
      { number: '03', title: 'Acid-Base Titration & pH Determination' },
      { number: '04', title: 'Determination of Hardness of Water by EDTA Method' },
      { number: '05', title: 'Final Chemistry Lab Viva & Evaluation' },
    ],
  },
];

async function seedLabTemplates() {
  console.log("=" .repeat(65));
  console.log("🚀 SEEDING EXPANDED IIUC LAB EXPERIMENT TEMPLATES");
  console.log("=" .repeat(65));

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, { dbName: 'iiuc_cover_page' });
    console.log(`✓ Connected to Database: ${conn.connection.name}`);

    for (const tpl of EXPANDED_TEMPLATES) {
      const updated = await LabExperimentTemplate.findOneAndUpdate(
        { courseCode: tpl.courseCode },
        {
          $set: {
            courseCode: tpl.courseCode,
            courseTitle: tpl.courseTitle,
            department: tpl.department,
            experiments: tpl.experiments,
            totalExperiments: tpl.experiments.length,
          },
        },
        { upsert: true, new: true }
      );
      console.log(`  - [${updated.department}] ${updated.courseCode} — ${updated.courseTitle} (${updated.totalExperiments} exps)`);
    }

    const totalCount = await LabExperimentTemplate.countDocuments();
    console.log("=" .repeat(65));
    console.log(`✅ EXPANDED IIUC LAB TEMPLATES SEEDED SUCCESSFULLY! Total: ${totalCount}`);
    await mongoose.disconnect();
  } catch (err) {
    console.error("❌ Seeding Failed:", err);
    process.exit(1);
  }
}

seedLabTemplates();
