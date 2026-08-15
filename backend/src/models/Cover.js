import mongoose from 'mongoose';

const coverSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      default: null,
    },
    templateId: { type: String, required: true },
    coverType: {
      type: String,
      enum: ['ASSIGNMENT', 'LAB_REPORT', 'LAB_INDEX', 'PROJECT'],
      required: true,
    },
    coverData: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

// Production database indexes for dashboard queries
coverSchema.index({ userId: 1 });
coverSchema.index({ coverType: 1 });
coverSchema.index({ createdAt: -1 });
coverSchema.index({ userId: 1, createdAt: -1 }); // Compound: history sorted by date per user

export default mongoose.model('Cover', coverSchema);
