"use server";

import {
  IngressInput,
  IngressClient,
  RoomServiceClient,
  type CreateIngressOptions,
} from "livekit-server-sdk";
import { revalidatePath } from "next/cache";

import prisma from "@/lib/prisma";
import { getSelf } from "@/lib/auth-service";

// Convert wss:// to https:// for API calls
const getLiveKitApiUrl = () => {
  const wsUrl = process.env.LIVEKIT_API_URL || "";
  return wsUrl.replace("wss://", "https://").replace("ws://", "http://");
};

const roomService = new RoomServiceClient(
  getLiveKitApiUrl(),
  process.env.LIVEKIT_API_KEY,
  process.env.LIVEKIT_API_SECRET
);

const ingressClient = new IngressClient(
  getLiveKitApiUrl(),
  process.env.LIVEKIT_API_KEY,
  process.env.LIVEKIT_API_SECRET
);

export const resetIngresses = async (hostId: string) => {
  const ingresses = await ingressClient.listIngress({
    roomName: hostId,
  });

  const rooms = await roomService.listRooms([hostId]);

  for (const room of rooms) {
    await roomService.deleteRoom(room.name);
  }

  for (const ingress of ingresses) {
    if (ingress.ingressId) {
      await ingressClient.deleteIngress(ingress.ingressId);
    }
  }
};

export const createIngress = async (ingressType: IngressInput) => {
  const self = await getSelf();

  await resetIngresses(self.id);

  const options: CreateIngressOptions = {
    name: self.username,
    roomName: self.id,
    participantName: self.username,
    participantIdentity: self.id,
  };

  // For WHIP input, bypass transcoding for lower latency
  if (ingressType === IngressInput.WHIP_INPUT) {
    options.bypassTranscoding = true;
  }
  // For RTMP input, default encoding settings will be used

  const ingress = await ingressClient.createIngress(ingressType, options);

  if (!ingress || !ingress.url || !ingress.streamKey) {
    throw new Error("Failed to create ingress");
  }

  await prisma.stream.update({
    where: {
      userId: self.id,
    },
    data: {
      ingressId: ingress.ingressId,
      serverUrl: ingress.url,
      streamKey: ingress.streamKey,
    },
  });

  revalidatePath(`/u/${self.username}/keys`);
  
  // Return plain object instead of class instance for client components
  return {
    ingressId: ingress.ingressId,
    url: ingress.url,
    streamKey: ingress.streamKey,
  };
};
