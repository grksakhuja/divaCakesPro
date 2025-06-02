import pg from 'pg';
const { Client } = pg;

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL not set!');
  process.exit(1);
}

console.log('Testing direct database connection...');
console.log('Database URL pattern:', DATABASE_URL.replace(/:[^:@]+@/, ':****@'));

const client = new Client({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 60000, // 60 seconds
});

async function testConnection() {
  try {
    console.log('Attempting to connect...');
    await client.connect();
    console.log('✅ Connected successfully!');
    
    // Test a simple query
    const result = await client.query('SELECT NOW()');
    console.log('✅ Query successful:', result.rows[0]);
    
    // Test the cake_orders table
    const ordersResult = await client.query('SELECT COUNT(*) FROM cake_orders');
    console.log('✅ Orders count:', ordersResult.rows[0].count);
    
    await client.end();
    console.log('✅ Connection closed successfully');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Error code:', error.code);
    console.error('Error detail:', error.detail);
  }
}

testConnection();