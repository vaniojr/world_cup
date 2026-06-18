import Anthropic from "@anthropic-ai/sdk";
import { Match, MatchAnalysis } from "@/types";
import { CardEvent } from "@/services/espnService";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

function buildRecentResultsBlock(
  match: Match,
  allMatches: Match[],
  cardsByMatchId: Map<string, CardEvent[]> = new Map(),
): string {
  const finished = allMatches.filter(
    m => m.status === "finished" && m.homeScore !== undefined && m.awayScore !== undefined,
  );
  if (finished.length === 0) return "";

  const homeId   = match.homeTeam.id;
  const awayId   = match.awayTeam.id;
  const homeName = match.homeTeam.name;
  const awayName = match.awayTeam.name;

  const fmtMatch = (m: Match) => {
    const d = new Date(m.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
    return `  ${m.homeTeam.name} ${m.homeScore} x ${m.awayScore} ${m.awayTeam.name} (${d})`;
  };

  const sections: string[] = [];

  // ── 1. Resultados do grupo ───────────────────────────────────────────────────
  const sameGroup = finished.filter(m => m.group && m.group === match.group);
  if (sameGroup.length > 0) {
    sections.push(`[Grupo ${match.group} — resultados disputados na Copa 2026]`);
    sameGroup.forEach(m => sections.push(fmtMatch(m)));
  }

  // ── 2. Performance das equipes na Copa (resumo) ──────────────────────────────
  const teamSummary = (teamId: string, name: string): string | null => {
    const ms = finished.filter(m => m.homeTeam.id === teamId || m.awayTeam.id === teamId);
    if (ms.length === 0) return null;
    let gf = 0, ga = 0, pts = 0;
    ms.forEach(m => {
      const isHome = m.homeTeam.id === teamId;
      const scored    = isHome ? m.homeScore! : m.awayScore!;
      const conceded  = isHome ? m.awayScore! : m.homeScore!;
      gf += scored; ga += conceded;
      if (scored > conceded) pts += 3;
      else if (scored === conceded) pts += 1;
    });
    const w = ms.filter(m => {
      const isHome = m.homeTeam.id === teamId;
      return isHome ? m.homeScore! > m.awayScore! : m.awayScore! > m.homeScore!;
    }).length;
    const d = ms.filter(m => m.homeScore === m.awayScore).length;
    const l = ms.length - w - d;
    return `  ${name}: ${ms.length}J ${w}V ${d}E ${l}D | ${pts} pts | ${gf} gols marcados / ${ga} sofridos`;
  };

  const hs = teamSummary(homeId, homeName);
  const as_ = teamSummary(awayId, awayName);
  if (hs || as_) {
    sections.push(`\n[Desempenho na Copa 2026]`);
    if (hs)  sections.push(hs);
    if (as_) sections.push(as_);
  }

  // ── 3. Comparação por adversário comum ───────────────────────────────────────
  const homeMs = finished.filter(m => m.homeTeam.id === homeId || m.awayTeam.id === homeId);
  const awayMs = finished.filter(m => m.homeTeam.id === awayId || m.awayTeam.id === awayId);

  const getOpp = (m: Match, teamId: string) =>
    m.homeTeam.id === teamId ? m.awayTeam : m.homeTeam;

  const getScore = (m: Match, teamId: string) => {
    const isHome = m.homeTeam.id === teamId;
    return isHome ? `${m.homeScore}-${m.awayScore}` : `${m.awayScore}-${m.homeScore}`;
  };

  const commonLines: string[] = [];
  homeMs.forEach(hm => {
    const opp = getOpp(hm, homeId);
    const counterpart = awayMs.find(am => getOpp(am, awayId).id === opp.id);
    if (counterpart) {
      commonLines.push(
        `  Adversário comum: ${opp.name} → ${homeName} fez ${getScore(hm, homeId)} | ${awayName} fez ${getScore(counterpart, awayId)}`,
      );
    }
  });
  if (commonLines.length > 0) {
    sections.push(`\n[Comparação por adversário comum na Copa 2026 — peso ALTO]`);
    commonLines.forEach(l => sections.push(l));
    sections.push(`  (Use esta comparação para inferir força ofensiva/defensiva relativa entre os times)`);
  }

  // ── 4. Cartões acumulados (risco de suspensão) ───────────────────────────────
  if (cardsByMatchId.size > 0) {
    const cardLines: string[] = [];

    cardsByMatchId.forEach((cards, matchId) => {
      const m = finished.find(f => f.id === matchId);
      if (!m) return;

      cards.forEach(card => {
        const isHomeTeamMatch = m.homeTeam.id === homeId || m.awayTeam.id === homeId;
        const isAwayTeamMatch = m.homeTeam.id === awayId || m.awayTeam.id === awayId;

        // Attribution by checking if card team name matches our team names (case-insensitive partial)
        const cardTeamNorm = card.teamName.toLowerCase();
        const matchesHome = cardTeamNorm.includes(homeName.toLowerCase().split(" ")[0]) ||
          homeName.toLowerCase().includes(cardTeamNorm.split(" ")[0]);
        const matchesAway = cardTeamNorm.includes(awayName.toLowerCase().split(" ")[0]) ||
          awayName.toLowerCase().includes(cardTeamNorm.split(" ")[0]);

        if ((isHomeTeamMatch && matchesHome) || (isAwayTeamMatch && matchesAway)) {
          const team = matchesHome ? homeName : awayName;
          cardLines.push(`  ${team} — ${card.playerName}: ${card.cardType} (${card.minute})`);
        }
      });
    });

    if (cardLines.length > 0) {
      sections.push(`\n[Cartões acumulados na Copa 2026 — risco de suspensão]`);
      cardLines.forEach(l => sections.push(l));
      sections.push(`  (2 cartões amarelos = suspensão automática na fase de grupos. Considere impacto na escalação)`);
    }
  }

  if (sections.length === 0) return "";

  return `
DADOS REAIS DA FIFA WORLD CUP 2026 (ESPN) — USE COM PESO ALTO NA ANÁLISE:
${sections.join("\n")}

Estes são fatos do torneio em curso. Dê PRIORIDADE a estes dados sobre qualquer
estimativa histórica ou de pré-torneio. Não ignore nem contradiga nenhuma informação acima.
`;
}

export async function generateMatchAnalysis(match: Match, recentResults: Match[] = [], cardsByMatchId: Map<string, CardEvent[]> = new Map()): Promise<MatchAnalysis> {
  const stageLabel =
    match.stage === "group"
      ? `Fase de Grupos - Grupo ${match.group}`
      : match.stage;

  const venueLabel = match.venue
    ? `${match.venue}, ${match.city}`
    : match.city ?? "A definir";

  const recentResultsBlock = buildRecentResultsBlock(match, recentResults, cardsByMatchId);

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
