import AdminNotification from '../models/AdminNotification.js';

/**
 * Automated Notification Service
 * Dispatches automated system alerts and institutional telemetry notifications.
 */
export const notifySystemEvent = async ({ title, message, type = 'INFO', targetRole = 'ALL', meta = {} }) => {
  try {
    await AdminNotification.create({
      title,
      message,
      type,
      targetRole,
      meta,
    });
  } catch (err) {
    console.warn('[NotificationService] Failed to dispatch event:', err.message);
  }
};

export const notifyNewRegistration = (user) => {
  return notifySystemEvent({
    title: 'New Student Registration',
    message: `${user.name} (${user.studentId || user.email}) registered on IIUC Cover Page Platform.`,
    type: 'INFO',
    meta: { userId: user._id },
  });
};

export const notifyProfileCompleted = (user) => {
  return notifySystemEvent({
    title: 'Student Profile Completed',
    message: `${user.name} completed academic profile (${user.department || 'IIUC'}).`,
    type: 'SUCCESS',
    meta: { userId: user._id },
  });
};

export const notifyAccountStatusChanged = (user, newStatus, adminName) => {
  return notifySystemEvent({
    title: `Student Account ${newStatus}`,
    message: `Account status for ${user.name} was set to ${newStatus} by ${adminName}.`,
    type: newStatus === 'SUSPENDED' || newStatus === 'BLOCKED' ? 'WARNING' : 'INFO',
    meta: { userId: user._id, status: newStatus },
  });
};

export const notifyTemplatePublished = (template, adminName) => {
  return notifySystemEvent({
    title: 'Template Published',
    message: `Template "${template.name}" (${template.type}) published by ${adminName}.`,
    type: 'SUCCESS',
    meta: { templateId: template._id },
  });
};
