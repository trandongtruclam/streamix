"use server";

import {
  EgressClient,
  EncodedFileOutput,
  EncodedFileType,
  StreamOutput,
  StreamProtocol,
  SegmentedFileOutput,
  SegmentedFileProtocol,
  S3Upload,
} from "livekit-server-sdk";
import { revalidatePath } from "next/cache";

import prisma from "@/lib/prisma";
import { getSelf } from "@/lib/auth-service";
import { getRecordingByEgressId } from "@/lib/recording-service";

// Initialize Egress client
const getLiveKitApiUrl = () => {
  const wsUrl = process.env.LIVEKIT_API_URL || "";
  return wsUrl.replace("wss://", "https://").replace("ws://", "http://");
};

const getEgressClient = () => {
  return new EgressClient(
    getLiveKitApiUrl(),
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET
  );
};

// Start recording a stream
export async function startRecording(roomName: string) {
  try {
    const self = await getSelf();

    // Verify the user owns this stream
    const stream = await prisma.stream.findFirst({
      where: {
        userId: self.id,
      },
    });

    if (!stream) {
      throw new Error("Stream not found");
    }

    // Check if S3 storage is configured
    const s3Bucket = process.env.LIVEKIT_S3_BUCKET;
    const s3AccessKey = process.env.LIVEKIT_S3_ACCESS_KEY;
    const s3SecretKey = process.env.LIVEKIT_S3_SECRET_KEY;
    const s3Region = process.env.LIVEKIT_S3_REGION || "us-east-1";
    const s3Endpoint = process.env.LIVEKIT_S3_ENDPOINT;

    if (!s3Bucket || !s3AccessKey || !s3SecretKey) {
      throw new Error(
        "Recording storage not configured. Please configure S3 storage/ Cloudflare R2 in environment variables."
      );
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `${roomName}-${timestamp}`;

    const egressClient = getEgressClient();

    // Create S3 upload configuration
    const s3Upload = new S3Upload({
      bucket: s3Bucket,
      accessKey: s3AccessKey,
      secret: s3SecretKey,
      region: s3Region,
      endpoint: s3Endpoint,
    });

    // Create EncodedFileOutput with S3 configuration
    const fileOutput = new EncodedFileOutput({
      fileType: EncodedFileType.MP4,
      filepath: `recordings/${roomName}/${filename}.mp4`,
      disableManifest: true,
      output: {
        case: "s3",
        value: s3Upload,
      },
    });

    // Start room composite egress
    const egress = await egressClient.startRoomCompositeEgress(
      roomName,
      fileOutput,
      { layout: "speaker-dark" }
    );

    // Save recording to database
    const storageUrl = process.env.STORAGE_URL || "";
    const fileUrl = storageUrl ? `${storageUrl}/${fileOutput.filepath}` : null;

    // LiveKit timestamps are in nanoseconds, convert to milliseconds
    let startedAt = new Date();
    if (egress.startedAt) {
      const timestamp = Number(egress.startedAt);
      // Check if it's nanoseconds (very large number) or milliseconds
      if (timestamp > 1e12) {
        // Nanoseconds, convert to milliseconds
        startedAt = new Date(timestamp / 1_000_000);
      } else {
        // Already in milliseconds
        startedAt = new Date(timestamp);
      }
      // Validate date
      if (isNaN(startedAt.getTime())) {
        startedAt = new Date();
      }
    }

    await prisma.recording.create({
      data: {
        egressId: egress.egressId,
        userId: self.id,
        filepath: fileOutput.filepath,
        fileUrl: fileUrl,
        status: `EGRESS_${egress.status}`,
        startedAt,
        title:
          stream.name ||
          `Stream Recording - ${new Date().toLocaleDateString()}`,
      },
    });

    revalidatePath(`/u/${self.username}`);
    revalidatePath(`/${self.username}/videos`);

    return {
      success: true,
      egressId: egress.egressId,
      status: Number(egress.status),
    };
  } catch (error) {
    console.error("Failed to start recording:", error);
    const message =
      error instanceof Error ? error.message : "Failed to start recording";
    throw new Error(message);
  }
}

// Stop recording
export async function stopRecording(egressId: string) {
  try {
    const self = await getSelf();
    const egressClient = getEgressClient();

    const result = await egressClient.stopEgress(egressId);

    revalidatePath(`/u/${self.username}`);
    revalidatePath(`/${self.username}/videos`);

    return {
      success: true,
      status: Number(result.status),
    };
  } catch (error) {
    console.error("Failed to stop recording:", error);
    throw new Error("Failed to stop recording");
  }
}

// Sync recording status from LiveKit (useful if webhook didn't fire)
export async function syncRecordingStatus(egressId: string) {
  try {
    const self = await getSelf();
    const egressClient = getEgressClient();

    // Get recording from database
    const recording = await getRecordingByEgressId(egressId);
    if (!recording || recording.userId !== self.id) {
      throw new Error("Recording not found or unauthorized");
    }

    // Get latest status from LiveKit
    const egressList = await egressClient.listEgress({ egressId });
    if (egressList.length === 0) {
      throw new Error("Egress not found in LiveKit");
    }

    const egress = egressList[0];
    const status = `EGRESS_${egress.status}`;

    // Build file URL from filepath if not already set
    const storageUrl = process.env.STORAGE_URL || "";
    let fileUrl = recording.fileUrl;

    // If fileUrl is not set, build it from filepath
    if (!fileUrl && recording.filepath && storageUrl) {
      fileUrl = `${storageUrl}/${recording.filepath}`;
    }

    // Calculate duration
    let endedAt: Date | null = null;
    let duration: number | null = null;

    if (egress.endedAt) {
      const timestamp = Number(egress.endedAt);
      if (timestamp > 1e12) {
        endedAt = new Date(timestamp / 1_000_000);
      } else {
        endedAt = new Date(timestamp);
      }
      if (isNaN(endedAt.getTime())) {
        endedAt = null;
      }
    }

    if (recording.startedAt && endedAt) {
      duration = Math.floor(
        (endedAt.getTime() - recording.startedAt.getTime()) / 1000
      );
    }

    // Update recording
    await prisma.recording.update({
      where: { egressId },
      data: {
        status,
        fileUrl: fileUrl || recording.fileUrl,
        endedAt,
        duration,
        // Note: size info not available from listEgress, will be updated by webhook
      },
    });

    revalidatePath(`/${self.username}/videos`);
    revalidatePath(`/u/${self.username}`);

    return {
      success: true,
      status,
      fileUrl,
      duration,
    };
  } catch (error) {
    console.error("Failed to sync recording status:", error);
    throw new Error("Failed to sync recording status");
  }
}

// List all recordings for a user
export async function listRecordings() {
  try {
    const self = await getSelf();
    const egressClient = getEgressClient();

    // Get all egress instances for user's room
    const egressList = await egressClient.listEgress({
      roomName: self.id,
    });

    return egressList.map((egress) => ({
      id: egress.egressId,
      status: Number(egress.status),
      startedAt: egress.startedAt ? Number(egress.startedAt) : null,
      endedAt: egress.endedAt ? Number(egress.endedAt) : null,
      roomName: egress.roomName,
    }));
  } catch (error) {
    console.error("Failed to list recordings:", error);
    return [];
  }
}

// Start HLS streaming for a room
export async function startHlsStream(roomName: string) {
  try {
    // Check if S3 storage is configured
    const s3Bucket = process.env.LIVEKIT_S3_BUCKET;
    const s3AccessKey = process.env.LIVEKIT_S3_ACCESS_KEY;
    const s3SecretKey = process.env.LIVEKIT_S3_SECRET_KEY;
    const s3Region = process.env.LIVEKIT_S3_REGION || "us-east-1";
    const s3Endpoint = process.env.LIVEKIT_S3_ENDPOINT;

    if (!s3Bucket || !s3AccessKey || !s3SecretKey) {
      throw new Error(
        "HLS storage not configured. Please configure S3 storage in environment variables."
      );
    }

    const timestamp = Date.now();
    const playlistName = `${roomName}-${timestamp}`;
    const egressClient = getEgressClient();

    // Create S3 upload configuration
    const s3Upload = new S3Upload({
      bucket: s3Bucket,
      accessKey: s3AccessKey,
      secret: s3SecretKey,
      region: s3Region,
      endpoint: s3Endpoint,
    });

    const segmentOutput = new SegmentedFileOutput({
      protocol: SegmentedFileProtocol.HLS_PROTOCOL,
      filenamePrefix: `hls/${roomName}/${playlistName}`,
      playlistName: "playlist.m3u8",
      livePlaylistName: "live.m3u8",
      segmentDuration: 6,
      output: {
        case: "s3",
        value: s3Upload,
      },
    });

    const egress = await egressClient.startRoomCompositeEgress(
      roomName,
      segmentOutput,
      { layout: "speaker-dark" }
    );

    return {
      success: true,
      egressId: egress.egressId || "",
      hlsUrl: `${process.env.STORAGE_URL}/hls/${roomName}/${playlistName}/playlist.m3u8`,
    };
  } catch (error) {
    console.error("Failed to start HLS stream:", error);
    const message =
      error instanceof Error ? error.message : "Failed to start HLS stream";
    throw new Error(message);
  }
}

// Restream to external platform (YouTube, Facebook, etc.)
export async function startRestream(
  roomName: string,
  platform: "youtube" | "facebook" | "twitch" | "custom",
  rtmpUrl: string,
  streamKey: string
) {
  try {
    const self = await getSelf();

    // Verify ownership
    const stream = await prisma.stream.findFirst({
      where: { userId: self.id },
    });

    if (!stream) {
      throw new Error("Stream not found");
    }

    const fullRtmpUrl = `${rtmpUrl}/${streamKey}`;
    const egressClient = getEgressClient();

    const streamOutput = new StreamOutput({
      protocol: StreamProtocol.RTMP,
      urls: [fullRtmpUrl],
    });

    const egress = await egressClient.startRoomCompositeEgress(
      roomName,
      streamOutput,
      { layout: "speaker-dark" }
    );

    return {
      success: true,
      egressId: egress.egressId || "",
      platform,
    };
  } catch (error) {
    console.error("Failed to start restream:", error);
    throw new Error(`Failed to start ${platform} restream`);
  }
}

// Stop restream
export async function stopRestream(egressId: string) {
  try {
    const egressClient = getEgressClient();
    await egressClient.stopEgress(egressId);
    return { success: true };
  } catch (error) {
    console.error("Failed to stop restream:", error);
    throw new Error("Failed to stop restream");
  }
}

// Get recording/egress status
export async function getEgressStatus(egressId: string) {
  try {
    const egressClient = getEgressClient();
    const egressList = await egressClient.listEgress({
      egressId,
    });

    if (egressList.length === 0) {
      return null;
    }

    const egress = egressList[0];

    return {
      id: egress.egressId,
      status: Number(egress.status),
      startedAt: egress.startedAt ? Number(egress.startedAt) : null,
      endedAt: egress.endedAt ? Number(egress.endedAt) : null,
      error: egress.error || null,
    };
  } catch (error) {
    console.error("Failed to get egress status:", error);
    return null;
  }
}
