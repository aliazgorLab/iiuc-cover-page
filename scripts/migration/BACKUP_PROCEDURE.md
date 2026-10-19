# Pre-Migration Database Backup & Verification Procedure
**Project:** IIUC Cover Page Platform  
**Target Environment:** MongoDB Atlas Cluster (`iiuc_cover_page`)

---

## 1. Important Rules

1. **Keep Backups External:** Never commit database dumps, BSON files, or JSON exports into the Git repository.
2. **Read-Only Operation:** Backup scripts must only perform read queries (`mongodump` / `find`).
3. **Audit Baseline Verification:** Every backup must be reconciled against the 3,141 document baseline verified during Phase 1.

---

## 2. Recommended Backup Execution Options

### Option A: Standard `mongodump` (Recommended for Full Binary Snapshot)
Run from a secure terminal on a machine with MongoDB Database Tools installed:

```bash
# Set external destination outside the git repository (e.g. C:\iiuc_backups\ or ~/backups/)
export BACKUP_DIR="/path/to/external/backups/iiuc_cover_page_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Execute read-only binary dump
mongodump --uri="$MONGODB_URI" --db=iiuc_cover_page --out="$BACKUP_DIR" --gzip

# Verify backup integrity and checksum
find "$BACKUP_DIR" -type f -exec sha256sum {} + > "$BACKUP_DIR/checksums.sha256"
```

### Option B: Node.js Streaming Export (Pure JS, No External Tools Required)
A standalone Node.js script using Mongoose to stream documents from each collection to timestamped, gzipped JSON lines files in an external directory outside Git.

---

## 3. Baseline Document Reconciliation Checklist

Before declaring a backup valid, verify that the document counts match or exceed the Phase 1 audit baseline:

| Collection | Audit Baseline Count | Backup Document Count | Verification Result |
| :--- | :---: | :---: | :---: |
| `users` | 253 | [To be verified] | [Pending Run] |
| `covers` | 495 | [To be verified] | [Pending Run] |
| `teachers` | 737 | [To be verified] | [Pending Run] |
| `courses` | 571 | [To be verified] | [Pending Run] |
| `draftcovers` | 200 | [To be verified] | [Pending Run] |
| `usersessions` | 609 | [To be verified] | [Pending Run] |
| `adminnotifications` | 253 | [To be verified] | [Pending Run] |
| `labindexrecords` | 12 | [To be verified] | [Pending Run] |
| `templates` | 4 | [To be verified] | [Pending Run] |
| `adminactivities` | 3 | [To be verified] | [Pending Run] |
| `teacherimportlogs` | 2 | [To be verified] | [Pending Run] |
| `broadcastlogs` | 1 | [To be verified] | [Pending Run] |
| `departments` | 1 | [To be verified] | [Pending Run] |
| `labexperiments` | 0 | [To be verified] | [Pending Run] |
| **Total** | **3,141** | **[Pending Run]** | **[Pending Run]** |

---

## 4. Current Status

> [!NOTE]
> As of Phase 2, the procedure is defined and validated. An independent backup has **not yet been created** and will be performed at the start of Phase 3 after external destination confirmation.
