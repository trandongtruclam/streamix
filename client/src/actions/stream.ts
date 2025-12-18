"use server";

import { revalidatePath } from "next/cache";

import prisma from "@/lib/prisma";
import { getSelf } from "@/lib/auth-service";

interface StreamUpdateData {
  name?: string;
  thumbnailUrl?: string | null;
  isChatEnabled?: boolean;
  isChatFollowersOnly?: boolean;
  isChatDelayed?: boolean;
}

/**
 * Set the stream live status
 * Used by browser broadcast to go live/offline
 */
export const setStreamLiveStatus = async (isLive: boolean) => {
  try {
    const self = await getSelf();

    const stream = await prisma.stream.update({
      where: {
        userId: self.id,
      },
      data: {
        isLive,
      },
    });

    // Revalidate all relevant paths
    revalidatePath(`/u/${self.username}`);
    revalidatePath(`/${self.username}`);
    revalidatePath("/");

    return stream;
  } catch (error) {
    console.error("setStreamLiveStatus", error);
    throw new Error("Failed to update stream status");
  }
};

export const updateStream = async (values: StreamUpdateData) => {
  try {
    const self = await getSelf();
    const selfStream = await prisma.stream.findUnique({
      where: {
        userId: self.id,
      },
    });

    if (!selfStream) {
      throw new Error("No stream found");
    }

    const validData = {
      name: values.name,
      thumbnailUrl: values.thumbnailUrl,
      isChatEnabled: values.isChatEnabled,
      isChatFollowersOnly: values.isChatFollowersOnly,
      isChatDelayed: values.isChatDelayed,
    };

    const stream = await prisma.stream.update({
      where: {
        id: selfStream.id,
      },
      data: {
        ...validData,
      },
    });

    revalidatePath(`/u/${self.username}/chat`);
    revalidatePath(`/u/${self.username}`);
    revalidatePath(`/${self.username}`);

    return stream;
  } catch (error) {
    console.error("updateStream", error);
    throw new Error("Internal server error");
  }
};
