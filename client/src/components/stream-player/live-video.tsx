import React, { useEffect, useRef, useState } from "react";
import { Participant, Track } from "livekit-client";
import { useTracks, useParticipants } from "@livekit/components-react";
import { useEventListener } from "usehooks-ts";
import { Eye } from "lucide-react";

import { FullscreenControl } from "./fullscreen-control";
import { VolumeControl } from "./volume-control";
import { QualitySelector } from "./quality-selector";
import { LiveReactions, ReactionBar } from "./live-reactions";
import { LiveBadge } from "@/components/live-badge";

interface LiveVideoProps {
  participant: Participant;
}

export function LiveVideo({ participant }: LiveVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [volume, setVolume] = useState(0);
  const [showControls, setShowControls] = useState(false);

  // Get viewer count
  const participants = useParticipants();
  const viewerCount = Math.max(0, participants.length - 1);

  const onVolumeChange = (value: number) => {
    setVolume(+value);
    if (videoRef?.current) {
      videoRef.current.muted = value === 0;
      videoRef.current.volume = +value * 0.01;
    }
  };

  const toggleMute = () => {
    const isMuted = volume === 0;

    setVolume(isMuted ? 50 : 0);

    if (videoRef?.current) {
      videoRef.current.muted = !isMuted;
      videoRef.current.volume = isMuted ? 0.5 : 0;
    }
  };

  useEffect(() => {
    onVolumeChange(0);
  }, []);

  const toggleFullscreen = () => {
    if (isFullscreen) {
      document.exitFullscreen();
    } else if (wrapperRef?.current) {
      wrapperRef.current.requestFullscreen();
    }
  };

  const handleFullscreenChange = () => {
    const isCurrentlyFullscreen = document.fullscreenElement !== null;
    setIsFullscreen(isCurrentlyFullscreen);
  };

  useEventListener("fullscreenchange", handleFullscreenChange, wrapperRef);

  const tracks = useTracks([
    Track.Source.Camera,
    Track.Source.Microphone,
    Track.Source.ScreenShare,
    Track.Source.ScreenShareAudio,
  ]).filter((track) => track.participant.identity === participant.identity);

  // Properly attach/detach tracks in useEffect
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    tracks.forEach((track) => {
      track.publication.track?.attach(videoElement);
    });

    // Cleanup: detach tracks when component unmounts or tracks change
    return () => {
      tracks.forEach((track) => {
        track.publication.track?.detach(videoElement);
      });
    };
  }, [tracks]);

  return (
    <div 
      ref={wrapperRef} 
      className="relative h-full flex bg-black cursor-pointer"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      onClick={toggleMute}
    >
      <video ref={videoRef} width="100%" className="object-contain" />
      
      {/* Live Reactions Overlay - Flying emojis */}
      <LiveReactions isOverlay />
      
      {/* Top badges - always visible */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <LiveBadge />
        {/* Viewer count badge */}
        <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-md">
          <Eye className="h-3.5 w-3.5 text-red-500" />
          <span className="text-white text-sm font-semibold tabular-nums">
            {viewerCount.toLocaleString()}
          </span>
        </div>
      </div>
      
      {/* Controls overlay */}
      <div 
        className={`absolute inset-0 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top gradient */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/70 to-transparent pointer-events-none" />
        
        {/* Bottom controls gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none" />
        
        {/* Reaction bar - right side */}
        <div className="absolute right-4 bottom-20 z-30">
          <ReactionBar />
        </div>
        
        {/* Progress bar placeholder (for live, it's always full) */}
        <div className="absolute bottom-14 left-4 right-4">
          <div className="h-1 bg-white/30 rounded-full overflow-hidden">
            <div className="h-full w-full bg-[#eb0400] rounded-full relative">
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-[#eb0400] rounded-full shadow-lg transform scale-0 group-hover:scale-100 transition-transform" />
            </div>
          </div>
        </div>
        
        {/* Bottom controls */}
        <div className="absolute bottom-0 flex h-14 w-full items-center justify-between px-4 gap-x-4">
          <div className="flex items-center gap-x-2">
            <VolumeControl
              onChange={onVolumeChange}
              value={volume}
              onToggle={toggleMute}
            />
            <span className="text-white text-sm font-medium ml-2">LIVE</span>
          </div>
          
          <div className="flex items-center gap-x-2">
            {/* Quality Selector */}
            <QualitySelector hostIdentity={participant.identity} />
            <FullscreenControl
              isFullscreen={isFullscreen}
              onToggle={toggleFullscreen}
            />
          </div>
        </div>
      </div>
      
      {/* Click to unmute hint */}
      {volume === 0 && !showControls && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-sm px-3 py-1.5 rounded-lg text-white text-sm font-medium animate-pulse">
          Click to unmute
        </div>
      )}
    </div>
  );
}
