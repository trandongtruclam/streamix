import React from "react";
import { Loader2 } from "lucide-react";

export function LoadingVideo({ label }: { label: string }) {
  return (
    <div className="h-full flex flex-col justify-center items-center bg-gradient-to-b from-[#1a1a1d] to-[#18181b]">
      {/* Background shimmer effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      </div>
      
      <div className="relative z-10 flex flex-col items-center space-y-4">
        {/* Spinner with glow */}
        <div className="relative">
          <div className="absolute inset-0 bg-[#9147ff] rounded-full opacity-40 blur-2xl scale-150 animate-pulse" />
          <div className="relative p-4 rounded-full bg-[#26262c]/80 backdrop-blur-sm border border-[#35353b]">
            <Loader2 className="h-8 w-8 text-[#9147ff] animate-spin" />
          </div>
        </div>
        
        {/* Status text */}
        <div className="text-center space-y-1">
          <p className="text-white font-medium capitalize">{label}</p>
          <p className="text-[#adadb8] text-sm">Connecting to stream...</p>
        </div>
        
        {/* Loading bar */}
        <div className="w-48 h-1 bg-[#26262c] rounded-full overflow-hidden">
          <div className="h-full w-1/3 bg-gradient-to-r from-[#9147ff] to-[#bf94ff] rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}
