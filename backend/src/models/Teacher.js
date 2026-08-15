import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    designation: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    faculty: { type: String, trim: true, default: 'FSE' },
    email: { type: String, trim: true, lowercase: true, default: '' },
    profileImage: { type: String, default: '' },
    avatar: { type: String, default: '' },
    sourceUrl: { type: String, default: '' },
    source: { type: String, default: 'IIUC Website' },
    importedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE',
    },
  },
  { timestamps: true }
);

teacherSchema.index({ name: 1, department: 1 });
teacherSchema.index({ department: 1 });
teacherSchema.index({ status: 1 });

export default mongoose.model('Teacher', teacherSchema, 'teachers');

