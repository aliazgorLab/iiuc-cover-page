import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendError } from '../utils/response.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'iiuc_super_secret_jwt_key_2026'
      );

      const user = await User.findById(decoded.id).select('-passwordHash -refreshToken');
      if (!user) {
        return sendError(res, 'User associated with this token no longer exists.', 401);
      }

      // Block suspended or blocked accounts from accessing any protected route
      if (user.accountStatus === 'SUSPENDED') {
        return sendError(
          res,
          'Your account has been temporarily suspended. Please contact IIUC administration.',
          403
        );
      }
      if (user.accountStatus === 'BLOCKED') {
        return sendError(
          res,
          'Your account has been permanently restricted. Contact IIUC administration.',
          403
        );
      }

      req.user = user;
      return next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return sendError(res, 'JWT Access Token expired. Please refresh your session.', 401);
      }
      return sendError(res, 'Not authorized, invalid token signature.', 401);
    }
  }

  if (!token) {
    return sendError(res, 'Not authorized, missing authorization header token.', 401);
  }
};
