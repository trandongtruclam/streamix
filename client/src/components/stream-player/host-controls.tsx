"use client";

import React from "react";
import { useLocalParticipant } from "@livekit/components-react";

import { ScreenShareToggle } from "./screen-share-toggle";
import { RecordingControl } from "./recording-control";
import { RestreamControl } from "./restream-control";

interface HostControlsProps {
  hostIdentity: string;
  viewerIdentity: string;
  roomName: string;
}

export function HostControls({ 
  hostIdentity, 
  viewerIdentity, 
  roomName 
}: HostControlsProps) {
  const { localParticipant } = useLocalParticipant();
  
  // Check if current user is the host
  const hostAsViewer = `host-${hostIdentity}`;
  const isHost = hostAsViewer === viewerIdentity;

  if (!isHost) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <ScreenShareToggle isHost={isHost} />
      <RecordingControl roomName={roomName} isHost={isHost} />
      <RestreamControl roomName={roomName} isHost={isHost} />
    </div>
  );
}

