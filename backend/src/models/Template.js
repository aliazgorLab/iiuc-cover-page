import mongoose from 'mongoose';

const templateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    type: {
      type: String,
      enum: ['ASSIGNMENT', 'LAB_REPORT', 'LAB_INDEX', 'PROJECT'],
      required: true,
    },
    description: { type: String, default: '' },
    department: { type: String, default: 'All Departments' },
    university: { type: String, default: 'IIUC' },
    previewImage: { type: String, default: '' },
    version: { type: String, default: '1.0.0' },
    status: { type: String, enum: ['ACTIVE', 'DRAFT', 'ARCHIVED'], default: 'ACTIVE' },
    isDefault: { type: Boolean, default: false },
    configuration: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

// Production database indexes
templateSchema.index({ status: 1 });
templateSchema.index({ type: 1 });
templateSchema.index({ university: 1 });
templateSchema.index({ isDefault: -1, createdAt: -1 }); // Compound: default templates first

export default mongoose.model('Template', templateSchema);
