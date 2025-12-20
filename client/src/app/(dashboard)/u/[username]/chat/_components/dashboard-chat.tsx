"use client";

import React, { useEffect, useMemo, useState } from "react";
import { LiveKitRoom } from "@livekit/components-react";
import {
  useChat,
  useConnectionState,
  useParticipants,
} from "@livekit/components-react";
import { ConnectionState } from "livekit-client";

import { useViewerToken } from "@/hooks/use-viewer-token";
import { ChatForm, ChatFormSkeleton } from "@/components/stream-player/chat-form";
import { ChatList, ChatListSkeleton } from "@/components/stream-player/chat-list";
import { ChatCommunity } from "@/components/stream-player/chat-community";
import { ChatVariant, useChatSidebar } from "@/store/use-chat-sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare } from "lucide-react";
import { VariantToggle } from "@/components/stream-player/variant-toggle";

interface DashboardChatProps {
  hostIdentity: string;
  hostName: string;
  isChatEnabled: boolean;
  isChatDelayed: boolean;
  isChatFollowersOnly: boolean;
}

export function DashboardChat({
  hostIdentity,
  hostName,
  isChatEnabled,
  isChatDelayed,
  isChatFollowersOnly,
}: DashboardChatProps) {
  const { variant } = useChatSidebar((state) => state);
  const { identity, name, token } = useViewerToken(hostIdentity);
  const connectionState = useConnectionState();
  const participants = useParticipants();

  // Streamer is always following themselves
  const isFollowing = true;

  // Find host participant
  const participant = participants.find(
    (p) => p.identity === hostIdentity
  ) || participants.find(
    (p) => p.identity === `host-${hostIdentity}`
  );

  const isOnline = participant && connectionState === ConnectionState.Connected;
  const isHidden = !isChatEnabled || !isOnline;

  const [value, setValue] = useState("");
  const { chatMessages: messages, send } = useChat();

  const reversedMessages = useMemo(() => {
    return messages.sort((a, b) => b.timestamp - a.timestamp);
  }, [messages]);

  const onSubmit = () => {
    if (!send) return;
    send(value);
    setValue("");
  };

  const onChange = (value: string) => {
    setValue(value);
  };

  if (!token || !identity || !name) {
    return (
      <div className="flex flex-col bg-[#1f1f23] border border-[#2f2f35] rounded-xl h-[calc(100vh-150px)]">
        <div className="relative p-3 border-b border-[#2f2f35] bg-[#18181b]">
          <Skeleton className="h-5 w-28 mx-auto bg-[#35353b]" />
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <Skeleton className="h-16 w-full mb-2 bg-[#26262c]" />
          <Skeleton className="h-16 w-full mb-2 bg-[#26262c]" />
          <Skeleton className="h-16 w-full mb-2 bg-[#26262c]" />
        </div>
        <ChatFormSkeleton />
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-[#1f1f23] border border-[#2f2f35] rounded-xl h-[calc(100vh-150px)] overflow-hidden">
      <LiveKitRoom
        token={token}
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_WS_URL}
        className="flex flex-col h-full"
        connect={true}
      >
        {/* Custom Chat Header for Dashboard */}
        <div className="relative p-3 border-b border-[#2f2f35] bg-[#18181b]/95 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center justify-center gap-x-2">
            <MessageSquare className="h-4 w-4 text-[#9147ff]" />
            <p className="font-semibold text-white text-sm uppercase tracking-wide">
              Stream Chat
            </p>
          </div>
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <VariantToggle />
          </div>
        </div>

        {variant === ChatVariant.CHAT && (
          <>
            <ChatList messages={reversedMessages} isHidden={isHidden} />
            <ChatForm
              onSubmit={onSubmit}
              value={value}
              onChange={onChange}
              isHidden={isHidden}
              isFollowersOnly={isChatFollowersOnly}
              isDelayed={isChatDelayed}
              isFollowing={isFollowing}
            />
          </>
        )}
        {variant === ChatVariant.COMMUNITY && (
          <ChatCommunity
            hostName={hostName}
            viewerName={name}
            isHidden={isHidden}
          />
        )}
      </LiveKitRoom>
    </div>
  );
}
