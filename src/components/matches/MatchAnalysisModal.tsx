"use client";
import { useState, useEffect } from "react";
import { Match, MatchAnalysis, HeadToHeadData } from "@/types";
import { TeamFlag } from "@/components/teams/TeamFlag";
import { MatchStatusBadge } from "./MatchStatusBadge";
import { formatDate } from "@/lib/utils";
import {
  Loader2, X, AlertCircle, TrendingUp, Users,
  Swords, BarChart3, MapPin, Trophy, RefreshCw, Clock,
} from "lucide-react";

interface MatchAnalysisModalProps {
  match: Match;
  onClose: () => void;
}

function HeadToHeadSection({ h2h, homeName, awayName }: {
  h2h: HeadToHeadData | string;
  homeName: string;
  awayName: string;
}) {
  if (typeof h2h === "string") {
    return <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{h2h}</p>;
  }

  const total = h2h.totalMatches;

  return (
    <div className="space-y-3">
      {total === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400 italic">
          Sem confrontos diretos registrados entre as seleções.
        </p>
      ) : (
        <>
          <div className="flex items-center justify-between text-sm">
            <span className="font-bold text-green-600 dark:text-green-400">{h2h.homeWins}V <span className="font-normal text-xs text-gray-500">{homeName}</span></span>
            <span className="font-bold text-yellow-600 dark:text-yellow-400">{h2h.draws}E</span>
            <span className="font-bold text-red-600 dark:text-red-400">{h2h.awayWins}V <span className="font-normal text-xs text-gray-500">{awayName}</span></span>
          </div>
          <div className="flex h-2 rounded-full overflow-hidden">
            {h2h.homeWins > 0 && <div className="bg-green-500" style={{ width: `${(h2h.homeWins / total) * 100}%` }} />}
            {h2h.draws > 0 && <div className="bg-yellow-400" style={{ width: `${(h2h.draws / total) * 100}%` }} />}
            {h2h.awayWins > 0 && <div className="bg-red-500" style={{ width: `${(h2h.awayWins / total) * 100}%` }} />}
          </div>
          <p className="text-xs text-gray-400">{total} confronto{total !== 1 ? "s" : ""} no total</p>
        </>
      )}

      {h2h.lastMatches.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Últimos confrontos
          </p>
          {h2h.lastMatches.map((m, i) => (
            <div key={i} className="flex items-center gap-2 text-xs bg-white dark:bg-gray-800 rounded-lg px-3 py-2">
              <span className="text-gray-400 shrink-0 w-20">{m.date}</span>
              <span className="font-semibold text-gray-800 dark:text-gray-200 flex-1 text-center">{m.score}</span>
              <span className="text-gray-400 shrink-0 text-right max-w-[130px] truncate">{m.competition}</span>
            </div>
          ))}
        </div>
      )}

      {h2h.note && (
        <p className="text-xs text-gray-400 italic">{h2h.note}</p>
      )}
    </div>
  );
}

type AnalysisSection = { icon: React.ReactNode; title: string; content: string };

export function MatchAnalysisModal({ match, onClose }: MatchAnalysisModalProps) {
  const [analysis, setAnalysis]   = useState<MatchAnalysis | null>(null);
  const [loading, setLoading]     = useState(false);
  const [loadingCache, setLoadingCache] = useState(true);
  const [isCached, setIsCached]   = useState(false);
  const [error, setError]         = useState<string | null>(null);

  // On open, check for a saved analysis
  useEffect(() => {
    async function fetchCached() {
      setLoadingCache(true);
      try {
        const res = await fetch(`/api/match-analysis?matchId=${match.id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.cached && data.analysis) {
            setAnalysis(data.analysis);
            setIsCached(true);
          }
        }
      } catch { /* no cached analysis */ }
      finally { setLoadingCache(false); }
    }
    fetchCached();
  }, [match.id]);

  async function generateAnalysis(force = false) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/match-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ match, force }),
      });
      if (!res.ok) throw new Error("Falha ao gerar análise");
      const data = await res.json();
      setAnalysis(data.analysis);
      setIsCached(data.cached ?? false);
    } catch {
      setError("Não foi possível gerar a análise. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  const sections: AnalysisSection[] = analysis ? [
    { icon: <Trophy className="w-4 h-4" />,    title: "Contexto da Partida",   content: analysis.context },
    { icon: <TrendingUp className="w-4 h-4" />, title: "Forma Recente",        content: analysis.recentForm },
    { icon: <Swords className="w-4 h-4" />,     title: "Análise Tática",       content: analysis.tacticalAnalysis },
    { icon: <Users className="w-4 h-4" />,      title: "Escalações Prováveis", content: analysis.probableLineups },
    { icon: <BarChart3 className="w-4 h-4" />,  title: "Jogadores-Chave",      content: analysis.keyPlayers },
    { icon: <BarChart3 className="w-4 h-4" />,  title: "Estatísticas",         content: analysis.statistics },
    { icon: <MapPin className="w-4 h-4" />,     title: "Fatores Externos",     content: analysis.externalFactors },
  ] : [];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <MatchStatusBadge status={match.status} />
                {match.group && (
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Grupo {match.group}</span>
                )}
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <TeamFlag flagUrl={match.homeTeam.flagUrl} countryCode={match.homeTeam.fifaCode} countryName={match.homeTeam.name} size="lg" />
                  <span className="font-bold text-lg">{match.homeTeam.name}</span>
                </div>
                <div className="text-center">
                  {match.status !== "scheduled" ? (
                    <span className="text-3xl font-black">{match.homeScore} - {match.awayScore}</span>
                  ) : (
                    <span className="text-2xl font-bold opacity-70">vs</span>
                  )}
                </div>
                <div className="flex items-center gap-3 flex-1 justify-end">
                  <span className="font-bold text-lg text-right">{match.awayTeam.name}</span>
                  <TeamFlag flagUrl={match.awayTeam.flagUrl} countryCode={match.awayTeam.fifaCode} countryName={match.awayTeam.name} size="lg" />
                </div>
              </div>
              <div className="mt-3 text-sm opacity-80 flex items-center gap-3">
                <span>{formatDate(match.date)}</span>
                {match.city && <span>• {match.city}</span>}
              </div>
            </div>
            <button onClick={onClose} className="ml-4 p-1 hover:bg-white/20 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* Loading cache check */}
          {loadingCache && (
            <div className="text-center py-8">
              <Loader2 className="w-7 h-7 animate-spin text-blue-400 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Verificando análise salva...</p>
            </div>
          )}

          {/* No analysis yet */}
          {!loadingCache && !analysis && !loading && (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">⚽</div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Análise com Inteligência Artificial
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
                Clique no botão abaixo para gerar uma análise completa desta partida com palpite de placar.
              </p>
              <button
                onClick={() => generateAnalysis(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
              >
                Gerar palpite com IA
              </button>
            </div>
          )}

          {/* Generating */}
          {loading && (
            <div className="text-center py-12">
              <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-300 font-medium">Analisando partida...</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Isso pode levar alguns segundos</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 mb-4">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm">{error}</p>
              <button onClick={() => generateAnalysis(false)} className="ml-auto text-xs underline">
                Tentar novamente
              </button>
            </div>
          )}

          {/* Analysis result */}
          {analysis && !loading && (
            <div className="space-y-5">

              {/* Cache banner + re-analyze button */}
              {isCached && (
                <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl">
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      Análise salva em{" "}
                      {new Date(analysis.generatedAt).toLocaleString("pt-BR", {
                        day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <button
                    onClick={() => generateAnalysis(true)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors whitespace-nowrap"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Re-analisar
                  </button>
                </div>
              )}

              {/* Predicted Score */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 text-center">
                <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wider mb-1">
                  Palpite de Placar
                </p>
                <p className="text-4xl font-black text-blue-700 dark:text-blue-300">{analysis.predictedScore}</p>
                <div className="flex justify-center gap-6 mt-3 text-sm">
                  <div className="text-center">
                    <p className="font-bold text-green-600 dark:text-green-400">{analysis.probabilities.homeWin}%</p>
                    <p className="text-xs text-gray-500">Vitória {match.homeTeam.name}</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-yellow-600 dark:text-yellow-400">{analysis.probabilities.draw}%</p>
                    <p className="text-xs text-gray-500">Empate</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-red-600 dark:text-red-400">{analysis.probabilities.awayWin}%</p>
                    <p className="text-xs text-gray-500">Vitória {match.awayTeam.name}</p>
                  </div>
                </div>
              </div>

              {/* Analysis Sections */}
              {sections.slice(0, 5).map((s, i) => (
                <div key={i} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                  <h4 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white mb-2 text-sm">
                    <span className="text-blue-600 dark:text-blue-400">{s.icon}</span>
                    {s.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                    {s.content}
                  </p>
                </div>
              ))}

              {/* Head to Head — structured visual block */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                <h4 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white mb-3 text-sm">
                  <span className="text-blue-600 dark:text-blue-400"><Swords className="w-4 h-4" /></span>
                  Histórico do Confronto
                </h4>
                <HeadToHeadSection
                  h2h={analysis.headToHead as HeadToHeadData | string}
                  homeName={match.homeTeam.name}
                  awayName={match.awayTeam.name}
                />
              </div>

              {sections.slice(5).map((s, i) => (
                <div key={i + 5} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                  <h4 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white mb-2 text-sm">
                    <span className="text-blue-600 dark:text-blue-400">{s.icon}</span>
                    {s.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                    {s.content}
                  </p>
                </div>
              ))}

              {/* Final Summary */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <h4 className="font-bold text-gray-900 dark:text-white mb-2">Resumo Final</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{analysis.finalSummary}</p>
              </div>

              {/* Disclaimer */}
              <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  Este palpite é uma estimativa baseada em dados disponíveis, notícias recentes e análise
                  estatística. Não representa garantia de resultado.
                </p>
              </div>

              {/* Re-analyze button at bottom (when not cached banner) */}
              {!isCached && (
                <div className="flex justify-center pt-1">
                  <button
                    onClick={() => generateAnalysis(true)}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Gerar nova análise
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
