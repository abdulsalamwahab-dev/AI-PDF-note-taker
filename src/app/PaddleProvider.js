'use client';
import { useEffect, useState, createContext, useContext } from "react";
import { initializePaddle } from "@paddle/paddle-js";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";

const PaddleContext = createContext(null);
export function usePaddle() { return useContext(PaddleContext); }

export default function PaddleProvider({ children }) {
  const [paddle, setPaddle] = useState(null);
  const { user } = useUser();
  const upgradePlan = useMutation(api.user.upgradePlan);

  useEffect(() => {
    async function setup() {
      const instance = await initializePaddle({
        token: "test_7be3136c3fa90be7ed17469f95f",
        environment: "sandbox",
        eventCallback: async (event) => {
          // Trigger mutation only when payment is 100% finished
          if (event.name === "checkout.completed" && user?.primaryEmailAddress?.emailAddress) {
            await upgradePlan({ email: user.primaryEmailAddress.emailAddress });
            toast.success('🎉Plan upgraded successfully!')
          }
        }
      });
      setPaddle(instance);
    }
    setup();
  }, [user, upgradePlan]);

  return (
    <PaddleContext.Provider value={paddle}>
      {children}
    </PaddleContext.Provider>
  );
}