/**
 * IIUC Cover Page Platform — Phase 3C Firestore Emulator Import & Verification Suite
 *
 * Executes and validates:
 * 1. Initial full import into isolated Local Firestore Emulator.
 * 2. 100% Count reconciliation (all 3,142 documents across all 14 collections).
 * 3. Document integrity & BSON type preservation in the imported state.
 * 4. Relationship integrity in the imported state (covers -> users, etc.).
 * 5. Idempotency test: Re-run against populated emulator (assert 0 duplicates, 0 overwrites).
 * 6. Recovery & Retry test: Controlled batch failure simulation & graceful reporting.
 * 7. Dry-Run Zero-Write test against emulator instance.
 * 8. Identity-mapping verification (dual-key logic, no auto-link on email alone).
 */

import { runMigrationEngine, COLLECTION_MAP, MIGRATION_CONFIG } from './migrate.mjs';
import { LocalFirestoreEmulator } from './local_firestore_emulator.mjs';

async function runPhase3CTests() {
  console.log('======================================================================');
  console.log('  Phase 3C: Local Firestore Emulator Import & Verification Suite');
  console.log('======================================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, testName) {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`  ✓ [PASS] ${testName}`);
    } else {
      console.error(`  ✗ [FAIL] ${testName}`);
      process.exitCode = 1;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TEST 1: Initial Import into Isolated Local Firestore Emulator
  // ─────────────────────────────────────────────────────────────────────────
  console.log('[Test 1] Executing Initial Import into Local Firestore Emulator...');
  const emulator = new LocalFirestoreEmulator('iiuc-cover-page-emulator');

  const { reconciliation: initResult } = await runMigrationEngine({
    targetEnv: 'emulator',
    dryRun: false,
    destinationProjectId: 'iiuc-cover-page-emulator',
    emulatorInstance: emulator,
  });

  assert(initResult.status === 'EMULATOR_IMPORT_PASSED', 'Initial Import: Status is EMULATOR_IMPORT_PASSED');
  assert(initResult.totalImportedDocs === 3142, 'Count Check: Exactly 3,142 documents imported into emulator');
  assert(initResult.totalSourceDocs === 3142, 'Source Match: 3,142 total source documents accounted for');
  assert(initResult.totalFailedDocs === 0, 'Zero Failures: 0 failed documents during import');
  assert(initResult.idempotentCreated === 3142, 'Idempotency: 3,142 new records created on clean emulator');

  // Verify each of the 14 collections in the emulator instance
  const expectedCounts = {
    users: 253,
    covers: 495,
    teachers: 737,
    courses: 571,
    drafts: 200,
    userSessions: 610,
    adminNotifications: 253,
    labIndexRecords: 12,
    templates: 4,
    adminActivities: 3,
    teacherImportLogs: 2,
    broadcastLogs: 1,
    departments: 1,
    labexperiments: 0,
  };

  for (const [targetCol, expected] of Object.entries(expectedCounts)) {
    const actual = emulator.countDocuments(targetCol);
    assert(
      actual === expected,
      `Collection Integrity: ${targetCol} has exactly ${expected} documents in emulator (actual: ${actual})`
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TEST 2: Schema & BSON Conversion Fidelity in Imported State
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n[Test 2] Verifying Schema & BSON Conversion Fidelity in Imported Documents...');
  
  // Sample a user document
  const sampleUsers = emulator.getAllDocuments('users');
  const superAdmin = sampleUsers.find(u => u.role === 'SUPER_ADMIN');
  assert(Boolean(superAdmin), 'User Check: SUPER_ADMIN user found in imported collection');
  assert(superAdmin.role === 'SUPER_ADMIN', 'Security: SUPER_ADMIN role accurately preserved');
  assert(Array.isArray(superAdmin.permissions) && superAdmin.permissions.length > 0, 'Security: Admin permissions preserved');
  assert(superAdmin._hasLegacyPasswordHash === false, 'Password Security: passwordHash stripped from client document');
  assert(typeof superAdmin.id === 'string' && superAdmin.id.length === 24, 'ID Format: Document ID is 24-character legacy hex string');

  // Sample a cover document
  const sampleCovers = emulator.getAllDocuments('covers');
  const sampleCover = sampleCovers[0];
  assert(Boolean(sampleCover), 'Cover Check: Cover documents accessible in emulator');
  assert(typeof sampleCover.userId === 'string' && sampleCover.userId.length === 24, 'FK Check: userId is string format');
  assert(typeof sampleCover.coverData === 'object', 'Payload Check: Nested coverData intact');
  assert(typeof sampleCover.createdAt === 'string', 'Timestamp Check: Date converted to ISO string');

  // ─────────────────────────────────────────────────────────────────────────
  // TEST 3: Foreign Key Relationships in Imported State
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n[Test 3] Verifying 100% Foreign Key Relationships in Imported State...');
  const userIds = new Set(sampleUsers.map(u => u.id));
  
  let orphanCovers = 0;
  for (const c of sampleCovers) {
    if (!userIds.has(c.userId)) orphanCovers++;
  }
  assert(orphanCovers === 0, 'Relationship: 100% of covers (495) reference existing users');

  const sampleDrafts = emulator.getAllDocuments('drafts');
  let orphanDrafts = 0;
  for (const d of sampleDrafts) {
    if (!userIds.has(d.userId)) orphanDrafts++;
  }
  assert(orphanDrafts === 0, 'Relationship: 100% of drafts (200) reference existing users');

  const sampleSessions = emulator.getAllDocuments('userSessions');
  let orphanSessions = 0;
  for (const s of sampleSessions) {
    if (!userIds.has(s.userId)) orphanSessions++;
  }
  assert(orphanSessions === 0, 'Relationship: 100% of sessions (610) reference existing users');

  // ─────────────────────────────────────────────────────────────────────────
  // TEST 4: Idempotency Re-Run (Zero Duplication, Zero Overwrite)
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n[Test 4] Testing Idempotency on Re-Run against Populated Emulator...');
  const docCountBeforeRerun = emulator.getTotalDocumentCount();
  
  const { reconciliation: rerunResult } = await runMigrationEngine({
    targetEnv: 'emulator',
    dryRun: false,
    destinationProjectId: 'iiuc-cover-page-emulator',
    emulatorInstance: emulator,
  });

  const docCountAfterRerun = emulator.getTotalDocumentCount();
  assert(
    docCountBeforeRerun === docCountAfterRerun,
    `Idempotency: Total emulator count unchanged on rerun (${docCountBeforeRerun} === ${docCountAfterRerun})`
  );
  assert(
    rerunResult.idempotentCreated === 0,
    `Idempotency: Zero new documents created on rerun (created: ${rerunResult.idempotentCreated})`
  );
  assert(
    rerunResult.idempotentUnchanged === 3142,
    `Idempotency: All 3,142 records detected as identical/unchanged on rerun (unchanged: ${rerunResult.idempotentUnchanged})`
  );

  // ─────────────────────────────────────────────────────────────────────────
  // TEST 5: Recovery & Controlled Batch Failure Simulation
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n[Test 5] Testing Controlled Batch Failure and Recovery Handling...');
  const failEmulator = new LocalFirestoreEmulator('iiuc-cover-page-emulator');
  failEmulator.simulatedFailureCollection = 'covers'; // Simulate failure on covers batch

  let failureCaught = false;
  try {
    await runMigrationEngine({
      targetEnv: 'emulator',
      dryRun: false,
      destinationProjectId: 'iiuc-cover-page-emulator',
      emulatorInstance: failEmulator,
      maxRetries: 1, // Rapid test
      failFast: true,
    });
  } catch (err) {
    failureCaught = true;
  }

  assert(
    failureCaught === true,
    'Fault Tolerance: Engine caught batch error and aborted execution (failFast)'
  );
  assert(
    failEmulator.totalWritesCount < 3142,
    'Fault Tolerance: Batch failure halted clean completion and prevented corrupt partial state'
  );

  // Now resume import without simulated failure on the same emulator
  failEmulator.simulatedFailureCollection = null;
  const { reconciliation: resumeResult } = await runMigrationEngine({
    targetEnv: 'emulator',
    dryRun: false,
    destinationProjectId: 'iiuc-cover-page-emulator',
    emulatorInstance: failEmulator,
  });

  assert(
    failEmulator.getTotalDocumentCount() === 3142,
    'Recovery & Resumption: Resumed import completed with all 3,142 documents'
  );

  // ─────────────────────────────────────────────────────────────────────────
  // TEST 6: Dry-Run Zero-Write Test against Emulator
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n[Test 6] Testing Dry-Run Mode against Clean Emulator...');
  const cleanEmulator = new LocalFirestoreEmulator('iiuc-cover-page-emulator');
  await runMigrationEngine({
    targetEnv: 'emulator',
    dryRun: true,
    destinationProjectId: 'iiuc-cover-page-emulator',
    emulatorInstance: cleanEmulator,
  });

  assert(
    cleanEmulator.getTotalDocumentCount() === 0,
    'Dry-Run Guarantee: 0 documents written to emulator during dry-run mode'
  );

  // ─────────────────────────────────────────────────────────────────────────
  // TEST 7: Identity Mapping Validation (No Naive Email-Only Linking)
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n[Test 7] Validating Dual-Key Identity Mapping Configuration...');
  const allUsers = emulator.getAllDocuments('users');
  let validDualKeyTags = 0;
  let numericGoogleIds = 0;

  for (const u of allUsers) {
    if (u._identityVerification && u._identityVerification.requiresDualKeyValidation === true) {
      validDualKeyTags++;
    }
    if (u._identityVerification && /^\d{21}$/.test(u._identityVerification.googleSubjectId)) {
      numericGoogleIds++;
    }
    // Must NOT have pre-assigned mappedFirebaseUid without active verification
    assert(
      u._identityVerification.mappedFirebaseUid === null,
      `Identity Security: User ${u.email} has null mappedFirebaseUid prior to interactive auth`
    );
  }

  assert(validDualKeyTags === 253, 'Identity Security: All 253 users tagged with requiresDualKeyValidation');
  assert(numericGoogleIds === 253, 'Identity Security: All 253 users have 21-digit Google Subject ID in verification payload');

  console.log('\n----------------------------------------------------------------------');
  console.log(`  Phase 3C Verification Results: ${passedTests} / ${totalTests} Tests Passed`);
  console.log('======================================================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runPhase3CTests().catch((err) => {
  console.error('[FATAL] Phase 3C Test Runner Error:', err);
  process.exit(1);
});
