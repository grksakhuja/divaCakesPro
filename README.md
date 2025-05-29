# Sugar Art Diva - Custom Cake Ordering Platform

## Local Development

### Port Configuration
On macOS, port 5000 is often blocked by AirPlay. You have several options:

1. **Disable AirPlay Receiver** (Recommended):
   - Go to System Settings → AirDrop & Handoff
   - Turn OFF "AirPlay Receiver"

2. **Use a different port**:
   ```bash
   PORT=3000 npm run dev
   ```

3. **Build and run production locally**:
   ```bash
   npm run build
   PORT=3000 npm start
   ```

The app will be available at `http://localhost:PORT` (default 5000, or whatever you specify)

## Production Deployment

On Railway, the app automatically uses Railway's PORT environment variable. No configuration needed!

## Features

- **Homepage**: Browse featured cakes and learn about Sugar Art Diva
- **Cake Builder** (/order): Create custom cakes with real-time pricing
- **Admin Panel** (/admin): Manage orders (password protected)

All prices are displayed in Malaysian Ringgit (MYR) and fetched dynamically from the pricing API.
