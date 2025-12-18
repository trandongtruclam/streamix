"use client";

import React from "react";
import { Video, AlertCircle } from "lucide-react";

import { VodPlayer } from "@/components/stream-player/vod-player";

interface VodPlayerClientProps {
  src: string;
  title?: string;
  poster?: string;
}

export function VodPlayerClient({ src, title, poster }: VodPlayerClientProps) {
  // If no HLS URL provided, show placeholder
  if (!src) {
    return (
      <div className="aspect-video bg-[#18181b] flex items-center justify-center">
        <div className="text-center">
          <Video className="h-16 w-16 text-[#3a3a3d] mx-auto mb-4" />
          <p className="text-white font-medium mb-2">Video Unavailable</p>
          <p className="text-[#adadb8] text-sm">This video is not available for playback</p>
        </div>
      </div>
    );
  }

  return (
    <VodPlayer
      src={src}
      title={title}
      poster={poster}
      autoPlay={false}
    />
  );
}
