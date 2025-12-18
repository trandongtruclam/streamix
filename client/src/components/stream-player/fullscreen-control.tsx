"use client";

import React from "react";
import { Maximize, Minimize } from "lucide-react";

import { Hint } from "@/components/hint";

export function FullscreenControl({
  isFullscreen,
  onToggle,
}: {
  isFullscreen: boolean;
  onToggle: () => void;
}) {
  const Icon = isFullscreen ? Minimize : Maximize;

  const label = isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen";

  return (
    <div className="flex items-center justify-center">
      <Hint label={label} asChild>
        <button
          onClick={onToggle}
          className="text-white p-2 hover:bg-white/20 rounded-md transition-colors duration-200"
        >
          <Icon className="h-5 w-5" />
        </button>
      </Hint>
    </div>
  );
}
