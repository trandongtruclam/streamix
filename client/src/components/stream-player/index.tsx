"use client";

import React, { useEffect, useMemo, useRef } from "react";
import {
  LiveKitRoom,
  useRoomContext,
  useConnectionState,
} from "@livekit/components-react";
import { RoomEvent, ConnectionState } from "livekit-client";

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

  // Memoize server URL to prevent unnecessary re-renders
  const serverUrl = useMemo(
    () => process.env.NEXT_PUBLIC_LIVEKIT_WS_URL || "",
    []
  );

  // Track if component is mounted to prevent unnecessary disconnects
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  if (!token || !identity || !name) {
    return <StreamPlayerSkeleton />;
  }

  if (!serverUrl) {
    console.error("StreamPlayer: Missing NEXT_PUBLIC_LIVEKIT_WS_URL");
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-red-500">Missing LiveKit server URL</p>
      </div>
    );
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
        serverUrl={serverUrl}
        connect={true}
        className={cn(
          "grid grid-cols-1 lg:gap-y-0 lg:grid-cols-3 2xl:grid-cols-6 h-full",
          collapsed && "lg:grid-cols-1 2xl:grid-cols-1"
        )}
      >
        <StreamPlayerContent
          user={user}
          stream={stream}
          isFollowing={isFollowing}
          viewerIdentity={identity}
          viewerName={name}
        />
      </LiveKitRoom>
    </div>
  );
}

// Internal component that uses LiveKit hooks
function StreamPlayerContent({
  user,
  stream,
  isFollowing,
  viewerIdentity,
  viewerName,
}: {
  user: CustomUser;
  stream: CustomStream;
  isFollowing: boolean;
  viewerIdentity: string;
  viewerName: string;
}) {
  const { collapsed } = useChatSidebar((state) => state);
  const room = useRoomContext();
  const connectionState = useConnectionState();

  // Log connection events
  useEffect(() => {
    if (!room) return;

    const handleConnected = () => {
      console.log("StreamPlayer: Connected to room", {
        roomName: room.name,
        identity: room.localParticipant.identity,
      });
    };

    const handleDisconnected = (reason?: string) => {
      console.log("StreamPlayer: Disconnected from room", reason);
    };

    room.on(RoomEvent.Connected, handleConnected);
    room.on(RoomEvent.Disconnected, handleDisconnected);

    return () => {
      room.off(RoomEvent.Connected, handleConnected);
      room.off(RoomEvent.Disconnected, handleDisconnected);
    };
  }, [room]);

  return (
    <>
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
            viewerIdentity={viewerIdentity}
          />

          {/* Host Controls - Only visible to streamer */}
          <HostControls
            hostIdentity={user.id}
            viewerIdentity={viewerIdentity}
            roomName={user.id}
          />

          {/* Divider */}
          <div className="h-px bg-[#2f2f35]" />

          <InfoCard
            hostIdentity={user.id}
            viewerIdentity={viewerIdentity}
            name={stream.name}
            thumbnailUrl={stream.thumbnailUrl}
          />

          <AboutCard
            hostName={user.username}
            hostIdentity={user.id}
            viewerIdentity={viewerIdentity}
            bio={user.bio}
            followedByCount={user._count.followedBy}
          />
        </div>
      </div>

      {/* Chat Section */}
      <div className={cn("col-span-1 h-full", collapsed && "hidden")}>
        <Chat
          viewerName={viewerName}
          hostName={user.username}
          hostIdentity={user.id}
          isFollowing={isFollowing}
          isChatEnabled={stream.isChatEnabled}
          isChatDelayed={stream.isChatDelayed}
          isChatFollowersOnly={stream.isChatFollowersOnly}
        />
      </div>
    </>
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
