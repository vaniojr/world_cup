import { NextRequest, NextResponse } from "next/server";
import { fetchStandingsForGroup } from "@/services/espnService";
import { GROUPS } from "@/data/mockWorldCup2026";
import { calculateGroupStandings } from "@/lib/standings";

export async function GET(req: NextRequest) {
  const groupId = req.nextUrl.searchParams.get("group");

  if (groupId) {
    const standings = await fetchStandingsForGroup(groupId);
    return NextResponse.json({ standings, group: groupId });
  }

  // All groups
  const all = GROUPS.map(g => ({
    group: g.id,
    standings: calculateGroupStandings(g.matches, g.teams),
  }));
  return NextResponse.json({ groups: all });
}
