import { NextRequest, NextResponse } from "next/server";
import { generateMatchAnalysis } from "@/services/aiAnalysisService";
import { getAnalysis, saveAnalysis, initAnalysesTable } from "@/lib/db";
import { Match } from "@/types";

// GET /api/match-analysis?matchId=xxx  — returns cached analysis or 404
export async function GET(req: NextRequest) {
  const matchId = req.nextUrl.searchParams.get("matchId");
  if (!matchId) {
    return NextResponse.json({ error: "matchId required" }, { status: 400 });
  }

  try {
    await initAnalysesTable();
    const cached = await getAnalysis(matchId);
    if (!cached) return NextResponse.json({ cached: false }, { status: 404 });
    return NextResponse.json({ cached: true, analysis: cached });
  } catch (error) {
    console.error("GET analysis error:", error);
    return NextResponse.json({ cached: false }, { status: 404 });
  }
}

// POST /api/match-analysis  — generates (and saves) analysis
// body: { match: Match, force?: boolean }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const match: Match = body.match;
    const force: boolean = body.force ?? false;

    if (!match) {
      return NextResponse.json({ error: "match required" }, { status: 400 });
    }

    await initAnalysesTable();

    // Return cached unless force re-analysis
    if (!force) {
      const cached = await getAnalysis(match.id);
      if (cached) return NextResponse.json({ cached: true, analysis: cached });
    }

    const analysis = await generateMatchAnalysis(match);
    await saveAnalysis(match.id, analysis);
    return NextResponse.json({ cached: false, analysis });
  } catch (error) {
    console.error("Match analysis error:", error);
    return NextResponse.json({ error: "Failed to generate analysis" }, { status: 500 });
  }
}
