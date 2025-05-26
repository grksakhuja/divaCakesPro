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
  totalPrice: integer("total_price").notNull(), // in cents
  status: text("status").notNull().default("pending"),
  orderDate: text("order_date").notNull(),
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

export const insertCakeOrderSchema = createInsertSchema(cakeOrders).omit({
  id: true,
  orderDate: true,
  status: true,
});

export const insertCakeTemplateSchema = createInsertSchema(cakeTemplates).omit({
  id: true,
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertCakeOrder = z.infer<typeof insertCakeOrderSchema>;
export type CakeOrder = typeof cakeOrders.$inferSelect;
export type InsertCakeTemplate = z.infer<typeof insertCakeTemplateSchema>;
export type CakeTemplate = typeof cakeTemplates.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
