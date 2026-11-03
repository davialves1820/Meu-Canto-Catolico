import { celebracoesMoveis, type TempoId } from "./anoLiturgico";

export type ResultadoBusca =
  | { tipo: "tempo"; id: string; nome: string; tempo: TempoId }
  | { tipo: "celebracao"; id: string; nome: string; data: string };

/** Celebração fixa vinda do calendário anual (ex.: Natal, Assunção). */
export interface CelebracaoFixa {
  nome: string;
  data: string;
}

export const NOMES_TEMPOS: Record<TempoId, string> = {
  advento: "Advento",
  natal: "Natal",
  quaresma: "Quaresma",
  triduo: "Tríduo Pascal",
  pascal: "Tempo Pascal",
  comum: "Tempo Comum",
};

/** Termos alternativos aceitos pela busca, por id de tempo ou de celebração móvel. */
const SINONIMOS: Record<string, string[]> = {
  quaresma: ["quarenta dias"],
  triduo: ["semana santa"],
  pascal: ["tempo da pascoa"],
  comum: ["tempo comum"],
  cinzas: ["cinzas", "quarta de cinzas"],
  ramos: ["ramos", "semana santa"],
  "quinta-santa": ["ceia do senhor", "lava-pes"],
  "sexta-paixao": ["sexta-feira santa", "paixao", "semana santa"],
  "sabado-santo": ["vigilia pascal"],
  pascoa: ["ressurreicao", "domingo de pascoa"],
  pentecostes: ["pentecoste", "espirito santo"],
  "corpus-christi": ["corpus christi", "corpo de deus", "corpo e sangue de cristo"],
  "sagrado-coracao": ["coracao de jesus"],
  "cristo-rei": ["cristo rei", "rei do universo"],
};

/** Minúsculas e sem acentos: "Páscoa" → "pascoa". */
export function normalizarBusca(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

interface ItemIndice {
  resultado: ResultadoBusca;
  termos: string[];
}

/** Índice de busca para um ano: tempos, celebrações móveis e, opcionalmente, celebrações fixas. */
export function criarIndiceBusca(ano: number, fixas: CelebracaoFixa[] = []): ItemIndice[] {
  const tempos: ItemIndice[] = (Object.keys(NOMES_TEMPOS) as TempoId[]).map((tempo) => ({
    resultado: { tipo: "tempo", id: tempo, nome: NOMES_TEMPOS[tempo], tempo },
    termos: [NOMES_TEMPOS[tempo], ...(SINONIMOS[tempo] ?? [])].map(normalizarBusca),
  }));

  const moveis = celebracoesMoveis(ano);
  const datasMoveis = new Set(moveis.map((c) => c.data));

  const celebracoes: ItemIndice[] = [
    ...moveis.map((c) => ({ id: c.id, nome: c.nome, data: c.data })),
    ...fixas
      .filter((f) => !datasMoveis.has(f.data))
      .map((f) => ({ id: `${f.data}-${normalizarBusca(f.nome)}`, nome: f.nome, data: f.data })),
  ].map((c) => ({
    resultado: { tipo: "celebracao", ...c },
    termos: [c.nome, ...(SINONIMOS[c.id] ?? [])].map(normalizarBusca),
  }));

  return [...tempos, ...celebracoes];
}

/**
 * Busca sem diferenciar maiúsculas e acentos. Todas as palavras da consulta precisam
 * aparecer em algum termo; resultados cujo termo começa com a consulta vêm primeiro.
 */
export function buscarNoCalendario(indice: ItemIndice[], consulta: string, limite = 8): ResultadoBusca[] {
  const q = normalizarBusca(consulta);
  if (!q) return [];
  const palavras = q.split(" ");

  const pontuar = ({ termos }: ItemIndice): number => {
    let melhor = -1;
    for (const termo of termos) {
      if (!palavras.every((p) => termo.includes(p))) continue;
      const pontos = termo === q ? 3 : termo.startsWith(q) ? 2 : termo.split(" ").some((t) => t.startsWith(palavras[0])) ? 1 : 0;
      melhor = Math.max(melhor, pontos);
    }
    return melhor;
  };

  return indice
    .map((item) => ({ item, pontos: pontuar(item) }))
    .filter(({ pontos }) => pontos >= 0)
    .sort((a, b) => b.pontos - a.pontos)
    .slice(0, limite)
    .map(({ item }) => item.resultado);
}
