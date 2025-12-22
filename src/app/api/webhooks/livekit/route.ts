import { headers } from "next/headers";
import { WebhookReceiver } from "livekit-server-sdk";
import { revalidatePath } from "next/cache";

import prisma from "@/lib/prisma";

const receiver = new WebhookReceiver(
  process.env.LIVEKIT_API_KEY!,
  process.env.LIVEKIT_API_SECRET!
);

// Helper function to update stream status and revalidate paths
async function updateStreamStatus(
  userId: string,
  isLive: boolean,
  username?: string
) {
  const stream = await prisma.stream.update({
    where: {
      userId,
    },
    data: {
      isLive,
    },
    include: {
      user: {
        select: {
          username: true,
        },
      },
    },
  });

  // Revalidate all relevant paths
  const streamUsername = username || stream.user.username;
  revalidatePath(`/u/${streamUsername}`);
  revalidatePath(`/u/${streamUsername}/(home)`);
  revalidatePath(`/u/${streamUsername}/chat`);
  revalidatePath(`/u/${streamUsername}/stream`);
  revalidatePath(`/${streamUsername}`);
  revalidatePath("/"); // Main page with all streams

  return stream;
}

export async function POST(req: Request) {
  const body = await req.text();
  const headerPayload = await headers();
  const authorization = headerPayload.get("Authorization");

  if (!authorization) {
    return new Response("No authorization header", { status: 400 });
  }

  const event = await receiver.receive(body, authorization);

  // Handle ingress-based streaming (OBS/RTMP)
  if (event.event === "ingress_started") {
    const stream = await prisma.stream.findUnique({
      where: {
        ingressId: event.ingressInfo?.ingressId,
      },
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
    });

    if (stream) {
      await prisma.stream.update({
        where: {
          ingressId: event.ingressInfo?.ingressId,
        },
        data: {
          isLive: true,
        },
      });
      revalidatePath(`/${stream.user.username}`);
      revalidatePath("/");
    }
  }

  if (event.event === "ingress_ended") {
    const stream = await prisma.stream.findUnique({
      where: {
        ingressId: event.ingressInfo?.ingressId,
      },
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
    });

    if (stream) {
      await prisma.stream.update({
        where: {
          ingressId: event.ingressInfo?.ingressId,
        },
        data: {
          isLive: false,
        },
      });
      revalidatePath(`/${stream.user.username}`);
      revalidatePath("/");
    }
  }

  // Handle browser broadcast - track_published event
  // When a participant publishes a track, check if they're the room owner
  if (event.event === "track_published") {
    const participantIdentity = event.participant?.identity;
    const roomName = event.room?.name;

    // For browser broadcast, participant identity = userId = room name
    // Only update if the publisher is the room owner (streamer)
    if (participantIdentity && roomName && participantIdentity === roomName) {
      await updateStreamStatus(participantIdentity, true);
    }
  }

  // Handle track_unpublished - when streamer stops publishing tracks
  if (event.event === "track_unpublished") {
    const participantIdentity = event.participant?.identity;
    const roomName = event.room?.name;
    const trackSource = event.track?.source;

    // If the room owner (streamer) unpublished a video or audio track
    if (
      participantIdentity &&
      roomName &&
      participantIdentity === roomName &&
      trackSource
    ) {
      // Check if it's a camera, screen share, or microphone track
      const sourceString = String(trackSource).toLowerCase();
      if (
        sourceString.includes("camera") ||
        sourceString.includes("screen") ||
        sourceString.includes("microphone")
      ) {
        // Mark stream as offline when streamer stops publishing
        // Note: participant_left event is more reliable, but this is a safety measure
        await updateStreamStatus(participantIdentity, false);
      }
    }
  }

  // Handle participant leaving - check if streamer left
  if (event.event === "participant_left") {
    const participantIdentity = event.participant?.identity;
    const roomName = event.room?.name;

    // If the room owner (streamer) left, mark stream as offline
    if (participantIdentity && roomName && participantIdentity === roomName) {
      await updateStreamStatus(participantIdentity, false);
    }
  }

  // Handle room finished - when room ends completely
  if (event.event === "room_finished") {
    const roomName = event.room?.name;

    // If room name matches a userId, mark that stream as offline
    if (roomName) {
      try {
        const stream = await prisma.stream.findUnique({
          where: {
            userId: roomName,
          },
          include: {
            user: {
              select: {
                username: true,
              },
            },
          },
        });

        if (stream && stream.isLive) {
          await updateStreamStatus(roomName, false);
        }
      } catch (error) {
        // Room name might not be a userId, ignore
        console.error("Error updating stream status for room:", error);
      }
    }
  }

  return new Response("OK", { status: 200 });
}
