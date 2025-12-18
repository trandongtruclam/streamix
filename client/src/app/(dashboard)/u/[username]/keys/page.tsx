import React from "react";
import { AlertCircle, Video, Wifi } from "lucide-react";

import { getSelf } from "@/lib/auth-service";
import { getStreamByUserId } from "@/lib/stream-service";

import { URLCard } from "./_components/url-card";
import { KeyCard } from "./_components/key-card";
import { ConnectModal } from "./_components/connect-modal";

export default async function KeysPage() {
  const self = await getSelf();
  const stream = await getStreamByUserId(self.id);

  if (!stream) {
    throw new Error("No stream found");
  }

  const hasConnection = stream.serverUrl && stream.streamKey;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Stream Keys & URLs</h1>
          <p className="text-[#adadb8] text-sm mt-1">
            Configure your streaming software with these credentials
          </p>
        </div>
        <ConnectModal />
      </div>

      {/* Connection Status */}
      <div className={`rounded-xl p-4 mb-6 flex items-center gap-x-4 ${
        hasConnection 
          ? "bg-green-500/10 border border-green-500/20" 
          : "bg-yellow-500/10 border border-yellow-500/20"
      }`}>
        <div className={`p-2 rounded-full ${
          hasConnection ? "bg-green-500/20" : "bg-yellow-500/20"
        }`}>
          {hasConnection ? (
            <Wifi className="h-5 w-5 text-green-500" />
          ) : (
            <AlertCircle className="h-5 w-5 text-yellow-500" />
          )}
        </div>
        <div>
          <p className={`font-medium ${hasConnection ? "text-green-400" : "text-yellow-400"}`}>
            {hasConnection ? "Connection Ready" : "No Connection Generated"}
          </p>
          <p className="text-sm text-[#adadb8]">
            {hasConnection 
              ? "Your stream credentials are ready. Use them in OBS or your preferred streaming software."
              : "Click 'Generate connection' to create your stream credentials."}
          </p>
        </div>
      </div>

      {/* Credentials Cards */}
      <div className="space-y-4 mb-8">
        <URLCard value={stream.serverUrl} />
        <KeyCard value={stream.streamKey} />
      </div>

      {/* Setup Instructions */}
      <div className="bg-[#1f1f23] rounded-xl p-6 border border-[#2f2f35]">
        <div className="flex items-center gap-x-3 mb-4">
          <div className="p-2 bg-[#9147ff]/20 rounded-lg">
            <Video className="h-5 w-5 text-[#9147ff]" />
          </div>
          <h2 className="text-lg font-semibold text-white">How to Start Streaming</h2>
        </div>
        
        <div className="space-y-4 text-sm">
          <div className="flex gap-x-4">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#9147ff] text-white text-xs font-bold flex items-center justify-center">
              1
            </div>
            <div>
              <p className="text-white font-medium">Generate Connection</p>
              <p className="text-[#adadb8]">
                Click the &quot;Generate connection&quot; button and select RTMP (for OBS) or WHIP (for browser-based streaming).
              </p>
            </div>
          </div>
          
          <div className="flex gap-x-4">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#9147ff] text-white text-xs font-bold flex items-center justify-center">
              2
            </div>
            <div>
              <p className="text-white font-medium">Configure OBS Studio</p>
              <p className="text-[#adadb8]">
                Open OBS → Settings → Stream → Select &quot;Custom&quot; → Paste the Server URL and Stream Key.
              </p>
            </div>
          </div>
          
          <div className="flex gap-x-4">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#9147ff] text-white text-xs font-bold flex items-center justify-center">
              3
            </div>
            <div>
              <p className="text-white font-medium">Start Broadcasting</p>
              <p className="text-[#adadb8]">
                Click &quot;Start Streaming&quot; in OBS. Your stream will appear live on your channel page.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
