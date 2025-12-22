import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { deleteSession, clearSessionCookie } from "@/lib/auth";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (token) {
      await deleteSession(token);
    }

    await clearSessionCookie();

    return createSuccessResponse(
      null,
      "Logged out successfully"
    );
  } catch (error) {
    return createErrorResponse(error, "Failed to logout");
  }
}
