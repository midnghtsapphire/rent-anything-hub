import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";
import { notifyOwner } from "./_core/notification";
import Stripe from "stripe";
import {
  upsertUser, getUserByOpenId, getUserById, updateUser, getAllUsers, getUserCount,
  promoteToAdmin, banUser, unbanUser,
  createListing, getListingById, getListingsByUser, searchListings, updateListing,
  adminUpdateListing, deleteListing, getListingCount, getFlaggedListings, getAllListings, incrementListingView,
  createRental, getRentalById, getRentalsByUser, getRentalsByOwner, updateRental, getRentalCount, getAllRentals,
  createReview, getReviewsByListing, getReviewsByUser,
  createBarterOffer, getBarterOffersByListing, getBarterOffersByUser, updateBarterOffer,
  addTokenTransaction, getUserTokenBalance, updateUserTokenBalance, getTokenHistory,
  createSupportTicket, getSupportTickets, getSupportTicketById, updateSupportTicket, getTicketsByUser,
  setAdminSetting, getAllAdminSettings, getDashboardStats,
} from "./db";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2026-01-28.clover" as any })
  : null;

// Admin middleware
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  return next({ ctx });
});

// Listing schema
const listingSchema = z.object({
  title: z.string().min(3).max(255),
  description: z.string().optional(),
  category: z.string(),
  pricePerDay: z.number().positive(),
  location: z.string(),
  zipCode: z.string().optional(),
  images: z.array(z.string()).optional(),
  specs: z.record(z.string(), z.string()).optional(),
  isEmergency: z.boolean().optional(),
  isWeird: z.boolean().optional(),
  isBarterEnabled: z.boolean().optional(),
  isDeliveryAvailable: z.boolean().optional(),
  condition: z.enum(["like_new", "good", "fair", "poor"]).optional(),
});

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ============================================================
  // LISTINGS
  // ============================================================
  listings: router({
    create: protectedProcedure
      .input(listingSchema)
      .mutation(async ({ input, ctx }) => {
        const listing = await createListing({
          userId: ctx.user.id,
          title: input.title,
          description: input.description,
          category: input.category,
          pricePerDay: input.pricePerDay.toString() as any,
          location: input.location,
          zipCode: input.zipCode,
          images: input.images || [],
          specs: (input.specs || {}) as Record<string, string>,
          isEmergency: input.isEmergency || false,
          isWeird: input.isWeird || false,
          isBarterEnabled: input.isBarterEnabled || false,
          isDeliveryAvailable: input.isDeliveryAvailable || false,
          condition: input.condition || "good",
        });
        // Award tokens for listing
        const balance = await getUserTokenBalance(ctx.user.id);
        await updateUserTokenBalance(ctx.user.id, balance + 25);
        await addTokenTransaction({
          userId: ctx.user.id,
          amount: 25,
          type: "earn",
          description: `Listed "${input.title}"`,
        });
        await notifyOwner({
          title: "New Listing Created",
          content: `${ctx.user.name} listed "${input.title}" for $${input.pricePerDay}/day`,
        });
        return listing;
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        await incrementListingView(input.id);
        return getListingById(input.id);
      }),

    search: publicProcedure
      .input(z.object({
        category: z.string().optional(),
        zipCode: z.string().optional(),
        isEmergency: z.boolean().optional(),
        isWeird: z.boolean().optional(),
        query: z.string().optional(),
        limit: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return searchListings(input);
      }),

    myListings: protectedProcedure.query(async ({ ctx }) => {
      return getListingsByUser(ctx.user.id);
    }),

    update: protectedProcedure
      .input(z.object({ id: z.number(), data: listingSchema.partial() }))
      .mutation(async ({ input, ctx }) => {
        return updateListing(input.id, ctx.user.id, input.data as any);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        return deleteListing(input.id, ctx.user.id);
      }),

    flag: protectedProcedure
      .input(z.object({ id: z.number(), reason: z.string() }))
      .mutation(async ({ input }) => {
        return adminUpdateListing(input.id, { isFlagged: true, flagReason: input.reason });
      }),

    getReviews: publicProcedure
      .input(z.object({ listingId: z.number() }))
      .query(async ({ input }) => {
        return getReviewsByListing(input.listingId);
      }),
  }),

  // ============================================================
  // RENTALS
  // ============================================================
  rentals: router({
    create: protectedProcedure
      .input(z.object({
        listingId: z.number(),
        startDate: z.string(),
        endDate: z.string(),
        notes: z.string().optional(),
        meetupLocation: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const listing = await getListingById(input.listingId);
        if (!listing) throw new TRPCError({ code: "NOT_FOUND", message: "Listing not found" });
        if (listing.availability !== "available") throw new TRPCError({ code: "BAD_REQUEST", message: "Item not available" });

        const start = new Date(input.startDate);
        const end = new Date(input.endDate);
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        const totalPrice = (parseFloat(listing.pricePerDay as string) * days).toFixed(2);

        const rental = await createRental({
          listingId: input.listingId,
          renterId: ctx.user.id,
          ownerId: listing.userId,
          startDate: start,
          endDate: end,
          totalPrice: totalPrice as any,
          status: "pending",
          paymentStatus: "pending",
          notes: input.notes,
          meetupLocation: input.meetupLocation,
        });
        await notifyOwner({
          title: "New Rental Request",
          content: `${ctx.user.name} wants to rent "${listing.title}" for ${days} days ($${totalPrice})`,
        });
        return rental;
      }),

    myRentals: protectedProcedure.query(async ({ ctx }) => {
      return getRentalsByUser(ctx.user.id);
    }),

    myOwnerRentals: protectedProcedure.query(async ({ ctx }) => {
      return getRentalsByOwner(ctx.user.id);
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getRentalById(input.id);
      }),

    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["confirmed", "in_progress", "completed", "canceled"]),
      }))
      .mutation(async ({ input }) => {
        return updateRental(input.id, { status: input.status });
      }),
  }),

  // ============================================================
  // REVIEWS
  // ============================================================
  reviews: router({
    create: protectedProcedure
      .input(z.object({
        rentalId: z.number(),
        toUserId: z.number(),
        listingId: z.number(),
        rating: z.number().min(1).max(5),
        comment: z.string().optional(),
        reviewType: z.enum(["renter_to_owner", "owner_to_renter"]),
      }))
      .mutation(async ({ input, ctx }) => {
        return createReview({
          rentalId: input.rentalId,
          fromUserId: ctx.user.id,
          toUserId: input.toUserId,
          listingId: input.listingId,
          rating: input.rating,
          comment: input.comment,
          reviewType: input.reviewType,
        });
      }),

    getByUser: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        return getReviewsByUser(input.userId);
      }),
  }),

  // ============================================================
  // BARTER
  // ============================================================
  barter: router({
    createOffer: protectedProcedure
      .input(z.object({
        listingId: z.number(),
        toUserId: z.number(),
        offeredItemDescription: z.string().min(10),
        offeredItemValue: z.number().optional(),
        message: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const listing = await getListingById(input.listingId);
        if (!listing?.isBarterEnabled) throw new TRPCError({ code: "BAD_REQUEST", message: "Barter not enabled for this listing" });
        return createBarterOffer({
          listingId: input.listingId,
          fromUserId: ctx.user.id,
          toUserId: input.toUserId,
          offeredItemDescription: input.offeredItemDescription,
          offeredItemValue: input.offeredItemValue?.toString() as any,
          message: input.message,
          status: "pending",
        });
      }),

    getByListing: publicProcedure
      .input(z.object({ listingId: z.number() }))
      .query(async ({ input }) => {
        return getBarterOffersByListing(input.listingId);
      }),

    myOffers: protectedProcedure.query(async ({ ctx }) => {
      return getBarterOffersByUser(ctx.user.id);
    }),

    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["accepted", "rejected", "completed"]),
      }))
      .mutation(async ({ input }) => {
        return updateBarterOffer(input.id, { status: input.status });
      }),
  }),

  // ============================================================
  // AI FAIR PRICING ENGINE
  // ============================================================
  ai: router({
    getFairPrice: publicProcedure
      .input(z.object({
        title: z.string(),
        category: z.string(),
        condition: z.string(),
        location: z.string(),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        try {
          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content: `You are Rentable's AI Fair Pricing Engine. Analyze rental items and suggest fair daily rental prices.
                Return JSON with: { suggestedPrice: number, minPrice: number, maxPrice: number, confidence: "high"|"medium"|"low", reasoning: string, co2SavedKg: number }
                Base prices on: item category, condition, typical retail value, local demand, and sharing economy standards.
                CO2 saved = estimated kg CO2 avoided by renting instead of buying new.`,
              },
              {
                role: "user",
                content: `Item: "${input.title}" | Category: ${input.category} | Condition: ${input.condition} | Location: ${input.location}${input.description ? ` | Description: ${input.description}` : ""}`,
              },
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "fair_price",
                strict: true,
                schema: {
                  type: "object",
                  properties: {
                    suggestedPrice: { type: "number" },
                    minPrice: { type: "number" },
                    maxPrice: { type: "number" },
                    confidence: { type: "string" },
                    reasoning: { type: "string" },
                    co2SavedKg: { type: "number" },
                  },
                  required: ["suggestedPrice", "minPrice", "maxPrice", "confidence", "reasoning", "co2SavedKg"],
                  additionalProperties: false,
                },
              },
            },
          });
          const rawContent = response.choices[0]?.message?.content;
          const content = typeof rawContent === "string" ? rawContent : JSON.stringify(rawContent ?? {});
          return JSON.parse(content || "{}");
        } catch {
          return { suggestedPrice: 25, minPrice: 15, maxPrice: 45, confidence: "low", reasoning: "Default estimate", co2SavedKg: 2.5 };
        }
      }),

    getWeirdVaultPick: publicProcedure.query(async () => {
      try {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: "You are the Weird Vault curator for Rentable. Generate one delightfully bizarre rental item. Return JSON." },
            { role: "user", content: "Give me today's Weird Vault featured item — something genuinely unusual that someone might actually rent." },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "weird_item",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  pricePerDay: { type: "number" },
                  emoji: { type: "string" },
                  weirdnessScore: { type: "number" },
                  funFact: { type: "string" },
                },
                required: ["title", "description", "pricePerDay", "emoji", "weirdnessScore", "funFact"],
                additionalProperties: false,
              },
            },
          },
        });
        const rawContent = response.choices[0]?.message?.content;
        const content = typeof rawContent === "string" ? rawContent : JSON.stringify(rawContent ?? {});
        return JSON.parse(content || "{}");
      } catch {
        return { title: "Emotional Support Goat", description: "Certified therapy goat for your next presentation", pricePerDay: 45, emoji: "🐐", weirdnessScore: 9, funFact: "Goats have rectangular pupils" };
      }
    }),
  }),

  // ============================================================
  // TOKENS
  // ============================================================
  tokens: router({
    getBalance: protectedProcedure.query(async ({ ctx }) => {
      return getUserTokenBalance(ctx.user.id);
    }),

    getHistory: protectedProcedure.query(async ({ ctx }) => {
      return getTokenHistory(ctx.user.id);
    }),

    spend: protectedProcedure
      .input(z.object({ amount: z.number().positive(), description: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const balance = await getUserTokenBalance(ctx.user.id);
        if (balance < input.amount) throw new TRPCError({ code: "BAD_REQUEST", message: "Insufficient tokens" });
        await updateUserTokenBalance(ctx.user.id, balance - input.amount);
        await addTokenTransaction({ userId: ctx.user.id, amount: -input.amount, type: "spend", description: input.description });
        return { newBalance: balance - input.amount };
      }),
  }),

  // ============================================================
  // STRIPE PAYMENTS
  // ============================================================
  stripe: router({
    createCheckout: protectedProcedure
      .input(z.object({
        rentalId: z.number(),
        origin: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!stripe) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Stripe not configured" });
        const rental = await getRentalById(input.rentalId);
        if (!rental) throw new TRPCError({ code: "NOT_FOUND", message: "Rental not found" });
        if (rental.renterId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN" });
        const listing = await getListingById(rental.listingId);
        const amountCents = Math.round(parseFloat(rental.totalPrice as string) * 100);
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: [{
            price_data: {
              currency: "usd",
              product_data: {
                name: listing?.title || "Rental",
                description: `Rental from ${rental.startDate.toLocaleDateString()} to ${rental.endDate.toLocaleDateString()}`,
              },
              unit_amount: amountCents,
            },
            quantity: 1,
          }],
          mode: "payment",
          customer_email: ctx.user.email || undefined,
          client_reference_id: ctx.user.id.toString(),
          metadata: {
            rental_id: rental.id.toString(),
            user_id: ctx.user.id.toString(),
            customer_email: ctx.user.email || "",
            customer_name: ctx.user.name || "",
          },
          success_url: `${input.origin}/rentals/${rental.id}?payment=success`,
          cancel_url: `${input.origin}/rentals/${rental.id}?payment=canceled`,
          allow_promotion_codes: true,
        });
        await updateRental(rental.id, { stripeCheckoutSessionId: session.id });
        return { url: session.url };
      }),

    createSubscription: protectedProcedure
      .input(z.object({
        tier: z.enum(["starter", "pro", "enterprise"]),
        origin: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!stripe) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Stripe not configured" });
        const prices = {
          starter: { amount: 999, name: "Rentable Starter" },
          pro: { amount: 2999, name: "Rentable Pro" },
          enterprise: { amount: 9999, name: "Rentable Enterprise" },
        };
        const plan = prices[input.tier];
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: [{
            price_data: {
              currency: "usd",
              product_data: { name: plan.name },
              unit_amount: plan.amount,
              recurring: { interval: "month" },
            },
            quantity: 1,
          }],
          mode: "subscription",
          customer_email: ctx.user.email || undefined,
          client_reference_id: ctx.user.id.toString(),
          metadata: {
            user_id: ctx.user.id.toString(),
            tier: input.tier,
          },
          success_url: `${input.origin}/profile?subscription=success`,
          cancel_url: `${input.origin}/pricing?canceled=true`,
          allow_promotion_codes: true,
        });
        return { url: session.url };
      }),
  }),

  // ============================================================
  // USER PROFILE
  // ============================================================
  profile: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return getUserById(ctx.user.id);
    }),

    update: protectedProcedure
      .input(z.object({
        displayName: z.string().optional(),
        bio: z.string().optional(),
        location: z.string().optional(),
        zipCode: z.string().optional(),
        phone: z.string().optional(),
        accessibilityMode: z.enum(["default", "wcag_aaa", "eco_code", "neuro_code", "dyslexic", "no_blue_light"]).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await updateUser(ctx.user.id, input as any);
        return { success: true };
      }),

    getPublic: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        const user = await getUserById(input.userId);
        if (!user) return null;
        return {
          id: user.id,
          displayName: user.displayName || user.name,
          bio: user.bio,
          location: user.location,
          avatarUrl: user.avatarUrl,
          createdAt: user.createdAt,
          role: user.role,
        };
      }),
  }),

  // ============================================================
  // SUPPORT TICKETS
  // ============================================================
  support: router({
    create: publicProcedure
      .input(z.object({
        name: z.string().min(2),
        email: z.string().email(),
        subject: z.string().min(5),
        message: z.string().min(20),
        category: z.enum(["general", "billing", "listing", "rental", "safety", "bug", "other"]).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await createSupportTicket({
          userId: ctx.user?.id,
          name: input.name,
          email: input.email,
          subject: input.subject,
          message: input.message,
          category: input.category || "general",
          status: "open",
          priority: "medium",
        });
        await notifyOwner({
          title: `Support Ticket: ${input.subject}`,
          content: `From: ${input.name} (${input.email})\n${input.message}`,
        });
        return { success: true };
      }),

    myTickets: protectedProcedure.query(async ({ ctx }) => {
      return getTicketsByUser(ctx.user.id);
    }),
  }),

  // ============================================================
  // ADMIN PANEL
  // ============================================================
  admin: router({
    getDashboard: adminProcedure.query(async () => {
      return getDashboardStats();
    }),

    getUsers: adminProcedure
      .input(z.object({ limit: z.number().optional(), offset: z.number().optional() }))
      .query(async ({ input }) => {
        return getAllUsers(input.limit, input.offset);
      }),

    getListings: adminProcedure
      .input(z.object({ limit: z.number().optional(), offset: z.number().optional() }))
      .query(async ({ input }) => {
        return getAllListings(input.limit, input.offset);
      }),

    getFlaggedListings: adminProcedure.query(async () => {
      return getFlaggedListings();
    }),

    getRentals: adminProcedure
      .input(z.object({ limit: z.number().optional(), offset: z.number().optional() }))
      .query(async ({ input }) => {
        return getAllRentals(input.limit, input.offset);
      }),

    getTickets: adminProcedure
      .input(z.object({ status: z.string().optional() }))
      .query(async ({ input }) => {
        return getSupportTickets(input.status);
      }),

    updateTicket: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["open", "in_progress", "resolved", "closed"]).optional(),
        priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
        adminNotes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        if (data.status === "resolved") (data as any).resolvedAt = new Date();
        await updateSupportTicket(id, data as any);
        return { success: true };
      }),

    promoteUser: adminProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ input }) => {
        await promoteToAdmin(input.userId);
        return { success: true };
      }),

    banUser: adminProcedure
      .input(z.object({ userId: z.number(), reason: z.string() }))
      .mutation(async ({ input }) => {
        await banUser(input.userId, input.reason);
        return { success: true };
      }),

    unbanUser: adminProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ input }) => {
        await unbanUser(input.userId);
        return { success: true };
      }),

    approveListing: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await adminUpdateListing(input.id, { isVerified: true, isFlagged: false, flagReason: null });
        return { success: true };
      }),

    removeListing: adminProcedure
      .input(z.object({ id: z.number(), reason: z.string() }))
      .mutation(async ({ input }) => {
        await adminUpdateListing(input.id, { availability: "unavailable", isFlagged: true, flagReason: input.reason });
        return { success: true };
      }),

    getSetting: adminProcedure
      .input(z.object({ key: z.string() }))
      .query(async ({ input }) => {
        const { getAdminSetting } = await import("./db");
        return getAdminSetting(input.key);
      }),

    setSetting: adminProcedure
      .input(z.object({ key: z.string(), value: z.string() }))
      .mutation(async ({ input }) => {
        await setAdminSetting(input.key, input.value);
        return { success: true };
      }),

    getAllSettings: adminProcedure.query(async () => {
      return getAllAdminSettings();
    }),
  }),
});

export type AppRouter = typeof appRouter;
