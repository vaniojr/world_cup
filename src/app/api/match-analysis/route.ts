import { NextRequest, NextResponse } from "next/server";
import { generateMatchAnalysis } from "@/services/aiAnalysisService";
import { fetchAllGroupMatches, fetchMatchCards, CardEvent } from "@/services/espnService";
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

    // Fetch real World Cup results from ESPN to ground the analysis in facts
    let recentResults: Match[] = [];
    try { recentResults = await fetchAllGroupMatches(); } catch { /* fallback to no context */ }

    // Fetch cards for finished matches involving the two teams being analyzed
    const cardsByMatchId = new Map<string, CardEvent[]>();
    try {
      const homeId = match.homeTeam.id;
      const awayId = match.awayTeam.id;
      const relevantIds = recentResults
        .filter(m =>
          m.status === "finished" &&
          (m.homeTeam.id === homeId || m.awayTeam.id === homeId ||
           m.homeTeam.id === awayId || m.awayTeam.id === awayId),
        )
        .map(m => m.id);

      await Promise.all(
        relevantIds.map(async (id) => {
          const cards = await fetchMatchCards(id);
          if (cards.length > 0) cardsByMatchId.set(id, cards);
        }),
      );
    } catch { /* fallback: analyze without card data */ }

    const analysis = await generateMatchAnalysis(match, recentResults, cardsByMatchId);
    await saveAnalysis(match.id, analysis);
    return NextResponse.json({ cached: false, analysis });
  } catch (error) {
    console.error("Match analysis error:", error);
    return NextResponse.json({ error: "Failed to generate analysis" }, { status: 500 });
  }
}
