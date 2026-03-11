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
    // Dynamically update the browser tab title to the PDF name
    if (fileInfo?.fileName) {
      document.title = `${fileInfo.fileName} | AI PDF Note Taker`;
    }
  }, [fileInfo]);
  return (
    <div className="flex flex-col h-screen gap-5 mb-4">
      {/* Header with Save button */}
      <WorkspaceHeader 
        filename={fileInfo?.fileName || "Unnamed File"} 
        onSave={() => editorRef.current?.save()} 
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 flex-1 overflow-hidden">
        <div className="h-full">
          {/* Text Editor with ref */}
          <TextEditor fileId={fileId} ref={editorRef} />
        </div>

        <div className="h-full overflow-scroll md:p-0 p-2">
          {/* PDF Viewer */}
          {fileInfo ? (
            <PdfViewer fileUrl={fileInfo.fileUrl} />
          ) : (
            <p className="text-center">Loading PDF...</p>
          )}
        </div>
      </div>
    </div>
  );
}