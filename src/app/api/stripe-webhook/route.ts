import { NextResponse } from "next/server";
import crypto from "crypto";
import { notifyPayment } from "@/lib/notify";

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

  const isValid = elements.signatures.some((sig) => sig === expectedSignature);

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
    const session = event.data.object;

    // Extract data for Notion update
    const customerEmail = session.customer_details?.email || "";
    const amountTotal = session.amount_total || 0; // in cents
    const currency = (session.currency || "eur").toUpperCase();

    // Get company name from custom fields
    let companyName = "";
    const customFields = session.custom_fields || [];
    for (const field of customFields) {
      if (field.key === "companyname" || field.label?.custom === "Company Name") {
        companyName = field.text?.value || field.dropdown?.value || "";
      }
    }

    // Get promo code if used
    let promoCode = "";
    if (session.total_details?.breakdown?.discounts?.length > 0) {
      const discount = session.total_details.breakdown.discounts[0];
      // Fetch the promotion code details
      const promoId = discount.discount?.promotion_code;
      if (promoId && typeof promoId === "string") {
        try {
          const promoRes = await fetch(
            `https://api.stripe.com/v1/promotion_codes/${promoId}`,
            { headers: { Authorization: `Bearer ${stripeSecret}` } }
          );
          if (promoRes.ok) {
            const promoData = await promoRes.json();
            promoCode = promoData.code || "";
          }
        } catch {
          // non-critical, proceed without promo code
        }
      }
    }

    // Determine tier from line items
    let tier = "analysis";
    const lineItemsRes = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${session.id}/line_items`,
      { headers: { Authorization: `Bearer ${stripeSecret}` } }
    );
    if (lineItemsRes.ok) {
      const lineItems = await lineItemsRes.json();
      for (const item of lineItems.data || []) {
        const productId = item.price?.product;
        if (productId && typeof productId === "string") {
          const productRes = await fetch(
            `https://api.stripe.com/v1/products/${productId}`,
            { headers: { Authorization: `Bearer ${stripeSecret}` } }
          );
          if (productRes.ok) {
            const product = await productRes.json();
            if (product.metadata?.tier === "debrief") {
              tier = "debrief";
            }
          }
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
                  property: "Encoded Answers",
                  rich_text: { equals: encodedAnswers },
                },
                sorts: [{ property: "Submitted At", direction: "descending" }],
                page_size: 1,
              }),
            }
          );

          if (queryRes.ok) {
            const queryData = await queryRes.json();
            const page = queryData.results?.[0];

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
                  },
                }),
              });

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

              // Send payment notification email (fire-and-forget)
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
