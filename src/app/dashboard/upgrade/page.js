'use client';
import { usePaddle } from "@/app/PaddleProvider";
import React, { useState } from "react";
import { useUser, SignInButton } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

export default function UpgradePlans() {

// ✅ Professional Tab Title
  React.useEffect(() => {
    document.title = "Upgrade Plan | AI PDF Note Taker";
  }, []);

  const paddle = usePaddle();
  const { user, isSignedIn } = useUser();
  const [loading, setLoading] = useState(false);

  // Convex query to get the current plan
  const userPlan = useQuery(api.user.GetUserPlan, 
    user?.primaryEmailAddress?.emailAddress 
      ? { email: user.primaryEmailAddress.emailAddress } 
      : "skip"
  );

  const isUnlimited = userPlan === "unlimited";

  const handleCheckout = async () => {
    if (!paddle || !user) return;
    setLoading(true);
    
    paddle.Checkout.open({
      settings: { displayMode: "overlay", theme: "light" },
      items: [{ priceId: "pri_01kka5wgc47wxwe46zs9tg8j0f", quantity: 1 }],
      customerEmail: user.primaryEmailAddress.emailAddress,
    });

    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="px-5 py-10">
      <h2 className="font-bold text-3xl text-center">Pricing Plans</h2>
      <p className="text-center text-gray-500 mt-2">Upgrade to unlock the full potential of AI PDF Note Taker</p>
      
      <div className="mx-auto max-w-4xl mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Pro Plan Card */}
        <div className={`p-8 border-2 rounded-3xl shadow-lg relative flex flex-col ${isUnlimited ? 'border-green-500 bg-green-50/30' : 'border-blue-600'}`}>
          {isUnlimited && (
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-1 rounded-full text-xs font-bold shadow-md">
              ACTIVE PLAN
            </span>
          )}
          
          <div className="text-center">
            <h2 className="text-xl font-bold">Unlimited Plan</h2>
            <p className="mt-4">
              <span className="text-4xl font-extrabold">$9.99</span>
              <span className="text-gray-500 font-medium"> / One Time</span>
            </p>
          </div>

          {/* Points for Unlimited Plan */}
          <ul className="mt-8 space-y-4 flex-grow">
            {["Unlimited PDF Uploads", "Unlimited AI Notes Taking", "Priority Email Support", "Help Center Access"].map((item, idx) => (
              <li key={idx} className="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-5 text-blue-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                <span className="text-gray-700 font-medium">{item}</span>
              </li>
            ))}
          </ul>
          
          <div className="mt-8">
            {!isSignedIn ? (
              <SignInButton mode="modal">
                <button className="w-full bg-slate-800 text-white py-3 rounded-xl font-semibold hover:bg-slate-900 transition-all">
                  Log in to Upgrade
                </button>
              </SignInButton>
            ) : isUnlimited ? (
              <button 
                disabled
                className="w-full bg-green-600 text-white py-3 rounded-xl font-bold cursor-default shadow-sm"
              >
                Active Plan
              </button>
            ) : (
              <button 
                onClick={handleCheckout}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:bg-gray-300 transition-all"
              >
                {loading ? "Opening Checkout..." : "Get Started"}
              </button>
            )}
          </div>
        </div>

        {/* Free Plan Card */}
        <div className="p-8 border border-gray-200 rounded-3xl shadow-sm flex flex-col bg-white">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900">Free Plan</h2>
            <p className="mt-4">
              <span className="text-4xl font-extrabold">$0</span>
              <span className="text-gray-500 font-medium"> / month</span>
            </p>
          </div>

          {/* Points for Free Plan */}
          <ul className="mt-8 space-y-4 flex-grow">
            {["5 PDF Uploads", "Unlimited AI Notes Taking", "Email Support", "Help Center Access"].map((item, idx) => (
              <li key={idx} className="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-5 text-gray-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                <span className="text-gray-600">{item}</span>
              </li>
            ))}
          </ul>

          <button 
            disabled
            className="mt-8 w-full border border-gray-200 py-3 rounded-xl font-semibold text-gray-400 bg-gray-50"
          >
            {isUnlimited ? "Previous Plan" : "Current Plan"}
          </button>
        </div>

      </div>
    </div>
  );
}