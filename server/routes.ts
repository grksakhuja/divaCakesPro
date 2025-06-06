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
import { sendOrderEmails, sendContactEmail } from './email-service';

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
      
      // Send email notifications
      await sendOrderEmails(order);
      
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

  // Create order from cart checkout (new unified endpoint)
  app.post("/api/checkout", async (req, res) => {
    try {
      console.log("Processing checkout with data:", req.body);
      const { customer, items, totalPrice } = req.body;
      
      if (!items || items.length === 0) {
        return res.status(400).json({ message: "No items in order" });
      }
      
      // Check if this is a single custom cake (use legacy format)
      if (items.length === 1 && items[0].type === 'custom' && items[0].cakeConfig) {
        const item = items[0];
        const cakeConfig = item.cakeConfig;
        
        const orderData = {
          customerName: customer.customerName,
          customerEmail: customer.customerEmail,
          customerPhone: customer.customerPhone,
          deliveryMethod: customer.deliveryMethod,
          specialInstructions: customer.specialInstructions, // Keep user's actual special instructions
          layers: cakeConfig.layers,
          shape: cakeConfig.shape,
          flavors: cakeConfig.flavors,
          icingColor: cakeConfig.icingColor,
          icingType: cakeConfig.icingType,
          decorations: cakeConfig.decorations,
          message: cakeConfig.message || "",
          messageFont: cakeConfig.messageFont || "classic",
          dietaryRestrictions: cakeConfig.dietaryRestrictions,
          servings: cakeConfig.servings,
          sixInchCakes: cakeConfig.sixInchCakes,
          eightInchCakes: cakeConfig.eightInchCakes,
          totalPrice: totalPrice,
          hasLineItems: false, // Single custom cake uses legacy format
        };
        
        console.log("Creating single custom cake order:", orderData);
        const validatedData = insertCakeOrderSchema.parse(orderData);
        const order = await storage.createCakeOrder(validatedData);
        
        // Send email notifications
        await sendOrderEmails(order);
        
        res.status(201).json(order);
      } else {
        // Multi-item order - use new order_items table
        console.log("Creating multi-item order with proper line items");
        
        // Create main order record
        const orderData = {
          customerName: customer.customerName,
          customerEmail: customer.customerEmail,
          customerPhone: customer.customerPhone,
          deliveryMethod: customer.deliveryMethod,
          specialInstructions: customer.specialInstructions, // Keep user's actual special instructions
          // Use placeholder values for legacy fields (required by schema)
          layers: 1,
          shape: "multi-item",
          flavors: ["various"],
          icingColor: "#FFB6C1",
          icingType: "various",
          decorations: [],
          message: "",
          messageFont: "classic",
          dietaryRestrictions: [],
          servings: items.reduce((sum, item) => sum + (item.quantity || 1), 0),
          sixInchCakes: 0,
          eightInchCakes: 0,
          totalPrice: totalPrice,
          hasLineItems: true, // This order uses the order_items table
        };
        
        console.log("Creating main order record:", orderData);
        const validatedOrderData = insertCakeOrderSchema.parse(orderData);
        const order = await storage.createCakeOrder(validatedOrderData);
        
        // Create individual order items
        for (const item of items) {
          const orderItemData = {
            orderId: order.id,
            itemType: item.type,
            itemName: item.name,
            quantity: item.quantity || 1,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            
            // Custom cake fields (only for custom cakes)
            ...(item.type === 'custom' && item.cakeConfig && {
              layers: item.cakeConfig.layers,
              shape: item.cakeConfig.shape,
              flavors: item.cakeConfig.flavors,
              icingColor: item.cakeConfig.icingColor,
              icingType: item.cakeConfig.icingType,
              decorations: item.cakeConfig.decorations,
              message: item.cakeConfig.message,
              messageFont: item.cakeConfig.messageFont,
              dietaryRestrictions: item.cakeConfig.dietaryRestrictions,
              servings: item.cakeConfig.servings,
              sixInchCakes: item.cakeConfig.sixInchCakes,
              eightInchCakes: item.cakeConfig.eightInchCakes,
            }),
            
            // Specialty item fields (only for specialty items)
            ...(item.type !== 'custom' && {
              specialtyId: item.specialtyId || item.name.toLowerCase().replace(/\s+/g, '-'),
              specialtyDescription: item.description,
            }),
            
            createdAt: new Date().toISOString(),
          };
          
          console.log("Creating order item:", orderItemData);
          await storage.createOrderItem(orderItemData);
        }
        
        // Send email notifications
        await sendOrderEmails(order);
        
        // Fetch the complete order with its items for the response
        const orderItems = await storage.getOrderItemsByOrderId(order.id);
        const completeOrder = { ...order, orderItems };
        
        res.status(201).json(completeOrder);
      }
      
    } catch (error) {
      console.error("Error processing checkout:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid checkout data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to process checkout" });
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

      // Special pricing for Father's Day template - Base price + template price
      if (template === "fathers-day" || template === "999" || template === 999) {
        // Get fresh pricing structure for Father's Day template
        const pricingStructure = getPricingStructure();
        
        // Convert to numbers and ensure valid quantities for Father's Day
        const sixInch = Math.max(0, parseInt(String(sixInchCakes)) || 0);
        const eightInch = Math.max(0, parseInt(String(eightInchCakes)) || 0);
        const totalCakes = sixInch + eightInch;
        
        // Require at least one cake to be selected
        if (totalCakes === 0) {
          return res.status(400).json({ message: "Must select at least one cake for Father's Day special" });
        }
        
        // Calculate base price for all cakes (using standard pricing)
        const basePrice = (sixInch * pricingStructure.basePrices["6inch"]) + (eightInch * pricingStructure.basePrices["8inch"]);
        
        // Father's Day template price (from pricing structure)
        const templatePrice = (pricingStructure.templatePrices["fathers-day"] || 1000) * totalCakes;
        
        // Total price is base + template price
        const totalPrice = basePrice + templatePrice;
        
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
          cakeQuantity: totalCakes,
          totalPrice: totalPrice,
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

  // Serve dynamic cakes structured by subsections
  app.get("/api/cakes", (req, res) => {
    try {
      const pricingStructure = getPricingStructure();
      const cakes = pricingStructure.cakes || {};
      
      // Transform the nested structure for easier frontend consumption
      const transformedItems = {};
      
      Object.keys(cakes).forEach(subsectionKey => {
        const subsection = cakes[subsectionKey];
        
        // Convert subsection items to array format with metadata
        const items = Object.keys(subsection).map(itemKey => ({
          id: itemKey,
          ...subsection[itemKey]
        }));
        
        transformedItems[subsectionKey] = {
          sectionName: subsectionKey.split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' '),
          items: items
        };
      });
      
      res.json(transformedItems);
    } catch (err) {
      console.error("Error serving cakes:", err);
      res.status(500).json({ error: "Could not load cakes" });
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

  // Contact form endpoint
  app.post("/api/contact", express.json(), async (req, res) => {
    console.log("🔥 Contact form API endpoint hit!");
    console.log("📨 Request body:", req.body);
    
    try {
      const contactSchema = z.object({
        name: z.string().min(1, "Name is required"),
        email: z.string().email("Valid email is required"),
        phone: z.string().optional(),
        subject: z.string().min(1, "Subject is required"),
        message: z.string().min(1, "Message is required")
      });

      console.log("🔍 Validating contact form data...");
      const { name, email, phone, subject, message } = contactSchema.parse(req.body);
      console.log("✅ Contact form data validated successfully");
      console.log("📧 About to send contact email with data:", { name, email, phone, subject });

      // Send contact email to admin
      console.log("📤 Calling sendContactEmail function...");
      await sendContactEmail({
        name,
        email,
        phone,
        subject,
        message,
        timestamp: new Date().toISOString()
      });
      console.log("✅ sendContactEmail function completed successfully");

      console.log("📝 Sending success response to frontend");
      res.json({ 
        success: true,
        message: "Your message has been sent successfully. We'll get back to you soon!" 
      });
    } catch (error) {
      console.error("❌ Error in contact form endpoint:", error);
      if (error instanceof z.ZodError) {
        console.error("❌ Zod validation error:", error.errors);
        return res.status(400).json({ 
          message: "Invalid form data", 
          errors: error.errors 
        });
      }
      console.error("❌ General error in contact endpoint:", error.message);
      res.status(500).json({ 
        message: "Failed to send message. Please try again later." 
      });
    }
  });

  // Get current pricing structure (admin only)
  app.get("/api/admin/pricing", async (req, res) => {
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
      
      // Check if session is expired (24 hours)
      if (Date.now() - session.timestamp > 24 * 60 * 60 * 1000) {
        activeSessions.delete(sessionToken as string);
        return res.status(401).json({ message: "Session expired" });
      }
      
      console.log("Admin fetching pricing structure - user:", session.username);
      
      // Get current pricing structure
      const pricingStructure = getPricingStructure();
      res.json(pricingStructure);
    } catch (error) {
      console.error("Error fetching pricing structure:", error);
      res.status(500).json({ message: "Failed to fetch pricing structure" });
    }
  });

  // Update pricing structure (admin only)
  app.put("/api/admin/pricing", express.json(), async (req, res) => {
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
      
      // Check if session is expired (24 hours)
      if (Date.now() - session.timestamp > 24 * 60 * 60 * 1000) {
        activeSessions.delete(sessionToken as string);
        return res.status(401).json({ message: "Session expired" });
      }
      
      console.log("Admin updating pricing structure - user:", session.username);
      
      // Validate the pricing structure
      const newPricing = req.body;
      if (!newPricing || typeof newPricing !== 'object') {
        return res.status(400).json({ message: "Invalid pricing structure" });
      }
      
      // Validate required fields exist
      const requiredFields = ['basePrices', 'layerPrice', 'flavorPrices', 'icingTypes', 
                            'decorationPrices', 'dietaryPrices', 'shapePrices'];
      for (const field of requiredFields) {
        if (!newPricing[field]) {
          return res.status(400).json({ message: `Missing required field: ${field}` });
        }
      }
      
      // Validate all prices are positive numbers
      const validatePrices = (obj: any, path: string = ''): string | null => {
        for (const [key, value] of Object.entries(obj)) {
          const currentPath = path ? `${path}.${key}` : key;
          if (typeof value === 'object' && value !== null) {
            const error = validatePrices(value, currentPath);
            if (error) return error;
          } else if (key !== 'name' && key !== 'description' && key !== 'image' && key !== 'category') {
            // Skip non-price fields
            if (typeof value !== 'number' || value < 0) {
              return `Invalid price at ${currentPath}: must be a non-negative number`;
            }
          }
        }
        return null;
      };
      
      const validationError = validatePrices(newPricing);
      if (validationError) {
        return res.status(400).json({ message: validationError });
      }
      
      // Create backup of current pricing
      const pricingPath = path.join(__dirname, 'server', 'pricing-structure.json');
      const backupPath = path.join(__dirname, 'server', `pricing-backup-${Date.now()}.json`);
      
      try {
        // Read current pricing for backup
        const currentPricing = fs.readFileSync(pricingPath, 'utf-8');
        fs.writeFileSync(backupPath, currentPricing);
        console.log(`Created backup at: ${backupPath}`);
        
        // Write new pricing structure
        fs.writeFileSync(pricingPath, JSON.stringify(newPricing, null, 2));
        console.log("✅ Pricing structure updated successfully");
        
        // Log the update for audit trail
        console.log(`Pricing updated by ${session.username} at ${new Date().toISOString()}`);
        
        res.json({ 
          message: "Pricing structure updated successfully",
          backup: backupPath
        });
      } catch (writeError) {
        console.error("Error writing pricing structure:", writeError);
        // Try to restore from backup if write failed
        if (fs.existsSync(backupPath)) {
          try {
            const backup = fs.readFileSync(backupPath, 'utf-8');
            fs.writeFileSync(pricingPath, backup);
            console.log("Restored from backup after write failure");
          } catch (restoreError) {
            console.error("Failed to restore from backup:", restoreError);
          }
        }
        throw writeError;
      }
    } catch (error) {
      console.error("Error updating pricing structure:", error);
      res.status(500).json({ message: "Failed to update pricing structure" });
    }
  });

  // Get pricing history/backups (admin only)
  app.get("/api/admin/pricing/backups", async (req, res) => {
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
      
      // List all backup files
      const serverDir = path.join(__dirname, 'server');
      const files = fs.readdirSync(serverDir);
      const backups = files
        .filter(f => f.startsWith('pricing-backup-') && f.endsWith('.json'))
        .map(f => {
          const stats = fs.statSync(path.join(serverDir, f));
          const timestamp = f.match(/pricing-backup-(\d+)\.json/)?.[1];
          return {
            filename: f,
            timestamp: timestamp ? parseInt(timestamp) : 0,
            date: stats.mtime,
            size: stats.size
          };
        })
        .sort((a, b) => b.timestamp - a.timestamp);
      
      res.json(backups);
    } catch (error) {
      console.error("Error fetching pricing backups:", error);
      res.status(500).json({ message: "Failed to fetch pricing backups" });
    }
  });

  // GALLERY ADMIN APIs - Instagram Integration
  
  // Import Instagram service
  const { instagramService } = await import('./instagram-service');
  
  // Get all gallery images (admin only)
  app.get("/api/admin/gallery", async (req, res) => {
    try {
      // Check authentication
      const authHeader = req.headers.authorization;
      const sessionToken = authHeader?.replace('Bearer ', '') || req.headers['x-admin-session'];
      
      if (!sessionToken || !activeSessions.has(sessionToken as string)) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const images = await storage.getGalleryImages(false); // Get all, including inactive
      res.json(images);
    } catch (error) {
      console.error("Error fetching gallery images:", error);
      res.status(500).json({ message: "Failed to fetch gallery images" });
    }
  });
  
  // Add Instagram post (admin only)
  app.post("/api/admin/gallery/add", express.json(), async (req, res) => {
    try {
      // Check authentication
      const authHeader = req.headers.authorization;
      const sessionToken = authHeader?.replace('Bearer ', '') || req.headers['x-admin-session'];
      
      if (!sessionToken || !activeSessions.has(sessionToken as string)) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const { instagramUrl, title, description, category, tags } = req.body;
      
      if (!instagramUrl || !title) {
        return res.status(400).json({ message: "Instagram URL and title are required" });
      }
      
      // Fetch Instagram embed data
      const embedData = await instagramService.fetchInstagramEmbed(instagramUrl);
      
      // Create gallery image record
      const image = await storage.createGalleryImage({
        instagramUrl: instagramService.normalizeInstagramUrl(instagramUrl),
        embedHtml: embedData.html,
        thumbnailUrl: embedData.thumbnail_url || '',
        caption: embedData.title || '',
        title,
        description: description || '',
        category: category || 'general',
        tags: tags || [],
        sortOrder: 0,
        isActive: true,
        uploadedBy: 'admin',
        fetchedAt: new Date().toISOString(),
      });
      
      res.json(image);
    } catch (error: any) {
      console.error("Error adding Instagram post:", error);
      res.status(500).json({ message: error.message || "Failed to add Instagram post" });
    }
  });
  
  // Update gallery image (admin only)
  app.put("/api/admin/gallery/:id", express.json(), async (req, res) => {
    try {
      // Check authentication
      const authHeader = req.headers.authorization;
      const sessionToken = authHeader?.replace('Bearer ', '') || req.headers['x-admin-session'];
      
      if (!sessionToken || !activeSessions.has(sessionToken as string)) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      // Don't allow changing the Instagram URL
      delete updates.instagramUrl;
      delete updates.id;
      
      const image = await storage.updateGalleryImage(id, updates);
      if (!image) {
        return res.status(404).json({ message: "Gallery image not found" });
      }
      
      res.json(image);
    } catch (error) {
      console.error("Error updating gallery image:", error);
      res.status(500).json({ message: "Failed to update gallery image" });
    }
  });
  
  // Delete gallery image (admin only)
  app.delete("/api/admin/gallery/:id", async (req, res) => {
    try {
      // Check authentication
      const authHeader = req.headers.authorization;
      const sessionToken = authHeader?.replace('Bearer ', '') || req.headers['x-admin-session'];
      
      if (!sessionToken || !activeSessions.has(sessionToken as string)) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const id = parseInt(req.params.id);
      const success = await storage.deleteGalleryImage(id);
      
      if (!success) {
        return res.status(404).json({ message: "Gallery image not found" });
      }
      
      res.json({ message: "Gallery image deleted successfully" });
    } catch (error) {
      console.error("Error deleting gallery image:", error);
      res.status(500).json({ message: "Failed to delete gallery image" });
    }
  });
  
  // PUBLIC GALLERY API
  
  // Get active gallery images (public)
  app.get("/api/gallery", async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      
      let images;
      if (category) {
        images = await storage.getGalleryImagesByCategory(category);
      } else {
        images = await storage.getGalleryImages(true); // Active only
      }
      
      res.json(images);
    } catch (error) {
      console.error("Error fetching gallery images:", error);
      res.status(500).json({ message: "Failed to fetch gallery images" });
    }
  });

  // PAGE CONTENT ENDPOINTS
  
  // Get page content (public)
  app.get("/api/page-content/:pageName", async (req, res) => {
    try {
      const { pageName } = req.params;
      const content = await storage.getPageContent(pageName);
      
      if (!content) {
        return res.status(404).json({ message: "Page content not found" });
      }
      
      res.json(content);
    } catch (error) {
      console.error("Error fetching page content:", error);
      res.status(500).json({ message: "Failed to fetch page content" });
    }
  });
  
  // Get page content (admin - with auth details)
  app.get("/api/admin/page-content/:pageName", async (req, res) => {
    try {
      // Check admin authentication
      const token = req.headers.authorization?.replace('Bearer ', '') || req.headers['x-admin-session'] as string;
      
      if (!token || !activeSessions.has(token)) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const { pageName } = req.params;
      const content = await storage.getPageContent(pageName);
      
      // Return empty content structure if not found (for initial setup)
      if (!content) {
        return res.json({
          pageName,
          content: {},
          updatedBy: null,
          createdAt: null,
          updatedAt: null
        });
      }
      
      res.json(content);
    } catch (error) {
      console.error("Error fetching page content:", error);
      res.status(500).json({ message: "Failed to fetch page content" });
    }
  });
  
  // Update page content (admin only)
  app.put("/api/admin/page-content/:pageName", express.json(), async (req, res) => {
    try {
      // Check admin authentication
      const token = req.headers.authorization?.replace('Bearer ', '') || req.headers['x-admin-session'] as string;
      
      if (!token || !activeSessions.has(token)) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const { pageName } = req.params;
      const { content } = req.body;
      const session = activeSessions.get(token);
      
      if (!content || typeof content !== 'object') {
        return res.status(400).json({ message: "Invalid content format" });
      }
      
      // Check if page content exists
      const existing = await storage.getPageContent(pageName);
      
      let result;
      if (existing) {
        // Update existing content
        result = await storage.updatePageContent(pageName, {
          content,
          updatedBy: session?.username || 'admin'
        });
      } else {
        // Create new content
        result = await storage.createPageContent({
          pageName,
          content,
          updatedBy: session?.username || 'admin'
        });
      }
      
      res.json(result);
    } catch (error) {
      console.error("Error updating page content:", error);
      res.status(500).json({ message: "Failed to update page content" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
