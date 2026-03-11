import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";

export async function POST(req) {
  try {
    const body = await req.json();
    const { storageId, fileId } = body;

    if (!storageId || !fileId) {
      return NextResponse.json(
        { error: "storageId and fileId are required" },
        { status: 400 }
      );
    }

    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

    console.log("Calling ingest with:", storageId, fileId);

    await convex.action(api.myAction.ingest, {
      storageId,
      fileId,
    });

    return NextResponse.json({
      success: true,
      message: "Embeddings generated successfully",
    });
  } catch (error) {
    console.error("PDF loader error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}