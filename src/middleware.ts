import { NextRequest, NextResponse } from "next/server";

// In-memory rate limit store: ip -> { count, resetAt }
// Note: This resets per-instance. For multi-server deployments use Redis.
const store = new Map<string, { count: number; resetAt: number }>();

const LIMIT = 10;                  // readings per window
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

function getIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname !== "/api/palm-read") {
    return NextResponse.next();
  }

  const ip = getIp(request);
  const now = Date.now();
  const record = store.get(ip);

  if (!record || now > record.resetAt) {
    store.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return NextResponse.next();
  }

  if (record.count >= LIMIT) {
    const retryAfterSecs = Math.ceil((record.resetAt - now) / 1000);
    return NextResponse.json(
      {
        error: `You've used all ${LIMIT} free readings for this hour. Please try again in ${Math.ceil(retryAfterSecs / 60)} minute(s).`,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfterSecs),
          "X-RateLimit-Limit": String(LIMIT),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(record.resetAt),
        },
      }
    );
  }

  record.count++;
  return NextResponse.next();
}

export const config = {
  matcher: "/api/palm-read",
};
