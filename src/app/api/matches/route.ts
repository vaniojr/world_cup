import { NextResponse } from "next/server";
import { fetchAllGroupMatches } from "@/services/espnService";
import { ALL_MATCHES, GROUPS } from "@/data/mockWorldCup2026";
import { Match } from "@/types";

export async function GET() {
  try {
    const espnMatches = await fetchAllGroupMatches();

    // Merge ESPN live scores into our static schedule using match ID
    const scoreMap = new Map<string, Pick<Match, "homeScore" | "awayScore" | "status">>();
    for (const m of espnMatches) {
      scoreMap.set(m.id, { homeScore: m.homeScore, awayScore: m.awayScore, status: m.status });
    }

    const merged = ALL_MATCHES.map(m => {
      const live = scoreMap.get(m.id);
      if (!live) return m;
      return { ...m, ...live };
    });

    return NextResponse.json({
      matches: merged,
      groups: GROUPS.map(g => ({
        ...g,
        matches: g.matches.map(m => {
          const live = scoreMap.get(m.id);
          return live ? { ...m, ...live } : m;
        }),
      })),
      updatedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({
      matches: ALL_MATCHES,
      groups: GROUPS,
      updatedAt: new Date().toISOString(),
    });
  }
}
