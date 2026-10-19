/**
 * IIUC Cover Page Platform — Local Firestore Emulator Engine
 *
 * Implements a 100% isolated, in-memory Cloud Firestore emulator
 * adhering to strict Firestore runtime constraints:
 * - 500 operations per writeBatch limit
 * - 1,048,576 bytes (1 MiB) per-document size limit
 * - Multi-collection document hierarchy
 * - Atomic batch commits with rollback on error
 * - Idempotent upsert & change detection
 * - Controlled failure simulation for recovery testing
 *
 * ZERO network calls. ZERO connection to Google Cloud. STRICT LOCAL ISOLATION.
 */

import crypto from 'crypto';

export class LocalFirestoreEmulator {
  constructor(projectId = 'iiuc-cover-page-emulator') {
    this.projectId = projectId;
    this.databaseId = '(default)';
    this.collections = new Map(); // collectionName -> Map<docId, docData>
    this.batchLimit = 500;
    this.maxDocSizeBytes = 1048576; // 1 MiB
    this.totalWritesCount = 0;
    this.simulatedFailureBatch = null;
    this.currentBatchCount = 0;
  }

  _getCollection(collectionName) {
    if (!this.collections.has(collectionName)) {
      this.collections.set(collectionName, new Map());
    }
    return this.collections.get(collectionName);
  }

  getDoc(collectionName, docId) {
    const col = this._getCollection(collectionName);
    if (!col.has(docId)) {
      return { exists: false, id: docId, data: () => null };
    }
    // Return a clone to prevent accidental outside mutation
    const docData = JSON.parse(JSON.stringify(col.get(docId)));
    return { exists: true, id: docId, data: () => docData };
  }

  setDoc(collectionName, docId, data, options = {}) {
    const size = Buffer.byteLength(JSON.stringify(data), 'utf8');
    if (size > this.maxDocSizeBytes) {
      throw new Error(`[Firestore Limit Violation] Document ${collectionName}/${docId} size (${size} bytes) exceeds 1 MiB limit.`);
    }

    const col = this._getCollection(collectionName);
    const existing = col.get(docId);
    let isUpdate = false;
    let isUnchanged = false;

    if (existing) {
      isUpdate = true;
      if (JSON.stringify(existing) === JSON.stringify(data)) {
        isUnchanged = true;
      }
    }

    let finalData = data;
    if (options.merge && existing) {
      finalData = { ...existing, ...data };
    }

    col.set(docId, JSON.parse(JSON.stringify(finalData)));
    this.totalWritesCount++;

    return {
      id: docId,
      created: !isUpdate,
      updated: isUpdate && !isUnchanged,
      unchanged: isUnchanged,
    };
  }

  /**
   * Atomic batch commit adhering to Firestore 500-operation transaction limits
   */
  async commitBatch(operations) {
    this.currentBatchCount++;

    if (operations.length > this.batchLimit) {
      throw new Error(`[Firestore Batch Limit] Cannot commit batch of ${operations.length} operations. Firestore maximum limit is 500.`);
    }

    // Controlled failure simulation (persistent failure on target collection or batch)
    if (
      this.simulatedFailureBatch === this.currentBatchCount ||
      (this.simulatedFailureCollection && operations.some((op) => op.collection === this.simulatedFailureCollection))
    ) {
      throw new Error(`[SIMULATED_FAILURE] Injected controlled batch failure on collection/batch #${this.currentBatchCount}`);
    }

    // Snapshot current state for rollback in case of error
    const rollbackSnapshot = new Map();
    for (const op of operations) {
      const col = this._getCollection(op.collection);
      if (!rollbackSnapshot.has(op.collection)) {
        rollbackSnapshot.set(op.collection, new Map());
      }
      rollbackSnapshot.get(op.collection).set(op.id, col.has(op.id) ? JSON.parse(JSON.stringify(col.get(op.id))) : null);
    }

    const results = [];
    try {
      for (const op of operations) {
        if (op.type === 'set') {
          const res = this.setDoc(op.collection, op.id, op.data, op.options);
          results.push(res);
        } else if (op.type === 'delete') {
          const col = this._getCollection(op.collection);
          col.delete(op.id);
          results.push({ id: op.id, deleted: true });
        } else {
          throw new Error(`Unsupported batch operation type: ${op.type}`);
        }
      }
      return results;
    } catch (err) {
      // Rollback atomic snapshot on error
      for (const [colName, docs] of rollbackSnapshot.entries()) {
        const col = this._getCollection(colName);
        for (const [docId, originalData] of docs.entries()) {
          if (originalData === null) {
            col.delete(docId);
          } else {
            col.set(docId, originalData);
          }
        }
      }
      throw err;
    }
  }

  countDocuments(collectionName) {
    if (!this.collections.has(collectionName)) return 0;
    return this.collections.get(collectionName).size;
  }

  getAllDocuments(collectionName) {
    if (!this.collections.has(collectionName)) return [];
    return Array.from(this.collections.get(collectionName).values());
  }

  getAllCollectionNames() {
    return Array.from(this.collections.keys());
  }

  getTotalDocumentCount() {
    let total = 0;
    for (const col of this.collections.values()) {
      total += col.size;
    }
    return total;
  }

  clear() {
    this.collections.clear();
    this.totalWritesCount = 0;
    this.currentBatchCount = 0;
    this.simulatedFailureBatch = null;
  }
}
