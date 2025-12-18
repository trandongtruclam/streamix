"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Room,
  RoomEvent,
  VideoPresets,
  createLocalVideoTrack,
  createLocalAudioTrack,
  LocalVideoTrack,
  LocalAudioTrack,
  Track,
} from "livekit-client";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Radio,
  Square,
  Settings,
  Loader2,
  Monitor,
  Camera,
  RefreshCcw,
  AlertCircle,
  Check,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

import { setStreamLiveStatus } from "@/actions/stream";

interface BrowserBroadcastProps {
  token: string;
  serverUrl: string;
  username: string;
}

type StreamState = "idle" | "preview" | "connecting" | "live";

interface DeviceInfo {
  deviceId: string;
  label: string;
}

export function BrowserBroadcast({ token, serverUrl, username }: BrowserBroadcastProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const roomRef = useRef<Room | null>(null);
  
  const [streamState, setStreamState] = useState<StreamState>("idle");
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [videoTrack, setVideoTrack] = useState<LocalVideoTrack | null>(null);
  const [audioTrack, setAudioTrack] = useState<LocalAudioTrack | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  
  // Device selection
  const [videoDevices, setVideoDevices] = useState<DeviceInfo[]>([]);
  const [audioDevices, setAudioDevices] = useState<DeviceInfo[]>([]);
  const [selectedVideoDevice, setSelectedVideoDevice] = useState<string>("");
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string>("");
  
  // Quality settings
  const [quality, setQuality] = useState<"720p" | "1080p" | "480p">("720p");

  // Get available devices
  useEffect(() => {
    const getDevices = async () => {
      try {
        // Request permissions first
        await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        
        const devices = await navigator.mediaDevices.enumerateDevices();
        
        const videoInputs = devices
          .filter(d => d.kind === "videoinput")
          .map(d => ({ deviceId: d.deviceId, label: d.label || `Camera ${d.deviceId.slice(0, 5)}` }));
        
        const audioInputs = devices
          .filter(d => d.kind === "audioinput")
          .map(d => ({ deviceId: d.deviceId, label: d.label || `Microphone ${d.deviceId.slice(0, 5)}` }));
        
        setVideoDevices(videoInputs);
        setAudioDevices(audioInputs);
        
        if (videoInputs.length > 0) setSelectedVideoDevice(videoInputs[0].deviceId);
        if (audioInputs.length > 0) setSelectedAudioDevice(audioInputs[0].deviceId);
      } catch (error) {
        console.error("Failed to get devices:", error);
        toast.error("Failed to access camera/microphone");
      }
    };

    getDevices();
  }, []);

  // Start preview
  const startPreview = useCallback(async () => {
    try {
      const videoPreset = quality === "1080p" 
        ? VideoPresets.h1080 
        : quality === "720p" 
          ? VideoPresets.h720 
          : VideoPresets.h540;

      console.log("Starting preview with device:", selectedVideoDevice);

      const video = await createLocalVideoTrack({
        deviceId: selectedVideoDevice || undefined,
        resolution: videoPreset.resolution,
      });

      const audio = await createLocalAudioTrack({
        deviceId: selectedAudioDevice || undefined,
        echoCancellation: true,
        noiseSuppression: true,
      });

      console.log("Tracks created:", { video, audio });

      setVideoTrack(video);
      setAudioTrack(audio);

      // Attach video to preview element after state is set
      if (videoRef.current) {
        video.attach(videoRef.current);
        console.log("Video attached to element");
      }

      // Set state to preview AFTER tracks are ready
      setStreamState("preview");
      toast.success("Preview ready");
    } catch (error) {
      console.error("Failed to start preview:", error);
      toast.error("Failed to start preview: " + (error instanceof Error ? error.message : "Unknown error"));
      setStreamState("idle");
    }
  }, [selectedVideoDevice, selectedAudioDevice, quality]);

  // Stop preview
  const stopPreview = useCallback(() => {
    if (videoTrack) {
      videoTrack.stop();
      if (videoRef.current) {
        videoTrack.detach(videoRef.current);
      }
      setVideoTrack(null);
    }
    if (audioTrack) {
      audioTrack.stop();
      setAudioTrack(null);
    }
    setStreamState("idle");
  }, [videoTrack, audioTrack]);

  // Go live
  const goLive = useCallback(async () => {
    if (!videoTrack || !audioTrack || !token || !serverUrl) {
      toast.error("Missing required data to go live");
      return;
    }

    try {
      setStreamState("connecting");

      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
        videoCaptureDefaults: {
          resolution: quality === "1080p" 
            ? VideoPresets.h1080.resolution 
            : quality === "720p" 
              ? VideoPresets.h720.resolution 
              : VideoPresets.h540.resolution,
        },
      });

      roomRef.current = room;

      room.on(RoomEvent.Disconnected, async () => {
        setStreamState("preview");
        // Update stream status to offline when disconnected
        try {
          await setStreamLiveStatus(false);
        } catch (e) {
          console.error("Failed to update stream status:", e);
        }
        toast.info("Disconnected from stream");
      });

      room.on(RoomEvent.Reconnecting, () => {
        toast.info("Reconnecting...");
      });

      room.on(RoomEvent.Reconnected, () => {
        toast.success("Reconnected!");
      });

      await room.connect(serverUrl, token);

      // Publish tracks
      await room.localParticipant.publishTrack(videoTrack, {
        name: "camera",
        source: Track.Source.Camera,
      });

      await room.localParticipant.publishTrack(audioTrack, {
        name: "microphone",
        source: Track.Source.Microphone,
      });

      // Update stream status to live in database
      await setStreamLiveStatus(true);

      setStreamState("live");
      toast.success("You are now live!");
    } catch (error) {
      console.error("Failed to go live:", error);
      toast.error("Failed to start broadcast");
      setStreamState("preview");
    }
  }, [videoTrack, audioTrack, token, serverUrl, quality]);

  // Stop broadcast
  const stopBroadcast = useCallback(async () => {
    try {
      // Update stream status to offline first
      await setStreamLiveStatus(false);
    } catch (e) {
      console.error("Failed to update stream status:", e);
    }
    
    if (roomRef.current) {
      await roomRef.current.disconnect();
      roomRef.current = null;
    }
    setStreamState("preview");
    toast.success("Broadcast ended");
  }, []);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (videoTrack) {
      if (isVideoEnabled) {
        videoTrack.mute();
      } else {
        videoTrack.unmute();
      }
      setIsVideoEnabled(!isVideoEnabled);
    }
  }, [videoTrack, isVideoEnabled]);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    if (audioTrack) {
      if (isAudioEnabled) {
        audioTrack.mute();
      } else {
        audioTrack.unmute();
      }
      setIsAudioEnabled(!isAudioEnabled);
    }
  }, [audioTrack, isAudioEnabled]);

  // Switch camera
  const switchCamera = useCallback(async () => {
    if (!videoTrack) return;
    
    const currentIndex = videoDevices.findIndex(d => d.deviceId === selectedVideoDevice);
    const nextIndex = (currentIndex + 1) % videoDevices.length;
    const nextDevice = videoDevices[nextIndex];
    
    if (nextDevice) {
      try {
        await videoTrack.restartTrack({
          deviceId: nextDevice.deviceId,
        });
        setSelectedVideoDevice(nextDevice.deviceId);
        toast.success(`Switched to ${nextDevice.label}`);
      } catch (error) {
        toast.error("Failed to switch camera");
      }
    }
  }, [videoTrack, videoDevices, selectedVideoDevice]);

  // Track stream state in a ref for cleanup
  const streamStateRef = useRef<StreamState>(streamState);
  useEffect(() => {
    streamStateRef.current = streamState;
  }, [streamState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Stop preview tracks
      if (videoTrack) {
        videoTrack.stop();
      }
      if (audioTrack) {
        audioTrack.stop();
      }
      
      // If we were live, update status and disconnect
      if (roomRef.current) {
        // Update stream status to offline if we were live
        if (streamStateRef.current === "live") {
          setStreamLiveStatus(false).catch(console.error);
        }
        roomRef.current.disconnect();
        roomRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-[#18181b] rounded-xl overflow-hidden">
      {/* Video Preview */}
      <div className="relative aspect-video bg-black">
        {streamState === "idle" ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Camera className="h-16 w-16 text-[#3a3a3d] mb-4" />
            <p className="text-[#adadb8] text-lg mb-2">Start your broadcast</p>
            <p className="text-[#666] text-sm mb-6">
              Share your camera with viewers
            </p>
            <motion.button
              onClick={startPreview}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 bg-[#9147ff] hover:bg-[#772ce8] text-white rounded-lg font-medium flex items-center gap-2"
            >
              <Video className="h-5 w-5" />
              Start Preview
            </motion.button>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className={`w-full h-full object-cover ${!isVideoEnabled ? "hidden" : ""}`}
            />
            
            {!isVideoEnabled && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <VideoOff className="h-16 w-16 text-[#666] mx-auto mb-2" />
                  <p className="text-[#adadb8]">Camera off</p>
                </div>
              </div>
            )}

            {/* Status Badge */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              {streamState === "live" ? (
                <div className="flex items-center gap-1.5 bg-red-500 px-2.5 py-1 rounded-md">
                  <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                  <span className="text-white text-sm font-bold">LIVE</span>
                </div>
              ) : streamState === "connecting" ? (
                <div className="flex items-center gap-1.5 bg-yellow-500 px-2.5 py-1 rounded-md">
                  <Loader2 className="h-4 w-4 text-white animate-spin" />
                  <span className="text-white text-sm font-medium">Connecting...</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 bg-[#26262c] px-2.5 py-1 rounded-md">
                  <span className="text-[#adadb8] text-sm font-medium">Preview</span>
                </div>
              )}
            </div>

            {/* Switch camera button */}
            {videoDevices.length > 1 && streamState === "preview" && (
              <button
                onClick={switchCamera}
                className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-lg transition-colors"
              >
                <RefreshCcw className="h-5 w-5 text-white" />
              </button>
            )}
          </>
        )}
      </div>

      {/* Controls */}
      {streamState !== "idle" && (
        <div className="p-4 border-t border-[#3a3a3d]">
          <div className="flex items-center justify-between">
            {/* Media Controls */}
            <div className="flex items-center gap-2">
              <motion.button
                onClick={toggleVideo}
                whileTap={{ scale: 0.95 }}
                className={`p-3 rounded-full transition-colors ${
                  isVideoEnabled 
                    ? "bg-[#26262c] hover:bg-[#3a3a3d] text-white" 
                    : "bg-red-500/20 text-red-500"
                }`}
              >
                {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
              </motion.button>

              <motion.button
                onClick={toggleAudio}
                whileTap={{ scale: 0.95 }}
                className={`p-3 rounded-full transition-colors ${
                  isAudioEnabled 
                    ? "bg-[#26262c] hover:bg-[#3a3a3d] text-white" 
                    : "bg-red-500/20 text-red-500"
                }`}
              >
                {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
              </motion.button>

              <motion.button
                onClick={() => setShowSettings(!showSettings)}
                whileTap={{ scale: 0.95 }}
                className="p-3 rounded-full bg-[#26262c] hover:bg-[#3a3a3d] text-white transition-colors"
              >
                <Settings className="h-5 w-5" />
              </motion.button>
            </div>

            {/* Broadcast Controls */}
            <div className="flex items-center gap-2">
              {streamState === "preview" && (
                <>
                  <button
                    onClick={stopPreview}
                    className="px-4 py-2 text-[#adadb8] hover:text-white hover:bg-[#26262c] rounded-lg transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <motion.button
                    onClick={goLive}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium flex items-center gap-2"
                  >
                    <Radio className="h-5 w-5" />
                    Go Live
                  </motion.button>
                </>
              )}

              {streamState === "connecting" && (
                <button
                  disabled
                  className="px-6 py-2 bg-[#26262c] text-[#adadb8] rounded-lg font-medium flex items-center gap-2"
                >
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Connecting...
                </button>
              )}

              {streamState === "live" && (
                <motion.button
                  onClick={stopBroadcast}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium flex items-center gap-2"
                >
                  <Square className="h-5 w-5 fill-current" />
                  End Stream
                </motion.button>
              )}
            </div>
          </div>

          {/* Settings Panel */}
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-[#3a3a3d] space-y-4"
              >
                {/* Quality Selection */}
                <div>
                  <label className="text-sm text-[#adadb8] mb-2 block">Quality</label>
                  <div className="flex gap-2">
                    {(["480p", "720p", "1080p"] as const).map((q) => (
                      <button
                        key={q}
                        onClick={() => setQuality(q)}
                        disabled={streamState === "live"}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          quality === q
                            ? "bg-[#9147ff] text-white"
                            : "bg-[#26262c] text-[#adadb8] hover:bg-[#3a3a3d]"
                        } ${streamState === "live" ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Device Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-[#adadb8] mb-2 block">Camera</label>
                    <select
                      value={selectedVideoDevice}
                      onChange={(e) => setSelectedVideoDevice(e.target.value)}
                      disabled={streamState === "live"}
                      className="w-full px-3 py-2 bg-[#26262c] border border-[#3a3a3d] rounded-lg text-white text-sm focus:outline-none focus:border-[#9147ff] disabled:opacity-50"
                    >
                      {videoDevices.map((device) => (
                        <option key={device.deviceId} value={device.deviceId}>
                          {device.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm text-[#adadb8] mb-2 block">Microphone</label>
                    <select
                      value={selectedAudioDevice}
                      onChange={(e) => setSelectedAudioDevice(e.target.value)}
                      disabled={streamState === "live"}
                      className="w-full px-3 py-2 bg-[#26262c] border border-[#3a3a3d] rounded-lg text-white text-sm focus:outline-none focus:border-[#9147ff] disabled:opacity-50"
                    >
                      {audioDevices.map((device) => (
                        <option key={device.deviceId} value={device.deviceId}>
                          {device.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
