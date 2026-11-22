CREATE TYPE "public"."enquiry_type" AS ENUM('BULK', 'VISIT', 'DEALER');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('PENDING', 'CONFIRMED', 'PAID', 'DISPATCHED', 'DELIVERED', 'CANCELLED');--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(64) NOT NULL,
	"name" text NOT NULL,
	"name_hi" text NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "enquiries" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" "enquiry_type" NOT NULL,
	"name" text NOT NULL,
	"phone" varchar(20) NOT NULL,
	"company" text,
	"buyer_type" text,
	"city" text,
	"plants" text,
	"quantity" text,
	"timeline" text,
	"visit_date" text,
	"nursery" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"variant_id" integer NOT NULL,
	"name" text NOT NULL,
	"label" text NOT NULL,
	"qty" integer NOT NULL,
	"price_inr" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"number" varchar(24) NOT NULL,
	"name" text NOT NULL,
	"phone" varchar(20) NOT NULL,
	"email" text,
	"address" text NOT NULL,
	"city" text NOT NULL,
	"pincode" varchar(10) NOT NULL,
	"fulfilment" varchar(24) NOT NULL,
	"planting" boolean DEFAULT false NOT NULL,
	"payment" varchar(16) NOT NULL,
	"subtotal_inr" integer NOT NULL,
	"delivery_inr" integer NOT NULL,
	"planting_inr" integer NOT NULL,
	"total_inr" integer NOT NULL,
	"status" "order_status" DEFAULT 'PENDING' NOT NULL,
	"razorpay_order" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "orders_number_unique" UNIQUE("number")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(80) NOT NULL,
	"name" text NOT NULL,
	"name_hi" text NOT NULL,
	"botanical" text NOT NULL,
	"species" varchar(32) NOT NULL,
	"tagline" text NOT NULL,
	"description" text NOT NULL,
	"sun" text NOT NULL,
	"water" text NOT NULL,
	"mature_size" text NOT NULL,
	"growth" text NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"category_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "products_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "variants" (
	"id" serial PRIMARY KEY NOT NULL,
	"sku" varchar(40) NOT NULL,
	"label" text NOT NULL,
	"height_cm" integer NOT NULL,
	"bag" text NOT NULL,
	"price_inr" integer NOT NULL,
	"stock" integer DEFAULT 100 NOT NULL,
	"age_days" integer NOT NULL,
	"product_id" integer NOT NULL,
	CONSTRAINT "variants_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_variant_id_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."variants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "variants" ADD CONSTRAINT "variants_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "order_items_order_idx" ON "order_items" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "variants_product_idx" ON "variants" USING btree ("product_id");