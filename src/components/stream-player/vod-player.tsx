"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  SkipBack,
  SkipForward,
  Loader2,
  AlertCircle,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface VodPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  autoPlay?: boolean;
}

interface QualityLevel {
  height: number;
  width: number;
  bitrate: number;
  index: number;
}

export function VodPlayer({ src, poster, title, autoPlay = false }: VodPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [qualityLevels, setQualityLevels] = useState<QualityLevel[]>([]);
  const [currentQuality, setCurrentQuality] = useState<number>(-1); // -1 = auto
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  // Initialize video player (HLS or MP4)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Check if source is MP4 or HLS
    const isMP4 = src.endsWith(".mp4") || src.includes(".mp4");
    const isHLS = src.endsWith(".m3u8") || src.includes(".m3u8") || src.includes("playlist.m3u8");

    if (isMP4) {
      // Direct MP4 playback
      video.src = src;
      video.addEventListener("loadedmetadata", () => {
        setIsLoading(false);
        if (autoPlay) {
          video.play().catch(() => {});
        }
      });
      video.addEventListener("error", () => {
        setError("Failed to load video");
        setIsLoading(false);
      });

      return () => {
        video.removeEventListener("loadedmetadata", () => {});
        video.removeEventListener("error", () => {});
      };
    } else if (isHLS) {
      // HLS playback
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90,
        });

        hlsRef.current = hls;
        hls.loadSource(src);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
          setQualityLevels(
            data.levels.map((level, index) => ({
              height: level.height,
              width: level.width,
              bitrate: level.bitrate,
              index,
            }))
          );
          setIsLoading(false);
          if (autoPlay) {
            video.play().catch(() => {});
          }
        });

        hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
          setCurrentQuality(data.level);
        });

        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                setError("Network error occurred");
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                setError("Media error occurred");
                hls.recoverMediaError();
                break;
              default:
                setError("An error occurred");
                hls.destroy();
                break;
            }
          }
        });

        return () => {
          hls.destroy();
        };
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // Native HLS support (Safari)
        video.src = src;
        video.addEventListener("loadedmetadata", () => {
          setIsLoading(false);
          if (autoPlay) {
            video.play().catch(() => {});
          }
        });
      }
    } else {
      // Try to play as direct video (fallback)
      video.src = src;
      video.addEventListener("loadedmetadata", () => {
        setIsLoading(false);
        if (autoPlay) {
          video.play().catch(() => {});
        }
      });
      video.addEventListener("error", () => {
        setError("Failed to load video");
        setIsLoading(false);
      });
    }
  }, [src, autoPlay]);

  // Video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (video.buffered.length > 0) {
        setBuffered(video.buffered.end(video.buffered.length - 1));
      }
    };

    const handleDurationChange = () => setDuration(video.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleWaiting = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("durationchange", handleDurationChange);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("canplay", handleCanPlay);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("durationchange", handleDurationChange);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("canplay", handleCanPlay);
    };
  }, []);

  // Hide controls after inactivity
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      if (isPlaying) {
        timeout = setTimeout(() => setShowControls(false), 3000);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
      container.addEventListener("mouseleave", () => {
        if (isPlaying) setShowControls(false);
      });
    }

    return () => {
      clearTimeout(timeout);
      if (container) {
        container.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, [isPlaying]);

  // Fullscreen handling
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  }, [isMuted]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    
    const newVolume = parseFloat(e.target.value);
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  }, []);

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    const progress = progressRef.current;
    if (!video || !progress) return;

    const rect = progress.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    video.currentTime = pos * duration;
  }, [duration]);

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    if (isFullscreen) {
      document.exitFullscreen();
    } else {
      container.requestFullscreen();
    }
  }, [isFullscreen]);

  const handleQualityChange = useCallback((index: number) => {
    if (!hlsRef.current) return; // Only works for HLS
    
    if (index === -1) {
      hlsRef.current.currentLevel = -1; // Auto
    } else {
      hlsRef.current.currentLevel = index;
    }
    setShowSettings(false);
  }, []);

  const handleSpeedChange = useCallback((speed: number) => {
    const video = videoRef.current;
    if (!video) return;
    
    video.playbackRate = speed;
    setPlaybackSpeed(speed);
    setShowSettings(false);
  }, []);

  const skip = useCallback((seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    
    video.currentTime = Math.max(0, Math.min(duration, video.currentTime + seconds));
  }, [duration]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatBitrate = (bitrate: number) => {
    if (bitrate >= 1000000) {
      return `${(bitrate / 1000000).toFixed(1)} Mbps`;
    }
    return `${Math.round(bitrate / 1000)} Kbps`;
  };

  if (error) {
    return (
      <div className="aspect-video bg-[#18181b] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
          <p className="text-white font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-[#9147ff] text-white rounded-lg text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative aspect-video bg-black group cursor-pointer"
      onClick={togglePlay}
    >
      <video
        ref={videoRef}
        poster={poster}
        className="w-full h-full object-contain"
        playsInline
      />

      {/* Loading spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <Loader2 className="h-12 w-12 text-white animate-spin" />
        </div>
      )}

      {/* Play button overlay */}
      {!isPlaying && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-4 bg-white/20 backdrop-blur-sm rounded-full"
          >
            <Play className="h-12 w-12 text-white fill-white" />
          </motion.div>
        </div>
      )}

      {/* Controls overlay */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top gradient */}
            <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/70 to-transparent">
              {title && (
                <p className="p-4 text-white font-medium truncate">{title}</p>
              )}
            </div>

            {/* Bottom gradient & controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
              {/* Progress bar */}
              <div
                ref={progressRef}
                className="px-4 py-2 cursor-pointer group/progress"
                onClick={handleSeek}
              >
                <div className="relative h-1 bg-white/30 rounded-full overflow-hidden">
                  {/* Buffered */}
                  <div
                    className="absolute h-full bg-white/40"
                    style={{ width: `${(buffered / duration) * 100}%` }}
                  />
                  {/* Progress */}
                  <div
                    className="absolute h-full bg-[#9147ff]"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  />
                  {/* Thumb */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-[#9147ff] rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity"
                    style={{ left: `calc(${(currentTime / duration) * 100}% - 6px)` }}
                  />
                </div>
              </div>

              {/* Control buttons */}
              <div className="flex items-center justify-between px-4 pb-3">
                <div className="flex items-center gap-2">
                  {/* Play/Pause */}
                  <button
                    onClick={togglePlay}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                    {isPlaying ? (
                      <Pause className="h-5 w-5 text-white" />
                    ) : (
                      <Play className="h-5 w-5 text-white fill-white" />
                    )}
                  </button>

                  {/* Skip back */}
                  <button
                    onClick={() => skip(-10)}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <SkipBack className="h-5 w-5 text-white" />
                  </button>

                  {/* Skip forward */}
                  <button
                    onClick={() => skip(10)}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <SkipForward className="h-5 w-5 text-white" />
                  </button>

                  {/* Volume */}
                  <div className="flex items-center gap-2 group/volume">
                    <button
                      onClick={toggleMute}
                      className="p-2 hover:bg-white/20 rounded-full transition-colors"
                    >
                      {isMuted || volume === 0 ? (
                        <VolumeX className="h-5 w-5 text-white" />
                      ) : (
                        <Volume2 className="h-5 w-5 text-white" />
                      )}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-0 group-hover/volume:w-20 transition-all duration-200 accent-[#9147ff]"
                    />
                  </div>

                  {/* Time */}
                  <span className="text-white text-sm tabular-nums ml-2">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Settings */}
                  <div className="relative">
                    <button
                      onClick={() => setShowSettings(!showSettings)}
                      className="p-2 hover:bg-white/20 rounded-full transition-colors"
                    >
                      <Settings className="h-5 w-5 text-white" />
                    </button>

                    <AnimatePresence>
                      {showSettings && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute bottom-full right-0 mb-2 w-48 bg-[#18181b] border border-[#3a3a3d] rounded-lg shadow-xl overflow-hidden"
                        >
                          {/* Quality - Only show for HLS */}
                          {qualityLevels.length > 0 && (
                            <div className="p-2 border-b border-[#3a3a3d]">
                              <p className="text-xs text-[#adadb8] px-2 py-1">Quality</p>
                              <button
                                onClick={() => handleQualityChange(-1)}
                                className={`w-full px-2 py-1.5 text-sm text-left rounded flex items-center justify-between ${
                                  currentQuality === -1 ? "text-white bg-[#26262c]" : "text-[#adadb8] hover:bg-[#26262c]"
                                }`}
                              >
                                Auto
                                {currentQuality === -1 && <Check className="h-4 w-4" />}
                              </button>
                              {qualityLevels.map((level) => (
                                <button
                                  key={level.index}
                                  onClick={() => handleQualityChange(level.index)}
                                  className={`w-full px-2 py-1.5 text-sm text-left rounded flex items-center justify-between ${
                                    currentQuality === level.index ? "text-white bg-[#26262c]" : "text-[#adadb8] hover:bg-[#26262c]"
                                  }`}
                                >
                                  {level.height}p
                                  {currentQuality === level.index && <Check className="h-4 w-4" />}
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Speed */}
                          <div className="p-2">
                            <p className="text-xs text-[#adadb8] px-2 py-1">Speed</p>
                            {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                              <button
                                key={speed}
                                onClick={() => handleSpeedChange(speed)}
                                className={`w-full px-2 py-1.5 text-sm text-left rounded flex items-center justify-between ${
                                  playbackSpeed === speed ? "text-white bg-[#26262c]" : "text-[#adadb8] hover:bg-[#26262c]"
                                }`}
                              >
                                {speed}x
                                {playbackSpeed === speed && <Check className="h-4 w-4" />}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Fullscreen */}
                  <button
                    onClick={toggleFullscreen}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  >
                    {isFullscreen ? (
                      <Minimize className="h-5 w-5 text-white" />
                    ) : (
                      <Maximize className="h-5 w-5 text-white" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
