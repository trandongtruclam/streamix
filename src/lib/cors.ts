import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * CORS configuration
 */
export interface CorsConfig {
  /**
   * Allowed origins
   * Use "*" for all origins (not recommended for production)
   * Or specify specific origins: ["https://example.com", "https://app.example.com"]
   */
  allowedOrigins: string[] | "*";

  /**
   * Allowed HTTP methods
   */
  allowedMethods: string[];

  /**
   * Allowed headers
   */
  allowedHeaders: string[];

  /**
   * Exposed headers (headers that can be accessed by the client)
   */
  exposedHeaders?: string[];

  /**
   * Whether to allow credentials (cookies, authorization headers)
   */
  allowCredentials: boolean;

  /**
   * Max age for preflight requests (in seconds)
   */
  maxAge?: number;
}

/**
 * Default CORS configuration
 */
const defaultCorsConfig: CorsConfig = {
  allowedOrigins:
    process.env.CORS_ORIGINS?.split(",").map((origin) => origin.trim()) ||
    (process.env.NODE_ENV === "production" ? [] : ["http://localhost:3000"]),
  allowedMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
  ],
  exposedHeaders: ["X-Response-Time"],
  allowCredentials: true,
  maxAge: 86400, // 24 hours
};

/**
 * Check if origin is allowed
 */
function isOriginAllowed(
  origin: string | null,
  allowedOrigins: string[] | "*"
): boolean {
  if (!origin) return false;
  if (allowedOrigins === "*") return true;
  return allowedOrigins.includes(origin);
}

/**
 * Handle CORS preflight request (OPTIONS)
 */
export function handleCorsPreflight(
  request: NextRequest,
  config: CorsConfig = defaultCorsConfig
): NextResponse | null {
  const origin = request.headers.get("origin");

  // If origin is not allowed, deny the request
  if (!isOriginAllowed(origin, config.allowedOrigins)) {
    return new NextResponse(null, { status: 403 });
  }

  const response = new NextResponse(null, {
    status: 204, // No Content
  });

  // Set CORS headers
  response.headers.set("Access-Control-Allow-Origin", origin || "*");
  response.headers.set(
    "Access-Control-Allow-Methods",
    config.allowedMethods.join(", ")
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    config.allowedHeaders.join(", ")
  );

  if (config.exposedHeaders) {
    response.headers.set(
      "Access-Control-Expose-Headers",
      config.exposedHeaders.join(", ")
    );
  }

  if (config.allowCredentials) {
    response.headers.set("Access-Control-Allow-Credentials", "true");
  }

  if (config.maxAge) {
    response.headers.set("Access-Control-Max-Age", config.maxAge.toString());
  }

  return response;
}

/**
 * Add CORS headers to response
 */
export function addCorsHeaders(
  response: NextResponse,
  request: NextRequest,
  config: CorsConfig = defaultCorsConfig
): NextResponse {
  const origin = request.headers.get("origin");

  // Only add CORS headers if origin is allowed
  if (isOriginAllowed(origin, config.allowedOrigins)) {
    response.headers.set("Access-Control-Allow-Origin", origin || "*");
    response.headers.set(
      "Access-Control-Allow-Methods",
      config.allowedMethods.join(", ")
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      config.allowedHeaders.join(", ")
    );

    if (config.exposedHeaders) {
      response.headers.set(
        "Access-Control-Expose-Headers",
        config.exposedHeaders.join(", ")
      );
    }

    if (config.allowCredentials) {
      response.headers.set("Access-Control-Allow-Credentials", "true");
    }
  }

  return response;
}

/**
 * Create CORS-enabled response
 */
export function createCorsResponse(
  request: NextRequest,
  body: unknown,
  status: number = 200,
  config: CorsConfig = defaultCorsConfig
): NextResponse {
  const response = NextResponse.json(body, { status });
  return addCorsHeaders(response, request, config);
}
