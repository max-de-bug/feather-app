import { PLANS } from "@/config/stripe";
import { db } from "@/db";

import Stripe from "stripe";
// import { AuthContext } from "../context/authContex";
import { redirect } from "next/navigation";
// import { Context, useContext } from "react";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2023-10-16",
  typescript: true,
});

export async function getUserSubscriptionPlan() {
  // const { getUser } = getKindeServerSession()
  // const user = getUser()
  // const user = useContext(AuthContext);
  // if (!user) redirect(`/sign-in`);

  const user = {
    id: "1",
    name: "test",
    email: "test",
    picture: "test",
  };
  if (!user.id) {
    return {
      ...PLANS[0],
      isSubscribed: false,
      isCanceled: false,
      stripeCurrentPeriodEnd: null,
    };
  }

  let dbUser;
  try {
    dbUser = await db.user.findFirst({
      where: {
        id: user.id,
      },
    });
  } catch (error: any) {
    // Database connection error - return default plan
    // Handle circuit breaker and authentication errors gracefully
    const errorMessage = error?.message || String(error);
    if (
      errorMessage.includes("Circuit breaker") ||
      errorMessage.includes("authentication") ||
      errorMessage.includes("FATAL")
    ) {
      console.warn(
        "Database connection issue (circuit breaker or auth error). Using default plan.",
        errorMessage
      );
    } else {
      console.error("Database connection error:", error);
    }
    return {
      ...PLANS[0],
      isSubscribed: false,
      isCanceled: false,
      stripeCurrentPeriodEnd: null,
    };
  }

  if (!dbUser) {
    return {
      ...PLANS[0],
      isSubscribed: false,
      isCanceled: false,
      stripeCurrentPeriodEnd: null,
    };
  }

  const isSubscribed = Boolean(
    dbUser.stripePriceId &&
      dbUser.stripeCurrentPeriodEnd && // 86400000 = 1 day
      dbUser.stripeCurrentPeriodEnd.getTime() + 86_400_000 > Date.now()
  );

  const plan = isSubscribed
    ? PLANS.find((plan) => plan.price.priceIds.test === dbUser.stripePriceId)
    : null;

  let isCanceled = false;
  if (isSubscribed && dbUser.stripeSubscriptionId) {
    try {
      const stripePlan = await stripe.subscriptions.retrieve(
        dbUser.stripeSubscriptionId
      );
      isCanceled = stripePlan.cancel_at_period_end;
    } catch (error) {
      // Stripe API error - assume not canceled
      console.error("Stripe API error:", error);
      isCanceled = false;
    }
  }

  return {
    ...plan,
    stripeSubscriptionId: dbUser.stripeSubscriptionId,
    stripeCurrentPeriodEnd: dbUser.stripeCurrentPeriodEnd,
    stripeCustomerId: dbUser.stripeCustomerId,
    isSubscribed,
    isCanceled,
  };
}
