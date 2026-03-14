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
import { toast } from "sonner";

function UploadPdfDialog({ children, isMaxFile }) {

  const generateUploadUrl = useMutation(api.fileStorage.generateUploadUrl);
  const addFileEntry = useMutation(api.fileStorage.addFileEntry);
  const getFileUrl = useMutation(api.fileStorage.getFileUrl);
  const embedDocument = useAction(api.myAction.ingest);

  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const { user } = useUser();

  const onFileSelect = (e) => {
    setFile(e.target.files[0]);
  };

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

      const postUrl = await generateUploadUrl();

      const response = await fetch(postUrl, {
        method: "POST",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      const { storageId } = await response.json();

      const fileId = uuidv4();

      const signedUrl = await getFileUrl({ storageId });

      await addFileEntry({
        fileId,
        storageId,
        fileName: fileName || file.name,
        fileUrl: signedUrl,
        createdBy: user.primaryEmailAddress.emailAddress,
      });

      await embedDocument({
        fileId,
        storageId,
      });

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

      {/* RESPONSIVE FIX */}
      <DialogContent className="w-[95%] max-w-md">

        <DialogHeader>
          <DialogTitle>Upload PDF File</DialogTitle>

          <DialogDescription asChild>

            <div className="mt-5">

              <h2 className="mb-2">Select a PDF file to upload</h2>

              {/* FILE INPUT FIX */}
              <div className="flex flex-col gap-2 p-3 rounded-md border border-gray-300 w-full overflow-hidden">

                <input
                  type="file"
                  accept="application/pdf"
                  onChange={onFileSelect}
                  className="
                  w-full
                  cursor-pointer
                  text-sm text-gray-500
                  file:cursor-pointer
                  file:mr-2
                  file:py-2
                  file:px-3
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
                  className="mt-2 w-full"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                />
              </div>

            </div>

          </DialogDescription>
        </DialogHeader>

        {/* BUTTONS RESPONSIVE */}
        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">

          <DialogClose asChild>
            <Button variant="secondary" className="p-4 w-full sm:w-auto">
              Close
            </Button>
          </DialogClose>

          <Button onClick={onUpload} disabled={loading} className="w-full sm:w-auto">
            {loading ? <Loader2Icon className="animate-spin" /> : "Upload"}
          </Button>

        </DialogFooter>

      </DialogContent>

    </Dialog>
  );
}

export default UploadPdfDialog;