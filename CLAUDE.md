# 🎂 CakeCraftPro - Complete System Documentation

## 📋 Task-Master Usage Guide

### Common Task-Master Commands (using `tm` alias):

**Viewing Tasks:**
- `tm list` - List all tasks with their status
- `tm show 11` - Show detailed info about task 11
- `tm next` - Show the next task to work on

**Managing Task Status:**
- `tm set-status --id=11 --status=in-progress` - Start working on a task
- `tm set-status --id=11.1 --status=done` - Mark subtask as complete
- Status options: `pending`, `in-progress`, `done`, `blocked`, `deferred`, `cancelled`

**Task Management:**
- `tm add-task --prompt="Create user authentication system"` - Add new task
- `tm update-task --id=11 --prompt="Add Instagram integration"` - Update task details
- `tm remove-task --id=11 -y` - Remove a task

**Subtask Management:**
- `tm add-subtask --parent=11 --title="Setup Instagram API"` - Add subtask manually
- `tm update-subtask --id=11.3 --prompt="Use Instagram oEmbed API"` - Update subtask
- `tm clear-subtasks --id=11` - Remove all subtasks from a task

**Dependencies:**
- `tm add-dependency --id=11 --depends-on=5` - Add dependency
- `tm remove-dependency --id=11 --depends-on=5` - Remove dependency

### Task-Master File Structure:
```
.taskmaster/
├── config.json           # AI model configuration
├── tasks/
│   ├── tasks.json       # Main task database
│   ├── task_001.txt     # Individual task files
│   └── ...
└── prompt-to-generate-tasks.txt
```

### Important Notes:
- Task files are auto-generated from tasks.json
- Always use status commands to track progress
- Dependencies must reference lower ID numbers only
- Use Claude for task expansion to avoid API usage
- **ALWAYS update dependencies when task approach changes** (e.g., `tm remove-dependency --id=11.3 --depends-on=11.2`)
- Check dependencies with `tm show <task-id>` before marking tasks complete

## 🤖 Claude Task Expansion Command

**⚠️ IMPORTANT: Always use this Claude command instead of `tm expand` to avoid using API tokens**

When asked to "expand task X" or "break down task X", I will analyze the task and generate subtasks following this structure:

```json
{
  "subtasks": [
    {
      "id": 1,
      "title": "Subtask title",
      "description": "Clear description of what needs to be done",
      "dependencies": [], // Array of subtask IDs this depends on
      "details": "Implementation details including specific steps, code patterns, and technical considerations",
      "status": "pending",
      "testStrategy": "How to verify this subtask is complete and working correctly"
    }
  ]
}
```

### Expansion Guidelines:
1. Generate 3-7 subtasks based on complexity (default: 5)
2. Each subtask should be atomic and independently completable
3. Dependencies must only reference lower-numbered subtasks
4. Order subtasks logically (setup → core → features → polish)
5. Include concrete implementation details
6. Define clear test/verification strategies
7. Consider existing project patterns and conventions

### Example Usage:
- "Expand task 11" - Expands with default settings
- "Expand task 11 with 7 subtasks" - Specific number
- "Expand task 11 focusing on performance" - Additional context

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

## 🔐 Admin Authentication System

### **Architecture Overview**
The admin authentication uses a session-based system with tokens stored in localStorage:

1. **Backend Authentication** (`/api/admin-auth/verify`)
   - Validates credentials against environment variables
   - Returns a session token on successful login
   - Maintains active sessions in memory with 24-hour expiry

2. **Frontend Hook** (`useAdminAuth`)
   - **CRITICAL**: Must return `sessionToken` in the hook's return object
   - Stores session data in localStorage as: `{ timestamp, token }`
   - Validates session expiry on component mount

### **Common Authentication Issues & Solutions**

#### **Issue**: Admin pages show "Loading..." indefinitely
**Cause**: `useAdminAuth` hook not returning `sessionToken` properly
**Solution**: Ensure the hook returns all necessary fields:
```typescript
return {
  isAuthenticated,
  isLoading,
  login,
  logout,
  loginLoading,
  loginError,
  sessionToken, // ← CRITICAL: Must be included!
};
```

#### **Issue**: API calls fail with 401 despite being logged in
**Cause**: Session token not being passed in request headers
**Solution**: Always include both Authorization and X-Admin-Session headers:
```typescript
headers: {
  'Authorization': `Bearer ${sessionToken}`,
  'X-Admin-Session': sessionToken
}
```

### **Session Token Management**
- Tokens are stored as: `admin_auth_session` in localStorage
- Format: `{ timestamp: number, token: string }`
- Expiry: 24 hours from creation
- The hook automatically cleans up expired sessions

## 💰 Dynamic Pricing Management System

### **Overview**
As of 2025-05-31, the system now includes a complete pricing management interface that allows admins to update prices without rebuilding or restarting the server.

### **How It Works**
1. **No Build Required**: Backend reads `pricing-structure.json` fresh on each request
2. **Immediate Updates**: Price changes take effect instantly
3. **Automatic Backups**: Creates timestamped backups before each update
4. **Cache Invalidation**: Frontend React Query caches are cleared after updates

### **API Endpoints**
- `GET /api/admin/pricing` - Fetch current pricing (admin only)
- `PUT /api/admin/pricing` - Update pricing with validation (admin only)
- `GET /api/admin/pricing/backups` - View backup history (admin only)

### **Admin UI Features**
- Comprehensive pricing management at `/admin/pricing`
- Organized tabs: Custom Cakes, Specialty Items, Extras & Add-ons, Backup History
- Real-time validation (no negative prices)
- Change tracking with reset capability
- Backup history viewer

### **Implementation Notes**
1. **Routing**: Uses Wouter's `useLocation` hook (NOT `useNavigate`)
2. **Authentication**: Requires session token from `useAdminAuth` hook
3. **Validation**: All prices must be non-negative numbers
4. **Backups**: Stored in `dist/server/pricing-backup-{timestamp}.json`

## 🛠️ Common Development Pitfalls

### **Wouter vs React Router**
This project uses **Wouter**, not React Router. Key differences:
- Use `useLocation` instead of `useNavigate`
- Navigation: `const [, setLocation] = useLocation();`
- Navigate: `setLocation('/path')`
- No `useNavigate` export available

### **Build Process**
When adding new pages or making significant changes:
1. Always run `npm run build` before `npm start`
2. The build process copies `pricing-structure.json` to dist/server/
3. Changes to React components require rebuilding

### **Environment Variables**
- Admin credentials are set via environment variables
- In production (Railway), set these in the dashboard
- Default development credentials: admin/admin123 (unless overridden)

## 📋 Testing Utilities

### **Pricing Management Tests**
- `test-pricing-management.js` - Comprehensive API tests
- `test-pricing-e2e.js` - End-to-end browser tests (requires Puppeteer)
- Tests cover: Authentication, pricing updates, validation, backups, cache invalidation

### **Running Tests**
```bash
# API tests
node test-pricing-management.js

# E2E tests (install puppeteer first)
npm install --save-dev puppeteer
node test-pricing-e2e.js
```

## 🎨 Admin Interface Styling (COMPLETED - 2025-06-03)

### **Complete Admin Styling Overhaul**
The entire admin interface has been transformed from a plain gray interface to a beautiful, friendly, gradient-rich design system.

### **AdminLayout Component** (`/client/src/components/admin/admin-layout.tsx`)
- **Centralized Layout**: All admin pages now use consistent AdminLayout wrapper
- **Sidebar Navigation**: Fixed sidebar with gradient backgrounds and active states
- **Mobile Responsive**: Hamburger menu for mobile devices with slide-in sidebar
- **Branding**: Sugar Art Diva logo with gradient text and chef hat icon
- **User Welcome**: "Welcome back, Admin" message with sparkle icon
- **Navigation Icons**: Each nav item has colored icons (pink, green, purple, blue, orange)
- **Admin Mode Badge**: Visual indicator in top-right corner
- **Footer**: Friendly footer with cake emoji

### **Styled Admin Pages**

#### **Orders Page** (`/admin/orders`)
- ✅ Stats cards with gradients (Total Orders, Pending Orders, Revenue, Today's Orders)
- ✅ Each stat card has unique color scheme and icon
- ✅ Gradient refresh button
- ✅ Friendly empty state with sparkles
- ✅ Order cards with gradient headers and status badges

#### **Pricing Page** (`/admin/pricing`)
- ✅ Tab navigation with icons (Cake, ShoppingBag, Palette, History)
- ✅ Gradient tab backgrounds with active states
- ✅ Price inputs with RM prefix styling
- ✅ Gradient cards for pricing sections
- ✅ Unsaved changes banner with sparkle icon

#### **Gallery Page** (`/admin/gallery`)
- ✅ Stats cards (Total Images, Active Images, Categories)
- ✅ Gallery grid with gradient image cards
- ✅ Add Instagram Post button with gradient
- ✅ Active/Inactive toggle buttons
- ✅ Edit and delete functionality

#### **About Page** (`/admin/about-content`)
- ✅ **FIXED**: Now uses AdminLayout component
- ✅ Blue gradient card with FileText icon
- ✅ Gradient Add/Remove buttons for specialties and reasons
- ✅ Integrated sidebar navigation

#### **Contact Page** (`/admin/contact-content`)
- ✅ **FIXED**: Now uses AdminLayout component
- ✅ Multiple themed gradient cards:
  - Blue gradient for Page Header (FileText icon)
  - Green gradient for Contact Information (Phone icon)
  - Purple gradient for Address (MapPin icon)
  - Orange gradient for Business Hours (Clock icon)
  - Indigo gradient for Social Media (Share2 icon)
- ✅ Integrated sidebar navigation

### **Design System Colors**
- **Pink**: Primary branding, orders, navigation highlights
- **Purple**: Secondary branding, gallery categories
- **Blue**: Page headers, admin mode badge
- **Green**: Contact info, save buttons, success states
- **Orange**: Business hours, pending status
- **Indigo**: Social media, today's orders
- **Emerald**: Revenue, active items

### **Testing Status**
- ✅ **MCP Playwright Testing**: All pages tested and confirmed working
- ✅ **Mobile Responsive**: Hamburger menu and sidebar functionality verified
- ✅ **Navigation**: Active states and page transitions working
- ✅ **Gradients**: All gradient backgrounds and cards rendering correctly
- ✅ **Icons**: All Lucide icons displaying properly
- ✅ **Consistency**: All admin pages now use unified AdminLayout

### **Key Features**
- **Gradient Backgrounds**: Every page has beautiful pink-to-purple-to-blue gradients
- **Stats Cards**: Visual metrics with icons and colored backgrounds
- **Friendly Empty States**: Encouraging messages with sparkle decorations
- **Consistent Navigation**: Unified sidebar across all admin pages
- **Mobile First**: Responsive design with collapsible sidebar
- **Visual Hierarchy**: Clear sections with themed gradient cards

---
*Last updated: 2025-06-03*
*Version: 4.0 - Complete admin interface styling overhaul with AdminLayout integration*
*Railway deployment with PostgreSQL + comprehensive order handling + pricing management + beautiful admin UI*