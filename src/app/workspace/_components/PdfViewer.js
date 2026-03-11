import React from 'react'

function PdfViewer({fileUrl}) {
  console.log("fileUrl:", fileUrl);
  
  return (
    <div>
     <iframe
        src={fileUrl+'#toolbar=0'} // hide toolbar for cleaner look
        title="PDF Viewer"
        width="100%"
        height="90vh"
        className='overflow-scroll h-[50vh] md:h-[90vh]'
      />
    </div>
  )
}

export default PdfViewer