import { pgTable, text, serial, integer, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const cakeOrders = pgTable("cake_orders", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone"),
  layers: integer("layers").notNull().default(1),
  shape: text("shape").notNull().default("round"),
  flavors: json("flavors").$type<string[]>().notNull().default([]),
  icingColor: text("icing_color").notNull().default("#FFB6C1"),
  icingType: text("icing_type").notNull().default("buttercream"),
  decorations: json("decorations").$type<string[]>().notNull().default([]),
  message: text("message"),
  messageFont: text("message_font").default("classic"),
  dietaryRestrictions: json("dietary_restrictions").$type<string[]>().notNull().default([]),
  servings: integer("servings").notNull().default(12),
  sixInchCakes: integer("six_inch_cakes").notNull().default(0),
  eightInchCakes: integer("eight_inch_cakes").notNull().default(0),
  deliveryMethod: text("delivery_method").notNull().default("pickup"),
  specialInstructions: text("special_instructions"),
  totalPrice: integer("total_price").notNull(), // in cents
  status: text("status").notNull().default("pending"),
  orderDate: text("order_date").notNull(),
  hasLineItems: boolean("has_line_items").default(false), // indicates if order uses orderItems table
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => cakeOrders.id, { onDelete: 'cascade' }),
  itemType: text("item_type").notNull(), // 'custom', 'specialty', 'slice', 'candy'
  itemName: text("item_name").notNull(),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: integer("unit_price").notNull(), // in cents
  totalPrice: integer("total_price").notNull(), // quantity * unitPrice
  
  // For custom cakes (null for specialty items)
  layers: integer("layers"),
  shape: text("shape"),
  flavors: json("flavors").$type<string[]>(),
  icingColor: text("icing_color"),
  icingType: text("icing_type"),
  decorations: json("decorations").$type<string[]>(),
  message: text("message"),
  messageFont: text("message_font"),
  dietaryRestrictions: json("dietary_restrictions").$type<string[]>(),
  servings: integer("servings"),
  sixInchCakes: integer("six_inch_cakes"),
  eightInchCakes: integer("eight_inch_cakes"),
  
  // For specialty items (null for custom cakes)
  specialtyId: text("specialty_id"),
  specialtyDescription: text("specialty_description"),
  
  createdAt: text("created_at").notNull(),
});

export const cakeTemplates = pgTable("cake_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  layers: integer("layers").notNull(),
  shape: text("shape").notNull(),
  flavors: json("flavors").$type<string[]>().notNull(),
  icingColor: text("icing_color").notNull(),
  icingType: text("icing_type").notNull(),
  decorations: json("decorations").$type<string[]>().notNull(),
  basePrice: integer("base_price").notNull(), // in cents
});

export const galleryImages = pgTable("gallery_images", {
  id: serial("id").primaryKey(),
  instagramUrl: text("instagram_url").notNull().unique(),
  embedHtml: text("embed_html"),
  thumbnailUrl: text("thumbnail_url"),
  caption: text("caption"),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull().default("general"), // general, wedding, birthday, specialty, custom
  tags: json("tags").$type<string[]>().notNull().default([]),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  uploadedBy: text("uploaded_by").notNull(),
  fetchedAt: text("fetched_at"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const pageContent = pgTable("page_content", {
  id: serial("id").primaryKey(),
  pageName: text("page_name").notNull().unique(),
  content: json("content").notNull(),
  updatedBy: text("updated_by"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const insertCakeOrderSchema = createInsertSchema(cakeOrders).omit({
  id: true,
  orderDate: true,
  status: true,
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
  createdAt: true,
});

export const insertCakeTemplateSchema = createInsertSchema(cakeTemplates).omit({
  id: true,
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertGalleryImageSchema = createInsertSchema(galleryImages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPageContentSchema = createInsertSchema(pageContent).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Schema for checkout API that accepts multiple items
export const checkoutOrderSchema = z.object({
  customer: z.object({
    customerName: z.string().min(1, "Name is required"),
    customerEmail: z.string().email("Valid email is required"),
    customerPhone: z.string().optional(),
    deliveryMethod: z.enum(["pickup", "delivery"]),
    specialInstructions: z.string().optional(),
    deliveryAddress: z.string().optional(),
  }),
  items: z.array(z.object({
    type: z.enum(["custom", "specialty", "slice", "candy"]),
    name: z.string(),
    quantity: z.number().int().positive(),
    unitPrice: z.number().int().positive(),
    totalPrice: z.number().int().positive(),
    description: z.string().optional(),
    
    // For custom cakes
    cakeConfig: z.object({
      layers: z.number().int().positive(),
      shape: z.string(),
      flavors: z.array(z.string()),
      icingColor: z.string(),
      icingType: z.string(),
      decorations: z.array(z.string()),
      message: z.string().optional(),
      messageFont: z.string().optional(),
      dietaryRestrictions: z.array(z.string()),
      servings: z.number().int().positive(),
      sixInchCakes: z.number().int().min(0),
      eightInchCakes: z.number().int().min(0),
    }).optional(),
    
    // For specialty items
    specialtyId: z.string().optional(),
    specialtyName: z.string().optional(),
    specialtyDescription: z.string().optional(),
  })).min(1, "At least one item is required"),
  totalPrice: z.number().int().positive(),
});

export type InsertCakeOrder = z.infer<typeof insertCakeOrderSchema>;
export type CakeOrder = typeof cakeOrders.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertCakeTemplate = z.infer<typeof insertCakeTemplateSchema>;
export type CakeTemplate = typeof cakeTemplates.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type CheckoutOrder = z.infer<typeof checkoutOrderSchema>;
export type InsertGalleryImage = z.infer<typeof insertGalleryImageSchema>;
export type GalleryImage = typeof galleryImages.$inferSelect;
export type InsertPageContent = z.infer<typeof insertPageContentSchema>;
export type PageContent = typeof pageContent.$inferSelect;
