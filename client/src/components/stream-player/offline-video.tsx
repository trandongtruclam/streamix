import React from "react";
import { WifiOff, Bell } from "lucide-react";

import { Button } from "@/components/ui/button";

export function OfflineVideo({ username }: { username: string }) {
  return (
    <div className="h-full flex flex-col justify-center items-center bg-gradient-to-b from-[#1a1a1d] to-[#18181b]">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] bg-repeat" />
      </div>
      
      <div className="relative z-10 flex flex-col items-center space-y-6 px-4 text-center">
        {/* Icon with glow effect */}
        <div className="relative">
          <div className="absolute inset-0 bg-[#9147ff] rounded-full opacity-20 blur-xl scale-150" />
          <div className="relative p-5 rounded-full bg-[#26262c] border border-[#35353b]">
            <WifiOff className="h-12 w-12 text-[#adadb8]" />
          </div>
        </div>
        
        {/* Text content */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">{username}</h2>
          <p className="text-[#adadb8] text-lg">is currently offline</p>
        </div>
        
        {/* CTA Button */}
        <Button 
          variant="outline" 
          className="mt-4 border-[#9147ff] text-[#bf94ff] hover:bg-[#9147ff]/20 hover:text-white transition-all duration-200"
        >
          <Bell className="h-4 w-4 mr-2" />
          Get Notified
        </Button>
        
        {/* Additional info */}
        <p className="text-xs text-[#666] max-w-sm">
          Follow {username} to get notified when they go live
        </p>
      </div>
    </div>
  );
}
