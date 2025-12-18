"use client";

import React from "react";
import { Users } from "lucide-react";

import { VerifiedMark } from "@/components/verified-mark";

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
      <div className="flex items-center gap-x-4">
        <div className="flex items-center gap-x-2 bg-[#26262c] rounded-lg px-3 py-2">
          <Users className="h-4 w-4 text-[#9147ff]" />
          <div className="text-sm">
            <span className="font-bold text-white">
              {followedByCount.toLocaleString()}
            </span>{" "}
            <span className="text-[#adadb8]">{followedByLabel}</span>
          </div>
        </div>
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
