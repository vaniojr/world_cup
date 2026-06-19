"use client";
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import Link from "next/link";
import pkg from "../../package.json";
import { ALL_MATCHES, GROUPS } from "@/data/mockWorldCup2026";
import { MatchCard } from "@/components/matches/MatchCard";
import { MatchAnalysisModal } from "@/components/matches/MatchAnalysisModal";
import { Match, MatchStatus, Group } from "@/types";
import { AnalysisSummary } from "@/lib/db";
import { calculatePoints } from "@/lib/scoring";
import { getLocalDateKey } from "@/lib/utils";
import { Activity, BarChart3, Calendar, Filter, Trophy, RefreshCw, Sparkles, Star } from "lucide-react";

const LIVE_POLL_INTERVAL = 30_000;

const TEAM_CONF: Record<string, string> = {
  // UEFA
  CZE: "UEFA", BIH: "UEFA", SUI: "UEFA", SCO: "UEFA", TUR: "UEFA",
  GER: "UEFA", NED: "UEFA", SWE: "UEFA", BEL: "UEFA", ESP: "UEFA",
  FRA: "UEFA", NOR: "UEFA", AUT: "UEFA", POR: "UEFA", ENG: "UEFA", CRO: "UEFA",
  // CONMEBOL
  BRA: "CONMEBOL", PAR: "CONMEBOL", ECU: "CONMEBOL", URU: "CONMEBOL",
  ARG: "CONMEBOL", COL: "CONMEBOL",
  // CONCACAF
  MEX: "CONCACAF", CAN: "CONCACAF", USA: "CONCACAF", HAI: "CONCACAF",
  CUW: "CONCACAF", PAN: "CONCACAF",
  // AFC
  KOR: "AFC", QAT: "AFC", JPN: "AFC", IRN: "AFC",
  KSA: "AFC", IRQ: "AFC", JOR: "AFC", UZB: "AFC",
  // CAF
  RSA: "CAF", MAR: "CAF", CIV: "CAF", TUN: "CAF", EGY: "CAF",
  SEN: "CAF", ALG: "CAF", COD: "CAF", GHA: "CAF", CPV: "CAF",
  // OFC
  NZL: "OFC", AUS: "OFC",
};

const CONF_LABEL: Record<string, string> = {
  UEFA:     "UEFA · Europa",
  CONMEBOL: "CONMEBOL · América do Sul",
  CONCACAF: "CONCACAF · América Central/Norte",
  AFC:      "AFC · Ásia",
  CAF:      "CAF · África",
  OFC:      "OFC · Oceania",
};

const STAGE_LABELS: Record<string, string> = {
  "round-of-32":  "Fase de 32",
  "round-of-16":  "Oitavas de Final",
  "quarter-final":"Quartas de Final",
  "semi-final":   "Semifinais",
  "third-place":  "3º Lugar",
  "final":        "Final",
};

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
  const [groupStageFilter, setGroupStageFilter] = useState<string>("all");
  const [teamFilter, setTeamFilter]         = useState<string>("all");
  const [confFilter, setConfFilter]         = useState<string>("all");
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

  const tournamentStats = useMemo(() => {
    const finished = matches.filter(
      m => m.status === "finished" && m.homeScore !== undefined && m.awayScore !== undefined,
    );
    if (finished.length === 0) return null;

    // ── Confederation W/D/L ──────────────────────────────────────────────────
    const confMap: Record<string, { wins: number; draws: number; losses: number }> = {};
    const ensure = (c: string) => { if (!confMap[c]) confMap[c] = { wins: 0, draws: 0, losses: 0 }; };

    finished.forEach(m => {
      const hc = TEAM_CONF[m.homeTeam.fifaCode] ?? "?";
      const ac = TEAM_CONF[m.awayTeam.fifaCode] ?? "?";
      ensure(hc); ensure(ac);
      if (m.homeScore! > m.awayScore!)      { confMap[hc].wins++;  confMap[ac].losses++; }
      else if (m.homeScore! < m.awayScore!) { confMap[ac].wins++;  confMap[hc].losses++; }
      else                                   { confMap[hc].draws++; confMap[ac].draws++;  }
    });

    const confStats = Object.entries(confMap)
      .map(([name, s]) => ({ name, ...s, total: s.wins + s.draws + s.losses }))
      .sort((a, b) => b.total - a.total);

    // ── Top-5 scores (normalized: higher-lower) ──────────────────────────────
    const scoreCounts: Record<string, number> = {};
    finished.forEach(m => {
      const hi = Math.max(m.homeScore!, m.awayScore!);
      const lo = Math.min(m.homeScore!, m.awayScore!);
      const key = `${hi}-${lo}`;
      scoreCounts[key] = (scoreCounts[key] ?? 0) + 1;
    });

    const total = finished.length;
    const sorted = Object.entries(scoreCounts).sort((a, b) => b[1] - a[1]);
    const maxCount = sorted[0]?.[1] ?? 1;

    const top5 = sorted.slice(0, 7).map(([score, count]) => ({
      score,
      count,
      pct:    Math.round((count / total) * 100),
      barPct: Math.round((count / maxCount) * 100),
    }));

    const othersCount = sorted.slice(7).reduce((s, [, c]) => s + c, 0);
    const othersPct   = Math.round((othersCount / total) * 100);
    const othersBar   = othersCount > 0 ? Math.round((othersCount / maxCount) * 100) : 0;

    return { confStats, top5, othersCount, othersPct, othersBar, total };
  }, [matches]);

  const liveMatches = matches.filter(m => m.status === "live");

  // All matches sorted chronologically
  const sortedMatches = useMemo(
    () => [...matches].sort((a, b) => a.date.localeCompare(b.date)),
    [matches],
  );

  // Options for Group/Stage dropdown (derived from actual matches)
  const groupStageOptions = useMemo(() => {
    const groups = [...new Set(
      sortedMatches.filter(m => m.stage === "group" && m.group).map(m => m.group!),
    )].sort();
    const knockoutStages = [...new Set(
      sortedMatches.filter(m => m.stage !== "group").map(m => m.stage),
    )];
    return { groups, knockoutStages };
  }, [sortedMatches]);

  // Options for Team dropdown (all unique teams, sorted alphabetically)
  const teamOptions = useMemo(() => {
    const map = new Map<string, string>();
    sortedMatches.forEach(m => {
      map.set(m.homeTeam.fifaCode, m.homeTeam.name);
      map.set(m.awayTeam.fifaCode, m.awayTeam.name);
    });
    return [...map.entries()]
      .map(([code, name]) => ({ value: code, label: name }))
      .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
  }, [sortedMatches]);

  // Available match dates (in the viewer's local timezone) for the date filter
  const dateOptions = useMemo(() => {
    const keys = Array.from(new Set(sortedMatches.map(m => getLocalDateKey(m.date)))).sort();
    return keys.map(key => {
      const [year, month, day] = key.split("-").map(Number);
      return {
        value: key,
        label: new Date(year, month - 1, day).toLocaleDateString("pt-BR", {
          weekday: "short",
          day: "2-digit",
          month: "short",
        }),
      };
    });
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
      if (dateFilter !== "all" && getLocalDateKey(m.date) !== dateFilter) return false;

      if (groupStageFilter !== "all") {
        if (groupStageFilter === "group_all") {
          if (m.stage !== "group") return false;
        } else if (groupStageFilter.length === 1) {
          if (m.stage !== "group" || m.group !== groupStageFilter) return false;
        } else {
          if (m.stage !== groupStageFilter) return false;
        }
      }

      if (teamFilter !== "all") {
        if (m.homeTeam.fifaCode !== teamFilter && m.awayTeam.fifaCode !== teamFilter) return false;
      }

      if (confFilter !== "all") {
        const hc = TEAM_CONF[m.homeTeam.fifaCode];
        const ac = TEAM_CONF[m.awayTeam.fifaCode];
        if (hc !== confFilter && ac !== confFilter) return false;
      }

      return true;
    });
  }, [sortedMatches, statusFilter, dateFilter, groupStageFilter, teamFilter, confFilter]);

  const hasExtraFilters = groupStageFilter !== "all" || teamFilter !== "all" || confFilter !== "all";

  // Reset pagination whenever filters change
  useEffect(() => {
    setVisibleCount(12);
  }, [statusFilter, dateFilter, groupStageFilter, teamFilter, confFilter]);

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Trophy className="w-8 h-8 text-yellow-400" />
          <h2 className="text-2xl font-black">FIFA World Cup 2026™</h2>
          <span className="ml-auto text-xs font-mono text-blue-400 bg-white/10 px-2 py-0.5 rounded-full">v{pkg.version}</span>
        </div>
        <p className="text-blue-200 mb-4">48 seleções · 12 grupos · {matches.length} partidas · 3 países-sede</p>

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

      {/* Tournament Stats */}
      {tournamentStats && (
        <section>
          <h3 className="flex items-center gap-2 text-lg font-bold mb-4 text-gray-900 dark:text-white">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            Estatísticas da Copa
            <span className="text-xs font-normal text-gray-400 ml-1">
              {tournamentStats.total} jogo{tournamentStats.total !== 1 ? "s" : ""} encerrado{tournamentStats.total !== 1 ? "s" : ""}
            </span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Confederation W/D/L */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-4">
                Resultados por Confederação
              </h4>
              <div className="space-y-3">
                {tournamentStats.confStats.map(cs => {
                  const winPct  = cs.total > 0 ? (cs.wins  / cs.total) * 100 : 0;
                  const drawPct = cs.total > 0 ? (cs.draws / cs.total) * 100 : 0;
                  const lossPct = cs.total > 0 ? (cs.losses / cs.total) * 100 : 0;
                  return (
                    <div key={cs.name}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-200 truncate max-w-[55%]">
                          {CONF_LABEL[cs.name] ?? cs.name}
                        </span>
                        <span className="text-xs shrink-0 ml-2">
                          <span className="font-bold text-green-600 dark:text-green-400">{cs.wins}V</span>
                          {" "}<span className="font-bold text-yellow-500 dark:text-yellow-400">{cs.draws}E</span>
                          {" "}<span className="font-bold text-red-500 dark:text-red-400">{cs.losses}D</span>
                          <span className="text-gray-400"> · {cs.total}J</span>
                        </span>
                      </div>
                      <div className="flex h-2 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700">
                        {winPct  > 0 && <div className="bg-green-500 h-full" style={{ width: `${winPct}%`  }} />}
                        {drawPct > 0 && <div className="bg-yellow-400 h-full" style={{ width: `${drawPct}%` }} />}
                        {lossPct > 0 && <div className="bg-red-500 h-full"   style={{ width: `${lossPct}%` }} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top-5 scores */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-4">
                Placares mais frequentes
              </h4>
              <div className="space-y-2.5">
                {tournamentStats.top5.map((s, i) => (
                  <div key={s.score} className="flex items-center gap-2">
                    <span className="w-4 text-xs font-bold text-gray-400 text-right shrink-0">{i + 1}.</span>
                    <span className="font-mono font-bold text-sm text-gray-900 dark:text-white w-12 shrink-0">
                      {s.score.replace("-", " × ")}
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${s.barPct}%` }} />
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 w-24 text-right shrink-0">
                      {s.count}× <span className="text-blue-500 font-semibold">({s.pct}%)</span>
                    </span>
                  </div>
                ))}
                {tournamentStats.othersCount > 0 && (
                  <div className="flex items-center gap-2 pt-1 border-t border-gray-100 dark:border-gray-700">
                    <span className="w-4 text-xs text-gray-400 text-right shrink-0">–</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 w-12 shrink-0">Outros</span>
                    <div className="flex-1 h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                      <div className="h-full bg-gray-400 rounded-full" style={{ width: `${tournamentStats.othersBar}%` }} />
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 w-24 text-right shrink-0">
                      {tournamentStats.othersCount}× <span className="font-semibold">({tournamentStats.othersPct}%)</span>
                    </span>
                  </div>
                )}
              </div>
            </div>

          </div>
        </section>
      )}

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

        {/* Filters — row 1: status + date */}
        <div className="flex flex-wrap items-center gap-2 mb-2">
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

        {/* Filters — row 2: group/stage + team + confederation */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <select
            value={groupStageFilter}
            onChange={e => setGroupStageFilter(e.target.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border-none focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-colors ${
              groupStageFilter !== "all"
                ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
            }`}
          >
            <option value="all">Todas as fases</option>
            {groupStageOptions.groups.length > 0 && (
              <optgroup label="Fase de Grupos">
                <option value="group_all">Todos os Grupos</option>
                {groupStageOptions.groups.map(g => (
                  <option key={g} value={g}>Grupo {g}</option>
                ))}
              </optgroup>
            )}
            {groupStageOptions.knockoutStages.length > 0 && (
              <optgroup label="Mata-Mata">
                {groupStageOptions.knockoutStages.map(s => (
                  <option key={s} value={s}>{STAGE_LABELS[s] ?? s}</option>
                ))}
              </optgroup>
            )}
          </select>

          <select
            value={teamFilter}
            onChange={e => setTeamFilter(e.target.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border-none focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-colors ${
              teamFilter !== "all"
                ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
            }`}
          >
            <option value="all">Todos os times</option>
            {teamOptions.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>

          <select
            value={confFilter}
            onChange={e => setConfFilter(e.target.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border-none focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-colors ${
              confFilter !== "all"
                ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
            }`}
          >
            <option value="all">Todas as confederações</option>
            {Object.keys(CONF_LABEL).map(c => (
              <option key={c} value={c}>{CONF_LABEL[c]}</option>
            ))}
          </select>

          {hasExtraFilters && (
            <button
              onClick={() => { setGroupStageFilter("all"); setTeamFilter("all"); setConfFilter("all"); }}
              className="ml-auto px-3 py-1.5 rounded-full text-xs font-semibold bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
            >
              ✕ Limpar filtros
            </button>
          )}
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
