import novenasData from "@/data/novenas.json";

import { Novena, NovenaResumo } from "@/types/novena";

const TODAS = (novenasData as { novenas: Novena[] }).novenas;

/** Só os campos de listagem: o texto das novenas (~1,5 MB) não vai para o cliente. */
export async function getNovenasResumo(): Promise<NovenaResumo[]> {
  return TODAS.map(({ versoes, ...n }) => ({
    slug: n.slug,
    titulo: n.titulo,
    santo: n.santo,
    descricao: n.descricao,
    imagem_url: n.imagem_url,
    posicao_imagem: n.posicao_imagem,
    festa: n.festa,
    inicio: n.inicio,
    pula_domingos: n.pula_domingos,
    totalDias: versoes[0].dias.length,
  }));
}

export async function getNovenaPorSlug(slug: string): Promise<Novena | null> {
  return TODAS.find((n) => n.slug === slug) ?? null;
}

export async function buscarNovenas(query: string, limite: number): Promise<Novena[]> {
  const normalizar = (t: string) => t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const q = normalizar(query.trim());
  if (!q) return [];
  return TODAS.filter((n) => normalizar(n.santo).includes(q) || normalizar(n.titulo).includes(q)).slice(0, limite);
}
