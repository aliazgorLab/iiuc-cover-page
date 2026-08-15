import mongoose from 'mongoose';

const teacherImportLogSchema = new mongoose.Schema(
  {
    imported: { type: Number, default: 0 },
    updated: { type: Number, default: 0 },
    skipped: { type: Number, default: 0 },
    failed: { type: Number, default: 0 },
    totalImported: { type: Number, default: 0 },
    executedBy: { type: String, default: 'System Admin' },
    status: { type: String, enum: ['SUCCESS', 'PARTIAL', 'FAILED'], default: 'SUCCESS' },
    details: { type: Array, default: [] },
  },
  { timestamps: true }
);

export default mongoose.model('TeacherImportLog', teacherImportLogSchema);
