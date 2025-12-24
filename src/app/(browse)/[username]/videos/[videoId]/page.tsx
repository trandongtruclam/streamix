import React from "react";
import { ArrowLeft, Share2, Download, Flag } from "lucide-react";
import Link from "next/link";

import { getUserByUsername } from "@/lib/user-service";
import { getRecordingById } from "@/lib/recording-service";
import { UserAvatar } from "@/components/user-avatar";
import { VodPlayerClient } from "./_components/vod-player-client";

export default async function VideoPage({
  params,
}: {
  params: Promise<{ username: string; videoId: string }>;
}) {
  const { username, videoId } = await params;
  const user = await getUserByUsername(username);

  if (!user) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-[#adadb8]">User not found</p>
      </div>
    );
  }

  // Fetch recording from database
  const recording = await getRecordingById(videoId);

  if (!recording || recording.user.username !== username) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-[#adadb8]">Video not found</p>
      </div>
    );
  }

  const video = {
    id: recording.id,
    title: recording.title || `Stream Recording - ${new Date(recording.createdAt).toLocaleDateString()}`,
    description: `Recorded on ${new Date(recording.createdAt).toLocaleDateString()}`,
    fileUrl: recording.fileUrl || "",
    duration: recording.duration || 0,
    views: 0, // TODO: Add views tracking
    createdAt: recording.createdAt,
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Back button */}
      <div className="p-4">
        <Link 
          href={`/${username}/videos`}
          className="inline-flex items-center gap-2 text-[#adadb8] hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">Back to videos</span>
        </Link>
      </div>

      {/* Video Player */}
      <div className="bg-black">
        {video.fileUrl ? (
          <VodPlayerClient 
            src={video.fileUrl}
            title={video.title}
          />
        ) : (
          <div className="aspect-video flex items-center justify-center">
            <p className="text-[#adadb8]">Video is still processing...</p>
          </div>
        )}
      </div>

      {/* Video Info */}
      <div className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-xl lg:text-2xl font-bold text-white mb-2">
              {video.title}
            </h1>
            
            <div className="flex items-center gap-4 text-sm text-[#adadb8] mb-4">
              <span>{video.views.toLocaleString()} views</span>
              <span>•</span>
              <span>
                {video.createdAt.toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>

            {/* Channel info */}
            <div className="flex items-center gap-3">
              <UserAvatar
                username={user.username}
                imageUrl={user.imageUrl}
                size="md"
              />
              <div>
                <Link 
                  href={`/${username}`}
                  className="text-white font-semibold hover:text-[#bf94ff] transition-colors"
                >
                  {user.username}
                </Link>
                <p className="text-[#adadb8] text-sm">
                  {user._count?.followedBy || 0} followers
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-[#26262c] hover:bg-[#3a3a3d] text-white rounded-lg transition-colors">
              <Share2 className="h-4 w-4" />
              <span className="text-sm">Share</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#26262c] hover:bg-[#3a3a3d] text-white rounded-lg transition-colors">
              <Download className="h-4 w-4" />
              <span className="text-sm">Download</span>
            </button>
            <button className="p-2 bg-[#26262c] hover:bg-[#3a3a3d] text-[#adadb8] rounded-lg transition-colors">
              <Flag className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Description */}
        {video.description && (
          <div className="mt-6 p-4 bg-[#1f1f23] rounded-lg">
            <p className="text-[#dedee3] whitespace-pre-wrap">{video.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}
