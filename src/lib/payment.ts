import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const UNLOCK_COOKIE = "ci_unlock";

export type Tier = "analysis" | "debrief";

interface UnlockPayload {
  answers: string; // encoded answer string (e.g. "101010...")
  tier: Tier;
}

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not configured");
  return new TextEncoder().encode(secret);
}

export async function createUnlockToken(
  answers: string,
  tier: Tier
): Promise<string> {
  return new SignJWT({ answers, tier } satisfies UnlockPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getSecret());
}

export async function verifyUnlockToken(
  token: string
): Promise<UnlockPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const answers = payload.answers;
    const tier = payload.tier;
    if (typeof answers !== "string" || (tier !== "analysis" && tier !== "debrief")) {
      return null;
    }
    return { answers, tier };
  } catch {
    return null;
  }
}

/**
 * Server-side check: is the current request from a user who has paid
 * for the given answer set?
 */
export async function getUnlockStatus(
  encodedAnswers: string
): Promise<{ isPaid: boolean; tier: Tier | null }> {
  const cookieStore = await cookies();
  const token = cookieStore.get(UNLOCK_COOKIE)?.value;
  if (!token) return { isPaid: false, tier: null };

  const payload = await verifyUnlockToken(token);
  if (!payload) return { isPaid: false, tier: null };

  // Token must match the current answer set
  if (payload.answers !== encodedAnswers) return { isPaid: false, tier: null };

  return { isPaid: true, tier: payload.tier };
}
