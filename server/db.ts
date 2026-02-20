import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, listings, InsertListing, rentals, InsertRental, tokenTransactions, InsertTokenTransaction } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Listings queries
export async function createListing(data: InsertListing) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(listings).values(data);
  return result;
}

export async function getListingById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(listings).where(eq(listings.id, id)).limit(1);
  return result[0];
}

export async function getListingsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(listings).where(eq(listings.userId, userId));
}

export async function searchListings(filters: { category?: string; zipCode?: string; minPrice?: number; maxPrice?: number; isEmergency?: boolean; isWeird?: boolean }) {
  const db = await getDb();
  if (!db) return [];
  let query: any = db.select().from(listings).where(eq(listings.availability, 'available'));
  if (filters.category) query = query.where(eq(listings.category, filters.category));
  if (filters.zipCode) query = query.where(eq(listings.zipCode, filters.zipCode));
  if (filters.isEmergency) query = query.where(eq(listings.isEmergency, true));
  if (filters.isWeird) query = query.where(eq(listings.isWeird, true));
  return query.limit(100);
}

export async function updateListing(id: number, data: Partial<InsertListing>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(listings).set(data).where(eq(listings.id, id));
}

// Rentals queries
export async function createRental(data: InsertRental) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(rentals).values(data);
}

export async function getRentalsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(rentals).where(eq(rentals.renterId, userId));
}

// Token queries
export async function addTokenTransaction(data: InsertTokenTransaction) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(tokenTransactions).values(data);
}

export async function getUserTokenBalance(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  const user = await db.select({ tokenBalance: users.tokenBalance }).from(users).where(eq(users.id, userId)).limit(1);
  return user[0]?.tokenBalance ?? 0;
}

export async function updateUserTokenBalance(userId: number, newBalance: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(users).set({ tokenBalance: newBalance }).where(eq(users.id, userId));
}
