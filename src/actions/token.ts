"use server";

import { v4 } from "uuid";
import { AccessToken } from "livekit-server-sdk";

import { getSelf } from "@/lib/auth-service";
import { getUserById } from "@/lib/user-service";
import { isBlockedByUser } from "@/lib/block-service";

export const createViewerToken = async (hostIdentity: string) => {
  let self;

  try {
    self = await getSelf();
  } catch (error) {
    const id = v4();
    const username = `guest#${Math.floor(Math.random() * 1000)}`;
    self = { id, username };
    console.error("token can't generate", error)
  }

  const host = await getUserById(hostIdentity);

  if (!host) {
    throw new Error("User not found");
  }

  const isBlocked = await isBlockedByUser(host.id);

  if (isBlocked) {
    throw new Error("User is blocked");
  }

  const isHost = self.id === host.id;

  const token = new AccessToken(
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET,
    {
      identity: isHost ? `host-${self.id}` : self.id,
      name: self.username,
    }
  );

  token.addGrant({
    room: host.id,
    roomJoin: true,
    canPublish: false,
    canPublishData: true,
  });

  return await Promise.resolve(token.toJwt());
};

/**
 * Create a token for browser broadcasting
 * This token has publish permissions
 * Uses the same identity format as viewer token for consistency
 */
export const createBroadcastToken = async () => {
  const self = await getSelf();

  const token = new AccessToken(
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET,
    {
      // Use userId directly - viewers will see this participant with identity = userId
      // When host views in dashboard, they'll join with identity = host-${userId} but can still see the stream
      identity: self.id,
      name: self.username,
    }
  );

  token.addGrant({
    room: self.id, // Room name is the user's ID
    roomJoin: true,
    canPublish: true, // Allow publishing video/audio
    canPublishData: true,
  });

  return await Promise.resolve(token.toJwt());
};
