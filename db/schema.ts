import { relations } from "drizzle-orm";
import { boolean, index, integer, pgEnum, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const orderStatus = pgEnum("order_status", ["PENDING", "CONFIRMED", "PAID", "DISPATCHED", "DELIVERED", "CANCELLED"]);
export const enquiryType = pgEnum("enquiry_type", ["BULK", "VISIT", "DEALER"]);

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  name: text("name").notNull(),
  nameHi: text("name_hi").notNull(),
  sort: integer("sort").notNull().default(0),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 80 }).notNull().unique(),
  name: text("name").notNull(),
  nameHi: text("name_hi").notNull(),
  botanical: text("botanical").notNull(),
  species: varchar("species", { length: 32 }).notNull(),
  tagline: text("tagline").notNull(),
  description: text("description").notNull(),
  sun: text("sun").notNull(),
  water: text("water").notNull(),
  matureSize: text("mature_size").notNull(),
  growth: text("growth").notNull(),
  featured: boolean("featured").notNull().default(false),
  categoryId: integer("category_id").notNull().references(() => categories.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const variants = pgTable("variants", {
  id: serial("id").primaryKey(),
  sku: varchar("sku", { length: 40 }).notNull().unique(),
  label: text("label").notNull(),
  heightCm: integer("height_cm").notNull(),
  bag: text("bag").notNull(),
  priceInr: integer("price_inr").notNull(),
  stock: integer("stock").notNull().default(100),
  ageDays: integer("age_days").notNull(),
  productId: integer("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
}, (t) => [index("variants_product_idx").on(t.productId)]);

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  number: varchar("number", { length: 24 }).notNull().unique(),
  name: text("name").notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  email: text("email"),
  address: text("address").notNull(),
  city: text("city").notNull(),
  pincode: varchar("pincode", { length: 10 }).notNull(),
  fulfilment: varchar("fulfilment", { length: 24 }).notNull(),
  planting: boolean("planting").notNull().default(false),
  payment: varchar("payment", { length: 16 }).notNull(),
  subtotalInr: integer("subtotal_inr").notNull(),
  deliveryInr: integer("delivery_inr").notNull(),
  plantingInr: integer("planting_inr").notNull(),
  totalInr: integer("total_inr").notNull(),
  status: orderStatus("status").notNull().default("PENDING"),
  razorpayOrder: text("razorpay_order"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  variantId: integer("variant_id").notNull().references(() => variants.id),
  name: text("name").notNull(),
  label: text("label").notNull(),
  qty: integer("qty").notNull(),
  priceInr: integer("price_inr").notNull(),
}, (t) => [index("order_items_order_idx").on(t.orderId)]);

export const enquiries = pgTable("enquiries", {
  id: serial("id").primaryKey(),
  type: enquiryType("type").notNull(),
  name: text("name").notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  company: text("company"),
  buyerType: text("buyer_type"),
  city: text("city"),
  plants: text("plants"),
  quantity: text("quantity"),
  timeline: text("timeline"),
  visitDate: text("visit_date"),
  nursery: text("nursery"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const productRelations = relations(products, ({ one, many }) => ({ category: one(categories, { fields: [products.categoryId], references: [categories.id] }), variants: many(variants) }));
export const variantRelations = relations(variants, ({ one }) => ({ product: one(products, { fields: [variants.productId], references: [products.id] }) }));
export const categoryRelations = relations(categories, ({ many }) => ({ products: many(products) }));
export const orderRelations = relations(orders, ({ many }) => ({ items: many(orderItems) }));
export const orderItemRelations = relations(orderItems, ({ one }) => ({ order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }), variant: one(variants, { fields: [orderItems.variantId], references: [variants.id] }) }));
