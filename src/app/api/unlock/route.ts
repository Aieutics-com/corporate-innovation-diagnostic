import { NextResponse } from "next/server";
import { createUnlockToken, UNLOCK_COOKIE, type Tier } from "@/lib/payment";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json(
      { error: "Missing session_id" },
      { status: 400 }
    );
  }

  try {
    // Verify the Stripe checkout session
    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecret) {
      console.error("STRIPE_SECRET_KEY not configured");
      return NextResponse.json(
        { error: "Payment verification unavailable" },
        { status: 500 }
      );
    }

    const stripeRes = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${sessionId}`,
      {
        headers: {
          Authorization: `Bearer ${stripeSecret}`,
        },
      }
    );

    if (!stripeRes.ok) {
      return NextResponse.json(
        { error: "Invalid session" },
        { status: 400 }
      );
    }

    const session = await stripeRes.json();

    // Session must be completed (paid or 100%-off promo)
    if (session.status !== "complete") {
      return NextResponse.json(
        { error: "Payment not completed" },
        { status: 400 }
      );
    }

    // Extract the encoded answers from the success URL or client_reference_id
    // The answers are passed via the success URL's `r` param
    const successUrl = session.success_url || "";
    const clientRefId = session.client_reference_id || "";

    // client_reference_id carries the encoded answers (set in Payment Link URL)
    // Fallback: parse from success_url query param
    let encodedAnswers = clientRefId;
    if (!encodedAnswers && successUrl) {
      try {
        const url = new URL(successUrl);
        encodedAnswers = url.searchParams.get("r") || "";
      } catch {
        // ignore URL parse errors
      }
    }

    if (!encodedAnswers) {
      return NextResponse.json(
        { error: "Cannot determine diagnostic answers from session" },
        { status: 400 }
      );
    }

    // Determine tier from the product metadata or price amount
    // We use the metadata.tier field set on the Stripe product
    let tier: Tier = "analysis";

    // Fetch line items to determine which product was purchased
    const lineItemsRes = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${sessionId}/line_items`,
      {
        headers: {
          Authorization: `Bearer ${stripeSecret}`,
        },
      }
    );

    if (lineItemsRes.ok) {
      const lineItems = await lineItemsRes.json();
      const items = lineItems.data || [];
      for (const item of items) {
        // Check product metadata for tier
        const productId = item.price?.product;
        if (productId && typeof productId === "string") {
          const productRes = await fetch(
            `https://api.stripe.com/v1/products/${productId}`,
            {
              headers: {
                Authorization: `Bearer ${stripeSecret}`,
              },
            }
          );
          if (productRes.ok) {
            const product = await productRes.json();
            if (product.metadata?.tier === "debrief") {
              tier = "debrief";
            }
          }
        }
        // Fallback: if no metadata, detect by price (debrief >= 10000 cents / EUR 100)
        if (tier === "analysis" && (item.amount_total ?? 0) >= 10000) {
          tier = "debrief";
        }
      }
    }

    // Create JWT and set cookie
    const token = await createUnlockToken(encodedAnswers, tier);

    const response = NextResponse.json({
      success: true,
      tier,
      answers: encodedAnswers,
    });

    response.cookies.set(UNLOCK_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("Unlock API error:", err);
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}
