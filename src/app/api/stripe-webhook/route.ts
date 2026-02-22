import { NextResponse } from "next/server";
import crypto from "crypto";
import { notifyPayment, sendCustomerReport } from "@/lib/notify";
import { generateDiagnosticPDF } from "@/lib/generate-pdf";

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

    // The webhook payload is a thin representation — custom_fields, discount
    // breakdowns, and line items are NOT included. Fetch the full session from
    // the Stripe API with the expansions we need.
    let session = webhookSession;
    try {
      const params = new URLSearchParams({
        "expand[]": "total_details.breakdown.discounts.discount.promotion_code",
      });
      const fullSessionRes = await fetch(
        `https://api.stripe.com/v1/checkout/sessions/${webhookSession.id}?${params}`,
        { headers: { Authorization: `Bearer ${stripeSecret}` } }
      );
      if (fullSessionRes.ok) {
        session = await fullSessionRes.json();
      }
    } catch {
      // Fall back to webhook payload if fetch fails
      console.error("Failed to fetch expanded Stripe session, using webhook payload");
    }

    // Extract data for Notion update
    const customerEmail = session.customer_details?.email || "";
    const amountTotal = session.amount_total || 0; // in cents
    const currency = (session.currency || "eur").toUpperCase();

    // Get company name from custom fields (only available in expanded session)
    let companyName = "";
    const customFields = session.custom_fields || [];
    for (const field of customFields) {
      if (field.key === "companyname" || field.label?.custom === "Company Name") {
        companyName = field.text?.value || field.dropdown?.value || "";
      }
    }

    // Get promo code if used
    // With the expanded session, promotion_code is an object (not just an ID)
    let promoCode = "";
    if (session.total_details?.breakdown?.discounts?.length > 0) {
      const discount = session.total_details.breakdown.discounts[0];
      const promoObj = discount.discount?.promotion_code;
      if (promoObj) {
        if (typeof promoObj === "object" && promoObj.code) {
          // Expanded: promotion_code is the full object with .code
          promoCode = promoObj.code;
        } else if (typeof promoObj === "string") {
          // Not expanded: promotion_code is just an ID — fetch it
          try {
            const promoRes = await fetch(
              `https://api.stripe.com/v1/promotion_codes/${promoObj}`,
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
    }

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
        // Fallback: if no metadata, detect by price (debrief >= 10000 cents / EUR 100)
        if (tier === "analysis" && (item.amount_total ?? 0) >= 10000) {
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
                    "Stripe Session": {
                      url: `https://dashboard.stripe.com/payments/${session.payment_intent || session.id}`,
                    },
                    "Results URL": {
                      url: `https://corporatepoc.aieutics.com/diagnostic?r=${encodedAnswers}`,
                    },
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
