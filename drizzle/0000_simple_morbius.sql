CREATE TABLE "ad_clicks" (
	"id" serial PRIMARY KEY NOT NULL,
	"advertisement_id" integer NOT NULL,
	"placement" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ad_impressions" (
	"id" serial PRIMARY KEY NOT NULL,
	"advertisement_id" integer NOT NULL,
	"placement" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "advertisements" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"image_url" text NOT NULL,
	"destination_url" text NOT NULL,
	"placement" text NOT NULL,
	"ad_type" text DEFAULT 'BANNER' NOT NULL,
	"adsense_slot" text,
	"adsense_format" text DEFAULT 'auto',
	"custom_html" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"priority" integer DEFAULT 1 NOT NULL,
	"start_date" timestamp,
	"end_date" timestamp,
	"impressions" integer DEFAULT 0 NOT NULL,
	"clicks" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "article_keywords" (
	"id" serial PRIMARY KEY NOT NULL,
	"article_id" integer NOT NULL,
	"keyword_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "article_topics" (
	"id" serial PRIMARY KEY NOT NULL,
	"article_id" integer NOT NULL,
	"topic_id" integer NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "articles" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"excerpt" text NOT NULL,
	"content" text NOT NULL,
	"featured_image" text,
	"category_id" integer,
	"status" text DEFAULT 'draft' NOT NULL,
	"author_id" integer,
	"meta_title" text,
	"meta_description" text,
	"reading_time_minutes" integer DEFAULT 5 NOT NULL,
	"views_count" integer DEFAULT 0 NOT NULL,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "articles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text,
	"details" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"icon" text,
	"meta_title" text,
	"meta_description" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "keywords" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "keywords_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" serial PRIMARY KEY NOT NULL,
	"file_name" text NOT NULL,
	"file_url" text NOT NULL,
	"mime_type" text,
	"size_bytes" integer,
	"alt_text" text,
	"uploaded_by_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "redirects" (
	"id" serial PRIMARY KEY NOT NULL,
	"source_path" text NOT NULL,
	"target_path" text NOT NULL,
	"status_code" integer DEFAULT 301 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "redirects_source_path_unique" UNIQUE("source_path")
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"primary_phone" text DEFAULT '+91 98200 18272' NOT NULL,
	"secondary_phone" text DEFAULT '+91 98200 45678',
	"primary_email" text DEFAULT 'contact@vasturitam.com' NOT NULL,
	"consultation_email" text DEFAULT 'consultation@vasturitam.com',
	"whatsapp_number" text DEFAULT '+919820018272',
	"whatsapp_notice" text DEFAULT '✦ WhatsApp Available for Blueprint Sharing',
	"consultation_timings" text DEFAULT 'Monday – Saturday: 10:00 AM – 6:30 PM (IST)',
	"appointment_notice" text DEFAULT 'Prior appointment required for in-depth architectural floor plan audit.',
	"youtube_url" text,
	"youtube_handle" text,
	"twitter_url" text,
	"twitter_handle" text,
	"office_address" text,
	"collaboration_notice" text,
	"adsense_publisher_id" text DEFAULT 'ca-pub-9697854430800000',
	"adsense_enabled" boolean DEFAULT true,
	"adsense_auto_ads" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "topic_relations" (
	"id" serial PRIMARY KEY NOT NULL,
	"source_topic_id" integer NOT NULL,
	"target_topic_id" integer NOT NULL,
	"relation_type" text DEFAULT 'related_to' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "topics" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"sanskrit_name" text,
	"entity_type" text DEFAULT 'concept' NOT NULL,
	"summary" text NOT NULL,
	"description" text NOT NULL,
	"image_url" text,
	"meta_title" text,
	"meta_description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "topics_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"uid" text NOT NULL,
	"email" text NOT NULL,
	"display_name" text,
	"password_hash" text,
	"role" text DEFAULT 'editor' NOT NULL,
	"avatar_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_uid_unique" UNIQUE("uid"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "video_learning" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"category_id" integer,
	"topic_id" integer,
	"video_url" text NOT NULL,
	"video_provider" text NOT NULL,
	"thumbnail_url" text NOT NULL,
	"description" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"duration" text,
	"instructor" text,
	"created_by" integer,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "video_learning_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "ad_clicks" ADD CONSTRAINT "ad_clicks_advertisement_id_advertisements_id_fk" FOREIGN KEY ("advertisement_id") REFERENCES "public"."advertisements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ad_impressions" ADD CONSTRAINT "ad_impressions_advertisement_id_advertisements_id_fk" FOREIGN KEY ("advertisement_id") REFERENCES "public"."advertisements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article_keywords" ADD CONSTRAINT "article_keywords_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article_keywords" ADD CONSTRAINT "article_keywords_keyword_id_keywords_id_fk" FOREIGN KEY ("keyword_id") REFERENCES "public"."keywords"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article_topics" ADD CONSTRAINT "article_topics_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article_topics" ADD CONSTRAINT "article_topics_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_uploaded_by_id_users_id_fk" FOREIGN KEY ("uploaded_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topic_relations" ADD CONSTRAINT "topic_relations_source_topic_id_topics_id_fk" FOREIGN KEY ("source_topic_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topic_relations" ADD CONSTRAINT "topic_relations_target_topic_id_topics_id_fk" FOREIGN KEY ("target_topic_id") REFERENCES "public"."topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "video_learning" ADD CONSTRAINT "video_learning_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "video_learning" ADD CONSTRAINT "video_learning_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "video_learning" ADD CONSTRAINT "video_learning_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ad_clicks_advertisement_idx" ON "ad_clicks" USING btree ("advertisement_id");--> statement-breakpoint
CREATE INDEX "ad_imp_advertisement_idx" ON "ad_impressions" USING btree ("advertisement_id");--> statement-breakpoint
CREATE INDEX "ad_imp_created_at_idx" ON "ad_impressions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "ad_placement_active_idx" ON "advertisements" USING btree ("placement","is_active");--> statement-breakpoint
CREATE INDEX "article_keywords_article_idx" ON "article_keywords" USING btree ("article_id");--> statement-breakpoint
CREATE INDEX "article_keywords_keyword_idx" ON "article_keywords" USING btree ("keyword_id");--> statement-breakpoint
CREATE INDEX "article_topics_article_idx" ON "article_topics" USING btree ("article_id");--> statement-breakpoint
CREATE INDEX "article_topics_topic_idx" ON "article_topics" USING btree ("topic_id");--> statement-breakpoint
CREATE UNIQUE INDEX "article_slug_idx" ON "articles" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "article_status_idx" ON "articles" USING btree ("status");--> statement-breakpoint
CREATE INDEX "article_category_idx" ON "articles" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "article_published_at_idx" ON "articles" USING btree ("published_at");--> statement-breakpoint
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "category_slug_idx" ON "categories" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "keyword_slug_idx" ON "keywords" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "topic_rel_source_idx" ON "topic_relations" USING btree ("source_topic_id");--> statement-breakpoint
CREATE INDEX "topic_rel_target_idx" ON "topic_relations" USING btree ("target_topic_id");--> statement-breakpoint
CREATE UNIQUE INDEX "topic_slug_idx" ON "topics" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "topic_entity_type_idx" ON "topics" USING btree ("entity_type");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");--> statement-breakpoint
CREATE UNIQUE INDEX "video_learning_slug_idx" ON "video_learning" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "video_learning_status_idx" ON "video_learning" USING btree ("status");--> statement-breakpoint
CREATE INDEX "video_learning_category_idx" ON "video_learning" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "video_learning_topic_idx" ON "video_learning" USING btree ("topic_id");--> statement-breakpoint
CREATE INDEX "video_learning_order_idx" ON "video_learning" USING btree ("display_order");