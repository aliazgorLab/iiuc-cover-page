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
  const { label, color } = LEVELS[level];

  if (isDev) {
    const prefix = `${color}[${label}]${RESET} ${ts}`;
    if (meta) {
      console.log(`${prefix} ${message}`, meta);
    } else {
      console.log(`${prefix} ${message}`);
    }
  } else {
    // Production: structured JSON for log aggregation (e.g., Datadog, Papertrail)
    const entry = { level, timestamp: ts, message, ...(meta ? { meta } : {}) };
    console.log(JSON.stringify(entry));
  }
};

export const logger = {
  info:  (message, meta) => log('info',  message, meta),
  warn:  (message, meta) => log('warn',  message, meta),
  error: (message, meta) => log('error', message, meta),
  debug: (message, meta) => { if (isDev) log('debug', message, meta); },
};
