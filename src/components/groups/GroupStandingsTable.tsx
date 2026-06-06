import { Standing } from "@/types";
import { TeamFlag } from "@/components/teams/TeamFlag";

export function GroupStandingsTable({ standings }: { standings: Standing[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400 text-xs uppercase">
            <th className="px-3 py-2 text-left w-8">#</th>
            <th className="px-3 py-2 text-left">Seleção</th>
            <th className="px-3 py-2 text-center">J</th>
            <th className="px-3 py-2 text-center">V</th>
            <th className="px-3 py-2 text-center">E</th>
            <th className="px-3 py-2 text-center">D</th>
            <th className="px-3 py-2 text-center">GP</th>
            <th className="px-3 py-2 text-center">GC</th>
            <th className="px-3 py-2 text-center">SG</th>
            <th className="px-3 py-2 text-center font-bold">PTS</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((s, i) => (
            <tr
              key={s.team.id}
              className={`border-t border-gray-100 dark:border-gray-700 ${
                i < 2
                  ? "bg-green-50 dark:bg-green-900/10"
                  : "bg-white dark:bg-gray-800"
              }`}
            >
              <td className="px-3 py-2 text-center text-xs text-gray-500">
                {i < 2 ? (
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-bold text-xs">
                    {i + 1}
                  </span>
                ) : (
                  <span className="text-gray-400">{i + 1}</span>
                )}
              </td>
              <td className="px-3 py-2">
                <div className="flex items-center gap-2">
                  <TeamFlag flagUrl={s.team.flagUrl} countryCode={s.team.fifaCode} countryName={s.team.name} size="sm" />
                  <span className="font-medium text-gray-900 dark:text-white text-xs">{s.team.name}</span>
                </div>
              </td>
              <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-300">{s.played}</td>
              <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-300">{s.wins}</td>
              <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-300">{s.draws}</td>
              <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-300">{s.losses}</td>
              <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-300">{s.goalsFor}</td>
              <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-300">{s.goalsAgainst}</td>
              <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-300">
                {s.goalDifference > 0 ? `+${s.goalDifference}` : s.goalDifference}
              </td>
              <td className="px-3 py-2 text-center font-bold text-gray-900 dark:text-white">{s.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs text-gray-400 dark:text-gray-500 px-3 py-2 bg-gray-50 dark:bg-gray-800/80">
        Verde: classificados para a próxima fase
      </p>
    </div>
  );
}
