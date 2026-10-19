/**
 * Phase 3G-B: Official Firestore Emulator Security Rules Unit Test Suite
 *
 * SAFETY INVARIANTS:
 * 1. Strictly Offline & Local: Connects exclusively to the local emulator at 127.0.0.1:8080.
 * 2. Zero Cloud Access: Never connects to or writes to Google Cloud, production, or live staging.
 * 3. Zero Real Data: Uses synthetic test fixtures seeded via withSecurityRulesDisabled().
 * 4. Zero REST Token Shortcuts: Employs @firebase/rules-unit-testing and Firebase Client SDK
 *    (assertSucceeds, assertFails, authenticatedContext, unauthenticatedContext).
 * 5. Complete 18-Scenario Matrix: Covers all 12 core requirements + targeted security gap tests.
 */

import test, { describe, before, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} from '@firebase/rules-unit-testing';

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  where,
  writeBatch,
} from 'firebase/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ID = 'iiuc-cover-page-staging';
const EMULATOR_HOST = '127.0.0.1';
const EMULATOR_PORT = 8080;
const RULES_PATH = path.resolve(__dirname, '../../firestore.rules');

let testEnv;

// Synthetic Fixture IDs
const STUDENT_A_UID = 'studentA_uid_1234';
const STUDENT_B_UID = 'studentB_uid_5678';
const ADMIN_UID = 'admin_uid_9999';
const LEGACY_MONGO_ID_A = '6a7ebc6edf85c8fcd46865d6';
const LEGACY_MONGO_ID_B = '6a7ebc6edf85c8fcd46865d7';

describe('Phase 3G-B: Official Firestore Security Rules Verification', () => {
  before(async () => {
    const rules = fs.readFileSync(RULES_PATH, 'utf8');

    testEnv = await initializeTestEnvironment({
      projectId: PROJECT_ID,
      firestore: {
        host: EMULATOR_HOST,
        port: EMULATOR_PORT,
        rules,
      },
    });
  });

  after(async () => {
    if (testEnv) {
      await testEnv.cleanup();
    }
  });

  beforeEach(async () => {
    // Clear and seed clean synthetic fixtures before each test
    await testEnv.clearFirestore();

    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();

      // Seed Student A Profile (keyed by UID)
      await setDoc(doc(db, 'users', STUDENT_A_UID), {
        name: 'Student A',
        studentId: 'C233093',
        department: 'CSE',
        batch: '60',
        semester: '5th',
        section: 'A',
        role: 'STUDENT',
        accountStatus: 'ACTIVE',
        permissions: [],
        createdAt: new Date().toISOString(),
      });

      // Seed Student B Profile (keyed by UID)
      await setDoc(doc(db, 'users', STUDENT_B_UID), {
        name: 'Student B',
        studentId: 'C233094',
        department: 'EEE',
        batch: '59',
        semester: '6th',
        section: 'B',
        role: 'STUDENT',
        accountStatus: 'ACTIVE',
        permissions: [],
        createdAt: new Date().toISOString(),
      });

      // Seed Legacy Student Document (keyed by 24-char MongoDB ObjectId)
      await setDoc(doc(db, 'users', LEGACY_MONGO_ID_A), {
        name: 'Legacy Student A',
        studentId: 'C211001',
        department: 'CSE',
        role: 'STUDENT',
        accountStatus: 'ACTIVE',
        permissions: [],
        legacyMongoId: LEGACY_MONGO_ID_A,
      });

      // Seed Covers
      await setDoc(doc(db, 'covers', 'cover_A_01'), {
        userId: STUDENT_A_UID,
        templateId: 'tpl_modern_01',
        coverType: 'assignment',
        coverData: { title: 'Data Structures' },
      });

      await setDoc(doc(db, 'covers', 'cover_B_01'), {
        userId: STUDENT_B_UID,
        templateId: 'tpl_classic_01',
        coverType: 'lab_report',
        coverData: { title: 'Circuit Analysis' },
      });

      await setDoc(doc(db, 'covers', 'legacy_cover_01'), {
        userId: LEGACY_MONGO_ID_A,
        templateId: 'tpl_standard',
        coverType: 'assignment',
        coverData: { title: 'Algorithms' },
      });

      // Seed Drafts
      await setDoc(doc(db, 'drafts', 'draft_A_01'), {
        userId: STUDENT_A_UID,
        templateId: 'tpl_modern_01',
        coverData: { title: 'Draft Cover' },
      });

      // Seed Lab Index Records
      await setDoc(doc(db, 'labIndexRecords', 'lab_A_01'), {
        userId: STUDENT_A_UID,
        courseCode: 'CSE-2311',
        experiments: [{ index: 1, name: 'Binary Trees' }],
      });

      // Seed Public Catalogs
      await setDoc(doc(db, 'courses', 'cse_101'), {
        code: 'CSE-101',
        title: 'Structured Programming',
        department: 'CSE',
      });

      await setDoc(doc(db, 'teachers', 'tea_01'), {
        name: 'Dr. Academic',
        designation: 'Professor',
        department: 'CSE',
      });

      await setDoc(doc(db, 'templates', 'tpl_01'), {
        title: 'IIUC Official Assignment Template',
        version: '2.0',
      });

      await setDoc(doc(db, 'departments', 'dept_cse'), {
        code: 'CSE',
        name: 'Computer Science and Engineering',
      });

      await setDoc(doc(db, 'labexperiments', 'exp_01'), {
        code: 'CSE-2311-01',
        title: 'Singly Linked List',
      });

      // Seed Admin Collections
      await setDoc(doc(db, 'adminActivities', 'act_01'), {
        adminId: ADMIN_UID,
        action: 'UPDATE_CATALOG',
        timestamp: new Date().toISOString(),
      });

      await setDoc(doc(db, 'adminNotifications', 'notif_01'), {
        title: 'System Alert',
        message: 'Backup completed',
      });

      await setDoc(doc(db, 'broadcastLogs', 'log_01'), {
        subject: 'Welcome to Spring 2026',
        recipientsCount: 250,
      });

      await setDoc(doc(db, 'teacherImportLogs', 'import_01'), {
        importedCount: 737,
        status: 'SUCCESS',
      });

      // Seed User Session
      await setDoc(doc(db, 'userSessions', 'session_A_01'), {
        userId: STUDENT_A_UID,
        ipAddress: '127.0.0.1',
        userAgent: 'TestClient/1.0',
        loginTime: new Date().toISOString(),
      });
    });
  });

  // Context Factory Helpers
  const getUnauthDb = () => testEnv.unauthenticatedContext().firestore();

  const getStudentADb = (claims = {}) =>
    testEnv
      .authenticatedContext(STUDENT_A_UID, {
        email: 'c233093@ugrad.iiuc.ac.bd',
        email_verified: true,
        role: 'STUDENT',
        ...claims,
      })
      .firestore();

  const getStudentBDb = (claims = {}) =>
    testEnv
      .authenticatedContext(STUDENT_B_UID, {
        email: 'c233094@ugrad.iiuc.ac.bd',
        email_verified: true,
        role: 'STUDENT',
        ...claims,
      })
      .firestore();

  const getAdminDb = (role = 'SUPER_ADMIN') =>
    testEnv
      .authenticatedContext(ADMIN_UID, {
        email: 'admin@iiuc.ac.bd',
        email_verified: true,
        role,
      })
      .firestore();

  // ───────────────────────────────────────────────────────────────────────────
  // TEST MATRIX ITEM 1: Unauthenticated access denied to private collections
  // ───────────────────────────────────────────────────────────────────────────
  test('1. Unauthenticated access to private user, cover, and draft documents is denied', async () => {
    const db = getUnauthDb();

    await assertFails(getDoc(doc(db, 'users', STUDENT_A_UID)));
    await assertFails(getDoc(doc(db, 'covers', 'cover_A_01')));
    await assertFails(getDoc(doc(db, 'drafts', 'draft_A_01')));
    await assertFails(getDoc(doc(db, 'labIndexRecords', 'lab_A_01')));
    await assertFails(getDoc(doc(db, 'userSessions', 'session_A_01')));
  });

  // ───────────────────────────────────────────────────────────────────────────
  // TEST MATRIX ITEM 2: Student can read own permitted profile
  // ───────────────────────────────────────────────────────────────────────────
  test('2. A student can read their own permitted profile', async () => {
    const db = getStudentADb();
    await assertSucceeds(getDoc(doc(db, 'users', STUDENT_A_UID)));
  });

  // ───────────────────────────────────────────────────────────────────────────
  // TEST MATRIX ITEM 3: Student cannot read another student's private profile
  // ───────────────────────────────────────────────────────────────────────────
  test("3. A student cannot read another student's private profile", async () => {
    const db = getStudentADb();
    await assertFails(getDoc(doc(db, 'users', STUDENT_B_UID)));
  });

  // ───────────────────────────────────────────────────────────────────────────
  // TEST MATRIX ITEM 4: Student cannot create or assign an administrator role
  // ───────────────────────────────────────────────────────────────────────────
  test('4. A student cannot create or assign an administrator role or elevate permissions', async () => {
    const newStudentUid = 'new_student_uid_777';
    const attackerDb = testEnv
      .authenticatedContext(newStudentUid, {
        email: 'attacker@ugrad.iiuc.ac.bd',
        email_verified: true,
        role: 'STUDENT',
      })
      .firestore();

    // Attempt 1: Self-assign role 'ADMIN'
    await assertFails(
      setDoc(doc(attackerDb, 'users', newStudentUid), {
        name: 'Attacker',
        role: 'ADMIN',
        accountStatus: 'ACTIVE',
        permissions: [],
      })
    );

    // Attempt 2: Self-assign role 'SUPER_ADMIN'
    await assertFails(
      setDoc(doc(attackerDb, 'users', newStudentUid), {
        name: 'Attacker',
        role: 'SUPER_ADMIN',
        accountStatus: 'ACTIVE',
        permissions: [],
      })
    );

    // Attempt 3: Inject permissions
    await assertFails(
      setDoc(doc(attackerDb, 'users', newStudentUid), {
        name: 'Attacker',
        role: 'STUDENT',
        accountStatus: 'ACTIVE',
        permissions: ['MANAGE_USERS', 'MANAGE_ROLES'],
      })
    );

    // Valid student profile creation succeeds
    await assertSucceeds(
      setDoc(doc(attackerDb, 'users', newStudentUid), {
        name: 'Legitimate Student',
        studentId: 'C233099',
        department: 'CSE',
        role: 'STUDENT',
        accountStatus: 'ACTIVE',
        permissions: [],
      })
    );
  });

  // ───────────────────────────────────────────────────────────────────────────
  // TEST MATRIX ITEM 5: Student cannot modify protected role fields on update
  // ───────────────────────────────────────────────────────────────────────────
  test('5. A student cannot alter protected role, account status, or permission fields via update', async () => {
    const db = getStudentADb();

    // Attempt to escalate role
    await assertFails(updateDoc(doc(db, 'users', STUDENT_A_UID), { role: 'SUPER_ADMIN' }));

    // Attempt to alter account status
    await assertFails(updateDoc(doc(db, 'users', STUDENT_A_UID), { accountStatus: 'SUSPENDED' }));

    // Attempt to inject permissions
    await assertFails(updateDoc(doc(db, 'users', STUDENT_A_UID), { permissions: ['ADMIN'] }));

    // Whitelisted update (name, department, batch) succeeds
    await assertSucceeds(
      updateDoc(doc(db, 'users', STUDENT_A_UID), {
        name: 'Student A Updated',
        department: 'CSE',
        batch: '61',
        updatedAt: new Date().toISOString(),
      })
    );
  });

  // ───────────────────────────────────────────────────────────────────────────
  // TEST MATRIX ITEM 6: Cover and draft ownership policies & transfer denial
  // ───────────────────────────────────────────────────────────────────────────
  test('6. Cover and draft ownership policies are enforced, including ownership-transfer denial', async () => {
    const dbA = getStudentADb();
    const dbB = getStudentBDb();

    // Read: Student A reads own cover; Student B reading Student A's cover is denied
    await assertSucceeds(getDoc(doc(dbA, 'covers', 'cover_A_01')));
    await assertFails(getDoc(doc(dbB, 'covers', 'cover_A_01')));

    // Create: Student A can create cover with matching userId
    await assertSucceeds(
      setDoc(doc(dbA, 'covers', 'new_cover_A'), {
        userId: STUDENT_A_UID,
        templateId: 'tpl_01',
        coverType: 'assignment',
        coverData: { course: 'CSE-101' },
      })
    );

    // Create: Student A attempting to create cover with Student B's userId is denied
    await assertFails(
      setDoc(doc(dbA, 'covers', 'spoofed_cover'), {
        userId: STUDENT_B_UID,
        templateId: 'tpl_01',
        coverType: 'assignment',
        coverData: { course: 'CSE-101' },
      })
    );

    // Update: Student A can update coverData of own cover
    await assertSucceeds(
      updateDoc(doc(dbA, 'covers', 'cover_A_01'), {
        userId: STUDENT_A_UID,
        coverData: { title: 'Updated Assignment Title' },
      })
    );

    // Update: Student A attempting ownership transfer (changing userId to Student B) is DENIED
    await assertFails(
      updateDoc(doc(dbA, 'covers', 'cover_A_01'), {
        userId: STUDENT_B_UID,
        coverData: { title: 'Transferred Assignment' },
      })
    );

    // Delete: Student A can delete own cover; Student B cannot delete Student A's cover
    await assertFails(deleteDoc(doc(dbB, 'covers', 'cover_A_01')));
    await assertSucceeds(deleteDoc(doc(dbA, 'covers', 'cover_A_01')));

    // Draft: Student A reads own draft; Student B denied
    await assertSucceeds(getDoc(doc(dbA, 'drafts', 'draft_A_01')));
    await assertFails(getDoc(doc(dbB, 'drafts', 'draft_A_01')));
  });

  // ───────────────────────────────────────────────────────────────────────────
  // TEST MATRIX ITEM 7: Public catalog reads work for unauthenticated users
  // ───────────────────────────────────────────────────────────────────────────
  test('7. Public catalog reads work for unauthenticated users (guest cover generation)', async () => {
    const db = getUnauthDb();

    await assertSucceeds(getDoc(doc(db, 'courses', 'cse_101')));
    await assertSucceeds(getDoc(doc(db, 'teachers', 'tea_01')));
    await assertSucceeds(getDoc(doc(db, 'templates', 'tpl_01')));
    await assertSucceeds(getDoc(doc(db, 'departments', 'dept_cse')));
    await assertSucceeds(getDoc(doc(db, 'labexperiments', 'exp_01')));

    // Listing / collection queries allowed for public catalogs
    await assertSucceeds(getDocs(collection(db, 'courses')));
    await assertSucceeds(getDocs(collection(db, 'teachers')));
  });

  // ───────────────────────────────────────────────────────────────────────────
  // TEST MATRIX ITEM 8: Student writes to public catalog collections are denied
  // ───────────────────────────────────────────────────────────────────────────
  test('8. Student writes to protected catalog collections are denied', async () => {
    const db = getStudentADb();

    await assertFails(setDoc(doc(db, 'courses', 'cse_999'), { title: 'Hacked Course' }));
    await assertFails(updateDoc(doc(db, 'teachers', 'tea_01'), { name: 'Hacked Teacher' }));
    await assertFails(deleteDoc(doc(db, 'templates', 'tpl_01')));
    await assertFails(setDoc(doc(db, 'departments', 'dept_fake'), { name: 'Fake Dept' }));
    await assertFails(deleteDoc(doc(db, 'labexperiments', 'exp_01')));
  });

  // ───────────────────────────────────────────────────────────────────────────
  // TEST MATRIX ITEM 9: Admin access verified using actual role claims
  // ───────────────────────────────────────────────────────────────────────────
  test('9. Administrator operations are allowed only under authentic role authorization claims', async () => {
    const adminDb = getAdminDb('SUPER_ADMIN');
    const studentDb = getStudentADb();

    // Admin can write to catalog
    await assertSucceeds(
      updateDoc(doc(adminDb, 'courses', 'cse_101'), {
        title: 'Structured Programming Language (Updated by Admin)',
      })
    );

    // Admin can read governance audit logs
    await assertSucceeds(getDoc(doc(adminDb, 'adminActivities', 'act_01')));
    await assertSucceeds(getDoc(doc(adminDb, 'adminNotifications', 'notif_01')));
    await assertSucceeds(getDoc(doc(adminDb, 'broadcastLogs', 'log_01')));
    await assertSucceeds(getDoc(doc(adminDb, 'teacherImportLogs', 'import_01')));

    // Student denied from governance audit logs
    await assertFails(getDoc(doc(studentDb, 'adminActivities', 'act_01')));
    await assertFails(getDoc(doc(studentDb, 'adminNotifications', 'notif_01')));
    await assertFails(getDoc(doc(studentDb, 'broadcastLogs', 'log_01')));
    await assertFails(getDoc(doc(studentDb, 'teacherImportLogs', 'import_01')));

    // Admin can read any student profile
    await assertSucceeds(getDoc(doc(adminDb, 'users', STUDENT_A_UID)));

    // MODERATOR role also satisfies isAdmin()
    const modDb = getAdminDb('MODERATOR');
    await assertSucceeds(getDoc(doc(modDb, 'adminActivities', 'act_01')));
  });

  // ───────────────────────────────────────────────────────────────────────────
  // TEST MATRIX ITEM 10: Legacy MongoDB identity mapping fails closed
  // ───────────────────────────────────────────────────────────────────────────
  test('10. Legacy MongoDB identity mapping fails closed when required verified claims are absent or incorrect', async () => {
    // Case A: Student has normal UID auth, but NO mongoId claim -> Denied access to legacy doc
    const unmappedStudentDb = getStudentADb();
    await assertFails(getDoc(doc(unmappedStudentDb, 'users', LEGACY_MONGO_ID_A)));
    await assertFails(getDoc(doc(unmappedStudentDb, 'covers', 'legacy_cover_01')));

    // Case B: Student has incorrect / mismatched mongoId claim -> Denied access
    const mismatchedStudentDb = getStudentADb({ mongoId: LEGACY_MONGO_ID_B });
    await assertFails(getDoc(doc(mismatchedStudentDb, 'users', LEGACY_MONGO_ID_A)));
    await assertFails(getDoc(doc(mismatchedStudentDb, 'covers', 'legacy_cover_01')));

    // Case C: Student has cryptographically verified matching mongoId claim -> Succeeds
    const verifiedMappedStudentDb = getStudentADb({ mongoId: LEGACY_MONGO_ID_A });
    await assertSucceeds(getDoc(doc(verifiedMappedStudentDb, 'users', LEGACY_MONGO_ID_A)));
    await assertSucceeds(getDoc(doc(verifiedMappedStudentDb, 'covers', 'legacy_cover_01')));
  });

  // ───────────────────────────────────────────────────────────────────────────
  // TEST MATRIX ITEM 11: Unknown paths and nested subcollections denied by default
  // ───────────────────────────────────────────────────────────────────────────
  test('11. Unknown paths and protected nested collections are denied by default fallback', async () => {
    const db = getStudentADb();

    // Unknown top-level collection
    await assertFails(getDoc(doc(db, 'unlistedCollection', 'doc123')));
    await assertFails(setDoc(doc(db, 'unlistedCollection', 'doc123'), { foo: 'bar' }));

    // Nested subcollection under user doc (not explicitly matched)
    await assertFails(getDoc(doc(db, 'users', STUDENT_A_UID, 'secretTokens', 'tok1')));
    await assertFails(
      setDoc(doc(db, 'users', STUDENT_A_UID, 'secretTokens', 'tok1'), { secret: '123' })
    );

    // Nested subcollection under public catalog
    await assertFails(getDoc(doc(db, 'courses', 'cse_101', 'examQuestions', 'q1')));
  });

  // ───────────────────────────────────────────────────────────────────────────
  // TEST MATRIX ITEM 12: Batch write authorization defense & atomic rollback
  // ───────────────────────────────────────────────────────────────────────────
  test('12. A batch containing an unauthorized write fails atomically without allowing unauthorized mutations', async () => {
    const db = getStudentADb();
    const batch = writeBatch(db);

    // Operation 1: Authorized write (Student A's own cover)
    const validCoverRef = doc(db, 'covers', 'batch_test_cover');
    batch.set(validCoverRef, {
      userId: STUDENT_A_UID,
      templateId: 'tpl_01',
      coverType: 'assignment',
      coverData: { title: 'Batch Cover' },
    });

    // Operation 2: Unauthorized write (Modifying public course catalog)
    const unauthorizedCourseRef = doc(db, 'courses', 'cse_101');
    batch.update(unauthorizedCourseRef, { title: 'Hacked Via Batch' });

    // The batch MUST fail
    await assertFails(batch.commit());

    // Verify atomic rollback: Neither write was committed
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.firestore();

      const coverSnap = await getDoc(doc(adminDb, 'covers', 'batch_test_cover'));
      assert.strictEqual(coverSnap.exists(), false, 'Authorized write was rolled back atomically');

      const courseSnap = await getDoc(doc(adminDb, 'courses', 'cse_101'));
      assert.strictEqual(
        courseSnap.data().title,
        'Structured Programming',
        'Course catalog remained untouched'
      );
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // TARGETED GAP TEST 13: Academic email verification requirement on profile creation
  // ───────────────────────────────────────────────────────────────────────────
  test('13. Institutional email domain and email_verified=true are strictly required for profile creation', async () => {
    // Case A: IIUC email, but email_verified is false -> Denied
    const unverifiedUid = 'unverified_student_uid';
    const unverifiedDb = testEnv
      .authenticatedContext(unverifiedUid, {
        email: 'c233095@ugrad.iiuc.ac.bd',
        email_verified: false,
        role: 'STUDENT',
      })
      .firestore();

    await assertFails(
      setDoc(doc(unverifiedDb, 'users', unverifiedUid), {
        name: 'Unverified Student',
        studentId: 'C233095',
        department: 'CSE',
        role: 'STUDENT',
        accountStatus: 'ACTIVE',
        permissions: [],
      })
    );

    // Case B: Verified email, but non-institutional domain (@gmail.com) -> Denied
    const gmailUid = 'gmail_user_uid';
    const gmailDb = testEnv
      .authenticatedContext(gmailUid, {
        email: 'attacker@gmail.com',
        email_verified: true,
        role: 'STUDENT',
      })
      .firestore();

    await assertFails(
      setDoc(doc(gmailDb, 'users', gmailUid), {
        name: 'Gmail User',
        studentId: 'C233096',
        department: 'CSE',
        role: 'STUDENT',
        accountStatus: 'ACTIVE',
        permissions: [],
      })
    );
  });

  // ───────────────────────────────────────────────────────────────────────────
  // TARGETED GAP TEST 14: Unwhitelisted field mutation rejection on user update
  // ───────────────────────────────────────────────────────────────────────────
  test('14. Student cannot update fields outside the strict whitelist', async () => {
    const db = getStudentADb();

    // Attempting to modify unwhitelisted field 'cgpa'
    await assertFails(updateDoc(doc(db, 'users', STUDENT_A_UID), { cgpa: 4.0 }));

    // Attempting to modify unwhitelisted field 'creditsCompleted'
    await assertFails(updateDoc(doc(db, 'users', STUDENT_A_UID), { creditsCompleted: 140 }));

    // Whitelisted field 'academicProfile' succeeds
    await assertSucceeds(
      updateDoc(doc(db, 'users', STUDENT_A_UID), {
        academicProfile: { cgpaTarget: '3.8', notes: 'Final year' },
        updatedAt: new Date().toISOString(),
      })
    );
  });

  // ───────────────────────────────────────────────────────────────────────────
  // TARGETED GAP TEST 15: Collection query data isolation & security rules
  // ───────────────────────────────────────────────────────────────────────────
  test('15. Collection queries without student identity filter are denied; filtered queries succeed', async () => {
    const db = getStudentADb();

    // An unfiltered query on collection 'covers' evaluates across all docs -> Denied
    await assertFails(getDocs(collection(db, 'covers')));

    // A properly filtered query with where('userId', '==', STUDENT_A_UID) -> Succeeds
    const q = query(collection(db, 'covers'), where('userId', '==', STUDENT_A_UID));
    await assertSucceeds(getDocs(q));
  });

  // ───────────────────────────────────────────────────────────────────────────
  // TARGETED GAP TEST 16: User sessions client write denial & read isolation
  // ───────────────────────────────────────────────────────────────────────────
  test('16. Direct student writes to userSessions are denied; student can read only their own sessions', async () => {
    const dbA = getStudentADb();
    const dbB = getStudentBDb();

    // Direct client write to sessions is denied (server-only)
    await assertFails(
      setDoc(doc(dbA, 'userSessions', 'forged_session'), {
        userId: STUDENT_A_UID,
        ipAddress: '10.0.0.1',
      })
    );

    // Student A can read their own session
    await assertSucceeds(getDoc(doc(dbA, 'userSessions', 'session_A_01')));

    // Student B cannot read Student A's session
    await assertFails(getDoc(doc(dbB, 'userSessions', 'session_A_01')));
  });

  // ───────────────────────────────────────────────────────────────────────────
  // TARGETED GAP TEST 17: User profile deletion is restricted to administrators
  // ───────────────────────────────────────────────────────────────────────────
  test('17. User profile deletion is strictly restricted to administrators', async () => {
    const studentDb = getStudentADb();
    const adminDb = getAdminDb('SUPER_ADMIN');

    // Student cannot delete their own profile
    await assertFails(deleteDoc(doc(studentDb, 'users', STUDENT_A_UID)));

    // Admin can delete student profile
    await assertSucceeds(deleteDoc(doc(adminDb, 'users', STUDENT_A_UID)));
  });

  // ───────────────────────────────────────────────────────────────────────────
  // TARGETED GAP TEST 18: Malformed or untrusted role claims fail closed
  // ───────────────────────────────────────────────────────────────────────────
  test('18. Malformed or unrecognized role claims fail closed', async () => {
    const rogueDb = testEnv
      .authenticatedContext('rogue_user_uid', {
        email: 'rogue@iiuc.ac.bd',
        email_verified: true,
        role: 'SUPER_USER', // Not in ['ADMIN', 'SUPER_ADMIN', 'MODERATOR']
      })
      .firestore();

    await assertFails(getDoc(doc(rogueDb, 'adminActivities', 'act_01')));
    await assertFails(updateDoc(doc(rogueDb, 'courses', 'cse_101'), { title: 'Rogue Title' }));
  });
});
