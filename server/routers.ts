import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";
import { notifyOwner } from "./_core/notification";
import {
  createListing,
  getListingById,
  getListingsByUser,
  searchListings,
  updateListing,
  createRental,
  getRentalsByUser,
  addTokenTransaction,
  getUserTokenBalance,
  updateUserTokenBalance,
} from "./db";

const listingSchema = z.object({
  title: z.string().min(3),
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
        return getListingById(input.id);
      }),

    search: publicProcedure
      .input(
        z.object({
          category: z.string().optional(),
          zipCode: z.string().optional(),
          isEmergency: z.boolean().optional(),
          isWeird: z.boolean().optional(),
        })
      )
      .query(async ({ input }) => {
        return searchListings(input);
      }),

    myListings: protectedProcedure.query(async ({ ctx }) => {
      return getListingsByUser(ctx.user.id);
    }),

    update: protectedProcedure
      .input(z.object({ id: z.number(), data: listingSchema.partial() }))
      .mutation(async ({ input, ctx }) => {
        const listing = await getListingById(input.id);
        if (!listing || listing.userId !== ctx.user.id) {
          throw new Error("Unauthorized");
        }
        return updateListing(input.id, input.data as any);
      }),

    suggestFairPrice: publicProcedure
      .input(
        z.object({
          title: z.string(),
          category: z.string(),
          condition: z.enum(["like_new", "good", "fair", "poor"]).optional(),
          location: z.string().optional(),
        })
      )
      .query(async ({ input }) => {
        const prompt = `You are a fair pricing expert for rental marketplaces. Based on the item and market conditions, suggest a fair daily rental price. Item: ${input.title}, Category: ${input.category}, Condition: ${input.condition || "good"}, Location: ${input.location || "US average"}. Respond with ONLY a JSON object: {"suggestedPrice": number, "reasoning": string}`;
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "You are a fair pricing expert for rental marketplaces.",
            },
            { role: "user", content: prompt },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "pricing_suggestion",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  suggestedPrice: { type: "number", description: "Daily rental price in USD" },
                  reasoning: { type: "string", description: "Why this price" },
                },
                required: ["suggestedPrice", "reasoning"],
                additionalProperties: false,
              },
            },
          },
        });
        try {
          const content = response.choices[0]?.message.content;
          const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
          const parsed = JSON.parse(contentStr || "{}");
          return parsed;
        } catch {
          return { suggestedPrice: 25, reasoning: "Default estimate" };
        }
      }),
  }),

  tokens: router({
    balance: protectedProcedure.query(async ({ ctx }) => {
      return getUserTokenBalance(ctx.user.id);
    }),

    spend: protectedProcedure
      .input(z.object({ amount: z.number().positive(), reason: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const balance = await getUserTokenBalance(ctx.user.id);
        if (balance < input.amount) throw new Error("Insufficient tokens");
        await updateUserTokenBalance(ctx.user.id, balance - input.amount);
        await addTokenTransaction({
          userId: ctx.user.id,
          amount: -input.amount,
          type: "spend",
          description: input.reason,
        });
        return { success: true, newBalance: balance - input.amount };
      }),
  }),

  rentals: router({
    create: protectedProcedure
      .input(
        z.object({
          listingId: z.number(),
          startDate: z.date(),
          endDate: z.date(),
          totalPrice: z.number().positive(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const listing = await getListingById(input.listingId);
        if (!listing) throw new Error("Listing not found");
        return createRental({
          listingId: input.listingId,
          renterId: ctx.user.id,
          ownerId: listing.userId,
          startDate: input.startDate,
          endDate: input.endDate,
          totalPrice: input.totalPrice.toString() as any,
        });
      }),

    myRentals: protectedProcedure.query(async ({ ctx }) => {
      return getRentalsByUser(ctx.user.id);
    }),
  }),
});

export type AppRouter = typeof appRouter;
