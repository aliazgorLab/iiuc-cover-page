import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Teacher from '../models/Teacher.js';
import Course from '../models/Course.js';
import Department from '../models/Department.js';
import { teachersData } from '../../../frontend/src/data/teachers.js';
import { coursesData } from '../../../frontend/src/data/courses.js';

dotenv.config();

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/iiuc_cover_page';
    console.log(`Connecting to MongoDB for seeding: ${mongoUri}...`);
    await mongoose.connect(mongoUri);

    console.log('Clearing existing teachers, courses, and departments...');
    await Teacher.deleteMany({});
    await Course.deleteMany({});
    await Department.deleteMany({});

    console.log('Seeding departments...');
    const defaultDepts = [
      { name: 'Department of Computer Science and Engineering', code: 'CSE' },
      { name: 'Department of Computer and Communication Engineering', code: 'CCE' },
      { name: 'Department of Electrical and Electronic Engineering', code: 'EEE' },
      { name: 'Department of Business Administration', code: 'BA' },
      { name: 'Department of Pharmacy', code: 'PHARM' },
      { name: 'Department of Law', code: 'LAW' },
    ];
    await Department.insertMany(defaultDepts);

    console.log(`Seeding ${teachersData.length} faculty members...`);
    const teacherDocs = teachersData.map((t) => ({
      name: t.name,
      designation: t.designation,
      department: t.department,
      status: 'ACTIVE',
    }));
    await Teacher.insertMany(teacherDocs);

    console.log(`Seeding ${coursesData.length} course items...`);
    // Unique courses by course code
    const uniqueCoursesMap = new Map();
    coursesData.forEach((c) => {
      if (c.code && !uniqueCoursesMap.has(c.code)) {
        uniqueCoursesMap.set(c.code, {
          courseCode: c.code,
          courseTitle: c.title,
          department: 'Dept. of CSE',
        });
      }
    });
    const courseDocs = Array.from(uniqueCoursesMap.values());
    await Course.insertMany(courseDocs);

    console.log('Database Seeding Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Database Seeding Failed:', error);
    process.exit(1);
  }
};

seedDB();
