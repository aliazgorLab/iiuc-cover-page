import mongoose from 'mongoose';

/**
 * DraftCover — Auto-Saved Cover Generation Workspaces
 * Stores progress for student document creation so they can resume anytime.
 */
const draftCoverSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    coverType: {
      type: String,
      required: true,
      enum: ['ASSIGNMENT', 'LAB_REPORT', 'LAB_INDEX', 'PROJECT'],
    },
    coverData: { type: mongoose.Schema.Types.Mixed, required: true },
    lastEdited: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['DRAFT', 'COMPLETED'],
      default: 'DRAFT',
    },
  },
  { timestamps: true }
);

draftCoverSchema.index({ userId: 1, lastEdited: -1 });

export default mongoose.model('DraftCover', draftCoverSchema);
