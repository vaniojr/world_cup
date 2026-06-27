import { Match, Standing, Team, Group, Stage } from "@/types";
import { GROUPS, ALL_TEAMS } from "@/data/mockWorldCup2026";
import { calculateGroupStandings } from "@/lib/standings";

const ESPN_BASE = "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world";
const ESPN_STANDINGS = "https://site.api.espn.com/apis/v2/sports/soccer/fifa.world/standings";

// ESPN's event.season.slug identifies the round directly (verified against the live API).
const SEASON_SLUG_TO_STAGE: Record<string, Stage> = {
  "group-stage":     "group",
  "round-of-32":     "round-of-32",
  "round-of-16":     "round-of-16",
  "quarterfinals":   "quarter-final",
  "semifinals":      "semi-final",
  "3rd-place-match": "third-place",
  "final":           "final",
};

// ─── ESPN → internal type mappers ────────────────────────────────────────────

// ESPN's status.type.state is the reliable signal: "pre" | "in" | "post".
// The status.type.name varies (STATUS_FINAL, STATUS_FULL_TIME, STATUS_FINAL_PEN, etc.)
// so we don't match against it directly.
function mapStatus(state: string): "scheduled" | "live" | "finished" {
  if (state === "post") return "finished";
  if (state === "in") return "live";
  return "scheduled";
}

function findTeamByAbbr(abbr: string): Team | undefined {
  return ALL_TEAMS.find(t => t.fifaCode === abbr);
}

function mapEspnFixture(event: Record<string, unknown>): Match | null {
  try {
    const comp = (event.competitions as Record<string, unknown>[])[0];
    const competitors = comp.competitors as Record<string, unknown>[];
    const homeComp = competitors.find(c => c.homeAway === "home");
    const awayComp = competitors.find(c => c.homeAway === "away");
    if (!homeComp || !awayComp) return null;

    const homeTeamData = homeComp.team as Record<string, unknown>;
    const awayTeamData = awayComp.team as Record<string, unknown>;
    const homeAbbr = homeTeamData.abbreviation as string;
    const awayAbbr = awayTeamData.abbreviation as string;

    // Try to find from our known teams, fall back to ESPN data
    const homeTeam: Team = findTeamByAbbr(homeAbbr) ?? {
      id: homeAbbr.toLowerCase(),
      name: homeTeamData.displayName as string,
      fifaCode: homeAbbr,
      flagUrl: homeTeamData.logo as string,
    };
    const awayTeam: Team = findTeamByAbbr(awayAbbr) ?? {
      id: awayAbbr.toLowerCase(),
      name: awayTeamData.displayName as string,
      fifaCode: awayAbbr,
      flagUrl: awayTeamData.logo as string,
    };

    const statusType = (comp.status as Record<string, unknown>).type as Record<string, unknown>;
    const status = mapStatus(statusType.state as string);

    const homeScore = status !== "scheduled" ? parseInt(homeComp.score as string, 10) : undefined;
    const awayScore = status !== "scheduled" ? parseInt(awayComp.score as string, 10) : undefined;

    const venue = comp.venue as Record<string, unknown> | undefined;
    const venueName = (venue?.fullName as string) ?? "";
    const venueAddress = venue?.address as Record<string, unknown> | undefined;
    const city = (venueAddress?.city as string) ?? "";

    // Determine group from our data
    const group = homeTeam.group ?? "";

    const seasonSlug = (event.season as Record<string, unknown> | undefined)?.slug as string | undefined;
    const stage = (seasonSlug && SEASON_SLUG_TO_STAGE[seasonSlug]) || (group ? "group" : "round-of-32");

    return {
      id: event.id as string,
      stage,
      group: group || undefined,
      homeTeam,
      awayTeam,
      homeScore,
      awayScore,
      date: event.date as string,
      venue: venueName,
      city,
      status,
    };
  } catch {
    return null;
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function fetchLiveMatches(): Promise<Match[]> {
  try {
    const res = await fetch(`${ESPN_BASE}/scoreboard`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    const events: Record<string, unknown>[] = data.events ?? [];
    return events.map(mapEspnFixture).filter(Boolean) as Match[];
  } catch {
    return [];
  }
}

export async function fetchAllGroupMatches(): Promise<Match[]> {
  try {
    const res = await fetch(
      `${ESPN_BASE}/scoreboard?dates=20260611-20260703&limit=200`,
      { cache: "no-store" },
    );
    if (!res.ok) return [];
    const data = await res.json();
    const events: Record<string, unknown>[] = data.events ?? [];
    // Only return group stage matches (those with known teams that have a group)
    return events
      .map(mapEspnFixture)
      .filter((m): m is Match => m !== null && m.stage === "group");
  } catch {
    return [];
  }
}

export async function fetchKnockoutMatches(): Promise<Match[]> {
  try {
    const res = await fetch(
      `${ESPN_BASE}/scoreboard?dates=20260628-20260720&limit=200`,
      { cache: "no-store" },
    );
    if (!res.ok) return [];
    const data = await res.json();
    const events: Record<string, unknown>[] = data.events ?? [];
    return events
      .map(mapEspnFixture)
      .filter((m): m is Match => m !== null && m.stage !== "group");
  } catch {
    return [];
  }
}

export async function fetchGroupStandings(): Promise<Group[]> {
  try {
    const res = await fetch(ESPN_STANDINGS, { next: { revalidate: 120 } });
    if (!res.ok) return GROUPS;
    const data = await res.json();
    const children: Record<string, unknown>[] = data.children ?? [];

    return children.map((child, idx) => {
      const groupLetter = String.fromCharCode(65 + idx); // A, B, C...
      const fallback = GROUPS.find(g => g.id === groupLetter)!;
      const standings = (child.standings as Record<string, unknown>)?.entries as Record<string, unknown>[];
      if (!standings?.length) return fallback;

      const teams: Team[] = standings.map(entry => {
        const teamData = entry.team as Record<string, unknown>;
        const abbr = teamData.abbreviation as string;
        return findTeamByAbbr(abbr) ?? {
          id: abbr.toLowerCase(),
          name: teamData.displayName as string,
          fifaCode: abbr,
          flagUrl: teamData.logo as string,
          group: groupLetter,
        };
      });

      return {
        id: groupLetter,
        name: `Grupo ${groupLetter}`,
        teams,
        matches: fallback.matches,
      };
    });
  } catch {
    return GROUPS;
  }
}

export async function fetchStandingsForGroup(groupId: string): Promise<Standing[]> {
  const group = GROUPS.find(g => g.id === groupId);
  if (!group) return [];
  return calculateGroupStandings(group.matches, group.teams);
}

export type CardEvent = {
  playerName: string;
  teamName: string;
  cardType: "Amarelo" | "Vermelho" | "Segundo Amarelo (Expulsão)";
  minute: string;
};

export async function fetchMatchCards(eventId: string): Promise<CardEvent[]> {
  try {
    const res = await fetch(`${ESPN_BASE}/summary?event=${eventId}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const data = await res.json();

    // ESPN may nest details in different paths depending on the build
    const details: Record<string, unknown>[] =
      data?.gamepackageJSON?.header?.competitions?.[0]?.details ??
      data?.header?.competitions?.[0]?.details ??
      [];

    return details
      .filter((d) => {
        const text = ((d.type as Record<string, unknown>)?.text as string ?? "").toLowerCase();
        return text.includes("yellow") || text.includes("red card");
      })
      .map((d): CardEvent => {
        const text = (d.type as Record<string, unknown>)?.text as string ?? "";
        const athletes = (d.athletesInvolved as Record<string, unknown>[]) ?? [];
        const athlete = (athletes[0] ?? {}) as Record<string, unknown>;
        const team = (athlete.team as Record<string, unknown>) ?? {};

        let cardType: CardEvent["cardType"] = "Amarelo";
        if (/second.*yellow|yellow.*red/i.test(text)) cardType = "Segundo Amarelo (Expulsão)";
        else if (/red card/i.test(text)) cardType = "Vermelho";

        return {
          playerName: (athlete.displayName as string) ?? "Jogador",
          teamName:   (team.displayName as string) ?? "",
          cardType,
          minute: ((d.clock as Record<string, unknown>)?.displayValue as string) ?? "?",
        };
      });
  } catch {
    return [];
  }
}
