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

function setFont(doc: jsPDF, style: "heading" | "body", size: number, colour: readonly [number, number, number] = DARK) {
  doc.setFontSize(size);
  doc.setTextColor(colour[0], colour[1], colour[2]);
  if (style === "heading") {
    doc.setFont("helvetica", "bold");
  } else {
    doc.setFont("helvetica", "normal");
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
  let y = MARGIN;

  // ── HEADER ──
  setFont(doc, "heading", 10, ORANGE);
  doc.text("CORPORATE INNOVATION DIAGNOSTIC", MARGIN, y);
  y += 5;
  setFont(doc, "body", 8, GREY);
  doc.text("Full Analysis Report", MARGIN, y);
  y += 4;

  // Date and company on the right
  const dateStr = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  doc.text(dateStr, PAGE_WIDTH - MARGIN, y - 4, { align: "right" });
  if (companyName) {
    setFont(doc, "heading", 8, DARK);
    doc.text(companyName, PAGE_WIDTH - MARGIN, y, { align: "right" });
  }
  y += 2;

  // Divider
  doc.setDrawColor(GREY_LIGHT[0], GREY_LIGHT[1], GREY_LIGHT[2]);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  y += 10;

  // ── TOTAL SCORE ──
  setFont(doc, "heading", 48, ORANGE);
  doc.text(`${totalScore}`, MARGIN, y);
  const scoreWidth = doc.getTextWidth(`${totalScore}`);
  setFont(doc, "heading", 20, GREY_LIGHT);
  doc.text(`/${totalMax}`, MARGIN + scoreWidth + 1, y);
  y += 6;

  setFont(doc, "body", 10, GREY);
  doc.text("This is a profile, not a grade. The pattern of your scores matters more than the total.", MARGIN, y);
  y += 12;

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
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: {
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
    setFont(doc, "heading", 14, DARK);
    doc.text("Areas Requiring Attention", MARGIN, y);
    y += 8;

    for (const result of reflections) {
      y = checkPageBreak(doc, y, 30);

      // Status dot + dimension name
      const statusColour = STATUS_COLOURS[result.status];
      doc.setFillColor(statusColour[0], statusColour[1], statusColour[2]);
      doc.circle(MARGIN + 2, y - 1.5, 1.5, "F");

      setFont(doc, "heading", 10, DARK);
      doc.text(result.dimension.name, MARGIN + 6, y);
      setFont(doc, "body", 10, GREY);
      doc.text(` — ${result.score}/${result.maxScore}`, MARGIN + 6 + doc.getTextWidth(result.dimension.name), y);
      y += 6;

      // Reflection text
      setFont(doc, "body", 9, DARK);
      y = wrapAndDraw(doc, result.dimension.reflection, MARGIN + 4, y, CONTENT_WIDTH - 4, 4.5);
      y += 2;

      // Reflection prompt (italic)
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.setTextColor(GREY[0], GREY[1], GREY[2]);
      y = wrapAndDraw(doc, result.dimension.reflectionPrompt, MARGIN + 4, y, CONTENT_WIDTH - 4, 4.5);
      y += 8;
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

  // ── ACTION PROMPTS ──
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
      y = checkPageBreak(doc, y, 20);
      setFont(doc, "heading", 14, DARK);
      doc.text("Recommended Next Steps", MARGIN, y);
      y += 5;
      setFont(doc, "body", 9, GREY);
      doc.text(
        "Based on the gaps identified in your diagnostic, these are the highest-priority actions to address.",
        MARGIN,
        y
      );
      y += 8;

      for (let i = 0; i < displayPrompts.length; i++) {
        y = checkPageBreak(doc, y, 15);

        // Numbered circle
        doc.setFillColor(ORANGE[0], ORANGE[1], ORANGE[2]);
        doc.circle(MARGIN + 3, y - 1, 3, "F");
        setFont(doc, "heading", 8, WHITE);
        doc.text(`${i + 1}`, MARGIN + 3, y, { align: "center" });

        // Prompt text
        setFont(doc, "body", 9, DARK);
        y = wrapAndDraw(doc, displayPrompts[i].prompt, MARGIN + 9, y, CONTENT_WIDTH - 9, 4.5);

        // Dimension label
        setFont(doc, "body", 8, GREY);
        doc.text(displayPrompts[i].dimension, MARGIN + 9, y);
        y += 8;
      }
    }
  }

  // ── COST OF IGNORING ──
  y = checkPageBreak(doc, y, 40);

  // Dark background box
  const coiBoxY = y - 4;
  doc.setFillColor(DARK[0], DARK[1], DARK[2]);
  doc.roundedRect(MARGIN, coiBoxY, CONTENT_WIDTH, 50, 3, 3, "F");

  setFont(doc, "heading", 12, ORANGE);
  doc.text(COI_COPY.heading, MARGIN + 8, y + 4);
  y += 10;

  setFont(doc, "body", 9, GREY_LIGHT);
  const coiLines = doc.splitTextToSize(COI_COPY.intro, CONTENT_WIDTH - 16);
  for (const line of coiLines) {
    doc.text(line, MARGIN + 8, y);
    y += 4.5;
  }
  y += 2;
  const coiBodyLines = doc.splitTextToSize(COI_COPY.body, CONTENT_WIDTH - 16);
  for (const line of coiBodyLines) {
    doc.text(line, MARGIN + 8, y);
    y += 4.5;
  }

  // Extend box to fit content
  const coiBoxHeight = y - coiBoxY + 14;
  // Redraw the box to the right height
  doc.setFillColor(DARK[0], DARK[1], DARK[2]);
  doc.roundedRect(MARGIN, coiBoxY, CONTENT_WIDTH, coiBoxHeight, 3, 3, "F");

  // Rewrite COI content on top of the extended box
  let cy = coiBoxY + 8;
  setFont(doc, "heading", 12, ORANGE);
  doc.text(COI_COPY.heading, MARGIN + 8, cy);
  cy += 7;

  setFont(doc, "body", 9, GREY_LIGHT);
  for (const line of coiLines) {
    doc.text(line, MARGIN + 8, cy);
    cy += 4.5;
  }
  cy += 2;
  for (const line of coiBodyLines) {
    doc.text(line, MARGIN + 8, cy);
    cy += 4.5;
  }
  cy += 3;

  // Divider line inside box
  doc.setDrawColor(GREY[0], GREY[1], GREY[2]);
  doc.setLineWidth(0.2);
  doc.line(MARGIN + 8, cy, PAGE_WIDTH - MARGIN - 8, cy);
  cy += 6;

  setFont(doc, "heading", 28, ORANGE);
  doc.text(`${totalNos}`, MARGIN + 8, cy);
  cy += 5;
  setFont(doc, "body", 9, GREY_LIGHT);
  doc.text("unaddressed gaps in this initiative — each one a compounding risk.", MARGIN + 8, cy);

  y = coiBoxY + coiBoxHeight + 10;

  // ── CTA ──
  y = checkPageBreak(doc, y, 40);
  setFont(doc, "heading", 14, DARK);
  doc.text(CTA_COPY.heading, MARGIN, y);
  y += 7;

  setFont(doc, "body", 9, DARK);
  const ctaParagraphs = CTA_COPY.body.split("\n\n");
  for (const para of ctaParagraphs) {
    y = wrapAndDraw(doc, para, MARGIN, y, CONTENT_WIDTH, 4.5);
    y += 4;
  }

  if (redCount >= 2) {
    y = checkPageBreak(doc, y, 15);
    y += 2;
    setFont(doc, "heading", 9, DARK);
    y = wrapAndDraw(doc, CTA_COPY.callout, MARGIN + 4, y, CONTENT_WIDTH - 8, 4.5);
    y += 4;
  }

  // Contact card
  y = checkPageBreak(doc, y, 25);
  y += 2;
  doc.setDrawColor(GREY_LIGHT[0], GREY_LIGHT[1], GREY_LIGHT[2]);
  doc.setLineWidth(0.3);
  doc.roundedRect(MARGIN, y - 4, CONTENT_WIDTH, 22, 2, 2, "S");

  setFont(doc, "heading", 10, DARK);
  doc.text(CTA_COPY.contact.name, MARGIN + 6, y + 2);
  setFont(doc, "body", 9, GREY);
  doc.text(`${CTA_COPY.contact.title} — ${CTA_COPY.contact.subtitle}`, MARGIN + 6, y + 7);
  setFont(doc, "body", 9, ORANGE);
  doc.text(CTA_COPY.contact.website, MARGIN + 6, y + 12);
  doc.text(CTA_COPY.contact.email, MARGIN + 50, y + 12);

  y += 26;

  // ── DEBRIEF NOTE ──
  if (tier === "debrief") {
    y = checkPageBreak(doc, y, 15);
    setFont(doc, "body", 9, GREY);
    doc.text("This report will be discussed in your scheduled debrief session.", MARGIN, y);
    y += 8;
  }

  // ── FOOTER ──
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    // Footer line
    doc.setDrawColor(GREY_LIGHT[0], GREY_LIGHT[1], GREY_LIGHT[2]);
    doc.setLineWidth(0.2);
    doc.line(MARGIN, 285, PAGE_WIDTH - MARGIN, 285);

    // Footer text
    setFont(doc, "body", 7, GREY);
    doc.text("Aieutics — See further. Think deeper. Break through.", MARGIN, 289);
    doc.text("aieutics.com", PAGE_WIDTH - MARGIN, 289, { align: "right" });
    doc.text(`${i}/${pageCount}`, PAGE_WIDTH / 2, 289, { align: "center" });
  }

  // Return as Buffer
  const arrayBuffer = doc.output("arraybuffer");
  return Buffer.from(arrayBuffer);
}
