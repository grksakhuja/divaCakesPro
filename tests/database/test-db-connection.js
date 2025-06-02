#!/usr/bin/env node

import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testConnection() {
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000,
    query_timeout: 5000,
  });

  try {
    console.log('🔌 Testing database connection...');
    console.log('📍 URL:', process.env.DATABASE_URL?.replace(/:[^:@]*@/, ':****@')); // Hide password
    
    const client = await pool.connect();
    console.log('✅ Connected successfully!');
    
    const result = await client.query('SELECT version()');
    console.log('📊 Database version:', result.rows[0].version);
    
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    console.log('📋 Tables:', tablesResult.rows.map(row => row.table_name));
    
    client.release();
    await pool.end();
    
    console.log('🎉 Connection test completed successfully!');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('📝 Error details:', {
      code: error.code,
      errno: error.errno,
      syscall: error.syscall,
      address: error.address,
      port: error.port
    });
    process.exit(1);
  }
}

testConnection();