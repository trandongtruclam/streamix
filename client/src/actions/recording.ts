"use server";

import {
  EgressClient,
  EncodedFileOutput,
  EncodedFileType,
  StreamOutput,
  StreamProtocol,
  SegmentedFileOutput,
  SegmentedFileProtocol,
} from "livekit-server-sdk";
import { revalidatePath } from "next/cache";

import prisma from "@/lib/prisma";
import { getSelf } from "@/lib/auth-service";

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

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `${roomName}-${timestamp}`;

    const egressClient = getEgressClient();
    
    // Create proper EncodedFileOutput
    const fileOutput = new EncodedFileOutput({
      fileType: EncodedFileType.MP4,
      filepath: `recordings/${roomName}/${filename}.mp4`,
      disableManifest: true,
    });

    // Start room composite egress
    const egress = await egressClient.startRoomCompositeEgress(
      roomName,
      fileOutput,
      "speaker-dark"
    );

    revalidatePath(`/u/${self.username}`);
    
    return {
      success: true,
      egressId: egress.egressId,
      status: egress.status,
    };
  } catch (error) {
    console.error("Failed to start recording:", error);
    throw new Error("Failed to start recording");
  }
}

// Stop recording
export async function stopRecording(egressId: string) {
  try {
    const self = await getSelf();
    const egressClient = getEgressClient();
    
    const result = await egressClient.stopEgress(egressId);
    
    revalidatePath(`/u/${self.username}`);
    
    return {
      success: true,
      status: result.status,
    };
  } catch (error) {
    console.error("Failed to stop recording:", error);
    throw new Error("Failed to stop recording");
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

    return egressList.map(egress => ({
      id: egress.egressId,
      status: egress.status,
      startedAt: egress.startedAt,
      endedAt: egress.endedAt,
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
    const timestamp = Date.now();
    const playlistName = `${roomName}-${timestamp}`;
    const egressClient = getEgressClient();

    const segmentOutput = new SegmentedFileOutput({
      protocol: SegmentedFileProtocol.HLS_PROTOCOL,
      filenamePrefix: `hls/${roomName}/${playlistName}`,
      playlistName: "playlist.m3u8",
      livePlaylistName: "live.m3u8",
      segmentDuration: 6,
    });

    const egress = await egressClient.startRoomCompositeEgress(
      roomName,
      segmentOutput,
      "speaker-dark"
    );

    return {
      success: true,
      egressId: egress.egressId,
      hlsUrl: `${process.env.STORAGE_URL}/hls/${roomName}/${playlistName}/playlist.m3u8`,
    };
  } catch (error) {
    console.error("Failed to start HLS stream:", error);
    throw new Error("Failed to start HLS stream");
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
      "speaker-dark"
    );

    return {
      success: true,
      egressId: egress.egressId,
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
      status: egress.status,
      startedAt: egress.startedAt,
      endedAt: egress.endedAt,
      error: egress.error,
    };
  } catch (error) {
    console.error("Failed to get egress status:", error);
    return null;
  }
}
