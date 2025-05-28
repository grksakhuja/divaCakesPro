import { db } from "./db";
import { sql } from "drizzle-orm";

export async function runPaymentMigration() {
  console.log("🔄 Running payment system migration...");
  
  try {
    // Add payment-related columns to cake_orders table
    await db.execute(sql`
      ALTER TABLE cake_orders 
      ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'cash',
      ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
      ADD COLUMN IF NOT EXISTS payment_id TEXT,
      ADD COLUMN IF NOT EXISTS payment_url TEXT,
      ADD COLUMN IF NOT EXISTS payment_reference TEXT,
      ADD COLUMN IF NOT EXISTS payment_amount INTEGER,
      ADD COLUMN IF NOT EXISTS payment_completed_at TEXT;
    `);
    
    console.log("✅ Added payment columns to cake_orders table");
    
    // Create payments table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES cake_orders(id),
        payment_method TEXT NOT NULL,
        payment_provider TEXT NOT NULL,
        payment_id TEXT NOT NULL,
        amount INTEGER NOT NULL,
        currency TEXT DEFAULT 'MYR',
        status TEXT DEFAULT 'pending',
        provider_response JSON,
        webhook_data JSON,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);
    
    console.log("✅ Created payments table");
    
    // Create indexes for better performance
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
      CREATE INDEX IF NOT EXISTS idx_payments_payment_id ON payments(payment_id);
      CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
    `);
    
    console.log("✅ Created payment indexes");
    
    console.log("🎉 Payment system migration completed successfully!");
    
  } catch (error) {
    console.error("❌ Payment migration failed:", error);
    throw error;
  }
}

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runPaymentMigration()
    .then(() => {
      console.log("Migration completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Migration failed:", error);
      process.exit(1);
    });
}
