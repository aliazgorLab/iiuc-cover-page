import { sendError } from '../utils/response.js';
import { logger } from '../utils/logger.js';
import { redactSensitiveData } from '../utils/sanitize.js';

export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message || 'Internal Server Error';

  // Handle CORS rejection errors cleanly with 403 Forbidden
  if (err.message && err.message.startsWith('CORS blocked:')) {
    statusCode = 403;
    message = err.message;
  }

  // Handle Mongoose buffering timeout / connection offline errors gracefully
  if (err.name === 'MongooseError' && (message.includes('buffering timed out') || message.includes('bufferCommands'))) {
    statusCode = 503;
    message = 'Database service temporarily unavailable. Please verify your MongoDB connection or check if your current IP address is whitelisted on MongoDB Atlas.';
  }

  const isProduction = process.env.NODE_ENV === 'production';

  // Safe structured metadata for diagnostics — never log raw req.body
  const safeMeta = {
    method: req.method,
    path: req.originalUrl,
    ip: req.ip || req.headers?.['x-forwarded-for'] || '127.0.0.1',
    body: req.body ? redactSensitiveData(req.body) : undefined,
    stack: isProduction ? undefined : err.stack,
  };

  logger.error(`${req.method} ${req.originalUrl} — ${statusCode}: ${message}`, safeMeta);

  const responseMessage = isProduction && statusCode === 500 ? 'Internal Server Error' : message;

  return sendError(
    res,
    responseMessage,
    statusCode,
    isProduction ? undefined : err.stack
  );
};
