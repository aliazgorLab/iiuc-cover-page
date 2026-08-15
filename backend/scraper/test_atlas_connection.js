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
console.log("🌐 MONGODB ATLAS CONNECTION VERIFICATION");
console.log("=" .repeat(60));
console.log("URI:", MONGO_URI.replace(/:([^@]+)@/, ':****@'));

async function testAtlasConnection() {
  try {
    const conn = await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log("\n✓ Connected to MongoDB Atlas");
    console.log(`✓ Database: ${conn.connection.name}`);
    console.log(`✓ Host:     ${conn.connection.host}`);

    const db = conn.connection.db;
    const collections = await db.listCollections().toArray();
    console.log(`✓ Existing Collections:`, collections.map(c => c.name));

    await mongoose.disconnect();
    console.log("=" .repeat(60));
  } catch (err) {
    console.error("❌ MongoDB Atlas Connection Failed:", err.message);
    process.exit(1);
  }
}

testAtlasConnection();
