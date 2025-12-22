import { NextResponse } from "next/server";
import { ZodError } from "zod";

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
  defaultMessage = "Internal server error"
): NextResponse {
  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        message: "Validation failed",
        errors: formatZodError(error),
      },
      { status: 400 }
    );
  }

  // Handle custom ApiError
  if (error instanceof ApiError) {
    const response: {
      success: false;
      message: string;
      code?: string;
      details?: unknown;
    } = {
      success: false,
      message: error.message,
    };

    if (error.code) {
      response.code = error.code;
    }

    if (error.details) {
      response.details = error.details;
    }

    return NextResponse.json(response, { status: error.statusCode });
  }

  // Handle standard Error
  if (error instanceof Error) {
    // Don't expose internal error messages in production
    const message =
      process.env.NODE_ENV === "production" ? defaultMessage : error.message;

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }

  // Handle unknown errors
  return NextResponse.json(
    {
      success: false,
      message: defaultMessage,
    },
    { status: 500 }
  );
}

/**
 * Create a standardized success response
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse {
  return NextResponse.json(
    {
      success: true,
      ...(message && { message }),
      data,
    },
    { status }
  );
}
