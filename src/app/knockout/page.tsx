"use client";
import { useState } from "react";
import { ALL_MATCHES } from "@/data/mockWorldCup2026";
import { MatchCard } from "@/components/matches/MatchCard";
import { MatchAnalysisModal } from "@/components/matches/MatchAnalysisModal";
import { Match, Stage } from "@/types";

const knockoutStages: { id: Stage; label: string }[] = [
  { id: "round-of-32",    label: "Avos de Final" },
  { id: "round-of-16",    label: "Oitavas de Final" },
  { id: "quarter-final",  label: "Quartas de Final" },
  { id: "semi-final",     label: "Semifinais" },
  { id: "third-place",    label: "3º Lugar" },
  { id: "final",          label: "Final" },
];

export default function KnockoutPage() {
  const [activeStage, setActiveStage] = useState<Stage>("round-of-32");
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  const stageMatches = ALL_MATCHES.filter(m => m.stage === activeStage);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-gray-900 dark:text-white">Fase Eliminatória</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Mata-mata · A partir de 4 de julho de 2026
        </p>
      </div>

      {/* Stage Tabs */}
      <div className="overflow-x-auto">
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-max">
          {knockoutStages.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveStage(s.id)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                activeStage === s.id
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {stageMatches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stageMatches.map(m => (
            <MatchCard key={m.id} match={m} onClick={setSelectedMatch} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400">
          <div className="text-6xl mb-4">🏆</div>
          <p className="font-medium">Partidas ainda não definidas</p>
          <p className="text-sm mt-1">As equipes serão definidas após a fase de grupos</p>
        </div>
      )}

      {selectedMatch && (
        <MatchAnalysisModal match={selectedMatch} onClose={() => setSelectedMatch(null)} />
      )}
    </div>
  );
}
