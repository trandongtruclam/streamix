import React from "react";
import Link from "next/link";
import { User } from "../../../../../generated/prisma/client";
import { formatDistanceToNow } from "date-fns";

import { Thumbnail, ThumbnailSkeleton } from "@/components/thumbnail";
import { Skeleton } from "@/components/ui/skeleton";
import { VerifiedMark } from "@/components/verified-mark";

export function ResultCard({
  data,
}: {
  data: {
    id: string;
    name: string;
    thumbnailUrl: string | null;
    isLive: boolean;
    updatedAt: Date;
    user: User;
  };
}) {
  return (
    <Link href={`/${data.user.username}`}>
      <div className="group w-full flex gap-x-4 p-2 rounded-lg hover:bg-[#26262c] transition-colors duration-200">
        <div className="relative h-[9rem] w-[16rem] shrink-0">
          <Thumbnail
            src={data.thumbnailUrl}
            fallback={data.user.imageUrl}
            isLive={data.isLive}
            username={data.user.username}
          />
        </div>
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-x-2">
            <p className="font-bold text-lg text-white group-hover:text-[#9147ff] transition-colors duration-200 truncate">
              {data.user.username}
            </p>
            <VerifiedMark />
          </div>
          <p className="text-sm text-[#dedee3] truncate">{data.name}</p>
          <p className="text-sm text-[#adadb8]">
            {formatDistanceToNow(new Date(data.updatedAt), {
              addSuffix: true,
            })}
          </p>
        </div>
      </div>
    </Link>
  );
}

export function ResultCardSkeleton() {
  return (
    <div className="w-full flex gap-x-4 p-2">
      <div className="relative h-[9rem] w-[16rem] shrink-0">
        <ThumbnailSkeleton />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-5 w-32 bg-[#35353b]" />
        <Skeleton className="h-4 w-48 bg-[#35353b]" />
        <Skeleton className="h-4 w-24 bg-[#35353b]" />
      </div>
    </div>
  );
}
