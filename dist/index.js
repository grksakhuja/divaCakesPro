var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import "dotenv/config";
import express3 from "express";
import session from "express-session";
import MemoryStore from "memorystore";

// server/routes.ts
import express from "express";
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  cakeOrders: () => cakeOrders,
  cakeTemplates: () => cakeTemplates,
  insertCakeOrderSchema: () => insertCakeOrderSchema,
  insertCakeTemplateSchema: () => insertCakeTemplateSchema,
  insertUserSchema: () => insertUserSchema,
  users: () => users
});
import { pgTable, text, serial, integer, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull()
});
var cakeOrders = pgTable("cake_orders", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone"),
  layers: integer("layers").notNull().default(1),
  shape: text("shape").notNull().default("round"),
  flavors: json("flavors").$type().notNull().default([]),
  icingColor: text("icing_color").notNull().default("#FFB6C1"),
  icingType: text("icing_type").notNull().default("buttercream"),
  decorations: json("decorations").$type().notNull().default([]),
  message: text("message"),
  messageFont: text("message_font").default("classic"),
  dietaryRestrictions: json("dietary_restrictions").$type().notNull().default([]),
  servings: integer("servings").notNull().default(12),
  sixInchCakes: integer("six_inch_cakes").notNull().default(0),
  eightInchCakes: integer("eight_inch_cakes").notNull().default(0),
  deliveryMethod: text("delivery_method").notNull().default("pickup"),
  totalPrice: integer("total_price").notNull(),
  // in cents
  status: text("status").notNull().default("pending"),
  orderDate: text("order_date").notNull()
});
var cakeTemplates = pgTable("cake_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  layers: integer("layers").notNull(),
  shape: text("shape").notNull(),
  flavors: json("flavors").$type().notNull(),
  icingColor: text("icing_color").notNull(),
  icingType: text("icing_type").notNull(),
  decorations: json("decorations").$type().notNull(),
  basePrice: integer("base_price").notNull()
  // in cents
});
var insertCakeOrderSchema = createInsertSchema(cakeOrders).omit({
  id: true,
  orderDate: true,
  status: true
});
var insertCakeTemplateSchema = createInsertSchema(cakeTemplates).omit({
  id: true
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq } from "drizzle-orm";
var DatabaseStorage = class {
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || void 0;
  }
  async getUserByUsername(username) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || void 0;
  }
  async createUser(insertUser) {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  async getCakeOrder(id) {
    const [order] = await db.select().from(cakeOrders).where(eq(cakeOrders.id, id));
    return order || void 0;
  }
  async getAllCakeOrders() {
    return await db.select().from(cakeOrders).orderBy(cakeOrders.id);
  }
  async createCakeOrder(insertOrder) {
    console.log("Database insert order data:", insertOrder);
    try {
      const orderData = {
        customerName: insertOrder.customerName,
        customerEmail: insertOrder.customerEmail,
        customerPhone: insertOrder.customerPhone || null,
        layers: insertOrder.layers || 1,
        shape: insertOrder.shape || "round",
        flavors: insertOrder.flavors || [],
        icingColor: insertOrder.icingColor || "#87CEEB",
        icingType: insertOrder.icingType || "butter",
        decorations: insertOrder.decorations || [],
        message: insertOrder.message || null,
        messageFont: insertOrder.messageFont || "classic",
        dietaryRestrictions: insertOrder.dietaryRestrictions || [],
        servings: insertOrder.servings || 12,
        sixInchCakes: insertOrder.sixInchCakes || 0,
        eightInchCakes: insertOrder.eightInchCakes || 0,
        deliveryMethod: insertOrder.deliveryMethod || "pickup",
        totalPrice: insertOrder.totalPrice,
        orderDate: (/* @__PURE__ */ new Date()).toISOString(),
        status: "pending"
      };
      console.log("Processed order data:", orderData);
      const [order] = await db.insert(cakeOrders).values(orderData).returning();
      console.log("Database created order:", order);
      return order;
    } catch (error) {
      console.error("Database insertion error:", error);
      throw error;
    }
  }
  async updateCakeOrderStatus(id, status) {
    const [order] = await db.update(cakeOrders).set({ status }).where(eq(cakeOrders.id, id)).returning();
    return order || void 0;
  }
  async getCakeTemplates() {
    return await db.select().from(cakeTemplates);
  }
  async getCakeTemplatesByCategory(category) {
    return await db.select().from(cakeTemplates).where(eq(cakeTemplates.category, category));
  }
  async createCakeTemplate(insertTemplate) {
    const [template] = await db.insert(cakeTemplates).values(insertTemplate).returning();
    return template;
  }
};
var storage = new DatabaseStorage();

// server/routes.ts
import { z } from "zod";
async function registerRoutes(app2) {
  const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
  const activeSessions = /* @__PURE__ */ new Map();
  setInterval(() => {
    const now = Date.now();
    for (const [token, session2] of activeSessions.entries()) {
      if (now - session2.timestamp > 24 * 60 * 60 * 1e3) {
        activeSessions.delete(token);
      }
    }
  }, 60 * 60 * 1e3);
  app2.post("/api/admin-auth/verify", express.json(), (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ success: false, message: "Username and password required" });
      }
      console.log(`Authentication attempt - Username: "${username}"`);
      console.log(`Expected Username: "${ADMIN_USERNAME}"`);
      console.log(`Password provided: ${password ? "[HIDDEN]" : "NO"}`);
      console.log(`Expected Password: ${ADMIN_PASSWORD ? "[SET]" : "NOT SET"}`);
      if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        const sessionToken = `admin_${Date.now()}_${Math.random().toString(36).substr(2, 15)}`;
        activeSessions.set(sessionToken, { timestamp: Date.now(), username });
        console.log("\u2705 Authentication successful - Session created");
        res.json({
          success: true,
          message: "Authentication successful",
          sessionToken
        });
      } else {
        console.log("\u274C Authentication failed - Invalid credentials");
        res.status(401).json({ success: false, message: "Invalid credentials" });
      }
    } catch (error) {
      console.log("\u274C Authentication error:", error);
      res.status(500).json({ success: false, message: "Server error during authentication" });
    }
  });
  const requireAdmin = (req, res, next) => {
    const isAuth = req.session?.adminAuthenticated === true;
    const loginTime = req.session?.adminLoginTime;
    const isExpired = loginTime && Date.now() - loginTime > 24 * 60 * 60 * 1e3;
    if (isAuth && !isExpired) {
      next();
    } else {
      if (isExpired) {
        delete req.session.adminAuthenticated;
        delete req.session.adminLoginTime;
      }
      res.status(401).json({ message: "Admin access required" });
    }
  };
  app2.get("/api/templates", async (req, res) => {
    try {
      const templates = await storage.getCakeTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });
  app2.get("/api/templates/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const templates = await storage.getCakeTemplatesByCategory(category);
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });
  app2.get("/api/orders", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const sessionToken = authHeader?.replace("Bearer ", "") || req.headers["x-admin-session"];
      if (!sessionToken) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const session2 = activeSessions.get(sessionToken);
      if (!session2) {
        return res.status(401).json({ message: "Invalid or expired session" });
      }
      if (Date.now() - session2.timestamp > 24 * 60 * 60 * 1e3) {
        activeSessions.delete(sessionToken);
        return res.status(401).json({ message: "Session expired" });
      }
      console.log("\u2705 Valid session found for user:", session2.username);
      const orders = await storage.getAllCakeOrders();
      console.log("Orders found:", orders.length, orders);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });
  app2.post("/api/orders", async (req, res) => {
    try {
      console.log("Creating order with data:", req.body);
      const validatedData = insertCakeOrderSchema.parse(req.body);
      console.log("Validated data:", validatedData);
      const order = await storage.createCakeOrder(validatedData);
      console.log("Created order:", order);
      res.status(201).json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid order data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create order" });
      }
    }
  });
  app2.get("/api/orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid order ID" });
      }
      const order = await storage.getCakeOrder(id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });
  app2.patch("/api/orders/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid order ID" });
      }
      if (!status || typeof status !== "string") {
        return res.status(400).json({ message: "Valid status is required" });
      }
      const order = await storage.updateCakeOrderStatus(id, status);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to update order status" });
    }
  });
  app2.post("/api/calculate-price", async (req, res) => {
    try {
      const { layers = 1, decorations = [], icingType = "butter", dietaryRestrictions = [], flavors = [], shape = "round", template, sixInchCakes = 0, eightInchCakes = 0 } = req.body;
      if (template === "fathers-day" || template === "999" || template === 999) {
        return res.json({
          basePrice: 8e3,
          layerPrice: 0,
          flavorPrice: 0,
          shapePrice: 0,
          decorationTotal: 0,
          icingPrice: 0,
          dietaryUpcharge: 0,
          photoPrice: 0,
          cakeQuantity: 1,
          totalPrice: 8e3,
          breakdown: {
            base: 8e3,
            layers: 0,
            flavors: 0,
            shape: 0,
            decorations: 0,
            icing: 0,
            dietary: 0,
            photo: 0
          }
        });
      }
      const sixInch = Math.max(0, parseInt(String(sixInchCakes)) || 0);
      const eightInch = Math.max(0, parseInt(String(eightInchCakes)) || 0);
      const totalCakes = sixInch + eightInch;
      if (totalCakes === 0) {
        return res.status(400).json({ message: "Must select at least one cake" });
      }
      const basePrice = sixInch * 8e3 + eightInch * 15500;
      const layerPrice = Math.max(0, layers - 1) * 1500 * totalCakes;
      let flavorPrice = 0;
      if (Array.isArray(flavors)) {
        flavors.forEach((flavor) => {
          if (flavor === "chocolate") flavorPrice += 2e3;
          else if (flavor?.includes("poppyseed")) flavorPrice += 500;
        });
      }
      flavorPrice *= totalCakes;
      let shapePrice = 0;
      if (shape === "heart") {
        shapePrice = 1800 * totalCakes;
      }
      const decorationPrices = {
        sprinkles: 500,
        flowers: 2e3,
        fruit: 1200,
        gold: 1500,
        "happy-birthday": 700,
        "anniversary": 700
      };
      let decorationTotal = 0;
      if (Array.isArray(decorations)) {
        decorations.forEach((decoration) => {
          decorationTotal += decorationPrices[decoration] || 0;
        });
      }
      decorationTotal *= totalCakes;
      const icingPrices = {
        butter: 0,
        whipped: 1e3,
        fondant: 1e3,
        chocolate: 2e3
      };
      const icingPrice = (icingPrices[icingType] || 0) * totalCakes;
      let dietaryUpcharge = 0;
      if (Array.isArray(dietaryRestrictions)) {
        dietaryRestrictions.forEach((restriction) => {
          if (restriction === "eggless") dietaryUpcharge += 1e3;
          else if (restriction === "vegan") dietaryUpcharge += 3500;
          else if (restriction === "halal") dietaryUpcharge += 500;
        });
      }
      dietaryUpcharge *= totalCakes;
      const photoPrice = 0;
      const totalPrice = basePrice + layerPrice + flavorPrice + shapePrice + decorationTotal + icingPrice + dietaryUpcharge + photoPrice;
      res.json({
        basePrice,
        layerPrice,
        flavorPrice,
        shapePrice,
        decorationTotal,
        icingPrice,
        dietaryUpcharge,
        photoPrice,
        cakeQuantity: totalCakes,
        totalPrice,
        breakdown: {
          base: basePrice,
          layers: layerPrice,
          flavors: flavorPrice,
          shape: shapePrice,
          decorations: decorationTotal,
          icing: icingPrice,
          dietary: dietaryUpcharge,
          photo: photoPrice
        }
      });
    } catch (error) {
      console.error("Pricing calculation error:", error);
      res.status(500).json({ message: "Failed to calculate price" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express2 from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express2.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express3();
app.use(express3.json());
app.use(express3.urlencoded({ extended: false }));
var MemoryStoreSession = MemoryStore(session);
app.use(session({
  secret: "cake-admin-secret-key",
  resave: false,
  saveUninitialized: false,
  store: new MemoryStoreSession({
    checkPeriod: 864e5
    // prune expired entries every 24h
  }),
  cookie: {
    secure: false,
    // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1e3
    // 24 hours
  }
}));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5001;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
