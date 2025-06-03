-- Drop the existing gallery_images table
DROP TABLE IF EXISTS "gallery_images";

-- Create new gallery_images table for Instagram integration
CREATE TABLE "gallery_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"instagram_url" text NOT NULL,
	"embed_html" text,
	"thumbnail_url" text,
	"caption" text,
	"title" text NOT NULL,
	"description" text,
	"category" text DEFAULT 'general' NOT NULL,
	"tags" json DEFAULT '[]'::json NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"uploaded_by" text NOT NULL,
	"fetched_at" text,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	CONSTRAINT "gallery_images_instagram_url_unique" UNIQUE("instagram_url")
);