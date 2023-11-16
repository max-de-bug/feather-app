import { db } from "@/db";
import { TRPCError } from "@trpc/server";
import { privateProcedure, publicProcedure, router } from "./trpc";
import { useContext } from "react";
import { AuthContext } from "@/app/context/authContex"; // Make sure this path is correct
import { z } from "zod";
import S3 from "aws-sdk/clients/s3";

import { randomUUID } from "crypto";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3({
  apiVersion: "2006-03-01",
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.SECRET_KEY,
  region: process.env.REGION,
  signatureVersion: "v4",
});

type User = {
  id: string;
  email: string;
};

// const user = useContext(AuthContext); // Make sure you are using useContext within a component

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
  // registerUser: publicProcedure.mutation<User>(async ({ ctx, input }) => {
  //   // Here you can register the user with the provided email and password
  //   const { email, password } = input;
  // }),
  getUserFiles: privateProcedure.query(async ({ ctx }) => {
    const { userId } = ctx;

    return await db.file.findMany({
      where: {
        userId: userId,
      },
    });
  }),
  // uploadFile: privateProcedure.mutation(async (ctx) => {
  //   const ex = (req.query.fileType as string).split("/")[1]; // Use ctx.input
  //   const key = `${randomUUID()}.${ex}`;

  //   const s3Params = {
  //     Bucket: process.env.BUCKET_NAME,
  //     Key: key, // Corrected to 'Key' from 'key'
  //     Expires: 60,
  //     ContentType: `image/${ex}`,
  //   };
  //   const uploadUrl = await s3.getSignedUrl("putObject", s3Params);
  //   return {
  //     uploadUrl,
  //     key,
  //   };
  // }),
  uploadFile: privateProcedure
    .input(z.object({ key: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { key } = input;
      const s3 = new S3Client({
        region: process.env.REGION!,
        credentials: {
          accessKeyId: process.env.ACCESS_KEY!,
          secretAccessKey: process.env.SECRET_KEY!,
        },
      });

      const putObjectCommand = new PutObjectCommand({
        Bucket: process.env.BUCKET_NAME!,
        Key: "test.pdf",
      });
      const signedURL = await getSignedUrl(s3, putObjectCommand, {
        expiresIn: 60,
      });
      return signedURL;
    }),
  deleteFile: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
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
