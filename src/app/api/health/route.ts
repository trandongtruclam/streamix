import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-response";

interface HealthStatus {
  status: "healthy" | "unhealthy";
  timestamp: string;
  uptime: number;
  database: {
    status: "connected" | "disconnected";
    responseTime?: number;
  };
  version?: string;
  environment: string;
}

const startTime = Date.now();

/**
 * Health check endpoint
 * Returns the health status of the application and its dependencies
 */
export async function GET() {
  try {
    const healthStatus: HealthStatus = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - startTime) / 1000), // seconds
      database: {
        status: "disconnected",
      },
      environment: process.env.NODE_ENV || "development",
    };

    // Check database connection
    const dbStartTime = Date.now();
    try {
      await prisma.$queryRaw`SELECT 1`;
      const dbResponseTime = Date.now() - dbStartTime;

      healthStatus.database = {
        status: "connected",
        responseTime: dbResponseTime,
      };
    } catch (dbError) {
      healthStatus.status = "unhealthy";
      healthStatus.database.status = "disconnected";

      // Return unhealthy status if database is down
      return NextResponse.json(
        {
          success: false,
          message: "Service unhealthy - database connection failed",
          data: healthStatus,
        },
        { status: 503 }
      );
    }

    // Add version if available
    if (process.env.npm_package_version) {
      healthStatus.version = process.env.npm_package_version;
    }

    return createSuccessResponse(healthStatus, "Service is healthy");
  } catch (error) {
    // If health check itself fails, return unhealthy
    return NextResponse.json(
      {
        success: false,
        message: "Health check failed",
        data: {
          status: "unhealthy",
          timestamp: new Date().toISOString(),
          uptime: Math.floor((Date.now() - startTime) / 1000),
          database: {
            status: "unknown",
          },
          environment: process.env.NODE_ENV || "development",
        },
      },
      { status: 503 }
    );
  }
}
