import { NextResponse } from "next/server";
import { createSubmission } from "@/lib/notion";

interface SubmitRequestBody {
  tool: string;
  answers: Record<number, boolean | null>;
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

export async function POST(request: Request) {
  try {
    const body: SubmitRequestBody = await request.json();

    if (!body.answers || !body.dimensions || body.totalScore === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const pageId = await createSubmission({
      tool: body.tool,
      answers: body.answers,
      questionCount: body.questionCount,
      dimensions: body.dimensions,
      patterns: body.patterns,
      totalScore: body.totalScore,
      totalMax: body.totalMax,
      redCount: body.redCount,
      encodedAnswers: body.encodedAnswers,
    });

    return NextResponse.json({ success: true, pageId });
  } catch (err) {
    console.error("Submit API error:", err);
    return NextResponse.json({ success: true, pageId: null });
  }
}
