"use client";
import { useParams } from "next/navigation";
import React, { useEffect, useRef } from "react";
import WorkspaceHeader from "../_components/WorkspaceHeader";
import PdfViewer from "../_components/PdfViewer";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import TextEditor from "../_components/TextEditor";

export default function Workspace() {
  const { fileId } = useParams();
  const fileInfo = useQuery(api.fileStorage.GetFileRecord, { fileId });
  const editorRef = useRef(null);

  useEffect(() => {
    if (fileInfo?.fileName) {
      document.title = `${fileInfo.fileName} | AI PDF Note Taker`;
    }
  }, [fileInfo]);

  return (
   <div className="flex flex-col h-screen gap-2 md:gap-4">

      <WorkspaceHeader
        filename={fileInfo?.fileName || "Unnamed File"}
        onSave={() => editorRef.current?.save()}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 flex-1 gap-4 min-h-0 px-2 md:px-4">

        {/* EDITOR */}
        <div className="h-[50vh] md:h-full flex flex-col border rounded-lg overflow-hidden">
          <TextEditor fileId={fileId} ref={editorRef} />
        </div>

        {/* PDF */}
        <div className="h-[50vh] md:h-full border rounded-lg overflow-auto min-h-0">
          {fileInfo ? (
            <PdfViewer fileUrl={fileInfo.fileUrl} />
          ) : (
            <div className="flex items-center justify-center h-full">
              Loading PDF...
            </div>
          )}
        </div>

      </div>
    </div>
  );
}