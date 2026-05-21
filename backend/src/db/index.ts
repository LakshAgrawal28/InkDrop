import { Pool } from 'pg';
import { config } from '../config';

export const pool = new Pool({
  connectionString: config.database.url,
  connectionTimeoutMillis: 10000, // 10 seconds connection timeout for Neon cold-starts
});

// Save original query method
const originalQuery = pool.query.bind(pool);

const MAX_RETRIES = 3;
const RETRY_DELAY = 1500;

// Override query with retry logic for transient database startup/connection failures
pool.query = async function (text: any, params?: any, callback?: any): Promise<any> {
  if (typeof params === 'function') {
    callback = params;
    params = undefined;
  }

  let lastError: any;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      if (callback) {
        return originalQuery(text, params, callback);
      }
      return await originalQuery(text, params);
    } catch (error: any) {
      lastError = error;

      // Identify transient Neon/PgBouncer connection errors or cold starts
      const isConnectionError = 
        error.code === 'ECONNREFUSED' || 
        error.code === 'ETIMEDOUT' ||
        error.message?.includes('timeout') ||
        error.message?.includes('connection') ||
        error.message?.includes('terminated') ||
        error.message?.includes('PgBouncer') ||
        error.message?.includes('authentication failed'); // Can fail transiently on startup

      if (isConnectionError && attempt < MAX_RETRIES) {
        console.warn(`⚠️ Database query failed (attempt ${attempt}/${MAX_RETRIES}). Retrying in ${RETRY_DELAY * attempt}ms... Error: ${error.message || error}`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
        continue;
      }

      throw error;
    }
  }
  throw lastError;
} as any;

// Test connection event
pool.on('connect', () => {
  console.log('✓ Database connected');
});

pool.on('error', (err) => {
  console.error('Database error:', err);
  // Do not exit process directly on pool errors in serverless/production to avoid killing the container
  if (process.env.NODE_ENV !== 'production') {
    process.exit(-1);
  }
});

export default pool;
