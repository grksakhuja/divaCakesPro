import { users, cakeOrders, cakeTemplates, type User, type InsertUser, type CakeOrder, type InsertCakeOrder, type CakeTemplate, type InsertCakeTemplate } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getCakeOrder(id: number): Promise<CakeOrder | undefined>;
  getAllCakeOrders(): Promise<CakeOrder[]>;
  createCakeOrder(order: InsertCakeOrder): Promise<CakeOrder>;
  updateCakeOrderStatus(id: number, status: string): Promise<CakeOrder | undefined>;
  
  deleteCakeOrder(id: number): Promise<boolean>;
  deleteAllCakeOrders(): Promise<number>;
  
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

  async getAllCakeOrders(): Promise<CakeOrder[]> {
    return Array.from(this.cakeOrders.values());
  }

  async createCakeOrder(insertOrder: InsertCakeOrder): Promise<CakeOrder> {
    const id = this.currentOrderId++;
    const order: CakeOrder = {
      ...insertOrder,
      id,
      orderDate: new Date().toISOString(),
      status: "pending",
    };
    this.cakeOrders.set(id, order);
    return order;
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
import { eq } from "drizzle-orm";

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

  async getAllCakeOrders(): Promise<CakeOrder[]> {
    return await db.select().from(cakeOrders).orderBy(cakeOrders.id);
  }

  async createCakeOrder(insertOrder: InsertCakeOrder): Promise<CakeOrder> {
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
    return result.rowCount > 0;
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
}

export const storage = new DatabaseStorage();
