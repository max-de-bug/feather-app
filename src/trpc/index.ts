import { db } from "@/db";
import { TRPCError } from "@trpc/server";
import { privateProcedure, publicProcedure, router } from "./trpc";
import { useContext } from "react";
import { AuthContext } from "@/app/context/authContex"; // Make sure this path is correct
import { z } from "zod";
import S3 from "aws-sdk/clients/s3";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import crypto from "crypto";
import {
  PutObjectCommand,
  S3Client,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getPineconeClient, pinecone } from "@/app/lib/pinecone";

// const s3 = new S3({
//   apiVersion: "2006-03-01",
//   accessKeyId: process.env.ACCESS_KEY,
//   secretAccessKey: process.env.SECRET_KEY,
//   region: process.env.REGION,
//   signatureVersion: "v4",
// });

type User = {
  id: string;
  email: string;
};
const s3 = new S3Client({
  region: process.env.REGION!,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY!,
    secretAccessKey: process.env.SECRET_KEY!,
  },
});

const generateFileName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");
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
    .input(
      z.object({
        file: z.object({
          key: z.string(),
          name: z.string(),
          size: z.number(),
          checksum: z.string(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;
      const { key, name, size, checksum } = input.file;
      const maxFileSize = 1024 * 1024 * 4;
      const acceptedType = "pdf";
      if (size > maxFileSize) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      if (!key.includes(acceptedType)) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      // const s3 = new S3Client({
      //   region: process.env.REGION!,
      //   credentials: {
      //     accessKeyId: process.env.ACCESS_KEY!,
      //     secretAccessKey: process.env.SECRET_KEY!,
      //   },
      // });

      const putObjectCommand = new PutObjectCommand({
        Bucket: process.env.BUCKET_NAME!,
        Key: generateFileName(),
        ContentType: key,
        ContentLength: size,
        ChecksumSHA256: checksum,
        Metadata: {
          userId: userId,
        },
      });
      const signedURL = await getSignedUrl(s3, putObjectCommand, {
        expiresIn: 60,
      });
      // const file = await db.file.findFirst({
      //   where: {
      //     key: key,
      //     userId,
      //   },
      // });

      const newFile = await db.file.create({
        data: {
          key: key,
          name: name,
          userId: userId,
          uploadStatus: "PROCESSING",
          url: signedURL.split("?")[0],
        },
      });
      try {
        const response = await fetch(signedURL);
        const blob = await response.blob();
        const loader = new PDFLoader(blob);
        const pageLevelDocs = await loader.load();
        const pageAmt = pageLevelDocs.length;
        // vectorize and index entire document
        const pinecone = await getPineconeClient();
        const pineconeIndex = pinecone.index("feather");
        const embeddings = new OpenAIEmbeddings({
          openAIApiKey: process.env.OPEN_AI_KEY!,
        });
        await PineconeStore.fromDocuments(pageLevelDocs, embeddings, {
          pineconeIndex,
          namespace: newFile.id,
        });

        await db.file.update({
          data: {
            uploadStatus: "SUCCESS",
          },
          where: {
            id: newFile.id,
          },
        });
      } catch (error) {
        await db.file.update({
          data: {
            uploadStatus: "FAILED",
          },
          where: {
            id: newFile.id,
          },
        });
      }
      return { signedURL, newFile };
    }),
  deleteFile: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { userId } = ctx;
      const file = await db.file.findFirst({
        where: {
          id: input.id,
        },
      });

      if (!file) throw new TRPCError({ code: "NOT_FOUND" });
      await db.file.delete({
        where: {
          id: input.id,
        },
      });
      // const s3 = new S3Client({
      //   region: process.env.REGION!,
      //   credentials: {
      //     accessKeyId: process.env.ACCESS_KEY!,
      //     secretAccessKey: process.env.SECRET_KEY!,
      //   },
      // });
      if (file) {
        const url = file.url;
        const key = url.split("/").slice(-1)[0];
        console.log(key);
        const deleteParams = {
          Bucket: process.env.BUCKET_NAME!,
          Key: key,
        };
        await s3
          .send(new DeleteObjectCommand(deleteParams))
          .then((response) => console.log("Delete response:", response))
          .catch((error) => console.error("Delete error:", error));

        console.log("After delete operation");
      }

      return file;
    }),
  getFileUploadStatus: privateProcedure
    .input(z.object({ fileId: z.string() }))
    .query(async ({ input, ctx }) => {
      const file = await db.file.findFirst({
        where: {
          id: input.fileId,
          userId: ctx.userId,
        },
      });
      if (!file) return { status: "PENDING" as const };
      return { status: file.uploadStatus };
    }),
});
export type AppRouter = typeof appRouter;
