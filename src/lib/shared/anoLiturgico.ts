/**
 * Cálculo do ano litúrgico (Rito Romano, calendário do Brasil).
 *
 * Todas as datas móveis derivam da Páscoa (algoritmo de Meeus/Jones/Butcher) e do
 * 1º Domingo do Advento — nada é cadastrado à mão. As datas trafegam como strings
 * ISO "YYYY-MM-DD" e as contas são feitas em UTC, evitando problemas de fuso/horário de verão.
 *
 * Regras do Brasil aplicadas:
 * - Epifania no domingo entre 2 e 8 de janeiro;
 * - Batismo do Senhor no domingo seguinte, ou na segunda-feira se a Epifania cair em 7 ou 8;
 * - Ascensão no domingo (Páscoa + 42), não na quinta-feira.
 */

export type TempoId = "advento" | "natal" | "quaresma" | "triduo" | "pascal" | "comum";

export type CorLiturgica = "branco" | "verde" | "roxo" | "vermelho" | "rosa";

export interface DomingoRosa {
  nome: "Gaudete" | "Laetare";
  data: string;
  /** Rosa é facultativo: pode-se manter o roxo. */
  cor: "rosa";
  corOpcional: true;
}

export interface PeriodoLiturgico {
  /** Identificador único dentro do ano (ex.: "comum-1", "natal-fim"). */
  id: string;
  tempo: TempoId;
  nome: string;
  inicio: string;
  fim: string;
  cor: CorLiturgica;
  /**
   * Dias que o período divide com o vizinho. A Quinta-feira Santa é Quaresma até a
   * Missa da Ceia do Senhor ("manha") e Tríduo a partir dela ("noite").
   */
  inicioParcial?: "noite";
  fimParcial?: "manha";
  domingosRosa?: DomingoRosa[];
}

export type GrauCelebracao = "solenidade" | "festa" | "memória" | "dia santo";

export interface CelebracaoMovel {
  id: string;
  nome: string;
  data: string;
  /** "dia santo" cobre Cinzas, Ramos e o Tríduo, que precedem qualquer solenidade. */
  grau: GrauCelebracao;
  cor: CorLiturgica;
  slug: string;
}

const DIA_MS = 86_400_000;

function paraDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function paraIso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function iso(ano: number, mes: number, dia: number): string {
  return paraIso(new Date(Date.UTC(ano, mes - 1, dia)));
}

export function somarDias(data: string, dias: number): string {
  return paraIso(new Date(paraDate(data).getTime() + dias * DIA_MS));
}

/** 0 = domingo … 6 = sábado. */
function diaDaSemana(data: string): number {
  return paraDate(data).getUTCDay();
}

/** Aceita Date (usa a data local) ou string ISO. */
function normalizarData(data: Date | string): string {
  if (typeof data === "string") return data.slice(0, 10);
  return iso(data.getFullYear(), data.getMonth() + 1, data.getDate());
}

/** Domingo de Páscoa (algoritmo de Meeus/Jones/Butcher, calendário gregoriano). */
export function easter(year: number): string {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31);
  const dia = ((h + l - 7 * m + 114) % 31) + 1;
  return iso(year, mes, dia);
}

/** Epifania (Brasil): domingo entre 2 e 8 de janeiro. */
export function epifania(year: number): string {
  const dia2 = iso(year, 1, 2);
  return somarDias(dia2, (7 - diaDaSemana(dia2)) % 7);
}

/** Batismo do Senhor: domingo após a Epifania, ou segunda-feira se ela cair em 7 ou 8. */
export function batismoDoSenhor(year: number): string {
  const ep = epifania(year);
  const dia = paraDate(ep).getUTCDate();
  return somarDias(ep, dia >= 7 ? 1 : 7);
}

/** 1º Domingo do Advento: quarto domingo antes do Natal (entre 27/11 e 03/12). */
export function primeiroDomingoAdvento(year: number): string {
  const natal = iso(year, 12, 25);
  const domingoAnterior = somarDias(natal, -(diaDaSemana(natal) || 7));
  return somarDias(domingoAnterior, -21);
}

/** Sagrada Família: domingo na oitava do Natal; se não houver, 30 de dezembro. */
export function sagradaFamilia(year: number): string {
  const natal = iso(year, 12, 25);
  const dow = diaDaSemana(natal);
  return dow === 0 ? iso(year, 12, 30) : somarDias(natal, 7 - dow);
}

/** Períodos do ano civil `year`, em ordem cronológica. */
export function liturgicalSeasons(year: number): PeriodoLiturgico[] {
  const pascoa = easter(year);
  const cinzas = somarDias(pascoa, -46);
  const quintaSanta = somarDias(pascoa, -3);
  const pentecostes = somarDias(pascoa, 49);
  const advento = primeiroDomingoAdvento(year);
  const batismo = batismoDoSenhor(year);

  return [
    { id: "natal-inicio", tempo: "natal", nome: "Natal", inicio: iso(year, 1, 1), fim: batismo, cor: "branco" },
    { id: "comum-1", tempo: "comum", nome: "Tempo Comum", inicio: somarDias(batismo, 1), fim: somarDias(cinzas, -1), cor: "verde" },
    {
      id: "quaresma",
      tempo: "quaresma",
      nome: "Quaresma",
      inicio: cinzas,
      fim: quintaSanta,
      fimParcial: "manha",
      cor: "roxo",
      domingosRosa: [{ nome: "Laetare", data: somarDias(pascoa, -21), cor: "rosa", corOpcional: true }],
    },
    {
      id: "triduo",
      tempo: "triduo",
      nome: "Tríduo Pascal",
      inicio: quintaSanta,
      inicioParcial: "noite",
      fim: pascoa,
      cor: "vermelho",
    },
    { id: "pascal", tempo: "pascal", nome: "Tempo Pascal", inicio: pascoa, fim: pentecostes, cor: "branco" },
    { id: "comum-2", tempo: "comum", nome: "Tempo Comum", inicio: somarDias(pentecostes, 1), fim: somarDias(advento, -1), cor: "verde" },
    {
      id: "advento",
      tempo: "advento",
      nome: "Advento",
      inicio: advento,
      fim: iso(year, 12, 24),
      cor: "roxo",
      domingosRosa: [{ nome: "Gaudete", data: somarDias(advento, 14), cor: "rosa", corOpcional: true }],
    },
    { id: "natal-fim", tempo: "natal", nome: "Natal", inicio: iso(year, 12, 25), fim: iso(year, 12, 31), cor: "branco" },
  ];
}

/** Todos os períodos que contêm a data (dois na Quinta-feira Santa e no Domingo de Páscoa). */
export function getSeasonsForDate(date: Date | string): PeriodoLiturgico[] {
  const dia = normalizarData(date);
  return liturgicalSeasons(Number(dia.slice(0, 4))).filter((p) => p.inicio <= dia && dia <= p.fim);
}

/**
 * Tempo litúrgico de um dia. Nos dias compartilhados:
 * - Quinta-feira Santa: Quaresma durante o dia, Tríduo a partir da Missa da Ceia (`momento: "noite"`);
 * - Domingo de Páscoa: Tríduo Pascal (é o seu ápice); o Tempo Pascal também começa nele.
 */
export function getSeasonForDate(date: Date | string, momento: "dia" | "noite" = "dia"): PeriodoLiturgico {
  const periodos = getSeasonsForDate(date);
  if (periodos.length === 1) return periodos[0];

  const quaresma = periodos.find((p) => p.tempo === "quaresma");
  if (quaresma) return momento === "noite" ? periodos.find((p) => p.tempo === "triduo")! : quaresma;
  return periodos.find((p) => p.tempo === "triduo")!;
}

/**
 * Semana do Tempo Comum para uma data (1ª a 34ª), ou null fora dele.
 * A segunda parte é contada de trás para frente: a semana de Cristo Rei é sempre a 34ª.
 */
export function semanaTempoComum(date: Date | string): number | null {
  const dia = normalizarData(date);
  const periodo = getSeasonForDate(dia);
  if (periodo.tempo !== "comum") return null;

  const ano = Number(dia.slice(0, 4));
  const diasDesde = (inicio: string) => Math.floor((paraDate(dia).getTime() - paraDate(inicio).getTime()) / DIA_MS);

  if (periodo.id === "comum-1") {
    // A 1ª semana começa no dia seguinte ao Batismo; a 2ª, no domingo seguinte.
    const segundoDomingo = somarDias(batismoDoSenhor(ano), 7 - diaDaSemana(batismoDoSenhor(ano)));
    return dia < segundoDomingo ? 1 : 2 + Math.floor(diasDesde(segundoDomingo) / 7);
  }

  const cristoRei = somarDias(primeiroDomingoAdvento(ano), -7);
  return 34 - Math.ceil(Math.max(0, paraDate(cristoRei).getTime() - paraDate(dia).getTime()) / DIA_MS / 7);
}

/** Rótulo da semana dentro do tempo (ex.: "31ª semana", "Semana Santa"), ou null no Natal e no Tríduo. */
export function rotuloSemana(date: Date | string): string | null {
  const dia = normalizarData(date);
  const periodo = getSeasonForDate(dia);
  const semanasDesde = (inicio: string) => Math.floor((paraDate(dia).getTime() - paraDate(inicio).getTime()) / DIA_MS / 7) + 1;

  switch (periodo.tempo) {
    case "comum":
      return `${semanaTempoComum(dia)}ª semana`;
    case "advento":
    case "pascal":
      return `${semanasDesde(periodo.inicio)}ª semana`;
    case "quaresma": {
      // Da Quarta-feira de Cinzas ao sábado seguinte, a semana ainda não é numerada.
      const primeiroDomingo = somarDias(periodo.inicio, 4);
      if (dia < primeiroDomingo) return "dias após as Cinzas";
      const semana = semanasDesde(primeiroDomingo);
      return semana === 6 ? "Semana Santa" : `${semana}ª semana`;
    }
    default:
      return null;
  }
}

/** Principais celebrações móveis do ano civil `year`, em ordem cronológica. */
export function celebracoesMoveis(year: number): CelebracaoMovel[] {
  const pascoa = easter(year);
  const advento = primeiroDomingoAdvento(year);
  const p = (dias: number) => somarDias(pascoa, dias);

  const lista: CelebracaoMovel[] = [
    { id: "epifania", nome: "Epifania do Senhor", data: epifania(year), grau: "solenidade", cor: "branco", slug: "epifania" },
    { id: "batismo-do-senhor", nome: "Batismo do Senhor", data: batismoDoSenhor(year), grau: "festa", cor: "branco", slug: "batismo-do-senhor" },
    { id: "cinzas", nome: "Quarta-feira de Cinzas", data: p(-46), grau: "dia santo", cor: "roxo", slug: "quarta-feira-de-cinzas" },
    { id: "ramos", nome: "Domingo de Ramos", data: p(-7), grau: "dia santo", cor: "vermelho", slug: "domingo-de-ramos" },
    { id: "quinta-santa", nome: "Quinta-feira Santa", data: p(-3), grau: "dia santo", cor: "branco", slug: "quinta-feira-santa" },
    { id: "sexta-paixao", nome: "Sexta-feira da Paixão", data: p(-2), grau: "dia santo", cor: "vermelho", slug: "sexta-feira-da-paixao" },
    { id: "sabado-santo", nome: "Sábado Santo", data: p(-1), grau: "dia santo", cor: "branco", slug: "sabado-santo" },
    { id: "pascoa", nome: "Páscoa do Senhor", data: pascoa, grau: "solenidade", cor: "branco", slug: "pascoa" },
    { id: "ascensao", nome: "Ascensão do Senhor", data: p(42), grau: "solenidade", cor: "branco", slug: "ascensao-do-senhor" },
    { id: "pentecostes", nome: "Pentecostes", data: p(49), grau: "solenidade", cor: "vermelho", slug: "pentecostes" },
    { id: "trindade", nome: "Santíssima Trindade", data: p(56), grau: "solenidade", cor: "branco", slug: "santissima-trindade" },
    { id: "corpus-christi", nome: "Corpus Christi", data: p(60), grau: "solenidade", cor: "branco", slug: "corpus-christi" },
    { id: "sagrado-coracao", nome: "Sagrado Coração de Jesus", data: p(68), grau: "solenidade", cor: "branco", slug: "sagrado-coracao-de-jesus" },
    { id: "cristo-rei", nome: "Nosso Senhor Jesus Cristo, Rei do Universo", data: somarDias(advento, -7), grau: "solenidade", cor: "branco", slug: "cristo-rei" },
    { id: "sagrada-familia", nome: "Sagrada Família", data: sagradaFamilia(year), grau: "festa", cor: "branco", slug: "sagrada-familia" },
  ];

  return lista.sort((a, b) => a.data.localeCompare(b.data));
}
