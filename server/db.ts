import { eq, and, or, like, desc, asc, sql, count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  users, listings, rentals, reviews, barterOffers,
  tokenTransactions, neighborhoodCircles, circleMembers,
  supportTickets, adminSettings,
  InsertUser, InsertListing, InsertRental, InsertReview,
  InsertBarterOffer, InsertTokenTransaction, InsertSupportTicket,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try { _db = drizzle(process.env.DATABASE_URL); }
    catch (error) { console.warn("[Database] Failed to connect:", error); _db = null; }
  }
  return _db;
}

// USERS
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    textFields.forEach((field) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    });
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    // Auto-promote admin by openId OR by email (angelreporters@gmail.com is always admin)
    const ADMIN_EMAILS = ["angelreporters@gmail.com"];
    const isAdminEmail = user.email && ADMIN_EMAILS.includes(user.email.toLowerCase());
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
    else if (user.openId === ENV.ownerOpenId || isAdminEmail) { values.role = "admin"; updateSet.role = "admin"; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) { console.error("[Database] Failed to upsert user:", error); throw error; }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUser(id: number, data: Partial<InsertUser>) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set(data).where(eq(users.id, id));
}

export async function getAllUsers(limit = 100, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt)).limit(limit).offset(offset);
}

export async function getUserCount() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: count() }).from(users);
  return result[0]?.count ?? 0;
}

export async function promoteToAdmin(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ role: "admin" }).where(eq(users.id, userId));
}

export async function banUser(userId: number, reason: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ isBanned: true, banReason: reason }).where(eq(users.id, userId));
}

export async function unbanUser(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ isBanned: false, banReason: null }).where(eq(users.id, userId));
}

// LISTINGS
export async function createListing(data: InsertListing) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(listings).values(data);
}

export async function getListingById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(listings).where(eq(listings.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getListingsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(listings).where(eq(listings.userId, userId)).orderBy(desc(listings.createdAt));
}

export async function searchListings(filters: {
  category?: string; zipCode?: string; isEmergency?: boolean;
  isWeird?: boolean; query?: string; limit?: number;
}) {
  const db = await getDb();
  if (!db) return [];
  const conditions: any[] = [eq(listings.availability, "available")];
  if (filters.category) conditions.push(eq(listings.category, filters.category));
  if (filters.zipCode) conditions.push(eq(listings.zipCode, filters.zipCode));
  if (filters.isEmergency) conditions.push(eq(listings.isEmergency, true));
  if (filters.isWeird) conditions.push(eq(listings.isWeird, true));
  if (filters.query) conditions.push(like(listings.title, `%${filters.query}%`));
  return db.select().from(listings).where(and(...conditions)).orderBy(desc(listings.createdAt)).limit(filters.limit || 50);
}

export async function updateListing(id: number, userId: number, data: Partial<InsertListing>) {
  const db = await getDb();
  if (!db) return;
  await db.update(listings).set(data).where(and(eq(listings.id, id), eq(listings.userId, userId)));
}

export async function adminUpdateListing(id: number, data: Partial<InsertListing>) {
  const db = await getDb();
  if (!db) return;
  await db.update(listings).set(data).where(eq(listings.id, id));
}

export async function deleteListing(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(listings).where(and(eq(listings.id, id), eq(listings.userId, userId)));
}

export async function getListingCount() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: count() }).from(listings);
  return result[0]?.count ?? 0;
}

export async function getFlaggedListings() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(listings).where(eq(listings.isFlagged, true)).orderBy(desc(listings.createdAt));
}

export async function getAllListings(limit = 100, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(listings).orderBy(desc(listings.createdAt)).limit(limit).offset(offset);
}

export async function incrementListingView(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(listings).set({ viewCount: sql`${listings.viewCount} + 1` }).where(eq(listings.id, id));
}

// RENTALS
export async function createRental(data: InsertRental) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(rentals).values(data);
}

export async function getRentalById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(rentals).where(eq(rentals.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getRentalsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(rentals).where(eq(rentals.renterId, userId)).orderBy(desc(rentals.createdAt));
}

export async function getRentalsByOwner(ownerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(rentals).where(eq(rentals.ownerId, ownerId)).orderBy(desc(rentals.createdAt));
}

export async function updateRental(id: number, data: Partial<InsertRental>) {
  const db = await getDb();
  if (!db) return;
  await db.update(rentals).set(data).where(eq(rentals.id, id));
}

export async function getRentalCount() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: count() }).from(rentals);
  return result[0]?.count ?? 0;
}

export async function getAllRentals(limit = 100, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(rentals).orderBy(desc(rentals.createdAt)).limit(limit).offset(offset);
}

// REVIEWS
export async function createReview(data: InsertReview) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(reviews).values(data);
}

export async function getReviewsByListing(listingId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reviews).where(eq(reviews.listingId, listingId)).orderBy(desc(reviews.createdAt));
}

export async function getReviewsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reviews).where(eq(reviews.toUserId, userId)).orderBy(desc(reviews.createdAt));
}

// BARTER
export async function createBarterOffer(data: InsertBarterOffer) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(barterOffers).values(data);
}

export async function getBarterOffersByListing(listingId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(barterOffers).where(eq(barterOffers.listingId, listingId)).orderBy(desc(barterOffers.createdAt));
}

export async function getBarterOffersByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(barterOffers)
    .where(or(eq(barterOffers.fromUserId, userId), eq(barterOffers.toUserId, userId)))
    .orderBy(desc(barterOffers.createdAt));
}

export async function updateBarterOffer(id: number, data: Partial<InsertBarterOffer>) {
  const db = await getDb();
  if (!db) return;
  await db.update(barterOffers).set(data).where(eq(barterOffers.id, id));
}

// TOKENS
export async function addTokenTransaction(data: InsertTokenTransaction) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(tokenTransactions).values(data);
}

export async function getUserTokenBalance(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const user = await getUserById(userId);
  return user?.tokenBalance ?? 0;
}

export async function updateUserTokenBalance(userId: number, newBalance: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ tokenBalance: newBalance }).where(eq(users.id, userId));
}

export async function getTokenHistory(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tokenTransactions).where(eq(tokenTransactions.userId, userId)).orderBy(desc(tokenTransactions.createdAt)).limit(50);
}

// SUPPORT TICKETS
export async function createSupportTicket(data: InsertSupportTicket) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(supportTickets).values(data);
}

export async function getSupportTickets(status?: string) {
  const db = await getDb();
  if (!db) return [];
  if (status) return db.select().from(supportTickets).where(eq(supportTickets.status, status as any)).orderBy(desc(supportTickets.createdAt));
  return db.select().from(supportTickets).orderBy(desc(supportTickets.createdAt));
}

export async function getSupportTicketById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(supportTickets).where(eq(supportTickets.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateSupportTicket(id: number, data: Partial<InsertSupportTicket>) {
  const db = await getDb();
  if (!db) return;
  await db.update(supportTickets).set(data).where(eq(supportTickets.id, id));
}

export async function getTicketsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(supportTickets).where(eq(supportTickets.userId, userId)).orderBy(desc(supportTickets.createdAt));
}

export async function getOpenTicketCount() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: count() }).from(supportTickets).where(eq(supportTickets.status, "open"));
  return result[0]?.count ?? 0;
}

// ADMIN SETTINGS
export async function getAdminSetting(key: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(adminSettings).where(eq(adminSettings.key, key)).limit(1);
  return result.length > 0 ? result[0]?.value : null;
}

export async function setAdminSetting(key: string, value: string) {
  const db = await getDb();
  if (!db) return;
  await db.insert(adminSettings).values({ key, value }).onDuplicateKeyUpdate({ set: { value } });
}

export async function getAllAdminSettings() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(adminSettings).orderBy(asc(adminSettings.key));
}

// DASHBOARD STATS
export async function getDashboardStats() {
  const [userCount, listingCount, rentalCount, ticketCount] = await Promise.all([
    getUserCount(), getListingCount(), getRentalCount(), getOpenTicketCount(),
  ]);
  return { users: userCount, listings: listingCount, rentals: rentalCount, openTickets: ticketCount };
}
