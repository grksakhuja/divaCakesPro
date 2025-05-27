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
  async deleteCakeOrder(id) {
    const result = await db.delete(cakeOrders).where(eq(cakeOrders.id, id));
    return result.rowCount > 0;
  }
  async deleteAllCakeOrders() {
    const ordersBefore = await db.select().from(cakeOrders);
    const count = ordersBefore.length;
    if (count > 0) {
      await db.delete(cakeOrders);
    }
    return count;
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
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
function getPricingStructure() {
  try {
    const pricingStructurePath = path.join(__dirname, "server", "pricing-structure.json");
    return JSON.parse(fs.readFileSync(pricingStructurePath, "utf-8"));
  } catch (error) {
    console.error("Error reading pricing structure:", error);
    throw new Error("Failed to load pricing structure");
  }
}
async function registerRoutes(app2) {
  const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
  const activeSessions = /* @__PURE__ */ new Map();
  setInterval(() => {
    const now = Date.now();
    for (const [token, session2] of Array.from(activeSessions.entries())) {
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
        const pricingStructure2 = getPricingStructure();
        const basePrice2 = pricingStructure2.basePrices["6inch"];
        const templatePrice = pricingStructure2.templatePrices["fathers-day"] || 0;
        const fathersDayTotalPrice = basePrice2 + templatePrice;
        return res.json({
          basePrice: basePrice2,
          templatePrice,
          layerPrice: 0,
          flavorPrice: 0,
          shapePrice: 0,
          decorationTotal: 0,
          icingPrice: 0,
          dietaryUpcharge: 0,
          photoPrice: 0,
          cakeQuantity: 1,
          totalPrice: fathersDayTotalPrice,
          breakdown: {
            base: basePrice2,
            template: templatePrice,
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
      const pricingStructure = getPricingStructure();
      const sixInch = Math.max(0, parseInt(String(sixInchCakes)) || 0);
      const eightInch = Math.max(0, parseInt(String(eightInchCakes)) || 0);
      const totalCakes = sixInch + eightInch;
      if (totalCakes === 0) {
        return res.status(400).json({ message: "Must select at least one cake" });
      }
      const basePrice = sixInch * pricingStructure.basePrices["6inch"] + eightInch * pricingStructure.basePrices["8inch"];
      const layerPrice = Math.max(0, layers - 1) * pricingStructure.layerPrice * totalCakes;
      let flavorPrice = 0;
      if (Array.isArray(flavors)) {
        flavors.forEach((flavor) => {
          const key = String(flavor).replace(/\s+/g, "-").toLowerCase();
          flavorPrice += pricingStructure.flavorPrices[key] || 0;
        });
      }
      flavorPrice *= totalCakes;
      let shapePrice = pricingStructure.shapePrices[shape] || 0;
      shapePrice *= totalCakes;
      let decorationTotal = 0;
      if (Array.isArray(decorations)) {
        decorations.forEach((decoration) => {
          const key = String(decoration).replace(/\s+/g, "-").toLowerCase();
          decorationTotal += pricingStructure.decorationPrices[key] || 0;
        });
      }
      decorationTotal *= totalCakes;
      const icingKey = String(icingType).replace(/\s+/g, "-").toLowerCase();
      const icingPrice = (pricingStructure.icingTypes[icingKey] || 0) * totalCakes;
      let dietaryUpcharge = 0;
      if (Array.isArray(dietaryRestrictions)) {
        dietaryRestrictions.forEach((restriction) => {
          const key = String(restriction).replace(/\s+/g, "-").toLowerCase();
          dietaryUpcharge += pricingStructure.dietaryPrices[key] || 0;
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
  app2.get("/api/pricing-structure", (req, res) => {
    try {
      res.json(getPricingStructure());
    } catch (err) {
      console.error("Error serving pricing structure:", err);
      res.status(500).json({ error: "Could not load pricing structure" });
    }
  });
  app2.delete("/api/orders/:id", async (req, res) => {
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
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid order ID" });
      }
      console.log(`\u{1F5D1}\uFE0F Admin ${session2.username} deleting order #${id}`);
      const deleted = await storage.deleteCakeOrder(id);
      if (!deleted) {
        return res.status(404).json({ message: "Order not found" });
      }
      console.log(`\u2705 Successfully deleted order #${id}`);
      res.json({ message: "Order deleted successfully", orderId: id });
    } catch (error) {
      console.error("Error deleting order:", error);
      res.status(500).json({ message: "Failed to delete order" });
    }
  });
  app2.delete("/api/orders", async (req, res) => {
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
      console.log("\u{1F5D1}\uFE0F Admin deleting all orders - user:", session2.username);
      const deletedCount = await storage.deleteAllCakeOrders();
      res.json({
        message: `Successfully deleted ${deletedCount} orders`,
        deletedCount
      });
    } catch (error) {
      console.error("Error deleting all orders:", error);
      res.status(500).json({ message: "Failed to delete orders" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express2 from "express";
import fs2 from "fs";
import path3 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path2 from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
var __dirname2 = path2.dirname(fileURLToPath2(import.meta.url));
var vite_config_default = defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path2.resolve(__dirname2, "./client/src"),
      "@shared": path2.resolve(__dirname2, "./shared")
    }
  },
  root: "client",
  build: {
    outDir: "../dist/public",
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
import { fileURLToPath as fileURLToPath3 } from "url";
var __filename2 = fileURLToPath3(import.meta.url);
var __dirname3 = path3.dirname(__filename2);
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
    allowedHosts: ["."]
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
      const clientTemplate = path3.resolve(
        __dirname3,
        "..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
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
  const distPath = path3.resolve(__dirname3, "public");
  if (!fs2.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express2.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}

// server/index.ts
console.log("\u{1F680} Starting server initialization...");
var CAKE_TEMPLATES = [
  {
    name: "Classic Birthday Cake",
    category: "birthday",
    layers: 1,
    shape: "round",
    flavors: ["chocolate"],
    icingColor: "#FFB6C1",
    icingType: "buttercream",
    decorations: ["sprinkles", "happy-birthday"],
    basePrice: 4500
  },
  {
    name: "Fun Kids Cake",
    category: "kids",
    layers: 2,
    shape: "round",
    flavors: ["chocolate", "butter"],
    icingColor: "#87CEEB",
    icingType: "buttercream",
    decorations: ["sprinkles", "happy-birthday"],
    basePrice: 6e3
  },
  {
    name: "Elegant Wedding Cake",
    category: "wedding",
    layers: 3,
    shape: "round",
    flavors: ["vanilla", "red-velvet"],
    icingColor: "#FFFFFF",
    icingType: "fondant",
    decorations: ["flowers", "pearls"],
    basePrice: 12e3
  },
  {
    name: "Corporate Celebration",
    category: "corporate",
    layers: 2,
    shape: "square",
    flavors: ["chocolate"],
    icingColor: "#2E86AB",
    icingType: "buttercream",
    decorations: ["logo"],
    basePrice: 8e3
  },
  {
    name: "Holiday Special",
    category: "holiday",
    layers: 1,
    shape: "round",
    flavors: ["spice"],
    icingColor: "#DC143C",
    icingType: "cream-cheese",
    decorations: ["seasonal"],
    basePrice: 5500
  }
];
async function seedTemplatesInline() {
  console.log("\u{1F331} Seeding templates function called (inline)...");
  try {
    console.log("\u{1F4CA} Connecting to database...");
    console.log("\u{1F50D} Checking for existing templates...");
    const existingTemplates = await db.select().from(cakeTemplates);
    console.log(`\u{1F4CB} Found ${existingTemplates.length} existing templates`);
    if (existingTemplates.length > 0) {
      console.log(`\u2705 Templates already exist (${existingTemplates.length} found). Skipping seed.`);
      return;
    }
    console.log("\u{1F4DD} Inserting new templates...");
    const insertedTemplates = await db.insert(cakeTemplates).values(CAKE_TEMPLATES).returning();
    console.log(`\u{1F3AF} Successfully inserted ${insertedTemplates.length} templates`);
    console.log("Template names:", insertedTemplates.map((t) => t.name));
  } catch (error) {
    console.error("\u{1F4A5} Error in seedTemplates:", error);
    throw error;
  }
}
var app = express3();
app.use(express3.json());
app.use(express3.urlencoded({ extended: false }));
app.get("/health", (req, res) => {
  const actualPort = parseInt(process.env.PORT || "5000", 10);
  res.status(200).json({
    status: "ok",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    port: actualPort,
    portSource: process.env.PORT ? "environment" : "fallback",
    host: process.env.RAILWAY_ENVIRONMENT ? "0.0.0.0" : "localhost",
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      RAILWAY_ENVIRONMENT: process.env.RAILWAY_ENVIRONMENT,
      PORT: process.env.PORT
    }
  });
});
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
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
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
async function startServer() {
  try {
    console.log("\u{1F504} Starting template seeding (inline)...");
    await seedTemplatesInline();
    console.log("\u2705 Inline seedTemplates completed successfully");
  } catch (error) {
    console.log("\u274C Failed to seed templates:", error instanceof Error ? error.message : String(error));
    console.error("Full error:", error);
    console.log("\u{1F504} Continuing with server startup despite seeding failure...");
  }
  console.log("\u{1F527} Registering routes...");
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
  console.log("\u{1F50D} PORT Environment Variables:");
  console.log("  process.env.PORT:", process.env.PORT);
  console.log("  All relevant env vars:", {
    PORT: process.env.PORT,
    NODE_ENV: process.env.NODE_ENV,
    RAILWAY_ENVIRONMENT: process.env.RAILWAY_ENVIRONMENT
  });
  const port = parseInt(process.env.PORT || "5000", 10);
  const host = process.env.RAILWAY_ENVIRONMENT ? "0.0.0.0" : "localhost";
  console.log(`\u{1F680} Attempting to start server on ${host}:${port}...`);
  console.log(`\u{1F4CA} Calculated port: ${port} (from env: ${process.env.PORT || "undefined"})`);
  server.listen(port, host, () => {
    console.log(`\u{1F680} Server successfully started and listening on ${host}:${port}`);
    console.log(`\u{1F310} Server environment: ${app.get("env")}`);
    console.log(`\u{1F3C1} Server is ready to accept connections`);
  });
  server.on("error", (error) => {
    console.error("\u274C Server startup error:", error);
    if (error.code === "EADDRINUSE") {
      console.error(`\u{1F4A5} Port ${port} is already in use`);
    }
    process.exit(1);
  });
}
startServer().catch((error) => {
  console.error("\u274C Server startup failed:", error);
  process.exit(1);
});
