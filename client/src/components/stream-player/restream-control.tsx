"use client";

import React, { useState, useTransition } from "react";
import {
  Share2,
  Youtube,
  Facebook,
  Twitch,
  Loader2,
  Check,
  X,
  ExternalLink,
  AlertCircle,
  Copy,
  Eye,
  EyeOff,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

import { startRestream, stopRestream } from "@/actions/recording";

interface RestreamControlProps {
  roomName: string;
  isHost: boolean;
}

interface Platform {
  id: "youtube" | "facebook" | "twitch" | "custom";
  name: string;
  icon: React.ElementType;
  color: string;
  rtmpUrl: string;
  streamKeyPlaceholder: string;
  helpUrl: string;
}

const PLATFORMS: Platform[] = [
  {
    id: "youtube",
    name: "YouTube Live",
    icon: Youtube,
    color: "#ff0000",
    rtmpUrl: "rtmp://a.rtmp.youtube.com/live2",
    streamKeyPlaceholder: "xxxx-xxxx-xxxx-xxxx-xxxx",
    helpUrl: "https://studio.youtube.com/channel/UC/livestreaming",
  },
  {
    id: "facebook",
    name: "Facebook Live",
    icon: Facebook,
    color: "#1877f2",
    rtmpUrl: "rtmps://live-api-s.facebook.com:443/rtmp",
    streamKeyPlaceholder: "FB-xxxx-xxxx-xxxx",
    helpUrl: "https://www.facebook.com/live/producer",
  },
  {
    id: "twitch",
    name: "Twitch",
    icon: Twitch,
    color: "#9147ff",
    rtmpUrl: "rtmp://live.twitch.tv/live",
    streamKeyPlaceholder: "live_xxxxxxxxxx",
    helpUrl: "https://dashboard.twitch.tv/settings/stream",
  },
];

interface ActiveRestream {
  platform: string;
  egressId: string;
  startedAt: Date;
}

export function RestreamControl({ roomName, isHost }: RestreamControlProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
  const [streamKey, setStreamKey] = useState("");
  const [customRtmpUrl, setCustomRtmpUrl] = useState("");
  const [showStreamKey, setShowStreamKey] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [activeRestreams, setActiveRestreams] = useState<ActiveRestream[]>([]);

  const handleStartRestream = () => {
    if (!selectedPlatform || !streamKey) {
      toast.error("Please select a platform and enter your stream key");
      return;
    }

    const rtmpUrl = selectedPlatform.id === "custom" ? customRtmpUrl : selectedPlatform.rtmpUrl;

    startTransition(async () => {
      try {
        const result = await startRestream(
          roomName,
          selectedPlatform.id,
          rtmpUrl,
          streamKey
        );

        setActiveRestreams((prev) => [
          ...prev,
          {
            platform: selectedPlatform.name,
            egressId: result.egressId,
            startedAt: new Date(),
          },
        ]);

        toast.success(`Now streaming to ${selectedPlatform.name}`);
        setStreamKey("");
        setSelectedPlatform(null);
        setIsOpen(false);
      } catch (error) {
        toast.error(`Failed to start ${selectedPlatform.name} stream`);
      }
    });
  };

  const handleStopRestream = (egressId: string, platformName: string) => {
    startTransition(async () => {
      try {
        await stopRestream(egressId);
        setActiveRestreams((prev) => prev.filter((r) => r.egressId !== egressId));
        toast.success(`Stopped streaming to ${platformName}`);
      } catch (error) {
        toast.error("Failed to stop restream");
      }
    });
  };

  if (!isHost) return null;

  return (
    <div className="relative">
      {/* Active restreams indicator */}
      {activeRestreams.length > 0 && (
        <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-500 border-2 border-[#18181b]" />
      )}

      <motion.button
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 px-3 py-2 bg-[#26262c] hover:bg-[#3a3a3d] text-white rounded-lg font-medium text-sm transition-colors"
      >
        <Share2 className="h-4 w-4" />
        <span className="hidden sm:inline">Restream</span>
        {activeRestreams.length > 0 && (
          <span className="px-1.5 py-0.5 bg-green-500/20 text-green-400 text-xs rounded">
            {activeRestreams.length}
          </span>
        )}
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-[#18181b] border border-[#3a3a3d] rounded-xl shadow-2xl z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 border-b border-[#3a3a3d] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#9147ff]/20 rounded-lg">
                    <Share2 className="h-5 w-5 text-[#9147ff]" />
                  </div>
                  <div>
                    <h2 className="text-white font-semibold">Multistream</h2>
                    <p className="text-[#adadb8] text-sm">
                      Stream to multiple platforms simultaneously
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-[#26262c] rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-[#adadb8]" />
                </button>
              </div>

              {/* Active Restreams */}
              {activeRestreams.length > 0 && (
                <div className="p-4 border-b border-[#3a3a3d] bg-[#0e0e10]">
                  <p className="text-xs text-[#adadb8] uppercase tracking-wide mb-3">
                    Active Streams
                  </p>
                  <div className="space-y-2">
                    {activeRestreams.map((restream) => (
                      <div
                        key={restream.egressId}
                        className="flex items-center justify-between p-2 bg-[#26262c] rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                          <span className="text-white text-sm">{restream.platform}</span>
                        </div>
                        <button
                          onClick={() => handleStopRestream(restream.egressId, restream.platform)}
                          disabled={isPending}
                          className="px-2 py-1 text-xs text-red-400 hover:bg-red-500/20 rounded transition-colors"
                        >
                          Stop
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Platform Selection */}
              <div className="p-4">
                <p className="text-xs text-[#adadb8] uppercase tracking-wide mb-3">
                  Add Platform
                </p>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {PLATFORMS.map((platform) => {
                    const Icon = platform.icon;
                    const isSelected = selectedPlatform?.id === platform.id;
                    const isActive = activeRestreams.some(
                      (r) => r.platform === platform.name
                    );

                    return (
                      <motion.button
                        key={platform.id}
                        onClick={() => setSelectedPlatform(platform)}
                        disabled={isActive}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`
                          p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2
                          ${isSelected
                            ? "border-[#9147ff] bg-[#9147ff]/10"
                            : "border-[#3a3a3d] hover:border-[#4a4a4d] bg-[#26262c]"
                          }
                          ${isActive ? "opacity-50 cursor-not-allowed" : ""}
                        `}
                      >
                        <Icon
                          className="h-6 w-6"
                          style={{ color: platform.color }}
                        />
                        <span className="text-white text-xs font-medium">
                          {platform.name.split(" ")[0]}
                        </span>
                        {isActive && (
                          <span className="text-green-400 text-xs">Live</span>
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Stream Key Input */}
                {selectedPlatform && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3"
                  >
                    <div>
                      <label className="text-sm text-[#adadb8] mb-1.5 block">
                        Stream Key
                      </label>
                      <div className="relative">
                        <input
                          type={showStreamKey ? "text" : "password"}
                          value={streamKey}
                          onChange={(e) => setStreamKey(e.target.value)}
                          placeholder={selectedPlatform.streamKeyPlaceholder}
                          className="w-full px-3 py-2 pr-20 bg-[#26262c] border border-[#3a3a3d] rounded-lg text-white text-sm placeholder:text-[#666] focus:outline-none focus:border-[#9147ff] transition-colors"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setShowStreamKey(!showStreamKey)}
                            className="p-1 hover:bg-[#3a3a3d] rounded transition-colors"
                          >
                            {showStreamKey ? (
                              <EyeOff className="h-4 w-4 text-[#adadb8]" />
                            ) : (
                              <Eye className="h-4 w-4 text-[#adadb8]" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(streamKey);
                              toast.success("Copied to clipboard");
                            }}
                            className="p-1 hover:bg-[#3a3a3d] rounded transition-colors"
                          >
                            <Copy className="h-4 w-4 text-[#adadb8]" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <a
                      href={selectedPlatform.helpUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-[#9147ff] hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Get your {selectedPlatform.name} stream key
                    </a>

                    <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <AlertCircle className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-yellow-200/80">
                        Your stream key is sensitive. Never share it publicly.
                        Restreaming may be against platform terms of service.
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-[#3a3a3d] bg-[#0e0e10] flex justify-end gap-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-[#adadb8] hover:text-white hover:bg-[#26262c] rounded-lg text-sm transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  onClick={handleStartRestream}
                  disabled={!selectedPlatform || !streamKey || isPending}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 bg-[#9147ff] hover:bg-[#772ce8] text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Starting...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Start Streaming
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}


