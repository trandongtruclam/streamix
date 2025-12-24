"use client";

import React from "react";
import Link from "next/link";
import { Users, Video } from "lucide-react";

import { VerifiedMark } from "@/components/verified-mark";
import { Button } from "@/components/ui/button";

import { BioModal } from "./bio-modal";

export function AboutCard({
  bio,
  followedByCount,
  hostIdentity,
  hostName,
  viewerIdentity,
}: {
  hostName: string;
  hostIdentity: string;
  viewerIdentity: string;
  bio: string | null;
  followedByCount: number;
}) {
  const hostAsViewer = `host-${hostIdentity}`;
  const isHost = viewerIdentity === hostAsViewer;

  const followedByLabel = followedByCount === 1 ? "follower" : "followers";

  return (
    <div className="rounded-xl bg-[#1f1f23] border border-[#2f2f35] p-6 flex flex-col gap-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-2 font-bold text-lg text-white">
          <span>About</span>
          <span className="text-[#bf94ff]">{hostName}</span>
          <VerifiedMark />
        </div>
        {isHost && <BioModal initialValue={bio} />}
      </div>
      
      {/* Stats row */}
      <div className="flex items-center gap-x-4 flex-wrap">
        <div className="flex items-center gap-x-2 bg-[#26262c] rounded-lg px-3 py-2">
          <Users className="h-4 w-4 text-[#9147ff]" />
          <div className="text-sm">
            <span className="font-bold text-white">
              {followedByCount.toLocaleString()}
            </span>{" "}
            <span className="text-[#adadb8]">{followedByLabel}</span>
          </div>
        </div>
        
        {/* Videos Button - Always visible */}
        <Button
          asChild
          variant="outline"
          className="gap-x-2 bg-[#26262c] border-[#35353b] hover:bg-[#9147ff]/10 hover:border-[#9147ff] text-white"
        >
          <Link href={`/${hostName}/videos`}>
            <Video className="h-4 w-4 text-[#9147ff]" />
            <span className="font-medium">Watch Videos</span>
          </Link>
        </Button>
      </div>
      
      {/* Bio section */}
      <div className="border-t border-[#2f2f35] pt-4">
        <p className="text-sm text-[#efeff1] leading-relaxed whitespace-pre-wrap">
          {bio || (
            <span className="text-[#adadb8] italic">
              This streamer hasn&apos;t added a bio yet.
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
