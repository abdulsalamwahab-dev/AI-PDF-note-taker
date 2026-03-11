"use node";

import { action } from "./_generated/server";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import fs from "fs";
import path from "path";
import { ConvexVectorStore } from "@langchain/community/vectorstores/convex";
import { v } from "convex/values";

export const ingest = action({
  args: {
    storageId: v.id("_storage"),  // Convex storage ID
    fileId: v.string(),           // Unique file ID
  },
  handler: async (ctx, args) => {
    const apiKey = ctx.env?.GOOGLE_API_KEY;

    // 1️⃣ Get PDF from Convex storage
    const file = await ctx.storage.get(args.storageId);
    if (!file) throw new Error("File not found in storage");

    const filePath = path.join("/tmp", "temp.pdf");
    fs.writeFileSync(filePath, Buffer.from(await file.arrayBuffer()));

    // 2️⃣ Load PDF
    const loader = new PDFLoader(filePath);
    const docs = await loader.load();
    if (!docs.length) return [];

    // 3️⃣ Split text into chunks
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const splitDocs = await splitter.splitDocuments(docs);

    // 4️⃣ Generate embeddings
    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey,
      model: "gemini-embedding-001",
      taskType: TaskType.RETRIEVAL_DOCUMENT,
    });

    const texts = splitDocs.map(doc => doc.pageContent);

    // 5️⃣ Store embeddings in Convex with metadata as object
    await ConvexVectorStore.fromTexts(
      texts,
      texts.map(() => ({ fileId: args.fileId })), // store metadata as object
      embeddings,
      { ctx }
    );

    return texts; // return chunks
  },
});

// export const search = action({
//   args: {
//     query: v.string(),
//     fileId: v.string(), // filter by file
//   },
//   handler: async (ctx, args) => {
//     const apiKey = ctx.env?.GOOGLE_GENAI_API_KEY;

//     const vectorStore = new ConvexVectorStore(
//       new GoogleGenerativeAIEmbeddings({
//         apiKey,
//         model: "gemini-embedding-001",
//         taskType: TaskType.RETRIEVAL_DOCUMENT,
//       }),
//       { ctx }
//     );

//     // fetch top 5 results
//     const searchResults = await vectorStore.similaritySearch(args.query, 10);
//     console.log("Raw search results:", searchResults);

//     // filter by fileId
//     const filtered = searchResults.filter(q => q.metadata?.fileId === args.fileId);
//     console.log("Filtered results:", filtered);
    

//     return JSON.stringify(filtered);
//   },
// });
export const search = action({
  args: {
    query: v.string(),
    fileId: v.string(),
  },
   handler: async (ctx, args) => {
    const apiKey = ctx.env?.GOOGLE_API_KEY;

    const vectorStore = new ConvexVectorStore(
      new GoogleGenerativeAIEmbeddings({
        apiKey,
        model: "gemini-embedding-001",
        taskType: TaskType.RETRIEVAL_DOCUMENT,
      }),
      { ctx }
    );

    const searchResults = await vectorStore.similaritySearch(args.query, 10);

    console.log("Raw search results:", searchResults);

    const filtered = searchResults.filter(
      (doc) => String(doc.metadata?.fileId) === String(args.fileId)
    );

    console.log("Filtered results:", filtered);

    // 🔥 convert to plain JSON
    const cleanedResults = filtered.map((doc) => ({
      pageContent: doc.pageContent,
      metadata: doc.metadata,
    }));

    return cleanedResults;
  },
});