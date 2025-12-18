"use client";

import React from "react";
import Link from "next/link";
import { LogOut, User } from "lucide-react";

import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function Actions() {
  const { user, isLoading, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center gap-x-3">
        <Skeleton className="h-8 w-16 bg-[#35353b]" />
        <Skeleton className="h-8 w-8 rounded-full bg-[#35353b]" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end gap-x-3">
      <Button
        size="sm"
        variant="ghost"
        className="text-[#dedee3] hover:text-white hover:bg-[#3d3d40] h-8 px-3 rounded-md transition-all duration-200"
        asChild
      >
        <Link href="/">
          <LogOut className="h-4 w-4 mr-2" />
          Exit
        </Link>
      </Button>
      {user && (
        <div className="relative group">
          <button className="flex items-center justify-center w-8 h-8 rounded-full overflow-hidden border-2 border-transparent hover:border-[#9147ff] transition-colors">
            {user.imageUrl ? (
              <img
                src={user.imageUrl}
                alt={user.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#9147ff] flex items-center justify-center text-white font-bold">
                {user.username[0].toUpperCase()}
              </div>
            )}
          </button>
          <div className="absolute right-0 top-full mt-2 w-48 bg-[#1f1f23] border border-[#35353b] rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            <div className="p-3 border-b border-[#35353b]">
              <p className="font-semibold text-white">{user.username}</p>
              <p className="text-xs text-[#adadb8]">{user.email}</p>
            </div>
            <div className="p-2">
              <Link
                href={`/u/${user.username}`}
                className="flex items-center gap-x-2 px-2 py-2 text-sm text-[#dedee3] hover:bg-[#35353b] rounded-md transition-colors"
              >
                <User className="h-4 w-4" />
                Profile
              </Link>
              <button
                onClick={() => logout()}
                className="w-full flex items-center gap-x-2 px-2 py-2 text-sm text-[#dedee3] hover:bg-[#35353b] rounded-md transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
