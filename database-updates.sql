-- Add payment-related columns to cake_orders table
ALTER TABLE cake_orders 
ADD COLUMN payment_method TEXT DEFAULT 'cash',
ADD COLUMN payment_status TEXT DEFAULT 'pending',
ADD COLUMN payment_id TEXT,
ADD COLUMN payment_url TEXT,
ADD COLUMN payment_reference TEXT,
ADD COLUMN payment_amount INTEGER,
ADD COLUMN payment_completed_at TEXT;

-- Create payments table for detailed tracking
CREATE TABLE payments (
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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
