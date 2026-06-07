"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { GROUPS } from "@/data/mockWorldCup2026";
import { MatchCard } from "@/components/matches/MatchCard";
import { GroupStandingsTable } from "@/components/groups/GroupStandingsTable";
import { MatchAnalysisModal } from "@/components/matches/MatchAnalysisModal";
import { calculateGroupStandings } from "@/lib/standings";
import { Match, Group } from "@/types";
import { AnalysisSummary } from "@/lib/db";
import { RefreshCw } from "lucide-react";

export default function GroupsPage() {
  const [activeGroup, setActiveGroup]     = useState("A");
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [groups, setGroups]               = useState<Group[]>(GROUPS);
  const [summaries, setSummaries]         = useState<AnalysisSummary[]>([]);
  const [syncing, setSyncing]             = useState(false);

  const syncData = useCallback(async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/matches", { cache: "no-store" });
      if (res.ok) setGroups((await res.json()).groups);
    } catch { /* keep static data */ }
    finally { setSyncing(false); }
  }, []);

  const fetchSummaries = useCallback(async () => {
    try {
      const res = await fetch("/api/analyses-summary");
      if (res.ok) setSummaries((await res.json()).summaries ?? []);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    syncData();
    fetchSummaries();
  }, [syncData, fetchSummaries]);

  const handleModalClose = useCallback(() => {
    setSelectedMatch(null);
    fetchSummaries();
  }, [fetchSummaries]);

  const predictionsMap = useMemo(
    () => new Map(summaries.map(s => [s.matchId, s.predictedScore])),
    [summaries],
  );

  const currentGroup = groups.find(g => g.id === activeGroup)!;
  const standings    = calculateGroupStandings(currentGroup.matches, currentGroup.teams);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white">Fase de Grupos</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">12 grupos · 4 seleções por grupo · 6 partidas por grupo</p>
        </div>
        <button
          onClick={syncData}
          disabled={syncing}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-blue-500 transition-colors disabled:opacity-40 mt-1"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
          Atualizar
        </button>
      </div>

      {/* Group Tabs */}
      <div className="overflow-x-auto pb-1">
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-max">
          {groups.map(g => (
            <button
              key={g.id}
              onClick={() => setActiveGroup(g.id)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                activeGroup === g.id
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              Grupo {g.id}
            </button>
          ))}
        </div>
      </div>

      {/* Group Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="font-bold text-gray-900 dark:text-white">
            Partidas — Grupo {activeGroup}
          </h3>
          {currentGroup.matches.map(m => (
            <MatchCard
              key={m.id}
              match={m}
              predictedScore={predictionsMap.get(m.id)}
              onClick={setSelectedMatch}
            />
          ))}
        </div>
        <div className="space-y-4">
          <h3 className="font-bold text-gray-900 dark:text-white">
            Classificação — Grupo {activeGroup}
          </h3>
          <GroupStandingsTable standings={standings} />
        </div>
      </div>

      {selectedMatch && (
        <MatchAnalysisModal match={selectedMatch} onClose={handleModalClose} />
      )}
    </div>
  );
}
