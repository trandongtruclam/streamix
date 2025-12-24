import prisma from "@/lib/prisma";

export async function getRecordingsByUserId(userId: string) {
  try {
    const recordings = await prisma.recording.findMany({
      where: {
        userId,
        status: "EGRESS_COMPLETE", // Only show completed recordings
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            username: true,
            imageUrl: true,
          },
        },
      },
    });

    return recordings;
  } catch (error) {
    console.error("Failed to get recordings:", error);
    return [];
  }
}

export async function getRecordingById(id: string) {
  try {
    const recording = await prisma.recording.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            imageUrl: true,
            bio: true,
          },
        },
      },
    });

    return recording;
  } catch (error) {
    console.error("Failed to get recording:", error);
    return null;
  }
}

export async function getRecordingByEgressId(egressId: string) {
  try {
    const recording = await prisma.recording.findUnique({
      where: { egressId },
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
    });

    return recording;
  } catch (error) {
    console.error("Failed to get recording by egressId:", error);
    return null;
  }
}

export async function getRecordingsByUsername(username: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!user) {
      return [];
    }

    return getRecordingsByUserId(user.id);
  } catch (error) {
    console.error("Failed to get recordings by username:", error);
    return [];
  }
}
