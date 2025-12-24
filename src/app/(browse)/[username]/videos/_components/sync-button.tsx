"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { syncAllRecordings } from "@/actions/recording";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function SyncRecordingsButton() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSync = async () => {
    setIsLoading(true);
    try {
      const result = await syncAllRecordings();
      
      if (result.success) {
        toast.success(
          `Synced ${result.synced} recordings, created ${result.created} new ones`,
          {
            description: `Total: ${result.total} recordings found`,
          }
        );
        router.refresh();
      }
    } catch (error) {
      toast.error("Failed to sync recordings", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleSync}
      disabled={isLoading}
      className="flex items-center gap-2 px-4 py-2 bg-[#9147ff] hover:bg-[#7c3aed] disabled:bg-[#3a3a3d] disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm font-medium"
    >
      <RefreshCw
        className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
      />
      <span>{isLoading ? "Syncing..." : "Sync Recordings"}</span>
    </button>
  );
}
