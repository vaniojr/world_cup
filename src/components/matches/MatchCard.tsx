"use client";
import { Match } from "@/types";
import { TeamFlag } from "@/components/teams/TeamFlag";
import { MatchStatusBadge } from "./MatchStatusBadge";
import { formatDate } from "@/lib/utils";
import { MapPin, Calendar } from "lucide-react";

interface MatchCardProps {
  match: Match;
  onClick?: (match: Match) => void;
}

export function MatchCard({ match, onClick }: MatchCardProps) {
  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg hover:border-blue-400 dark:hover:border-blue-500 transition-all cursor-pointer group"
      onClick={() => onClick?.(match)}
    >
      <div className="flex items-center justify-between mb-3">
        <MatchStatusBadge status={match.status} />
        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {formatDate(match.date)}
        </span>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1">
          <TeamFlag flagUrl={match.homeTeam.flagUrl} countryCode={match.homeTeam.fifaCode} countryName={match.homeTeam.name} size="md" />
          <span className="font-semibold text-sm text-gray-900 dark:text-white truncate">
            {match.homeTeam.name}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {match.status !== "scheduled" ? (
            <span className="text-xl font-bold text-gray-900 dark:text-white min-w-[4rem] text-center">
              {match.homeScore ?? 0} - {match.awayScore ?? 0}
            </span>
          ) : (
            <span className="text-sm font-bold text-gray-400 dark:text-gray-500 min-w-[2rem] text-center">vs</span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-1 justify-end">
          <span className="font-semibold text-sm text-gray-900 dark:text-white truncate text-right">
            {match.awayTeam.name}
          </span>
          <TeamFlag flagUrl={match.awayTeam.flagUrl} countryCode={match.awayTeam.fifaCode} countryName={match.awayTeam.name} size="md" />
        </div>
      </div>

      {(match.venue || match.city) && (
        <div className="mt-3 flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
          <MapPin className="w-3 h-3" />
          <span>{[match.venue, match.city].filter(Boolean).join(", ")}</span>
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
        <button className="w-full text-xs text-blue-600 dark:text-blue-400 font-medium group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
          Ver análise com IA →
        </button>
      </div>
    </div>
  );
}
