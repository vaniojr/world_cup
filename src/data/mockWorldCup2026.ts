import { Team, Match, Group } from "@/types";

// ESPN logo URL helper
const espnLogo = (abbr: string) =>
  `https://a.espncdn.com/i/teamlogos/countries/500/${abbr.toLowerCase()}.png`;

const makeTeam = (
  id: string,
  name: string,
  fifaCode: string,
  group: string,
): Team => ({ id, name, fifaCode, flagUrl: espnLogo(fifaCode), group });

// ─── GROUP A ──────────────────────────────────────────────────────────────────
const MEX = makeTeam("mex", "México",       "MEX", "A");
const CZE = makeTeam("cze", "Tchéquia",     "CZE", "A");
const KOR = makeTeam("kor", "Coreia do Sul","KOR", "A");
const RSA = makeTeam("rsa", "África do Sul","RSA", "A");

// ─── GROUP B ──────────────────────────────────────────────────────────────────
const CAN = makeTeam("can", "Canadá",             "CAN", "B");
const BIH = makeTeam("bih", "Bósnia-Herzegovina", "BIH", "B");
const SUI = makeTeam("sui", "Suíça",              "SUI", "B");
const QAT = makeTeam("qat", "Catar",              "QAT", "B");

// ─── GROUP C ──────────────────────────────────────────────────────────────────
const BRA = makeTeam("bra", "Brasil",        "BRA", "C");
const SCO = makeTeam("sco", "Escócia",       "SCO", "C");
const HAI = makeTeam("hai", "Haiti",         "HAI", "C");
const MAR = makeTeam("mar", "Marrocos",      "MAR", "C");

// ─── GROUP D ──────────────────────────────────────────────────────────────────
const PAR = makeTeam("par", "Paraguai",  "PAR", "D");
const TUR = makeTeam("tur", "Turquia",   "TUR", "D");
const AUS = makeTeam("aus", "Austrália", "AUS", "D");
const USA = makeTeam("usa", "EUA",       "USA", "D");

// ─── GROUP E ──────────────────────────────────────────────────────────────────
const ECU = makeTeam("ecu", "Equador",       "ECU", "E");
const GER = makeTeam("ger", "Alemanha",      "GER", "E");
const CIV = makeTeam("civ", "Costa do Marfim","CIV", "E");
const CUW = makeTeam("cuw", "Curaçao",       "CUW", "E");

// ─── GROUP F ──────────────────────────────────────────────────────────────────
const NED = makeTeam("ned", "Holanda",   "NED", "F");
const SWE = makeTeam("swe", "Suécia",    "SWE", "F");
const JPN = makeTeam("jpn", "Japão",     "JPN", "F");
const TUN = makeTeam("tun", "Tunísia",   "TUN", "F");

// ─── GROUP G ──────────────────────────────────────────────────────────────────
const BEL = makeTeam("bel", "Bélgica",       "BEL", "G");
const IRN = makeTeam("irn", "Irã",           "IRN", "G");
const EGY = makeTeam("egy", "Egito",         "EGY", "G");
const NZL = makeTeam("nzl", "Nova Zelândia", "NZL", "G");

// ─── GROUP H ──────────────────────────────────────────────────────────────────
const ESP = makeTeam("esp", "Espanha",     "ESP", "H");
const URU = makeTeam("uru", "Uruguai",     "URU", "H");
const KSA = makeTeam("ksa", "Arábia Saudita","KSA", "H");
const CPV = makeTeam("cpv", "Cabo Verde",  "CPV", "H");

// ─── GROUP I ──────────────────────────────────────────────────────────────────
const NOR = makeTeam("nor", "Noruega",  "NOR", "I");
const FRA = makeTeam("fra", "França",   "FRA", "I");
const SEN = makeTeam("sen", "Senegal",  "SEN", "I");
const IRQ = makeTeam("irq", "Iraque",   "IRQ", "I");

// ─── GROUP J ──────────────────────────────────────────────────────────────────
const ARG = makeTeam("arg", "Argentina", "ARG", "J");
const AUT = makeTeam("aut", "Áustria",   "AUT", "J");
const ALG = makeTeam("alg", "Argélia",   "ALG", "J");
const JOR = makeTeam("jor", "Jordânia",  "JOR", "J");

// ─── GROUP K ──────────────────────────────────────────────────────────────────
const COL = makeTeam("col", "Colômbia",  "COL", "K");
const POR = makeTeam("por", "Portugal",  "POR", "K");
const UZB = makeTeam("uzb", "Uzbequistão","UZB", "K");
const COD = makeTeam("cod", "R.D. Congo","COD", "K");

// ─── GROUP L ──────────────────────────────────────────────────────────────────
const ENG = makeTeam("eng", "Inglaterra","ENG", "L");
const CRO = makeTeam("cro", "Croácia",   "CRO", "L");
const PAN = makeTeam("pan", "Panamá",    "PAN", "L");
const GHA = makeTeam("gha", "Gana",      "GHA", "L");

export const ALL_TEAMS: Team[] = [
  MEX, CZE, KOR, RSA,
  CAN, BIH, SUI, QAT,
  BRA, SCO, HAI, MAR,
  PAR, TUR, AUS, USA,
  ECU, GER, CIV, CUW,
  NED, SWE, JPN, TUN,
  BEL, IRN, EGY, NZL,
  ESP, URU, KSA, CPV,
  NOR, FRA, SEN, IRQ,
  ARG, AUT, ALG, JOR,
  COL, POR, UZB, COD,
  ENG, CRO, PAN, GHA,
];

// ─── MATCH BUILDER ────────────────────────────────────────────────────────────

function m(
  id: string,
  group: string,
  home: Team,
  away: Team,
  date: string,
  venue: string,
  city: string,
  status: "scheduled" | "live" | "finished" = "scheduled",
  homeScore?: number,
  awayScore?: number,
): Match {
  return { id, stage: "group", group, homeTeam: home, awayTeam: away, date, venue, city, status, homeScore, awayScore };
}

// ─── GROUP STAGE MATCHES (72 jogos — dados reais ESPN) ──────────────────────

const GROUP_A_MATCHES: Match[] = [
  m("760415", "A", MEX, RSA, "2026-06-11T19:00Z", "Estadio Banorte",         "Monterrey"),
  m("760414", "A", KOR, CZE, "2026-06-12T02:00Z", "Estadio Akron",           "Guadalajara"),
  m("760441", "A", MEX, KOR, "2026-06-19T01:00Z", "Estadio Akron",           "Guadalajara"),
  m("760438", "A", CZE, RSA, "2026-06-18T16:00Z", "Mercedes-Benz Stadium",   "Atlanta"),
  m("760467", "A", CZE, MEX, "2026-06-25T01:00Z", "Estadio Banorte",         "Monterrey"),
  m("760466", "A", RSA, KOR, "2026-06-25T01:00Z", "Estadio BBVA",            "Guadalupe"),
];

const GROUP_B_MATCHES: Match[] = [
  m("760416", "B", CAN, BIH, "2026-06-12T19:00Z", "BMO Field",               "Toronto"),
  m("760420", "B", QAT, SUI, "2026-06-13T19:00Z", "Levi's Stadium",          "Santa Clara"),
  m("760440", "B", CAN, QAT, "2026-06-18T22:00Z", "BC Place",                "Vancouver"),
  m("760439", "B", SUI, BIH, "2026-06-18T19:00Z", "SoFi Stadium",            "Inglewood"),
  m("760462", "B", BIH, QAT, "2026-06-24T19:00Z", "Lumen Field",             "Seattle"),
  m("760463", "B", SUI, CAN, "2026-06-24T19:00Z", "BC Place",                "Vancouver"),
];

const GROUP_C_MATCHES: Match[] = [
  m("760419", "C", BRA, MAR, "2026-06-13T22:00Z", "MetLife Stadium",         "East Rutherford"),
  m("760418", "C", HAI, SCO, "2026-06-14T01:00Z", "Gillette Stadium",        "Foxborough"),
  m("760444", "C", BRA, HAI, "2026-06-20T00:30Z", "Lincoln Financial Field", "Philadelphia"),
  m("760445", "C", SCO, MAR, "2026-06-19T22:00Z", "Gillette Stadium",        "Foxborough"),
  m("760464", "C", MAR, HAI, "2026-06-24T22:00Z", "Mercedes-Benz Stadium",   "Atlanta"),
  m("760465", "C", SCO, BRA, "2026-06-24T22:00Z", "Hard Rock Stadium",       "Miami Gardens"),
];

const GROUP_D_MATCHES: Match[] = [
  m("760417", "D", USA, PAR, "2026-06-13T01:00Z", "SoFi Stadium",            "Inglewood"),
  m("760421", "D", AUS, TUR, "2026-06-14T04:00Z", "BC Place",                "Vancouver"),
  m("760442", "D", USA, AUS, "2026-06-19T19:00Z", "Lumen Field",             "Seattle"),
  m("760443", "D", TUR, PAR, "2026-06-20T03:00Z", "Levi's Stadium",          "Santa Clara"),
  m("760469", "D", PAR, AUS, "2026-06-26T02:00Z", "Levi's Stadium",          "Santa Clara"),
  m("760470", "D", TUR, USA, "2026-06-26T02:00Z", "SoFi Stadium",            "Inglewood"),
];

const GROUP_E_MATCHES: Match[] = [
  m("760422", "E", GER, CUW, "2026-06-14T17:00Z", "NRG Stadium",             "Houston"),
  m("760423", "E", CIV, ECU, "2026-06-14T23:00Z", "Lincoln Financial Field", "Philadelphia"),
  m("760446", "E", ECU, CUW, "2026-06-21T00:00Z", "GEHA Field at Arrowhead Stadium", "Kansas City"),
  m("760448", "E", GER, CIV, "2026-06-20T20:00Z", "BMO Field",               "Toronto"),
  m("760468", "E", ECU, GER, "2026-06-25T20:00Z", "MetLife Stadium",         "East Rutherford"),
  m("760473", "E", CUW, CIV, "2026-06-25T20:00Z", "Lincoln Financial Field", "Philadelphia"),
];

const GROUP_F_MATCHES: Match[] = [
  m("760425", "F", NED, JPN, "2026-06-14T20:00Z", "AT&T Stadium",            "Arlington"),
  m("760424", "F", SWE, TUN, "2026-06-15T02:00Z", "Estadio BBVA",            "Guadalupe"),
  m("760447", "F", NED, SWE, "2026-06-20T17:00Z", "NRG Stadium",             "Houston"),
  m("760449", "F", TUN, JPN, "2026-06-21T04:00Z", "Estadio BBVA",            "Guadalupe"),
  m("760471", "F", JPN, SWE, "2026-06-25T23:00Z", "AT&T Stadium",            "Arlington"),
  m("760472", "F", TUN, NED, "2026-06-25T23:00Z", "GEHA Field at Arrowhead Stadium", "Kansas City"),
];

const GROUP_G_MATCHES: Match[] = [
  m("760426", "G", BEL, EGY, "2026-06-15T19:00Z", "Lumen Field",             "Seattle"),
  m("760427", "G", IRN, NZL, "2026-06-16T01:00Z", "SoFi Stadium",            "Inglewood"),
  m("760451", "G", BEL, IRN, "2026-06-21T19:00Z", "SoFi Stadium",            "Inglewood"),
  m("760452", "G", NZL, EGY, "2026-06-22T01:00Z", "BC Place",                "Vancouver"),
  m("760476", "G", EGY, IRN, "2026-06-27T03:00Z", "Lumen Field",             "Seattle"),
  m("760477", "G", NZL, BEL, "2026-06-27T03:00Z", "BC Place",                "Vancouver"),
];

const GROUP_H_MATCHES: Match[] = [
  m("760428", "H", ESP, CPV, "2026-06-15T16:00Z", "Mercedes-Benz Stadium",   "Atlanta"),
  m("760429", "H", KSA, URU, "2026-06-15T22:00Z", "Hard Rock Stadium",       "Miami Gardens"),
  m("760453", "H", ESP, KSA, "2026-06-21T16:00Z", "Mercedes-Benz Stadium",   "Atlanta"),
  m("760450", "H", URU, CPV, "2026-06-21T22:00Z", "Hard Rock Stadium",       "Miami Gardens"),
  m("760478", "H", CPV, KSA, "2026-06-27T00:00Z", "NRG Stadium",             "Houston"),
  m("760479", "H", URU, ESP, "2026-06-27T00:00Z", "Estadio Akron",           "Guadalajara"),
];

const GROUP_I_MATCHES: Match[] = [
  m("760432", "I", FRA, SEN, "2026-06-16T19:00Z", "MetLife Stadium",         "East Rutherford"),
  m("760430", "I", IRQ, NOR, "2026-06-16T22:00Z", "Gillette Stadium",        "Foxborough"),
  m("760454", "I", NOR, SEN, "2026-06-23T00:00Z", "MetLife Stadium",         "East Rutherford"),
  m("760457", "I", FRA, IRQ, "2026-06-22T21:00Z", "Lincoln Financial Field", "Philadelphia"),
  m("760474", "I", SEN, IRQ, "2026-06-26T19:00Z", "BMO Field",               "Toronto"),
  m("760475", "I", NOR, FRA, "2026-06-26T19:00Z", "Gillette Stadium",        "Foxborough"),
];

const GROUP_J_MATCHES: Match[] = [
  m("760433", "J", ARG, ALG, "2026-06-17T01:00Z", "GEHA Field at Arrowhead Stadium", "Kansas City"),
  m("760431", "J", AUT, JOR, "2026-06-17T04:00Z", "Levi's Stadium",          "Santa Clara"),
  m("760456", "J", ARG, AUT, "2026-06-22T17:00Z", "AT&T Stadium",            "Arlington"),
  m("760455", "J", JOR, ALG, "2026-06-23T03:00Z", "Levi's Stadium",          "Santa Clara"),
  m("760483", "J", JOR, ARG, "2026-06-28T02:00Z", "AT&T Stadium",            "Arlington"),
  m("760484", "J", ALG, AUT, "2026-06-28T02:00Z", "GEHA Field at Arrowhead Stadium", "Kansas City"),
];

const GROUP_K_MATCHES: Match[] = [
  m("760435", "K", POR, COD, "2026-06-17T17:00Z", "NRG Stadium",             "Houston"),
  m("760436", "K", UZB, COL, "2026-06-18T02:00Z", "Estadio Banorte",         "Monterrey"),
  m("760459", "K", COL, COD, "2026-06-24T02:00Z", "Estadio Akron",           "Guadalajara"),
  m("760461", "K", POR, UZB, "2026-06-23T17:00Z", "NRG Stadium",             "Houston"),
  m("760481", "K", COL, POR, "2026-06-27T23:30Z", "Hard Rock Stadium",       "Miami Gardens"),
  m("760482", "K", COD, UZB, "2026-06-27T23:30Z", "Mercedes-Benz Stadium",   "Atlanta"),
];

const GROUP_L_MATCHES: Match[] = [
  m("760437", "L", ENG, CRO, "2026-06-17T20:00Z", "AT&T Stadium",            "Arlington"),
  m("760434", "L", GHA, PAN, "2026-06-17T23:00Z", "BMO Field",               "Toronto"),
  m("760458", "L", ENG, GHA, "2026-06-23T20:00Z", "Gillette Stadium",        "Foxborough"),
  m("760460", "L", PAN, CRO, "2026-06-23T23:00Z", "BMO Field",               "Toronto"),
  m("760480", "L", CRO, GHA, "2026-06-27T21:00Z", "Lincoln Financial Field", "Philadelphia"),
  m("760485", "L", PAN, ENG, "2026-06-27T21:00Z", "MetLife Stadium",         "East Rutherford"),
];

export const ALL_MATCHES: Match[] = [
  ...GROUP_A_MATCHES,
  ...GROUP_B_MATCHES,
  ...GROUP_C_MATCHES,
  ...GROUP_D_MATCHES,
  ...GROUP_E_MATCHES,
  ...GROUP_F_MATCHES,
  ...GROUP_G_MATCHES,
  ...GROUP_H_MATCHES,
  ...GROUP_I_MATCHES,
  ...GROUP_J_MATCHES,
  ...GROUP_K_MATCHES,
  ...GROUP_L_MATCHES,
];

export const GROUPS: Group[] = [
  { id: "A", name: "Grupo A", teams: [MEX, CZE, KOR, RSA], matches: GROUP_A_MATCHES },
  { id: "B", name: "Grupo B", teams: [CAN, BIH, SUI, QAT], matches: GROUP_B_MATCHES },
  { id: "C", name: "Grupo C", teams: [BRA, SCO, HAI, MAR], matches: GROUP_C_MATCHES },
  { id: "D", name: "Grupo D", teams: [PAR, TUR, AUS, USA], matches: GROUP_D_MATCHES },
  { id: "E", name: "Grupo E", teams: [ECU, GER, CIV, CUW], matches: GROUP_E_MATCHES },
  { id: "F", name: "Grupo F", teams: [NED, SWE, JPN, TUN], matches: GROUP_F_MATCHES },
  { id: "G", name: "Grupo G", teams: [BEL, IRN, EGY, NZL], matches: GROUP_G_MATCHES },
  { id: "H", name: "Grupo H", teams: [ESP, URU, KSA, CPV], matches: GROUP_H_MATCHES },
  { id: "I", name: "Grupo I", teams: [NOR, FRA, SEN, IRQ], matches: GROUP_I_MATCHES },
  { id: "J", name: "Grupo J", teams: [ARG, AUT, ALG, JOR], matches: GROUP_J_MATCHES },
  { id: "K", name: "Grupo K", teams: [COL, POR, UZB, COD], matches: GROUP_K_MATCHES },
  { id: "L", name: "Grupo L", teams: [ENG, CRO, PAN, GHA], matches: GROUP_L_MATCHES },
];

export function getGroupMatches(groupId: string): Match[] {
  return GROUPS.find(g => g.id === groupId)?.matches ?? [];
}

export function getGroupTeams(groupId: string): Team[] {
  return GROUPS.find(g => g.id === groupId)?.teams ?? [];
}
