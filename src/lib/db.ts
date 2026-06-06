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
