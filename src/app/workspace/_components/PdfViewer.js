import React from "react";

function PdfViewer({ fileUrl }) {
  return (
    <iframe
      src={fileUrl + "#toolbar=0"}
      title="PDF Viewer"
      className="w-full h-full border-none"
    />
  );
}

export default PdfViewer;