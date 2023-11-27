import { useContext } from "react";
import { AuthContext } from "../context/authContex";
import { redirect } from "next/navigation";
import Dashboard from "../components/Dashboard";
import { getUserSubscriptionPlan } from "../lib/stripe";
const Page = async () => {
  // const { user } = useContext(AuthContext);
  // if (!user) {
  //   redirect("/auth-callback?origin=dashboard");
  // }
  const subscriptionPlan = await getUserSubscriptionPlan();

  return <Dashboard subscriptionPlan={subscriptionPlan} />;
};

export default Page;
