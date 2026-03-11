// "use client";
// import React, { useEffect } from "react";
// import Sidebar from "./_components/Sidebar";
// import Header from "./_components/Header";

// const DashboardLayout = ({ children }) => {

//   useEffect(() => {
//     window.scrollTo(0, 0);
//   }, []);

//   return (
//     <div className="min-h-screen grid grid-cols-1 md:grid-cols-[260px_1fr]">

//       {/* Sidebar */}
//       <div className="bg-white border-r">
//         <Sidebar />
//       </div>

//       {/* Workspace */}
//       <div className="flex flex-col">

//         {/* Header only visible on tablet & desktop */}
//         <div className="hidden md:block">
//           <Header />
//         </div>

//         <main className="p-5 md:p-10 bg-gray-50 flex-1">
//           {children}
//         </main>

//       </div>

//     </div>
//   );
// };

// export default DashboardLayout;
"use client";
import React from "react";
import Sidemainbar from "./_components/Sidemainbar";
import Header from "./_components/Header";

const DashboardLayout = ({ children }) => {
  return (
    <div className="min-h-screen relative">
      <div className="hidden md:block md:w-[260px] md:fixed md:h-full bg-white border-r z-20">
        <Sidemainbar /> {/* 👈 No prop needed here, defaults to false */}
      </div>
      {/* Main Content: Adjusts margin on desktop only */}
      <div className="flex flex-col min-h-screen md:ml-[260px]">
        <Header />
        <main className="p-5 md:p-10 bg-gray-50 flex-1">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
