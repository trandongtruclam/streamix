"use client";

import React from "react";
import { LiveKitRoom } from "@livekit/components-react";

import { useViewerToken } from "@/hooks/use-viewer-token";
import { useChatSidebar } from "@/store/use-chat-sidebar";
import { cn } from "@/lib/utils";

import { ChatToggle } from "./chat-toggle";
import { InfoCard } from "./info-card";
import { AboutCard } from "./about-card";
import { Video, VideoSkeleton } from "./video";
import { Chat, ChatSkeleton } from "./chat";
import { Header, HeaderSkeleton } from "./header";
import { HostControls } from "./host-controls";

type CustomStream = {
  id: string;
  isChatEnabled: boolean;
  isChatDelayed: boolean;
  isChatFollowersOnly: boolean;
  isLive: boolean;
  thumbnailUrl: string | null;
  name: string;
};

type CustomUser = {
  id: string;
  username: string;
  bio: string | null;
  stream: CustomStream | null;
  imageUrl: string;
  _count: {
    followedBy: number;
  };
};

export function StreamPlayer({
  user,
  stream,
  isFollowing,
}: {
  user: CustomUser;
  stream: CustomStream;
  isFollowing: boolean;
}) {
  const { identity, name, token } = useViewerToken(user.id);
  const { collapsed } = useChatSidebar((state) => state);

  if (!token || !identity || !name) {
    return <StreamPlayerSkeleton />;
  }

  return (
    <div className="h-full">
      {collapsed && (
        <div className="hidden lg:block fixed top-[100px] right-2 z-50">
          <ChatToggle />
        </div>
      )}
      <LiveKitRoom
        token={token}
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_WS_URL}
        className={cn(
          "grid grid-cols-1 lg:gap-y-0 lg:grid-cols-3 2xl:grid-cols-6 h-full",
          collapsed && "lg:grid-cols-1 2xl:grid-cols-1"
        )}
      >
        <div 
          className={cn(
            "col-span-1 lg:col-span-2 2xl:col-span-5 lg:overflow-y-auto hidden-scrollbar",
            collapsed && "lg:col-span-1 2xl:col-span-1"
          )}
        >
          {/* Video Section - Full width on top */}
          <Video hostName={user.username} hostIdentity={user.id} />
          
          {/* Stream Info Below Video */}
          <div className="px-4 lg:px-6 py-4 space-y-6 pb-10">
            <Header
              imageUrl={user.imageUrl}
              hostName={user.username}
              hostIdentity={user.id}
              isFollowing={isFollowing}
              name={stream.name}
              viewerIdentity={identity}
            />
            
            {/* Host Controls - Only visible to streamer */}
            <HostControls
              hostIdentity={user.id}
              viewerIdentity={identity}
              roomName={user.id}
            />
            
            {/* Divider */}
            <div className="h-px bg-[#2f2f35]" />
            
            <InfoCard
              hostIdentity={user.id}
              viewerIdentity={identity}
              name={stream.name}
              thumbnailUrl={stream.thumbnailUrl}
            />
            
            <AboutCard
              hostName={user.username}
              hostIdentity={user.id}
              viewerIdentity={identity}
              bio={user.bio}
              followedByCount={user._count.followedBy}
            />
          </div>
        </div>
        
        {/* Chat Section */}
        <div className={cn("col-span-1 h-full", collapsed && "hidden")}>
          <Chat
            viewerName={name}
            hostName={user.username}
            hostIdentity={user.id}
            isFollowing={isFollowing}
            isChatEnabled={stream.isChatEnabled}
            isChatDelayed={stream.isChatDelayed}
            isChatFollowersOnly={stream.isChatFollowersOnly}
          />
        </div>
      </LiveKitRoom>
    </div>
  );
}

export function StreamPlayerSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:gap-y-0 lg:grid-cols-3 2xl:grid-cols-6 h-full">
      <div className="col-span-1 lg:col-span-2 2xl:col-span-5 lg:overflow-y-auto hidden-scrollbar">
        <VideoSkeleton />
        <div className="px-4 lg:px-6 py-4">
          <HeaderSkeleton />
        </div>
      </div>
      <div className="col-span-1 bg-[#1f1f23] border-l border-[#2f2f35]">
        <ChatSkeleton />
      </div>
    </div>
  );
}
