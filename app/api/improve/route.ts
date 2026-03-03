import { NextRequest, NextResponse } from "next/server";
import { improvePrompt } from "@/lib/claude";

export async function POST(request: NextRequest) {
  try {
    const { description } = await request.json();

    if (!description || typeof description !== "string") {
      return NextResponse.json(
        { error: "Description is required" },
        { status: 400 }
      );
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "GROQ_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const improved = await improvePrompt(description);
    return NextResponse.json({ improved });
  } catch (error) {
    console.error("Improve error:", error);
    return NextResponse.json(
      { error: "Failed to improve prompt" },
      { status: 500 }
    );
  }
}
