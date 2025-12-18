"use client";

import React, { useState, useTransition } from "react";
import { 
  Circle, 
  Square, 
  Video, 
  Loader2, 
  Download,
  Clock,
  HardDrive,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

import { startRecording, stopRecording } from "@/actions/recording";

interface RecordingControlProps {
  roomName: string;
  isHost: boolean;
}

export function RecordingControl({ roomName, isHost }: RecordingControlProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [recordingStartTime, setRecordingStartTime] = useState<Date | null>(null);
  const [egressId, setEgressId] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Timer for recording duration
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRecording && recordingStartTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - recordingStartTime.getTime()) / 1000));
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording, recordingStartTime]);

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartRecording = () => {
    startTransition(async () => {
      try {
        const result = await startRecording(roomName);
        setIsRecording(true);
        setRecordingStartTime(new Date());
        setEgressId(result.egressId);
        toast.success("Recording started");
      } catch (error) {
        toast.error("Failed to start recording");
      }
    });
  };

  const handleStopRecording = () => {
    if (!egressId) return;
    
    startTransition(async () => {
      try {
        await stopRecording(egressId);
        setIsRecording(false);
        setRecordingStartTime(null);
        setEgressId(null);
        setElapsedTime(0);
        toast.success("Recording saved");
      } catch (error) {
        toast.error("Failed to stop recording");
      }
    });
  };

  if (!isHost) return null;

  return (
    <div className="relative">
      {isRecording ? (
        <motion.button
          onClick={handleStopRecording}
          disabled={isPending}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
              </span>
              <span className="font-mono">{formatDuration(elapsedTime)}</span>
              <Square className="h-4 w-4 fill-current" />
            </>
          )}
        </motion.button>
      ) : (
        <motion.button
          onClick={handleStartRecording}
          disabled={isPending}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-3 py-2 bg-[#26262c] hover:bg-[#3a3a3d] text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Circle className="h-4 w-4 text-red-500" />
              <span>Record</span>
            </>
          )}
        </motion.button>
      )}
    </div>
  );
}

// Recording status indicator (for overlay)
export function RecordingIndicator({ isRecording }: { isRecording: boolean }) {
  if (!isRecording) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="flex items-center gap-1.5 bg-red-500/90 backdrop-blur-sm px-2 py-1 rounded-md"
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
      </span>
      <span className="text-white text-xs font-bold">REC</span>
    </motion.div>
  );
}

// Recording management panel for dashboard
export function RecordingManager({ recordings }: { recordings: Recording[] }) {
  return (
    <div className="bg-[#1f1f23] border border-[#3a3a3d] rounded-lg overflow-hidden">
      <div className="p-4 border-b border-[#3a3a3d]">
        <div className="flex items-center gap-2">
          <Video className="h-5 w-5 text-[#9147ff]" />
          <h2 className="text-white font-semibold">Recordings</h2>
        </div>
        <p className="text-[#adadb8] text-sm mt-1">
          Your past stream recordings
        </p>
      </div>

      {recordings.length === 0 ? (
        <div className="p-8 text-center">
          <HardDrive className="h-12 w-12 text-[#3a3a3d] mx-auto mb-3" />
          <p className="text-[#adadb8]">No recordings yet</p>
          <p className="text-[#666] text-sm">Start recording your stream to save VODs</p>
        </div>
      ) : (
        <div className="divide-y divide-[#3a3a3d]">
          {recordings.map((recording) => (
            <RecordingItem key={recording.id} recording={recording} />
          ))}
        </div>
      )}
    </div>
  );
}

interface Recording {
  id: string;
  status: string;
  startedAt: bigint;
  endedAt?: bigint;
  duration?: number;
  size?: number;
  url?: string;
}

function RecordingItem({ recording }: { recording: Recording }) {
  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) / 1000000).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return "—";
    if (bytes >= 1073741824) return `${(bytes / 1073741824).toFixed(1)} GB`;
    if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  const getStatusBadge = () => {
    switch (recording.status) {
      case "EGRESS_ACTIVE":
        return (
          <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-md flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
            Recording
          </span>
        );
      case "EGRESS_COMPLETE":
        return (
          <span className="px-2 py-0.5 bg-[#26262c] text-[#adadb8] text-xs rounded-md">
            Complete
          </span>
        );
      case "EGRESS_FAILED":
        return (
          <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-md flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Failed
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 bg-[#26262c] text-[#adadb8] text-xs rounded-md">
            {recording.status}
          </span>
        );
    }
  };

  return (
    <div className="p-4 hover:bg-[#26262c] transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#26262c] rounded-lg">
            <Video className="h-5 w-5 text-[#9147ff]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-white text-sm font-medium">
                {formatDate(recording.startedAt)}
              </p>
              {getStatusBadge()}
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs text-[#adadb8]">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {recording.duration ? `${Math.floor(recording.duration / 60)}m` : "—"}
              </span>
              <span className="flex items-center gap-1">
                <HardDrive className="h-3 w-3" />
                {formatSize(recording.size)}
              </span>
            </div>
          </div>
        </div>

        {recording.url && recording.status === "EGRESS_COMPLETE" && (
          <a
            href={recording.url}
            download
            className="p-2 hover:bg-[#3a3a3d] rounded-lg transition-colors"
          >
            <Download className="h-5 w-5 text-[#adadb8] hover:text-white" />
          </a>
        )}
      </div>
    </div>
  );
}
