import express from 'express';
import { googleAuth, refreshTokenHandler, register, login, logout, getMe } from '../controllers/authController.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { validateGoogleAuthPayload } from '../middleware/validator.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(authLimiter);

router.post('/google', validateGoogleAuthPayload, googleAuth);
router.get('/me', protect, getMe);
router.post('/refresh', refreshTokenHandler);
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

export default router;
