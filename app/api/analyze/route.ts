import { NextRequest, NextResponse } from "next/server";
import { analyzePrompt } from "@/lib/claude";

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

    const analysis = await analyzePrompt(description);
    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Analyze error:", error);
    return NextResponse.json(
      { error: "Failed to analyze prompt" },
      { status: 500 }
    );
  }
}
