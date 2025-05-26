# Custom Cake Builder - Netlify Deployment Guide

## Overview
Your custom cake builder is a full-stack application with:
- **Frontend**: React with TypeScript, Tailwind CSS, and modern UI components
- **Backend**: Express.js API with PostgreSQL database
- **Features**: Secure admin panel, order management, dynamic pricing, Father's Day specials

## Deployment Options

### Option 1: Full-Stack on Netlify (Recommended)
Deploy both frontend and backend together using Netlify Functions.

### Option 2: Frontend on Netlify + Backend Elsewhere
Deploy frontend to Netlify and backend to Railway, Render, or Vercel.

## Step-by-Step Netlify Deployment

### 1. Download Your Project
- Use the "Download" feature in Replit to get a ZIP file of your project
- Extract the files to your local computer

### 2. Prepare for Netlify Functions
Create these files in your project:

#### `netlify.toml` (in root directory):
```toml
[build]
  command = "npm run build"
  functions = "netlify/functions"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### `netlify/functions/api.js`:
```javascript
const express = require('express');
const serverless = require('serverless-http');
const { registerRoutes } = require('../../server/routes');

const app = express();

// Register your existing routes
registerRoutes(app);

module.exports.handler = serverless(app);
```

### 3. Update package.json
Add these scripts:
```json
{
  "scripts": {
    "build": "vite build",
    "build:functions": "netlify-lambda build server"
  },
  "devDependencies": {
    "netlify-lambda": "^2.0.15",
    "serverless-http": "^3.2.0"
  }
}
```

### 4. Environment Variables on Netlify
Set these in Netlify dashboard (Site settings > Environment variables):
- `DATABASE_URL` - Your PostgreSQL connection string
- `ADMIN_USERNAME` - Admin login username
- `ADMIN_PASSWORD` - Admin login password
- `SESSION_SECRET` - Random string for session security

### 5. Database Setup
**Option A: Neon (Recommended for Netlify)**
1. Sign up at neon.tech
2. Create a new PostgreSQL database
3. Copy the connection string to `DATABASE_URL`

**Option B: Supabase**
1. Sign up at supabase.com
2. Create new project with PostgreSQL
3. Get connection string from settings

### 6. Deploy to Netlify
1. Push your code to GitHub/GitLab
2. Connect repository to Netlify
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Add environment variables
6. Deploy!

## Database Migration
Run these SQL commands in your database to create tables:

```sql
-- Users table for admin authentication
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL
);

-- Cake orders table
CREATE TABLE cake_orders (
  id SERIAL PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(255),
  layers INTEGER NOT NULL,
  shape VARCHAR(50) NOT NULL,
  flavors JSONB NOT NULL,
  icing_color VARCHAR(50) NOT NULL,
  icing_type VARCHAR(50) NOT NULL,
  decorations JSONB NOT NULL,
  message TEXT,
  message_font VARCHAR(50),
  dietary_restrictions JSONB NOT NULL,
  servings INTEGER NOT NULL,
  six_inch_cakes INTEGER NOT NULL,
  eight_inch_cakes INTEGER NOT NULL,
  delivery_method VARCHAR(50) NOT NULL,
  total_price INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cake templates table
CREATE TABLE cake_templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  layers INTEGER NOT NULL,
  shape VARCHAR(50) NOT NULL,
  flavors JSONB NOT NULL,
  icing_color VARCHAR(50) NOT NULL,
  icing_type VARCHAR(50) NOT NULL,
  decorations JSONB NOT NULL,
  base_price INTEGER NOT NULL
);
```

## Testing Your Deployment
1. Test the cake builder functionality
2. Try placing an order
3. Test admin login at `/admin/login`
4. Verify orders appear in admin panel

## Alternative: Quick Deploy with Railway
If Netlify seems complex, try Railway.app:
1. Connect your GitHub repo to Railway
2. Add environment variables
3. Railway auto-detects Node.js and deploys!

## Support
Your cake builder includes:
- ✅ Responsive mobile-first design
- ✅ Secure admin authentication
- ✅ Real-time order management
- ✅ Dynamic pricing engine
- ✅ Father's Day special pricing
- ✅ Professional order confirmation system

Need help? The code is well-documented and ready for production!