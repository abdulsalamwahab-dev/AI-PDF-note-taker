"use client";
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
<div className="relative min-h-screen overflow-hidden">

  {/* Gradient background */}
  <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-50 via-white to-indigo-100"></div>

  {/* Glow */}
  <div className="absolute top-40 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-blue-400/20 blur-[120px] rounded-full -z-10"></div>


      {/* Navbar */}
      <div className="sticky top-0 bg-white border-b border-gray-200">
        <div className="p-4 flex justify-between items-center max-w-7xl mx-auto">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <Image src="/logo.svg" alt="logo" width={38} height={38} />
            <span className="text-lg font-semibold text-gray-900">
              AI PDF Note Taker
            </span>
          </div>

          {/* Auth */}
          <div className="flex items-center gap-5">
            {user ? (
              <UserButton />
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="text-gray-600 hover:text-red-600 font-medium transition"
                >
                  Sign In
                </Link>

                <Link
                  href="/sign-up"
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Hero */}
     {/* Hero Section */}
<div className="flex items-center justify-center min-h-[80vh] px-6">
  <div className="max-w-3xl text-center">

    {/* Tagline */}
    <div className="mb-6 inline-block text-sm bg-gray-100 text-gray-600 px-4 py-2 rounded-full">
      ⚡ AI Powered • Smart Notes • Instant Summaries
    </div>

    {/* Title */}
    <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-gray-900 leading-tight">
      Take Notes From PDFs
      <span className="block text-blue-600">
        Instantly With AI
      </span>
    </h1>

    {/* Subtitle */}
    <p className="mt-6 text-lg text-gray-600">
      Upload any PDF and let AI summarize, explain, and generate
      intelligent notes in seconds.
    </p>

    {/* Buttons */}
    <div className="mt-10 flex justify-center gap-6 flex-wrap">
      <Link href={user ? "/dashboard" : "/sign-up"}>
        <div className="px-8 py-3 bg-red-600 text-white font-semibold rounded-lg shadow hover:bg-red-700 transition">
          {user ? "Go to Dashboard" : "Get Started Free"}
        </div>
      </Link>

      <Link href="/dashboard/upgrade">
        <div className="px-8 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition bg-white">
          View Pricing
        </div>
      </Link>
    </div>

  </div>
</div>

    </div>
  );
}