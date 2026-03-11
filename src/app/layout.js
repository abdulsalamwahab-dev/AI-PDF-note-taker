import { Geist, Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";
import Provider from "./provider";
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from "sonner";
import PaddleProvider from "./PaddleProvider";

const outfit = Outfit({ subsets: ["latin"] })

// Professional SaaS Global Metadata
export const metadata = {
  title: {
    default: "AI PDF Note Taker | Smart AI Workspace",
    template: "%s | AI PDF Note Taker"
  },
  description: "The ultimate AI-powered workspace for all users. Upload PDFs, take smart notes, and chat with your documents.",
  icons: {
    icon: "/logo.svg",
  },
  // Adding openGraph makes sharing your link look professional on LinkedIn/Twitter
  openGraph: {
    title: "AI PDF Note Taker",
    description: "Intelligent PDF note-taking for technical professionals.",
    type: "website",
  }
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider 
      appearance={{
        layout: {
          unsafe_disableDevelopmentAndProductionSentry: true,
          logoPlacement: "none",
        },
        elements: {
          footer: "hidden", 
        }
      }}
    >
      <html lang="en">
        <body className={outfit.className}>
          <Provider>
            <PaddleProvider>
              {children}
            </PaddleProvider>
          </Provider>
          <Toaster position="bottom-left" richColors />
        </body>
      </html>
    </ClerkProvider>
  )
}