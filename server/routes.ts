import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCakeOrderSchema } from "@shared/schema";
import { z } from "zod";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Secure server-side authentication with environment variables
  const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
  
  // Store active session tokens
  const activeSessions = new Map<string, { timestamp: number; username: string }>();
  
  // Clean expired sessions periodically
  setInterval(() => {
    const now = Date.now();
    for (const [token, session] of activeSessions.entries()) {
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

  // Get all cake templates
  app.get("/api/templates", async (req, res) => {
    try {
      const templates = await storage.getCakeTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });

  // Get templates by category
  app.get("/api/templates/:category", async (req, res) => {
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

  // Calculate pricing endpoint - now reads from pricing-structure.json
  app.post("/api/calculate-price", async (req, res) => {
    try {
      const pricingPath = path.join(__dirname, "./pricing-structure.json");
      const pricing = JSON.parse(fs.readFileSync(pricingPath, "utf-8"));
      const { layers = 1, decorations = [], icingType = "butter", dietaryRestrictions = [], flavors = [], shape = "round", template, sixInchCakes = 0, eightInchCakes = 0 } = req.body;

      // Special pricing for Father's Day template
      if (template === "fathers-day" || template === "999" || template === 999) {
        return res.json({
          basePrice: 8000,
          layerPrice: 0,
          flavorPrice: 0,
          shapePrice: 0,
          decorationTotal: 0,
          icingPrice: 0,
          dietaryUpcharge: 0,
          photoPrice: 0,
          cakeQuantity: 1,
          totalPrice: 8000,
          breakdown: {
            base: 8000,
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

      // Convert to numbers and ensure valid quantities
      const sixInch = Math.max(0, parseInt(String(sixInchCakes)) || 0);
      const eightInch = Math.max(0, parseInt(String(eightInchCakes)) || 0);
      const totalCakes = sixInch + eightInch;
      if (totalCakes === 0) {
        return res.status(400).json({ message: "Must select at least one cake" });
      }

      // Base pricing
      const basePrice = (sixInch * pricing.basePrices["6inch"]) + (eightInch * pricing.basePrices["8inch"]);

      // Layer pricing (additional layers for each cake)
      const layerPrice = Math.max(0, layers - 1) * pricing.layerPrice * totalCakes;

      // Flavor pricing
      let flavorPrice = 0;
      if (Array.isArray(flavors)) {
        flavors.forEach((flavor) => {
          const key = String(flavor).replace(/\s+/g, '-').toLowerCase();
          flavorPrice += pricing.flavorPrices[key] || 0;
        });
      }
      flavorPrice *= totalCakes;

      // Shape pricing
      let shapePrice = pricing.shapePrices[shape] || 0;
      shapePrice *= totalCakes;

      // Decoration pricing
      let decorationTotal = 0;
      if (Array.isArray(decorations)) {
        decorations.forEach((decoration) => {
          const key = String(decoration).replace(/\s+/g, '-').toLowerCase();
          decorationTotal += pricing.decorationPrices[key] || 0;
        });
      }
      decorationTotal *= totalCakes;

      // Icing type pricing
      const icingKey = String(icingType).replace(/\s+/g, '-').toLowerCase();
      const icingPrice = (pricing.icingTypes[icingKey] || 0) * totalCakes;

      // Dietary restrictions upcharge
      let dietaryUpcharge = 0;
      if (Array.isArray(dietaryRestrictions)) {
        dietaryRestrictions.forEach((restriction) => {
          const key = String(restriction).replace(/\s+/g, '-').toLowerCase();
          dietaryUpcharge += pricing.dietaryPrices[key] || 0;
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
    const pricingPath = path.join(__dirname, "./pricing-structure.json");
    try {
      const data = fs.readFileSync(pricingPath, "utf-8");
      res.json(JSON.parse(data));
    } catch (err) {
      res.status(500).json({ message: "Could not load pricing structure" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
