import React from "react";

import { getSelf } from "@/lib/auth-service";
import { getStreamByUserId } from "@/lib/stream-service";
import { LiveBadge } from "@/components/live-badge";

import { ToggleCard } from "./_components/toggle-card";
import { DashboardChat } from "./_components/dashboard-chat";
import { ChatRefresh } from "./_components/chat-refresh";

export default async function ChatPage() {
  const self = await getSelf();
  const stream = await getStreamByUserId(self.id);

  if (!stream) {
    throw new Error("No stream found");
  }

  return (
    <div className="p-6">
      <ChatRefresh isLive={stream.isLive} />
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold text-white">Chat</h1>
          {stream.isLive && <LiveBadge />}
        </div>
        <p className="text-[#adadb8] text-sm">
          {stream.isLive
            ? "Chat with your viewers in real-time"
            : "Configure chat settings and chat with viewers when you go live"}
        </p>
      </div>

      {stream.isLive ? (
        <div className="space-y-6">
          {/* Live Chat Interface */}
          <DashboardChat
            hostIdentity={self.id}
            hostName={self.username}
            isChatEnabled={stream.isChatEnabled}
            isChatDelayed={stream.isChatDelayed}
            isChatFollowersOnly={stream.isChatFollowersOnly}
          />

          {/* Quick Settings */}
          <div className="bg-[#1f1f23] border border-[#3a3a3d] rounded-xl p-4">
            <h2 className="text-lg font-semibold text-white mb-4">
              Chat Settings
            </h2>
            <div className="space-y-3">
              <ToggleCard
                field="isChatEnabled"
                label="Enable chat"
                value={stream.isChatEnabled}
              />
              <ToggleCard
                field="isChatDelayed"
                label="Delay chat"
                value={stream.isChatDelayed}
              />
              <ToggleCard
                field="isChatFollowersOnly"
                label="Must be following to chat"
                value={stream.isChatFollowersOnly}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-[#1f1f23] border border-[#3a3a3d] rounded-xl p-6 text-center">
            <p className="text-[#adadb8] mb-2">
              You&apos;re currently offline
            </p>
            <p className="text-sm text-[#666]">
              Go live to start chatting with your viewers
            </p>
          </div>
          <div className="bg-[#1f1f23] border border-[#3a3a3d] rounded-xl p-4">
            <h2 className="text-lg font-semibold text-white mb-4">
              Chat Settings
            </h2>
            <div className="space-y-3">
              <ToggleCard
                field="isChatEnabled"
                label="Enable chat"
                value={stream.isChatEnabled}
              />
              <ToggleCard
                field="isChatDelayed"
                label="Delay chat"
                value={stream.isChatDelayed}
              />
              <ToggleCard
                field="isChatFollowersOnly"
                label="Must be following to chat"
                value={stream.isChatFollowersOnly}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
