"use server";

import { revalidatePath } from "next/cache";

import { getSelf } from "@/lib/auth-service";
import prisma from "@/lib/prisma";

interface UserUpdateData {
  bio?: string | null;
}

export const updateUser = async (values: UserUpdateData) => {
  const self = await getSelf();

  const validData = {
    bio: values.bio,
  };

  const user = await prisma.user.update({
    where: { id: self.id },
    data: validData,
  });

  revalidatePath(`/${self.username}`);
  revalidatePath(`/u/${self.username}`);

  return user;
};
