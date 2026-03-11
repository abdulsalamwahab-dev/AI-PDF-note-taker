'use client'

import { useUser } from '@clerk/nextjs'
import React, { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import Image from "next/image";
import Link from 'next/link';
import { api } from '../../../convex/_generated/api'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function WorkspacePage() {
  const { user } = useUser()

  React.useEffect(() => {
    document.title = "Dashboard | AI PDF Note Taker";
  }, []);

  // ✅ Fetch user's PDF files
  const fileList = useQuery(
    api.fileStorage.GetUserFiles,
    user ? { userEmail: user.primaryEmailAddress.emailAddress } : undefined
  )

  // ✅ Mutation to delete a file
  const deleteFile = useMutation(api.fileStorage.deleteFile)

  // State for delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [fileToDelete, setFileToDelete] = useState(null)

  // Open delete confirmation dialog
  const confirmDelete = (file) => {
    setFileToDelete(file)
    setDeleteDialogOpen(true)
  }

  // Handle deletion
  const handleDelete = async () => {
    if (!fileToDelete) return
    try {
      await deleteFile({ _id: fileToDelete._id }) // use Convex _id
      toast.success(`Deleted "${fileToDelete.fileName}" successfully!`)
    } catch (err) {
      console.error("Failed to delete file:", err)
      toast.error(`Failed to delete "${fileToDelete.fileName}"`)
    } finally {
      setFileToDelete(null)
      setDeleteDialogOpen(false)
    }
  }

  return (
  <div className="px-5">
  <h2 className="font-medium text-3xl">Workspace</h2>

  {/* PDF Grid */}
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 mt-5">
    {fileList === undefined ? (
      // State 1: Loading
      Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex p-5 shadow-md rounded-md flex-col items-center justify-center border animate-pulse bg-gray-100 h-32"
        >
          <div className="w-12 h-12 bg-gray-300 rounded mb-3"></div>
          <div className="w-16 h-4 bg-gray-300 rounded"></div>
        </div>
      ))
    ) : fileList?.length > 0 ? (
      // State 2: Files found
      fileList.map((file) => (
        <div
          key={file._id}
          className="relative flex flex-col items-center p-5 shadow-md rounded-md border hover:scale-105 transition-all"
        >
          {/* Make whole card clickable */}
          <Link
            href={'/workspace/' + file.fileId}
            className="absolute inset-0 z-0"
          >
            <span className="sr-only">Open {file.fileName}</span>
          </Link>

          {/* Card content */}
          <div className="relative z-10 flex flex-col items-center pointer-events-none">
            <Image src="/pdf.png" alt="file" width={50} height={50} />
            <h2 className="mt-3 font-medium text-lg">{file.fileName}</h2>
          </div>

          {/* Delete button stays clickable */}
          <Button
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2 cursor-pointer z-20"
            onClick={() => confirmDelete(file)}
          >
            Delete
          </Button>
        </div>
      ))
    ) : (
      // State 3: No files uploaded
      <div className="col-span-full flex flex-col items-center justify-center py-10 opacity-50">
        <Image
          src="/pdf.png"
          alt="empty"
          width={80}
          height={80}
          className="grayscale"
        />
        <p className="mt-4 text-xl font-medium">No PDFs uploaded yet</p>
        <p className="text-sm">Upload your first file to get started!</p>
      </div>
    )}
  </div>

  {/* Delete Confirmation Dialog */}
  <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Delete PDF</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete <strong>{fileToDelete?.fileName}</strong>? This action cannot be undone.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter className="flex gap-2">
        <DialogClose asChild>
          <Button variant="secondary">Cancel</Button>
        </DialogClose>
        <Button variant="destructive" onClick={handleDelete}>
          Delete
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</div>
  )
}