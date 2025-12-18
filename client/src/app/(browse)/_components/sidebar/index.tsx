import React from "react";

import { getRecommended } from "@/lib/recommended-service";
import { getFollwedUser } from "@/lib/follow-service";

import { Wrapper } from "./wrapper";
import { Toggle, ToggleSkeleton } from "./toggle";
import { Recommended, RecommendedSkeleton } from "./recommended";
import { Following, FollowingSkeleton } from "./following";

export async function Sidebar() {
  const recommended = await getRecommended();
  const following = await getFollwedUser();

  return (
    <Wrapper>
      <Toggle />
      <div className="space-y-2 overflow-y-auto flex-1 hidden-scrollbar">
        <Following data={following} />
        <Recommended data={recommended} />
      </div>
    </Wrapper>
  );
}

export function SidebarSkeleton() {
  return (
    <aside className="fixed left-0 flex flex-col w-[50px] lg:w-60 h-full bg-[#1f1f23] pt-[50px] z-40">
      <ToggleSkeleton />
      <FollowingSkeleton />
      <RecommendedSkeleton />
    </aside>
  );
}
