import React from "react";
import Link from "next/link";
import { User } from "@prisma/client";

import { Thumbnail, ThumbnailSkeleton } from "@/components/thumbnail";
import { UserAvatar, UserAvatarSkeleton } from "@/components/user-avatar";
import { Skeleton } from "@/components/ui/skeleton";

export function ResultCard({
  data,
}: {
  data: {
    user: User;
    isLive: boolean;
    name: string;
    thumbnailUrl: string | null;
  };
}) {
  return (
    <Link href={`/${data.user.username}`}>
      <div className="group h-full w-full space-y-3 p-1 hover:bg-[#26262c]/50 rounded-lg transition-colors duration-200">
        <Thumbnail
          src={data.thumbnailUrl}
          fallback={data.user.imageUrl}
          isLive={data.isLive}
          username={data.user.username}
        />
        <div className="flex gap-x-3 px-1">
          <UserAvatar
            username={data.user.username}
            imageUrl={data.user.imageUrl}
            isLive={data.isLive}
          />
          <div className="flex flex-col overflow-hidden min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white group-hover:text-[#bf94ff] transition-colors duration-200">
              {data.name}
            </p>
            <p className="text-[#adadb8] text-sm truncate hover:text-[#dedee3] transition-colors cursor-pointer">
              {data.user.username}
            </p>
            {data.isLive && (
              <div className="mt-1 flex items-center gap-x-1">
                <span className="text-xs text-[#adadb8] bg-[#26262c] px-1.5 py-0.5 rounded">
                  Just Chatting
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export function ResultCardSkeleton() {
  return (
    <div className="h-full w-full space-y-3 p-1">
      <ThumbnailSkeleton />
      <div className="flex gap-x-3 px-1">
        <UserAvatarSkeleton />
        <div className="flex flex-col gap-y-2 flex-1">
          <Skeleton className="h-4 w-3/4 bg-[#35353b]" />
          <Skeleton className="h-3 w-1/2 bg-[#35353b]" />
        </div>
      </div>
    </div>
  );
}
