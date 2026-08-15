import { randomUUID } from 'crypto';

/**
 * Request ID Middleware — Attaches unique trace ID to every incoming HTTP request for debugging.
 */
export const requestIdMiddleware = (req, res, next) => {
  const reqId = req.headers['x-request-id'] || randomUUID().split('-')[0];
  req.id = reqId;
  res.setHeader('X-Request-Id', reqId);
  next();
};

export default requestIdMiddleware;
