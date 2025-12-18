"use client";

import React from "react";
import { MessageSquare } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";

import { ChatToggle } from "./chat-toggle";
import { VariantToggle } from "./variant-toggle";

export function ChatHeader() {
  return (
    <div className="relative p-3 border-b border-[#2f2f35] bg-[#18181b]/95 backdrop-blur-sm">
      <div className="absolute left-2 top-1/2 -translate-y-1/2 hidden lg:block">
        <ChatToggle />
      </div>
      <div className="flex items-center justify-center gap-x-2">
        <MessageSquare className="h-4 w-4 text-[#9147ff]" />
        <p className="font-semibold text-white text-sm uppercase tracking-wide">
          Stream Chat
        </p>
      </div>
      <div className="absolute right-2 top-1/2 -translate-y-1/2">
        <VariantToggle />
      </div>
    </div>
  );
}

export function ChatHeaderSkeleton() {
  return (
    <div className="relative p-3 border-b border-[#2f2f35] bg-[#18181b] hidden md:block">
      <Skeleton className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 bg-[#35353b]" />
      <Skeleton className="h-5 w-28 mx-auto bg-[#35353b]" />
    </div>
  );
}
