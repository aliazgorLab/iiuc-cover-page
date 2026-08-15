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

const MONGO_URI = process.env.MONGO_URI;

console.log("=" .repeat(60));
console.log("TESTING ATLAS MONGODB CONNECTION DIRECTLY");
console.log("=" .repeat(60));
console.log("URI:", MONGO_URI.replace(/:([^@]+)@/, ':****@'));

async function testAtlas() {
  // Test Option 1: Standard Mongoose
  try {
    console.log("\nAttempt 1: Standard Mongoose connect to Atlas...");
    const conn = await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      family: 4
    });
    console.log(`✓ Atlas Connected Successfully!`);
    console.log(`Host: ${conn.connection.host}`);
    console.log(`Port: ${conn.connection.port}`);
    console.log(`Database: ${conn.connection.name}`);
    const count = await conn.connection.db.collection('teachers').countDocuments();
    console.log(`Teachers Collection Count: ${count}`);
    await mongoose.disconnect();
    return;
  } catch (e1) {
    console.log(`⚠ Attempt 1 Failed: ${e1.message}`);
  }

  // Test Option 2: tlsAllowInvalidCertificates
  try {
    console.log("\nAttempt 2: Mongoose with tlsAllowInvalidCertificates...");
    const conn = await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      tlsAllowInvalidCertificates: true,
      family: 4
    });
    console.log(`✓ Atlas Connected with tlsAllowInvalidCertificates!`);
    console.log(`Host: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
    const count = await conn.connection.db.collection('teachers').countDocuments();
    console.log(`Teachers Collection Count: ${count}`);
    await mongoose.disconnect();
    return;
  } catch (e2) {
    console.log(`⚠ Attempt 2 Failed: ${e2.message}`);
  }

  console.log("=" .repeat(60));
}

testAtlas();
