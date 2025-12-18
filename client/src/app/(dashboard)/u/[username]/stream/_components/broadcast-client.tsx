"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";

import { createBroadcastToken } from "@/actions/token";
import { BrowserBroadcast } from "@/components/stream-player/browser-broadcast";
import { Skeleton } from "@/components/ui/skeleton";

interface BroadcastClientProps {
  userId: string;
  username: string;
}

export function BroadcastClient({ userId, username }: BroadcastClientProps) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getToken = async () => {
      try {
        // Create a broadcast token with publish permissions
        const broadcastToken = await createBroadcastToken();
        setToken(broadcastToken);
      } catch (error) {
        console.error("Failed to get token:", error);
        toast.error("Failed to initialize broadcast");
      } finally {
        setIsLoading(false);
      }
    };

    getToken();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="aspect-video w-full rounded-xl bg-[#26262c]" />
        <div className="flex gap-4">
          <Skeleton className="h-10 w-32 rounded-lg bg-[#26262c]" />
          <Skeleton className="h-10 w-32 rounded-lg bg-[#26262c]" />
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="aspect-video bg-[#1f1f23] rounded-xl flex items-center justify-center">
        <p className="text-[#adadb8]">Failed to initialize broadcast. Please refresh the page.</p>
      </div>
    );
  }

  return (
    <BrowserBroadcast
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_WS_URL || ""}
      username={username}
    />
  );
}
