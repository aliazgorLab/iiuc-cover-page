/**
 * IIUC Academic Platform — Environment Validation & Staging Isolation Gates
 *
 * Verifies all required environment variables are present and enforces
 * strict fail-closed database isolation between production and staging
 * environments before any MongoDB connection attempt.
 */

const REQUIRED_ENV_VARS = [
  { key: 'JWT_SECRET',       description: 'JWT signing secret key' },
  { key: 'GOOGLE_CLIENT_ID', description: 'Google OAuth 2.0 Client ID' },
];

/**
 * Extracts the database name segment from a MongoDB connection URI.
 * Example: mongodb+srv://user:pass@cluster.mongodb.net/dbname?retryWrites=true -> dbname
 */
export const extractDatabaseName = (uri = '') => {
  if (!uri || typeof uri !== 'string') return '';
  const match = uri.trim().match(/^mongodb(?:\+srv)?:\/\/[^/]+\/([^/?]+?)\/?(?:\?|$)/i);
  return match ? match[1].trim() : '';
};

/**
 * Pure validation logic for staging database isolation.
 * Exported for isolated unit-testing without process.exit side-effects.
 */
export const checkDatabaseIsolation = (env = process.env) => {
  const nodeEnv = (env.NODE_ENV || '').toLowerCase().trim();
  const appEnv = (env.APP_ENV || '').toLowerCase().trim();
  const isStaging = nodeEnv === 'staging' || appEnv === 'staging';

  if (!isStaging) {
    return { valid: true };
  }

  const uri1 = (env.MONGODB_URI || '').trim();
  const uri2 = (env.MONGO_URI || '').trim();
  const primaryUri = uri1 || uri2;

  if (!primaryUri) {
    return { valid: false, error: 'MONGODB_URI is missing in staging environment' };
  }

  // Detect conflicting URI configurations
  if (uri1 && uri2 && uri1 !== uri2) {
    const db1 = extractDatabaseName(uri1).toLowerCase();
    const db2 = extractDatabaseName(uri2).toLowerCase();
    if (db1 !== db2) {
      return {
        valid: false,
        error: `Conflicting database configurations: MONGODB_URI targets "${db1}" but MONGO_URI targets "${db2}"`,
      };
    }
  }

  const dbName = extractDatabaseName(primaryUri).toLowerCase();

  // Critical Gate 1: Staging cannot target production database
  if (dbName === 'iiuc_cover_page') {
    return {
      valid: false,
      error: '[CRITICAL REFUSAL] Staging environment attempted to target production database "iiuc_cover_page"!',
    };
  }

  // Critical Gate 2: Staging strictly requires iiuc_cover_page_staging
  if (dbName !== 'iiuc_cover_page_staging') {
    return {
      valid: false,
      error: `[FAIL-CLOSED GATE] Staging environment strictly requires database "iiuc_cover_page_staging", received: "${dbName || 'EMPTY/MISSING'}"`,
    };
  }

  return { valid: true, dbName };
};

export const validateEnv = () => {
  const missing = [];

  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!mongoUri || mongoUri.trim() === '') {
    missing.push(`  ✗ MONGODB_URI          — MongoDB Atlas connection string`);
  }

  for (const variable of REQUIRED_ENV_VARS) {
    if (!process.env[variable.key] || process.env[variable.key].trim() === '') {
      missing.push(`  ✗ ${variable.key.padEnd(20)} — ${variable.description}`);
    }
  }

  // Evaluate staging database isolation
  const isolationResult = checkDatabaseIsolation(process.env);
  if (!isolationResult.valid) {
    missing.push(`  ✗ DATABASE ISOLATION   — ${isolationResult.error}`);
  }

  if (missing.length > 0) {
    console.error('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('  IIUC Platform — FATAL: Environment Validation Refusal');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    missing.forEach((m) => console.error(m));
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('  Correct the environment variables in your deployment and restart.\n');
    process.exit(1);
  }

  console.log('✓ Environment validation passed — all required variables present and verified.');
};
