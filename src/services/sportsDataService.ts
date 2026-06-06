import { Match, Standing, Group } from "@/types";
import { GROUPS, ALL_MATCHES } from "@/data/mockWorldCup2026";
import { calculateGroupStandings } from "@/lib/standings";

const API_BASE = process.env.SPORTS_API_BASE_URL || "https://v3.football.api-sports.io";
const API_KEY = process.env.SPORTS_API_KEY;

async function fetchFromAPI(endpoint: string) {
  if (!API_KEY) return null;
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: { "x-apisports-key": API_KEY },
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function getGroupStandings(groupId: string): Promise<Standing[]> {
  const group = GROUPS.find(g => g.id === groupId);
  if (!group) return [];
  return calculateGroupStandings(group.matches, group.teams);
}

export async function getAllGroups(): Promise<Group[]> {
  return GROUPS;
}

export async function getAllMatches(): Promise<Match[]> {
  return ALL_MATCHES;
}

export async function getMatchById(id: string): Promise<Match | undefined> {
  return ALL_MATCHES.find(m => m.id === id);
}
