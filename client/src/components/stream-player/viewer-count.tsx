"use client";

import React from "react";
import { useParticipants } from "@livekit/components-react";
import { Eye, Users, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ViewerCountProps {
  variant?: "compact" | "detailed" | "badge";
}

export function ViewerCount({ variant = "compact" }: ViewerCountProps) {
  const participants = useParticipants();
  // Exclude the host from viewer count
  const viewerCount = Math.max(0, participants.length - 1);

  if (variant === "badge") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-1.5 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-md"
      >
        <Eye className="h-3.5 w-3.5 text-red-500" />
        <AnimatePresence mode="popLayout">
          <motion.span
            key={viewerCount}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="text-white text-sm font-semibold tabular-nums"
          >
            {formatViewerCount(viewerCount)}
          </motion.span>
        </AnimatePresence>
      </motion.div>
    );
  }

  if (variant === "detailed") {
    return (
      <div className="bg-[#1f1f23] border border-[#3a3a3d] rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <Users className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-[#adadb8] text-xs">Current Viewers</p>
              <AnimatePresence mode="popLayout">
                <motion.p
                  key={viewerCount}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="text-white text-2xl font-bold tabular-nums"
                >
                  {viewerCount.toLocaleString()}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
          
          {viewerCount > 0 && (
            <div className="flex items-center gap-1 text-green-500 text-sm">
              <TrendingUp className="h-4 w-4" />
              <span>Live</span>
            </div>
          )}
        </div>

        {/* Viewer breakdown */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#3a3a3d]">
          <div className="text-center p-2 bg-[#26262c] rounded-lg">
            <p className="text-[#adadb8] text-xs">Authenticated</p>
            <p className="text-white font-semibold">
              {participants.filter(p => !p.identity.startsWith("guest-")).length}
            </p>
          </div>
          <div className="text-center p-2 bg-[#26262c] rounded-lg">
            <p className="text-[#adadb8] text-xs">Guests</p>
            <p className="text-white font-semibold">
              {participants.filter(p => p.identity.startsWith("guest-")).length}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Compact variant (default)
  return (
    <div className="flex items-center gap-1.5 text-[#adadb8]">
      <Eye className="h-4 w-4" />
      <AnimatePresence mode="popLayout">
        <motion.span
          key={viewerCount}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          className="text-sm font-medium tabular-nums"
        >
          {formatViewerCount(viewerCount)}
        </motion.span>
      </AnimatePresence>
      <span className="text-xs hidden sm:inline">
        {viewerCount === 1 ? "viewer" : "viewers"}
      </span>
    </div>
  );
}

// Format large numbers (e.g., 1.2K, 1.5M)
function formatViewerCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

// Animated pulse indicator for live streams
export function LiveIndicator() {
  return (
    <div className="flex items-center gap-1.5">
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
      </span>
      <span className="text-red-500 text-xs font-bold uppercase tracking-wide">Live</span>
    </div>
  );
}
