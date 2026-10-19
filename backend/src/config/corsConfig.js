/**
 * IIUC Academic Platform — CORS Configuration & Validator
 */

export const getAllowedOrigins = (env = process.env) => {
  const origins = [];
  const rawUrls = env.FRONTEND_URL || (env.NODE_ENV === 'production' ? 'https://iiuccoverpage.vercel.app' : '');
  if (rawUrls) {
    rawUrls.split(',').map((u) => u.trim()).filter(Boolean).forEach((url) => {
      origins.push(url.replace(/\/+$/, ''));
    });
  }
  // Local development origins are only permitted in non-production environments
  if (env.NODE_ENV !== 'production') {
    origins.push(
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:4173',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:4173'
    );
  }
  return [...new Set(origins)];
};

export const corsOriginValidator = (origin, callback, env = process.env) => {
  // Allow requests with no origin (e.g. mobile apps, curl, server-to-server, Render health checks)
  if (!origin) {
    return callback(null, true);
  }

  const allowed = getAllowedOrigins(env);
  if (allowed.includes(origin)) {
    return callback(null, true);
  }

  // Reject origins that are not in the configured allowlist
  return callback(new Error(`CORS blocked: Origin '${origin}' is not authorized.`), false);
};
