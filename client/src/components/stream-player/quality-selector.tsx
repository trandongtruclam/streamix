"use client";

import React, { useCallback, useEffect, useState } from "react";
import { 
  RemoteTrack, 
  Track, 
  VideoQuality,
  ConnectionQuality,
} from "livekit-client";
import { 
  useRemoteParticipant, 
  useTracks,
  useConnectionQualityIndicator,
} from "@livekit/components-react";
import { Settings, Check, Wifi, WifiOff, Signal, SignalLow, SignalMedium, SignalHigh } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const QUALITY_OPTIONS = [
  { 
    id: "auto", 
    label: "Auto", 
    description: "Best quality for your connection",
    quality: null,
  },
  { 
    id: "high", 
    label: "1080p", 
    description: "Full HD",
    quality: VideoQuality.HIGH,
  },
  { 
    id: "medium", 
    label: "720p", 
    description: "HD",
    quality: VideoQuality.MEDIUM,
  },
  { 
    id: "low", 
    label: "480p", 
    description: "Standard",
    quality: VideoQuality.LOW,
  },
];

interface QualitySelectorProps {
  hostIdentity: string;
}

// Inner component that uses hooks - only rendered when participant exists
function QualitySelectorInner({ 
  participant, 
  hostIdentity 
}: { 
  participant: NonNullable<ReturnType<typeof useRemoteParticipant>>;
  hostIdentity: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState<string>("auto");
  const [currentBitrate, setCurrentBitrate] = useState<number>(0);
  
  const { quality: connectionQuality } = useConnectionQualityIndicator({ participant });
  
  const tracks = useTracks([Track.Source.Camera, Track.Source.ScreenShare])
    .filter((track) => track.participant.identity === hostIdentity);

  const videoTrack = tracks.find(
    (track) => track.source === Track.Source.Camera || track.source === Track.Source.ScreenShare
  );

  // Update quality when selection changes
  const handleQualityChange = useCallback((qualityId: string) => {
    setSelectedQuality(qualityId);
    
    if (videoTrack?.publication?.track) {
      const track = videoTrack.publication.track as RemoteTrack;
      const option = QUALITY_OPTIONS.find(q => q.id === qualityId);
      
      if (option?.quality !== undefined && option?.quality !== null) {
        // Set specific quality
        track.setVideoQuality(option.quality);
      } else {
        // Auto quality - set to HIGH and let adaptive bitrate handle it
        track.setVideoQuality(VideoQuality.HIGH);
      }
    }
    
    setIsOpen(false);
  }, [videoTrack]);

  // Track current bitrate
  useEffect(() => {
    if (!videoTrack?.publication?.track) return;
    
    const interval = setInterval(() => {
      // @ts-expect-error - accessing internal property for stats
      const stats = videoTrack.publication.track?.currentBitrate;
      if (stats) {
        setCurrentBitrate(stats);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [videoTrack]);

  const getConnectionIcon = () => {
    switch (connectionQuality) {
      case ConnectionQuality.Excellent:
        return <SignalHigh className="h-4 w-4 text-green-500" />;
      case ConnectionQuality.Good:
        return <SignalMedium className="h-4 w-4 text-green-400" />;
      case ConnectionQuality.Poor:
        return <SignalLow className="h-4 w-4 text-yellow-500" />;
      case ConnectionQuality.Lost:
        return <WifiOff className="h-4 w-4 text-red-500" />;
      default:
        return <Signal className="h-4 w-4 text-[#adadb8]" />;
    }
  };

  const getCurrentQualityLabel = () => {
    const option = QUALITY_OPTIONS.find(q => q.id === selectedQuality);
    return option?.label || "Auto";
  };

  const formatBitrate = (bitrate: number) => {
    if (bitrate >= 1000000) {
      return `${(bitrate / 1000000).toFixed(1)} Mbps`;
    }
    if (bitrate >= 1000) {
      return `${(bitrate / 1000).toFixed(0)} Kbps`;
    }
    return `${bitrate} bps`;
  };

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 p-2 text-white hover:bg-white/20 rounded-md transition-colors"
      >
        <Settings className="h-5 w-5" />
        <span className="text-xs hidden sm:inline">{getCurrentQualityLabel()}</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
            
            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-full right-0 mb-2 w-64 bg-[#18181b] border border-[#3a3a3d] rounded-lg shadow-xl overflow-hidden z-50"
            >
              {/* Header */}
              <div className="px-4 py-3 border-b border-[#3a3a3d]">
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">Quality</span>
                  <div className="flex items-center gap-2">
                    {getConnectionIcon()}
                    <span className="text-xs text-[#adadb8]">
                      {currentBitrate > 0 && formatBitrate(currentBitrate)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quality Options */}
              <div className="py-1">
                {QUALITY_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleQualityChange(option.id)}
                    className={`w-full px-4 py-2.5 flex items-center justify-between hover:bg-[#26262c] transition-colors ${
                      selectedQuality === option.id ? "bg-[#26262c]" : ""
                    }`}
                  >
                    <div className="flex flex-col items-start">
                      <span className="text-white text-sm font-medium">
                        {option.label}
                      </span>
                      <span className="text-[#adadb8] text-xs">
                        {option.description}
                      </span>
                    </div>
                    {selectedQuality === option.id && (
                      <Check className="h-4 w-4 text-[#9147ff]" />
                    )}
                  </button>
                ))}
              </div>

              {/* Connection info footer */}
              <div className="px-4 py-2 border-t border-[#3a3a3d] bg-[#0e0e10]">
                <div className="flex items-center gap-2 text-xs text-[#adadb8]">
                  <Wifi className="h-3 w-3" />
                  <span>
                    Connection: {connectionQuality === ConnectionQuality.Excellent ? "Excellent" :
                      connectionQuality === ConnectionQuality.Good ? "Good" :
                      connectionQuality === ConnectionQuality.Poor ? "Poor" : "Unknown"}
                  </span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export function QualitySelector({ hostIdentity }: QualitySelectorProps) {
  const participant = useRemoteParticipant(hostIdentity);
  
  // Don't render if participant is not available
  if (!participant) {
    return null;
  }
  
  return <QualitySelectorInner participant={participant} hostIdentity={hostIdentity} />;
}

// Compact quality badge for overlay
function QualityBadgeInner({ 
  participant 
}: { 
  participant: NonNullable<ReturnType<typeof useRemoteParticipant>>;
}) {
  const { quality } = useConnectionQualityIndicator({ participant });
  
  const getQualityColor = () => {
    switch (quality) {
      case ConnectionQuality.Excellent:
        return "bg-green-500";
      case ConnectionQuality.Good:
        return "bg-green-400";
      case ConnectionQuality.Poor:
        return "bg-yellow-500";
      case ConnectionQuality.Lost:
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-md">
      <div className={`h-2 w-2 rounded-full ${getQualityColor()}`} />
      <span className="text-white text-xs font-medium">
        {quality === ConnectionQuality.Excellent ? "HD" :
         quality === ConnectionQuality.Good ? "HD" :
         quality === ConnectionQuality.Poor ? "SD" : "..."}
      </span>
    </div>
  );
}

export function QualityBadge({ hostIdentity }: { hostIdentity: string }) {
  const participant = useRemoteParticipant(hostIdentity);
  
  if (!participant) {
    return null;
  }
  
  return <QualityBadgeInner participant={participant} />;
}
