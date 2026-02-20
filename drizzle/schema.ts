import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, json, index } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with rental marketplace fields.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  // Profile fields
  displayName: varchar("displayName", { length: 255 }),
  bio: text("bio"),
  avatarUrl: varchar("avatarUrl", { length: 512 }),
  location: varchar("location", { length: 255 }),
  zipCode: varchar("zipCode", { length: 10 }),
  phone: varchar("phone", { length: 20 }),
  // Token economy
  tokenBalance: int("tokenBalance").default(100).notNull(), // Free tokens on signup
  subscriptionTier: mysqlEnum("subscriptionTier", ["free", "starter", "pro", "enterprise"]).default("free").notNull(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  subscriptionId: varchar("subscriptionId", { length: 255 }),
  subscriptionStatus: mysqlEnum("subscriptionStatus", ["active", "canceled", "past_due", "none"]).default("none").notNull(),
  // Accessibility preferences
  accessibilityMode: mysqlEnum("accessibilityMode", ["default", "wcag_aaa", "eco_code", "neuro_code", "dyslexic", "no_blue_light"]).default("default").notNull(),
  // Admin/moderation
  isBanned: boolean("isBanned").default(false).notNull(),
  banReason: text("banReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Listings table
export const listings = mysqlTable("listings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 50 }).notNull(), // generators, pumps, tools, safety, vehicles, home, events, weird, other
  pricePerDay: decimal("pricePerDay", { precision: 10, scale: 2 }).notNull(),
  fairValuePrice: decimal("fairValuePrice", { precision: 10, scale: 2 }), // AI-calculated fair price
  location: varchar("location", { length: 255 }).notNull(),
  zipCode: varchar("zipCode", { length: 10 }),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  // Status & visibility
  availability: mysqlEnum("availability", ["available", "rented", "unavailable"]).default("available").notNull(),
  isVerified: boolean("isVerified").default(false).notNull(),
  isEmergency: boolean("isEmergency").default(false).notNull(),
  isWeird: boolean("isWeird").default(false).notNull(),
  isBarterEnabled: boolean("isBarterEnabled").default(false).notNull(),
  isDeliveryAvailable: boolean("isDeliveryAvailable").default(false).notNull(),
  // Media & specs
  images: json("images").$type<string[]>().notNull(),
  specs: json("specs").$type<Record<string, string>>().notNull(),
  // CO2 tracking
  co2SavedPerRental: decimal("co2SavedPerRental", { precision: 8, scale: 2 }).default("0"),
  // Moderation
  isFlagged: boolean("isFlagged").default(false).notNull(),
  flagReason: text("flagReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  categoryIdx: index("idx_listings_category").on(table.category),
  emergencyIdx: index("idx_listings_emergency").on(table.isEmergency),
  availabilityIdx: index("idx_listings_availability").on(table.availability),
  userIdx: index("idx_listings_user").on(table.userId),
}));

export type Listing = typeof listings.$inferSelect;
export type InsertListing = typeof listings.$inferInsert;

// Rentals/Bookings table
export const rentals = mysqlTable("rentals", {
  id: int("id").autoincrement().primaryKey(),
  listingId: int("listingId").notNull(),
  renterId: int("renterId").notNull(),
  ownerId: int("ownerId").notNull(),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(),
  totalPrice: decimal("totalPrice", { precision: 10, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["pending", "confirmed", "in_progress", "completed", "canceled"]).default("pending").notNull(),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "paid", "refunded"]).default("pending").notNull(),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  // Damage/insurance
  damageReported: boolean("damageReported").default(false).notNull(),
  damageDescription: text("damageDescription"),
  insuranceClaimed: boolean("insuranceClaimed").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  listingIdx: index("idx_rentals_listing").on(table.listingId),
  renterIdx: index("idx_rentals_renter").on(table.renterId),
  statusIdx: index("idx_rentals_status").on(table.status),
}));

export type Rental = typeof rentals.$inferSelect;
export type InsertRental = typeof rentals.$inferInsert;

// Reviews table
export const reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  rentalId: int("rentalId").notNull(),
  fromUserId: int("fromUserId").notNull(),
  toUserId: int("toUserId").notNull(),
  rating: int("rating").notNull(), // 1-5
  comment: text("comment"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  rentalIdx: index("idx_reviews_rental").on(table.rentalId),
  toUserIdx: index("idx_reviews_toUser").on(table.toUserId),
}));

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

// Barter Offers table
export const barterOffers = mysqlTable("barterOffers", {
  id: int("id").autoincrement().primaryKey(),
  listingId: int("listingId").notNull(),
  fromUserId: int("fromUserId").notNull(),
  toUserId: int("toUserId").notNull(),
  offeredItemDescription: text("offeredItemDescription").notNull(),
  status: mysqlEnum("status", ["pending", "accepted", "rejected", "completed"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  listingIdx: index("idx_barter_listing").on(table.listingId),
  fromUserIdx: index("idx_barter_fromUser").on(table.fromUserId),
}));

export type BarterOffer = typeof barterOffers.$inferSelect;
export type InsertBarterOffer = typeof barterOffers.$inferInsert;

// Token Transactions table
export const tokenTransactions = mysqlTable("tokenTransactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  amount: int("amount").notNull(), // Positive for earn, negative for spend
  type: mysqlEnum("type", ["purchase", "earn", "spend", "refund", "bonus"]).notNull(),
  description: varchar("description", { length: 255 }),
  relatedId: int("relatedId"), // rentalId, listingId, etc
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("idx_tokens_user").on(table.userId),
}));

export type TokenTransaction = typeof tokenTransactions.$inferSelect;
export type InsertTokenTransaction = typeof tokenTransactions.$inferInsert;

// Neighborhood Circles table
export const neighborhoodCircles = mysqlTable("neighborhoodCircles", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  zipCode: varchar("zipCode", { length: 10 }).notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  memberCount: int("memberCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  zipIdx: index("idx_circles_zip").on(table.zipCode),
}));

export type NeighborhoodCircle = typeof neighborhoodCircles.$inferSelect;
export type InsertNeighborhoodCircle = typeof neighborhoodCircles.$inferInsert;

// Circle Members table
export const circleMembers = mysqlTable("circleMembers", {
  id: int("id").autoincrement().primaryKey(),
  circleId: int("circleId").notNull(),
  userId: int("userId").notNull(),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
}, (table) => ({
  circleIdx: index("idx_members_circle").on(table.circleId),
  userIdx: index("idx_members_user").on(table.userId),
}));

export type CircleMember = typeof circleMembers.$inferSelect;
export type InsertCircleMember = typeof circleMembers.$inferInsert;

// Admin Settings table
export const adminSettings = mysqlTable("adminSettings", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 255 }).notNull().unique(),
  value: text("value"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AdminSetting = typeof adminSettings.$inferSelect;
export type InsertAdminSetting = typeof adminSettings.$inferInsert;