import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import dns from 'dns';
import { fileURLToPath } from 'url';

try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/iiuc_cover_page';

async function checkMongoDB() {
  console.log("=" .repeat(60));
  console.log("🔍 NODE.JS MONGODB DIAGNOSTIC CHECK");
  console.log("=" .repeat(60));
  console.log(`Configured MONGO_URI: ${MONGO_URI.replace(/:([^@]+)@/, ':****@')}`);

  try {
    let conn;
    try {
      conn = await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 3000 });
    } catch (e1) {
      console.log(`⚠ Atlas Connection Note: ${e1.message}. Connecting to local MongoDB on port 27017...`);
      conn = await mongoose.connect('mongodb://127.0.0.1:27017/iiuc_cover_page', { serverSelectionTimeoutMS: 3000 });
    }

    console.log(`✓ Connected Database: ${conn.connection.name}`);
    console.log(`✓ MongoDB Host: ${conn.connection.host}`);

    const db = conn.connection.db;
    const collections = await db.listCollections().toArray();
    console.log(`\nExisting Collections:`, collections.map(c => c.name));

    const teachersColl = db.collection('teachers');
    const teacherCount = await teachersColl.countDocuments();
    console.log(`\nCollection 'teachers' Document Count: ${teacherCount}`);

    const sampleTeachers = await teachersColl.find().limit(5).toArray();
    console.log(`\nFirst 5 Teachers Sample:`);
    sampleTeachers.forEach((t, i) => {
      console.log(`${i + 1}. Name: ${t.name} | Dept: ${t.department} | Designation: ${t.designation}`);
    });

    await mongoose.disconnect();
    console.log("=" .repeat(60));
  } catch (err) {
    console.error("❌ Node.js MongoDB Connection Failed:", err.message);
  }
}

checkMongoDB();
