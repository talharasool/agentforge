import { NextRequest, NextResponse } from "next/server";
import { generateAgent } from "@/lib/claude";

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.goal) {
      return NextResponse.json(
        { error: "Goal is required" },
        { status: 400 }
      );
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "GROQ_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const agent = await generateAgent({
      goal: body.goal,
      tools: body.tools ?? [],
      tone: body.tone ?? "flexible",
      outputFormat: body.outputFormat ?? "markdown",
      errorHandling: body.errorHandling ?? "",
      context: body.context ?? "",
      exampleInput: body.exampleInput ?? "",
      exampleOutput: body.exampleOutput ?? "",
    });

    return NextResponse.json(agent);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Generate error:", msg);
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    );
  }
}
