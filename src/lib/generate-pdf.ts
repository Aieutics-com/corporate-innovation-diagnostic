import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { COI_COPY, CTA_COPY } from "./diagnostic-data";
import { ACTION_PROMPTS } from "./action-prompts-data";
import {
  scoreAll,
  getMatchingPatterns,
  getTotalScore,
  getTotalMax,
  getRedCount,
  shouldShowReflection,
} from "./scoring";
import { decodeAnswers } from "./share";
import { registerBrandFonts } from "./fonts/register";
import { LOGO_BASE64 } from "./fonts/logo";

// Brand colours
const ORANGE = [255, 95, 31] as const;
const DARK = [26, 26, 26] as const;
const GREY = [107, 107, 107] as const;
const GREY_LIGHT = [200, 200, 200] as const;
const WHITE = [255, 255, 255] as const;
const RED = [239, 68, 68] as const;
const AMBER = [212, 148, 58] as const;
const GREEN = [90, 154, 110] as const;

const STATUS_COLOURS: Record<string, readonly [number, number, number]> = {
  green: GREEN,
  amber: AMBER,
  red: RED,
};
const STATUS_LABELS: Record<string, string> = {
  green: "Strong",
  amber: "Partial",
  red: "At Risk",
};

const PAGE_WIDTH = 210; // A4 mm
const MARGIN = 20;
const CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN;
const LOGO_SIZE = 14; // mm — logo square dimensions in header/footer

function setFont(doc: jsPDF, style: "heading" | "body", size: number, colour: readonly [number, number, number] = DARK) {
  doc.setFontSize(size);
  doc.setTextColor(colour[0], colour[1], colour[2]);
  if (style === "heading") {
    doc.setFont("LibreBaskerville", "bold");
  } else {
    doc.setFont("Almarai", "normal");
  }
}

function checkPageBreak(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > 280) {
    doc.addPage();
    return MARGIN;
  }
  return y;
}

function wrapAndDraw(doc: jsPDF, text: string, x: number, y: number, maxWidth: number, lineHeight: number): number {
  const lines = doc.splitTextToSize(text, maxWidth);
  for (const line of lines) {
    y = checkPageBreak(doc, y, lineHeight);
    doc.text(line, x, y);
    y += lineHeight;
  }
  return y;
}

export function generateDiagnosticPDF(
  encodedAnswers: string,
  companyName: string,
  customerEmail: string,
  tier: "analysis" | "debrief"
): Buffer {
  const decoded = decodeAnswers(encodedAnswers);
  if (!decoded) throw new Error("Invalid encoded answers");

  const results = scoreAll(decoded);
  const patterns = getMatchingPatterns(results);
  const totalScore = getTotalScore(results);
  const totalMax = getTotalMax(results);
  const redCount = getRedCount(results);
  const reflections = results.filter(shouldShowReflection);
  const totalNos = results.reduce((sum, r) => sum + (r.maxScore - r.score), 0);

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  registerBrandFonts(doc);
  let y = MARGIN;

  // ── HEADER (page 1): logo top centre, then title ──
  const logoX = (PAGE_WIDTH - LOGO_SIZE) / 2;
  doc.addImage(LOGO_BASE64, "PNG", logoX, y - 4, LOGO_SIZE, LOGO_SIZE);
  y += LOGO_SIZE + 4;

  setFont(doc, "heading", 16, ORANGE);
  doc.text("CORPORATE INNOVATION DIAGNOSTIC", PAGE_WIDTH / 2, y, { align: "center" });
  y += 7;
  setFont(doc, "body", 8, GREY);
  doc.text("Full Analysis Report", PAGE_WIDTH / 2, y, { align: "center" });
  y += 6;

  // Date left, company right
  const dateStr = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  setFont(doc, "body", 8, GREY);
  doc.text(dateStr, MARGIN, y);
  if (companyName) {
    setFont(doc, "heading", 8, DARK);
    doc.text(companyName, PAGE_WIDTH - MARGIN, y, { align: "right" });
  }
  y += 14;

  // ── TOTAL SCORE ──
  setFont(doc, "heading", 42, ORANGE);
  doc.text(`${totalScore}`, MARGIN, y);
  const scoreWidth = doc.getTextWidth(`${totalScore}`);
  setFont(doc, "heading", 18, GREY_LIGHT);
  doc.text(`/${totalMax}`, MARGIN + scoreWidth + 1, y);
  y += 5;

  setFont(doc, "body", 9, GREY);
  doc.text("This is a profile, not a grade. The pattern of your scores matters more than the total.", MARGIN, y);
  y += 10;

  // ── DIMENSION SCORES TABLE ──
  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    head: [["Dimension", "Score", "Status"]],
    body: results.map((r) => [
      r.dimension.name,
      `${r.score}/${r.maxScore}`,
      STATUS_LABELS[r.status],
    ]),
    headStyles: {
      fillColor: [245, 245, 245] as [number, number, number],
      textColor: [...DARK] as [number, number, number],
      font: "Almarai",
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: {
      font: "Almarai",
      fontSize: 9,
      textColor: [...DARK] as [number, number, number],
    },
    columnStyles: {
      0: { cellWidth: CONTENT_WIDTH * 0.55 },
      1: { cellWidth: CONTENT_WIDTH * 0.2, halign: "center" },
      2: { cellWidth: CONTENT_WIDTH * 0.25, halign: "center" },
    },
    didParseCell(data) {
      if (data.section === "body" && data.column.index === 2) {
        const status = results[data.row.index]?.status;
        if (status) {
          const c = STATUS_COLOURS[status];
          data.cell.styles.textColor = [...c] as [number, number, number];
          data.cell.styles.fontStyle = "bold";
        }
      }
    },
    theme: "grid",
    styles: {
      lineColor: [229, 229, 229] as [number, number, number],
      lineWidth: 0.3,
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 12;

  // ── REFLECTIONS (Areas Requiring Attention) ──
  if (reflections.length > 0) {
    y = checkPageBreak(doc, y, 20);
    setFont(doc, "heading", 13, DARK);
    doc.text("Areas Requiring Attention", MARGIN, y);
    y += 7;

    for (const result of reflections) {
      y = checkPageBreak(doc, y, 25);

      // Status dot + dimension name
      const statusColour = STATUS_COLOURS[result.status];
      doc.setFillColor(statusColour[0], statusColour[1], statusColour[2]);
      doc.circle(MARGIN + 2, y - 1.5, 1.5, "F");

      setFont(doc, "heading", 9, DARK);
      doc.text(result.dimension.name, MARGIN + 6, y);
      const nameWidth = doc.getTextWidth(result.dimension.name);
      setFont(doc, "body", 9, GREY);
      doc.text(` — ${result.score}/${result.maxScore}`, MARGIN + 6 + nameWidth + 1, y);
      y += 5;

      // Reflection text
      setFont(doc, "body", 8.5, DARK);
      y = wrapAndDraw(doc, result.dimension.reflection, MARGIN + 4, y, CONTENT_WIDTH - 4, 4);
      y += 1.5;

      // Reflection prompt (italic serif)
      doc.setFont("LibreBaskerville", "italic");
      doc.setFontSize(8.5);
      doc.setTextColor(GREY[0], GREY[1], GREY[2]);
      y = wrapAndDraw(doc, result.dimension.reflectionPrompt, MARGIN + 4, y, CONTENT_WIDTH - 4, 4);
      y += 6;
    }
  }

  // ── PATTERN INTERPRETATIONS ──
  if (patterns.length > 0) {
    y = checkPageBreak(doc, y, 20);
    setFont(doc, "heading", 14, DARK);
    doc.text("Your Profile Pattern", MARGIN, y);
    y += 8;

    for (const pattern of patterns) {
      y = checkPageBreak(doc, y, 25);

      // Orange accent bar
      doc.setFillColor(ORANGE[0], ORANGE[1], ORANGE[2]);
      doc.rect(MARGIN, y - 3, 1.5, 3, "F");

      setFont(doc, "heading", 10, ORANGE);
      doc.text(pattern.label, MARGIN + 4, y);
      y += 5;

      setFont(doc, "body", 9, DARK);
      y = wrapAndDraw(doc, pattern.description, MARGIN + 4, y, CONTENT_WIDTH - 4, 4.5);
      y += 8;
    }
  }

  // ── ACTION PROMPTS (forced to page 2) ──
  const weakDimensions = results.filter(shouldShowReflection);
  if (weakDimensions.length > 0) {
    const allPrompts: { dimension: string; prompt: string }[] = [];
    for (const result of weakDimensions) {
      const prompts = ACTION_PROMPTS[result.dimension.id] || [];
      for (const prompt of prompts) {
        allPrompts.push({ dimension: result.dimension.name, prompt });
      }
    }
    const displayPrompts = allPrompts.slice(0, 5);

    if (displayPrompts.length > 0) {
      // Force page 2
      doc.addPage();
      y = MARGIN;

      setFont(doc, "heading", 13, DARK);
      doc.text("Recommended Next Steps", MARGIN, y);
      y += 5;
      setFont(doc, "body", 8.5, GREY);
      doc.text(
        "Based on the gaps identified in your diagnostic, these are the highest-priority actions to address.",
        MARGIN,
        y
      );
      y += 7;

      for (let i = 0; i < displayPrompts.length; i++) {
        y = checkPageBreak(doc, y, 14);

        // Numbered circle
        doc.setFillColor(ORANGE[0], ORANGE[1], ORANGE[2]);
        doc.circle(MARGIN + 3, y - 1, 3, "F");
        setFont(doc, "heading", 8, WHITE);
        doc.text(`${i + 1}`, MARGIN + 3, y, { align: "center" });

        // Prompt text
        setFont(doc, "body", 8.5, DARK);
        y = wrapAndDraw(doc, displayPrompts[i].prompt, MARGIN + 9, y, CONTENT_WIDTH - 9, 4);

        // Dimension label
        setFont(doc, "body", 7.5, GREY);
        doc.text(displayPrompts[i].dimension, MARGIN + 9, y);
        y += 6;
      }
    }
  }

  // ── COST OF IGNORING ──
  y += 8; // gap after last prompt

  // Pre-measure all COI content so the box is drawn once at the correct size
  const coiPadX = 8;    // horizontal padding inside box
  const coiPadTop = 8;  // top padding
  const coiPadBot = 6;  // bottom padding
  const coiTextW = CONTENT_WIDTH - 2 * coiPadX;

  setFont(doc, "heading", 11, ORANGE);
  const coiHeadingH = 6; // heading line height

  setFont(doc, "body", 8.5, GREY_LIGHT);
  const coiIntroLines = doc.splitTextToSize(COI_COPY.intro, coiTextW);
  const coiIntroH = coiIntroLines.length * 4;

  const coiBodyLines = doc.splitTextToSize(COI_COPY.body, coiTextW);
  const coiBodyH = coiBodyLines.length * 4;

  const coiDividerH = 5;   // space for divider line
  const coiNumberH = 4;    // large number line
  const coiTaglineH = 4;   // tagline line
  const coiGaps = 1.5 + 2.5; // gaps between sections

  const coiBoxHeight = coiPadTop + coiHeadingH + coiIntroH + coiBodyH
    + coiGaps + coiDividerH + coiNumberH + coiTaglineH + coiPadBot;

  // Check page break with full measured height
  y = checkPageBreak(doc, y, coiBoxHeight + 4);

  // Draw box once at the correct size
  const coiBoxY = y;
  doc.setFillColor(DARK[0], DARK[1], DARK[2]);
  doc.roundedRect(MARGIN, coiBoxY, CONTENT_WIDTH, coiBoxHeight, 3, 3, "F");

  // Draw content inside the box — single pass
  let cy = coiBoxY + coiPadTop;

  setFont(doc, "heading", 11, ORANGE);
  doc.text(COI_COPY.heading, MARGIN + coiPadX, cy);
  cy += coiHeadingH;

  setFont(doc, "body", 8.5, GREY_LIGHT);
  for (const line of coiIntroLines) {
    doc.text(line, MARGIN + coiPadX, cy);
    cy += 4;
  }
  cy += 1.5;
  for (const line of coiBodyLines) {
    doc.text(line, MARGIN + coiPadX, cy);
    cy += 4;
  }
  cy += 2.5;

  // Divider line inside box
  doc.setDrawColor(GREY[0], GREY[1], GREY[2]);
  doc.setLineWidth(0.2);
  doc.line(MARGIN + coiPadX, cy, PAGE_WIDTH - MARGIN - coiPadX, cy);
  cy += 5;

  setFont(doc, "heading", 24, ORANGE);
  doc.text(`${totalNos}`, MARGIN + coiPadX, cy);
  cy += 4;
  setFont(doc, "body", 8.5, GREY_LIGHT);
  doc.text("unaddressed gaps in this initiative — each one a compounding risk.", MARGIN + coiPadX, cy);

  y = coiBoxY + coiBoxHeight + 12;

  // ── CTA ──
  setFont(doc, "heading", 11, DARK);
  doc.text(CTA_COPY.heading, MARGIN, y);
  y += 6;

  setFont(doc, "body", 8.5, DARK);
  const ctaParagraphs = CTA_COPY.body.split("\n\n");
  for (const para of ctaParagraphs) {
    y = wrapAndDraw(doc, para, MARGIN, y, CONTENT_WIDTH, 4);
    y += 3;
  }

  if (redCount >= 2) {
    y += 1;
    setFont(doc, "heading", 8.5, DARK);
    y = wrapAndDraw(doc, CTA_COPY.callout, MARGIN + 4, y, CONTENT_WIDTH - 8, 4);
    y += 3;
  }

  // Contact card
  y += 1;
  doc.setDrawColor(GREY_LIGHT[0], GREY_LIGHT[1], GREY_LIGHT[2]);
  doc.setLineWidth(0.3);
  doc.roundedRect(MARGIN, y - 4, CONTENT_WIDTH, 20, 2, 2, "S");

  setFont(doc, "heading", 9, DARK);
  doc.text(CTA_COPY.contact.name, MARGIN + 6, y + 1);
  setFont(doc, "body", 8.5, GREY);
  doc.text(`${CTA_COPY.contact.title} — ${CTA_COPY.contact.subtitle}`, MARGIN + 6, y + 6);
  setFont(doc, "body", 8.5, ORANGE);
  doc.text(CTA_COPY.contact.website, MARGIN + 6, y + 11);
  doc.text(CTA_COPY.contact.email, MARGIN + 50, y + 11);

  y += 22;

  // ── DEBRIEF NOTE ──
  if (tier === "debrief") {
    setFont(doc, "body", 8.5, GREY);
    doc.text("This report will be discussed in your scheduled debrief session.", MARGIN, y);
    y += 6;
  }

  // ── FOOTER ──
  const pageCount = doc.getNumberOfPages();
  const footerLogoSize = 8;
  const footerLogoX = (PAGE_WIDTH - footerLogoSize) / 2;

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    // Footer line
    doc.setDrawColor(GREY_LIGHT[0], GREY_LIGHT[1], GREY_LIGHT[2]);
    doc.setLineWidth(0.2);
    doc.line(MARGIN, 280, PAGE_WIDTH - MARGIN, 280);

    if (i === pageCount) {
      // Last page: logo centred, text flanking
      doc.addImage(LOGO_BASE64, "PNG", footerLogoX, 282, footerLogoSize, footerLogoSize);
      setFont(doc, "body", 7, GREY);
      doc.text(`${i}/${pageCount}`, MARGIN, 287);
      doc.text("aieutics.com", PAGE_WIDTH - MARGIN, 287, { align: "right" });
    } else {
      // Other pages: text-only footer
      setFont(doc, "body", 7, GREY);
      doc.text("Aieutics — See further. Think deeper. Break through.", MARGIN, 285);
      doc.text("aieutics.com", PAGE_WIDTH - MARGIN, 285, { align: "right" });
      doc.text(`${i}/${pageCount}`, PAGE_WIDTH / 2, 285, { align: "center" });
    }
  }

  // Return as Buffer
  const arrayBuffer = doc.output("arraybuffer");
  return Buffer.from(arrayBuffer);
}
