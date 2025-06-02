import { users, cakeOrders, cakeTemplates, orderItems, type User, type InsertUser, type CakeOrder, type InsertCakeOrder, type CakeTemplate, type InsertCakeTemplate, type OrderItem, type InsertOrderItem } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getCakeOrder(id: number): Promise<CakeOrder | undefined>;
  getAllCakeOrders(): Promise<(CakeOrder & { orderItems?: OrderItem[] })[]>;
  createCakeOrder(order: InsertCakeOrder): Promise<CakeOrder>;
  updateCakeOrderStatus(id: number, status: string): Promise<CakeOrder | undefined>;
  
  deleteCakeOrder(id: number): Promise<boolean>;
  deleteAllCakeOrders(): Promise<number>;
  
  getOrderItemsByOrderId(orderId: number): Promise<OrderItem[]>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  
  getCakeTemplates(): Promise<CakeTemplate[]>;
  getCakeTemplatesByCategory(category: string): Promise<CakeTemplate[]>;
  createCakeTemplate(template: InsertCakeTemplate): Promise<CakeTemplate>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private cakeOrders: Map<number, CakeOrder>;
  private cakeTemplates: Map<number, CakeTemplate>;
  private currentUserId: number;
  private currentOrderId: number;
  private currentTemplateId: number;

  constructor() {
    this.users = new Map();
    this.cakeOrders = new Map();
    this.cakeTemplates = new Map();
    this.currentUserId = 1;
    this.currentOrderId = 1;
    this.currentTemplateId = 1;
    
    // Initialize with some default templates
    this.initializeTemplates();
  }

  private initializeTemplates() {
    const templates: InsertCakeTemplate[] = [
      {
        name: "Classic Birthday Cake",
        category: "birthday", 
        layers: 1,
        shape: "round",
        flavors: ["chocolate"],
        icingColor: "#FFB6C1",
        icingType: "buttercream",
        decorations: ["sprinkles", "happy-birthday"],
        basePrice: 4500,
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
        basePrice: 6000,
      },
      {
        name: "Professional Corporate Cake",
        category: "corporate",
        layers: 3,
        shape: "square",
        flavors: ["butter", "butter", "butter"],
        icingColor: "#F5DEB3", 
        icingType: "fondant",
        decorations: ["gold"],
        basePrice: 9500,
      },
      {
        name: "Father's Day Special",
        category: "fathers-day",
        layers: 1,
        shape: "round",
        flavors: ["butter"],
        icingColor: "#87CEEB",
        icingType: "butter",
        decorations: [],
        basePrice: 4500,
      },
    ];

    templates.forEach(template => {
      this.createCakeTemplate(template);
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getCakeOrder(id: number): Promise<CakeOrder | undefined> {
    return this.cakeOrders.get(id);
  }

  async getAllCakeOrders(): Promise<(CakeOrder & { orderItems?: OrderItem[] })[]> {
    return Array.from(this.cakeOrders.values());
  }

  async createCakeOrder(insertOrder: InsertCakeOrder): Promise<CakeOrder> {
    const {
      message = null,
      specialInstructions = null,
      ...rest
    } = insertOrder;
    console.log("Database insert order data:", insertOrder);
    try {
      const orderData: Omit<CakeOrder, 'id'> = {
        ...rest,
        message,
        specialInstructions,
        customerPhone: insertOrder.customerPhone ?? null,
        layers: insertOrder.layers || 1,
        shape: insertOrder.shape || "round",
        flavors: insertOrder.flavors || [],
        icingColor: insertOrder.icingColor || "#87CEEB",
        icingType: insertOrder.icingType || "butter",
        decorations: insertOrder.decorations || [],
        messageFont: insertOrder.messageFont || "classic",
        dietaryRestrictions: insertOrder.dietaryRestrictions || [],
        servings: insertOrder.servings || 12,
        sixInchCakes: insertOrder.sixInchCakes || 0,
        eightInchCakes: insertOrder.eightInchCakes || 0,
        deliveryMethod: insertOrder.deliveryMethod || "pickup",
        totalPrice: insertOrder.totalPrice,
        orderDate: new Date().toISOString(),
        status: "pending",
      };
      
      console.log("Processed order data:", orderData);
      
      const [order] = await db
        .insert(cakeOrders)
        .values(orderData)
        .returning();
      
      console.log("Database created order:", order);
      return order;
    } catch (error) {
      console.error("Database insertion error:", error);
      throw error;
    }
  }

  async updateCakeOrderStatus(id: number, status: string): Promise<CakeOrder | undefined> {
    const order = this.cakeOrders.get(id);
    if (order) {
      const updatedOrder = { ...order, status };
      this.cakeOrders.set(id, updatedOrder);
      return updatedOrder;
    }
    return undefined;
  }

  async deleteCakeOrder(id: number): Promise<boolean> {
    return this.cakeOrders.delete(id);
  }

  async deleteAllCakeOrders(): Promise<number> {
    const count = this.cakeOrders.size;
    this.cakeOrders.clear();
    return count;
  }

  async getOrderItemsByOrderId(orderId: number): Promise<OrderItem[]> {
    // In memory storage doesn't support order items yet
    return [];
  }

  async createOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
    // In memory storage doesn't support order items yet
    throw new Error('Order items not supported in memory storage');
  }

  async getCakeTemplates(): Promise<CakeTemplate[]> {
    return Array.from(this.cakeTemplates.values());
  }

  async getCakeTemplatesByCategory(category: string): Promise<CakeTemplate[]> {
    return Array.from(this.cakeTemplates.values()).filter(
      template => template.category === category
    );
  }

  async createCakeTemplate(insertTemplate: InsertCakeTemplate): Promise<CakeTemplate> {
    const id = this.currentTemplateId++;
    const template: CakeTemplate = { ...insertTemplate, id };
    this.cakeTemplates.set(id, template);
    return template;
  }
}

// Use database storage for persistence
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getCakeOrder(id: number): Promise<CakeOrder | undefined> {
    const [order] = await db.select().from(cakeOrders).where(eq(cakeOrders.id, id));
    return order || undefined;
  }

  async getAllCakeOrders(): Promise<(CakeOrder & { orderItems?: OrderItem[] })[]> {
    console.log("📋 DatabaseStorage: getAllCakeOrders called");
    
    // Retry logic for connection issues
    let retries = 3;
    let lastError: any;
    
    while (retries > 0) {
      try {
        const orders = await db.select().from(cakeOrders).orderBy(desc(cakeOrders.id));
        console.log(`📋 Found ${orders.length} orders`);
      
      // For orders with line items, fetch the associated order items
      const ordersWithItems = await Promise.all(
        orders.map(async (order) => {
          try {
            if (order.hasLineItems) {
              console.log(`📦 Fetching line items for order #${order.id}`);
              const items = await this.getOrderItemsByOrderId(order.id);
              console.log(`📦 Found ${items.length} items for order #${order.id}:`, items.map(i => i.itemName));
              return { ...order, orderItems: items };
            }
            console.log(`📦 Order #${order.id} is single-item (no line items)`);
            return order;
          } catch (error) {
            console.error(`❌ Error fetching items for order ${order.id}:`, error);
            return order; // Return order without items if there's an error
          }
        })
      );
      
      console.log(`📋 Returning ${ordersWithItems.length} orders with line items processed`);
      return ordersWithItems;
      
      } catch (error: any) {
        lastError = error;
        retries--;
        
        if (error.message?.includes('Connection terminated') || error.code === 'ECONNRESET') {
          console.warn(`⚠️ Connection issue in getAllCakeOrders, retries left: ${retries}`);
          if (retries > 0) {
            // Wait before retrying (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, (3 - retries) * 1000));
            continue;
          }
        }
        
        console.error('❌ Error in getAllCakeOrders:', error);
        throw error;
      }
    }
    
    // If we've exhausted all retries
    console.error('❌ Failed to get orders after all retries:', lastError);
    throw lastError;
  }

  async createCakeOrder(insertOrder: InsertCakeOrder): Promise<CakeOrder> {
    const {
      message = null,
      specialInstructions = null,
      ...rest
    } = insertOrder;
    console.log("Database insert order data:", insertOrder);
    try {
      const orderData: Omit<CakeOrder, 'id'> = {
        ...rest,
        message,
        specialInstructions,
        customerPhone: insertOrder.customerPhone ?? null,
        layers: insertOrder.layers || 1,
        shape: insertOrder.shape || "round",
        flavors: insertOrder.flavors || [],
        icingColor: insertOrder.icingColor || "#87CEEB",
        icingType: insertOrder.icingType || "butter",
        decorations: insertOrder.decorations || [],
        messageFont: insertOrder.messageFont || "classic",
        dietaryRestrictions: insertOrder.dietaryRestrictions || [],
        servings: insertOrder.servings || 12,
        sixInchCakes: insertOrder.sixInchCakes || 0,
        eightInchCakes: insertOrder.eightInchCakes || 0,
        deliveryMethod: insertOrder.deliveryMethod || "pickup",
        totalPrice: insertOrder.totalPrice,
        orderDate: new Date().toISOString(),
        status: "pending",
      };
      
      console.log("Processed order data:", orderData);
      
      const [order] = await db
        .insert(cakeOrders)
        .values(orderData)
        .returning();
      
      console.log("Database created order:", order);
      return order;
    } catch (error) {
      console.error("Database insertion error:", error);
      throw error;
    }
  }

  async updateCakeOrderStatus(id: number, status: string): Promise<CakeOrder | undefined> {
    const [order] = await db
      .update(cakeOrders)
      .set({ status })
      .where(eq(cakeOrders.id, id))
      .returning();
    return order || undefined;
  }

  async deleteCakeOrder(id: number): Promise<boolean> {
    const result = await db.delete(cakeOrders).where(eq(cakeOrders.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async deleteAllCakeOrders(): Promise<number> {
    const ordersBefore = await db.select().from(cakeOrders);
    const count = ordersBefore.length;
    
    if (count > 0) {
      await db.delete(cakeOrders);
    }
    
    return count;
  }

  async getCakeTemplates(): Promise<CakeTemplate[]> {
    return await db.select().from(cakeTemplates);
  }

  async getCakeTemplatesByCategory(category: string): Promise<CakeTemplate[]> {
    return await db.select().from(cakeTemplates).where(eq(cakeTemplates.category, category));
  }

  async createCakeTemplate(insertTemplate: InsertCakeTemplate): Promise<CakeTemplate> {
    const [template] = await db
      .insert(cakeTemplates)
      .values(insertTemplate)
      .returning();
    return template;
  }

  async getOrderItemsByOrderId(orderId: number): Promise<OrderItem[]> {
    return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }

  async createOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
    const orderItemData = {
      ...insertOrderItem,
      createdAt: new Date().toISOString(),
    };
    
    const [orderItem] = await db
      .insert(orderItems)
      .values(orderItemData)
      .returning();
    return orderItem;
  }
}

export const storage = new DatabaseStorage();
