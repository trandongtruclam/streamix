"use client";

import React, { useState, useCallback } from "react";
import { 
  useLocalParticipant, 
  useTracks,
  useRoomContext,
} from "@livekit/components-react";
import { Track, LocalTrack, createLocalScreenTracks } from "livekit-client";
import { Monitor, Camera, MonitorOff, Loader2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

interface ScreenShareToggleProps {
  isHost: boolean;
}

export function ScreenShareToggle({ isHost }: ScreenShareToggleProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();
  
  const tracks = useTracks([
    Track.Source.ScreenShare,
    Track.Source.ScreenShareAudio,
  ]).filter((track) => track.participant.identity === localParticipant?.identity);

  const isCurrentlySharing = tracks.length > 0;

  const startScreenShare = useCallback(async (withAudio: boolean = true) => {
    if (!room || !localParticipant) {
      toast.error("Not connected to room");
      return;
    }

    setIsLoading(true);
    setShowOptions(false);

    try {
      // Create screen share tracks
      const screenTracks = await createLocalScreenTracks({
        audio: withAudio,
        resolution: {
          width: 1920,
          height: 1080,
          frameRate: 30,
        },
      });

      // Publish each track
      for (const track of screenTracks) {
        await localParticipant.publishTrack(track, {
          name: track.kind === "video" ? "screen" : "screen_audio",
          source: track.kind === "video" 
            ? Track.Source.ScreenShare 
            : Track.Source.ScreenShareAudio,
        });
      }

      setIsSharing(true);
      toast.success("Screen sharing started");

      // Listen for track ended (user clicks browser's stop sharing)
      const videoTrack = screenTracks.find(t => t.kind === "video");
      if (videoTrack) {
        videoTrack.on("ended", () => {
          stopScreenShare();
        });
      }
    } catch (error) {
      console.error("Failed to start screen share:", error);
      if (error instanceof Error && error.name === "NotAllowedError") {
        toast.error("Screen sharing permission denied");
      } else {
        toast.error("Failed to start screen sharing");
      }
    } finally {
      setIsLoading(false);
    }
  }, [room, localParticipant]);

  const stopScreenShare = useCallback(async () => {
    if (!localParticipant) return;

    setIsLoading(true);

    try {
      // Get all screen share tracks
      const screenTracks = localParticipant.getTrackPublications()
        .filter(pub => 
          pub.source === Track.Source.ScreenShare || 
          pub.source === Track.Source.ScreenShareAudio
        );

      // Unpublish and stop each track
      for (const pub of screenTracks) {
        if (pub.track) {
          await localParticipant.unpublishTrack(pub.track as LocalTrack);
          pub.track.stop();
        }
      }

      setIsSharing(false);
      toast.success("Screen sharing stopped");
    } catch (error) {
      console.error("Failed to stop screen share:", error);
      toast.error("Failed to stop screen sharing");
    } finally {
      setIsLoading(false);
    }
  }, [localParticipant]);

  // Only show for host
  if (!isHost) return null;

  return (
    <div className="relative">
      {/* Main Toggle Button */}
      <motion.button
        onClick={() => {
          if (isCurrentlySharing) {
            stopScreenShare();
          } else {
            setShowOptions(true);
          }
        }}
        disabled={isLoading}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-all
          ${isCurrentlySharing 
            ? "bg-red-500 hover:bg-red-600 text-white" 
            : "bg-[#9147ff] hover:bg-[#772ce8] text-white"
          }
          ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
        `}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isCurrentlySharing ? (
          <MonitorOff className="h-4 w-4" />
        ) : (
          <Monitor className="h-4 w-4" />
        )}
        <span className="hidden sm:inline">
          {isCurrentlySharing ? "Stop Sharing" : "Share Screen"}
        </span>
      </motion.button>

      {/* Options Modal */}
      <AnimatePresence>
        {showOptions && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowOptions(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute top-full left-0 mt-2 w-72 bg-[#18181b] border border-[#3a3a3d] rounded-lg shadow-xl overflow-hidden z-50"
            >
              <div className="p-4 border-b border-[#3a3a3d]">
                <h3 className="text-white font-medium flex items-center gap-2">
                  <Monitor className="h-5 w-5 text-[#9147ff]" />
                  Share Your Screen
                </h3>
                <p className="text-[#adadb8] text-sm mt-1">
                  Choose what to share with your viewers
                </p>
              </div>

              <div className="p-2 space-y-1">
                {/* Share with audio */}
                <button
                  onClick={() => startScreenShare(true)}
                  className="w-full p-3 rounded-lg hover:bg-[#26262c] transition-colors text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#9147ff]/20 rounded-lg group-hover:bg-[#9147ff]/30 transition-colors">
                      <Monitor className="h-5 w-5 text-[#9147ff]" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">Screen with Audio</p>
                      <p className="text-[#adadb8] text-xs">Share screen and system audio</p>
                    </div>
                  </div>
                </button>

                {/* Share without audio */}
                <button
                  onClick={() => startScreenShare(false)}
                  className="w-full p-3 rounded-lg hover:bg-[#26262c] transition-colors text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#3a3a3d] rounded-lg group-hover:bg-[#4a4a4d] transition-colors">
                      <Monitor className="h-5 w-5 text-[#adadb8]" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">Screen Only</p>
                      <p className="text-[#adadb8] text-xs">Share screen without audio</p>
                    </div>
                  </div>
                </button>
              </div>

              {/* Info note */}
              <div className="px-4 py-3 bg-[#0e0e10] border-t border-[#3a3a3d]">
                <div className="flex items-start gap-2 text-xs text-[#adadb8]">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <p>
                    Your camera feed will continue. Viewers will see your screen share.
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Source selector for switching between camera and screen
export function SourceSelector({ isHost }: { isHost: boolean }) {
  const [activeSource, setActiveSource] = useState<"camera" | "screen">("camera");
  const { localParticipant } = useLocalParticipant();
  
  const tracks = useTracks([
    Track.Source.Camera,
    Track.Source.ScreenShare,
  ]).filter((track) => track.participant.identity === localParticipant?.identity);

  const hasCamera = tracks.some(t => t.source === Track.Source.Camera);
  const hasScreen = tracks.some(t => t.source === Track.Source.ScreenShare);

  if (!isHost) return null;

  return (
    <div className="flex items-center gap-1 p-1 bg-[#26262c] rounded-lg">
      <motion.button
        onClick={() => setActiveSource("camera")}
        whileTap={{ scale: 0.95 }}
        className={`
          flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all
          ${activeSource === "camera" 
            ? "bg-[#9147ff] text-white" 
            : "text-[#adadb8] hover:text-white hover:bg-[#3a3a3d]"
          }
        `}
      >
        <Camera className="h-4 w-4" />
        <span>Camera</span>
        {hasCamera && <span className="h-1.5 w-1.5 rounded-full bg-green-500" />}
      </motion.button>
      
      <motion.button
        onClick={() => setActiveSource("screen")}
        whileTap={{ scale: 0.95 }}
        className={`
          flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all
          ${activeSource === "screen" 
            ? "bg-[#9147ff] text-white" 
            : "text-[#adadb8] hover:text-white hover:bg-[#3a3a3d]"
          }
        `}
      >
        <Monitor className="h-4 w-4" />
        <span>Screen</span>
        {hasScreen && <span className="h-1.5 w-1.5 rounded-full bg-green-500" />}
      </motion.button>
    </div>
  );
}


