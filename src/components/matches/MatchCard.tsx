"use client";
import { Match } from "@/types";
import { TeamFlag } from "@/components/teams/TeamFlag";
import { MatchStatusBadge } from "./MatchStatusBadge";
import { formatDate } from "@/lib/utils";
import { calculatePoints, POINTS_COLORS } from "@/lib/scoring";
import { MapPin, Calendar, Sparkles } from "lucide-react";

interface MatchCardProps {
  match: Match;
  predictedScore?: string;
  onClick?: (match: Match) => void;
}

export function MatchCard({ match, predictedScore, onClick }: MatchCardProps) {
  const isFinished  = match.status === "finished";
  const hasRealScore = isFinished && match.homeScore !== undefined && match.awayScore !== undefined;
  const hasPrediction = !!predictedScore;

  const scoreInfo = hasRealScore && hasPrediction
    ? calculatePoints(predictedScore, match.homeScore!, match.awayScore!)
    : null;

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg hover:border-blue-400 dark:hover:border-blue-500 transition-all cursor-pointer group"
      onClick={() => onClick?.(match)}
    >
      {/* Top row: status + date */}
      <div className="flex items-center justify-between mb-3">
        <MatchStatusBadge status={match.status} />
        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {formatDate(match.date)}
        </span>
      </div>

      {/* Teams + score */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1">
          <TeamFlag flagUrl={match.homeTeam.flagUrl} countryCode={match.homeTeam.fifaCode} countryName={match.homeTeam.name} size="md" />
          <span className="font-semibold text-sm text-gray-900 dark:text-white truncate">
            {match.homeTeam.name}
          </span>
        </div>

        <div className="flex flex-col items-center gap-0.5 shrink-0 min-w-[5rem]">
          {/* Real score (finished) or "vs" (scheduled/live) */}
          {isFinished ? (
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              {match.homeScore} - {match.awayScore}
            </span>
          ) : (
            <span className="text-sm font-bold text-gray-400 dark:text-gray-500">vs</span>
          )}

          {/* AI prediction line */}
          {hasPrediction && !isFinished && (
            <span className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3" />
              {predictedScore}
            </span>
          )}
          {hasPrediction && isFinished && scoreInfo && (
            <span className={`text-xs ${POINTS_COLORS[scoreInfo.result]}`}>
              IA: {predictedScore} · {scoreInfo.points}pts
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-1 justify-end">
          <span className="font-semibold text-sm text-gray-900 dark:text-white truncate text-right">
            {match.awayTeam.name}
          </span>
          <TeamFlag flagUrl={match.awayTeam.flagUrl} countryCode={match.awayTeam.fifaCode} countryName={match.awayTeam.name} size="md" />
        </div>
      </div>

      {/* Venue */}
      {(match.venue || match.city) && (
        <div className="mt-3 flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
          <MapPin className="w-3 h-3" />
          <span>{[match.venue, match.city].filter(Boolean).join(", ")}</span>
        </div>
      )}

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <button className="text-xs text-blue-600 dark:text-blue-400 font-medium group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
          {hasPrediction ? "Ver análise completa →" : "Analisar com IA →"}
        </button>
        {scoreInfo && (
          <span className={`text-xs font-bold ${POINTS_COLORS[scoreInfo.result]}`}>
            {scoreInfo.label}
          </span>
        )}
      </div>
    </div>
  );
}
