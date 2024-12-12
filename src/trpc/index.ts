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
import { getPineconeClient } from "@/app/lib/pinecone";
import { INFINITE_QUERY_LIMIT } from "@/config/infinite-query";
import { absoluteUrl } from "@/app/lib/utils";
import { getUserSubscriptionPlan } from "@/app/lib/stripe";
import { stripe } from "@/app/lib/stripe";
import { PLANS } from "@/config/stripe";

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
      const subscriptionPlan = await getUserSubscriptionPlan();
      const { isSubscribed } = subscriptionPlan;

      const maxFileSizeFreePlan = 1024 * 1024 * 4; // 4MB
      const maxFileSizeProPlan = 1024 * 1024 * 16; // 16MB
      const acceptedType = "pdf";
      if (size > maxFileSizeFreePlan) {
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

      const isFileExists = await db.file.findFirst({
        where: {
          key: key,
          userId,
        },
      });
      if (isFileExists) return;
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
        console.log(blob);

        // Attempt to load the PDF and handle errors
        let pageLevelDocs;
        try {
          pageLevelDocs = await loader.load();
        } catch (error) {
          console.error("Error loading PDF:", error);
          await db.file.update({
            data: {
              uploadStatus: "FAILED",
            },
            where: {
              id: newFile.id,
            },
          });
          return { signedURL, newFile, error: "Invalid PDF structure" }; // Return error information
        }
        // const pagesAmt = pageLevelDocs.length;
        // // const isProExceeded =
        // //   pagesAmt > PLANS.find((plan) => plan.name === "Pro")!.pagesPerPdf;
        // // const isFreeExceeded =
        // //   pagesAmt > PLANS.find((plan) => plan.name === "Free")!.pagesPerPdf;
        // //
        // {
        //   await db.file.update({
        //     data: {
        //       uploadStatus: "FAILED",
        //     },
        //     where: {
        //       id: newFile.id,
        //     },
        //   });
        // }
        // vectorize and index entire document
        const pinecone = await getPineconeClient();
        const pineconeIndex = pinecone.Index("feather");
        const embeddings = new OpenAIEmbeddings({
          openAIApiKey: process.env.OPEN_AI_KEY!,
        });
        await PineconeStore.fromDocuments(pageLevelDocs, embeddings, {
          namespace: newFile.id,
          pineconeIndex: pineconeIndex as any,
        });
        console.log("pinecone", PineconeStore);
        await db.file.update({
          data: {
            uploadStatus: "SUCCESS",
          },
          where: {
            id: newFile.id,
          },
        });
      } catch (error) {
        console.log(error);
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
  getFileMessages: privateProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
        fileId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { userId } = ctx;
      const { fileId, cursor } = input;
      const limit = input.limit ?? INFINITE_QUERY_LIMIT;
      const file = await db.file.findFirst({
        where: {
          id: fileId,
          userId,
        },
      });
      if (!file) throw new TRPCError({ code: "NOT_FOUND" });
      const messages = await db.message.findMany({
        take: limit + 1,
        where: {
          fileId,
        },
        orderBy: {
          createdAt: "desc",
        },
        cursor: cursor ? { id: cursor } : undefined,
        select: {
          id: true,
          isUserMessage: true,
          createdAt: true,
          text: true,
        },
      });
      let nextCursor: typeof cursor | undefined = undefined;
      if (messages.length > limit) {
        const nextItem = messages.pop();
        nextCursor = nextItem?.id;
      }
      return {
        messages,
        nextCursor,
      };
    }),
  createStripeSession: privateProcedure.mutation(async ({ ctx }) => {
    const { userId } = ctx;

    const billingUrl = absoluteUrl("/dashboard/billing");
    if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });
    const dbUser = await db.user.findFirst({
      where: {
        id: userId,
      },
    });
    if (!dbUser) throw new TRPCError({ code: "UNAUTHORIZED" });
    const subscriptionPlan = await getUserSubscriptionPlan();
    if (subscriptionPlan.isSubscribed && dbUser.stripeCustomerId) {
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: dbUser.stripeCustomerId,
        return_url: billingUrl,
      });
      return {
        url: stripeSession.url,
      };
    }
    const stripeSession = await stripe.checkout.sessions.create({
      success_url: billingUrl,
      cancel_url: billingUrl,
      payment_method_types: ["card", "paypal"],
      mode: "subscription",
      billing_address_collection: "auto",
      line_items: [
        {
          price: PLANS.find((plan) => plan.name === "Pro")?.price.priceIds.test,
          quantity: 1,
        },
      ],
      metadata: {
        userId: userId,
      },
    });

    return { url: stripeSession.url };
  }),
});
export type AppRouter = typeof appRouter;
