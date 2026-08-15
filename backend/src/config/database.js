import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import dns from 'dns';
import { fileURLToPath } from 'url';

// Force Node.js DNS resolver to use Google/Cloudflare public DNS servers for Atlas SRV resolution
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // Fallback if setServers fails
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load .env from backend root directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const connectDB = async () => {
  const rawUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!rawUri) {
    throw new Error('MONGODB_URI is missing in environment configuration.');
  }

  const maskedUri = rawUri.replace(/:([^@]+)@/, ':****@');

  try {
    console.log(`Connecting to MongoDB Atlas (${maskedUri})...`);
    const conn = await mongoose.connect(rawUri, {
      dbName: 'iiuc_cover_page',
      serverSelectionTimeoutMS: 10000,
    });

    const host = conn.connection.host;
    const dbName = conn.connection.name;
    const db = conn.connection.db;

    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((c) => c.name);

    const teachersCount = collectionNames.includes('teachers')
      ? await db.collection('teachers').countDocuments()
      : 0;
    const coursesCount = collectionNames.includes('courses')
      ? await db.collection('courses').countDocuments()
      : 0;

    console.log('\n' + '=' .repeat(60));
    console.log('🌐 MONGODB ATLAS CONNECTION DIAGNOSTICS');
    console.log('=' .repeat(60));
    console.log(`Connection Type:  MongoDB Atlas`);
    console.log(`MongoDB Host:     ${host}`);
    console.log(`Database Name:    ${dbName}`);
    console.log(`Collections:      ${collectionNames.join(', ') || 'None yet'}`);
    console.log(`teachers count:   ${teachersCount}`);
    console.log(`courses count:    ${coursesCount}`);
    console.log('=' .repeat(60) + '\n');
  } catch (error) {
    console.error(`❌ MongoDB Atlas Connection Error: ${error.message}`);
    process.exit(1);
  }
};
