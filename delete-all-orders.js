import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import { cakeOrders } from "./shared/schema.js";
import ws from "ws";

// Configure WebSocket for Neon
import { neonConfig } from "@neondatabase/serverless";
neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool });

async function deleteAllOrders() {
  try {
    console.log("🗑️  Deleting all cake orders from database...");
    
    // Get count before deletion
    const ordersBefore = await db.select().from(cakeOrders);
    console.log(`📊 Found ${ordersBefore.length} orders to delete`);
    
    if (ordersBefore.length === 0) {
      console.log("✅ No orders found - database is already clean!");
      return;
    }
    
    // List orders that will be deleted
    console.log("\n📋 Orders to be deleted:");
    ordersBefore.forEach((order, index) => {
      console.log(`   ${index + 1}. Order #${order.id} - ${order.customerName} - RM ${(order.totalPrice / 100).toFixed(2)}`);
    });
    
    // Delete all orders
    const result = await db.delete(cakeOrders);
    console.log(`\n✅ Successfully deleted all ${ordersBefore.length} orders!`);
    
    // Verify deletion
    const ordersAfter = await db.select().from(cakeOrders);
    console.log(`📊 Orders remaining: ${ordersAfter.length}`);
    
  } catch (error) {
    console.error("❌ Error deleting orders:", error);
  } finally {
    await pool.end();
    console.log("🔌 Database connection closed");
  }
}

deleteAllOrders(); 