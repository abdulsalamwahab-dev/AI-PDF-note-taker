// convex/fileStorage.js
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// 1️⃣ Generate temporary upload URL
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// 2️⃣ Add PDF entry including signed fileUrl
export const addFileEntry = mutation({
  args: {
    fileId: v.string(),
    storageId: v.string(),
    fileName: v.string(),
    fileUrl: v.string(), // required now
    createdBy: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("pdfFiles", {
      fileId: args.fileId,
      storageId: args.storageId,
      fileName: args.fileName,
      fileUrl: args.fileUrl, // insert the signed URL
      createdBy: args.createdBy,
    });
    return "inserted";
  },
});

// 3️⃣ Get a signed URL to view PDF
export const getFileUrl = mutation({
  args: { storageId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId); // temporary signed URL
  },
});

export const GetFileRecord = query({
  args: { fileId: v.string() },
  handler: async (ctx, args) => {
    const result = await ctx.db
      .query("pdfFiles")
      .filter((q) => q.eq(q.field("fileId"), args.fileId))
      .first();
    console.log(result);
    return result;
  },
});

export const GetUserFiles = query({
  args:{
    userEmail:v.optional(v.string())
  },
  handler: async (ctx, args) => {
     const result = await ctx.db.query('pdfFiles').filter((q) => q.eq(q.field('createdBy'), args.userEmail)).collect()
     return result
  }
})

// Delete a PDF 
export const deleteFile = mutation({
  args: { _id: v.string() },
  handler: async (ctx, { _id }) => {
    await ctx.db.delete("pdfFiles", _id);
    return "deleted";
  },
});