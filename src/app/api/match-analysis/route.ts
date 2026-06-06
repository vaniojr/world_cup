import { NextRequest, NextResponse } from "next/server";
import { generateMatchAnalysis } from "@/services/aiAnalysisService";
import { Match } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const match: Match = body.match;

    if (!match) {
      return NextResponse.json({ error: "Match data required" }, { status: 400 });
    }

    const analysis = await generateMatchAnalysis(match);
    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Match analysis error:", error);
    return NextResponse.json(
      { error: "Failed to generate analysis" },
      { status: 500 }
    );
  }
}
