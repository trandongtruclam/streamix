"use client";

import React from "react";
import { User } from "@prisma/client";
import { Users } from "lucide-react";

import { useSidebar } from "@/store/use-sidebar";

import { UserItem, UserItemSkeleton } from "./user-item";

export function Recommended({
  data,
}: {
  data: (User & { stream: { isLive: boolean } | null })[];
}) {
  const { collapsed } = useSidebar((state) => state);

  const showLabel = !collapsed;

  return (
    <div>
      {showLabel && (
        <div className="pl-4 mb-2">
          <p className="text-xs font-semibold text-[#adadb8] uppercase tracking-wider">
            Recommended Channels
          </p>
        </div>
      )}
      {data.length === 0 && !collapsed && (
        <div className="px-4 py-6 flex flex-col items-center text-center">
          <div className="p-3 bg-[#26262c] rounded-full mb-3">
            <Users className="h-5 w-5 text-[#adadb8]" />
          </div>
          <p className="text-xs text-[#adadb8]">
            No channels to recommend yet
          </p>
        </div>
      )}
      <ul className="space-y-0.5 px-2">
        {data.map((user) => (
          <UserItem
            key={user.id}
            imageUrl={user.imageUrl}
            username={user.username}
            isLive={user.stream?.isLive}
          />
        ))}
      </ul>
    </div>
  );
}

export function RecommendedSkeleton() {
  return (
    <ul className="px-2">
      {[...Array(3)].map((_, i) => (
        <UserItemSkeleton key={i} />
      ))}
    </ul>
  );
}
