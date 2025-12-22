import React from "react";
import Image from "next/image";

import { Skeleton } from "@/components/ui/skeleton";
import { LiveBadge } from "@/components/live-badge";
import { UserAvatar } from "@/components/user-avatar";

export function Thumbnail({
  src,
  fallback,
  isLive,
  username,
}: {
  src: string | null;
  fallback: string;
  isLive: boolean;
  username: string;
}) {
  let content;

  if (!src) {
    content = (
      <div className="bg-gradient-to-br from-[#26262c] to-[#1a1a1d] flex flex-col items-center justify-center gap-y-4 h-full w-full transition-transform duration-300 group-hover:translate-x-2 group-hover:-translate-y-2 rounded-md">
        <UserAvatar
          size="lg"
          showBadge
          username={username}
          imageUrl={fallback}
          isLive={isLive}
        />
        {!isLive && (
          <span className="text-[#adadb8] text-xs font-medium">Offline</span>
        )}
      </div>
    );
  } else {
    content = (
      <Image
        src={src}
        fill
        alt="Thumbnail"
        className="object-cover transition-transform duration-300 group-hover:translate-x-2 group-hover:-translate-y-2 rounded-md"
      />
    );
  }

  return (
    <div className="group aspect-video relative rounded-md cursor-pointer overflow-hidden">
      {/* Purple background that shows on hover */}
      <div className="rounded-md absolute inset-0 bg-gradient-to-r from-[#9147ff] to-[#bf94ff] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      {content}
      
      {/* Live badge */}
      {isLive && (
        <div className="absolute top-2 left-2 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform duration-300 z-10">
          <LiveBadge />
        </div>
      )}
      
      {/* Stream duration or uptime indicator */}
      {isLive && (
        <div className="absolute top-2 right-2 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform duration-300 z-10">
          <div className="bg-black/70 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] font-medium text-white flex items-center gap-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#eb0400] animate-pulse" />
            LIVE
          </div>
        </div>
      )}
      
      {/* Hover overlay with gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md z-[5] pointer-events-none" />
    </div>
  );
}

export function ThumbnailSkeleton() {
  return (
    <div className="group aspect-video relative rounded-md cursor-pointer overflow-hidden">
      <Skeleton className="h-full w-full bg-[#35353b]" />
    </div>
  );
}
