import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import dns from 'dns';
try { dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']); } catch (e) {}
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import Cover from '../models/Cover.js';

async function testImport() {
  await mongoose.connect(process.env.MONGO_URI, { dbName: 'iiuc_cover_page' });
  console.log("Connected to Atlas MongoDB");

  const labReports = await Cover.find({ coverType: 'LAB_REPORT' });
  console.log(`Total LAB_REPORT documents found in DB: ${labReports.length}`);

  if (labReports.length > 0) {
    const sample = labReports[0];
    console.log("Sample LAB_REPORT payload:", {
      userId: sample.userId,
      coverType: sample.coverType,
      courseCode: sample.coverData?.courseCode,
      experimentNo: sample.coverData?.experimentNo || sample.coverData?.experimentNumber,
      experimentName: sample.coverData?.experimentName || sample.coverData?.experimentTitle,
    });
  }

  await mongoose.disconnect();
}

testImport();
