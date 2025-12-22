"use client";

import React from "react";
import { ConnectionState, Track } from "livekit-client";
import {
  useConnectionState,
  useRemoteParticipant,
  useTracks,
  useParticipants,
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
  const participants = useParticipants();
  
  // Call hook unconditionally (Rules of Hooks)
  const remoteParticipant = useRemoteParticipant(hostIdentity);
  
  // Get all tracks first to find the broadcaster
  const allTracks = useTracks([
    Track.Source.Camera,
    Track.Source.Microphone,
    Track.Source.ScreenShare,
    Track.Source.ScreenShareAudio,
  ]);
  
  // Find the broadcaster participant - this is the one publishing tracks
  // The broadcaster always has identity = hostIdentity (userId)
  // When host views their own stream, they join with identity = host-${hostIdentity}
  // but the broadcaster (publishing tracks) has identity = hostIdentity
  // First try to find by identity, then by looking for tracks
  let participant = participants.find(
    (p) => p.identity === hostIdentity
  );
  
  // If not found by identity, try to find participant that has published tracks
  if (!participant) {
    const broadcasterWithTracks = allTracks.find(
      (track) => track.participant.identity === hostIdentity
    );
    if (broadcasterWithTracks) {
      participant = participants.find(
        (p) => p.identity === broadcasterWithTracks.participant.identity
      );
    }
  }
  
  // Fallback to remoteParticipant from hook
  if (!participant) {
    participant = remoteParticipant;
  }
  
  // Get all tracks from the broadcaster (identity = hostIdentity)
  // Don't include tracks from viewer participants (like host-${hostIdentity})
  const tracks = allTracks.filter((track) => 
    track.participant.identity === hostIdentity
  );

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
