import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface ShareRequestBody {
  name: string;
  email: string;
  initiativeName: string;
  shareUrl: string;
  totalScore: number;
  totalMax: number;
  dimensions: {
    name: string;
    score: number;
    maxScore: number;
    status: "green" | "amber" | "red";
  }[];
  patterns: {
    label: string;
    description: string;
  }[];
  redCount: number;
}

export async function POST(request: Request) {
  try {
    const body: ShareRequestBody = await request.json();

    // Validate required fields
    if (!body.name || !body.email || !body.initiativeName || !body.shareUrl) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    const statusLabel = { green: "Strong", amber: "Partial", red: "At Risk" };
    const statusColor = { green: "#5a9a6e", amber: "#d4943a", red: "#ef4444" };

    // Extract first name for greeting
    const firstName = body.name.trim().split(/\s+/)[0];

    // Extract base URL for hosted assets (logo)
    const baseUrl = new URL(body.shareUrl).origin;

    const dimensionRows = body.dimensions
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

    // Pattern insight block (only if patterns matched)
    const patternHtml =
      body.patterns.length > 0
        ? body.patterns
            .map(
              (p) => `
    <div style="margin-bottom: 24px;">
      <p style="font-family: Georgia, 'Times New Roman', serif; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #1a1a1a; margin: 0 0 8px 0;">
        Your Profile Pattern
      </p>
      <div style="border-left: 3px solid #FF5F1F; padding-left: 16px;">
        <p style="font-family: Georgia, 'Times New Roman', serif; font-size: 14px; font-weight: 700; color: #FF5F1F; margin: 0 0 6px 0;">
          ${p.label}
        </p>
        <p style="font-size: 14px; color: #1a1a1a; margin: 0; line-height: 1.6;">
          ${p.description}
        </p>
      </div>
    </div>`
            )
            .join("")
        : "";

    // Callout block (only if 2+ red dimensions)
    const calloutHtml =
      body.redCount >= 2
        ? `
    <div style="background: #FFF3EC; border: 1px solid #FF5F1F; border-radius: 8px; padding: 20px; margin-bottom: 28px;">
      <p style="font-size: 14px; font-weight: 700; color: #1a1a1a; margin: 0 0 16px 0; line-height: 1.6;">
        If your profile shows two or more dimensions in the red zone, a structured conversation can help you decide what to prioritise and what to walk away from.
      </p>
      <a href="mailto:hello@aieutics.com?subject=Corporate%20Innovation%20Diagnostic%20%E2%80%94%20Follow-up" style="display: inline-block; padding: 10px 24px; background: #FF5F1F; color: #ffffff; font-family: Georgia, 'Times New Roman', serif; font-size: 13px; font-weight: 700; text-decoration: none; border-radius: 8px;">
        Get in touch
      </a>
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
        Results for ${body.initiativeName}
      </p>
    </div>

    <!-- Greeting -->
    <div style="margin-bottom: 24px;">
      <p style="font-family: Georgia, 'Times New Roman', serif; font-size: 18px; font-weight: 700; color: #1a1a1a; margin: 0 0 12px 0;">
        Hello ${firstName},
      </p>
      <p style="font-size: 14px; color: #6b6b6b; margin: 0; line-height: 1.6;">
        Thank you for taking the Corporate Innovation Diagnostic!
      </p>
    </div>

    <!-- Score -->
    <div style="margin-bottom: 28px;">
      <span style="font-family: Georgia, 'Times New Roman', serif; font-size: 54px; font-weight: 700; color: #FF5F1F; line-height: 1;">
        ${body.totalScore}
      </span>
      <span style="font-family: Georgia, 'Times New Roman', serif; font-size: 22px; color: #d0d0d0;">
        /${body.totalMax}
      </span>
      <p style="font-size: 14px; color: #6b6b6b; margin: 12px 0 0 0; line-height: 1.6;">
        This is a profile, not a grade. The pattern of your scores matters more than the total.
      </p>
    </div>

    <!-- Pattern insight -->
    ${patternHtml}

    <!-- Callout + CTA -->
    ${calloutHtml}

    <!-- Dimensions table -->
    <div style="margin-bottom: 28px;">
      <p style="font-family: Georgia, 'Times New Roman', serif; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #1a1a1a; margin: 0 0 12px 0;">
        Your Results
      </p>
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

    <!-- View full results -->
    <div style="text-align: center; margin-bottom: 32px;">
      <a href="${body.shareUrl}" style="display: inline-block; padding: 14px 32px; background: #FF5F1F; color: #ffffff; font-family: Georgia, 'Times New Roman', serif; font-size: 14px; font-weight: 700; text-decoration: none; border-radius: 12px;">
        View Full Results
      </a>
    </div>

    <!-- Footer -->
    <div style="border-top: 1px solid #e5e5e5; padding-top: 24px; text-align: center;">
      <a href="https://aieutics.com" style="display: inline-block; margin-bottom: 12px;">
        <img src="${baseUrl}/aieutics_transparentbg_logo.png" alt="Aieutics" width="120" style="width: 120px; height: auto;" />
      </a>
      <p style="font-family: Georgia, 'Times New Roman', serif; font-size: 12px; color: #6b6b6b; margin: 0 0 4px 0;">
        See further. Think deeper. Break through.
      </p>
      <a href="https://aieutics.com" style="font-size: 12px; color: #FF5F1F; text-decoration: none;">aieutics.com</a>
    </div>

  </div>
</body>
</html>`;

    const patternText =
      body.patterns.length > 0
        ? `\nYour Profile Pattern:\n${body.patterns.map((p) => `${p.label} — ${p.description}`).join("\n")}\n`
        : "";

    const text = `Corporate Innovation Diagnostic — Results for ${body.initiativeName}

Hello ${firstName},

Thank you for taking the Corporate Innovation Diagnostic!

Score: ${body.totalScore}/${body.totalMax}
${patternText}
${body.dimensions.map((d) => `${d.name}: ${d.score}/${d.maxScore} (${statusLabel[d.status]})`).join("\n")}

View your full results: ${body.shareUrl}

—
Aieutics — See further. Think deeper. Break through.
https://aieutics.com`;

    const { error } = await resend.emails.send({
      from: "Corporate Innovation Diagnostic <hello@aieutics.com>",
      to: [body.email],
      bcc: ["hello@aieutics.com"],
      replyTo: "hello@aieutics.com",
      subject: `Corporate Innovation Diagnostic — ${body.initiativeName}`,
      html,
      text,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Share API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
