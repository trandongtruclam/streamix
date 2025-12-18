"use client";

import React from "react";
import { ConnectionState, Track } from "livekit-client";
import {
  useConnectionState,
  useRemoteParticipant,
  useTracks,
} from "@livekit/components-react";

import { Skeleton } from "@/components/ui/skeleton";

import { OfflineVideo } from "./offline-video";
import { LoadingVideo } from "./loading-video";
import { LiveVideo } from "./live-video";

export function Video({
  hostName,
  hostIdentity,
}: {
  hostName: string;
  hostIdentity: string;
}) {
  const connectionState = useConnectionState();
  const participant = useRemoteParticipant(hostIdentity);
  const tracks = useTracks([
    Track.Source.Camera,
    Track.Source.Microphone,
    Track.Source.ScreenShare,
    Track.Source.ScreenShareAudio,
  ]).filter((track) => track.participant.identity === hostIdentity);

  let content;

  if (!participant && connectionState === ConnectionState.Connected) {
    content = <OfflineVideo username={hostName} />;
  } else if (!participant || tracks.length === 0) {
    content = <LoadingVideo label={connectionState} />;
  } else {
    content = <LiveVideo participant={participant} />;
  }

  return (
    <div className="aspect-video bg-black group relative overflow-hidden border-b border-[#2f2f35]">
      {content}
    </div>
  );
}

export function VideoSkeleton() {
  return (
    <div className="aspect-video bg-[#18181b] relative overflow-hidden border-b border-[#2f2f35]">
      <Skeleton className="h-full w-full bg-[#26262c]" />
      {/* Animated loading state */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-[#35353b] border-t-[#9147ff] animate-spin" />
          <p className="text-[#adadb8] text-sm">Loading stream...</p>
        </div>
      </div>
    </div>
  );
}
