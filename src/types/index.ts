export type MatchStatus = "scheduled" | "live" | "finished";

export type Stage =
  | "group"
  | "round-of-32"
  | "round-of-16"
  | "quarter-final"
  | "semi-final"
  | "third-place"
  | "final";

export type Team = {
  id: string;
  name: string;
  fifaCode: string;
  flagUrl: string;
  group?: string;
};

export type Match = {
  id: string;
  stage: Stage;
  group?: string;
  homeTeam: Team;
  awayTeam: Team;
  homeScore?: number;
  awayScore?: number;
  date: string;
  venue?: string;
  city?: string;
  status: MatchStatus;
};

export type Standing = {
  team: Team;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
};

export type MatchAnalysis = {
  matchId: string;
  context: string;
  recentForm: string;
  tacticalAnalysis: string;
  probableLineups: string;
  keyPlayers: string;
  headToHead: string;
  statistics: string;
  externalFactors: string;
  probabilities: {
    homeWin: number;
    draw: number;
    awayWin: number;
  };
  predictedScore: string;
  finalSummary: string;
  generatedAt: string;
  sources?: string[];
};

export type Group = {
  id: string;
  name: string;
  teams: Team[];
  matches: Match[];
};
