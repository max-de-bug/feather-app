import { db } from "@/db";
import { TRPCError } from "@trpc/server";
import { privateProcedure, publicProcedure, router } from "./trpc";
import { useContext } from "react";
import { AuthContext } from "@/app/context/authContex"; // Make sure this path is correct

type User = {
  id: string;
  email: string;
};

const user = useContext(AuthContext); // Make sure you are using useContext within a component

export const appRouter = router({
  // authCallback: publicProcedure.query<User>(async (user) => {
  //   if (!user.id || !user.email) {
  //     throw new TRPCError({ code: "UNAUTHORIZED" });
  //   }
  //   const dbUser = await db.user.findFirst({
  //     where: {
  //       id: user.id,
  //     },
  //   });
  //   if (!dbUser) {
  //     const newUser = await db.user.create({
  //       data: {
  //         id: user.id,
  //         email: user.email,
  //       },
  //     });
  //     return newUser; // Return the created user
  //   }

  //   return dbUser; // Return the found user
  // }),
  // registerUser: publicProcedure.mutation<User>(
  //   async ({ ctx, input }) => {
  //     // Here you can register the user with the provided email and password
  //     const { email, password } = input;

  // 	}),
  getUserFiles: privateProcedure.query(async ({ ctx }) => {
    const { userId } = ctx;

    return await db.file.findMany({
      where: {
        userId,
      },
    });
  }),
});
export type AppRouter = typeof appRouter;
