import mongoose from 'mongoose';

const broadcastLogSchema = new mongoose.Schema(
  {
    broadcastId: { type: String, required: true, unique: true, index: true },
    subject: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    badgeText: { type: String, default: 'IIUC ANNOUNCEMENT', trim: true },
    announcementBody: { type: String, required: true },
    ctaUrl: { type: String, default: '' },
    ctaText: { type: String, default: 'Explore Feature' },
    targetType: {
      type: String,
      enum: ['ALL', 'DEPARTMENT', 'SELECTIVE'],
      required: true,
    },
    department: { type: String, default: '' },
    recipientCount: { type: Number, default: 0 },
    successCount: { type: Number, default: 0 },
    failedCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['PENDING', 'SENDING', 'COMPLETED', 'COMPLETED_WITH_ERRORS', 'FAILED'],
      default: 'PENDING',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    createdByName: { type: String, default: 'Admin' },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

broadcastLogSchema.index({ createdBy: 1 });
broadcastLogSchema.index({ status: 1 });
broadcastLogSchema.index({ createdAt: -1 });

export default mongoose.model('BroadcastLog', broadcastLogSchema);
