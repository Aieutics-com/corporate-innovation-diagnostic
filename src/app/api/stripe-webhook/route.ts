import { NextResponse } from "next/server";
import crypto from "crypto";
import { notifyPayment, sendCustomerReport } from "@/lib/notify";
import { generateDiagnosticPDF } from "@/lib/generate-pdf";

// Diagnostic GET handler — confirms the endpoint is live and env vars are present
export async function GET() {
  return NextResponse.json({
    status: "ok",
    hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
    hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
    hasNotionKey: !!process.env.NOTION_API_KEY,
    hasNotionDb: !!process.env.NOTION_DATABASE_ID,
    hasResendKey: !!process.env.RESEND_API_KEY,
    webhookSecretPrefix: process.env.STRIPE_WEBHOOK_SECRET?.slice(0, 8) || "MISSING",
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripeSecret = process.env.STRIPE_SECRET_KEY;

  if (!webhookSecret || !stripeSecret) {
    console.error("Stripe webhook secrets not configured");
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  // Read raw body for signature verification
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  // Parse Stripe signature header
  const elements = signature.split(",").reduce(
    (acc, part) => {
      const [key, value] = part.split("=");
      if (key === "t") acc.timestamp = value;
      if (key === "v1") acc.signatures.push(value);
      return acc;
    },
    { timestamp: "", signatures: [] as string[] }
  );

  // Verify signature
  const signedPayload = `${elements.timestamp}.${body}`;
  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(signedPayload)
    .digest("hex");

  const expectedBuf = Buffer.from(expectedSignature);
  const isValid = elements.signatures.some(
    (sig) =>
      sig.length === expectedSignature.length &&
      crypto.timingSafeEqual(Buffer.from(sig), expectedBuf)
  );

  if (!isValid) {
    console.error("Stripe webhook signature verification failed");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Check timestamp to prevent replay attacks (5 min tolerance)
  const timestampAge = Math.floor(Date.now() / 1000) - parseInt(elements.timestamp);
  if (timestampAge > 300) {
    return NextResponse.json({ error: "Webhook too old" }, { status: 400 });
  }

  const event = JSON.parse(body);

  if (event.type === "checkout.session.completed") {
    const webhookSession = event.data.object;

    // The webhook payload is a thin representation — custom_fields and discount
    // breakdowns are NOT included. Fetch the full session from the Stripe API.
    // IMPORTANT: Do NOT use deep expand[] chains — Stripe has a max depth of 4.
    // "total_details.breakdown.discounts.discount.promotion_code" is 5 levels
    // deep and triggers property_expansion_max_depth errors.
    let session = webhookSession;
    try {
      const fullSessionRes = await fetch(
        `https://api.stripe.com/v1/checkout/sessions/${webhookSession.id}`,
        { headers: { Authorization: `Bearer ${stripeSecret}` } }
      );
      if (fullSessionRes.ok) {
        session = await fullSessionRes.json();
        console.log("Webhook: Fetched full session", session.id);
      } else {
        const errText = await fullSessionRes.text().catch(() => "");
        console.error("Webhook: Failed to fetch full session:", fullSessionRes.status, errText);
      }
    } catch (fetchErr) {
      console.error("Webhook: Exception fetching full session, using webhook payload:", fetchErr);
    }

    // Extract data for Notion update
    const customerEmail = session.customer_details?.email || "";
    const amountTotal = session.amount_total || 0; // in cents
    const currency = (session.currency || "eur").toUpperCase();

    // Company name comes from customer_details.name (Stripe's built-in billing
    // name field), NOT from custom_fields. Payment Links don't use custom_fields
    // unless explicitly configured — the "Company" field on checkout is the
    // standard billing company collected via customer_details.
    const companyName = session.customer_details?.name || "";
    // individual_name is the person's name (separate from business/company name)
    const contactName = session.customer_details?.individual_name || "";

    console.log("Webhook: Extracted fields", JSON.stringify({
      customerEmail, companyName, contactName, amountTotal, currency,
      clientRefId: session.client_reference_id || "",
    }));

    // Get promo code if used.
    // For Payment Link sessions, discount data lives in session.discounts[] —
    // an array of objects like { coupon: null, promotion_code: "promo_xxx" }.
    // The promotion_code value is an ID string that must be fetched separately
    // to get the human-readable .code (e.g. "FRIENDS2026").
    let promoCode = "";
    try {
      // Primary path: session.discounts[] (Payment Link sessions)
      const sessionDiscounts = session.discounts || [];
      for (const disc of sessionDiscounts) {
        const promoId = disc?.promotion_code || (typeof disc === "string" ? disc : null);
        if (typeof promoId === "string" && promoId.startsWith("promo_")) {
          const promoRes = await fetch(
            `https://api.stripe.com/v1/promotion_codes/${promoId}`,
            { headers: { Authorization: `Bearer ${stripeSecret}` } }
          );
          if (promoRes.ok) {
            const promoData = await promoRes.json();
            promoCode = promoData.code || "";
          }
          break;
        }
        // If disc is an expanded object with .code directly
        if (typeof disc === "object" && disc?.code) {
          promoCode = disc.code;
          break;
        }
      }

      // Fallback: total_details.breakdown.discounts (API-created sessions)
      if (!promoCode) {
        const breakdownDiscounts = session.total_details?.breakdown?.discounts || [];
        for (const bd of breakdownDiscounts) {
          const promoRef = bd.discount?.promotion_code;
          if (typeof promoRef === "object" && promoRef?.code) {
            promoCode = promoRef.code;
            break;
          } else if (typeof promoRef === "string") {
            const promoRes = await fetch(
              `https://api.stripe.com/v1/promotion_codes/${promoRef}`,
              { headers: { Authorization: `Bearer ${stripeSecret}` } }
            );
            if (promoRes.ok) {
              const promoData = await promoRes.json();
              promoCode = promoData.code || "";
            }
            break;
          }
          // Last resort: coupon name
          if (!promoCode && bd.discount?.coupon?.name) {
            promoCode = bd.discount.coupon.name;
            break;
          }
        }
      }
    } catch (promoErr) {
      console.error("Webhook: Failed to extract promo code:", promoErr);
    }

    console.log("Webhook: Promo code:", promoCode);

    // Determine tier from line items
    let tier = "analysis";
    const lineItemsRes = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${session.id}/line_items?expand[]=data.price.product`,
      { headers: { Authorization: `Bearer ${stripeSecret}` } }
    );
    if (lineItemsRes.ok) {
      const lineItems = await lineItemsRes.json();
      for (const item of lineItems.data || []) {
        // With expand, price.product is the full object
        const product = typeof item.price?.product === "object"
          ? item.price.product
          : null;
        if (product?.metadata?.tier === "debrief") {
          tier = "debrief";
        } else if (typeof item.price?.product === "string") {
          // Fallback: fetch product individually
          const productRes = await fetch(
            `https://api.stripe.com/v1/products/${item.price.product}`,
            { headers: { Authorization: `Bearer ${stripeSecret}` } }
          );
          if (productRes.ok) {
            const productData = await productRes.json();
            if (productData.metadata?.tier === "debrief") {
              tier = "debrief";
            }
          }
        }
        // Fallback: if no metadata, detect by list price (debrief >= 10000 cents / EUR 100)
        if (tier === "analysis" && (item.price?.unit_amount ?? 0) >= 10000) {
          tier = "debrief";
        }
      }
    }

    // Get the encoded answers from client_reference_id
    const encodedAnswers = session.client_reference_id || "";

    // Update the Notion submission record
    // We find the record by encoded answers and update it with payment data
    if (encodedAnswers) {
      try {
        const notionApiKey = process.env.NOTION_API_KEY;
        const databaseId = process.env.NOTION_DATABASE_ID;

        if (notionApiKey && databaseId) {
          // Query for the submission with matching encoded answers
          const queryRes = await fetch(
            `https://api.notion.com/v1/databases/${databaseId}/query`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${notionApiKey}`,
                "Content-Type": "application/json",
                "Notion-Version": "2022-06-28",
              },
              body: JSON.stringify({
                filter: {
                  and: [
                    {
                      property: "Encoded Answers",
                      rich_text: { equals: encodedAnswers },
                    },
                    {
                      property: "Tool",
                      select: { equals: "Corporate Innovation" },
                    },
                  ],
                },
                sorts: [{ property: "Submitted At", direction: "descending" }],
                page_size: 1,
              }),
            }
          );

          if (!queryRes.ok) {
            console.error("Notion query failed:", queryRes.status, await queryRes.text().catch(() => ""));
          }

          if (queryRes.ok) {
            const queryData = await queryRes.json();
            const page = queryData.results?.[0];

            if (!page) {
              console.error(
                "Webhook: No Notion record found for",
                JSON.stringify({ encodedAnswers, tool: "Corporate Innovation" })
              );
            }

            if (page) {
              // Update the Notion page with payment data
              await fetch(`https://api.notion.com/v1/pages/${page.id}`, {
                method: "PATCH",
                headers: {
                  Authorization: `Bearer ${notionApiKey}`,
                  "Content-Type": "application/json",
                  "Notion-Version": "2022-06-28",
                },
                body: JSON.stringify({
                  properties: {
                    Paid: { checkbox: true },
                    Tier: { select: { name: tier === "debrief" ? "Debrief" : "Analysis" } },
                    "Company Name": {
                      rich_text: companyName
                        ? [{ type: "text", text: { content: companyName } }]
                        : [],
                    },
                    "Contact Name": {
                      rich_text: contactName
                        ? [{ type: "text", text: { content: contactName } }]
                        : [],
                    },
                    "Amount Paid": { number: amountTotal / 100 },
                    Currency: {
                      select: { name: currency },
                    },
                    "Promo Code": {
                      rich_text: promoCode
                        ? [{ type: "text", text: { content: promoCode } }]
                        : [],
                    },
                    Email: { email: customerEmail || null },
                    "Stripe Session": {
                      url: `https://dashboard.stripe.com/payments/${session.payment_intent || session.id}`,
                    },
                    "Results URL": {
                      url: `https://corporatepoc.aieutics.com/diagnostic?r=${encodedAnswers}`,
                    },
                  },
                }),
              });

              console.log(
                "Webhook: Notion update sent for page",
                page.id,
                JSON.stringify({ companyName, customerEmail, promoCode, tier, amountTotal })
              );

              // Extract dimension data from the Notion record for the notification email
              const props = page.properties || {};
              const dimensions = [];
              for (let i = 1; i <= 5; i++) {
                const nameProp = props[`D${i} Name`];
                const scoreProp = props[`D${i} Score`];
                const statusProp = props[`D${i} Status`];
                const name = nameProp?.rich_text?.[0]?.plain_text || nameProp?.title?.[0]?.plain_text || `Dimension ${i}`;
                const score = scoreProp?.number ?? 0;
                const statusRaw = (statusProp?.select?.name || "amber").toLowerCase();
                const maxScore = (i === 1 || i === 5) ? 3 : 4;
                dimensions.push({ name, score, maxScore, status: statusRaw as "green" | "amber" | "red" });
              }

              const totalScore = props["Total Score"]?.number ?? 0;
              const totalMax = props["Total Max"]?.number ?? 18;
              const redCount = props["Red Count"]?.number ?? 0;
              const patternsRaw = props["Patterns"]?.multi_select || [];
              const patterns = patternsRaw.map((p: { name: string }) => p.name);

              // Send payment notification email to Alexandra (fire-and-forget)
              notifyPayment({
                tier: tier as "analysis" | "debrief",
                customerEmail,
                companyName,
                amountPaid: amountTotal / 100,
                currency,
                promoCode,
                totalScore,
                totalMax,
                dimensions,
                patterns,
                redCount,
                encodedAnswers,
              }).catch(() => {});

              // Generate branded PDF and send to customer (fire-and-forget)
              if (customerEmail) {
                try {
                  const pdfBuffer = generateDiagnosticPDF(
                    encodedAnswers,
                    companyName,
                    customerEmail,
                    tier as "analysis" | "debrief"
                  );
                  sendCustomerReport({
                    customerEmail,
                    companyName,
                    tier: tier as "analysis" | "debrief",
                    totalScore,
                    totalMax,
                    dimensions,
                    encodedAnswers,
                    pdfBuffer,
                  }).catch(() => {});
                } catch (pdfErr) {
                  console.error("Failed to generate PDF:", pdfErr);
                }
              }
            }
          }
        }
      } catch (err) {
        // Non-critical — log but don't fail the webhook
        console.error("Failed to update Notion:", err);
      }
    }
  }

  return NextResponse.json({ received: true });
}
