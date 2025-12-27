import { openai } from "@/app/lib/openai";
import { getPineconeClient } from "@/app/lib/pinecone";
import { SendMessageValidator } from "@/app/lib/validators/SendMessageValidator";
import { db } from "@/db";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { NextRequest } from "next/server";

import { OpenAIStream, StreamingTextResponse } from "ai";
export const POST = async (req: NextRequest) => {
  // endpoint for asking a question to a pdf file

  const body = await req.json();
  // const { user } = useContext(AuthContext);
  // if (!user) {
  //   redirect("/auth-callback?origin=dashboard");
  // return new Response("Unauthorized", {status: 401})

  // }
  const { fileId, message } = SendMessageValidator.parse(body);
  const file = db.file.findFirst({
    where: {
      id: fileId,
      userId: "1",
    },
  });

  if (!file) return new Response("Not found", { status: 404 });
  await db.message.create({
    data: {
      text: message,
      isUserMessage: true,
      userId: "1",
      fileId,
    },
  });
  // vectorize message

  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
  });
  const pinecone = await getPineconeClient();
  const pineconeIndex = pinecone.Index("feather");

  const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex: pineconeIndex as any,
    namespace: fileId,
  });
  const results = await vectorStore.similaritySearch(message, 4);
  const prevMessage = await db.message.findMany({
    where: {
      fileId,
    },
    orderBy: {
      createdAt: "asc",
    },
    take: 6,
  });
  const formattedPrevMessages = prevMessage.map((msg) => ({
    role: msg.isUserMessage ? ("user" as const) : ("assistant" as const),
    content: msg.text,
  }));
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    temperature: 0,
    stream: true,
    messages: [
      {
        role: "system",
        content:
          "Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format.",
      },
      {
        role: "user",
        content: `Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format. \nIf you don't know the answer, just say that you don't know, don't try to make up an answer.
        
  \n----------------\n
  
  PREVIOUS CONVERSATION:
  ${formattedPrevMessages.map((message) => {
    if (message.role === "user") return `User: ${message.content}\n`;
    return `Assistant: ${message.content}\n`;
  })}
  
  \n----------------\n
  
  CONTEXT:
  ${results.map((r) => r.pageContent).join("\n\n")}
  
  USER INPUT: ${message}`,
      },
    ],
  });
  const stream = OpenAIStream(response, {
    async onCompletion(completion) {
      await db.message.create({
        data: {
          text: completion,
          isUserMessage: false,
          fileId,
          userId: "1",
        },
      });
    },
  });
  return new StreamingTextResponse(stream);
};
