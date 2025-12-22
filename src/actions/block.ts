"use server";

import { revalidatePath } from "next/cache";
import { RoomServiceClient } from "livekit-server-sdk";

import { blockUser, unblockUser } from "@/lib/block-service";
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

export const onBlock = async (id: string) => {
  const self = await getSelf();

  let blockedUser;

  try {
    blockedUser = await blockUser(id);
  } catch {
    // this means user is guest
  }

  try {
    await roomService.removeParticipant(self.id, id);
  } catch {
    // this means user not in the room
  }

  revalidatePath(`/u/${self.username}/community`);

  return blockedUser;
};

export const onUnblock = async (id: string) => {
  const self = await getSelf();
  const unblockedUser = await unblockUser(id);

  revalidatePath(`/u/${self.username}/community`);
  return unblockedUser;
};
