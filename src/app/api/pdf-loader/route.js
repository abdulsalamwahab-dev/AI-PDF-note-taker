import { NextResponse } from "next/server";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import fs from "fs";
import path from "path";

export async function GET(req) {
  try {
    // 🍼 Step 1: URL se pdfUrl nikaalo
    const { searchParams } = new URL(req.url);
    const pdfUrl = searchParams.get("pdfUrl");
    if (!pdfUrl) {
      return NextResponse.json(
        { error: "pdfUrl is missing" }, 
        { status: 400 }
      );
    }

    // 🍼 Step 2: Convex storage se PDF fetch karo
    const response = await fetch(pdfUrl); //pdf download karne ke liye fetch API ka use kiya hai, ye URL hume Convex storage se milta hai jab hum file upload karte hain, is URL se hum file ko read kar sakte hain
    if (!response.ok) throw new Error("Failed to fetch PDF");

    const arrayBuffer = await response.arrayBuffer(); //binary data ko read karne ke liye arrayBuffer method ka use kiya hai, ye method hume PDF file ke content ko binary format mein deta hai, jise hum aage process kar sakte hain

    // 🍼 Step 3: Temp file save karo server pe 
    const filePath = path.join(process.cwd(), "temp.pdf"); //ye line temp.pdf file ka path banati hai, ye file humare server ke current working directory mein create hogi, is file mein hum PDF ka content save karenge taaki usse load karke text extract kar sake
    fs.writeFileSync(filePath, Buffer.from(arrayBuffer)); //ye line temp.pdf file mein PDF ka content save karti hai, Buffer.from method ka use karke hum arrayBuffer ko binary format mein convert karte hain, jise writeFileSync method ke through file system mein likha jata hai, isse hum PDF file ko load karke uska text extract kar sakte hain

    // 🍼 Step 4: PDF load karo
    const loader = new PDFLoader(filePath); //ye pdf ko text mein convert karta hai, PDFLoader class ka use karke hum temp.pdf file ko load karte hain, isse hume PDF ke andar ka text milta hai, jise hum aage split karke chunks mein divide kar sakte hain
    const docs = await loader.load(); //ye line PDFLoader ke load method ko call karti hai, jo PDF file ko read karke uska text extract karta hai, isse hume ek array milta hai jisme har element PDF ke ek page ka text hota hai, is text ko hum aage split karke chunks mein divide kar sakte hain

    // 🍼 Step 5: Text split karo
    const textSplitter = new RecursiveCharacterTextSplitter({ //ye text ko chunks mein divide karta hai, RecursiveCharacterTextSplitter class ka use karke hum PDF ke text ko chhote-chhote chunks mein divide karte hain, isse hum large text ko manageable pieces mein tod sakte hain, jise hum aage embeddings generate karne ke liye use kar sakte hain
      chunkSize: 100,//ye chunk size define karta hai, isse hum specify karte hain ki har chunk mein maximum kitne characters hone chahiye, isse hum ensure karte hain ki chunks zyada bade na ho jisse processing mein dikkat aaye, is example mein humne chunk size 100 characters rakha hai, aap apne use case ke hisab se isse adjust kar sakte hain
      chunkOverlap: 20, //ye chunk overlap define karta hai, isse hum specify karte hain ki consecutive chunks ke beech mein kitne characters overlap hone chahiye, isse hum ensure karte hain ki chunks ke beech mein thoda sa common text ho jisse context maintain rahe, is example mein humne chunk overlap 20 characters rakha hai, aap apne use case ke hisab se isse adjust kar sakte hain
    });

    const splitDocs = await textSplitter.splitDocuments(docs);

    // 🍼 Step 6: Sirf text array banao
    const textArray = splitDocs.map((doc) => doc.pageContent);

    // 🍼 Step 7: JSON return karo
    return NextResponse.json({ result: textArray });

  } catch (error) {
    console.error("FULL ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    // 🧹 Temp file delete karo
    const filePath = path.join(process.cwd(), "temp.pdf");
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
}