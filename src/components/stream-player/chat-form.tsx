"use client";

import React, { useState } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { ChatInfo } from "./chat-info";

export function ChatForm({
  value,
  isDelayed,
  isFollowersOnly,
  isFollowing,
  isHidden,
  onChange,
  onSubmit,
}: {
  onSubmit: () => void;
  onChange: (value: string) => void;
  value: string;
  isHidden: boolean;
  isFollowersOnly: boolean;
  isDelayed: boolean;
  isFollowing: boolean;
}) {
  const [isDelayBlocked, setIsDelayBlocked] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isFollowersOnlyAndNotFollowing = isFollowersOnly && !isFollowing;
  const isDisabled =
    isHidden || isDelayBlocked || isFollowersOnlyAndNotFollowing;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!value || isDisabled) return;

    if (isDelayed && !isDelayBlocked) {
      setIsDelayBlocked(true);
      setTimeout(() => {
        setIsDelayBlocked(false);
        onSubmit();
      }, 3000);
    } else {
      onSubmit();
    }
  };

  if (isHidden) {
    return null;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-y-3 p-3 bg-[#18181b] border-t border-[#2f2f35]"
    >
      <div className="w-full">
        <ChatInfo isDelayed={isDelayed} isFollowersOnly={isFollowersOnly} />
        <div className={cn(
          "rounded-md border-2 transition-colors duration-200",
          isFocused ? "border-[#9147ff]" : "border-transparent",
          (isFollowersOnly || isDelayed) && "rounded-t-none"
        )}>
          <input
            onChange={(e) => onChange(e.target.value)}
            value={value}
            disabled={isDisabled}
            placeholder="Send a message"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={cn(
              "w-full h-10 px-3 bg-[#3d3d40] rounded-md text-sm text-white placeholder:text-[#adadb8] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed",
              (isFollowersOnly || isDelayed) && "rounded-t-none"
            )}
          />
        </div>
      </div>
      <div className="flex items-center justify-end gap-x-2">
        <Button 
          type="submit" 
          size="sm" 
          disabled={isDisabled || !value}
          className="bg-[#9147ff] hover:bg-[#772ce8] text-white font-semibold px-4 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          Chat
        </Button>
      </div>
    </form>
  );
}

export function ChatFormSkeleton() {
  return (
    <div className="flex flex-col gap-y-3 p-3 bg-[#18181b] border-t border-[#2f2f35]">
      <Skeleton className="w-full h-10 bg-[#35353b]" />
      <div className="flex items-center justify-end gap-x-2">
        <Skeleton className="h-8 w-16 bg-[#35353b]" />
      </div>
    </div>
  );
}
