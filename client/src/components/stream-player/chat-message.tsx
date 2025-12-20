"use client";

import React from "react";
import { ReceivedChatMessage } from "@livekit/components-react";
import { format } from "date-fns";

import { stringToColor } from "@/lib/utils";

export function ChatMessage({ data }: { data: ReceivedChatMessage }) {
  // The identity contains "host-" prefix for hosts, name is the display username
  const identity = data.from?.identity || "";
  const displayName = data.from?.name || "";
  const isHost = identity.startsWith("host-");
  const color = stringToColor(displayName || identity);

  return (
    <div className="flex gap-2 px-2 py-1.5 rounded hover:bg-[#26262c]/50 transition-colors group animate-fade-in-up">
      <div className="flex flex-wrap items-baseline gap-1 grow min-w-0">
        <span className="flex items-center gap-1 shrink-0">
          {isHost && (
            <span className="text-[10px] bg-[#9147ff] text-white px-1 py-0.5 rounded font-bold uppercase">
              Host
            </span>
          )}
          <span
            className="text-sm font-bold cursor-pointer hover:underline"
            style={{ color: color }}
          >
            {displayName || identity}
          </span>
          <span className="text-[#666]">:</span>
        </span>
        <span className="text-sm text-[#efeff1] break-words leading-relaxed">
          {data.message}
        </span>
      </div>
      <span className="text-[10px] text-[#666] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap self-start pt-0.5">
        {format(data.timestamp, "HH:mm")}
      </span>
    </div>
  );
}
