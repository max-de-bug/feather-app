import BillingForm from "@/app/components/BillingForm";
import { getUserSubscriptionPlan } from "@/app/lib/stripe";

const Page = async () => {
  const subscriptionPlan = await getUserSubscriptionPlan();
  return <BillingForm subscriptionPlan={subscriptionPlan} />;
};

export default Page;
