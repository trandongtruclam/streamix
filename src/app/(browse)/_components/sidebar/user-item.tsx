"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSidebar } from "@/store/use-sidebar";
import { UserAvatar } from "@/components/user-avatar";
import { LiveBadge } from "@/components/live-badge";
import { Hint } from "@/components/hint";

export function UserItem({
  username,
  imageUrl,
  isLive,
}: {
  username: string;
  imageUrl: string;
  isLive?: boolean;
}) {
  const pathname = usePathname();

  const { collapsed } = useSidebar((state) => state);

  const href = username ? `/${username}` : null;
  const isActive = pathname === href;

  if (!href) return null;

  const content = (
    <Button
      asChild
      variant="ghost"
      className={cn(
        "w-full h-11 rounded-md transition-all duration-200",
        collapsed ? "justify-center px-2" : "justify-start px-2",
        isActive 
          ? "bg-[#9147ff]/20 text-white hover:bg-[#9147ff]/30" 
          : "text-[#dedee3] hover:bg-[#35353b] hover:text-white"
      )}
    >
      <Link href={href}>
        <div
          className={cn(
            "flex items-center w-full gap-x-3",
            collapsed && "justify-center"
          )}
        >
          <UserAvatar 
            imageUrl={imageUrl} 
            username={username} 
            isLive={isLive}
            size="default"
          />
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium">{username}</p>
                {isLive && (
                  <p className="text-xs text-[#9147ff]">Streaming</p>
                )}
              </div>
              {isLive && <LiveBadge className="ml-auto shrink-0" />}
            </>
          )}
        </div>
      </Link>
    </Button>
  );

  if (collapsed) {
    return (
      <li>
        <Hint label={username} side="right" asChild>
          {content}
        </Hint>
      </li>
    );
  }

  return <li>{content}</li>;
}

export function UserItemSkeleton() {
  return (
    <li className="flex items-center gap-x-3 px-2 py-2">
      <Skeleton className="min-h-[32px] min-w-[32px] rounded-full bg-[#35353b]" />
      <div className="flex-1 hidden lg:block">
        <Skeleton className="h-4 w-full bg-[#35353b]" />
      </div>
    </li>
  );
}
