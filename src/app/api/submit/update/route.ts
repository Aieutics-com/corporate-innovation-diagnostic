import { NextResponse } from "next/server";
import { updateSubmissionWithShare } from "@/lib/notion";

interface UpdateRequestBody {
  pageId: string;
  name: string;
  email: string;
  projectName: string;
  shareUrl: string;
}

export async function PATCH(request: Request) {
  try {
    const body: UpdateRequestBody = await request.json();

    if (!body.pageId || !body.name || !body.email || !body.projectName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await updateSubmissionWithShare(body);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Update submission error:", err);
    return NextResponse.json({ success: true });
  }
}
