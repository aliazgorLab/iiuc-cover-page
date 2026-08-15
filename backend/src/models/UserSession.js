import mongoose from 'mongoose';

/**
 * UserSession — Security Login Session Tracking
 * Tracks IP, device, browser, fingerprint, active status, and session revocation.
 */
const userSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userEmail: { type: String, required: true },
    ip: { type: String, default: '127.0.0.1' },
    device: { type: String, default: 'Desktop' },
    browser: { type: String, default: 'Browser' },
    deviceFingerprint: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    loginTime: { type: Date, default: Date.now },
    logoutTime: { type: Date, default: null },
  },
  { timestamps: true }
);

userSessionSchema.index({ userId: 1, loginTime: -1 });
userSessionSchema.index({ isActive: 1 });

export default mongoose.model('UserSession', userSessionSchema);
