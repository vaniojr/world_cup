import Anthropic from "@anthropic-ai/sdk";
import { Match, MatchAnalysis } from "@/types";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

function buildRecentResultsBlock(match: Match, allMatches: Match[]): string {
  const finished = allMatches.filter(
    m => m.status === "finished" && m.homeScore !== undefined && m.awayScore !== undefined,
  );
  if (finished.length === 0) return "";

  const fmt = (m: Match) => {
    const d = new Date(m.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
    return `  ${m.homeTeam.name} ${m.homeScore} x ${m.awayScore} ${m.awayTeam.name} (${d})`;
  };

  const lines: string[] = [];

  const sameGroup = finished.filter(m => m.group && m.group === match.group);
  if (sameGroup.length > 0) {
    lines.push(`Grupo ${match.group} — resultados já disputados na Copa 2026:`);
    sameGroup.forEach(m => lines.push(fmt(m)));
  }

  const homeId = match.homeTeam.id;
  const awayId = match.awayTeam.id;
  const otherTeamMatches = finished.filter(
    m => m.group !== match.group &&
      (m.homeTeam.id === homeId || m.awayTeam.id === homeId ||
       m.homeTeam.id === awayId || m.awayTeam.id === awayId),
  );
  if (otherTeamMatches.length > 0) {
    lines.push(`Outros jogos das seleções na Copa 2026:`);
    otherTeamMatches.forEach(m => lines.push(fmt(m)));
  }

  if (lines.length === 0) return "";

  return `
RESULTADOS REAIS JÁ DISPUTADOS NA FIFA WORLD CUP 2026 (dados da ESPN — use obrigatoriamente):
${lines.join("\n")}
Estes são fatos concretos do torneio em curso. Utilize-os para calibrar forma recente,
classificação do grupo e contexto da partida. Não ignore nem contradiga esses resultados.
`;
}

export async function generateMatchAnalysis(match: Match, recentResults: Match[] = []): Promise<MatchAnalysis> {
  const stageLabel =
    match.stage === "group"
      ? `Fase de Grupos - Grupo ${match.group}`
      : match.stage;

  const venueLabel = match.venue
    ? `${match.venue}, ${match.city}`
    : match.city ?? "A definir";

  const recentResultsBlock = buildRecentResultsBlock(match, recentResults);

  const prompt = `Atue como um analista esportivo profissional especializado em futebol internacional.
Forneça uma análise completa e detalhada do jogo entre:
${match.homeTeam.name} x ${match.awayTeam.name}
Competição: FIFA World Cup 2026
Fase: ${stageLabel}
Data: ${match.date}
Local: ${venueLabel}
${recentResultsBlock}
CONTEXTO OBRIGATÓRIO — COPA DO MUNDO 2026:
- Canadá, Estados Unidos e México são PAÍSES-SEDE e se classificaram AUTOMATICAMENTE, sem disputar eliminatórias da CONCACAF para este ciclo.
  Portanto, NÃO existem estatísticas de eliminatórias 2026 para essas seleções. Nunca invente ou extrapole dados dessas eliminatórias.
- Para seleções europeias, sul-americanas e de outras confederações, utilize apenas dados de eliminatórias e competições que realmente ocorreram.
- Se não houver dados confiáveis sobre uma estatística específica, sinalize a incerteza com expressões como "historicamente", "em jogos recentes" ou "estimativa baseada em ciclos anteriores".
  NUNCA fabrique números precisos para eventos que não aconteceram.

Inclua as seguintes informações e retorne OBRIGATORIAMENTE um JSON válido com este formato exato:
{
  "context": "string com contexto da partida",
  "recentForm": "string com forma recente das equipes",
  "tacticalAnalysis": "string com análise tática",
  "probableLineups": "string com escalações prováveis",
  "keyPlayers": "string com jogadores-chave",
  "headToHead": {
    "totalMatches": número total de confrontos diretos entre as equipes (0 se não houver registros confiáveis),
    "homeWins": número de vitórias de ${match.homeTeam.name} no histórico de confrontos,
    "draws": número de empates,
    "awayWins": número de vitórias de ${match.awayTeam.name} no histórico de confrontos,
    "lastMatches": array com os últimos 3 confrontos diretos (array vazio [] se não houver). Cada item:
      { "date": "dd/mm/aaaa", "competition": "nome da competição", "score": "Time A N-N Time B" }
      NUNCA invente partidas. Inclua APENAS confrontos que realmente ocorreram e que você conhece com certeza.
      Se totalMatches for 0, retorne lastMatches como [].
    "note": string opcional com observação sobre confiabilidade dos dados (omita se não necessário)
  },
  "statistics": "string com estatísticas relevantes",
  "externalFactors": "string com fatores externos",
  "probabilities": {
    "homeWin": number entre 0 e 100,
    "draw": number entre 0 e 100,
    "awayWin": number entre 0 e 100
  },
  "predictedScore": "string como '2-1'",
  "finalSummary": "string com resumo final"
}

Importante:
- Use linguagem clara, objetiva e com tom jornalístico
- Não apresente o palpite como certeza
- "predictedScore" deve estar SEMPRE no formato "{golsMandante}-{golsVisitante}", ou seja,
  o primeiro número é o placar de ${match.homeTeam.name} (mandante) e o segundo é o placar
  de ${match.awayTeam.name} (visitante), na mesma ordem do confronto "${match.homeTeam.name} x ${match.awayTeam.name}"
- Garanta que "predictedScore", "probabilities" e "finalSummary" sejam consistentes entre si
  (o time apontado como favorito/vencedor no resumo e nas probabilidades deve ser o mesmo
  indicado pelo placar previsto)
- Retorne APENAS o JSON, sem texto adicional antes ou depois
- Retorne a resposta em português do Brasil`;

  const message = await client.messages.create({
    model: process.env.AI_MODEL || "claude-sonnet-4-6",
    max_tokens: 3000,
    messages: [{ role: "user", content: prompt }],
  });

  const content = message.content[0];
  if (content.type !== "text") throw new Error("Unexpected response type");

  // Strip markdown code fences if present (```json ... ``` or ``` ... ```)
  const raw = content.text.trim();
  const jsonText = raw.startsWith("```")
    ? raw.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim()
    : raw;
  const parsed = JSON.parse(jsonText);

  return {
    matchId: match.id,
    ...parsed,
    generatedAt: new Date().toISOString(),
  };
}
