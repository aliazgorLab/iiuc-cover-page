import mongoose from 'mongoose';

/**
 * AdminActivity — Institutional Governance Audit Log
 * Records every admin action for university transparency and accountability.
 */
const adminActivitySchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    adminName: { type: String, required: true },
    action: {
      type: String,
      required: true,
      enum: [
        // Student actions
        'STUDENT_STATUS_CHANGED',
        'STUDENT_ROLE_CHANGED',
        'STUDENT_VIEWED',
        // Teacher actions
        'TEACHER_CREATED',
        'TEACHER_UPDATED',
        'TEACHER_DELETED',
        // Course actions
        'COURSE_CREATED',
        'COURSE_UPDATED',
        'COURSE_DELETED',
        // Template actions
        'TEMPLATE_CREATED',
        'TEMPLATE_UPDATED',
        'TEMPLATE_ARCHIVED',
        'TEMPLATE_ACTIVATED',
        'TEMPLATE_DELETED',
        // System actions
        'SYSTEM_SETTINGS_CHANGED',
        'ADMIN_LOGIN',
        'BROADCAST_EMAIL_SENT',
      ],
    },
    module: {
      type: String,
      required: true,
      enum: ['STUDENTS', 'TEACHERS', 'COURSES', 'TEMPLATES', 'SYSTEM', 'AUTH'],
    },
    targetId: { type: String, default: null },   // The _id of the affected document
    targetName: { type: String, default: null },  // Human-readable name (e.g. teacher name)
    description: { type: String, required: true },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} }, // Extra context for audit
  },
  { timestamps: true }
);

// Indexes for activity log queries
adminActivitySchema.index({ adminId: 1 });
adminActivitySchema.index({ module: 1 });
adminActivitySchema.index({ createdAt: -1 });
adminActivitySchema.index({ action: 1 });

export default mongoose.model('AdminActivity', adminActivitySchema);
