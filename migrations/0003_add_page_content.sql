-- Create page_content table for dynamic About and Contact page content
CREATE TABLE "page_content" (
	"id" serial PRIMARY KEY NOT NULL,
	"page_name" text NOT NULL,
	"content" json NOT NULL,
	"updated_by" text,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	CONSTRAINT "page_content_page_name_unique" UNIQUE("page_name")
);