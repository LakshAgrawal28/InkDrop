import { Pool } from 'pg';
import { config } from '../config';

export const pool = new Pool({
  connectionString: config.database.url,
});

// Test connection
pool.on('connect', () => {
  console.log('✓ Database connected');
});

pool.on('error', (err) => {
  console.error('Database error:', err);
  process.exit(-1);
});

export default pool;
