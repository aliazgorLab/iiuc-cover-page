/**
 * IIUC Academic Platform — Structured Logger
 *
 * Development:   coloured, timestamped console output
 * Production:    JSON-structured logs (suitable for log aggregators)
 *
 * Usage:
 *   import { logger } from '../utils/logger.js';
 *   logger.info('Server started on port 5000');
 *   logger.warn('Rate limit approaching for IP 1.2.3.4');
 *   logger.error('MongoDB connection failed', err);
 */

import { redactSensitiveData, sanitizeString } from './sanitize.js';

const isDev = (process.env.NODE_ENV || 'development') !== 'production';

const LEVELS = {
  info:  { label: 'INFO ',  color: '\x1b[36m' }, // Cyan
  warn:  { label: 'WARN ',  color: '\x1b[33m' }, // Yellow
  error: { label: 'ERROR', color: '\x1b[31m' }, // Red
  debug: { label: 'DEBUG', color: '\x1b[90m' }, // Grey
};

const RESET = '\x1b[0m';

const formatTimestamp = () => new Date().toISOString();

const log = (level, message, meta) => {
  const ts = formatTimestamp();
  const { label, color } = LEVELS[level] || LEVELS.info;
  const safeMessage = typeof message === 'string' ? sanitizeString(message) : redactSensitiveData(message);
  const safeMeta = meta !== undefined ? redactSensitiveData(meta) : undefined;

  if (isDev) {
    const prefix = `${color}[${label}]${RESET} ${ts}`;
    if (safeMeta) {
      console.log(`${prefix} ${safeMessage}`, safeMeta);
    } else {
      console.log(`${prefix} ${safeMessage}`);
    }
  } else {
    // Production: structured JSON for log aggregation (e.g., Datadog, Papertrail)
    const entry = { level, timestamp: ts, message: safeMessage, ...(safeMeta ? { meta: safeMeta } : {}) };
    console.log(JSON.stringify(entry));
  }
};

export const logger = {
  info:  (message, meta) => log('info',  message, meta),
  warn:  (message, meta) => log('warn',  message, meta),
  error: (message, meta) => log('error', message, meta),
  debug: (message, meta) => { if (isDev) log('debug', message, meta); },
};
