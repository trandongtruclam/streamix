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
  Activity,
  Eye,
  MessageSquare,
  Heart,
  Signal,
  Gauge,
  ArrowUp,
  ArrowDown,
  Zap,
  Monitor,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { TIME, BITRATE } from "@/lib/constants";

interface StreamAnalyticsProps {
  hostIdentity: string;
  streamStartTime?: Date;
}

export function StreamAnalytics({
  hostIdentity,
  streamStartTime,
}: StreamAnalyticsProps) {
  const participants = useParticipants();
  const participant = useRemoteParticipant(hostIdentity);
  const { quality } = useConnectionQualityIndicator({ participant });
  const room = useRoomContext();

  const [peakViewers, setPeakViewers] = useState(0);
  const [totalViews, setTotalViews] = useState(0);
  const [chatMessages] = useState(0);
  const [reactions] = useState(0);
  const [streamDuration, setStreamDuration] = useState(0);
  const [bitrate, setBitrate] = useState(0);
  const [fps, setFps] = useState(0);
  const [resolution, setResolution] = useState({ width: 0, height: 0 });
  const [viewerHistory, setViewerHistory] = useState<
    Array<{ time: number; viewers: number }>
  >([]);

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
      setStreamDuration(
        Math.floor((Date.now() - streamStartTime.getTime()) / 1000)
      );
    }, TIME.STREAM_DURATION_UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, [streamStartTime]);

  // Track viewer history for chart
  useEffect(() => {
    if (!streamStartTime) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor(
        (Date.now() - streamStartTime.getTime()) / 1000
      );
      setViewerHistory((prev) => {
        const newHistory = [
          ...prev,
          { time: elapsed, viewers: currentViewers },
        ];
        // Keep last 60 data points (1 per minute if updating every second)
        return newHistory.slice(-60);
      });
    }, TIME.STREAM_DURATION_UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, [streamStartTime, currentViewers]);

  // Track room stats
  useEffect(() => {
    if (!room) return;

    const handleStats = async () => {
      try {
        // Get local participant video track stats
        const videoTracks = room.localParticipant
          ?.getTrackPublications()
          .filter((pub) => pub.kind === "video" && pub.track);

        if (videoTracks && videoTracks.length > 0) {
          const videoTrack = videoTracks[0].track;
          if (videoTrack && "getRTCStatsReport" in videoTrack) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const stats = await (videoTrack as any).getRTCStatsReport();

            if (stats) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              stats.forEach((report: any) => {
                if (report.type === "outbound-rtp" && report.kind === "video") {
                  setBitrate(Math.round(((report.bytesSent || 0) * 8) / 1000)); // kbps
                  setFps(report.framesPerSecond || 0);
                  setResolution({
                    width: report.frameWidth || 0,
                    height: report.frameHeight || 0,
                  });
                }
              });
            }
          }
        }
      } catch {
        // Stats not available
      }
    };

    const interval = setInterval(handleStats, TIME.STATS_UPDATE_INTERVAL);
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
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatBitrate = (kbps: number) => {
    if (kbps >= BITRATE.MBPS_THRESHOLD / 1000) {
      return `${(kbps / 1000).toFixed(1)} Mbps`;
    }
    return `${kbps} Kbps`;
  };

  const getConnectionQuality = () => {
    switch (quality) {
      case ConnectionQuality.Excellent:
        return {
          label: "Excellent",
          color: "text-green-500",
          bg: "bg-green-500/20",
        };
      case ConnectionQuality.Good:
        return {
          label: "Good",
          color: "text-green-400",
          bg: "bg-green-400/20",
        };
      case ConnectionQuality.Poor:
        return {
          label: "Poor",
          color: "text-yellow-500",
          bg: "bg-yellow-500/20",
        };
      case ConnectionQuality.Lost:
        return { label: "Lost", color: "text-red-500", bg: "bg-red-500/20" };
      default:
        return {
          label: "Unknown",
          color: "text-[#adadb8]",
          bg: "bg-[#adadb8]/20",
        };
    }
  };

  const connectionInfo = getConnectionQuality();
  const maxViewers = Math.max(
    ...viewerHistory.map((h) => h.viewers),
    peakViewers,
    1
  );

  return (
    <div className="space-y-6">
      {/* Header Section - YouTube Studio Style */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">
            Live Stream Analytics
          </h1>
          <p className="text-[#adadb8] text-sm">
            Real-time performance metrics
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 border border-red-500/30 rounded-lg">
          <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-red-400 text-sm font-medium">LIVE</span>
        </div>
      </div>

      {/* Key Metrics Grid - YouTube Style Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={Eye}
          label="Current Viewers"
          value={currentViewers}
          trend={currentViewers > 0 ? "up" : undefined}
          iconColor="text-red-500"
          iconBg="bg-red-500/20"
        />
        <MetricCard
          icon={TrendingUp}
          label="Peak Viewers"
          value={peakViewers}
          iconColor="text-green-500"
          iconBg="bg-green-500/20"
        />
        <MetricCard
          icon={Users}
          label="Total Views"
          value={totalViews}
          iconColor="text-blue-500"
          iconBg="bg-blue-500/20"
        />
        <MetricCard
          icon={Clock}
          label="Stream Duration"
          value={formatDuration(streamDuration)}
          isText
          iconColor="text-purple-500"
          iconBg="bg-purple-500/20"
        />
      </div>

      {/* Viewer Chart Section - YouTube Studio Style */}
      <div className="bg-[#1f1f23] border border-[#3a3a3d] rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-white mb-1">
              Viewer Count
            </h2>
            <p className="text-[#adadb8] text-sm">Real-time viewer activity</p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-[#9147ff]" />
              <span className="text-[#adadb8]">Viewers</span>
            </div>
          </div>
        </div>
        <ViewerChart history={viewerHistory} maxViewers={maxViewers} />
      </div>

      {/* Engagement & Technical Stats - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement Metrics */}
        <div className="bg-[#1f1f23] border border-[#3a3a3d] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <Activity className="h-5 w-5 text-[#9147ff]" />
            Engagement
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <EngagementCard
              icon={MessageSquare}
              label="Chat Messages"
              value={chatMessages}
              iconColor="text-blue-500"
              iconBg="bg-blue-500/20"
            />
            <EngagementCard
              icon={Heart}
              label="Reactions"
              value={reactions}
              iconColor="text-pink-500"
              iconBg="bg-pink-500/20"
            />
          </div>
        </div>

        {/* Stream Health */}
        <div className="bg-[#1f1f23] border border-[#3a3a3d] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <Monitor className="h-5 w-5 text-[#9147ff]" />
            Stream Health
          </h2>
          <div className="space-y-4">
            <HealthMetric
              icon={Signal}
              label="Connection Quality"
              value={connectionInfo.label}
              iconColor={connectionInfo.color}
              iconBg={connectionInfo.bg}
            />
            <HealthMetric
              icon={Gauge}
              label="Bitrate"
              value={bitrate > 0 ? formatBitrate(bitrate) : "—"}
              iconColor="text-[#9147ff]"
              iconBg="bg-[#9147ff]/20"
            />
            <HealthMetric
              icon={Zap}
              label="FPS"
              value={fps > 0 ? `${fps} fps` : "—"}
              iconColor="text-yellow-500"
              iconBg="bg-yellow-500/20"
            />
            <HealthMetric
              icon={Monitor}
              label="Resolution"
              value={
                resolution.width > 0
                  ? `${resolution.width}x${resolution.height}`
                  : "—"
              }
              iconColor="text-green-500"
              iconBg="bg-green-500/20"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Metric Card Component - YouTube Style
function MetricCard({
  icon: Icon,
  label,
  value,
  trend,
  isText = false,
  iconColor,
  iconBg,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  trend?: "up" | "down";
  isText?: boolean;
  iconColor: string;
  iconBg: string;
}) {
  return (
    <div className="bg-[#1f1f23] border border-[#3a3a3d] rounded-xl p-5 hover:border-[#9147ff]/50 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2.5 rounded-lg ${iconBg}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 text-xs font-medium ${
              trend === "up" ? "text-green-500" : "text-red-500"
            }`}
          >
            {trend === "up" ? (
              <ArrowUp className="h-3.5 w-3.5" />
            ) : (
              <ArrowDown className="h-3.5 w-3.5" />
            )}
          </div>
        )}
      </div>
      <AnimatePresence mode="popLayout">
        <motion.p
          key={String(value)}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="text-white text-2xl font-bold tabular-nums mb-1"
        >
          {isText
            ? value
            : typeof value === "number"
            ? value.toLocaleString()
            : value}
        </motion.p>
      </AnimatePresence>
      <p className="text-[#adadb8] text-sm">{label}</p>
    </div>
  );
}

// Engagement Card
function EngagementCard({
  icon: Icon,
  label,
  value,
  iconColor,
  iconBg,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  iconColor: string;
  iconBg: string;
}) {
  return (
    <div className="bg-[#26262c] rounded-lg p-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${iconBg}`}>
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
        <div>
          <p className="text-white text-xl font-bold tabular-nums">
            {value.toLocaleString()}
          </p>
          <p className="text-[#adadb8] text-xs">{label}</p>
        </div>
      </div>
    </div>
  );
}

// Health Metric
function HealthMetric({
  icon: Icon,
  label,
  value,
  iconColor,
  iconBg,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  iconColor: string;
  iconBg: string;
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-[#26262c] rounded-lg">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${iconBg}`}>
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
        <span className="text-[#adadb8] text-sm">{label}</span>
      </div>
      <span className="text-white text-sm font-semibold">{value}</span>
    </div>
  );
}

// Viewer Chart - YouTube Studio Style
function ViewerChart({
  history,
  maxViewers,
}: {
  history: Array<{ time: number; viewers: number }>;
  maxViewers: number;
}) {
  if (history.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center border border-[#3a3a3d] rounded-lg bg-[#18181b]">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 text-[#3a3a3d] mx-auto mb-2" />
          <p className="text-[#adadb8] text-sm">Collecting viewer data...</p>
        </div>
      </div>
    );
  }

  // Group data points for better visualization (every 5 seconds)
  const groupedData = history.filter(
    (_, i) => i % 5 === 0 || i === history.length - 1
  );

  return (
    <div className="relative">
      <div className="h-64 flex items-end gap-1 border border-[#3a3a3d] rounded-lg bg-[#18181b] p-4">
        {groupedData.map((point, i) => {
          const height =
            maxViewers > 0 ? (point.viewers / maxViewers) * 100 : 0;
          return (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${Math.max(height, 2)}%` }}
              transition={{ duration: 0.3 }}
              className="flex-1 bg-gradient-to-t from-[#9147ff] to-[#bf94ff] rounded-t hover:from-[#772ce8] hover:to-[#9147ff] transition-all min-h-[2px] group relative"
            >
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-[#1f1f23] border border-[#3a3a3d] rounded px-2 py-1 text-xs text-white whitespace-nowrap">
                  {point.viewers} viewers
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      {/* Time labels */}
      <div className="flex justify-between mt-2 text-xs text-[#adadb8] px-4">
        <span>Start</span>
        <span>Now</span>
      </div>
    </div>
  );
}

// Compact Analytics Badge for overlay
export function AnalyticsBadge() {
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
