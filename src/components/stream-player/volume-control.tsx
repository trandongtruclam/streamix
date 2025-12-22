"use client";

import React from "react";
import { Volume1, Volume2, VolumeX } from "lucide-react";

import { Hint } from "@/components/hint";
import { Slider } from "@/components/ui/slider";

export function VolumeControl({
  value,
  onChange,
  onToggle,
}: {
  onToggle: () => void;
  onChange: (value: number) => void;
  value: number;
}) {
  const isMuted = value === 0;
  const isAboveHalf = value > 50;

  let Icon = Volume1;

  if (isMuted) {
    Icon = VolumeX;
  } else if (isAboveHalf) {
    Icon = Volume2;
  }

  const label = isMuted ? "Unmute" : "Mute";

  const handleChange = (value: number[]) => {
    onChange(value[0]);
  };

  return (
    <div className="flex items-center gap-3 group">
      <Hint asChild label={label}>
        <button
          onClick={onToggle}
          className="text-white p-2 hover:bg-white/20 rounded-md transition-colors duration-200"
        >
          <Icon className="h-5 w-5" />
        </button>
      </Hint>
      <div className="w-0 overflow-hidden group-hover:w-24 transition-all duration-300">
        <Slider
          className="cursor-pointer"
          onValueChange={handleChange}
          value={[value]}
          max={100}
          step={1}
        />
      </div>
    </div>
  );
}
