import { NextRequest, NextResponse } from "next/server";

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyPrefix: string;
}

const memoryStore = new Map<string, { count: number; resetAt: number }>();

export function createRateLimiter(config: RateLimitConfig) {
  return async function rateLimit(request: NextRequest): Promise<NextResponse | null> {
    const key = `${config.keyPrefix}:${getClientIdentifier(request)}`;
    const now = Date.now();
    
    const record = memoryStore.get(key);
    
    if (!record || now > record.resetAt) {
      memoryStore.set(key, { count: 1, resetAt: now + config.windowMs });
      return null;
    }
    
    if (record.count >= config.maxRequests) {
      const retryAfter = Math.ceil((record.resetAt - now) / 1000);
      return NextResponse.json(
        { error: "Too many requests", retryAfter },
        { 
          status: 429,
          headers: {
            "Retry-After": String(retryAfter),
            "X-RateLimit-Limit": String(config.maxRequests),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(Math.ceil(record.resetAt / 1000)),
          }
        }
      );
    }
    
    record.count++;
    return null;
  };
}

function getClientIdentifier(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";
  return `${ip}:${hashString(userAgent)}`;
}

function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

// Pre-configured rate limiters
export const searchRateLimit = createRateLimiter({
  windowMs: 1000, // 1 second
  maxRequests: 10,
  keyPrefix: "search",
});

export const cartRateLimit = createRateLimiter({
  windowMs: 60000, // 1 minute
  maxRequests: 30,
  keyPrefix: "cart",
});

export const checkoutRateLimit = createRateLimiter({
  windowMs: 60000, // 1 minute
  maxRequests: 5,
  keyPrefix: "checkout",
});

// Cleanup old entries periodically
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of memoryStore.entries()) {
      if (now > record.resetAt) {
        memoryStore.delete(key);
      }
    }
  }, 60000); // Cleanup every minute
}