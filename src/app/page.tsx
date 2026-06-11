"use client";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import Link from "next/link";
import { ALL_MATCHES, GROUPS } from "@/data/mockWorldCup2026";
import { MatchCard } from "@/components/matches/MatchCard";
import { MatchAnalysisModal } from "@/components/matches/MatchAnalysisModal";
import { Match, MatchStatus, Group } from "@/types";
import { AnalysisSummary } from "@/lib/db";
import { calculatePoints } from "@/lib/scoring";
import { Activity, Calendar, Filter, Trophy, RefreshCw, Sparkles, Star } from "lucide-react";

const LIVE_POLL_INTERVAL = 30_000;

const STATUS_FILTERS: { value: "all" | MatchStatus; label: string }[] = [
  { value: "all",       label: "Todos" },
  { value: "scheduled", label: "Agendado" },
  { value: "live",      label: "Ao Vivo" },
  { value: "finished",  label: "Encerrado" },
];

export default function HomePage() {
  const [matches, setMatches]               = useState<Match[]>(ALL_MATCHES);
  const [groups, setGroups]                 = useState<Group[]>(GROUPS);
  const [summaries, setSummaries]           = useState<AnalysisSummary[]>([]);
  const [selectedMatch, setSelectedMatch]   = useState<Match | null>(null);
  const [lastUpdated, setLastUpdated]       = useState<Date | null>(null);
  const [syncing, setSyncing]               = useState(false);
  const [statusFilter, setStatusFilter]     = useState<"all" | MatchStatus>("all");
  const [dateFilter, setDateFilter]         = useState<string>("all");
  const [visibleCount, setVisibleCount]     = useState(12);
  const matchesRef = useRef(matches);
  matchesRef.current = matches;

  const syncData = useCallback(async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/matches", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setMatches(data.matches);
        setGroups(data.groups);
        setLastUpdated(new Date());
      }
    } catch { /* keep static data */ }
    finally { setSyncing(false); }
  }, []);

  const fetchSummaries = useCallback(async () => {
    try {
      const res = await fetch("/api/analyses-summary");
      if (res.ok) {
        const data = await res.json();
        setSummaries(data.summaries ?? []);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    syncData();
    fetchSummaries();
    const interval = setInterval(() => {
      if (matchesRef.current.some(m => m.status === "live")) syncData();
    }, LIVE_POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [syncData, fetchSummaries]);

  // Re-fetch summaries when modal closes (user may have generated a new analysis)
  const handleModalClose = useCallback(() => {
    setSelectedMatch(null);
    fetchSummaries();
  }, [fetchSummaries]);

  // Map matchId → predictedScore for fast lookup
  const predictionsMap = useMemo(
    () => new Map(summaries.map(s => [s.matchId, s.predictedScore])),
    [summaries],
  );

  // Stats for banner
  const stats = useMemo(() => {
    const analyzed = summaries.length;
    let points = 0;
    let scored = 0;
    for (const s of summaries) {
      const m = matches.find(x => x.id === s.matchId);
      if (m?.status === "finished" && m.homeScore !== undefined && m.awayScore !== undefined) {
        points += calculatePoints(s.predictedScore, m.homeScore, m.awayScore).points;
        scored++;
      }
    }
    return { analyzed, points, scored };
  }, [summaries, matches]);

  const liveMatches = matches.filter(m => m.status === "live");

  // All matches sorted chronologically
  const sortedMatches = useMemo(
    () => [...matches].sort((a, b) => a.date.localeCompare(b.date)),
    [matches],
  );

  // Available match dates (YYYY-MM-DD) for the date filter
  const dateOptions = useMemo(() => {
    const keys = Array.from(new Set(sortedMatches.map(m => m.date.slice(0, 10))));
    return keys.map(key => ({
      value: key,
      label: new Date(`${key}T12:00:00Z`).toLocaleDateString("pt-BR", {
        weekday: "short",
        day: "2-digit",
        month: "short",
      }),
    }));
  }, [sortedMatches]);

  // Counts per status for the status filter buttons
  const statusCounts = useMemo(() => {
    const counts: Record<"all" | MatchStatus, number> = { all: matches.length, scheduled: 0, live: 0, finished: 0 };
    for (const m of matches) counts[m.status]++;
    return counts;
  }, [matches]);

  const filteredMatches = useMemo(() => {
    return sortedMatches.filter(m => {
      if (statusFilter !== "all" && m.status !== statusFilter) return false;
      if (dateFilter !== "all" && m.date.slice(0, 10) !== dateFilter) return false;
      return true;
    });
  }, [sortedMatches, statusFilter, dateFilter]);

  // Reset pagination whenever filters change
  useEffect(() => {
    setVisibleCount(12);
  }, [statusFilter, dateFilter]);

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Trophy className="w-8 h-8 text-yellow-400" />
          <h2 className="text-2xl font-black">FIFA World Cup 2026™</h2>
        </div>
        <p className="text-blue-200 mb-4">48 seleções · 12 grupos · 104 partidas · 3 países-sede</p>

        {/* Torneio stats */}
        <div className="flex flex-wrap gap-3 text-sm mb-4">
          <div className="bg-white/10 rounded-lg px-4 py-2 text-center">
            <div className="font-bold text-xl text-yellow-300">{groups.length}</div>
            <div className="text-blue-200 text-xs">Grupos</div>
          </div>
          <div className="bg-white/10 rounded-lg px-4 py-2 text-center">
            <div className="font-bold text-xl text-yellow-300">48</div>
            <div className="text-blue-200 text-xs">Seleções</div>
          </div>
          <div className="bg-white/10 rounded-lg px-4 py-2 text-center">
            <div className="font-bold text-xl text-yellow-300">{matches.length}</div>
            <div className="text-blue-200 text-xs">Partidas</div>
          </div>
          <div className="bg-white/10 rounded-lg px-4 py-2 text-center">
            <div className="font-bold text-xl text-yellow-300">3</div>
            <div className="text-blue-200 text-xs">Países-sede</div>
          </div>
        </div>

        {/* IA stats */}
        <div className="flex flex-wrap gap-3 text-sm mb-5 pt-3 border-t border-white/10">
          <div className="flex items-center gap-2 bg-white/10 rounded-lg px-4 py-2">
            <Sparkles className="w-4 h-4 text-purple-300" />
            <div>
              <span className="font-bold text-purple-200">{stats.analyzed}</span>
              <span className="text-blue-200 text-xs"> de {matches.length} analisadas</span>
            </div>
          </div>
          {stats.scored > 0 && (
            <div className="flex items-center gap-2 bg-white/10 rounded-lg px-4 py-2">
              <Star className="w-4 h-4 text-yellow-300" />
              <div>
                <span className="font-bold text-yellow-200">{stats.points} pts</span>
                <span className="text-blue-200 text-xs"> em {stats.scored} jogos avaliados</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Link href="/groups" className="bg-white text-blue-900 font-bold px-5 py-2 rounded-xl hover:bg-yellow-300 transition-colors text-sm">
            Ver Grupos
          </Link>
          <Link href="/knockout" className="border border-white/30 text-white font-bold px-5 py-2 rounded-xl hover:bg-white/10 transition-colors text-sm">
            Mata-Mata
          </Link>
          <button
            onClick={syncData}
            disabled={syncing}
            className="ml-auto flex items-center gap-1.5 text-xs text-blue-200 hover:text-white transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
            {lastUpdated
              ? `Atualizado ${lastUpdated.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`
              : "Atualizar"}
          </button>
        </div>
      </div>

      {/* Live Matches */}
      {liveMatches.length > 0 && (
        <section>
          <h3 className="flex items-center gap-2 text-lg font-bold mb-4 text-gray-900 dark:text-white">
            <Activity className="w-5 h-5 text-green-500" />
            Ao Vivo
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {liveMatches.map(m => (
              <MatchCard key={m.id} match={m} predictedScore={predictionsMap.get(m.id)} onClick={setSelectedMatch} />
            ))}
          </div>
        </section>
      )}

      {/* All Matches */}
      <section>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
            <Calendar className="w-5 h-5 text-blue-500" />
            Jogos da Copa
          </h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {filteredMatches.length} de {matches.length} jogos
          </span>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />
          {STATUS_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                statusFilter === f.value
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {f.label} ({statusCounts[f.value]})
            </button>
          ))}

          <select
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            className="ml-auto px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-none focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="all">Todas as datas</option>
            {dateOptions.map(d => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </div>

        {/* Match grid */}
        {filteredMatches.length === 0 ? (
          <div className="text-center py-10 text-sm text-gray-500 dark:text-gray-400">
            Nenhum jogo encontrado para os filtros selecionados.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMatches.slice(0, visibleCount).map(m => (
                <MatchCard key={m.id} match={m} predictedScore={predictionsMap.get(m.id)} onClick={setSelectedMatch} />
              ))}
            </div>
            {visibleCount < filteredMatches.length && (
              <div className="flex justify-center mt-5">
                <button
                  onClick={() => setVisibleCount(c => c + 12)}
                  className="px-5 py-2 rounded-xl text-sm font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Mostrar mais jogos
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {selectedMatch && (
        <MatchAnalysisModal match={selectedMatch} onClose={handleModalClose} />
      )}
    </div>
  );
}
