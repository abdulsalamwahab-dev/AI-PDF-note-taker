"use client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Layout, Shield } from "lucide-react";
import Image from "next/image";
import React from "react";
import UploadPdfDialog from "./UploadPdfDialog";
import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "../../../../convex/_generated/api";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { SheetClose } from "@/components/ui/sheet";
import { toast } from "sonner";

const Sidemainbar = ({ isMobile = false }) => {
  const { user, isSignedIn } = useUser();
  const pathname = usePathname();

  const fileList = useQuery(
    api.fileStorage.GetUserFiles,
    user?.primaryEmailAddress?.emailAddress
      ? { userEmail: user.primaryEmailAddress.emailAddress }
      : "skip"
  );

  const userPlan = useQuery(
    api.user.GetUserPlan,
    user?.primaryEmailAddress?.emailAddress
      ? { email: user.primaryEmailAddress.emailAddress }
      : "skip"
  );

  const isUnlimited = userPlan === "unlimited";
  const fileCount = fileList?.length ?? 0;
  const isMaxReached = !isUnlimited && fileCount >= 5;

  const NavLink = ({ href, children, icon: Icon, protectedLink = false }) => {
    const disabled = protectedLink && !isSignedIn;

    const linkClasses = `flex items-center gap-2 p-4 rounded-lg transition-colors w-full ${
      pathname === href
        ? "bg-slate-200 text-blue-700 font-semibold"
        : "hover:bg-slate-100"
    } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`;

    const content = (
      <Link
        href={disabled ? "#" : href}
        className={linkClasses}
        onClick={(e) => {
          if (disabled) {
            e.preventDefault();
            toast.error("Please login to access this feature");
          }
        }}
      >
        <Icon size={20} />
        <span>{children}</span>
      </Link>
    );

    if (isMobile) {
      return <SheetClose asChild>{content}</SheetClose>;
    }

    return content;
  };

  return (
    <div className="shadow-md p-7 flex flex-col h-full bg-white">
      <div className="flex flex-col gap-4">
        <Link href="/">
          <div className="flex items-center gap-3">
            <Image src="/logo.svg" alt="logo" width={30} height={30} />
            <span className="text-lg font-semibold text-black">
              AI PDF Note Taker
            </span>
          </div>
        </Link>

        <div className="mt-5">
          {!isSignedIn ? (
            <Button
              className="w-full opacity-50 cursor-not-allowed"
              onClick={() => toast.error("Please login to upload files")}
            >
              + Upload PDF File
            </Button>
          ) : (
            <UploadPdfDialog isMaxFile={isMaxReached}>
              <Button className="w-full" disabled={isMaxReached}>
                + Upload PDF File
              </Button>
            </UploadPdfDialog>
          )}
        </div>

        <nav className="flex flex-col gap-2 mt-5">
          <NavLink href="/dashboard" icon={Layout} protectedLink>
            Workspace
          </NavLink>

          <NavLink href="/dashboard/upgrade" icon={Shield}>
            Upgrade
          </NavLink>
        </nav>
      </div>

      <div className="mt-auto pt-6 border-t">
        {isSignedIn && !isUnlimited && (
          <>
            <Progress value={(fileCount / 5) * 100} className="h-2" />
            <p className="text-sm mt-2 font-medium text-black">
              {fileCount} out of 5 PDF uploaded
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Upgrade for unlimited access
            </p>
          </>
        )}

        {isSignedIn && isUnlimited && (
          <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold text-center">
            UNLIMITED PLAN ACTIVE
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidemainbar;