"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut, User, LayoutDashboard } from "lucide-react";
import Link from "next/link";

export function UserNav() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center space-x-2">
        <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        {session.user?.image ? (
          <img
            src={session.user.image}
            alt={session.user.name ?? "User"}
            className="h-8 w-8 rounded-full"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
            <User className="h-4 w-4" />
          </div>
        )}
        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {session.user?.name ?? "User"}
        </span>
      </div>
      
      <Link href="/dashboard">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center space-x-2 border-white/50 text-black hover:text-white hover:bg-black"
        >
          <LayoutDashboard className="h-4 w-4" />
          <span>Dashboard</span>
        </Button>
      </Link>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => signOut()}
        className="flex items-center space-x-2 border-white/50 text-black hover:text-white hover:bg-black"
      >
        <LogOut className="h-4 w-4" />
        <span>Sign out</span>
      </Button>
    </div>
  );
}
