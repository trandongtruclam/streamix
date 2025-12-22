import { NextRequest } from "next/server";

import { registerSchema } from "@/lib/validations/auth";
import prisma from "@/lib/prisma";
import { hashPassword, createSession, setSessionCookie } from "@/lib/auth";
import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { ApiError } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input with Zod schema
    const validationResult = registerSchema.safeParse(body);

    if (!validationResult.success) {
      return createErrorResponse(validationResult.error);
    }

    const { username, email, password } = validationResult.data;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
      select: {
        email: true,
        username: true,
      },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new ApiError(409, "Email already in use", "EMAIL_EXISTS");
      }
      throw new ApiError(409, "Username already taken", "USERNAME_EXISTS");
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user and stream in a transaction
    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        imageUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
          username
        )}`,
        stream: {
          create: {
            name: `${username}'s stream`,
          },
        },
      },
      select: {
        id: true,
        username: true,
        email: true,
        imageUrl: true,
        bio: true,
      },
    });

    // Create session
    const token = await createSession(user.id);
    await setSessionCookie(token);

    return createSuccessResponse(
      {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          imageUrl: user.imageUrl,
          bio: user.bio,
        },
      },
      "User registered successfully",
      201
    );
  } catch (error) {
    return createErrorResponse(error, "Failed to register user");
  }
}
