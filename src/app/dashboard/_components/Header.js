// 'use client'
// import { UserButton, useUser } from '@clerk/nextjs'
// import React from 'react'

// const Header = () => {
//   const {user} = useUser()
//   return (
//     <div className="flex items-center justify-end shadow-md p-5">
//         {user ? (
//     <UserButton />
//   ) : (
//     <>
//       <a href="/sign-in" className="text-red-500 font-semibold hover:underline">Sign In</a>
//       <a href="/sign-up" className="ml-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">Sign Up</a>
//     </>
//   )}
//     </div>
//   )
// }

// export default Header
"use client";
import { UserButton } from "@clerk/nextjs";
import React from "react";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden"; // Install this if missing: npm install @radix-ui/react-visually-hidden
import Sidemainbar from "./Sidemainbar";

const Header = () => {
  return (
    <div className="flex justify-between items-center p-5 shadow-sm bg-white border-b sticky top-0 z-30 w-full">
      <div className="md:hidden flex items-center">
        <Sheet>
          <SheetTrigger asChild>
            <button className="p-1 outline-none">
              <Menu size={30} className="text-slate-700 cursor-pointer" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[260px] border-none">
            <VisuallyHidden.Root>
              <SheetTitle>Navigation Menu</SheetTitle>
            </VisuallyHidden.Root>
            <Sidemainbar isMobile={true} /> {/* :point_left: Pass the prop here */}
          </SheetContent>
        </Sheet>
      </div>

      <div className="hidden md:block"></div>

      <div className="flex items-center gap-2">
        <UserButton afterSignOutUrl="/" />
      </div>
    </div>
  );
};

export default Header;