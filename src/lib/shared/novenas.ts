/**
 * Datas das novenas. Uma novena termina na véspera da festa e dura tantos dias quantos
 * tiver (9, a trezena de Santo Antônio 13, a Quaresma de São Miguel 40). As festas móveis
 * vêm do ano litúrgico — a fonte original as cadastrava com data fixa.
 */
import { easter, epifania, primeiroDomingoAdvento, somarDias } from "./anoLiturgico";
import type { DataFixa, FestaMovel, FestaNovena, NovenaResumo, PeriodoNovena } from "@/types/novena";

type DatasNovena = Pick<NovenaResumo, "festa" | "inicio" | "pula_domingos" | "totalDias">;

const DIA_MS = 86_400_000;

const paraUtc = (iso: string) => Date.parse(`${iso}T00:00:00Z`);
const diasEntre = (de: string, ate: string) => Math.round((paraUtc(ate) - paraUtc(de)) / DIA_MS);
const ehDomingo = (iso: string) => new Date(paraUtc(iso)).getUTCDay() === 0;
const isoFixa = (ano: number, { mes, dia }: DataFixa) =>
  `${ano}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;

function festaMovel(festa: FestaMovel, ano: number): string {
  const pascoa = easter(ano);
  switch (festa) {
    case "epifania":
      return epifania(ano);
    case "divina-misericordia":
      return somarDias(pascoa, 7);
    case "pentecostes":
      return somarDias(pascoa, 49);
    case "trindade":
      return somarDias(pascoa, 56);
    case "sagrado-coracao":
      return somarDias(pascoa, 68);
    case "imaculado-coracao":
      return somarDias(pascoa, 69);
    case "cristo-rei":
      return somarDias(primeiroDomingoAdvento(ano), -7);
  }
}

export function dataDaFesta(festa: FestaNovena, ano: number): string {
  return "movel" in festa ? festaMovel(festa.movel, ano) : isoFixa(ano, festa);
}

/** Período da novena cuja festa cai no ano `ano`; null se ela não tem data. */
export function periodoNovena(novena: DatasNovena, ano: number): PeriodoNovena | null {
  if (!novena.festa) return null;
  const festa = dataDaFesta(novena.festa, ano);

  if (!novena.inicio) {
    return { inicio: somarDias(festa, -novena.totalDias), fim: somarDias(festa, -1), festa };
  }

  // Com início próprio, o período vai até a festa inclusive: a Quaresma de São Miguel é
  // sempre de 15/08 a 29/09, e conforme os domingos do ano isso dá 39 ou 40 dias.
  return { inicio: isoFixa(ano, novena.inicio), fim: festa, festa };
}

export interface DiaEmAndamento {
  /** 1-based; null num domingo de novena que não conta os domingos. */
  dia: number | null;
  periodo: PeriodoNovena;
}

/** Dia da novena que se reza em `hoje` (ISO), ou null fora do período. */
export function diaDaNovena(novena: DatasNovena, hoje: string): DiaEmAndamento | null {
  const ano = Number(hoje.slice(0, 4));
  // A novena de uma festa do começo do ano seguinte pode já ter começado em dezembro.
  for (const a of [ano, ano + 1]) {
    const periodo = periodoNovena(novena, a);
    if (!periodo || hoje < periodo.inicio || hoje > periodo.fim) continue;

    if (!novena.pula_domingos) return { dia: diasEntre(periodo.inicio, hoje) + 1, periodo };
    if (ehDomingo(hoje)) return { dia: null, periodo };

    let dia = 0;
    for (let d = periodo.inicio; d <= hoje; d = somarDias(d, 1)) if (!ehDomingo(d)) dia++;
    return { dia: Math.min(dia, novena.totalDias), periodo };
  }
  return null;
}

/** Período em andamento ou o próximo a começar a partir de `hoje`. */
export function proximoPeriodo(novena: DatasNovena, hoje: string): PeriodoNovena | null {
  const ano = Number(hoje.slice(0, 4));
  for (const a of [ano, ano + 1, ano + 2]) {
    const periodo = periodoNovena(novena, a);
    if (!periodo) return null;
    if (periodo.fim >= hoje) return periodo;
  }
  return null;
}

/** Novenas que começam dentro deste prazo contam como "em breve". */
const DIAS_EM_BREVE = 10;

export interface NovenasDeHoje<T> {
  emAndamento: { novena: T; dia: number | null }[];
  /** Ordenadas pela data de início. */
  emBreve: { novena: T; inicio: string }[];
}

/** Separa as novenas que se rezam em `hoje` das que começam nos próximos dias. */
export function novenasDeHoje<T extends DatasNovena>(novenas: T[], hoje: string): NovenasDeHoje<T> {
  const emAndamento: NovenasDeHoje<T>["emAndamento"] = [];
  const emBreve: NovenasDeHoje<T>["emBreve"] = [];
  for (const novena of novenas) {
    const atual = diaDaNovena(novena, hoje);
    if (atual) {
      emAndamento.push({ novena, dia: atual.dia });
      continue;
    }
    const proximo = proximoPeriodo(novena, hoje);
    if (proximo && diasEntre(hoje, proximo.inicio) <= DIAS_EM_BREVE) emBreve.push({ novena, inicio: proximo.inicio });
  }
  emBreve.sort((a, b) => a.inicio.localeCompare(b.inicio));
  return { emAndamento, emBreve };
}

/** Data de hoje (ISO) no fuso de Brasília. */
export function hojeEmBrasilia(agora: Date = new Date()): string {
  const p: Record<string, string> = {};
  new Intl.DateTimeFormat("en-US", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" })
    .formatToParts(agora)
    .forEach((x) => (p[x.type] = x.value));
  return `${p.year}-${p.month}-${p.day}`;
}

const FORMATO_DIA_MES = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long", timeZone: "UTC" });

/** "13 de junho". */
export function formatarDiaMes(iso: string): string {
  return FORMATO_DIA_MES.format(paraUtc(iso));
}

/** "4 a 12 de junho" ou "28 de maio a 5 de junho". */
export function formatarPeriodo({ inicio, fim }: PeriodoNovena): string {
  if (inicio.slice(5, 7) === fim.slice(5, 7)) return `${Number(inicio.slice(8))} a ${formatarDiaMes(fim)}`;
  return `${formatarDiaMes(inicio)} a ${formatarDiaMes(fim)}`;
}
