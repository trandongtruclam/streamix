"use client";

import { useEffect, useState } from "react";
import {
  LiveKitRoom,
  useParticipants,
  useTracks,
  VideoTrack,
  useLocalParticipant,
  useRoomContext,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  MonitorOff,
  PhoneOff,
  Settings,
  Users,
  MessageSquare,
  Heart,
  Send,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Custom Video Conference Component
function CustomVideoConference() {
  const participants = useParticipants();
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );

  const [isChatOpen, setIsChatOpen] = useState(true);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    { id: 1, user: "Viewer123", text: "Amazing stream!", timestamp: "2m ago" },
    { id: 2, user: "GamerPro", text: "How do you do that?", timestamp: "1m ago" },
    { id: 3, user: "Fan2024", text: "🔥🔥🔥", timestamp: "30s ago" },
  ]);

  const handleSendMessage = () => {
    if (message.trim()) {
      setMessages([
        ...messages,
        {
          id: messages.length + 1,
          user: "You",
          text: message,
          timestamp: "now",
        },
      ]);
      setMessage("");
    }
  };

  // Separate screen share and camera tracks
  const screenShareTrack = tracks.find(
    (track) => track.publication?.source === Track.Source.ScreenShare
  );
  const cameraTracks = tracks.filter(
    (track) => track.publication?.source === Track.Source.Camera
  );

  return (
    <div className="h-screen w-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex">
      {/* Main Video Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-slate-900/80 backdrop-blur-xl border-b border-purple-500/20 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-white font-semibold text-lg">LIVE</span>
              <span className="text-gray-400">|</span>
              <Users className="w-5 h-5 text-gray-400" />
              <span className="text-white font-medium">{participants.length}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              <Settings className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              <MoreVertical className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Video Display Area */}
        <div className="flex-1 relative bg-black">
          {/* Main Video (Screen Share or First Camera) */}
          <div className="absolute inset-0">
            {screenShareTrack ? (
              <VideoTrack
                trackRef={screenShareTrack}
                className="w-full h-full object-contain"
              />
            ) : cameraTracks.length > 0 ? (
              <VideoTrack
                trackRef={cameraTracks[0]}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-32 h-32 mx-auto bg-purple-600/20 rounded-full flex items-center justify-center">
                    <VideoOff className="w-16 h-16 text-purple-400" />
                  </div>
                  <p className="text-gray-400 text-lg">Camera is off</p>
                </div>
              </div>
            )}
          </div>

          {/* Small Camera View (when screen sharing) */}
          {screenShareTrack && cameraTracks.length > 0 && (
            <div className="absolute bottom-6 right-6 w-64 h-48 bg-slate-900 rounded-xl overflow-hidden border-2 border-purple-500/50 shadow-2xl">
              <VideoTrack
                trackRef={cameraTracks[0]}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Stream Info Overlay */}
          <div className="absolute top-6 left-6 bg-slate-900/90 backdrop-blur-xl rounded-xl px-6 py-4 border border-purple-500/30">
            <h2 className="text-white text-2xl font-bold mb-1">
              Epic Gaming Session
            </h2>
            <p className="text-gray-400">Playing Valorant • Just Chatting</p>
          </div>
        </div>

        {/* Control Bar */}
        <ControlBar />
      </div>

      {/* Chat Sidebar */}
      {isChatOpen && (
        <div className="w-96 bg-slate-900/95 backdrop-blur-xl border-l border-purple-500/20 flex flex-col">
          {/* Chat Header */}
          <div className="px-6 py-4 border-b border-purple-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-purple-400" />
                <h3 className="text-white font-semibold">Stream Chat</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsChatOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className="group">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {msg.user[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="text-purple-400 font-semibold text-sm">
                          {msg.user}
                        </span>
                        <span className="text-gray-500 text-xs">
                          {msg.timestamp}
                        </span>
                      </div>
                      <p className="text-gray-200 text-sm mt-1 break-words">
                        {msg.text}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-purple-500/20">
            <div className="flex gap-2">
              <Input
                placeholder="Send a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                className="bg-slate-800 border-purple-500/30 text-white placeholder:text-gray-500"
              />
              <Button
                onClick={handleSendMessage}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex gap-2 mt-3">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
              >
                <Heart className="w-4 h-4 mr-1" />
                Like
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Chat Button (when closed) */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="absolute top-20 right-6 bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg transition-all hover:scale-110"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}

// Control Bar Component
function ControlBar() {
  const { localParticipant } = useLocalParticipant();
  const room = useRoomContext();
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const toggleMic = () => {
    localParticipant.setMicrophoneEnabled(!isMicOn);
    setIsMicOn(!isMicOn);
  };

  const toggleCamera = () => {
    localParticipant.setCameraEnabled(!isCameraOn);
    setIsCameraOn(!isCameraOn);
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      await localParticipant.setScreenShareEnabled(false);
      setIsScreenSharing(false);
    } else {
      await localParticipant.setScreenShareEnabled(true);
      setIsScreenSharing(true);
    }
  };

  const leaveRoom = () => {
    room.disconnect();
    window.location.href = "/";
  };

  return (
    <div className="bg-slate-900/95 backdrop-blur-xl border-t border-purple-500/20 px-6 py-6">
      <div className="flex items-center justify-center gap-4">
        {/* Microphone Toggle */}
        <button
          onClick={toggleMic}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-110 ${
            isMicOn
              ? "bg-slate-700 hover:bg-slate-600 text-white"
              : "bg-red-600 hover:bg-red-700 text-white"
          }`}
        >
          {isMicOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
        </button>

        {/* Camera Toggle */}
        <button
          onClick={toggleCamera}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-110 ${
            isCameraOn
              ? "bg-slate-700 hover:bg-slate-600 text-white"
              : "bg-red-600 hover:bg-red-700 text-white"
          }`}
        >
          {isCameraOn ? (
            <Video className="w-6 h-6" />
          ) : (
            <VideoOff className="w-6 h-6" />
          )}
        </button>

        {/* Screen Share Toggle */}
        <button
          onClick={toggleScreenShare}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-110 ${
            isScreenSharing
              ? "bg-purple-600 hover:bg-purple-700 text-white"
              : "bg-slate-700 hover:bg-slate-600 text-white"
          }`}
        >
          {isScreenSharing ? (
            <MonitorOff className="w-6 h-6" />
          ) : (
            <Monitor className="w-6 h-6" />
          )}
        </button>

        {/* Leave Button */}
        <button
          onClick={leaveRoom}
          className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-all hover:scale-110 ml-4"
        >
          <PhoneOff className="w-6 h-6" />
        </button>
      </div>

      {/* Status Text */}
      <div className="text-center mt-4 text-gray-400 text-sm">
        {!isMicOn && !isCameraOn && "Mic and Camera are off"}
        {!isMicOn && isCameraOn && "Microphone is off"}
        {isMicOn && !isCameraOn && "Camera is off"}
        {isScreenSharing && " • Screen sharing active"}
      </div>
    </div>
  );
}

// Main Live Page Component
export default function LivePage() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const fetchToken = async () => {
      const res = await fetch(`/api/token?identity=dat&room=test`);
      const data = await res.json();
      setToken(data.token);
    };
    fetchToken();
  }, []);

  if (!token) {
    return (
      <div className="h-screen w-full bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-white text-xl">Connecting to stream...</p>
          <p className="text-gray-400">Please wait</p>
        </div>
      </div>
    );
  }

  return (
    <LiveKitRoom
      token={token}
      serverUrl="ws://localhost:7880"
      connect={true}
      video={true}
      audio={true}
      data-lk-theme="default"
      className="h-screen w-full"
    >
      <CustomVideoConference />
    </LiveKitRoom>
  );
}