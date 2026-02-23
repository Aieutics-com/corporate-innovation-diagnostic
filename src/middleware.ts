import { NextResponse, type NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/* ------------------------------------------------------------------ */
/*  Rate-limiter factory — returns null when env vars are absent       */
/*  (graceful degradation for local dev and Upstash outages)          */
/* ------------------------------------------------------------------ */

function createLimiter(requests: number, window: `${number} ${"s" | "m" | "h"}`) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  return new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(requests, window),
    analytics: false, // saves commands on Upstash free tier
  });
}

/* ------------------------------------------------------------------ */
/*  Per-route-group limiters                                          */
/* ------------------------------------------------------------------ */

const limiters = {
  submit: createLimiter(10, "1 m"),
  share: createLimiter(5, "1 m"),
  unlock: createLimiter(10, "1 m"),
};

function getLimiter(pathname: string) {
  if (pathname === "/api/submit" || pathname === "/api/submit/update")
    return { limiter: limiters.submit, prefix: "submit" };
  if (pathname === "/api/share")
    return { limiter: limiters.share, prefix: "share" };
  if (pathname === "/api/unlock" || pathname === "/api/check-unlock")
    return { limiter: limiters.unlock, prefix: "unlock" };
  return null;
}

function getIP(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "anonymous"
  );
}

/* ------------------------------------------------------------------ */
/*  Middleware                                                         */
/* ------------------------------------------------------------------ */

export async function middleware(request: NextRequest) {
  const match = getLimiter(request.nextUrl.pathname);
  if (!match?.limiter) return NextResponse.next();

  const identifier = `${match.prefix}:${getIP(request)}`;

  try {
    const { success, limit, remaining, reset } =
      await match.limiter.limit(identifier);

    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": reset.toString(),
            "Retry-After": Math.ceil((reset - Date.now()) / 1000).toString(),
          },
        },
      );
    }

    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Limit", limit.toString());
    response.headers.set("X-RateLimit-Remaining", remaining.toString());
    response.headers.set("X-RateLimit-Reset", reset.toString());
    return response;
  } catch {
    // Redis unavailable — pass through rather than block legitimate users
    return NextResponse.next();
  }
}

/* ------------------------------------------------------------------ */
/*  Matcher — exclude stripe-webhook (needs guaranteed delivery)      */
/*  and check-demo (low-impact, timing-safe comparison)               */
/* ------------------------------------------------------------------ */

export const config = {
  matcher: [
    "/api/submit",
    "/api/submit/update",
    "/api/share",
    "/api/unlock",
    "/api/check-unlock",
  ],
};
