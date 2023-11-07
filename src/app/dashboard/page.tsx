import { useContext } from "react";
import { AuthContext } from "../context/authContex";
import { redirect } from "next/navigation";
import Dashboard from "../components/Dashboard";
const Page = () => {
  // const { user } = useContext(AuthContext);
  // if (!user) {
  //   redirect("/auth-callback?origin=dashboard");
  // }
  return <Dashboard />;
};

export default Page;
