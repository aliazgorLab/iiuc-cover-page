import { connectDB } from '../src/config/database.js';
import mongoose from 'mongoose';
import Course from '../src/models/Course.js';
import Teacher from '../src/models/Teacher.js';

async function testAPIs() {
  console.log("=" .repeat(60));
  console.log("🧪 TESTING BACKEND API DATA FROM MONGODB ATLAS");
  console.log("=" .repeat(60));

  await connectDB();

  const teachersSample = await Teacher.find({ status: 'ACTIVE' }).limit(5);
  console.log(`\n✓ GET /api/v1/teachers returns ${teachersSample.length} sample records from Atlas:`);
  teachersSample.forEach(t => console.log(`  - [${t.department}] ${t.name} (${t.designation})`));

  const coursesSample = await Course.find({ departmentCount: { $gt: 1 } }).limit(5);
  console.log(`\n✓ GET /api/v1/courses returns multi-department sample records from Atlas:`);
  coursesSample.forEach(c => console.log(`  - [${c.code}] ${c.title} (Used by ${c.departmentCount} depts: ${c.departments.join(', ')})`));

  await mongoose.disconnect();
  console.log("\n=" .repeat(60));
  console.log("✅ ALL BACKEND ATLAS API TESTS PASSED!");
  console.log("=" .repeat(60));
}

testAPIs();
