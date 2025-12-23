"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Room,
  RoomEvent,
  VideoPresets,
  createLocalVideoTrack,
  createLocalAudioTrack,
  createLocalScreenTracks,
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
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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

export function BrowserBroadcast({ token, serverUrl }: BrowserBroadcastProps) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const roomRef = useRef<Room | null>(null);
  const isDisconnectingRef = useRef<boolean>(false); // Track if we're intentionally disconnecting

  const [streamState, setStreamState] = useState<StreamState>("idle");
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [videoTrack, setVideoTrack] = useState<LocalVideoTrack | null>(null);
  const [audioTrack, setAudioTrack] = useState<LocalAudioTrack | null>(null);
  const [screenShareTrack, setScreenShareTrack] =
    useState<LocalVideoTrack | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  // Video source type: 'camera' or 'screen'
  const [videoSource, setVideoSource] = useState<"camera" | "screen">("camera");

  // Device selection
  const [videoDevices, setVideoDevices] = useState<DeviceInfo[]>([]);
  const [audioDevices, setAudioDevices] = useState<DeviceInfo[]>([]);
  const [selectedVideoDevice, setSelectedVideoDevice] = useState<string>("");
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string>("");

  // Quality settings
  const [quality, setQuality] = useState<"720p" | "1080p" | "480p">("720p");

  // Get available devices - only enumerate, don't request permission yet
  useEffect(() => {
    const getDevices = async () => {
      try {
        // Try to enumerate devices (might fail if no permissions)
        const devices = await navigator.mediaDevices.enumerateDevices();

        const videoInputs = devices
          .filter((d) => d.kind === "videoinput")
          .map((d) => ({
            deviceId: d.deviceId,
            label: d.label || `Camera ${d.deviceId.slice(0, 8)}...`,
          }));

        const audioInputs = devices
          .filter((d) => d.kind === "audioinput")
          .map((d) => ({
            deviceId: d.deviceId,
            label: d.label || `Microphone ${d.deviceId.slice(0, 8)}...`,
          }));

        if (videoInputs.length > 0) {
          setVideoDevices(videoInputs);
          if (!selectedVideoDevice) {
            setSelectedVideoDevice(videoInputs[0].deviceId);
          }
        }

        if (audioInputs.length > 0) {
          setAudioDevices(audioInputs);
          if (!selectedAudioDevice) {
            setSelectedAudioDevice(audioInputs[0].deviceId);
          }
        }
      } catch (error) {
        console.error("Failed to enumerate devices:", error);
        // Don't show error, devices will be requested when starting preview
      }
    };

    getDevices();
  }, [selectedVideoDevice, selectedAudioDevice]);

  // Start preview
  const startPreview = useCallback(async () => {
    try {
      // Create audio track first (always needed)
      let audio: LocalAudioTrack;
      try {
        // Request microphone permission
        const audioStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        audioStream.getTracks().forEach((track) => track.stop());

        // Enumerate audio devices
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devices
          .filter((d) => d.kind === "audioinput")
          .map((d) => ({
            deviceId: d.deviceId,
            label: d.label || `Microphone ${d.deviceId.slice(0, 8)}...`,
          }));
        setAudioDevices(audioInputs);
        if (audioInputs.length > 0 && !selectedAudioDevice) {
          setSelectedAudioDevice(audioInputs[0].deviceId);
        }

        audio = await createLocalAudioTrack({
          deviceId: selectedAudioDevice || undefined,
          echoCancellation: true,
          noiseSuppression: true,
        });
        setAudioTrack(audio);
      } catch (permError) {
        console.error("Audio permission denied:", permError);
        toast.error(
          "Microphone access denied. Please allow access and try again."
        );
        setStreamState("idle");
        return;
      }

      // Create video track based on source type
      if (videoSource === "screen") {
        // Screen share
        try {
          toast.info("Select what to share...");
          const screenTracks = await createLocalScreenTracks({
            audio: false, // We already have audio track
            resolution:
              quality === "1080p"
                ? { width: 1920, height: 1080, frameRate: 30 }
                : quality === "720p"
                ? { width: 1280, height: 720, frameRate: 30 }
                : { width: 854, height: 480, frameRate: 30 },
          });

          const screenVideo = screenTracks.find(
            (t) => t.kind === "video"
          ) as LocalVideoTrack;
          if (screenVideo) {
            setScreenShareTrack(screenVideo);
            setVideoTrack(null); // Clear camera track
            setStreamState("preview");
            toast.success("Screen share preview ready!");

            // Listen for track ended (user clicks browser's stop sharing)
            screenVideo.on("ended", () => {
              stopPreview();
            });
          }
        } catch (screenError) {
          console.error("Screen share failed:", screenError);
          if (
            screenError instanceof Error &&
            screenError.name === "NotAllowedError"
          ) {
            toast.error("Screen sharing permission denied");
          } else {
            toast.error(
              "Failed to start screen share: " +
                (screenError instanceof Error
                  ? screenError.message
                  : "Unknown error")
            );
          }
          setStreamState("idle");
          if (audio) audio.stop();
          setAudioTrack(null);
          return;
        }
      } else {
        // Camera
        try {
          // Request camera permission
          toast.info("Requesting camera access...");
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
          stream.getTracks().forEach((track) => track.stop());

          // Enumerate video devices
          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoInputs = devices
            .filter((d) => d.kind === "videoinput")
            .map((d) => ({
              deviceId: d.deviceId,
              label: d.label || `Camera ${d.deviceId.slice(0, 8)}...`,
            }));
          setVideoDevices(videoInputs);
          if (videoInputs.length > 0 && !selectedVideoDevice) {
            setSelectedVideoDevice(videoInputs[0].deviceId);
          }

          const videoPreset =
            quality === "1080p"
              ? VideoPresets.h1080
              : quality === "720p"
              ? VideoPresets.h720
              : VideoPresets.h540;

          const video = await createLocalVideoTrack({
            deviceId: selectedVideoDevice || undefined,
            resolution: videoPreset.resolution,
          });

          setVideoTrack(video);
          setScreenShareTrack(null); // Clear screen share track
          setStreamState("preview");
          toast.success("Preview ready!");
        } catch (permError) {
          console.error("Camera permission denied:", permError);
          if (permError instanceof Error) {
            if (
              permError.name === "NotAllowedError" ||
              permError.name === "PermissionDeniedError"
            ) {
              toast.error(
                "Camera access denied. Please allow access and try again."
              );
            } else if (permError.name === "NotFoundError") {
              toast.error(
                "No camera found. Please connect a device and try again."
              );
            } else {
              toast.error("Failed to access camera: " + permError.message);
            }
          }
          setStreamState("idle");
          if (audio) audio.stop();
          setAudioTrack(null);
          return;
        }
      }
    } catch (error) {
      console.error("Failed to start preview:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error("Failed to start preview: " + errorMessage);
      setStreamState("idle");
    }
  }, [selectedVideoDevice, selectedAudioDevice, quality, videoSource]);

  // Stop preview
  const stopPreview = useCallback(() => {
    if (videoTrack) {
      videoTrack.stop();
      if (videoRef.current) {
        videoTrack.detach(videoRef.current);
      }
      setVideoTrack(null);
    }
    if (screenShareTrack) {
      screenShareTrack.stop();
      if (videoRef.current) {
        screenShareTrack.detach(videoRef.current);
      }
      setScreenShareTrack(null);
    }
    if (audioTrack) {
      audioTrack.stop();
      setAudioTrack(null);
    }
    setStreamState("idle");
  }, [videoTrack, screenShareTrack, audioTrack]);

  // Go live
  const goLive = useCallback(async () => {
    const currentVideoTrack = screenShareTrack || videoTrack;
    if (!currentVideoTrack || !audioTrack || !token || !serverUrl) {
      toast.error("Missing required data to go live");
      return;
    }

    try {
      setStreamState("connecting");

      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
        videoCaptureDefaults: {
          resolution:
            quality === "1080p"
              ? VideoPresets.h1080.resolution
              : quality === "720p"
              ? VideoPresets.h720.resolution
              : VideoPresets.h540.resolution,
        },
      });

      roomRef.current = room;

      room.on(RoomEvent.Disconnected, async (reason) => {
        // Only update status if we're not intentionally disconnecting
        if (!isDisconnectingRef.current) {
          console.log("Unexpected disconnect:", reason);
          setStreamState("preview");
          // Update stream status to offline when disconnected
          try {
            await setStreamLiveStatus(false);
            // Use setTimeout to avoid router.refresh during navigation
            setTimeout(() => {
              router.refresh();
            }, 100);
          } catch (e) {
            console.error("Failed to update stream status:", e);
          }
          toast.error("Disconnected from stream. Please try reconnecting.");
        } else {
          // Intentional disconnect, just reset state
          setStreamState("preview");
          isDisconnectingRef.current = false;
        }
      });

      room.on(RoomEvent.Reconnecting, () => {
        console.log("Reconnecting to room...");
        toast.info("Reconnecting...");
      });

      room.on(RoomEvent.Reconnected, () => {
        console.log("Reconnected to room");
        toast.success("Reconnected!");
        // Ensure stream status is still live after reconnection
        setStreamLiveStatus(true).catch(console.error);
      });

      // Handle connection errors
      room.on(RoomEvent.ConnectionQualityChanged, (quality, participant) => {
        if (participant?.isLocal && quality === "poor") {
          console.warn("Connection quality is poor");
        }
      });

      await room.connect(serverUrl, token);
      console.log(
        "Connected to room:",
        room.name,
        "as:",
        room.localParticipant.identity
      );

      // Publish video track (camera or screen share)
      await room.localParticipant.publishTrack(currentVideoTrack, {
        name: screenShareTrack ? "screen" : "camera",
        source: screenShareTrack
          ? Track.Source.ScreenShare
          : Track.Source.Camera,
      });
      console.log("Published video track");

      // Publish audio track
      await room.localParticipant.publishTrack(audioTrack, {
        name: "microphone",
        source: Track.Source.Microphone,
      });
      console.log("Published audio track");

      // Listen for participant events to detect when viewers join/leave
      room.on(RoomEvent.ParticipantConnected, (participant) => {
        const name = participant.name || participant.identity || "A viewer";
        console.log("Participant connected:", name);
        toast.success(`${name} joined your stream`);
      });

      room.on(RoomEvent.ParticipantDisconnected, (participant) => {
        const name = participant.name || participant.identity || "A viewer";
        console.log("Participant disconnected:", name);
        toast(`${name} left your stream`);
      });

      // Update stream status to live in database
      await setStreamLiveStatus(true);
      router.refresh(); // Refresh to update dashboard and other tabs

      setStreamState("live");
      toast.success("You are now live!");
    } catch (error) {
      console.error("Failed to go live:", error);
      toast.error("Failed to start broadcast");
      setStreamState("preview");
    }
  }, [
    videoTrack,
    screenShareTrack,
    audioTrack,
    token,
    serverUrl,
    quality,
    router,
  ]);

  // Stop broadcast
  const stopBroadcast = useCallback(async () => {
    isDisconnectingRef.current = true; // Mark as intentional disconnect

    try {
      // Update stream status to offline first
      await setStreamLiveStatus(false);
      // Use setTimeout to avoid router.refresh during navigation
      setTimeout(() => {
        router.refresh();
      }, 100);
    } catch (e) {
      console.error("Failed to update stream status:", e);
    }

    if (roomRef.current) {
      try {
        await roomRef.current.disconnect();
      } catch (e) {
        console.error("Error disconnecting room:", e);
      }
      roomRef.current = null;
    }
    setStreamState("preview");
    toast.success("Broadcast ended");
  }, [router]);

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

    const currentIndex = videoDevices.findIndex(
      (d) => d.deviceId === selectedVideoDevice
    );
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
        console.error("Failed to switch camera:", error);
        toast.error("Failed to switch camera");
      }
    }
  }, [videoTrack, videoDevices, selectedVideoDevice]);

  // Switch video source (camera <-> screen share)
  const switchVideoSource = useCallback(
    async (newSource: "camera" | "screen") => {
      if (newSource === videoSource) return;

      if (streamState === "preview") {
        // Stop current preview
        stopPreview();
        // Set new source
        setVideoSource(newSource);
        // Restart preview after a short delay
        setTimeout(() => {
          startPreview();
        }, 300);
      } else {
        // Just change source if not in preview
        setVideoSource(newSource);
      }
    },
    [videoSource, streamState, stopPreview, startPreview]
  );

  // Attach video track to video element when it changes
  useEffect(() => {
    const videoElement = videoRef.current;
    const currentTrack = screenShareTrack || videoTrack;

    if (currentTrack && videoElement) {
      currentTrack.attach(videoElement);
      // Ensure video plays
      videoElement.play().catch((err) => {
        console.error("Failed to play video:", err);
      });

      return () => {
        currentTrack.detach(videoElement);
      };
    }
  }, [videoTrack, screenShareTrack]);

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
        isDisconnectingRef.current = true; // Mark as intentional disconnect
        // Update stream status to offline if we were live
        if (streamStateRef.current === "live") {
          setStreamLiveStatus(false).catch(console.error);
        }
        try {
          roomRef.current.disconnect();
        } catch (e) {
          console.error("Error disconnecting on unmount:", e);
        }
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
          <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
            {videoSource === "camera" ? (
              <Camera className="h-16 w-16 text-[#3a3a3d] mb-4" />
            ) : (
              <Monitor className="h-16 w-16 text-[#3a3a3d] mb-4" />
            )}
            <p className="text-[#adadb8] text-lg mb-2">Start your broadcast</p>
            <p className="text-[#666] text-sm mb-4">
              {videoSource === "camera"
                ? "Share your camera with viewers"
                : "Share your screen with viewers"}
            </p>

            {/* Source selector */}
            <div className="flex items-center gap-2 mb-6 p-1 bg-[#26262c] rounded-lg border border-[#3a3a3d]">
              <motion.button
                onClick={() => setVideoSource("camera")}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                  videoSource === "camera"
                    ? "bg-[#9147ff] text-white"
                    : "text-[#adadb8] hover:text-white hover:bg-[#3a3a3d]"
                }`}
              >
                <Camera className="h-4 w-4" />
                Camera
              </motion.button>
              <motion.button
                onClick={() => setVideoSource("screen")}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                  videoSource === "screen"
                    ? "bg-[#9147ff] text-white"
                    : "text-[#adadb8] hover:text-white hover:bg-[#3a3a3d]"
                }`}
              >
                <Monitor className="h-4 w-4" />
                Screen Share
              </motion.button>
            </div>

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
              className={`w-full h-full object-cover ${
                !isVideoEnabled ? "hidden" : ""
              }`}
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
                  <span className="text-white text-sm font-medium">
                    Connecting...
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 bg-[#26262c] px-2.5 py-1 rounded-md">
                  <span className="text-[#adadb8] text-sm font-medium">
                    Preview
                  </span>
                </div>
              )}
            </div>

            {/* Switch source button - only show in preview mode */}
            {streamState === "preview" && (
              <div className="absolute top-4 right-4 flex items-center gap-2">
                {videoSource === "camera" && videoDevices.length > 1 && (
                  <button
                    onClick={switchCamera}
                    className="p-2 bg-black/50 hover:bg-black/70 rounded-lg transition-colors"
                    title="Switch camera"
                  >
                    <RefreshCcw className="h-5 w-5 text-white" />
                  </button>
                )}
                {/* Switch between camera and screen share */}
                <div className="flex items-center gap-1 p-1 bg-black/50 rounded-lg border border-white/10">
                  <button
                    onClick={() => switchVideoSource("camera")}
                    className={`p-1.5 rounded transition-colors ${
                      videoSource === "camera"
                        ? "bg-[#9147ff] text-white"
                        : "text-white/70 hover:text-white hover:bg-white/10"
                    }`}
                    title="Use camera"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => switchVideoSource("screen")}
                    className={`p-1.5 rounded transition-colors ${
                      videoSource === "screen"
                        ? "bg-[#9147ff] text-white"
                        : "text-white/70 hover:text-white hover:bg-white/10"
                    }`}
                    title="Share screen"
                  >
                    <Monitor className="h-4 w-4" />
                  </button>
                </div>
              </div>
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
                {isVideoEnabled ? (
                  <Video className="h-5 w-5" />
                ) : (
                  <VideoOff className="h-5 w-5" />
                )}
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
                {isAudioEnabled ? (
                  <Mic className="h-5 w-5" />
                ) : (
                  <MicOff className="h-5 w-5" />
                )}
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
                  <label className="text-sm text-[#adadb8] mb-2 block">
                    Quality
                  </label>
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
                        } ${
                          streamState === "live"
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Device Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-[#adadb8] mb-2 block">
                      Camera
                    </label>
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
                    <label className="text-sm text-[#adadb8] mb-2 block">
                      Microphone
                    </label>
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
