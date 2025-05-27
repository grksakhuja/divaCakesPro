import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCakeOrderSchema } from "@shared/schema";
import { z } from "zod";
import path from "path";
import { fileURLToPath } from 'url';
import fs from 'fs';
import { isTemplateApiEnabled, featureFlags } from "./feature-flags";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to read pricing structure fresh each time (for live updates)
function getPricingStructure() {
  try {
    // When built, this runs from dist/index.js, so we need to look in dist/server/
    const pricingStructurePath = path.join(__dirname, 'server', 'pricing-structure.json');
    return JSON.parse(fs.readFileSync(pricingStructurePath, 'utf-8'));
  } catch (error) {
    console.error('Error reading pricing structure:', error);
    throw new Error('Failed to load pricing structure');
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Secure server-side authentication with environment variables
  const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
  
  // Store active session tokens
  const activeSessions = new Map<string, { timestamp: number; username: string }>();
  
  // Clean expired sessions periodically
  setInterval(() => {
    const now = Date.now();
    for (const [token, session] of Array.from(activeSessions.entries())) {
      if (now - session.timestamp > 24 * 60 * 60 * 1000) {
        activeSessions.delete(token);
      }
    }
  }, 60 * 60 * 1000); // Clean every hour

  // POST endpoint for admin authentication with environment variable validation
  app.post("/api/admin-auth/verify", express.json(), (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ success: false, message: "Username and password required" });
      }
      
      console.log(`Authentication attempt - Username: "${username}"`);
      console.log(`Expected Username: "${ADMIN_USERNAME}"`);
      console.log(`Password provided: ${password ? '[HIDDEN]' : 'NO'}`);
      console.log(`Expected Password: ${ADMIN_PASSWORD ? '[SET]' : 'NOT SET'}`);
      
      // Strict credential validation against environment variables
      if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        const sessionToken = `admin_${Date.now()}_${Math.random().toString(36).substr(2, 15)}`;
        activeSessions.set(sessionToken, { timestamp: Date.now(), username });
        
        console.log("✅ Authentication successful - Session created");
        res.json({ 
          success: true, 
          message: "Authentication successful",
          sessionToken 
        });
      } else {
        console.log("❌ Authentication failed - Invalid credentials");
        res.status(401).json({ success: false, message: "Invalid credentials" });
      }
    } catch (error) {
      console.log("❌ Authentication error:", error);
      res.status(500).json({ success: false, message: "Server error during authentication" });
    }
  });

  // Middleware to protect admin routes
  const requireAdmin = (req: any, res: any, next: any) => {
    const isAuth = (req.session as any)?.adminAuthenticated === true;
    const loginTime = (req.session as any)?.adminLoginTime;
    const isExpired = loginTime && (Date.now() - loginTime > 24 * 60 * 60 * 1000);
    
    if (isAuth && !isExpired) {
      next();
    } else {
      // Clear expired session
      if (isExpired) {
        delete (req.session as any).adminAuthenticated;
        delete (req.session as any).adminLoginTime;
      }
      res.status(401).json({ message: "Admin access required" });
    }
  };

  // FEATURE FLAGS API - PUBLIC ENDPOINT
  // Get current feature flag configuration (for frontend)
  app.get("/api/feature-flags", (req, res) => {
    try {
      res.json({
        templates: {
          showTemplateSection: featureFlags.templates.showTemplateSection,
          enableTemplateApi: featureFlags.templates.enableTemplateApi,
          enableTemplateSeeding: featureFlags.templates.enableTemplateSeeding,
        }
      });
    } catch (error) {
      console.error("Error serving feature flags:", error);
      res.status(500).json({ message: "Failed to fetch feature flags" });
    }
  });

  // TEMPLATE API ROUTES - FEATURE FLAG CONTROLLED
  // Get all cake templates
  app.get("/api/templates", async (req, res) => {
    if (!isTemplateApiEnabled()) {
      return res.status(404).json({ message: "Template API is currently disabled" });
    }
    
    try {
      const templates = await storage.getCakeTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });

  // Get templates by category
  app.get("/api/templates/:category", async (req, res) => {
    if (!isTemplateApiEnabled()) {
      return res.status(404).json({ message: "Template API is currently disabled" });
    }
    
    try {
      const { category } = req.params;
      const templates = await storage.getCakeTemplatesByCategory(category);
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });

  // Get all cake orders with proper token validation
  app.get("/api/orders", async (req, res) => {
    try {
      // Check for valid session token in headers or query
      const authHeader = req.headers.authorization;
      const sessionToken = authHeader?.replace('Bearer ', '') || req.headers['x-admin-session'];
      
      if (!sessionToken) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      // Validate session token
      const session = activeSessions.get(sessionToken as string);
      if (!session) {
        return res.status(401).json({ message: "Invalid or expired session" });
      }
      
      // Check if session is expired
      if (Date.now() - session.timestamp > 24 * 60 * 60 * 1000) {
        activeSessions.delete(sessionToken as string);
        return res.status(401).json({ message: "Session expired" });
      }
      
      console.log("✅ Valid session found for user:", session.username);
      const orders = await storage.getAllCakeOrders();
      console.log("Orders found:", orders.length, orders);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  // Create a new cake order
  app.post("/api/orders", async (req, res) => {
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

  // Get a specific cake order
  app.get("/api/orders/:id", async (req, res) => {
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

  // Update order status
  app.patch("/api/orders/:id/status", async (req, res) => {
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

  // Calculate pricing endpoint - now reads from pricing-structure.json dynamically
  app.post("/api/calculate-price", async (req, res) => {
    try {
      const { layers = 1, decorations = [], icingType = "butter", dietaryRestrictions = [], flavors = [], shape = "round", template, sixInchCakes = 0, eightInchCakes = 0 } = req.body;

      // Special pricing for Father's Day template
      if (template === "fathers-day" || template === "999" || template === 999) {
        // Get fresh pricing structure for Father's Day template
        const pricingStructure = getPricingStructure();
        const basePrice = pricingStructure.basePrices["6inch"]; // Base 6-inch price
        const templatePrice = pricingStructure.templatePrices["fathers-day"] || 0; // Template markup
        const fathersDayTotalPrice = basePrice + templatePrice; // Base + template pricing
        
        return res.json({
          basePrice: basePrice,
          templatePrice: templatePrice,
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
            base: basePrice,
            template: templatePrice,
            layers: 0,
            flavors: 0,
            shape: 0,
            decorations: 0,
            icing: 0,
            dietary: 0,
            photo: 0,
          }
        });
      }

      // Get fresh pricing structure for this request
      const pricingStructure = getPricingStructure();

      // Convert to numbers and ensure valid quantities
      const sixInch = Math.max(0, parseInt(String(sixInchCakes)) || 0);
      const eightInch = Math.max(0, parseInt(String(eightInchCakes)) || 0);
      const totalCakes = sixInch + eightInch;
      if (totalCakes === 0) {
        return res.status(400).json({ message: "Must select at least one cake" });
      }

      // Base pricing
      const basePrice = (sixInch * pricingStructure.basePrices["6inch"]) + (eightInch * pricingStructure.basePrices["8inch"]);

      // Layer pricing (additional layers for each cake)
      const layerPrice = Math.max(0, layers - 1) * pricingStructure.layerPrice * totalCakes;

      // Flavor pricing
      let flavorPrice = 0;
      if (Array.isArray(flavors)) {
        flavors.forEach((flavor) => {
          const key = String(flavor).replace(/\s+/g, '-').toLowerCase();
          flavorPrice += pricingStructure.flavorPrices[key] || 0;
        });
      }
      flavorPrice *= totalCakes;

      // Shape pricing
      let shapePrice = pricingStructure.shapePrices[shape] || 0;
      shapePrice *= totalCakes;

      // Decoration pricing
      let decorationTotal = 0;
      if (Array.isArray(decorations)) {
        decorations.forEach((decoration) => {
          const key = String(decoration).replace(/\s+/g, '-').toLowerCase();
          decorationTotal += pricingStructure.decorationPrices[key] || 0;
        });
      }
      decorationTotal *= totalCakes;

      // Icing type pricing
      const icingKey = String(icingType).replace(/\s+/g, '-').toLowerCase();
      const icingPrice = (pricingStructure.icingTypes[icingKey] || 0) * totalCakes;

      // Dietary restrictions upcharge
      let dietaryUpcharge = 0;
      if (Array.isArray(dietaryRestrictions)) {
        dietaryRestrictions.forEach((restriction) => {
          const key = String(restriction).replace(/\s+/g, '-').toLowerCase();
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
          photo: photoPrice,
        }
      });
    } catch (error) {
      console.error("Pricing calculation error:", error);
      res.status(500).json({ message: "Failed to calculate price" });
    }
  });

  // Serve pricing structure for frontend
  app.get("/api/pricing-structure", (req, res) => {
    try {
      res.json(getPricingStructure());
    } catch (err) {
      console.error("Error serving pricing structure:", err);
      res.status(500).json({ error: "Could not load pricing structure" });
    }
  });

  // Delete a specific order (admin only)
  app.delete("/api/orders/:id", async (req, res) => {
    try {
      // Check authentication
      const authHeader = req.headers.authorization;
      const sessionToken = authHeader?.replace('Bearer ', '') || req.headers['x-admin-session'];
      
      if (!sessionToken) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const session = activeSessions.get(sessionToken as string);
      if (!session) {
        return res.status(401).json({ message: "Invalid or expired session" });
      }
      
      // Check if session is expired
      if (Date.now() - session.timestamp > 24 * 60 * 60 * 1000) {
        activeSessions.delete(sessionToken as string);
        return res.status(401).json({ message: "Session expired" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid order ID" });
      }
      
      console.log(`🗑️ Admin ${session.username} deleting order #${id}`);
      const deleted = await storage.deleteCakeOrder(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      console.log(`✅ Successfully deleted order #${id}`);
      res.json({ message: "Order deleted successfully", orderId: id });
    } catch (error) {
      console.error("Error deleting order:", error);
      res.status(500).json({ message: "Failed to delete order" });
    }
  });

  // Delete ALL orders (admin only)
  app.delete("/api/orders", async (req, res) => {
    try {
      // Check authentication
      const authHeader = req.headers.authorization;
      const sessionToken = authHeader?.replace('Bearer ', '') || req.headers['x-admin-session'];
      
      if (!sessionToken) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const session = activeSessions.get(sessionToken as string);
      if (!session) {
        return res.status(401).json({ message: "Invalid or expired session" });
      }
      
      console.log("🗑️ Admin deleting all orders - user:", session.username);
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

  const httpServer = createServer(app);
  return httpServer;
}
