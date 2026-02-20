import express from "express";
import Stripe from "stripe";
import { updateRental, updateUser, addTokenTransaction, getUserTokenBalance, updateUserTokenBalance } from "./db";

export function registerStripeWebhook(app: express.Application) {
  if (!process.env.STRIPE_SECRET_KEY) return;

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2026-01-28.clover" as any });

  app.post("/api/stripe/webhook",
    express.raw({ type: "application/json" }),
    async (req, res) => {
      const sig = req.headers["stripe-signature"];
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

      let event: Stripe.Event;
      try {
        if (!webhookSecret || !sig) {
          event = JSON.parse(req.body.toString());
        } else {
          event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
        }
      } catch (err: any) {
        console.error("[Stripe Webhook] Signature verification failed:", err.message);
        return res.status(400).json({ error: "Webhook signature verification failed" });
      }

      // Handle test events
      if (event.id.startsWith("evt_test_")) {
        console.log("[Webhook] Test event detected, returning verification response");
        return res.json({ verified: true });
      }

      console.log(`[Stripe Webhook] Event: ${event.type} | ID: ${event.id}`);

      try {
        switch (event.type) {
          case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;
            const rentalId = session.metadata?.rental_id;
            const userId = session.metadata?.user_id ? parseInt(session.metadata.user_id) : null;

            if (rentalId) {
              await updateRental(parseInt(rentalId), {
                paymentStatus: "paid",
                status: "confirmed",
                stripePaymentIntentId: session.payment_intent as string,
              });
            }

            // Award tokens for completing payment
            if (userId) {
              const balance = await getUserTokenBalance(userId);
              await updateUserTokenBalance(userId, balance + 10);
              await addTokenTransaction({
                userId,
                amount: 10,
                type: "earn",
                description: "Completed a rental payment",
              });
            }
            break;
          }

          case "customer.subscription.created":
          case "customer.subscription.updated": {
            const subscription = event.data.object as Stripe.Subscription;
            const userId = subscription.metadata?.user_id ? parseInt(subscription.metadata.user_id) : null;
            const tier = subscription.metadata?.tier;
            if (userId) {
              await updateUser(userId, {
                subscriptionId: subscription.id,
                subscriptionStatus: subscription.status === "active" ? "active" : "past_due",
                subscriptionTier: (tier as any) || "starter",
              });
            }
            break;
          }

          case "customer.subscription.deleted": {
            const subscription = event.data.object as Stripe.Subscription;
            const userId = subscription.metadata?.user_id ? parseInt(subscription.metadata.user_id) : null;
            if (userId) {
              await updateUser(userId, {
                subscriptionStatus: "canceled",
                subscriptionTier: "free",
              });
            }
            break;
          }

          default:
            console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
        }
      } catch (err) {
        console.error("[Stripe Webhook] Error processing event:", err);
      }

      res.json({ received: true });
    }
  );
}
