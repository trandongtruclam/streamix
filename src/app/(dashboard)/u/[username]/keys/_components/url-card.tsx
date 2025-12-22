import React from "react";
import { Server } from "lucide-react";

import { Input } from "@/components/ui/input";

import { CopyButton } from "./copy-button";

export function URLCard({ value }: { value: string | null }) {
  return (
    <div className="rounded-xl bg-[#1f1f23] border border-[#2f2f35] p-5">
      <div className="flex items-center gap-x-4">
        <div className="p-3 bg-[#26262c] rounded-lg shrink-0">
          <Server className="h-5 w-5 text-#9147ff" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-sm mb-2">Server URL</p>
          <div className="flex items-center gap-x-2">
            <Input 
              value={value || ""} 
              disabled 
              placeholder="Generate a connection to get your server URL" 
              className="bg-[#26262c] border-[#35353b] text-[#dedee3] placeholder:text-[#666] font-mono text-sm"
            />
            <CopyButton value={value || ""} />
          </div>
        </div>
      </div>
    </div>
  );
}
