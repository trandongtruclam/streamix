"use client";

import React from "react";
import Image from "next/image";
import { Pencil } from "lucide-react";

import { Separator } from "@/components/ui/separator";

import { InfoModal } from "./info-modal";

export function InfoCard({
  name,
  thumbnailUrl,
  hostIdentity,
  viewerIdentity,
}: {
  name: string;
  thumbnailUrl: string | null;
  hostIdentity: string;
  viewerIdentity: string;
}) {
  const hostAsViewer = `host-${hostIdentity}`;
  const isHost = viewerIdentity === hostAsViewer;

  if (!isHost) return null;

  return (
    <div className="px-4">
      <div className="rounded-xl bg-[#1f1f23] border border-[#2f2f35] overflow-hidden">
        <div className="flex items-center gap-x-3 p-4">
          <div className="rounded-lg bg-[#9147ff] p-2.5">
            <Pencil className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-sm lg:text-base font-semibold text-white">
              Edit your stream info
            </h2>
            <p className="text-[#adadb8] text-xs lg:text-sm">
              Maximize your visibility
            </p>
          </div>
          <InfoModal initialName={name} initialThumbnailUrl={thumbnailUrl} />
        </div>
        <Separator className="bg-[#2f2f35]" />
        <div className="p-4 lg:p-6 space-y-4">
          <div>
            <h3 className="text-xs font-semibold text-[#adadb8] uppercase tracking-wider mb-2">
              Name
            </h3>
            <p className="text-sm font-medium text-white">{name}</p>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-[#adadb8] uppercase tracking-wider mb-2">
              Thumbnail
            </h3>
            {thumbnailUrl ? (
              <div className="relative aspect-video rounded-lg overflow-hidden w-[200px] border border-[#35353b]">
                <Image
                  fill
                  src={thumbnailUrl}
                  alt={name}
                  className="object-cover"
                />
              </div>
            ) : (
              <p className="text-sm text-[#adadb8]">No thumbnail set</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
