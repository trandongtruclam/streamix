"use client";

import React, { useEffect, useState } from "react";
import {
  useParticipants,
  useConnectionQualityIndicator,
  useRemoteParticipant,
  useRoomContext,
} from "@livekit/components-react";
import { ConnectionQuality, RoomEvent } from "livekit-client";
import {
  BarChart3,
  Users,
  Clock,
  TrendingUp,
  TrendingDown,
  Activity,
  Wifi,
  WifiOff,
  Eye,
  MessageSquare,
  Heart,
  Signal,
  Gauge,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface StreamAnalyticsProps {
  hostIdentity: string;
  streamStartTime?: Date;
}

export function StreamAnalytics({ hostIdentity, streamStartTime }: StreamAnalyticsProps) {
  const participants = useParticipants();
  const participant = useRemoteParticipant(hostIdentity);
  const { quality } = useConnectionQualityIndicator({ participant });
  const room = useRoomContext();
  
  const [peakViewers, setPeakViewers] = useState(0);
  const [totalViews, setTotalViews] = useState(0);
  const [chatMessages, setChatMessages] = useState(0);
  const [reactions, setReactions] = useState(0);
  const [streamDuration, setStreamDuration] = useState(0);
  const [avgViewDuration, setAvgViewDuration] = useState(0);
  const [bitrate, setBitrate] = useState(0);
  const [fps, setFps] = useState(0);
  const [resolution, setResolution] = useState({ width: 0, height: 0 });

  const currentViewers = Math.max(0, participants.length - 1);

  // Track peak viewers
  useEffect(() => {
    if (currentViewers > peakViewers) {
      setPeakViewers(currentViewers);
    }
  }, [currentViewers, peakViewers]);

  // Track stream duration
  useEffect(() => {
    if (!streamStartTime) return;
    
    const interval = setInterval(() => {
      setStreamDuration(Math.floor((Date.now() - streamStartTime.getTime()) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [streamStartTime]);

  // Track room stats
  useEffect(() => {
    if (!room) return;

    const handleStats = async () => {
      try {
        // Get local participant stats if available
        const stats = await room.localParticipant?.getTrackPublicationBySid(
          room.localParticipant.videoTrackPublications.values().next().value?.sid || ""
        )?.track?.getRTCStatsReport();
        
        if (stats) {
          stats.forEach((report) => {
            if (report.type === "outbound-rtp" && report.kind === "video") {
              setBitrate(Math.round((report.bytesSent || 0) * 8 / 1000)); // kbps
              setFps(report.framesPerSecond || 0);
              setResolution({
                width: report.frameWidth || 0,
                height: report.frameHeight || 0,
              });
            }
          });
        }
      } catch (e) {
        // Stats not available
      }
    };

    const interval = setInterval(handleStats, 2000);
    return () => clearInterval(interval);
  }, [room]);

  // Track participant joins for total views
  useEffect(() => {
    if (!room) return;

    const handleParticipantJoined = () => {
      setTotalViews((prev) => prev + 1);
    };

    room.on(RoomEvent.ParticipantConnected, handleParticipantJoined);
    return () => {
      room.off(RoomEvent.ParticipantConnected, handleParticipantJoined);
    };
  }, [room]);

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    return `${mins}m ${secs}s`;
  };

  const formatBitrate = (kbps: number) => {
    if (kbps >= 1000) {
      return `${(kbps / 1000).toFixed(1)} Mbps`;
    }
    return `${kbps} Kbps`;
  };

  const getConnectionColor = () => {
    switch (quality) {
      case ConnectionQuality.Excellent:
        return "text-green-500";
      case ConnectionQuality.Good:
        return "text-green-400";
      case ConnectionQuality.Poor:
        return "text-yellow-500";
      case ConnectionQuality.Lost:
        return "text-red-500";
      default:
        return "text-[#adadb8]";
    }
  };

  return (
    <div className="bg-[#1f1f23] border border-[#3a3a3d] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[#3a3a3d]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-[#9147ff]" />
            <h2 className="text-white font-semibold">Stream Analytics</h2>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-green-400">Live</span>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="p-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Current Viewers */}
        <StatCard
          icon={Eye}
          iconColor="text-red-500"
          label="Current Viewers"
          value={currentViewers}
          trend={currentViewers > 0 ? "up" : undefined}
        />

        {/* Peak Viewers */}
        <StatCard
          icon={TrendingUp}
          iconColor="text-green-500"
          label="Peak Viewers"
          value={peakViewers}
        />

        {/* Total Views */}
        <StatCard
          icon={Users}
          iconColor="text-blue-500"
          label="Total Views"
          value={totalViews}
        />

        {/* Stream Duration */}
        <StatCard
          icon={Clock}
          iconColor="text-purple-500"
          label="Duration"
          value={formatDuration(streamDuration)}
          isText
        />
      </div>

      {/* Technical Stats */}
      <div className="p-4 border-t border-[#3a3a3d]">
        <p className="text-xs text-[#adadb8] uppercase tracking-wide mb-3">
          Stream Health
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Connection Quality */}
          <div className="p-3 bg-[#26262c] rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Signal className={`h-4 w-4 ${getConnectionColor()}`} />
              <span className="text-xs text-[#adadb8]">Connection</span>
            </div>
            <p className={`text-sm font-semibold ${getConnectionColor()}`}>
              {quality === ConnectionQuality.Excellent ? "Excellent" :
               quality === ConnectionQuality.Good ? "Good" :
               quality === ConnectionQuality.Poor ? "Poor" : "Unknown"}
            </p>
          </div>

          {/* Bitrate */}
          <div className="p-3 bg-[#26262c] rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Gauge className="h-4 w-4 text-[#adadb8]" />
              <span className="text-xs text-[#adadb8]">Bitrate</span>
            </div>
            <p className="text-white text-sm font-semibold">
              {bitrate > 0 ? formatBitrate(bitrate) : "—"}
            </p>
          </div>

          {/* FPS */}
          <div className="p-3 bg-[#26262c] rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="h-4 w-4 text-[#adadb8]" />
              <span className="text-xs text-[#adadb8]">FPS</span>
            </div>
            <p className="text-white text-sm font-semibold">
              {fps > 0 ? `${fps} fps` : "—"}
            </p>
          </div>

          {/* Resolution */}
          <div className="p-3 bg-[#26262c] rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="h-4 w-4 text-[#adadb8]" />
              <span className="text-xs text-[#adadb8]">Resolution</span>
            </div>
            <p className="text-white text-sm font-semibold">
              {resolution.width > 0 ? `${resolution.width}x${resolution.height}` : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Engagement Stats */}
      <div className="p-4 border-t border-[#3a3a3d]">
        <p className="text-xs text-[#adadb8] uppercase tracking-wide mb-3">
          Engagement
        </p>
        <div className="grid grid-cols-2 gap-3">
          {/* Chat Messages */}
          <div className="p-3 bg-[#26262c] rounded-lg flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <MessageSquare className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-white text-lg font-semibold">{chatMessages}</p>
              <p className="text-[#adadb8] text-xs">Chat Messages</p>
            </div>
          </div>

          {/* Reactions */}
          <div className="p-3 bg-[#26262c] rounded-lg flex items-center gap-3">
            <div className="p-2 bg-pink-500/20 rounded-lg">
              <Heart className="h-5 w-5 text-pink-500" />
            </div>
            <div>
              <p className="text-white text-lg font-semibold">{reactions}</p>
              <p className="text-[#adadb8] text-xs">Reactions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Viewer Chart Placeholder */}
      <div className="p-4 border-t border-[#3a3a3d]">
        <p className="text-xs text-[#adadb8] uppercase tracking-wide mb-3">
          Viewer Timeline
        </p>
        <ViewerChart currentViewers={currentViewers} />
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({
  icon: Icon,
  iconColor,
  label,
  value,
  trend,
  isText = false,
}: {
  icon: React.ElementType;
  iconColor: string;
  label: string;
  value: number | string;
  trend?: "up" | "down";
  isText?: boolean;
}) {
  return (
    <div className="p-3 bg-[#26262c] rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <Icon className={`h-5 w-5 ${iconColor}`} />
        {trend && (
          <span className={trend === "up" ? "text-green-500" : "text-red-500"}>
            {trend === "up" ? (
              <ArrowUp className="h-4 w-4" />
            ) : (
              <ArrowDown className="h-4 w-4" />
            )}
          </span>
        )}
      </div>
      <AnimatePresence mode="popLayout">
        <motion.p
          key={String(value)}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="text-white text-xl font-bold tabular-nums"
        >
          {isText ? value : typeof value === "number" ? value.toLocaleString() : value}
        </motion.p>
      </AnimatePresence>
      <p className="text-[#adadb8] text-xs mt-1">{label}</p>
    </div>
  );
}

// Simple Viewer Chart
function ViewerChart({ currentViewers }: { currentViewers: number }) {
  const [history, setHistory] = useState<number[]>([]);

  useEffect(() => {
    setHistory((prev) => {
      const newHistory = [...prev, currentViewers];
      // Keep last 20 data points
      return newHistory.slice(-20);
    });
  }, [currentViewers]);

  const maxViewers = Math.max(...history, 1);

  return (
    <div className="h-16 flex items-end gap-1">
      {history.map((viewers, i) => (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          animate={{ height: `${(viewers / maxViewers) * 100}%` }}
          className="flex-1 bg-[#9147ff]/60 rounded-t min-h-[4px]"
        />
      ))}
      {history.length === 0 && (
        <div className="flex-1 flex items-center justify-center text-[#adadb8] text-xs">
          No data yet
        </div>
      )}
    </div>
  );
}

// Compact Analytics Badge for overlay
export function AnalyticsBadge({ hostIdentity }: { hostIdentity: string }) {
  const participants = useParticipants();
  const viewerCount = Math.max(0, participants.length - 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-lg"
    >
      <div className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
        <span className="text-white text-xs font-bold">LIVE</span>
      </div>
      <div className="h-4 w-px bg-white/20" />
      <div className="flex items-center gap-1">
        <Eye className="h-3.5 w-3.5 text-white/70" />
        <span className="text-white text-xs font-medium tabular-nums">
          {viewerCount.toLocaleString()}
        </span>
      </div>
    </motion.div>
  );
}


