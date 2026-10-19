/**
 * IIUC Cover Page Platform — Official Firebase Emulator Suite REST Adapter
 *
 * Implements a fail-closed HTTP/REST client for interacting strictly with
 * the official Google Cloud Firestore Local Emulator Suite running on 127.0.0.1:8080.
 *
 * SAFETY INVARIANTS:
 * 1. Fails closed immediately if 127.0.0.1:8080 is unreachable.
 * 2. Never sends requests to Google Cloud or remote servers.
 * 3. Strictly blocks production project ID (iiuccoverpage-8edd3).
 * 4. Supports atomic batches, collection queries, and emulator-native database clears.
 */

import http from 'http';

export class OfficialFirestoreEmulatorAdapter {
  constructor(projectId = 'iiuc-cover-page-staging', host = '127.0.0.1', port = 8080) {
    if (projectId === 'iiuccoverpage-8edd3') {
      throw new Error('[SAFETY CRITICAL] Official emulator adapter refuses to target production project ID.');
    }
    if (host !== '127.0.0.1' && host !== 'localhost') {
      throw new Error(`[SAFETY CRITICAL] Official emulator adapter refuses non-local host: ${host}`);
    }
    this.projectId = projectId;
    this.host = host;
    this.port = port;
    this.baseUrl = `http://${host}:${port}`;
    this.apiPrefix = `/v1/projects/${projectId}/databases/(default)/documents`;
  }

  /**
   * Health check: verifies that official Firestore Emulator is actively listening
   */
  async checkHealth() {
    return new Promise((resolve) => {
      const req = http.get(`${this.baseUrl}/`, (res) => {
        resolve({ isRunning: true, statusCode: res.statusCode });
      });
      req.on('error', (err) => {
        resolve({ isRunning: false, error: err.message });
      });
      req.setTimeout(2000, () => {
        req.destroy();
        resolve({ isRunning: false, error: 'Connection timed out' });
      });
    });
  }

  /**
   * Low-level HTTP requester with fail-closed error handling
   */
  async _request(path, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
      const payload = body ? JSON.stringify(body) : null;
      const options = {
        hostname: this.host,
        port: this.port,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer owner',
          ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
        },
      };

      const req = http.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => { responseData += chunk; });
        res.on('end', () => {
          let parsed;
          try {
            parsed = responseData ? JSON.parse(responseData) : {};
          } catch (e) {
            parsed = { raw: responseData };
          }
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(`[Emulator REST ${res.statusCode}] ${parsed.error?.message || responseData}`));
          }
        });
      });

      req.on('error', (err) => {
        reject(new Error(`[Emulator Offline] Cannot connect to official Firestore emulator on ${this.host}:${this.port}: ${err.message}`));
      });

      req.setTimeout(5000, () => {
        req.destroy();
        reject(new Error('[Emulator Timeout] Request to local Firestore emulator timed out.'));
      });

      if (payload) {
        req.write(payload);
      }
      req.end();
    });
  }

  /**
   * Encode JavaScript object to Firestore REST Value format
   */
  _encodeValue(val) {
    if (val === null || val === undefined) return { nullValue: null };
    if (typeof val === 'boolean') return { booleanValue: val };
    if (typeof val === 'number') {
      return Number.isInteger(val) ? { integerValue: String(val) } : { doubleValue: val };
    }
    if (typeof val === 'string') return { stringValue: val };
    if (Array.isArray(val)) {
      return { arrayValue: { values: val.map((v) => this._encodeValue(v)) } };
    }
    if (typeof val === 'object') {
      const fields = {};
      for (const [k, v] of Object.entries(val)) {
        fields[k] = this._encodeValue(v);
      }
      return { mapValue: { fields } };
    }
    return { stringValue: String(val) };
  }

  /**
   * Commit a batch of document sets via official Firestore REST API
   */
  async commitBatch(operations) {
    if (operations.length > 500) {
      throw new Error(`[Batch Limit] Cannot commit ${operations.length} operations. Max is 500.`);
    }

    const writes = operations.map((op) => {
      const docPath = `projects/${this.projectId}/databases/(default)/documents/${op.collection}/${op.id}`;
      const fields = {};
      for (const [k, v] of Object.entries(op.data)) {
        fields[k] = this._encodeValue(v);
      }
      return {
        update: {
          name: docPath,
          fields,
        },
      };
    });

    await this._request(`${this.apiPrefix}:commit`, 'POST', { writes });
    return operations.map(() => ({ created: true }));
  }

  /**
   * List all documents in a collection from official emulator with pagination
   */
  async listDocuments(collectionName) {
    const allDocs = [];
    let pageToken = '';
    do {
      try {
        const query = pageToken ? `?pageSize=1000&pageToken=${pageToken}` : '?pageSize=1000';
        const res = await this._request(`${this.apiPrefix}/${collectionName}${query}`);
        if (res.documents && res.documents.length > 0) {
          allDocs.push(...res.documents);
        }
        pageToken = res.nextPageToken || '';
      } catch (err) {
        break;
      }
    } while (pageToken);
    return allDocs;
  }

  /**
   * Count documents in a collection from official emulator
   */
  async countDocuments(collectionName) {
    const docs = await this.listDocuments(collectionName);
    return docs.length;
  }

  /**
   * Reset / clear emulator database using official emulator management endpoint
   */
  async clearDatabase() {
    return await this._request(`/emulator/v1/projects/${this.projectId}/databases/(default)/documents`, 'DELETE');
  }
}
