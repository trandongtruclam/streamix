import React from "react";
import { Radio, Video, Monitor, Mic, Settings } from "lucide-react";

import { getSelf } from "@/lib/auth-service";
import { getStreamByUserId } from "@/lib/stream-service";
import { BroadcastClient } from "./_components/broadcast-client";

export default async function StreamPage() {
  const self = await getSelf();
  const stream = await getStreamByUserId(self.id);

  if (!stream) {
    throw new Error("No stream found");
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-[#9147ff]/20 rounded-lg">
            <Radio className="h-6 w-6 text-[#9147ff]" />
          </div>
          <h1 className="text-2xl font-bold text-white">Go Live</h1>
        </div>
        <p className="text-[#adadb8]">
          Start streaming directly from your browser - no software needed
        </p>
      </div>

      {/* Broadcast Component */}
      <BroadcastClient 
        userId={self.id}
        username={self.username}
      />

      {/* Tips Section */}
      <div className="mt-8 grid md:grid-cols-3 gap-4">
        <div className="bg-[#1f1f23] border border-[#3a3a3d] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Video className="h-5 w-5 text-[#9147ff]" />
            <h3 className="text-white font-medium">Camera Tips</h3>
          </div>
          <ul className="text-[#adadb8] text-sm space-y-2">
            <li>• Good lighting improves video quality</li>
            <li>• Position camera at eye level</li>
            <li>• Check your background before going live</li>
          </ul>
        </div>

        <div className="bg-[#1f1f23] border border-[#3a3a3d] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Mic className="h-5 w-5 text-[#9147ff]" />
            <h3 className="text-white font-medium">Audio Tips</h3>
          </div>
          <ul className="text-[#adadb8] text-sm space-y-2">
            <li>• Use a dedicated microphone if possible</li>
            <li>• Minimize background noise</li>
            <li>• Test audio levels before streaming</li>
          </ul>
        </div>

        <div className="bg-[#1f1f23] border border-[#3a3a3d] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Monitor className="h-5 w-5 text-[#9147ff]" />
            <h3 className="text-white font-medium">Screen Share</h3>
          </div>
          <ul className="text-[#adadb8] text-sm space-y-2">
            <li>• Close sensitive applications</li>
            <li>• Disable notifications</li>
            <li>• Share specific windows when possible</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
