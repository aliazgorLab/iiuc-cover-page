import { sendError } from '../utils/response.js';
import { logger } from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message || 'Internal Server Error';

  // Handle Mongoose buffering timeout / connection offline errors gracefully
  if (err.name === 'MongooseError' && (message.includes('buffering timed out') || message.includes('bufferCommands'))) {
    statusCode = 503;
    message = 'Database service temporarily unavailable. Please verify your MongoDB connection or check if your current IP address is whitelisted on MongoDB Atlas.';
  }

  logger.error(`${req.method} ${req.originalUrl} — ${statusCode}: ${message}`, {
    stack: err.stack,
    body: req.body,
  });

  const isProduction = process.env.NODE_ENV === 'production';
  const responseMessage = isProduction && statusCode === 500 ? 'Internal Server Error' : message;

  return sendError(
    res,
    responseMessage,
    statusCode,
    isProduction ? undefined : err.stack
  );
};
