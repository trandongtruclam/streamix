import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const getSelf = async () => {
  const session = await getSession();

  if (!session) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.id,
    },
  });

  if (!user) {
    throw new Error("Not found");
  }

  return user;
};

export const getSelfByUsername = async (username: string) => {
  const session = await getSession();

  if (!session) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: {
      username,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (session.username !== username) {
    throw new Error("Unauthorized");
  }

  return user;
};

export const getCurrentUser = async () => {
  return await getSession();
};
