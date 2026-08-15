export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User authentication required' });
    }

    const userRole = req.user.role ? req.user.role.toUpperCase() : 'STUDENT';

    // SUPER_ADMIN has global access
    if (userRole === 'SUPER_ADMIN') {
      return next();
    }

    if (!allowedRoles.includes(userRole) && !allowedRoles.includes('ADMIN')) {
      return res.status(403).json({ message: `Access restricted. Requires administrative privileges.` });
    }

    next();
  };
};
