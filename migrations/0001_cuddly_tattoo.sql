CREATE TABLE "gallery_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"image_url" text NOT NULL,
	"alt_text" text,
	"title" text NOT NULL,
	"description" text,
	"category" text DEFAULT 'general' NOT NULL,
	"tags" json DEFAULT '[]'::json NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"uploaded_by" text NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
