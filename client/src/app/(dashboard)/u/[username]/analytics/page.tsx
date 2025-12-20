import React from "react";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock, 
  Eye,
  Heart,
  MessageSquare,
  Calendar,
} from "lucide-react";

import { getSelf } from "@/lib/auth-service";
import { getStreamByUserId } from "@/lib/stream-service";

export default async function AnalyticsPage() {
  const self = await getSelf();
  const stream = await getStreamByUserId(self.id);

  if (!stream) {
    throw new Error("No stream found");
  }

  // Mock data for now - in production, you'd fetch this from your database
  const stats = {
    totalStreams: 12,
    totalViewers: 1543,
    avgViewers: 128,
    totalWatchTime: 4320, // minutes
    peakViewers: 342,
    followers: 856,
    chatMessages: 2341,
    reactions: 1205,
  };

  const recentStreams = [
    { id: 1, date: "2024-12-15", duration: 180, peakViewers: 234, avgViewers: 156 },
    { id: 2, date: "2024-12-13", duration: 240, peakViewers: 342, avgViewers: 198 },
    { id: 3, date: "2024-12-10", duration: 120, peakViewers: 189, avgViewers: 112 },
    { id: 4, date: "2024-12-08", duration: 90, peakViewers: 145, avgViewers: 89 },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-[#9147ff]/20 rounded-lg">
            <BarChart3 className="h-6 w-6 text-[#9147ff]" />
          </div>
          <h1 className="text-2xl font-bold text-white">Stream Analytics</h1>
        </div>
        <p className="text-[#adadb8]">
          Track your stream performance and audience engagement
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard 
          icon={Eye}
          iconColor="text-red-500"
          iconBg="bg-red-500/20"
          label="Total Views"
          value={stats.totalViewers.toLocaleString()}
          change="+12%"
          changeType="up"
        />
        <StatCard 
          icon={Users}
          iconColor="text-blue-500"
          iconBg="bg-blue-500/20"
          label="Followers"
          value={stats.followers.toLocaleString()}
          change="+8%"
          changeType="up"
        />
        <StatCard 
          icon={Clock}
          iconColor="text-purple-500"
          iconBg="bg-purple-500/20"
          label="Watch Time"
          value={`${Math.round(stats.totalWatchTime / 60)}h`}
          change="+15%"
          changeType="up"
        />
        <StatCard 
          icon={TrendingUp}
          iconColor="text-green-500"
          iconBg="bg-green-500/20"
          label="Peak Viewers"
          value={stats.peakViewers.toLocaleString()}
          change="+5%"
          changeType="up"
        />
      </div>

      {/* Engagement Stats */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-[#1f1f23] border border-[#3a3a3d] rounded-xl p-6">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Heart className="h-5 w-5 text-pink-500" />
            Engagement
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-[#26262c] rounded-lg">
              <p className="text-[#adadb8] text-sm mb-1">Chat Messages</p>
              <p className="text-white text-2xl font-bold">{stats.chatMessages.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-[#26262c] rounded-lg">
              <p className="text-[#adadb8] text-sm mb-1">Reactions</p>
              <p className="text-white text-2xl font-bold">{stats.reactions.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-[#26262c] rounded-lg">
              <p className="text-[#adadb8] text-sm mb-1">Avg Viewers</p>
              <p className="text-white text-2xl font-bold">{stats.avgViewers}</p>
            </div>
            <div className="p-4 bg-[#26262c] rounded-lg">
              <p className="text-[#adadb8] text-sm mb-1">Total Streams</p>
              <p className="text-white text-2xl font-bold">{stats.totalStreams}</p>
            </div>
          </div>
        </div>

        {/* Viewer Chart Placeholder */}
        <div className="bg-[#1f1f23] border border-[#3a3a3d] rounded-xl p-6">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Viewer Trend (Last 7 Days)
          </h2>
          <div className="h-48 flex items-end gap-2">
            {[45, 62, 38, 78, 95, 82, 100].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div 
                  className="w-full bg-[#9147ff]/60 rounded-t transition-all hover:bg-[#9147ff]"
                  style={{ height: `${height}%` }}
                />
                <span className="text-[#666] text-xs">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Streams */}
      <div className="bg-[#1f1f23] border border-[#3a3a3d] rounded-xl overflow-hidden">
        <div className="p-4 border-b border-[#3a3a3d]">
          <h2 className="text-white font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[#9147ff]" />
            Recent Streams
          </h2>
        </div>
        <div className="divide-y divide-[#3a3a3d]">
          {recentStreams.map((stream) => (
            <div key={stream.id} className="p-4 hover:bg-[#26262c] transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">
                    {new Date(stream.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-[#adadb8] text-sm">
                    Duration: {Math.floor(stream.duration / 60)}h {stream.duration % 60}m
                  </p>
                </div>
                <div className="flex gap-6 text-sm">
                  <div className="text-center">
                    <p className="text-[#adadb8]">Peak</p>
                    <p className="text-white font-semibold">{stream.peakViewers}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[#adadb8]">Average</p>
                    <p className="text-white font-semibold">{stream.avgViewers}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  iconColor,
  iconBg,
  label,
  value,
  change,
  changeType,
}: {
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  label: string;
  value: string;
  change: string;
  changeType: "up" | "down";
}) {
  return (
    <div className="bg-[#1f1f23] border border-[#3a3a3d] rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${iconBg}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        <span className={`text-xs font-medium ${
          changeType === "up" ? "text-green-500" : "text-red-500"
        }`}>
          {change}
        </span>
      </div>
      <p className="text-white text-2xl font-bold">{value}</p>
      <p className="text-[#adadb8] text-sm">{label}</p>
    </div>
  );
}

