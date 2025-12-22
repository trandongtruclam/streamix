import React, { useMemo } from "react";
import { Info } from "lucide-react";

import { Hint } from "@/components/hint";

export function ChatInfo({
  isDelayed,
  isFollowersOnly,
}: {
  isDelayed: boolean;
  isFollowersOnly: boolean;
}) {
  const hint = useMemo(() => {
    if (isFollowersOnly && !isDelayed) {
      return "Only followers can chat";
    }

    if (isDelayed && !isFollowersOnly) {
      return "Chat delayed by 3 seconds";
    }

    if (isFollowersOnly && isDelayed) {
      return "Only followers can chat, chat delayed by 3 seconds";
    }

    return "";
  }, [isDelayed, isFollowersOnly]);

  const label = useMemo(() => {
    if (isFollowersOnly && !isDelayed) {
      return "Followers only";
    }

    if (isDelayed && !isFollowersOnly) {
      return "Slow mode";
    }

    if (isFollowersOnly && isDelayed) {
      return "Followers only & slow mode";
    }

    return "";
  }, [isDelayed, isFollowersOnly]);

  if (!isDelayed && !isFollowersOnly) return null;

  return (
    <div className="p-2 text-[#adadb8] bg-[#26262c] border border-[#35353b] w-full rounded-t-md flex items-center gap-x-2">
      <Hint label={hint}>
        <Info className="h-4 w-4 text-[#9147ff]" />
      </Hint>
      <p className="text-xs font-semibold">{label}</p>
    </div>
  );
}
