// Quick script to view all placed orders
const storage = require('./server/storage.ts');

async function viewAllOrders() {
  console.log("📋 ALL PLACED ORDERS");
  console.log("===================");
  
  try {
    // Access the storage instance directly
    const orders = Array.from(storage.storage.cakeOrders.values());
    
    if (orders.length === 0) {
      console.log("No orders found.");
      return;
    }
    
    orders.forEach((order, index) => {
      console.log(`\n${index + 1}. Order #${order.id}`);
      console.log(`   Customer: ${order.customerName}`);
      console.log(`   Email: ${order.customerEmail}`);
      console.log(`   Phone: ${order.customerPhone || 'Not provided'}`);
      console.log(`   Total: RM ${(order.totalPrice / 100).toFixed(2)}`);
      console.log(`   Status: ${order.status}`);
      console.log(`   Date: ${order.orderDate}`);
      
      // Cake details
      console.log(`   Cake: ${order.sixInchCakes || 0}x6-inch + ${order.eightInchCakes || 0}x8-inch`);
      console.log(`   Layers: ${order.layers}`);
      console.log(`   Shape: ${order.shape}`);
      console.log(`   Flavors: ${order.flavors?.join(', ') || 'Standard'}`);
      console.log(`   Icing: ${order.icingType}`);
      if (order.decorations?.length > 0) {
        console.log(`   Decorations: ${order.decorations.join(', ')}`);
      }
      if (order.dietaryRestrictions?.length > 0) {
        console.log(`   Dietary: ${order.dietaryRestrictions.join(', ')}`);
      }
      console.log(`   Delivery: ${order.deliveryMethod || 'pickup'}`);
    });
    
  } catch (error) {
    console.error("Error viewing orders:", error.message);
  }
}

viewAllOrders();