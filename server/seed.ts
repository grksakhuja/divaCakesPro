import { db } from "./db";
import { cakeTemplates, type InsertCakeTemplate } from "@shared/schema";

const templates = [
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

export async function seedTemplates() {
  console.log("🌱 Seeding templates function called...");
  
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
    const insertedTemplates = await db.insert(cakeTemplates).values(templates).returning();
    console.log(`🎯 Successfully inserted ${insertedTemplates.length} templates`);
    
    console.log("Template names:", insertedTemplates.map(t => t.name));
    
  } catch (error) {
    console.error("💥 Error in seedTemplates:", error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedTemplates()
    .then(() => {
      console.log("Seeding completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seeding failed:", error);
      process.exit(1);
    });
} 