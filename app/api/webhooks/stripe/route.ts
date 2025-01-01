import { createOrUpdateSubscription, updateUserPoints } from "@/utils/db/actions";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

export async function POST(req: Request) {
  const body = await req.text();

  const signature = headers().get("Stripe-Signature") as string;
  if (!signature) {
    console.log("not signature found");
    return NextResponse.json({ error: "No Stripe Signature" }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SINGNING_SECRET!
    );
  } catch (error: any) {
    console.error(`Webhook signature verification failed: ${error}`);
    return NextResponse.json(
      { error: `Webhook Error: ${error.message}` },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.client_reference_id;
    const subscriptionId = session.subscription as string;

    if (!userId || !subscriptionId) {
      console.error("Missing userId or subscriptionId in session", { session });
      return NextResponse.json(
        { error: "Invalid session data" },
        { status: 400 }
      );
    }

    try {
      console.log(`Retrieving subscription: ${subscriptionId}`);
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      console.log("retrived subscription", subscription);

      if (!subscription.items.data.length) {
        console.error("No items found in subscription", { subscription });
        return NextResponse.json(
          { error: "Invalid subscription data" },
          { status: 400 }
        );
      }

      const priceId = subscription.items.data[0].price.id;
      console.log('pirce id',priceId)
      let plan:string
      let pointsToAdd:number

      switch(priceId){
        case process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID:
            plan= "Basic";
            pointsToAdd=100;
            break;
        case process.env.NEXT_PUBLIC_STRIPE_ENTERPRICE_PRICE_ID:
            plan= "Enterprise";
            pointsToAdd=500;
            break;
        default:
            console.log("Unknown price id",{priceId})
            return NextResponse.json(
                { error: "Unknown price ID" },
                { status: 400 }
              );

      }

      console.log('creatintg/updating subscription for user',userId)

      const updatedSubscription =await createOrUpdateSubscription(userId,subscriptionId,plan,'active', new Date(subscription.current_period_start * 1000),
      new Date(subscription.current_period_end * 1000))

    
      if (!updatedSubscription) {
        console.error("Failed to create or update subscription");
        return NextResponse.json(
          { error: "Failed to create or update subscription" },
          { status: 500 }
        );
      }

      console.log(`Updating points for user ${userId}: +${pointsToAdd}`);


      await updateUserPoints(userId, pointsToAdd);

      console.log(`Successfully processed subscription for user ${userId}`);


    } catch (error:any) {
        console.error("Error processing subscription:", error);
        return NextResponse.json(
          { error: "Error processing subscription", details: error.message },
          { status: 500 }
        );

        

    }
  }

 

  return NextResponse.json(
    { message: "event process succefully!" },
    { status: 200 }
  );
}
