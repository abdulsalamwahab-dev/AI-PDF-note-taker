"use client";
import { Button } from "@/components/ui/button";
import { UserButton, useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import Image from "next/image";
import { api } from "../../convex/_generated/api";
import { useEffect } from "react";
import Link from "next/link";

export default function Home() {
  const { user } = useUser();
  const createUser = useMutation(api.user.createUser); 

  useEffect(() => {
    user && CheckUser();
  }, [user]);

  const CheckUser = async () => {
    const result = await createUser({
      email: user?.primaryEmailAddress?.emailAddress,
      imageUrl: user?.imageUrl,
      userName: user?.fullName,
    });
    console.log(result);
  }; 
  return (
   <div className="relative w-full min-h-screen flex flex-col overflow-hidden">

  <div className="absolute inset-0 -z-10">
  <Image
    src="/ai-bg.jpg"
    alt="background"
    fill
    priority
    sizes="100vw"
    className="object-cover opacity-40"
  />
</div>

  {/* Gradient Overlay */}
<div className="absolute inset-0 -z-10 bg-gradient-to-br from-white/60 via-white/50 to-white/60"></div>
      {/* Top Navbar */}
    <div className="shadow-md bg-white/80 backdrop-blur-md">
        <div className="p-4 flex justify-between items-center max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <Image src="/logo.svg" alt="logo" width={40} height={40} />
            <span className="text-xl font-bold text-gray-900">AI PDF Note Taker</span>
          </div>
          <div className="flex items-center gap-2">
            {user ? (
              <UserButton />
            ) : (
              <>
                <Link href="/sign-in" className="text-red-600 font-semibold hover:underline">
                  Sign In
                </Link>
                <Link href="/sign-up" className="ml-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Banner Content */}
      <div className="flex-1 flex flex-col justify-center items-center text-center px-4 sm:px-6 lg:px-8 relative z-10">
        <h1 className="text-6xl sm:text-7xl font-extrabold mb-6 text-gray-900 fadeIn">
          AI PDF Note Taker
        </h1>
        <p className="text-2xl sm:text-3xl mb-10 text-gray-700 fadeInDelay">
          AI-powered. Work smarter. Faster. Easier.
        </p>

        <div className="flex flex-wrap justify-center gap-6">
          <Link href={user ? "/dashboard" : "/sign-up"}>
            <div className="px-8 py-4 bg-red-600 text-white font-semibold rounded-lg shadow-lg buttonHover">
              {user ? "Go to Dashboard" : "Get Started Free"}
            </div>
          </Link>

          <Link href="/dashboard/upgrade">
            <div className="px-8 py-4 border-2 border-red-600 text-red-600 font-semibold rounded-lg buttonHover hover:bg-red-600 hover:text-white">
              View Pricing
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
