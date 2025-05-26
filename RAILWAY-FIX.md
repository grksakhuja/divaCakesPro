# 🚀 Railway Deployment Fix Guide

## Common Railway Deployment Issues & Solutions

### Issue 1: Build Command Problems
**Solution**: Set these in Railway dashboard:
- **Build Command**: `npm run build`
- **Start Command**: `npm start`

### Issue 2: Environment Variables Missing
Add these **REQUIRED** environment variables in Railway:

#### Database (Railway provides this automatically)
- `DATABASE_URL` - Railway PostgreSQL connection string

#### Admin Authentication
- `ADMIN_USERNAME` - Your admin username (e.g., "admin")
- `ADMIN_PASSWORD` - Your admin password (choose something secure)

#### Session Security
- `SESSION_SECRET` - Random string for session security (e.g., "your-random-secret-key-here")

#### Node Environment
- `NODE_ENV` - Set to "production"

### Issue 3: Port Configuration
Railway automatically provides the PORT environment variable. Your app should work as-is.

### Issue 4: Database Connection
Railway provides PostgreSQL automatically. Make sure:
1. You've added the PostgreSQL service in Railway
2. The `DATABASE_URL` is automatically set
3. Your app connects to `process.env.DATABASE_URL`

### Issue 5: Build Timeout
If build takes too long:
1. Try deploying from the main/master branch
2. Check that all dependencies are in package.json
3. Railway may need 2-3 minutes for first deployment

## Step-by-Step Railway Deployment

### 1. GitHub Repository Setup
- Make sure your GitHub repo has all files
- Include the `railway.json` and `Procfile` I just created
- Push all changes to GitHub

### 2. Railway Project Setup
1. Go to [railway.app](https://railway.app)
2. Click "Start a New Project"
3. Choose "Deploy from GitHub repo"
4. Select your cake builder repository
5. Railway will auto-detect it's a Node.js app

### 3. Add PostgreSQL Database
1. In Railway dashboard, click "Add Service"
2. Choose "Database" → "PostgreSQL"
3. Railway automatically connects it to your app

### 4. Set Environment Variables
Go to your app service → Variables tab:
```
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password
SESSION_SECRET=your-random-secret-key-123
NODE_ENV=production
```

### 5. Deploy
Railway will automatically deploy. First deployment may take 3-5 minutes.

## Testing Your Deployment
Once deployed, test:
- Main app: `https://your-app-name.railway.app`
- Admin panel: `https://your-app-name.railway.app/admin/login`
- Order functionality: Try creating a Father's Day order

## If Still Failing...
Check Railway build logs for specific error messages. Common fixes:
- Ensure all files are in GitHub repo
- Verify environment variables are set
- Make sure PostgreSQL service is running
- Try redeploying from Railway dashboard

Your cake builder is production-ready - these configuration files should resolve the deployment issues!