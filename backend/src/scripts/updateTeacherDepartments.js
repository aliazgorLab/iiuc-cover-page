import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { connectDB } from '../config/database.js';
import Teacher from '../models/Teacher.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Department mapping table to official IIUC format
export const DEPARTMENT_MAP = {
  'CSE': 'Dept. of CSE, IIUC',
  'Computer Science and Engineering': 'Dept. of CSE, IIUC',
  'Dept. of CSE': 'Dept. of CSE, IIUC',
  'CSE Department': 'Dept. of CSE, IIUC',

  'EEE': 'Dept. of EEE, IIUC',
  'Electrical and Electronic Engineering': 'Dept. of EEE, IIUC',
  'Dept. of EEE': 'Dept. of EEE, IIUC',

  'CCE': 'Dept. of CCE, IIUC',
  'Computer and Communication Engineering': 'Dept. of CCE, IIUC',
  'Dept. of CCE': 'Dept. of CCE, IIUC',

  'CE': 'Dept. of CE, IIUC',
  'Civil Engineering': 'Dept. of CE, IIUC',
  'Dept. of CE': 'Dept. of CE, IIUC',

  'ETE': 'Dept. of ETE, IIUC',
  'Electronics and Telecommunication Engineering': 'Dept. of ETE, IIUC',
  'Dept. of ETE': 'Dept. of ETE, IIUC',

  'ELL': 'Dept. of ELL, IIUC',
  'English Language and Literature': 'Dept. of ELL, IIUC',
  'Dept. of ELL': 'Dept. of ELL, IIUC',

  'LAW': 'Dept. of Law, IIUC',
  'Law': 'Dept. of Law, IIUC',
  'Dept. of Law': 'Dept. of Law, IIUC',

  'Pharmacy': 'Dept. of Pharmacy, IIUC',
  'Dept. of Pharmacy': 'Dept. of Pharmacy, IIUC',

  'CGED': 'Dept. of CGED, IIUC',
  'Dept. of CGED': 'Dept. of CGED, IIUC',

  'BBA': 'Dept. of Business Administration, IIUC',
  'Business Administration': 'Dept. of Business Administration, IIUC',
  'Dept. of Business Administration': 'Dept. of Business Administration, IIUC',

  'Finance': 'Dept. of Finance and Banking, IIUC',
  'Finance and Banking': 'Dept. of Finance and Banking, IIUC',
  'Dept. of Finance and Banking': 'Dept. of Finance and Banking, IIUC',

  'Economics and Banking': 'Dept. of Economics and Banking, IIUC',
  'EB': 'Dept. of Economics and Banking, IIUC',
  'Dept. of Economics and Banking': 'Dept. of Economics and Banking, IIUC',

  'QSIS': 'Dept. of QSIS, IIUC',
  'Quranic Sciences and Islamic Studies': 'Dept. of QSIS, IIUC',
  'Dept. of QSIS': 'Dept. of QSIS, IIUC',

  'DIS': 'Dept. of DIS, IIUC',
  'Dawah and Islamic Studies': 'Dept. of DIS, IIUC',
  'Dept. of DIS': 'Dept. of DIS, IIUC',

  'SHIS': 'Dept. of SHIS, IIUC',
  'Sciences of Hadith & Islamic Studies': 'Dept. of SHIS, IIUC',
  'Sciences of Hadith and Islamic Studies': 'Dept. of SHIS, IIUC',
  'Dept. of SHIS': 'Dept. of SHIS, IIUC',

  'Arabic Language and Literature': 'Dept. of Arabic Language and Literature, IIUC',
  'ALL': 'Dept. of Arabic Language and Literature, IIUC',
  'Dept. of Arabic Language and Literature': 'Dept. of Arabic Language and Literature, IIUC',
};

// Helper function to extract short department key for statistics output
const getDeptCategoryKey = (standardizedVal) => {
  if (standardizedVal.includes('CSE')) return 'CSE';
  if (standardizedVal.includes('EEE')) return 'EEE';
  if (standardizedVal.includes('CCE')) return 'CCE';
  if (standardizedVal.includes('CE,')) return 'CE';
  if (standardizedVal.includes('ETE')) return 'ETE';
  if (standardizedVal.includes('ELL')) return 'ELL';
  if (standardizedVal.includes('Law')) return 'Law';
  if (standardizedVal.includes('Pharmacy')) return 'Pharmacy';
  if (standardizedVal.includes('CGED')) return 'CGED';
  if (standardizedVal.includes('Business Administration')) return 'Business Administration';
  if (standardizedVal.includes('Finance and Banking')) return 'Finance and Banking';
  if (standardizedVal.includes('Economics and Banking')) return 'Economics and Banking';
  if (standardizedVal.includes('QSIS')) return 'QSIS';
  if (standardizedVal.includes('DIS')) return 'DIS';
  if (standardizedVal.includes('SHIS')) return 'SHIS';
  if (standardizedVal.includes('Arabic Language')) return 'Arabic Language and Literature';
  return 'Other';
};

export const normalizeDeptName = (dept) => {
  if (!dept) return 'Dept. of CSE, IIUC';
  const trimmed = dept.trim();
  if (DEPARTMENT_MAP[trimmed]) return DEPARTMENT_MAP[trimmed];

  const lower = trimmed.toLowerCase();
  for (const [key, value] of Object.entries(DEPARTMENT_MAP)) {
    if (key.toLowerCase() === lower) return value;
  }

  if (lower.includes('computer science') || lower.includes('cse')) return 'Dept. of CSE, IIUC';
  if (lower.includes('electrical') || lower.includes('eee')) return 'Dept. of EEE, IIUC';
  if (lower.includes('communication') || lower.includes('cce')) return 'Dept. of CCE, IIUC';
  if (lower.includes('civil engineering') || lower === 'ce' || lower === 'dept. of ce') return 'Dept. of CE, IIUC';
  if (lower.includes('telecommunication') || lower.includes('ete')) return 'Dept. of ETE, IIUC';
  if (lower.includes('english') || lower.includes('ell')) return 'Dept. of ELL, IIUC';
  if (lower.includes('law')) return 'Dept. of Law, IIUC';
  if (lower.includes('pharmacy')) return 'Dept. of Pharmacy, IIUC';
  if (lower.includes('cged')) return 'Dept. of CGED, IIUC';
  if (lower.includes('business') || lower.includes('bba')) return 'Dept. of Business Administration, IIUC';
  if (lower.includes('finance')) return 'Dept. of Finance and Banking, IIUC';
  if (lower.includes('economics') || lower.includes('eb')) return 'Dept. of Economics and Banking, IIUC';
  if (lower.includes('quranic') || lower.includes('qsis')) return 'Dept. of QSIS, IIUC';
  if (lower.includes('dawah') || lower.includes('dis')) return 'Dept. of DIS, IIUC';
  if (lower.includes('hadith') || lower.includes('shis')) return 'Dept. of SHIS, IIUC';
  if (lower.includes('arabic') || lower === 'all') return 'Dept. of Arabic Language and Literature, IIUC';

  if (!trimmed.endsWith(', IIUC')) {
    return trimmed.startsWith('Dept. of') ? `${trimmed}, IIUC` : `Dept. of ${trimmed}, IIUC`;
  }

  return trimmed;
};

async function runMigration() {
  try {
    await connectDB();

    console.log('Fetching all teacher records from database...');
    const teachers = await Teacher.find({}).lean();
    const totalChecked = teachers.length;

    const stats = {};
    const bulkOps = [];

    for (const teacher of teachers) {
      const oldDept = teacher.department;
      const newDept = normalizeDeptName(oldDept);

      if (oldDept !== newDept) {
        bulkOps.push({
          updateOne: {
            filter: { _id: teacher._id },
            update: { $set: { department: newDept } },
          },
        });

        const catKey = getDeptCategoryKey(newDept);
        stats[catKey] = (stats[catKey] || 0) + 1;
      }
    }

    let totalUpdated = bulkOps.length;
    if (bulkOps.length > 0) {
      await Teacher.bulkWrite(bulkOps);
    }

    console.log('\n====================================');
    console.log('Teacher Department Migration');
    console.log(`Total Teachers Checked: ${totalChecked}\n`);
    console.log('Updated:');
    for (const [key, count] of Object.entries(stats)) {
      console.log(`${key}: ${count}`);
    }
    console.log(`\nTotal Updated: ${totalUpdated}`);
    console.log('\nMigration Completed Successfully');
    console.log('====================================\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Migration Failed:', error);
    process.exit(1);
  }
}

// Execute migration if called directly from command line
if (process.argv[1] && process.argv[1].endsWith('updateTeacherDepartments.js')) {
  runMigration();
}
