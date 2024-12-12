// import { s3 } from "./aws/s3";
import { AuthContext } from "@/app/context/authContex";
import { TRPCError, initTRPC } from "@trpc/server";
import { useContext } from "react";
import { CreateContextOptions } from "vm";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
const t = initTRPC.create();
const middleware = t.middleware;
const isAuth = middleware((opts) => {
  // const user = useContext(AuthContext);
  // if (!user) {
  //   throw new TRPCError({ code: "UNAUTHORIZED" });
  // }
  const userId = "1";
  return opts.next({
    ctx: {
      userId,
      // s3: s3,
    },
  });
});

// ...
// const createInnerTRPCContext = (_opts: CreateContextOptions) => {
//   return { s3 };
// };
// // ...
// export const createTRPCContext = (_opts: CreateNextContextOptions) => {
//   return createInnerTRPCContext({});
// };
export const router = t.router;
export const publicProcedure = t.procedure;
export const privateProcedure = t.procedure.use(isAuth);
// export const privateProcedure = t.procedure.use(isAuth);
