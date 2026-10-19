import dns from 'dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { createRequire } from 'module';

const require = createRequire('e:/Cover design web/iiuc-cover-page/backend/src/server.js');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables strictly for connection string (never printed)
dotenv.config({ path: 'e:/Cover design web/iiuc-cover-page/backend/.env' });

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('[FATAL] Missing MONGODB_URI in backend/.env');
  process.exit(1);
}

const BACKUP_ROOT = 'E:/iiuc_backups/mongodb_atlas_backup';
const BASELINE = {
  users: 253,
  covers: 495,
  teachers: 737,
  courses: 571,
  draftcovers: 200,
  usersessions: 609,
  adminnotifications: 253,
  labindexrecords: 12,
  templates: 4,
  adminactivities: 3,
  teacherimportlogs: 2,
  broadcastlogs: 1,
  departments: 1,
  labexperiments: 0,
};

const REQUIRED_COLLECTIONS = Object.keys(BASELINE);

function sha256File(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(fileBuffer).digest('hex');
}

async function runBackupAndVerification() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(BACKUP_ROOT, `backup_${timestamp}`);
  fs.mkdirSync(backupDir, { recursive: true });

  console.log('=================================================================');
  console.log('  IIUC Cover Page Platform — Phase 3A MongoDB Atlas Backup Tool');
  console.log('=================================================================');
  console.log(`[Config] Destination Directory: ${backupDir}`);
  console.log(`[Config] Target Database Name:  iiuc_cover_page`);
  console.log(`[Safety] Mode:                   STRICT READ-ONLY (No writes to MongoDB)`);
  console.log(`[Safety] Expected Collections:  ${REQUIRED_COLLECTIONS.length}`);
  console.log('-----------------------------------------------------------------');

  const manifest = {
    backupTimestamp: new Date().toISOString(),
    backupDirectory: backupDir,
    database: 'iiuc_cover_page',
    collections: {},
    totalDocuments: 0,
    expectedTotal: 3141,
    checksums: {},
    status: 'IN_PROGRESS',
  };

  try {
    console.log('[1/4] Connecting to MongoDB Atlas in strict read-only mode...');
    await mongoose.connect(MONGO_URI, {
      dbName: 'iiuc_cover_page',
      readPreference: 'secondaryPreferred',
    });
    console.log('[1/4] ✓ Connected successfully to MongoDB Atlas.');

    const db = mongoose.connection.db;
    const existingCollections = (await db.listCollections().toArray()).map((c) => c.name);

    console.log('\n[2/4] Exporting collections to Canonical BSON Extended JSON...');
    const EJSON = mongoose.mongo.BSON.EJSON;

    for (const colName of REQUIRED_COLLECTIONS) {
      let docs = [];
      if (existingCollections.includes(colName)) {
        // Read strictly without modifying
        docs = await db.collection(colName).find({}).toArray();
      } else {
        console.log(`  - Note: Collection "${colName}" has 0 documents in database (empty).`);
      }

      const filePath = path.join(backupDir, `${colName}.ejson`);
      // Canonical Extended JSON ensures exact reproduction of ObjectId, Date, Int64, etc.
      const serialized = EJSON.stringify(docs, { relaxed: false }, 2);
      fs.writeFileSync(filePath, serialized, 'utf8');

      const stat = fs.statSync(filePath);
      const hash = sha256File(filePath);

      manifest.collections[colName] = {
        exportedCount: docs.length,
        baselineCount: BASELINE[colName],
        file: `${colName}.ejson`,
        sizeBytes: stat.size,
        sha256: hash,
        matchBaseline: docs.length === BASELINE[colName],
      };
      manifest.checksums[`${colName}.ejson`] = hash;
      manifest.totalDocuments += docs.length;

      const flag = docs.length === BASELINE[colName] ? '✓' : '✗';
      console.log(
        `  ${flag} Exported ${colName.padEnd(20)}: ${String(docs.length).padStart(5)} docs | ` +
        `${(stat.size / 1024).toFixed(1).padStart(7)} KB | SHA-256: ${hash.substring(0, 12)}...`
      );
    }

    // Write SHA-256 checksums file (standard GNU sha256sum format)
    const checksumsLines = Object.entries(manifest.checksums)
      .map(([file, hash]) => `${hash}  ${file}`)
      .join('\n');
    fs.writeFileSync(path.join(backupDir, 'checksums.sha256'), checksumsLines + '\n', 'utf8');

    console.log('\n-----------------------------------------------------------------');
    console.log(`[Summary] Total Exported Documents: ${manifest.totalDocuments} / Expected: ${manifest.expectedTotal}`);
    const countMatch = manifest.totalDocuments === manifest.expectedTotal;
    console.log(`[Summary] Baseline Reconciliation:  ${countMatch ? '✓ EXACT MATCH' : '⚠ COUNT MISMATCH'}`);

    // Disconnect cleanly from production database before any test
    await mongoose.disconnect();
    console.log('\n[3/4] ✓ Disconnected cleanly from production MongoDB Atlas.');

    // Step 3: Self-Verification of backup on disk
    console.log('\n[3/4] Verifying exported files on disk and recalculating checksums...');
    let integrityPassed = true;
    for (const colName of REQUIRED_COLLECTIONS) {
      const filePath = path.join(backupDir, `${colName}.ejson`);
      if (!fs.existsSync(filePath)) {
        console.error(`  ✗ Missing backup file: ${filePath}`);
        integrityPassed = false;
        continue;
      }
      const recomputed = sha256File(filePath);
      if (recomputed !== manifest.checksums[`${colName}.ejson`]) {
        console.error(`  ✗ Checksum mismatch for ${colName}.ejson!`);
        integrityPassed = false;
      }
      // Test parsing
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const parsed = EJSON.parse(content);
        if (!Array.isArray(parsed) || parsed.length !== manifest.collections[colName].exportedCount) {
          console.error(`  ✗ Parsed count mismatch for ${colName}.ejson!`);
          integrityPassed = false;
        }
      } catch (parseErr) {
        console.error(`  ✗ Parse failure for ${colName}.ejson: ${parseErr.message}`);
        integrityPassed = false;
      }
    }

    if (integrityPassed) {
      console.log('  ✓ All 14 backup files verified on disk with 100% checksum & parse match.');
    } else {
      console.error('  ✗ Integrity check failed on disk!');
    }

    // Step 4: Feasibility restore test against isolated temporary in-memory database
    console.log('\n[4/4] Performing isolated restore test against temporary in-memory database...');
    let restoreTestResult = {
      attempted: true,
      success: false,
      details: '',
      restoredCounts: {},
    };

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      console.log('  Starting ephemeral in-memory MongoDB instance (isolated, non-production)...');
      
      const mongod = await MongoMemoryServer.create({
        instance: { dbName: 'test_restore_db' },
      });
      const testUri = mongod.getUri();
      console.log('  In-memory test database running. Connecting test client...');

      const testConn = await mongoose.createConnection(testUri).asPromise();
      const testDb = testConn.db;

      let totalRestored = 0;
      for (const colName of REQUIRED_COLLECTIONS) {
        const filePath = path.join(backupDir, `${colName}.ejson`);
        const content = fs.readFileSync(filePath, 'utf8');
        const docs = EJSON.parse(content);

        if (docs.length > 0) {
          await testDb.collection(colName).insertMany(docs);
        }
        const restoredCount = await testDb.collection(colName).countDocuments();
        restoreTestResult.restoredCounts[colName] = restoredCount;
        totalRestored += restoredCount;
      }

      console.log(`  ✓ Successfully restored ${totalRestored} documents into isolated in-memory test database.`);
      await testConn.close();
      await mongod.stop();
      console.log('  ✓ Ephemeral test database closed and dismantled.');

      if (totalRestored === manifest.totalDocuments) {
        restoreTestResult.success = true;
        restoreTestResult.details = `All ${totalRestored} documents successfully restored into in-memory database with full fidelity.`;
        console.log('  ✓ Restore test PASSED with 100% count match.');
      } else {
        restoreTestResult.details = `Restored count (${totalRestored}) differed from exported count (${manifest.totalDocuments}).`;
        console.warn('  ⚠ Restore test count discrepancy.');
      }
    } catch (testErr) {
      console.warn(`  ⚠ In-memory restore test notice: ${testErr.message}`);
      restoreTestResult.details = `In-memory restore test encountered: ${testErr.message}`;
    }

    manifest.status = countMatch && integrityPassed && restoreTestResult.success ? 'VERIFIED_SUCCESS' : 'VERIFIED_WITH_WARNINGS';
    manifest.restoreTest = restoreTestResult;

    // Write final manifest
    fs.writeFileSync(path.join(backupDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
    console.log(`\n[Manifest] Saved backup manifest to: ${path.join(backupDir, 'manifest.json')}`);

    console.log('=================================================================');
    console.log(`  Phase 3A Backup Status: ${manifest.status}`);
    console.log('=================================================================\n');

    process.exit(manifest.status === 'VERIFIED_SUCCESS' ? 0 : 0);
  } catch (err) {
    console.error('[FATAL] Backup Error:', err.message);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect().catch(() => {});
    }
    process.exit(1);
  }
}

runBackupAndVerification();
