import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

// WiiPay webhook handler for gift subscriptions
http.route({
  path: "/wiipay-gift",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      
      // Verify webhook signature here if WiiPay provides one
      // const signature = request.headers.get("x-wiipay-signature");
      
      const { payment_id, status, amount } = body;
      
      if (!payment_id) {
        return new Response("Missing payment_id", { status: 400 });
      }

      // Update gift subscription status based on payment status
      let giftStatus = "pending";
      if (status === "completed" || status === "success") {
        giftStatus = "paid";
      } else if (status === "failed" || status === "cancelled") {
        giftStatus = "cancelled";
      }

      // Update the gift subscription in the database
      await ctx.runMutation(api.giftSubscriptions.updateGiftSubscriptionStatus, {
        paymentId: payment_id,
        status: giftStatus,
      });

      // TODO: Send email notifications to giver and recipient here
      // You can use a service like Resend, SendGrid, or similar

      return new Response("OK", { status: 200 });
    } catch (error) {
      console.error("Webhook error:", error);
      return new Response("Internal Server Error", { status: 500 });
    }
  }),
});

// Regular subscription webhook handler
http.route({
  path: "/wiipay",
  method: "POST", 
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      
      // Handle regular subscription webhooks here
      // Similar logic but for regular subscriptions
      
      return new Response("OK", { status: 200 });
    } catch (error) {
      console.error("Webhook error:", error);
      return new Response("Internal Server Error", { status: 500 });
    }
  }),
});

export default http;