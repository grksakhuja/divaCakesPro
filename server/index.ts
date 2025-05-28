import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import MemoryStore from "memorystore";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { db } from "./db";
import { cakeTemplates } from "@shared/schema";
import { isTemplateSeedingEnabled } from "./feature-flags";

// Initialize seeding immediately
console.log("🚀 Starting server initialization...");
console.log('BREVO_API_KEY:', process.env.BREVO_API_KEY); // Add this line before initializing Brevo

const CAKE_TEMPLATES = [
  {
    name: "Classic Birthday Cake",
    category: "birthday", 
    layers: 1,
    shape: "round",
    flavors: ["chocolate"] as string[],
    icingColor: "#FFB6C1",
    icingType: "buttercream",
    decorations: ["sprinkles", "happy-birthday"] as string[],
    basePrice: 4500,
  },
  {
    name: "Fun Kids Cake",
    category: "kids",
    layers: 2,
    shape: "round", 
    flavors: ["chocolate", "butter"] as string[],
    icingColor: "#87CEEB",
    icingType: "buttercream",
    decorations: ["sprinkles", "happy-birthday"] as string[],
    basePrice: 6000,
  },
  {
    name: "Elegant Wedding Cake",
    category: "wedding",
    layers: 3,
    shape: "round",
    flavors: ["vanilla", "red-velvet"] as string[],
    icingColor: "#FFFFFF",
    icingType: "fondant",
    decorations: ["flowers", "pearls"] as string[],
    basePrice: 12000,
  },
  {
    name: "Corporate Celebration",
    category: "corporate",
    layers: 2,
    shape: "square",
    flavors: ["chocolate"] as string[],
    icingColor: "#2E86AB",
    icingType: "buttercream",
    decorations: ["logo"] as string[],
    basePrice: 8000,
  },
  {
    name: "Holiday Special",
    category: "holiday",
    layers: 1,
    shape: "round",
    flavors: ["spice"] as string[],
    icingColor: "#DC143C",
    icingType: "cream-cheese",
    decorations: ["seasonal"] as string[],
    basePrice: 5500,
  }
];

async function seedTemplatesInline() {
  console.log("🌱 Seeding templates function called (inline)...");
  
  try {
    console.log("📊 Connecting to database...");
    
    // Check if templates already exist
    console.log("🔍 Checking for existing templates...");
    const existingTemplates = await db.select().from(cakeTemplates);
    console.log(`📋 Found ${existingTemplates.length} existing templates`);
    
    if (existingTemplates.length > 0) {
      console.log(`✅ Templates already exist (${existingTemplates.length} found). Skipping seed.`);
      return;
    }

    console.log("📝 Inserting new templates...");
    // Insert all templates at once
    const insertedTemplates = await db.insert(cakeTemplates).values(CAKE_TEMPLATES).returning();
    console.log(`🎯 Successfully inserted ${insertedTemplates.length} templates`);
    
    console.log("Template names:", insertedTemplates.map(t => t.name));
    
  } catch (error) {
    console.error("💥 Error in seedTemplates:", error);
    throw error;
  }
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));

// Add a simple health check endpoint
app.get('/health', (req, res) => {
  const actualPort = parseInt(process.env.PORT || "5000", 10);
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    port: actualPort,
    portSource: process.env.PORT ? 'environment' : 'fallback',
    host: process.env.RAILWAY_ENVIRONMENT ? '0.0.0.0' : 'localhost',
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      RAILWAY_ENVIRONMENT: process.env.RAILWAY_ENVIRONMENT,
      PORT: process.env.PORT
    }
  });
});

// Add session middleware with proper memory store
const MemoryStoreSession = MemoryStore(session);
app.use(session({
  secret: "cake-admin-secret-key",
  resave: false,
  saveUninitialized: false,
  store: new MemoryStoreSession({
    checkPeriod: 86400000 // prune expired entries every 24h
  }),
  cookie: {
    secure: false, // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

async function startServer() {
  // Feature-controlled template seeding
  if (isTemplateSeedingEnabled()) {
    console.log("🌱 Template seeding enabled - running seeding...");
    await seedTemplatesInline();
  } else {
    console.log("🚫 Template seeding disabled by feature flag");
  }

  console.log("🔧 Registering routes...");
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Use PORT environment variable with fallback to 5000
  // Railway provides PORT automatically, locally we can set it
  console.log("🔍 PORT Environment Variables:");
  console.log("  process.env.PORT:", process.env.PORT);
  console.log("  All relevant env vars:", {
    PORT: process.env.PORT,
    NODE_ENV: process.env.NODE_ENV,
    RAILWAY_ENVIRONMENT: process.env.RAILWAY_ENVIRONMENT
  });
  
  const port = parseInt(process.env.PORT || "5000", 10);
  // Only use 0.0.0.0 when running on Railway (which has RAILWAY_ENVIRONMENT set)
  const host = process.env.RAILWAY_ENVIRONMENT ? "0.0.0.0" : "localhost";
  
  console.log(`🚀 Attempting to start server on ${host}:${port}...`);
  console.log(`📊 Calculated port: ${port} (from env: ${process.env.PORT || 'undefined'})`);
  
  server.listen(port, host, () => {
    console.log(`🚀 Server successfully started and listening on ${host}:${port}`);
    console.log(`🌐 Server environment: ${app.get("env")}`);
    console.log(`🏁 Server is ready to accept connections`);
  });

  // Add error handling for server startup
  server.on('error', (error: any) => {
    console.error('❌ Server startup error:', error);
    if (error.code === 'EADDRINUSE') {
      console.error(`💥 Port ${port} is already in use`);
    }
    process.exit(1);
  });
}

// Start the server
startServer().catch(error => {
  console.error("❌ Server startup failed:", error);
  process.exit(1);
});