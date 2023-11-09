import { db } from "@/db";
import { TRPCError } from "@trpc/server";
import { privateProcedure, publicProcedure, router } from "./trpc";
import { useContext } from "react";
import { AuthContext } from "@/app/context/authContex"; // Make sure this path is correct
import { z } from "zod";

type User = {
  id: string;
  email: string;
};

// const user = useContext(AuthContext); // Make sure you are using useContext within a component

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
  // registerUser: publicProcedure.mutation<User>(async ({ ctx, input }) => {
  //   // Here you can register the user with the provided email and password
  //   const { email, password } = input;
  // }),
  getUserFiles: privateProcedure.query(async ({ ctx }) => {
    const { userId } = ctx;

    return await db.file.findMany({
      where: {
        userId: "1",
      },
    });
  }),
  deleteFile: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async (ctx) => {
      const { userId } = ctx;
      const file = await db.file.findFirst({
        where: {
          id: input.id,
          userId,
        },
      });
      if (!file) throw new TRPCError({ code: "NOT_FOUND" });
      await db.file.delete({
        where: {
          id: input.id,
        },
      });
      return file;
    }),
});
export type AppRouter = typeof appRouter;
