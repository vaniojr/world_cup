import { Match, Standing, Team } from "@/types";

export function calculateGroupStandings(matches: Match[], teams: Team[]): Standing[] {
  const standings: Map<string, Standing> = new Map();

  teams.forEach(team => {
    standings.set(team.id, {
      team,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
    });
  });

  matches
    .filter(m => m.status === "finished" && m.homeScore !== undefined && m.awayScore !== undefined)
    .forEach(match => {
      const home = standings.get(match.homeTeam.id);
      const away = standings.get(match.awayTeam.id);
      if (!home || !away) return;

      const homeScore = match.homeScore!;
      const awayScore = match.awayScore!;

      home.played++;
      away.played++;
      home.goalsFor += homeScore;
      home.goalsAgainst += awayScore;
      away.goalsFor += awayScore;
      away.goalsAgainst += homeScore;

      if (homeScore > awayScore) {
        home.wins++;
        home.points += 3;
        away.losses++;
      } else if (homeScore < awayScore) {
        away.wins++;
        away.points += 3;
        home.losses++;
      } else {
        home.draws++;
        away.draws++;
        home.points += 1;
        away.points += 1;
      }

      home.goalDifference = home.goalsFor - home.goalsAgainst;
      away.goalDifference = away.goalsFor - away.goalsAgainst;
    });

  return Array.from(standings.values()).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return a.team.name.localeCompare(b.team.name);
  });
}
