Git: https://github.com/vaniojr/world_cup.git 
Vercel: https://vercel.com/vaniojr/world-cup 
Dominio: world-cup.astute4ai.com 
Database neon: 
DATABASE_URL=postgresql://neondb_owner:npg_Y7incp6rZxql@ep-broad-glade-aqayh1ak-pooler.c-8.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require



CONTEXTO INICIAL DO PROJETO — WORLD CUP PREDICTOR

1. Visão geral

Quero criar uma aplicação web para acompanhar todos os jogos da Copa do Mundo FIFA 2026, com visual moderno, responsivo e organizado por fases da competição.

A aplicação deve exibir:

* Todos os jogos da primeira fase, separados por grupos.
* Abas para cada grupo da fase inicial.
* Abas para as fases eliminatórias.
* Bandeiras dos países em todos os cards de partidas e tabelas.
* Classificação automática de cada grupo após os jogos.
* Página ou modal de detalhe da partida.
* Ao clicar em uma partida, a aplicação deve consultar uma API atualizada e gerar um palpite de placar provável usando IA.

A aplicação será desenvolvida localmente no VS Code, com suporte do Claude Code, versionada no Git e futuramente publicada na Vercel.

⸻

2. Objetivo do produto

Criar uma plataforma chamada, inicialmente, World Cup Predictor, focada em experiência simples e visual para usuários que querem:

* Ver a tabela completa da Copa do Mundo.
* Consultar jogos por grupo e fase.
* Acompanhar classificação dos grupos.
* Ver bandeiras e dados das seleções.
* Clicar em uma partida e receber uma análise esportiva detalhada.
* Obter um palpite de placar baseado em dados recentes, notícias, forma das equipes e contexto da partida.

O palpite deve ser apresentado como previsão probabilística, não como certeza.

⸻

3. Escopo do MVP

O MVP deve conter:

3.1 Tela inicial

* Header com nome da aplicação.
* Resumo da competição.
* Destaque para próximos jogos.
* Cards com jogos em andamento, próximos jogos e últimos resultados.
* Navegação para grupos e fases eliminatórias.

3.2 Abas da fase de grupos

Criar abas para os 12 grupos da Copa 2026:

* Grupo A
* Grupo B
* Grupo C
* Grupo D
* Grupo E
* Grupo F
* Grupo G
* Grupo H
* Grupo I
* Grupo J
* Grupo K
* Grupo L

Cada aba deve conter:

* Lista de partidas do grupo.
* País 1 x País 2.
* Bandeira dos dois países.
* Data e horário.
* Estádio e cidade, se disponível.
* Status da partida:
    * Agendada
    * Ao vivo
    * Encerrada
* Placar, quando disponível.
* Botão ou ação de clique para abrir análise da partida.

3.3 Classificação do grupo

Após a lista de jogos de cada grupo, exibir a tabela de classificação com:

* Posição
* Bandeira
* Seleção
* Jogos
* Vitórias
* Empates
* Derrotas
* Gols pró
* Gols contra
* Saldo de gols
* Pontos

A classificação deve ser calculada automaticamente com base nos resultados dos jogos.

Critérios básicos:

1. Mais pontos
2. Melhor saldo de gols
3. Mais gols marcados
4. Confronto direto, se possível
5. Ordem alfabética como fallback técnico no MVP

3.4 Abas das fases eliminatórias

Criar abas ou seções para:

* 16 avos de final / Round of 32
* Oitavas de final
* Quartas de final
* Semifinais
* Disputa de terceiro lugar
* Final

Cada fase deve exibir os confrontos em formato de cards ou bracket simplificado.

As equipes classificadas para o mata-mata podem ser preenchidas dinamicamente conforme a fase de grupos for concluída.

⸻

4. Funcionalidade principal: análise com IA ao clicar no jogo

Quando o usuário clicar em uma partida, abrir uma página ou modal com uma análise completa.

A análise deve consultar uma rota interna da aplicação, por exemplo:

/api/match-analysis

Essa rota deve receber:

{
  "homeTeam": "Brasil",
  "awayTeam": "Alemanha",
  "matchId": "opcional",
  "competition": "FIFA World Cup 2026",
  "stage": "Group Stage",
  "date": "2026-06-xx"
}

A rota deve buscar dados atualizados em APIs externas e enviar o contexto para uma API de IA.

A resposta da IA deve retornar:

1. Contexto da partida
2. Forma recente das equipes
3. Análise tática
4. Escalações prováveis
5. Desfalques
6. Jogadores-chave
7. Histórico do confronto
8. Estatísticas relevantes
9. Fatores externos
10. Probabilidades estimadas
11. Palpite de placar
12. Resumo final

⸻

5. Prompt base para análise da partida

Usar o seguinte prompt como base dentro da rota de IA:

Atue como um analista esportivo profissional especializado em futebol internacional.
Forneça uma análise completa e detalhada do jogo entre:
{{homeTeam}} x {{awayTeam}}
Competição: {{competition}}
Fase: {{stage}}
Data: {{date}}
Local: {{venue}}
Inclua as seguintes informações:
1. Contexto da Partida
- Competição, fase e importância do jogo.
- Data, horário e local da partida.
- Situação atual de cada equipe na competição.
2. Forma Recente das Equipes
- Últimos 5 jogos de cada seleção.
- Sequência de vitórias, empates e derrotas.
- Desempenho recente como mandante, visitante ou campo neutro, quando aplicável.
3. Análise Tática
- Formações táticas prováveis.
- Estilo de jogo de cada equipe.
- Pontos fortes e fracos.
- Possíveis duelos individuais decisivos.
4. Escalações Prováveis
- Jogadores titulares esperados.
- Desfalques por lesão ou suspensão.
- Impacto das ausências no desempenho das equipes.
5. Jogadores-Chave
- Destaque para os principais atletas de cada seleção.
- Estatísticas recentes, como gols, assistências e participação em jogadas.
6. Histórico do Confronto
- Resultados dos últimos encontros entre as seleções.
- Tendências ou padrões observados.
7. Estatísticas Relevantes
- Média de gols marcados e sofridos.
- Posse de bola, finalizações e eficiência ofensiva/defensiva, se disponível.
8. Fatores Externos
- Condições climáticas.
- Influência do estádio, viagem, torcida e adaptação.
- Possível impacto psicológico.
9. Probabilidades e Prognóstico
- Probabilidade estimada de vitória de cada equipe.
- Probabilidade de empate.
- Placar provável com justificativa.
10. Resumo Final
- Síntese objetiva com os principais pontos da análise.
Importante:
- Use linguagem clara, objetiva e com tom jornalístico.
- Não apresente o palpite como certeza.
- Caso alguma informação em tempo real não esteja disponível, deixe isso claro.
- Baseie a análise em dados recentes, notícias, forma das equipes e estatísticas disponíveis.
- Retorne a resposta em português do Brasil.

⸻

6. Stack recomendada

Usar:

* Next.js com App Router
* TypeScript
* Tailwind CSS
* shadcn/ui para componentes
* Lucide React para ícones
* Vercel para deploy
* API Routes ou Route Handlers do Next.js para backend
* Banco de dados opcional no MVP

Para persistência futura:

* Supabase, Neon ou Vercel Postgres
* Prisma ORM

Para cache:

* Vercel KV ou Upstash Redis
* Cache por partida para evitar custo alto de IA

⸻

7. APIs externas recomendadas

Avaliar APIs esportivas como:

Opção 1 — Sportmonks

A Sportmonks possui API de futebol com dados como fixtures, placares ao vivo, estatísticas, grupos, classificação, odds e previsões, dependendo do plano. Pode ser uma boa opção para dados estruturados da Copa do Mundo.

Opção 2 — API-Football / API-Sports

Pode ser usada para fixtures, standings, times, estatísticas, resultados e dados históricos.

Opção 3 — Statorium

Também oferece API e widgets específicos para Copa do Mundo, incluindo calendário, resultados e classificação.

Opção 4 — The Odds API

Pode ser usada futuramente para odds/probabilidades, caso esteja disponível para o torneio e mercados desejados.

No MVP, criar uma camada de abstração chamada sportsDataService, para permitir trocar a API depois sem alterar a interface inteira.

⸻

8. APIs de IA recomendadas

Criar uma camada chamada aiAnalysisService.

Possíveis provedores:

* OpenAI API
* Anthropic Claude API
* Perplexity API, caso seja necessário buscar informações recentes na web
* Tavily ou SerpAPI para busca web complementar
* OpenRouter como alternativa para testar diferentes modelos

A IA deve receber dados estruturados da partida, dados recentes e notícias relevantes antes de gerar o palpite.

Importante: o modelo de IA sozinho não deve inventar dados. Sempre que possível, fornecer contexto vindo de API esportiva e notícias recentes.

⸻

9. Estrutura inicial sugerida de pastas

src/
  app/
    page.tsx
    groups/
      page.tsx
    knockout/
      page.tsx
    match/
      [id]/
        page.tsx
    api/
      matches/
        route.ts
      standings/
        route.ts
      match-analysis/
        route.ts
  components/
    layout/
      Header.tsx
      Footer.tsx
    matches/
      MatchCard.tsx
      MatchAnalysisModal.tsx
      MatchStatusBadge.tsx
    groups/
      GroupTabs.tsx
      GroupStandingsTable.tsx
    knockout/
      KnockoutBracket.tsx
    teams/
      TeamFlag.tsx
      TeamName.tsx
    ui/
  data/
    mockWorldCup2026.ts
    countries.ts
  services/
    sportsDataService.ts
    aiAnalysisService.ts
    newsService.ts
  lib/
    standings.ts
    flags.ts
    dates.ts
    utils.ts
  types/
    match.ts
    team.ts
    group.ts
    analysis.ts

⸻

10. Modelos de dados

Criar tipos TypeScript como:

export type MatchStatus = "scheduled" | "live" | "finished";
export type Team = {
  id: string;
  name: string;
  fifaCode: string;
  flagUrl: string;
  group?: string;
};
export type Match = {
  id: string;
  stage: "group" | "round-of-32" | "round-of-16" | "quarter-final" | "semi-final" | "third-place" | "final";
  group?: string;
  homeTeam: Team;
  awayTeam: Team;
  homeScore?: number;
  awayScore?: number;
  date: string;
  venue?: string;
  city?: string;
  status: MatchStatus;
};
export type Standing = {
  team: Team;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
};
export type MatchAnalysis = {
  matchId: string;
  context: string;
  recentForm: string;
  tacticalAnalysis: string;
  probableLineups: string;
  keyPlayers: string;
  headToHead: string;
  statistics: string;
  externalFactors: string;
  probabilities: {
    homeWin: number;
    draw: number;
    awayWin: number;
  };
  predictedScore: string;
  finalSummary: string;
  generatedAt: string;
  sources?: string[];
};

⸻

11. Bandeiras dos países

Para o MVP, usar uma destas abordagens:

1. Usar emojis de bandeiras, mais simples.
2. Usar CDN de bandeiras por código ISO.
3. Salvar SVGs localmente na pasta public/flags.

Criar um componente:

<TeamFlag countryCode="BR" />

Esse componente deve renderizar a bandeira e possuir fallback caso o código do país não exista.

⸻

12. Regras de classificação

Criar uma função em:

src/lib/standings.ts

Função esperada:

calculateGroupStandings(matches: Match[], group: string): Standing[]

A função deve:

* Filtrar apenas jogos finalizados do grupo.
* Somar pontos:
    * Vitória: 3 pontos
    * Empate: 1 ponto
    * Derrota: 0 pontos
* Calcular gols pró, gols contra e saldo.
* Ordenar por pontos, saldo de gols e gols marcados.

⸻

13. Experiência visual

A interface deve ter estilo esportivo, moderno e responsivo.

Sugestão visual:

* Fundo escuro ou claro com cards destacados.
* Cards de partidas com bandeiras grandes.
* Uso de badges para status da partida.
* Abas horizontais para grupos.
* Tabela de classificação limpa.
* Modal de análise com seções bem separadas.
* Skeleton/loading durante consulta da IA.
* Alerta informando que o palpite é estimativo.

⸻

14. Requisitos de UX

Ao clicar em uma partida:

1. Abrir modal ou página da partida.
2. Mostrar dados básicos imediatamente.
3. Exibir loading enquanto a análise é gerada.
4. Mostrar a análise organizada por blocos.
5. Destacar o placar provável.
6. Exibir probabilidades.
7. Mostrar aviso:

Este palpite é uma estimativa baseada em dados disponíveis, notícias recentes e análise estatística. Não representa garantia de resultado.

⸻

15. Variáveis de ambiente

Criar .env.example com:

SPORTS_API_KEY=
SPORTS_API_BASE_URL=
AI_API_KEY=
AI_MODEL=
NEWS_API_KEY=
NEWS_API_BASE_URL=
CACHE_TTL_SECONDS=21600

Nunca expor chaves no frontend.

⸻

16. Estratégia de desenvolvimento

Desenvolver em fases.

Fase 1 — Mock visual

* Criar layout principal.
* Criar grupos mockados.
* Criar cards de jogos.
* Criar tabela de classificação mockada.
* Criar navegação entre grupos e fases.

Fase 2 — Cálculo de classificação

* Implementar calculateGroupStandings.
* Alimentar classificação a partir dos resultados mockados.
* Testar critérios de ordenação.

Fase 3 — Detalhe da partida

* Criar modal ou página de partida.
* Exibir dados completos do jogo.
* Criar botão “Gerar análise”.

Fase 4 — Integração com IA

* Criar rota /api/match-analysis.
* Criar prompt estruturado.
* Retornar JSON validado.
* Exibir análise no frontend.

Fase 5 — Dados reais

* Integrar API esportiva.
* Buscar fixtures, resultados, grupos e classificação.
* Implementar cache.
* Tratar erros e limites de API.

Fase 6 — Melhorias

* Notícias recentes.
* Odds/probabilidades.
* Comparativo entre seleções.
* Favoritos do usuário.
* Compartilhamento de análise.

⸻

17. Cuidados importantes

* Não afirmar que o palpite é certeza.
* Não inventar escalações, lesões ou estatísticas se a API não fornecer.
* Sempre sinalizar quando uma informação for estimada.
* Cachear análises para evitar múltiplas chamadas caras.
* Separar dados esportivos, notícias e IA em serviços independentes.
* Garantir que a aplicação funcione mesmo sem API real, usando mocks.

⸻

18. Primeira tarefa para o Claude Code

Crie a estrutura inicial de uma aplicação Next.js com TypeScript, Tailwind CSS e App Router para o projeto World Cup Predictor.

Implemente primeiro:

1. Página inicial com header e resumo da Copa.
2. Abas dos 12 grupos.
3. Dados mockados de seleções, grupos e partidas.
4. Cards de partidas com bandeiras.
5. Tabela de classificação calculada automaticamente.
6. Modal de detalhe da partida.
7. Botão “Gerar palpite com IA”, inicialmente usando resposta mockada.
8. Arquitetura preparada para futura integração com API esportiva e API de IA.

Organize o código em componentes reutilizáveis, tipos TypeScript e funções utilitárias.

Priorize código limpo, modular e fácil de evoluir.