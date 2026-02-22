import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

/** Escape user-supplied strings before interpolating into HTML email templates. */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const statusLabel: Record<string, string> = {
  green: "Strong",
  amber: "Partial",
  red: "At Risk",
};
const statusColor: Record<string, string> = {
  green: "#5a9a6e",
  amber: "#d4943a",
  red: "#ef4444",
};

interface DimensionSummary {
  name: string;
  score: number;
  maxScore: number;
  status: "green" | "amber" | "red";
}

interface NotifySubmissionParams {
  totalScore: number;
  totalMax: number;
  dimensions: DimensionSummary[];
  patterns: string[];
  redCount: number;
  encodedAnswers: string;
}

interface NotifyPaymentParams {
  tier: "analysis" | "debrief";
  customerEmail: string;
  companyName: string;
  amountPaid: number;
  currency: string;
  promoCode: string;
  totalScore: number;
  totalMax: number;
  dimensions: DimensionSummary[];
  patterns: string[];
  redCount: number;
  encodedAnswers: string;
}

function buildDimensionRows(dimensions: DimensionSummary[]): string {
  return dimensions
    .map(
      (d) => `
    <tr>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e5e5e5; font-family: Georgia, 'Times New Roman', serif; font-size: 14px;">
        ${d.name}
      </td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e5e5e5; text-align: center; font-family: 'Courier New', monospace; font-size: 13px; color: #6b6b6b;">
        ${d.score}/${d.maxScore}
      </td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e5e5e5; text-align: center;">
        <span style="display: inline-block; padding: 2px 10px; border-radius: 6px; font-size: 12px; font-weight: 700; color: ${statusColor[d.status]}; background: ${statusColor[d.status]}1f;">
          ${statusLabel[d.status]}
        </span>
      </td>
    </tr>`
    )
    .join("");
}

function buildResultsTable(dimensions: DimensionSummary[]): string {
  return `
    <table style="width: 100%; border-collapse: collapse; background: #ffffff; border: 1px solid #e5e5e5; border-radius: 8px;">
      <thead>
        <tr style="background: #f5f5f5;">
          <th style="padding: 10px 12px; text-align: left; font-family: Georgia, 'Times New Roman', serif; font-size: 12px; font-weight: 700; color: #1a1a1a; border-bottom: 1px solid #e5e5e5;">Dimension</th>
          <th style="padding: 10px 12px; text-align: center; font-family: Georgia, 'Times New Roman', serif; font-size: 12px; font-weight: 700; color: #1a1a1a; border-bottom: 1px solid #e5e5e5;">Score</th>
          <th style="padding: 10px 12px; text-align: center; font-family: Georgia, 'Times New Roman', serif; font-size: 12px; font-weight: 700; color: #1a1a1a; border-bottom: 1px solid #e5e5e5;">Status</th>
        </tr>
      </thead>
      <tbody>
        ${buildDimensionRows(dimensions)}
      </tbody>
    </table>`;
}

const resultsBaseUrl = "https://corporatepoc.aieutics.com/diagnostic";

/**
 * Send a notification email to hello@aieutics.com when someone completes the diagnostic (free tier).
 */
export async function notifySubmission(params: NotifySubmissionParams) {
  const {
    totalScore,
    totalMax,
    dimensions,
    patterns,
    redCount,
    encodedAnswers,
  } = params;

  const resultsUrl = `${resultsBaseUrl}?r=${encodedAnswers}`;

  const patternText =
    patterns.length > 0
      ? `<p style="font-size: 13px; color: #6b6b6b; margin: 8px 0;">Patterns: <strong>${patterns.join(", ")}</strong></p>`
      : "";

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin: 0; padding: 0; background: #fafafa; font-family: Arial, Helvetica, sans-serif;">
  <div style="max-width: 560px; margin: 0 auto; padding: 40px 24px;">
    <div style="margin-bottom: 24px;">
      <p style="font-family: Georgia, 'Times New Roman', serif; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #FF5F1F; margin: 0 0 4px 0;">
        New Diagnostic Submission
      </p>
      <p style="font-family: Georgia, 'Times New Roman', serif; font-size: 11px; color: #6b6b6b; margin: 0;">
        Corporate Innovation Diagnostic — Free Tier
      </p>
    </div>

    <div style="margin-bottom: 24px;">
      <span style="font-family: Georgia, 'Times New Roman', serif; font-size: 48px; font-weight: 700; color: #FF5F1F; line-height: 1;">
        ${totalScore}
      </span>
      <span style="font-family: Georgia, 'Times New Roman', serif; font-size: 20px; color: #d0d0d0;">
        /${totalMax}
      </span>
      <p style="font-size: 13px; color: #6b6b6b; margin: 8px 0;">
        Red dimensions: <strong>${redCount}</strong>
      </p>
      ${patternText}
    </div>

    <div style="margin-bottom: 24px;">
      ${buildResultsTable(dimensions)}
    </div>

    <div style="text-align: center; margin-bottom: 24px;">
      <a href="${resultsUrl}" style="display: inline-block; padding: 12px 28px; background: #FF5F1F; color: #ffffff; font-family: Georgia, 'Times New Roman', serif; font-size: 14px; font-weight: 700; text-decoration: none; border-radius: 12px;">
        View Full Results
      </a>
    </div>

    <p style="font-size: 11px; color: #999; text-align: center;">
      Anonymous submission — no contact details yet.
    </p>
  </div>
</body>
</html>`;

  const text = `New Corporate Innovation Diagnostic Submission (Free Tier)

Score: ${totalScore}/${totalMax}
Red dimensions: ${redCount}
${patterns.length > 0 ? `Patterns: ${patterns.join(", ")}` : ""}

${dimensions.map((d) => `${d.name}: ${d.score}/${d.maxScore} (${statusLabel[d.status]})`).join("\n")}

View results: ${resultsUrl}`;

  try {
    await resend.emails.send({
      from: "Corporate Innovation Diagnostic <hello@aieutics.com>",
      to: ["hello@aieutics.com"],
      subject: `New Submission — ${totalScore}/${totalMax} — ${redCount} red`,
      html,
      text,
    });
  } catch (err) {
    console.error("Failed to send submission notification:", err);
  }
}

/**
 * Send a notification email to hello@aieutics.com when someone pays (analysis or debrief tier).
 */
export async function notifyPayment(params: NotifyPaymentParams) {
  const {
    tier,
    customerEmail,
    companyName,
    amountPaid,
    currency,
    promoCode,
    totalScore,
    totalMax,
    dimensions,
    patterns,
    redCount,
    encodedAnswers,
  } = params;

  const resultsUrl = `${resultsBaseUrl}?r=${encodedAnswers}`;
  const tierLabel = tier === "debrief" ? "Full Analysis + Debrief" : "Full Analysis";
  const isDebrief = tier === "debrief";

  // Escape user-supplied fields before HTML interpolation
  const safeEmail = escapeHtml(customerEmail);
  const safeCompany = escapeHtml(companyName);
  const safePromo = escapeHtml(promoCode);

  const patternText =
    patterns.length > 0
      ? `<p style="font-size: 13px; color: #6b6b6b; margin: 4px 0;">Patterns: <strong>${patterns.join(", ")}</strong></p>`
      : "";

  const promoText = safePromo
    ? `<p style="font-size: 13px; color: #6b6b6b; margin: 4px 0;">Promo code: <strong>${safePromo}</strong></p>`
    : "";

  const debriefBlock = isDebrief
    ? `
    <div style="background: #FFF3EC; border: 1px solid #FF5F1F; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
      <p style="font-family: Georgia, 'Times New Roman', serif; font-size: 14px; font-weight: 700; color: #FF5F1F; margin: 0 0 8px 0;">
        Debrief Session Requested
      </p>
      <p style="font-size: 14px; color: #1a1a1a; margin: 0; line-height: 1.6;">
        This buyer purchased the debrief tier. Please reply to <strong>${safeEmail}</strong> with your available times for a 20-minute video call.
      </p>
    </div>`
    : "";

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin: 0; padding: 0; background: #fafafa; font-family: Arial, Helvetica, sans-serif;">
  <div style="max-width: 560px; margin: 0 auto; padding: 40px 24px;">
    <div style="margin-bottom: 24px;">
      <p style="font-family: Georgia, 'Times New Roman', serif; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #FF5F1F; margin: 0 0 4px 0;">
        ${isDebrief ? "New Debrief Purchase" : "New Analysis Purchase"}
      </p>
      <p style="font-family: Georgia, 'Times New Roman', serif; font-size: 11px; color: #6b6b6b; margin: 0;">
        Corporate Innovation Diagnostic — ${tierLabel}
      </p>
    </div>

    ${debriefBlock}

    <div style="margin-bottom: 24px;">
      <p style="font-family: Georgia, 'Times New Roman', serif; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #1a1a1a; margin: 0 0 12px 0;">
        Buyer Details
      </p>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr>
          <td style="padding: 6px 0; color: #6b6b6b; width: 120px;">Email</td>
          <td style="padding: 6px 0; font-weight: 700;"><a href="mailto:${safeEmail}" style="color: #FF5F1F; text-decoration: none;">${safeEmail}</a></td>
        </tr>
        ${safeCompany ? `<tr><td style="padding: 6px 0; color: #6b6b6b;">Company</td><td style="padding: 6px 0; font-weight: 700;">${safeCompany}</td></tr>` : ""}
        <tr>
          <td style="padding: 6px 0; color: #6b6b6b;">Amount</td>
          <td style="padding: 6px 0; font-weight: 700;">${amountPaid > 0 ? `${currency} ${amountPaid.toFixed(2)}` : "Free (promo code)"}</td>
        </tr>
        ${promoText ? `<tr><td style="padding: 6px 0; color: #6b6b6b;">Promo</td><td style="padding: 6px 0; font-weight: 700;">${safePromo}</td></tr>` : ""}
      </table>
    </div>

    <div style="margin-bottom: 24px;">
      <p style="font-family: Georgia, 'Times New Roman', serif; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #1a1a1a; margin: 0 0 12px 0;">
        Diagnostic Results
      </p>
      <div style="margin-bottom: 12px;">
        <span style="font-family: Georgia, 'Times New Roman', serif; font-size: 42px; font-weight: 700; color: #FF5F1F; line-height: 1;">
          ${totalScore}
        </span>
        <span style="font-family: Georgia, 'Times New Roman', serif; font-size: 18px; color: #d0d0d0;">
          /${totalMax}
        </span>
        <p style="font-size: 13px; color: #6b6b6b; margin: 4px 0;">
          Red dimensions: <strong>${redCount}</strong>
        </p>
        ${patternText}
      </div>
      ${buildResultsTable(dimensions)}
    </div>

    <div style="text-align: center; margin-bottom: 24px;">
      <a href="${resultsUrl}" style="display: inline-block; padding: 12px 28px; background: #FF5F1F; color: #ffffff; font-family: Georgia, 'Times New Roman', serif; font-size: 14px; font-weight: 700; text-decoration: none; border-radius: 12px;">
        View Full Results
      </a>
    </div>
  </div>
</body>
</html>`;

  const text = `${isDebrief ? "NEW DEBRIEF PURCHASE" : "NEW ANALYSIS PURCHASE"} — Corporate Innovation Diagnostic

Tier: ${tierLabel}
${isDebrief ? `\nDEBRIEF REQUESTED — Reply to ${customerEmail} with available times.\n` : ""}
Buyer: ${customerEmail}${companyName ? ` (${companyName})` : ""}
Amount: ${amountPaid > 0 ? `${currency} ${amountPaid.toFixed(2)}` : "Free (promo code)"}${promoCode ? `\nPromo: ${promoCode}` : ""}

Score: ${totalScore}/${totalMax}
Red dimensions: ${redCount}
${patterns.length > 0 ? `Patterns: ${patterns.join(", ")}` : ""}

${dimensions.map((d) => `${d.name}: ${d.score}/${d.maxScore} (${statusLabel[d.status]})`).join("\n")}

View results: ${resultsUrl}`;

  const subject = isDebrief
    ? `DEBRIEF REQUEST — ${customerEmail}${companyName ? ` (${companyName})` : ""} — ${totalScore}/${totalMax}`
    : `New Purchase — ${customerEmail}${companyName ? ` (${companyName})` : ""} — ${totalScore}/${totalMax}`;

  try {
    await resend.emails.send({
      from: "Corporate Innovation Diagnostic <hello@aieutics.com>",
      to: ["hello@aieutics.com"],
      replyTo: customerEmail || undefined,
      subject,
      html,
      text,
    });
  } catch (err) {
    console.error("Failed to send payment notification:", err);
  }
}

interface SendCustomerReportParams {
  customerEmail: string;
  companyName: string;
  tier: "analysis" | "debrief";
  totalScore: number;
  totalMax: number;
  dimensions: DimensionSummary[];
  encodedAnswers: string;
  pdfBuffer: Buffer;
}

/**
 * Send the branded PDF report to the customer after a successful Stripe payment.
 */
export async function sendCustomerReport(params: SendCustomerReportParams) {
  const {
    customerEmail,
    companyName,
    tier,
    totalScore,
    totalMax,
    dimensions,
    encodedAnswers,
    pdfBuffer,
  } = params;

  const isDebrief = tier === "debrief";
  const resultsUrl = `${resultsBaseUrl}?r=${encodedAnswers}`;
  const safeCompany = escapeHtml(companyName);

  const dimensionRows = dimensions
    .map(
      (d) => `
    <tr>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e5e5e5; font-family: Georgia, 'Times New Roman', serif; font-size: 14px;">
        ${d.name}
      </td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e5e5e5; text-align: center; font-family: 'Courier New', monospace; font-size: 13px; color: #6b6b6b;">
        ${d.score}/${d.maxScore}
      </td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e5e5e5; text-align: center;">
        <span style="display: inline-block; padding: 2px 10px; border-radius: 6px; font-size: 12px; font-weight: 700; color: ${statusColor[d.status]}; background: ${statusColor[d.status]}1f;">
          ${statusLabel[d.status]}
        </span>
      </td>
    </tr>`
    )
    .join("");

  const debriefNote = isDebrief
    ? `
    <div style="background: #FFF3EC; border: 1px solid #FF5F1F; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
      <p style="font-size: 14px; color: #1a1a1a; margin: 0; line-height: 1.6;">
        Your purchase includes a <strong>20-minute debrief session</strong>. Alexandra will be in touch shortly to schedule your call.
      </p>
    </div>`
    : "";

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin: 0; padding: 0; background: #fafafa; font-family: Arial, Helvetica, sans-serif;">
  <div style="max-width: 560px; margin: 0 auto; padding: 40px 24px;">

    <!-- Header -->
    <div style="margin-bottom: 32px;">
      <p style="font-family: Georgia, 'Times New Roman', serif; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #FF5F1F; margin: 0 0 4px 0;">
        Corporate Innovation Diagnostic
      </p>
      <p style="font-family: Georgia, 'Times New Roman', serif; font-size: 11px; color: #6b6b6b; margin: 0;">
        Your Full Analysis Report${safeCompany ? ` — ${safeCompany}` : ""}
      </p>
    </div>

    <!-- Thank you -->
    <div style="margin-bottom: 24px;">
      <p style="font-size: 14px; color: #1a1a1a; line-height: 1.6; margin: 0 0 12px 0;">
        Thank you for purchasing the Corporate Innovation Diagnostic${isDebrief ? " with Expert Debrief" : ""}. Your full analysis report is attached as a PDF.
      </p>
    </div>

    ${debriefNote}

    <!-- Score summary -->
    <div style="margin-bottom: 24px;">
      <span style="font-family: Georgia, 'Times New Roman', serif; font-size: 48px; font-weight: 700; color: #FF5F1F; line-height: 1;">
        ${totalScore}
      </span>
      <span style="font-family: Georgia, 'Times New Roman', serif; font-size: 20px; color: #d0d0d0;">
        /${totalMax}
      </span>
    </div>

    <!-- Dimension table -->
    <div style="margin-bottom: 24px;">
      <table style="width: 100%; border-collapse: collapse; background: #ffffff; border: 1px solid #e5e5e5; border-radius: 8px;">
        <thead>
          <tr style="background: #f5f5f5;">
            <th style="padding: 10px 12px; text-align: left; font-family: Georgia, 'Times New Roman', serif; font-size: 12px; font-weight: 700; color: #1a1a1a; border-bottom: 1px solid #e5e5e5;">Dimension</th>
            <th style="padding: 10px 12px; text-align: center; font-family: Georgia, 'Times New Roman', serif; font-size: 12px; font-weight: 700; color: #1a1a1a; border-bottom: 1px solid #e5e5e5;">Score</th>
            <th style="padding: 10px 12px; text-align: center; font-family: Georgia, 'Times New Roman', serif; font-size: 12px; font-weight: 700; color: #1a1a1a; border-bottom: 1px solid #e5e5e5;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${dimensionRows}
        </tbody>
      </table>
    </div>

    <!-- View results online -->
    <div style="text-align: center; margin-bottom: 32px;">
      <a href="${resultsUrl}" style="display: inline-block; padding: 14px 32px; background: #FF5F1F; color: #ffffff; font-family: Georgia, 'Times New Roman', serif; font-size: 14px; font-weight: 700; text-decoration: none; border-radius: 12px;">
        View Results Online
      </a>
    </div>

    <p style="font-size: 13px; color: #6b6b6b; line-height: 1.6; margin: 0 0 24px 0;">
      Your full report is attached to this email as a PDF. You can also view your interactive results anytime using the link above.
    </p>

    <!-- Footer -->
    <div style="border-top: 1px solid #e5e5e5; padding-top: 24px; text-align: center;">
      <p style="font-family: Georgia, 'Times New Roman', serif; font-size: 12px; color: #6b6b6b; margin: 0 0 4px 0;">
        See further. Think deeper. Break through.
      </p>
      <a href="https://aieutics.com" style="font-size: 12px; color: #FF5F1F; text-decoration: none;">aieutics.com</a>
    </div>

  </div>
</body>
</html>`;

  const text = `Corporate Innovation Diagnostic — Your Full Analysis Report${companyName ? ` (${companyName})` : ""}

Thank you for purchasing the Corporate Innovation Diagnostic${isDebrief ? " with Expert Debrief" : ""}. Your full analysis report is attached as a PDF.
${isDebrief ? "\nYour purchase includes a 20-minute debrief session. Alexandra will be in touch shortly to schedule your call.\n" : ""}
Score: ${totalScore}/${totalMax}

${dimensions.map((d) => `${d.name}: ${d.score}/${d.maxScore} (${statusLabel[d.status]})`).join("\n")}

View your results online: ${resultsUrl}

—
Aieutics — See further. Think deeper. Break through.
https://aieutics.com`;

  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = companyName
    ? `Corporate-Innovation-Diagnostic-${companyName.replace(/[^a-zA-Z0-9]/g, "-")}-${dateStr}.pdf`
    : `Corporate-Innovation-Diagnostic-${dateStr}.pdf`;

  try {
    await resend.emails.send({
      from: "Corporate Innovation Diagnostic <hello@aieutics.com>",
      to: [customerEmail],
      bcc: ["hello@aieutics.com"],
      replyTo: "hello@aieutics.com",
      subject: `Your Corporate Innovation Diagnostic Report${companyName ? ` — ${companyName}` : ""}`,
      html,
      text,
      attachments: [
        {
          filename,
          content: pdfBuffer,
        },
      ],
    });
  } catch (err) {
    console.error("Failed to send customer report email:", err);
  }
}
