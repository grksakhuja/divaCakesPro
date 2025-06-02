import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Parse DATABASE_URL to extract components
const dbUrl = new URL(process.env.DATABASE_URL);
const isRemoteDb = !dbUrl.hostname.includes('localhost');

// Railway-specific connection configuration
const poolConfig = {
  host: dbUrl.hostname,
  port: parseInt(dbUrl.port || '5432'),
  database: dbUrl.pathname.slice(1), // Remove leading slash
  user: dbUrl.username,
  password: dbUrl.password,
  ssl: isRemoteDb ? { 
    rejectUnauthorized: false
  } : false,
  connectionTimeoutMillis: 120000, // 2 minutes for Railway
  idleTimeoutMillis: 30000,
  max: 3, // Very small pool for Railway
  application_name: 'CakeCraftPro',
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
};

console.log('🔌 Connecting to database:', {
  host: poolConfig.host,
  port: poolConfig.port,
  database: poolConfig.database,
  user: poolConfig.user,
  ssl: !!poolConfig.ssl
});

export const pool = new Pool(poolConfig);

// Add connection error handling
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// Test the connection on startup with retries
async function initializePool() {
  let retries = 5;
  while (retries > 0) {
    try {
      const client = await pool.connect();
      console.log('✅ Database connection pool initialized successfully');
      
      // Run a simple query to ensure connection is working
      await client.query('SELECT 1');
      console.log('✅ Database query test successful');
      
      client.release();
      return;
    } catch (err: any) {
      retries--;
      console.error(`❌ Error connecting to database (${retries} retries left):`, err.message);
      
      if (retries > 0) {
        console.log(`⏳ Waiting 5 seconds before retry...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      } else {
        console.error('❌ Failed to initialize database connection after all retries');
        console.error('Please check:');
        console.error('1. Railway database is active (not sleeping)');
        console.error('2. DATABASE_URL is correct');
        console.error('3. Network connection allows outbound PostgreSQL connections');
        // Don't throw here - let the app start but queries will fail
      }
    }
  }
}

// Initialize the pool
initializePool();

export const db = drizzle({ client: pool, schema });
