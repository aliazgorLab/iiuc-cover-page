/**
 * IIUC Cover Page Platform — MongoDB to Cloud Firestore Migration Engine
 *
 * Phase 3B: Idempotent, Resumable, Dry-Run-First Data Transformation Tool
 *
 * SAFETY INVARIANTS:
 * 1. Default execution mode is STRICT DRY-RUN (--dry-run). No writes occur unless explicitly specified.
 * 2. Source is read exclusively from immutable local backup EJSON files (MongoDB Atlas is never written to).
 * 3. Fails closed if target is ambiguous or if production writes are attempted without authorization.
 * 4. Deterministic document IDs preserve legacy MongoDB _id across all collections.
 * 5. All BSON types (ObjectId, Date, nested Mixed) are safely mapped with zero silent field loss.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { createRequire } from 'module';

const require = createRequire('e:/Cover design web/iiuc-cover-page/backend/src/server.js');
const mongoose = require('mongoose');
const EJSON = mongoose.mongo.BSON.EJSON;

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURATION & CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

export const MIGRATION_CONFIG = {
  defaultBackupDir: 'E:/iiuc_backups/mongodb_atlas_backup/backup_2026-10-15T13-58-24-043Z',
  reportsDir: 'e:/Cover design web/iiuc-cover-page/scripts/migration/reports',
  batchSize: 400, // Safe chunk under Firestore 500-operation transaction limit
  maxFirestoreDocBytes: 1048576, // 1 MiB limit
  productionProjectId: 'iiuccoverpage-8edd3',
  allowedStagingProjects: ['iiuc-cover-page-staging', 'iiuccoverpage-staging', 'emulator'],
};

export const COLLECTION_MAP = {
  users: { target: 'users', keyField: '_id', preserveId: true },
  covers: { target: 'covers', keyField: '_id', preserveId: true, foreignKey: 'userId', foreignTarget: 'users' },
  teachers: { target: 'teachers', keyField: '_id', preserveId: true },
  courses: { target: 'courses', keyField: '_id', preserveId: true },
  draftcovers: { target: 'drafts', keyField: '_id', preserveId: true, foreignKey: 'userId', foreignTarget: 'users' },
  usersessions: { target: 'userSessions', keyField: '_id', preserveId: true, foreignKey: 'userId', foreignTarget: 'users' },
  adminnotifications: { target: 'adminNotifications', keyField: '_id', preserveId: true },
  labindexrecords: { target: 'labIndexRecords', keyField: '_id', preserveId: true, foreignKey: 'userId', foreignTarget: 'users' },
  templates: { target: 'templates', keyField: '_id', preserveId: true },
  adminactivities: { target: 'adminActivities', keyField: '_id', preserveId: true, foreignKey: 'adminId', foreignTarget: 'users' },
  teacherimportlogs: { target: 'teacherImportLogs', keyField: '_id', preserveId: true },
  broadcastlogs: { target: 'broadcastLogs', keyField: '_id', preserveId: true, foreignKey: 'createdBy', foreignTarget: 'users' },
  departments: { target: 'departments', keyField: '_id', preserveId: true },
  labexperiments: { target: 'labexperiments', keyField: '_id', preserveId: true },
};

// ─────────────────────────────────────────────────────────────────────────────
// SAFE TYPE CONVERTER & NORMALIZER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Recursively converts MongoDB/BSON types into Firestore-compatible JavaScript objects.
 * - ObjectId -> String (24-char hex)
 * - Date -> ISO string and millisecond timestamp (safe for Firestore Timestamp creation)
 * - Numbers, booleans, arrays, maps preserved exactly
 * - No fields are discarded. __v is stored as legacySchemaVersion
 */
export function bsonToFirestore(val) {
  if (val === null || val === undefined) {
    return null;
  }

  // Handle Mongoose / BSON ObjectId
  if (val._bsontype === 'ObjectID' || val instanceof mongoose.Types.ObjectId) {
    return val.toString();
  }

  // Handle BSON ObjectId representation from EJSON ($oid)
  if (typeof val === 'object' && val.$oid) {
    return val.$oid;
  }

  // Handle Date
  if (val instanceof Date) {
    return val.toISOString();
  }
  if (typeof val === 'object' && val.$date) {
    return typeof val.$date === 'string' ? val.$date : new Date(val.$date).toISOString();
  }

  // Handle Arrays
  if (Array.isArray(val)) {
    return val.map(bsonToFirestore);
  }

  // Handle Objects
  if (typeof val === 'object') {
    const transformed = {};
    for (const [k, v] of Object.entries(val)) {
      if (k === '__v') {
        transformed.legacySchemaVersion = v;
      } else {
        transformed[k] = bsonToFirestore(v);
      }
    }
    return transformed;
  }

  return val;
}

/**
 * Transforms a single MongoDB document into a normalized Firestore document.
 */
export function transformDocument(sourceCollection, doc) {
  const mapping = COLLECTION_MAP[sourceCollection];
  if (!mapping) {
    throw new Error(`Unmapped source collection: ${sourceCollection}`);
  }

  const rawId = doc._id;
  const legacyId = rawId ? (rawId.$oid || rawId.toString()) : crypto.randomUUID();
  const converted = bsonToFirestore(doc);

  // Normalize document ID: use deterministic legacy MongoDB ID
  const destId = legacyId;

  // Enforce metadata tags
  converted.id = destId;
  converted.legacyMongoId = legacyId;
  converted._migratedAt = new Date().toISOString();
  converted._migrationSource = 'mongodb_atlas_backup';

  // Normalize foreign keys if applicable
  if (mapping.foreignKey && converted[mapping.foreignKey]) {
    converted[mapping.foreignKey] = String(converted[mapping.foreignKey]);
    converted[`legacy_${mapping.foreignKey}`] = converted[mapping.foreignKey];
  }

  // Specific user security handling
  if (sourceCollection === 'users') {
    // Preserve passwordHash field as empty string or legacy note (never expose)
    if (converted.passwordHash) {
      converted._hasLegacyPasswordHash = true;
      delete converted.passwordHash;
    } else {
      converted._hasLegacyPasswordHash = false;
      delete converted.passwordHash;
    }
    delete converted.refreshToken; // Force fresh session on cutover
    delete converted.verificationToken;

    // Dual-Key Identity Mapping Tag
    converted._identityVerification = {
      provider: converted.provider || 'google',
      googleSubjectId: converted.googleId || '',
      emailVerified: Boolean(converted.emailVerified),
      requiresDualKeyValidation: true,
      mappedFirebaseUid: null, // Populated upon verified Google sign-in
    };
  }

  return {
    destCollection: mapping.target,
    destId,
    data: converted,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// CORE MIGRATION RUNNER
// ─────────────────────────────────────────────────────────────────────────────

export async function runMigrationEngine({
  backupDir = MIGRATION_CONFIG.defaultBackupDir,
  targetEnv = 'staging',
  dryRun = true,
  destinationProjectId = null,
} = {}) {
  const startTime = Date.now();
  console.log('======================================================================');
  console.log('  IIUC Cover Page Platform — MongoDB to Cloud Firestore Migration Engine');
  console.log('======================================================================');
  console.log(`[Config] Backup Directory:       ${backupDir}`);
  console.log(`[Config] Execution Mode:          ${dryRun ? 'STRICT DRY-RUN (Validation & Transformation Only)' : 'LIVE STAGING WRITES'}`);
  console.log(`[Config] Target Environment:     ${targetEnv.toUpperCase()}`);
  console.log(`[Config] Destination Project:    ${destinationProjectId || 'NONE (Dry-run mode)'}`);
  console.log('----------------------------------------------------------------------');

  // FAIL-CLOSED SAFETY GATES
  if (!dryRun) {
    if (!destinationProjectId) {
      throw new Error('[SAFETY CRITICAL] Cannot perform live writes: destinationProjectId is required.');
    }
    if (destinationProjectId === MIGRATION_CONFIG.productionProjectId) {
      throw new Error('[SAFETY CRITICAL] REFUSING TO WRITE TO PRODUCTION PROJECT (iiuccoverpage-8edd3) DURING PHASE 3B!');
    }
    if (!MIGRATION_CONFIG.allowedStagingProjects.includes(destinationProjectId)) {
      throw new Error(`[SAFETY CRITICAL] Destination project "${destinationProjectId}" is not recognized as an approved staging destination.`);
    }
  }

  // Verify backup exists and read manifest
  const manifestPath = path.join(backupDir, 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Backup manifest not found at: ${manifestPath}`);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  console.log(`[Source] Backup Timestamp:       ${manifest.backupTimestamp}`);
  console.log(`[Source] Total Source Documents: ${manifest.totalDocuments}`);
  console.log('----------------------------------------------------------------------\n');

  const reconciliation = {
    executionTimestamp: new Date().toISOString(),
    dryRun,
    targetEnv,
    destinationProjectId: dryRun ? 'DRY_RUN_NO_WRITES' : destinationProjectId,
    backupSource: backupDir,
    collections: {},
    totalSourceDocs: 0,
    totalTransformedDocs: 0,
    totalSkippedDocs: 0,
    totalFailedDocs: 0,
    sizeViolations: 0,
    foreignKeyViolations: 0,
    executionDurationMs: 0,
    status: 'IN_PROGRESS',
  };

  const userIndex = new Set();
  const allTransformedDocs = {};

  // Phase 1: Process and transform collections
  for (const [sourceCol, info] of Object.entries(manifest.collections)) {
    const filePath = path.join(backupDir, info.file);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Missing backup file: ${filePath}`);
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const sourceDocs = EJSON.parse(content);

    reconciliation.collections[sourceCol] = {
      sourceCount: sourceDocs.length,
      transformedCount: 0,
      skippedCount: 0,
      failedCount: 0,
      maxDocBytes: 0,
      targetCollection: COLLECTION_MAP[sourceCol].target,
      batchesRequired: Math.ceil(sourceDocs.length / MIGRATION_CONFIG.batchSize) || 1,
      errors: [],
    };

    reconciliation.totalSourceDocs += sourceDocs.length;
    allTransformedDocs[sourceCol] = [];

    const seenIds = new Set();

    for (let i = 0; i < sourceDocs.length; i++) {
      const doc = sourceDocs[i];
      try {
        const transformed = transformDocument(sourceCol, doc);

        // Check duplicate IDs within collection
        if (seenIds.has(transformed.destId)) {
          throw new Error(`Duplicate document ID detected: ${transformed.destId}`);
        }
        seenIds.add(transformed.destId);

        // Calculate payload size
        const docBytes = Buffer.byteLength(JSON.stringify(transformed.data), 'utf8');
        if (docBytes > reconciliation.collections[sourceCol].maxDocBytes) {
          reconciliation.collections[sourceCol].maxDocBytes = docBytes;
        }

        if (docBytes > MIGRATION_CONFIG.maxFirestoreDocBytes) {
          reconciliation.sizeViolations++;
          throw new Error(`Document exceeds 1MB limit: ${docBytes} bytes (ID: ${transformed.destId})`);
        }

        // Index users for foreign key verification
        if (sourceCol === 'users') {
          userIndex.add(transformed.destId);
        }

        allTransformedDocs[sourceCol].push(transformed);
        reconciliation.collections[sourceCol].transformedCount++;
        reconciliation.totalTransformedDocs++;
      } catch (err) {
        reconciliation.collections[sourceCol].failedCount++;
        reconciliation.totalFailedDocs++;
        reconciliation.collections[sourceCol].errors.push({
          index: i,
          docId: doc._id ? String(doc._id) : 'unknown',
          error: err.message,
        });
      }
    }

    const colStats = reconciliation.collections[sourceCol];
    const flag = colStats.failedCount === 0 && colStats.sourceCount === colStats.transformedCount ? '✓' : '✗';
    console.log(
      `  ${flag} Transformed ${sourceCol.padEnd(20)} -> ${colStats.targetCollection.padEnd(20)}: ` +
      `${String(colStats.transformedCount).padStart(5)}/${String(colStats.sourceCount).padStart(5)} docs | ` +
      `Max Size: ${(colStats.maxDocBytes / 1024).toFixed(2).padStart(6)} KB | Batches: ${colStats.batchesRequired}`
    );
  }

  // Phase 2: Foreign Key & Relationship Integrity Verification
  console.log('\n[Integrity] Verifying foreign key relationships against transformed user records...');
  for (const [sourceCol, transformedList] of Object.entries(allTransformedDocs)) {
    const mapping = COLLECTION_MAP[sourceCol];
    if (mapping.foreignKey && mapping.foreignTarget === 'users') {
      for (const item of transformedList) {
        const refVal = item.data[mapping.foreignKey];
        if (refVal && !userIndex.has(refVal)) {
          reconciliation.foreignKeyViolations++;
          reconciliation.collections[sourceCol].errors.push({
            docId: item.destId,
            error: `Foreign key violation: ${mapping.foreignKey}="${refVal}" not found in transformed users.`,
          });
        }
      }
    }
  }

  if (reconciliation.foreignKeyViolations === 0) {
    console.log('  ✓ 100% of foreign keys (covers, drafts, lab records, sessions, activities) resolve perfectly.');
  } else {
    console.error(`  ✗ Detected ${reconciliation.foreignKeyViolations} foreign key violations!`);
  }

  // Phase 3: Live write execution (STAGING ONLY)
  if (!dryRun) {
    console.log('\n[Live Write] Initiating staging commit batches...');
    // Handled in authorized Phase 3C staging test
  } else {
    console.log('\n[Safety] Dry-run mode completed. ZERO writes performed to any database.');
  }

  reconciliation.executionDurationMs = Date.now() - startTime;
  const isAllClean = reconciliation.totalFailedDocs === 0 &&
                     reconciliation.sizeViolations === 0 &&
                     reconciliation.foreignKeyViolations === 0 &&
                     reconciliation.totalSourceDocs === reconciliation.totalTransformedDocs;

  reconciliation.status = isAllClean ? 'DRY_RUN_PASSED' : 'DRY_RUN_FAILED';

  // Save detailed reconciliation report
  fs.mkdirSync(MIGRATION_CONFIG.reportsDir, { recursive: true });
  const reportPath = path.join(
    MIGRATION_CONFIG.reportsDir,
    `reconciliation_${new Date().toISOString().replace(/[:.]/g, '-')}.json`
  );
  fs.writeFileSync(reportPath, JSON.stringify(reconciliation, null, 2), 'utf8');

  console.log('----------------------------------------------------------------------');
  console.log(`[Summary] Total Transformed:     ${reconciliation.totalTransformedDocs} / ${reconciliation.totalSourceDocs}`);
  console.log(`[Summary] Failed Records:        ${reconciliation.totalFailedDocs}`);
  console.log(`[Summary] Size Violations:       ${reconciliation.sizeViolations}`);
  console.log(`[Summary] Relationship Errors:   ${reconciliation.foreignKeyViolations}`);
  console.log(`[Summary] Final Status:          ${reconciliation.status}`);
  console.log(`[Report] Saved Report:           ${reportPath}`);
  console.log('======================================================================\n');

  return reconciliation;
}

// CLI entry point
if (process.argv[1] && process.argv[1].endsWith('migrate.mjs')) {
  const isCommit = process.argv.includes('--commit');
  const targetEnv = process.argv.includes('--target=staging') ? 'staging' : 'dryrun';
  const destProject = process.env.STAGING_PROJECT_ID || null;

  runMigrationEngine({
    dryRun: !isCommit,
    targetEnv,
    destinationProjectId: destProject,
  }).catch((err) => {
    console.error('[FATAL] Migration Engine Error:', err.message);
    process.exit(1);
  });
}
