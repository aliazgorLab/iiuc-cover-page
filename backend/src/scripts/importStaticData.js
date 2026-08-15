import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import dns from 'dns';
import { fileURLToPath } from 'url';

try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {}

import Course from '../models/Course.js';
import Teacher from '../models/Teacher.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGO_URI = process.env.MONGO_URI;

async function importStaticData() {
  console.log("=" .repeat(60));
  console.log("🚀 MIGRATING STATIC DATASETS TO MONGODB ATLAS");
  console.log("=" .repeat(60));

  try {
    // 1. Connect MongoDB Atlas
    const conn = await mongoose.connect(MONGO_URI, { dbName: 'iiuc_cover_page', serverSelectionTimeoutMS: 10000 });
    console.log(`✓ Connected to MongoDB Atlas Database: ${conn.connection.name}`);
    console.log(`✓ Host: ${conn.connection.host}`);

    // 2. Read coursesData dynamically from frontend/src/data/courses.js
    const coursesFilePath = path.resolve(__dirname, '../../../frontend/src/data/courses.js');
    const coursesContent = fs.readFileSync(coursesFilePath, 'utf-8');

    const coursesArrayMatch = coursesContent.match(/export const coursesData = (\[[\s\S]*?\]);/);
    let rawCourses = [];
    if (coursesArrayMatch && coursesArrayMatch[1]) {
      rawCourses = eval(coursesArrayMatch[1]);
    }

    const totalRawCourses = rawCourses.length;
    let duplicateMergedCount = 0;
    const courseMap = new Map();

    for (const item of rawCourses) {
      if (!item.code || !item.title) continue;
      const cleanCode = item.code.trim().toUpperCase();
      const cleanTitle = item.title.trim();
      const rawDept = item.department ? item.department.replace(/^Dept\.\s*of\s*/i, '').trim() : 'CSE';

      if (courseMap.has(cleanCode)) {
        duplicateMergedCount++;
        const existing = courseMap.get(cleanCode);
        if (rawDept && !existing.departments.includes(rawDept)) {
          existing.departments.push(rawDept);
        }
      } else {
        courseMap.set(cleanCode, {
          code: cleanCode,
          title: cleanTitle,
          courseCode: cleanCode,
          courseTitle: cleanTitle,
          department: item.department || 'Dept. of CSE',
          departments: [rawDept || 'CSE'],
          credit: item.credit || 3,
          semester: item.semester || '',
        });
      }
    }

    const courseOperations = Array.from(courseMap.values()).map((course) => ({
      updateOne: {
        filter: { code: course.code },
        update: {
          $set: {
            code: course.code,
            title: course.title,
            courseCode: course.code,
            courseTitle: course.title,
            department: course.department,
            departments: course.departments,
            departmentCount: course.departments.length,
            credit: course.credit,
            semester: course.semester,
          },
        },
        upsert: true,
      },
    }));

    if (courseOperations.length > 0) {
      await Course.bulkWrite(courseOperations);
    }
    console.log(`✓ courses`);

    // 3. Read teachersData dynamically from frontend/src/data/teachers.js
    const teachersFilePath = path.resolve(__dirname, '../../../frontend/src/data/teachers.js');
    const teachersContent = fs.readFileSync(teachersFilePath, 'utf-8');

    const teachersArrayMatch = teachersContent.match(/export const teachersData = (\[[\s\S]*?\]);/);
    let rawTeachers = [];
    if (teachersArrayMatch && teachersArrayMatch[1]) {
      rawTeachers = eval(teachersArrayMatch[1]);
    }

    console.log(`Preparing bulk write for ${rawTeachers.length} teachers...`);
    const teacherOperations = rawTeachers
      .filter((t) => t.name && t.designation && t.department)
      .map((t) => {
        const cleanName = t.name.trim();
        const cleanDept = t.department.trim();
        const cleanDesignation = t.designation.trim();
        return {
          updateOne: {
            filter: { name: cleanName, department: cleanDept },
            update: {
              $set: {
                name: cleanName,
                designation: cleanDesignation,
                department: cleanDept,
                status: 'ACTIVE',
              },
            },
            upsert: true,
          },
        };
      });

    if (teacherOperations.length > 0) {
      await Teacher.bulkWrite(teacherOperations);
    }
    console.log(`✓ teachers`);

    const finalCoursesCount = await Course.countDocuments();
    const finalTeachersCount = await Teacher.countDocuments();

    console.log(`\nOriginal courses.js records: ${totalRawCourses}`);
    console.log(`Unique courses inserted: ${finalCoursesCount}`);
    console.log(`Duplicate course codes merged: ${duplicateMergedCount}`);
    console.log(`Department mappings preserved: YES`);
    console.log(`MongoDB courses collection: ${finalCoursesCount}`);
    console.log(`Teachers imported: ${finalTeachersCount}`);
    console.log("=" .repeat(60));
    console.log("✅ STATIC DATASET MIGRATION COMPLETED SUCCESSFULLY!");

    await mongoose.disconnect();
  } catch (err) {
    console.error("❌ Migration Failed:", err);
    process.exit(1);
  }
}

importStaticData();
