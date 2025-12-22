"use client";

import React from "react";
import {
  useParticipants,
  useRemoteParticipant,
} from "@livekit/components-react";
import { Eye, Radio } from "lucide-react";

import { UserAvatar, UserAvatarSkeleton } from "@/components/user-avatar";
import { VerifiedMark } from "@/components/verified-mark";
import { Skeleton } from "@/components/ui/skeleton";

import { Actions, ActionsSkeleton } from "./actions";

export function Header({
  hostIdentity,
  hostName,
  imageUrl,
  isFollowing,
  name,
  viewerIdentity,
}: {
  imageUrl: string;
  hostName: string;
  hostIdentity: string;
  viewerIdentity: string;
  isFollowing: boolean;
  name: string;
}) {
  const participants = useParticipants();
  const participant = useRemoteParticipant(hostIdentity);

  const isLive = !!participant;
  const participantCount = participants.length - 1;

  const hostAsViewer = `host-${hostIdentity}`;
  const isHost = hostAsViewer === viewerIdentity;

  return (
    <div className="flex flex-col lg:flex-row gap-y-4 lg:gap-y-0 items-start justify-between">
      <div className="flex items-start gap-x-4">
        <div className="relative">
          <UserAvatar
            imageUrl={imageUrl}
            username={hostName}
            size="lg"
            isLive={isLive}
            showBadge
          />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-x-2">
            <h2 className="text-lg lg:text-xl font-bold text-white hover:text-[#bf94ff] transition-colors cursor-pointer">
              {hostName}
            </h2>
            <VerifiedMark />
          </div>
          <p className="text-sm font-medium text-[#dedee3] line-clamp-1">{name}</p>
          
          {/* Stream Stats */}
          <div className="flex items-center gap-x-3 text-xs">
            {isLive ? (
              <>
                <div className="flex items-center gap-x-1.5 bg-[#eb0400]/20 text-[#eb0400] px-2 py-0.5 rounded-md font-semibold">
                  <Radio className="h-3 w-3 animate-pulse" />
                  <span>LIVE</span>
                </div>
                <div className="flex items-center gap-x-1.5 text-[#adadb8]">
                  <Eye className="h-3.5 w-3.5" />
                  <span className="font-medium">
                    {participantCount.toLocaleString()} {participantCount === 1 ? "viewer" : "viewers"}
                  </span>
                </div>
                <span className="text-[#666] hidden sm:inline">•</span>
                <span className="text-[#adadb8] bg-[#26262c] px-2 py-0.5 rounded hidden sm:inline">
                  Just Chatting
                </span>
              </>
            ) : (
              <div className="flex items-center gap-x-1.5 text-[#666]">
                <div className="h-2 w-2 rounded-full bg-[#666]" />
                <span>Offline</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <Actions
        hostIdentity={hostIdentity}
        isFollowing={isFollowing}
        isHost={isHost}
      />
    </div>
  );
}

export function HeaderSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row gap-y-4 lg:gap-y-0 items-start justify-between">
      <div className="flex items-start gap-x-4">
        <UserAvatarSkeleton size="lg" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-36 bg-[#35353b]" />
          <Skeleton className="h-4 w-52 bg-[#35353b]" />
          <div className="flex items-center gap-x-3">
            <Skeleton className="h-5 w-16 bg-[#35353b] rounded-md" />
            <Skeleton className="h-4 w-24 bg-[#35353b]" />
          </div>
        </div>
      </div>
      <ActionsSkeleton />
    </div>
  );
}
