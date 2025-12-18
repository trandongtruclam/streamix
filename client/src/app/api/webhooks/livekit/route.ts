import { headers } from "next/headers";
import { WebhookReceiver } from "livekit-server-sdk";

import prisma from "@/lib/prisma";

const receiver = new WebhookReceiver(
  process.env.LIVEKIT_API_KEY!,
  process.env.LIVEKIT_API_SECRET!
);

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
    await prisma.stream.update({
      where: {
        ingressId: event.ingressInfo?.ingressId,
      },
      data: {
        isLive: true,
      },
    });
  }

  if (event.event === "ingress_ended") {
    await prisma.stream.update({
      where: {
        ingressId: event.ingressInfo?.ingressId,
      },
      data: {
        isLive: false,
      },
    });
  }

  // Handle browser broadcast - track_published event
  // When a participant publishes a track, check if they're the room owner
  if (event.event === "track_published") {
    const participantIdentity = event.participant?.identity;
    const roomName = event.room?.name;

    // For browser broadcast, participant identity = userId = room name
    // Only update if the publisher is the room owner (streamer)
    if (participantIdentity && roomName && participantIdentity === roomName) {
      await prisma.stream.update({
        where: {
          userId: participantIdentity,
        },
        data: {
          isLive: true,
        },
      });
    }
  }

  // Handle participant leaving - check if streamer left
  if (event.event === "participant_left") {
    const participantIdentity = event.participant?.identity;
    const roomName = event.room?.name;

    // If the room owner (streamer) left, mark stream as offline
    if (participantIdentity && roomName && participantIdentity === roomName) {
      await prisma.stream.update({
        where: {
          userId: participantIdentity,
        },
        data: {
          isLive: false,
        },
      });
    }
  }

  return new Response("OK", { status: 200 });
}
