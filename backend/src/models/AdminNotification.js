import mongoose from 'mongoose';

/**
 * AdminNotification — Institutional Notification Log
 * Stores system and administrative notifications for admin center.
 */
const adminNotificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['INFO', 'SUCCESS', 'WARNING', 'ALERT'],
      default: 'INFO',
    },
    targetRole: {
      type: String,
      enum: ['ALL', 'ADMIN', 'SUPER_ADMIN'],
      default: 'ALL',
    },
    isRead: { type: Boolean, default: false },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

adminNotificationSchema.index({ isRead: 1, createdAt: -1 });
adminNotificationSchema.index({ targetRole: 1 });

export default mongoose.model('AdminNotification', adminNotificationSchema);
