import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const checks = {
    database: false,
    environment: false,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  };

  // Check database connectivity
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;
  } catch (error) {
    console.error("Health check - database failed:", error);
  }

  // Check required environment variables
  const requiredEnv = [
    "DATABASE_URL",
    "AUTH_SECRET",
    "NEXTAUTH_URL",
  ];
  
  const missingEnv = requiredEnv.filter((key) => !process.env[key]);
  checks.environment = missingEnv.length === 0;

  const status = checks.database && checks.environment ? "healthy" : "degraded";
  const statusCode = status === "healthy" ? 200 : 503;

  return NextResponse.json(
    {
      status,
      checks,
      missingEnv: missingEnv.length > 0 ? missingEnv : undefined,
    },
    { status: statusCode }
  );
}