"use client";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import Link from "next/link";
import { ALL_MATCHES, GROUPS } from "@/data/mockWorldCup2026";
import { MatchCard } from "@/components/matches/MatchCard";
import { MatchAnalysisModal } from "@/components/matches/MatchAnalysisModal";
import { Match, Group } from "@/types";
import { AnalysisSummary } from "@/lib/db";
import { calculatePoints } from "@/lib/scoring";
import { Activity, Calendar, CheckCircle, Trophy, RefreshCw, Sparkles, Star } from "lucide-react";

const LIVE_POLL_INTERVAL = 30_000;

export default function HomePage() {
  const [matches, setMatches]               = useState<Match[]>(ALL_MATCHES);
  const [groups, setGroups]                 = useState<Group[]>(GROUPS);
  const [summaries, setSummaries]           = useState<AnalysisSummary[]>([]);
  const [selectedMatch, setSelectedMatch]   = useState<Match | null>(null);
  const [lastUpdated, setLastUpdated]       = useState<Date | null>(null);
  const [syncing, setSyncing]               = useState(false);
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

  const liveMatches     = matches.filter(m => m.status === "live");
  const upcomingMatches = matches.filter(m => m.status === "scheduled").slice(0, 6);
  const recentMatches   = matches.filter(m => m.status === "finished").slice(0, 6);

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

      {/* Upcoming Matches */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
            <Calendar className="w-5 h-5 text-blue-500" />
            Próximos Jogos
          </h3>
          <Link href="/groups" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
            Ver todos
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {upcomingMatches.map(m => (
            <MatchCard key={m.id} match={m} predictedScore={predictionsMap.get(m.id)} onClick={setSelectedMatch} />
          ))}
        </div>
      </section>

      {/* Recent Results */}
      {recentMatches.length > 0 && (
        <section>
          <h3 className="flex items-center gap-2 text-lg font-bold mb-4 text-gray-900 dark:text-white">
            <CheckCircle className="w-5 h-5 text-gray-500" />
            Últimos Resultados
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentMatches.map(m => (
              <MatchCard key={m.id} match={m} predictedScore={predictionsMap.get(m.id)} onClick={setSelectedMatch} />
            ))}
          </div>
        </section>
      )}

      {selectedMatch && (
        <MatchAnalysisModal match={selectedMatch} onClose={handleModalClose} />
      )}
    </div>
  );
}
