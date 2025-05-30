CREATE TABLE "cake_orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_name" text NOT NULL,
	"customer_email" text NOT NULL,
	"customer_phone" text,
	"layers" integer DEFAULT 1 NOT NULL,
	"shape" text DEFAULT 'round' NOT NULL,
	"flavors" json DEFAULT '[]'::json NOT NULL,
	"icing_color" text DEFAULT '#FFB6C1' NOT NULL,
	"icing_type" text DEFAULT 'buttercream' NOT NULL,
	"decorations" json DEFAULT '[]'::json NOT NULL,
	"message" text,
	"message_font" text DEFAULT 'classic',
	"dietary_restrictions" json DEFAULT '[]'::json NOT NULL,
	"servings" integer DEFAULT 12 NOT NULL,
	"six_inch_cakes" integer DEFAULT 0 NOT NULL,
	"eight_inch_cakes" integer DEFAULT 0 NOT NULL,
	"delivery_method" text DEFAULT 'pickup' NOT NULL,
	"special_instructions" text,
	"total_price" integer NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"order_date" text NOT NULL,
	"has_line_items" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "cake_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"layers" integer NOT NULL,
	"shape" text NOT NULL,
	"flavors" json NOT NULL,
	"icing_color" text NOT NULL,
	"icing_type" text NOT NULL,
	"decorations" json NOT NULL,
	"base_price" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"item_type" text NOT NULL,
	"item_name" text NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"unit_price" integer NOT NULL,
	"total_price" integer NOT NULL,
	"layers" integer,
	"shape" text,
	"flavors" json,
	"icing_color" text,
	"icing_type" text,
	"decorations" json,
	"message" text,
	"message_font" text,
	"dietary_restrictions" json,
	"servings" integer,
	"six_inch_cakes" integer,
	"eight_inch_cakes" integer,
	"specialty_id" text,
	"specialty_description" text,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_cake_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."cake_orders"("id") ON DELETE cascade ON UPDATE no action;