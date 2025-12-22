"use client";

import React from "react";
import { ReceivedChatMessage } from "@livekit/components-react";

import { Skeleton } from "@/components/ui/skeleton";

import { ChatMessage } from "./chat-message";

export function ChatList({
  isHidden,
  messages,
}: {
  messages: ReceivedChatMessage[];
  isHidden: boolean;
}) {
  if (isHidden || !messages || messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center px-4">
        <p className="text-sm text-[#adadb8] text-center">
          {isHidden ? "Chat is disabled" : "Welcome to the chat room!"}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col-reverse overflow-y-auto p-3 h-full hidden-scrollbar">
      {messages.map((message) => (
        <ChatMessage key={message.timestamp} data={message} />
      ))}
    </div>
  );
}

export function ChatListSkeleton() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <Skeleton className="w-1/2 h-5 bg-[#35353b]" />
    </div>
  );
}
