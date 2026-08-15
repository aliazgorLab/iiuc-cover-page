import { sendError } from '../utils/response.js';

/**
 * Granular permission verification middleware.
 * SUPER_ADMIN has full bypass capability.
 * ADMIN accounts check if required permission is in user.permissions array or default assigned list.
 */
export const requirePermission = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Authentication required.', 401);
    }

    const role = (req.user.role || 'STUDENT').toUpperCase();

    // SUPER_ADMIN has global override
    if (role === 'SUPER_ADMIN') {
      return next();
    }

    // MODERATOR is view-only
    if (role === 'MODERATOR') {
      const isReadAction = requiredPermissions.every((p) => p.startsWith('VIEW_'));
      if (isReadAction) {
        return next();
      }
      return sendError(res, 'Moderators have view-only privileges.', 403);
    }

    // Default permissions matrix for ADMIN
    const defaultAdminPermissions = [
      'MANAGE_STUDENTS',
      'MANAGE_TEACHERS',
      'MANAGE_COURSES',
      'MANAGE_TEMPLATES',
      'VIEW_ANALYTICS',
      'EXPORT_DATA',
    ];

    const userPerms = req.user.permissions?.length
      ? req.user.permissions
      : role === 'ADMIN'
      ? defaultAdminPermissions
      : [];

    const hasAll = requiredPermissions.every((perm) => userPerms.includes(perm));

    if (!hasAll) {
      return sendError(
        res,
        `Permission denied. Missing required permission: ${requiredPermissions.join(', ')}`,
        403
      );
    }

    next();
  };
};
