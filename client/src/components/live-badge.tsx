import React from "react";

import { cn } from "@/lib/utils";

export function LiveBadge({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "bg-[#eb0400] text-white text-center py-0.5 px-1.5 rounded uppercase text-[10px] font-bold tracking-wide shadow-lg animate-pulse-live",
        className
      )}
    >
      LIVE
    </div>
  );
}
