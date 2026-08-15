/**
 * IIUC Academic Platform — Environment Validation
 *
 * Verifies all required environment variables are present
 * before the server starts. Exits the process immediately
 * if any critical variable is missing.
 */

const REQUIRED_ENV_VARS = [
  { key: 'JWT_SECRET',       description: 'JWT signing secret key' },
  { key: 'GOOGLE_CLIENT_ID', description: 'Google OAuth 2.0 Client ID' },
];

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

  if (missing.length > 0) {
    console.error('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('  IIUC Platform — FATAL: Missing environment variables');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    missing.forEach((m) => console.error(m));
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('  Add the missing variables to backend/.env and restart.\n');
    process.exit(1);
  }

  console.log('✓ Environment validation passed — all required variables present.');
};
