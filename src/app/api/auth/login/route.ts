import { NextRequest } from "next/server";

import { loginSchema } from "@/lib/validations/auth";
import prisma from "@/lib/prisma";
import { verifyPassword, createSession, setSessionCookie } from "@/lib/auth";
import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { ApiError } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input with Zod schema
    const validationResult = loginSchema.safeParse(body);

    if (!validationResult.success) {
      return createErrorResponse(validationResult.error);
    }

    const { email, password } = validationResult.data;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        username: true,
        email: true,
        passwordHash: true,
        imageUrl: true,
        bio: true,
      },
    });

    // Don't reveal if user exists or not (security best practice)
    if (!user) {
      throw new ApiError(
        401,
        "Invalid email or password",
        "INVALID_CREDENTIALS"
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);

    if (!isValid) {
      throw new ApiError(
        401,
        "Invalid email or password",
        "INVALID_CREDENTIALS"
      );
    }

    // Create session
    const token = await createSession(user.id);
    await setSessionCookie(token);

    // Return user data (exclude password hash)
    const { passwordHash: _, ...userWithoutPassword } = user;

    return createSuccessResponse(
      {
        user: userWithoutPassword,
      },
      "Login successful"
    );
  } catch (error) {
    return createErrorResponse(error, "Failed to login");
  }
}
