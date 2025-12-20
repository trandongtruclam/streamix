"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface ChatRefreshProps {
  isLive: boolean;
}

/**
 * Client component that refreshes the page when stream goes live
 * This ensures the chat interface appears immediately when going live
 */
export function ChatRefresh({ isLive }: ChatRefreshProps) {
  const router = useRouter();
  const hasRefreshedRef = useRef(false);
  const wasLiveRef = useRef(isLive);

  useEffect(() => {
    // Only refresh when stream transitions from offline to live
    if (isLive && !wasLiveRef.current && !hasRefreshedRef.current) {
      // Small delay to ensure database is updated
      const timer = setTimeout(() => {
        router.refresh();
        hasRefreshedRef.current = true;
      }, 1000);

      return () => clearTimeout(timer);
    }

    // Reset refresh flag when stream goes offline
    if (!isLive) {
      hasRefreshedRef.current = false;
    }

    wasLiveRef.current = isLive;
  }, [isLive, router]);

  return null;
}
