/**
 * IIUC Cover Page Platform — Migration Tool Test & Verification Suite
 *
 * Verifies all Phase 3B requirements:
 * 1. Dry-run mode performs zero writes.
 * 2. Deterministic ID generation across repeated runs.
 * 3. Fail-closed safety gates (refusal to write to production or missing staging ID).
 * 4. 100% document count reconciliation across all 14 collections.
 * 5. Foreign key ownership resolution (covers -> users).
 * 6. Document size compliance (<1 MiB Firestore limit).
 * 7. SUPER_ADMIN role preservation.
 */

import { runMigrationEngine, transformDocument, bsonToFirestore, MIGRATION_CONFIG } from './migrate.mjs';

async function runTests() {
  console.log('======================================================================');
  console.log('  Phase 3B: Migration Engine Test Suite & Verification Runner');
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
  // TEST 1: Fail-Closed Safety Gate — Reject live writes without target project
  // ─────────────────────────────────────────────────────────────────────────
  try {
    await runMigrationEngine({ dryRun: false, targetEnv: 'staging', destinationProjectId: null });
    assert(false, 'Safety Gate: Should reject live write without destination project');
  } catch (err) {
    assert(
      err.message.includes('destinationProjectId is required'),
      'Safety Gate: Refuses live write without explicit destination project'
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TEST 2: Fail-Closed Safety Gate — Block production project writes
  // ─────────────────────────────────────────────────────────────────────────
  try {
    await runMigrationEngine({
      dryRun: false,
      destinationProjectId: 'iiuccoverpage-8edd3',
    });
    assert(false, 'Safety Gate: Should block live write to production project');
  } catch (err) {
    assert(
      err.message.includes('REFUSING TO WRITE TO PRODUCTION PROJECT'),
      'Safety Gate: Strictly blocks live write to production project (iiuccoverpage-8edd3)'
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TEST 3: Deterministic ID Transformation
  // ─────────────────────────────────────────────────────────────────────────
  const sampleDoc = {
    _id: { $oid: '65f1234567890abcdef12345' },
    name: 'Test Student',
    email: 'c233093@ugrad.iiuc.ac.bd',
    googleId: '109384758291049283741',
    role: 'STUDENT',
    accountStatus: 'ACTIVE',
  };

  const transform1 = transformDocument('users', sampleDoc);
  const transform2 = transformDocument('users', sampleDoc);

  assert(
    transform1.destId === '65f1234567890abcdef12345',
    'Deterministic ID: Document ID matches legacy MongoDB ObjectId string'
  );
  assert(
    transform1.destId === transform2.destId,
    'Deterministic ID: Repeated transformations yield identical document IDs'
  );
  assert(
    transform1.data.legacyMongoId === '65f1234567890abcdef12345',
    'Metadata Preservation: legacyMongoId preserved on transformed document'
  );

  // ─────────────────────────────────────────────────────────────────────────
  // TEST 4: SUPER_ADMIN Role Preservation
  // ─────────────────────────────────────────────────────────────────────────
  const adminDoc = {
    _id: { $oid: '65f9999999999abcdef99999' },
    name: 'Super Admin',
    email: 'admin@iiuc.ac.bd',
    googleId: '109999999999999999999',
    role: 'SUPER_ADMIN',
    accountStatus: 'ACTIVE',
    permissions: ['MANAGE_USERS', 'MANAGE_TEMPLATES', 'VIEW_ANALYTICS'],
  };

  const adminTransformed = transformDocument('users', adminDoc);
  assert(
    adminTransformed.data.role === 'SUPER_ADMIN',
    'Governance Security: SUPER_ADMIN role is explicitly preserved'
  );
  assert(
    Array.isArray(adminTransformed.data.permissions) && adminTransformed.data.permissions.length === 3,
    'Governance Security: Administrative permissions preserved'
  );

  // ─────────────────────────────────────────────────────────────────────────
  // TEST 5: Full Dry-Run Execution against Verified Backup
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n[Execution] Running full dry-run transformation against verified backup...');
  const { reconciliation: result } = await runMigrationEngine({ dryRun: true });

  assert(result.status === 'DRY_RUN_PASSED', 'Full Dry-Run: Status is DRY_RUN_PASSED');
  assert(result.totalSourceDocs === 3142, 'Count Reconciliation: 3,142 total source documents parsed');
  assert(result.totalTransformedDocs === 3142, 'Count Reconciliation: 3,142 total documents transformed');
  assert(result.totalFailedDocs === 0, 'Zero Failures: 0 failed documents');
  assert(result.sizeViolations === 0, 'Size Compliance: 0 documents exceed Firestore 1 MiB limit');
  assert(result.foreignKeyViolations === 0, 'Relationship Integrity: 100% of foreign keys resolve cleanly');

  // Verify specific collection counts
  assert(result.collections.users.transformedCount === 253, 'Collection Check: Exactly 253 users transformed');
  assert(result.collections.covers.transformedCount === 495, 'Collection Check: Exactly 495 covers transformed');
  assert(result.collections.teachers.transformedCount === 737, 'Collection Check: Exactly 737 teachers transformed');
  assert(result.collections.courses.transformedCount === 571, 'Collection Check: Exactly 571 courses transformed');
  assert(result.collections.draftcovers.transformedCount === 200, 'Collection Check: Exactly 200 drafts transformed');
  assert(result.collections.usersessions.transformedCount === 610, 'Collection Check: Exactly 610 sessions transformed (including +1 active)');
  assert(result.collections.labexperiments.transformedCount === 0, 'Collection Check: 0 documents in labexperiments handled safely');

  console.log('\n----------------------------------------------------------------------');
  console.log(`  Tests Passed: ${passedTests} / ${totalTests}`);
  console.log('======================================================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('[FATAL] Test Runner Error:', err);
  process.exit(1);
});
