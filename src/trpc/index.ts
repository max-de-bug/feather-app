import { db } from "@/db";
import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "./trpc";

type User = {
  id: string;
  email: string;
};

export const appRouter = router({
  authCallback: publicProcedure.query<User>(async (user) => {
    if (!user.id || !user.email) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    const dbUser = await db.user.findFirst({
      where: {
        id: user.id,
      },
    });
    if (!dbUser) {
      const newUser = await db.user.create({
        data: {
          id: user.id,
          email: user.email,
        },
      });
      return newUser; // Return the created user
    }

    return dbUser; // Return the found user
  }),
});

export type AppRouter = typeof appRouter;
