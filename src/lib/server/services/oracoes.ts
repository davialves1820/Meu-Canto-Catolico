import oracoesData from "@/data/oracoes.json";

import { Oracao } from "@/types/oracao";

const TODAS = (oracoesData as { oracoes: Oracao[] }).oracoes;

export async function getOracoes(): Promise<Oracao[]> {
  return TODAS;
}

export async function getOracaoPorSlug(slug: string): Promise<Oracao | null> {
  return TODAS.find((o) => o.slug === slug) ?? null;
}

/** Outras orações da mesma categoria, em ordem alfabética a partir da atual. */
export async function getOracoesRelacionadas(oracao: Oracao, limite: number): Promise<Oracao[]> {
  const mesmas = TODAS.filter((o) => o.categoria === oracao.categoria).sort((a, b) =>
    a.titulo.localeCompare(b.titulo, "pt-BR", { sensitivity: "base" })
  );
  const i = mesmas.findIndex((o) => o.slug === oracao.slug);
  return [...mesmas.slice(i + 1), ...mesmas.slice(0, i)].slice(0, limite);
}
