"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAction, useMutation } from "convex/react";
import { Loader2Icon } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import { v4 as uuidv4 } from "uuid";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import { toast } from "sonner";

function UploadPdfDialog({ children , isMaxFile }) {
  const generateUploadUrl = useMutation(api.fileStorage.generateUploadUrl); //convex mein file upload karne k liye URL deta hai convex 
  const addFileEntry = useMutation(api.fileStorage.addFileEntry);
  const getFileUrl = useMutation(api.fileStorage.getFileUrl); //Storage ke andar wali file ka dekhne wala link dena.
  const embedDocument = useAction(api.myAction.ingest);

  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { user } = useUser();

  const onFileSelect = (e) => setFile(e.target.files[0]); 

  const onUpload = async () => {
   if (!file) {
      toast.error("⚠️ Please select a PDF file first!");
      return;
    }
    if (!user?.primaryEmailAddress?.emailAddress) {
      toast.error("⚠️ User not logged in");
      return;
    }

    setLoading(true);

    try {
      // 1️⃣ Generate Convex upload URL
      const postUrl = await generateUploadUrl(); //file upload karne k liye convex se url liya

      // 2️⃣ Upload PDF to Convex
      const response = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await response.json(); //upload karne bad convex se storageId milta hai jisse hum file ko identify kar sakte hain
      console.log("File uploaded to Convex storage with ID:", storageId);
      const fileId = uuidv4(); //unique file id generate karne ke liye uuid library ka use kiya hai, ye fileId hum Convex database mein store karenge taaki future reference ke liye use kar sake
      const signedUrl = await getFileUrl({ storageId }); //ye signedUrl hume Convex storage ke andar wali file ko access karne ke liye milta hai, is URL se hum file ko read kar sakte hain

      // 3️⃣ Save metadata in Convex
      await addFileEntry({
        fileId,
        storageId,
        fileName: fileName || "Untitled File",
        fileUrl: signedUrl,
        createdBy: user.primaryEmailAddress.emailAddress,
      });

      // 4️⃣ Fetch chunks for console log
      const apiResp = await axios.get("/api/pdf-loader?pdfUrl=" + signedUrl); //server se PDF ke chunks lene ke liye API call kiya hai, ye API humne Next.js ke andar banaya hai jo PDF ko read karke uske text chunks return karta hai
      apiResp.data.result.forEach((chunk, i) =>
        console.log(`${i + 1}: ${chunk}`)
      );

      // 5️⃣ Create embeddings via Convex backend
      await embedDocument({ fileId, storageId });
      // ✅ Toast success with icon
      toast.success(`📄 File "${fileName || file.name}" uploaded successfully!`);
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error(`❌ Upload failed: ${err.message || "Unknown error"}`);
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
   <Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger asChild>
    <Button
      onClick={() => setOpen(true)}
      disabled={isMaxFile}
      className="w-full cursor-pointer"
    >
      + Upload PDF File
    </Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Upload PDF File</DialogTitle>
      <DialogDescription asChild>
        <div className="mt-5">
          <h2 className="mb-2">Select a PDF file to upload</h2>
          <div className="gap-2 p-3 rounded-md border border-gray-300">
            <input
              type="file"
              accept="application/pdf"
              onChange={onFileSelect}
              className="
                cursor-pointer
                text-sm text-gray-500
                file:cursor-pointer
                file:mr-4
                file:py-2
                file:px-4
                file:rounded-md
                file:border
                file:border-gray-300
                file:text-sm
                file:font-semibold
                file:bg-white
                file:text-gray-700
                hover:file:bg-gray-100
              "
            />
          </div>
          <div className="mt-3">
            <label>File Name *</label>
            <Input
              placeholder="Enter file name"
              className="mt-2"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
            />
          </div>
        </div>
      </DialogDescription>
    </DialogHeader>
    <DialogFooter className="sm:justify-end">
      <DialogClose asChild>
        <Button variant="secondary" className="p-4">
          Close
        </Button>
      </DialogClose>
      <Button onClick={onUpload} disabled={loading}>
        {loading ? <Loader2Icon className="animate-spin" /> : "Upload"}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
  );
}

export default UploadPdfDialog;