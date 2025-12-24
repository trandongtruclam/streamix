import React from "react";
import { Video, Play, Clock, Eye, Calendar } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import { getUserByUsername } from "@/lib/user-service";
import { getRecordingsByUsername } from "@/lib/recording-service";
import { Skeleton } from "@/components/ui/skeleton";

export default async function VideosPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const user = await getUserByUsername(username);

  if (!user) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-[#adadb8]">User not found</p>
      </div>
    );
  }

  // Fetch recordings from database
  const recordings = await getRecordingsByUsername(username);
  
  // Transform recordings to video format
  const videos = recordings.map((recording) => ({
    id: recording.id,
    title: recording.title || `Stream Recording - ${new Date(recording.createdAt).toLocaleDateString()}`,
    thumbnailUrl: null,
    duration: recording.duration || 0,
    views: 0, // TODO: Add views tracking
    createdAt: recording.createdAt,
    fileUrl: recording.fileUrl,
  }));

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-[#9147ff]/20 rounded-lg">
          <Video className="h-6 w-6 text-[#9147ff]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">{user.username}&apos;s Videos</h1>
          <p className="text-[#adadb8] text-sm">{videos.length} videos</p>
        </div>
      </div>

      {/* Videos Grid */}
      {videos.length === 0 ? (
        <div className="text-center py-20">
          <Video className="h-16 w-16 text-[#3a3a3d] mx-auto mb-4" />
          <p className="text-[#adadb8] text-lg">No videos yet</p>
          <p className="text-[#666] text-sm">Past broadcasts will appear here</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} username={username} />
          ))}
        </div>
      )}
    </div>
  );
}

interface VideoCardProps {
  video: {
    id: string;
    title: string;
    thumbnailUrl: string | null;
    duration: number;
    views: number;
    createdAt: Date;
    fileUrl?: string | null;
  };
  username: string;
}

function VideoCard({ video, username }: VideoCardProps) {
  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:00`;
    }
    return `${mins}:00`;
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    }
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <Link href={`/${username}/videos/${video.id}`}>
      <div className="group cursor-pointer">
        {/* Thumbnail */}
        <div className="relative aspect-video bg-[#26262c] rounded-lg overflow-hidden mb-2">
          {video.thumbnailUrl ? (
            <Image
              src={video.thumbnailUrl}
              alt={video.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Video className="h-12 w-12 text-[#3a3a3d]" />
            </div>
          )}
          
          {/* Play overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-full">
              <Play className="h-8 w-8 text-white fill-white" />
            </div>
          </div>

          {/* Duration badge */}
          {video.duration > 0 && (
            <div className="absolute bottom-2 right-2 bg-black/80 px-1.5 py-0.5 rounded text-white text-xs font-medium">
              {formatDuration(video.duration)}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-1">
          <h3 className="text-white font-medium text-sm line-clamp-2 group-hover:text-[#bf94ff] transition-colors">
            {video.title}
          </h3>
          <div className="flex items-center gap-3 text-[#adadb8] text-xs">
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {formatViews(video.views)} views
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(video.createdAt)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function VideoCardSkeleton() {
  return (
    <div>
      <Skeleton className="aspect-video w-full rounded-lg bg-[#26262c] mb-2" />
      <Skeleton className="h-4 w-3/4 bg-[#26262c] mb-1" />
      <Skeleton className="h-3 w-1/2 bg-[#26262c]" />
    </div>
  );
}
