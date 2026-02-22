import { NextResponse } from "next/server";
import { getUnlockStatus } from "@/lib/payment";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const answers = searchParams.get("r");

  if (!answers) {
    return NextResponse.json(
      { error: "Missing answers parameter" },
      { status: 400 }
    );
  }

  const status = await getUnlockStatus(answers);
  return NextResponse.json(status);
}
