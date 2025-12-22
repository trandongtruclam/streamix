import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ZodError } from "zod";

import { addCorsHeaders } from "@/lib/cors";

/**
 * Standard API error response
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Format Zod validation errors into a user-friendly format
 */
export function formatZodError(error: ZodError) {
  const formattedErrors: Record<string, string[]> = {};

  error.issues.forEach((issue) => {
    const path = issue.path.join(".");
    if (!formattedErrors[path]) {
      formattedErrors[path] = [];
    }
    formattedErrors[path].push(issue.message);
  });

  return formattedErrors;
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  error: unknown,
  defaultMessage = "Internal server error",
  request?: NextRequest
): NextResponse {
  let response: NextResponse;

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    response = NextResponse.json(
      {
        success: false,
        message: "Validation failed",
        errors: formatZodError(error),
      },
      { status: 400 }
    );
  }
  // Handle custom ApiError
  else if (error instanceof ApiError) {
    const responseBody: {
      success: false;
      message: string;
      code?: string;
      details?: unknown;
    } = {
      success: false,
      message: error.message,
    };

    if (error.code) {
      responseBody.code = error.code;
    }

    if (error.details) {
      responseBody.details = error.details;
    }

    response = NextResponse.json(responseBody, { status: error.statusCode });
  }
  // Handle standard Error
  else if (error instanceof Error) {
    // Don't expose internal error messages in production
    const message =
      process.env.NODE_ENV === "production" ? defaultMessage : error.message;

    response = NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
  // Handle unknown errors
  else {
    response = NextResponse.json(
      {
        success: false,
        message: defaultMessage,
      },
      { status: 500 }
    );
  }

  // Add CORS headers if request is provided
  if (request) {
    return addCorsHeaders(response, request);
  }

  return response;
}

/**
 * Create a standardized success response
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  status: number = 200,
  request?: NextRequest
): NextResponse {
  const response = NextResponse.json(
    {
      success: true,
      ...(message && { message }),
      data,
    },
    { status }
  );

  // Add CORS headers if request is provided
  if (request) {
    return addCorsHeaders(response, request);
  }

  return response;
}
