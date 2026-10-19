/**
 * IIUC Academic Platform — Sensitive Data Sanitization Utility
 *
 * Prevents credential, token, and connection string leakage in logs,
 * error payloads, and diagnostic outputs.
 */

const SENSITIVE_KEY_REGEX = /^(password|passwordhash|token|accesstoken|refreshtoken|credential|idtoken|authorization|cookie|set-cookie|secret|jwt_secret|apikey|clientsecret)$/i;

const MONGODB_URI_REGEX = /(mongodb(?:\+srv)?:\/\/[^:]+:)([^@]+)(@)/gi;
const BEARER_TOKEN_REGEX = /(Bearer\s+)[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*/gi;
const JWT_STRING_REGEX = /\beyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.[A-Za-z0-9-_.+/=]*\b/g;

/**
 * Sanitizes a string by masking MongoDB connection passwords, Bearer tokens, and JWT strings.
 */
export const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return str
    .replace(MONGODB_URI_REGEX, '$1[REDACTED_PASSWORD]$3')
    .replace(BEARER_TOKEN_REGEX, '$1[REDACTED_TOKEN]')
    .replace(JWT_STRING_REGEX, '[REDACTED_JWT]');
};

/**
 * Recursively redacts sensitive fields from objects or arrays.
 * Preserves the original data structure while replacing sensitive values with '[REDACTED]'.
 */
export const redactSensitiveData = (data, seen = new WeakSet()) => {
  if (data === null || data === undefined) return data;

  if (typeof data === 'string') {
    return sanitizeString(data);
  }

  if (typeof data !== 'object') {
    return data;
  }

  // Handle circular references safely
  if (seen.has(data)) {
    return '[CIRCULAR]';
  }
  seen.add(data);

  if (Array.isArray(data)) {
    return data.map((item) => redactSensitiveData(item, seen));
  }

  const clean = {};
  for (const [key, val] of Object.entries(data)) {
    if (SENSITIVE_KEY_REGEX.test(key)) {
      clean[key] = '[REDACTED]';
    } else if (typeof val === 'object' && val !== null) {
      clean[key] = redactSensitiveData(val, seen);
    } else if (typeof val === 'string') {
      clean[key] = sanitizeString(val);
    } else {
      clean[key] = val;
    }
  }

  return clean;
};
