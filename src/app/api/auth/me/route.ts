import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import { createErrorResponse, createSuccessResponse } from "@/lib/api-response";
import { ApiError } from "@/lib/api-response";

export async function GET() {
  try {
    const user = await getSession();

    if (!user) {
      throw new ApiError(
        401,
        "Not authenticated",
        "UNAUTHORIZED"
      );
    }

    return createSuccessResponse({ user });
  } catch (error) {
    return createErrorResponse(error, "Failed to get user session");
  }
}
