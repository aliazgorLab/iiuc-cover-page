import AdminActivity from '../models/AdminActivity.js';

/**
 * Utility: Log an admin action to the activity log.
 */
export const logAdminActivity = async ({ adminId, adminName, action, module, targetId, targetName, description, meta = {} }) => {
  try {
    await AdminActivity.create({ adminId, adminName, action, module, targetId, targetName, description, meta });
  } catch (err) {
    // Non-fatal: activity logging must never break the primary API response
    console.warn('[ActivityLog] Failed to log admin activity:', err.message);
  }
};
