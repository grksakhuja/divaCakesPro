# 🎂 CakeCraftPro - Complete System Documentation

## 🎯 Project Overview
**CakeCraftPro-Railway** is a custom cake ordering platform with:
- **Custom cake builder** with real-time pricing
- **Specialty items catalog** (dynamically generated from JSON)
- **Shopping cart** supporting mixed items
- **Admin order management** system
- **Email notifications** via Brevo SMTP

## 🏗️ Order System Architecture

The order system supports two types of orders:
1. **Single Custom Cake Orders** (`hasLineItems: false`) - Traditional cake builder orders
2. **Multi-Item Cart Orders** (`hasLineItems: true`) - Cart with multiple items (custom cakes + specialty items)

## 📊 Database Schema

### Main Tables

#### `cake_orders` (Main Order Table)
- **Primary fields**: Customer info, delivery method, pricing, status
- **Legacy fields**: Single cake configuration (layers, shape, flavors, etc.)
- **Key field**: `hasLineItems` boolean - determines order type

#### `order_items` (Line Items Table) 
- **Used when**: `hasLineItems = true`
- **Contains**: Individual cart items with their own configurations
- **Item types**: `custom`, `specialty`, `slice`, `candy`

## 🔄 Order Flow Architecture

### 1. **Cart → Checkout → Database**
```
Shopping Cart → /api/checkout → Order Creation → Email Notifications
```

#### Single Custom Cake Flow:
- Cart has 1 custom cake
- Creates order with `hasLineItems: false`
- Stores config in main `cake_orders` table

#### Multi-Item Cart Flow:
- Cart has multiple items
- Creates order with `hasLineItems: true`
- Stores main order + individual items in `order_items` table

### 2. **Database → Admin Interface**
```
/api/orders → getAllCakeOrders() → Admin Dashboard Display
```

## 🔧 Critical Implementation Points

### Backend (`server/storage.ts`)

#### `getAllCakeOrders()` Method
**MUST include line items fetching:**
```typescript
// For orders with line items, fetch the associated order items
const ordersWithItems = await Promise.all(
  orders.map(async (order) => {
    if (order.hasLineItems) {
      const items = await this.getOrderItemsByOrderId(order.id);
      return { ...order, orderItems: items };
    }
    return order;
  })
);
```

#### `createOrderItem()` Method
**MUST be called for each cart item in multi-item orders**

### Frontend (`client/src/pages/admin-orders.tsx`)

#### Order Display Logic
**MUST handle both order types:**
```typescript
{order.hasLineItems ? (
  // Multi-item order display
  order.orderItems?.map(item => ...)
) : (
  // Single custom cake display
  <div>Cake Details: {order.layers}, {order.shape}...</div>
)}
```

### API Endpoints (`server/routes.ts`)

#### `/api/checkout` Endpoint
**MUST handle both single and multi-item orders:**
- Single item + custom → Use legacy format
- Multiple items → Use line items format

## ⚠️ Common Pitfalls & Solutions

### 1. **Missing Line Items in Admin**
**Symptom**: Orders show as multi-item but no items displayed
**Cause**: `getAllCakeOrders()` not fetching `orderItems`
**Solution**: Ensure line items are fetched for `hasLineItems: true` orders

### 2. **Cart Items Not Saved**
**Symptom**: Checkout succeeds but order items missing in database
**Cause**: `/api/checkout` not calling `createOrderItem()` for each item
**Solution**: Loop through all cart items and create order_items records

### 3. **Admin Interface Errors**
**Symptom**: Admin page crashes or shows wrong data
**Cause**: Frontend not handling both order types
**Solution**: Add conditional rendering for `hasLineItems` orders

## 🧪 Testing Checklist

When making order system changes, **ALWAYS test**:

### End-to-End Flow:
- [ ] Create custom cake → Add to cart → Checkout
- [ ] Add specialty items → Add to cart → Checkout  
- [ ] Mix custom + specialty → Add to cart → Checkout
- [ ] Check admin dashboard shows all order details correctly
- [ ] Verify email notifications work
- [ ] Test order status updates

### Database Verification:
- [ ] `cake_orders` table has correct `hasLineItems` flag
- [ ] `order_items` table populated for multi-item orders
- [ ] All pricing calculations correct

### Admin Interface:
- [ ] Single custom cakes display cake configuration
- [ ] Multi-item orders display all cart items
- [ ] Error handling for missing line items
- [ ] Order totals match cart totals

## 📝 Development Workflow

### When Adding New Features:
1. **Plan impact on both order types**
2. **Update backend storage methods**
3. **Update frontend admin interface**
4. **Update checkout API if needed**
5. **Test complete flow end-to-end**
6. **Update this documentation**

### When Debugging Order Issues:
1. **Check server logs** for order creation
2. **Verify database** has correct records
3. **Test admin API** (`/api/orders`) directly
4. **Check frontend console** for errors

## 🎯 Key Files to Update Together

When making order changes, these files are interconnected:

### Backend:
- `server/storage.ts` - Database operations
- `server/routes.ts` - API endpoints
- `shared/schema.ts` - Database schema

### Frontend:
- `client/src/pages/admin-orders.tsx` - Admin display
- `client/src/pages/checkout.tsx` - Order creation
- `client/src/lib/cake-builder-store.ts` - Cart management

**⚠️ Always update ALL related files when making order system changes!**

## 🚀 Future Improvements

- Add order search/filtering in admin
- Add order editing capabilities
- Add bulk order operations
- Add order analytics dashboard
- Add customer order history

## 🛠️ Technology Stack & Key Details

### **Database**: PostgreSQL on Railway
- **Connection**: Standard PostgreSQL driver (NOT Neon serverless)
- **Tables**: `cake_orders`, `order_items`, `cake_templates`, `users`
- **Critical**: Use Railway's internal DATABASE_URL for deployed environment

### **Frontend**: React + TypeScript + Vite
- **Routing**: Wouter (NOT react-router-dom)
- **State**: Zustand for cart management
- **Styling**: Tailwind CSS + shadcn/ui components
- **Queries**: TanStack Query for data fetching

### **Backend**: Express + Drizzle ORM
- **Database ORM**: Drizzle with node-postgres driver
- **Email**: Brevo SMTP (configured in .env)
- **Storage**: DatabaseStorage class for production

### **Deployment**: Railway
- **Environment Variables**: Set in Railway dashboard (NOT .env file)
- **Build**: `npm run build` creates dist/ folder
- **Start**: `npm start` runs production server

## 🚀 Current System Status (as of 2025-05-30)

### ✅ **Working Features**:
- Custom cake builder with real-time pricing
- Dynamic specialty items from `pricing-structure.json`
- Shopping cart with mixed custom + specialty items
- Order creation and database storage
- Email notifications (customer + admin)
- Admin authentication and order management
- Feature flags system (templates currently disabled)

### 🔧 **Recent Fixes Applied**:
- Switched from Neon serverless to standard PostgreSQL driver
- Fixed database connection issues on Railway
- Enhanced admin interface to display multi-item orders
- Added comprehensive error handling and logging

### ⚠️ **Known Issues & Notes**:
- Templates disabled via feature flags (seeding failed due to DB connectivity)
- Local database connection may timeout (normal - use Railway deployment)
- Must set environment variables in Railway dashboard for deployment
- **CRITICAL**: Specialty items system is NOT fully dynamic yet - still uses hardcoded arrays

### 🚨 **IMPORTANT DISCREPANCY**:
Earlier in this conversation, we worked on making the specialty items fully dynamic, but the current codebase still has:
- Hardcoded product arrays in `cakes.tsx`
- No `/api/cakes` endpoint (only `/api/pricing-structure`)
- JSON structure uses flat `specialtyItems`/`slicedCakes` (not nested `cakes` sections)

**This indicates either:**
1. Changes were not deployed, OR
2. Code was reverted, OR  
3. We're looking at an older version

## 🔑 Required Environment Variables

### **For Railway Deployment**:
```
DATABASE_URL=<your_railway_postgresql_url>
ADMIN_USERNAME=<admin_username>
ADMIN_PASSWORD=<secure_admin_password>
ADMIN_EMAIL=<admin_email_addresses>
FROM_EMAIL=<your_business_email>
BREVO_SMTP_USER=<brevo_smtp_username>
BREVO_SMTP_PASS=<brevo_smtp_api_key>
DEMO_MODE=true
```

**Note**: Set these in Railway dashboard, not in code files.

## 📁 Key File Structure & Responsibilities

### **Critical Backend Files**:
- `server/db.ts` - Database connection config
- `server/storage.ts` - Database operations (CRITICAL for order handling)
- `server/routes.ts` - API endpoints
- `server/pricing-structure.json` - Dynamic product data
- `shared/schema.ts` - Database schema definitions

### **Critical Frontend Files**:
- `client/src/pages/admin-orders.tsx` - Admin order display
- `client/src/pages/checkout.tsx` - Order creation
- `client/src/pages/cakes.tsx` - Specialty items display (currently hardcoded arrays)
- `client/src/lib/cake-builder-store.ts` - Cart state management
- `client/src/types/cart.ts` - Cart item definitions

## 🎯 Specialty Items System (CURRENT STATE)

### **JSON Structure** (`pricing-structure.json`):
```json
{
  "specialtyItems": {
    "cheesecake-whole": 8500,
    "pavlova": 2100,
    "matcha-pavlova": 2100,
    "coconut-candy-og": 4200,
    "coconut-candy-pandan": 4200,
    "coconut-candy-raspberry": 4200
  },
  "slicedCakes": {
    "orange-poppyseed": 700,
    "butter-cake": 700,
    "chocolate-fudge": 700
  }
}
```

### **API Endpoint**: `/api/pricing-structure`
- Returns entire pricing structure including specialty items
- Used for price lookups in frontend

### **Frontend Display**: `cakes.tsx`
- **⚠️ CURRENTLY USES HARDCODED ARRAYS**
- Has hardcoded `specialtyItems`, `slicedCakes`, `coconutCandy` arrays
- Fetches pricing from `/api/pricing-structure` for price display only
- **NOT fully dynamic yet - requires refactoring**

### **🚧 PLANNED IMPROVEMENTS**:
- Convert to fully dynamic system with `/api/cakes` endpoint
- Remove hardcoded arrays from frontend
- Restructure JSON to nested sections format

## 💡 Development Best Practices

### **When Making Changes**:
1. **Always test locally first** with `npm run dev`
2. **Check database connections** work in target environment
3. **Update related components together** (see interconnected files list)
4. **Test complete user flow** from cart to admin interface
5. **Verify environment variables** are set correctly

### **Debugging Order Issues**:
1. Check Railway logs for detailed error messages
2. Test `/api/orders` endpoint directly in browser
3. Verify database has correct records using Railway console
4. Check frontend console for React errors

### **Adding New Features**:
1. Consider impact on both single and multi-item orders
2. Update database schema if needed
3. Update both frontend and backend simultaneously
4. Add proper error handling and logging
5. Test thoroughly before deployment

---
*Last updated: 2025-05-30*
*Version: 2.0 - Post database migration and order system fixes*
*Railway deployment with PostgreSQL + comprehensive order handling*