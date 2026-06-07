export type MatchPoints = 0 | 2 | 5 | 7 | 10;

export type MatchResult = "exact" | "winner+score" | "winner" | "draw" | "one-score" | "miss" | "pending";

export type ScoreInfo = {
  points: MatchPoints;
  result: MatchResult;
  label: string;
};

function parseScore(score: string): [number, number] | null {
  const normalized = score.replace("×", "-").replace("x", "-");
  const parts = normalized.split("-").map(s => parseInt(s.trim(), 10));
  if (parts.length !== 2 || isNaN(parts[0]) || isNaN(parts[1])) return null;
  return [parts[0], parts[1]];
}

function winner(home: number, away: number): "home" | "away" | "draw" {
  if (home > away) return "home";
  if (home < away) return "away";
  return "draw";
}

export function calculatePoints(
  predictedScore: string,
  homeScore: number,
  awayScore: number,
): ScoreInfo {
  const parsed = parseScore(predictedScore);
  if (!parsed) return { points: 0, result: "miss", label: "Inválido" };

  const [pH, pA] = parsed;
  const aWinner = winner(homeScore, awayScore);
  const pWinner = winner(pH, pA);

  const exactScore    = pH === homeScore && pA === awayScore;
  const correctWinner = pWinner === aWinner;
  const homeCorrect   = pH === homeScore;
  const awayCorrect   = pA === awayScore;
  const oneScore      = homeCorrect || awayCorrect;

  if (exactScore)                     return { points: 10, result: "exact",        label: "Placar exato" };
  if (correctWinner && oneScore)      return { points: 7,  result: "winner+score", label: "Vencedor + 1 placar" };
  if (correctWinner && aWinner === "draw") return { points: 5, result: "draw",    label: "Empate correto" };
  if (correctWinner)                  return { points: 5,  result: "winner",       label: "Vencedor correto" };
  if (oneScore)                       return { points: 2,  result: "one-score",    label: "1 placar correto" };
  return                                     { points: 0,  result: "miss",         label: "Errou" };
}

export function totalPoints(predictions: Array<{ predictedScore: string; homeScore?: number; awayScore?: number }>): number {
  return predictions.reduce((sum, p) => {
    if (p.homeScore === undefined || p.awayScore === undefined) return sum;
    return sum + calculatePoints(p.predictedScore, p.homeScore, p.awayScore).points;
  }, 0);
}

export const POINTS_COLORS: Record<MatchResult, string> = {
  exact:        "text-emerald-600 dark:text-emerald-400",
  "winner+score": "text-green-600 dark:text-green-400",
  winner:       "text-blue-600 dark:text-blue-400",
  draw:         "text-blue-600 dark:text-blue-400",
  "one-score":  "text-yellow-600 dark:text-yellow-400",
  miss:         "text-red-500 dark:text-red-400",
  pending:      "text-gray-400",
};
