import { NextResponse } from "next/server";
import crypto from "crypto";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");

  if (!key) {
    return NextResponse.json({ valid: false }, { status: 400 });
  }

  const demoSecret = process.env.DEMO_SECRET;
  if (!demoSecret) {
    return NextResponse.json({ valid: false }, { status: 500 });
  }

  // Constant-time comparison to prevent timing attacks
  const valid =
    key.length === demoSecret.length &&
    crypto.timingSafeEqual(Buffer.from(key), Buffer.from(demoSecret));

  return NextResponse.json({ valid });
}
