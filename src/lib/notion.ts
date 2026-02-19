import { Client } from "@notionhq/client";
import type { Answers } from "./scoring";

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

const DATABASE_ID = process.env.NOTION_DATABASE_ID!;

interface SubmissionData {
  tool: string;
  answers: Answers;
  questionCount: number;
  dimensions: {
    name: string;
    score: number;
    maxScore: number;
    status: "green" | "amber" | "red";
  }[];
  patterns: string[];
  totalScore: number;
  totalMax: number;
  redCount: number;
  encodedAnswers: string;
}

interface ShareUpdateData {
  pageId: string;
  name: string;
  email: string;
  projectName: string;
  shareUrl: string;
}

const STATUS_MAP: Record<string, string> = {
  green: "Green",
  amber: "Amber",
  red: "Red",
};

export async function createSubmission(data: SubmissionData): Promise<string> {
  // Build Q1–Q20 checkbox properties
  const questionProps: Record<string, { checkbox: boolean }> = {};
  for (let i = 1; i <= 20; i++) {
    questionProps[`Q${i}`] = {
      checkbox: i <= data.questionCount ? data.answers[i] === true : false,
    };
  }

  // Build dimension properties (D1–D5)
  const dimensionProps: Record<string, unknown> = {};
  data.dimensions.forEach((d, i) => {
    const n = i + 1;
    dimensionProps[`D${n} Score`] = { number: d.score };
    dimensionProps[`D${n} Status`] = { select: { name: STATUS_MAP[d.status] } };
    dimensionProps[`D${n} Name`] = {
      rich_text: [{ type: "text", text: { content: d.name } }],
    };
  });

  const now = new Date().toISOString();

  const response = await notion.pages.create({
    parent: { database_id: DATABASE_ID },
    properties: {
      Submission: {
        title: [
          {
            type: "text",
            text: { content: `${now.slice(0, 10)} ${now.slice(11, 16)}` },
          },
        ],
      },
      Tool: { select: { name: data.tool } },
      "Submitted At": { date: { start: now } },
      "Total Score": { number: data.totalScore },
      "Total Max": { number: data.totalMax },
      "Red Count": { number: data.redCount },
      "Encoded Answers": {
        rich_text: [{ type: "text", text: { content: data.encodedAnswers } }],
      },
      Patterns: {
        multi_select: data.patterns.map((id) => ({ name: id })),
      },
      Shared: { checkbox: false },
      ...questionProps,
      ...dimensionProps,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any,
  });

  return response.id;
}

export async function updateSubmissionWithShare(
  data: ShareUpdateData
): Promise<void> {
  await notion.pages.update({
    page_id: data.pageId,
    properties: {
      Submission: {
        title: [
          {
            type: "text",
            text: { content: `${data.name} — ${data.projectName}` },
          },
        ],
      },
      "Contact Name": {
        rich_text: [{ type: "text", text: { content: data.name } }],
      },
      Email: { email: data.email },
      "Project Name": {
        rich_text: [{ type: "text", text: { content: data.projectName } }],
      },
      "Share URL": { url: data.shareUrl },
      Shared: { checkbox: true },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any,
  });
}
