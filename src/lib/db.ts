import { neon } from "@neondatabase/serverless";
import { MatchAnalysis } from "@/types";

const sql = neon(process.env.DATABASE_URL!);

export async function initAnalysesTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS match_analyses (
      match_id   TEXT PRIMARY KEY,
      analysis   JSONB        NOT NULL,
      created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    )
  `;
}

export async function getAnalysis(matchId: string): Promise<MatchAnalysis | null> {
  const rows = await sql`
    SELECT analysis, updated_at
    FROM match_analyses
    WHERE match_id = ${matchId}
  `;
  if (!rows.length) return null;
  return { ...(rows[0].analysis as MatchAnalysis), generatedAt: rows[0].updated_at };
}

export async function saveAnalysis(matchId: string, analysis: MatchAnalysis): Promise<void> {
  await sql`
    INSERT INTO match_analyses (match_id, analysis, updated_at)
    VALUES (${matchId}, ${JSON.stringify(analysis)}, NOW())
    ON CONFLICT (match_id) DO UPDATE
      SET analysis   = EXCLUDED.analysis,
          updated_at = NOW()
  `;
}

export type AnalysisSummary = {
  matchId: string;
  predictedScore: string;
  generatedAt: string;
};

export async function getAllAnalysesSummary(): Promise<AnalysisSummary[]> {
  const rows = await sql`
    SELECT
      match_id,
      analysis->>'predictedScore' AS predicted_score,
      updated_at
    FROM match_analyses
    ORDER BY updated_at DESC
  `;
  return rows.map(r => ({
    matchId:        r.match_id as string,
    predictedScore: r.predicted_score as string,
    generatedAt:    r.updated_at as string,
  }));
}
