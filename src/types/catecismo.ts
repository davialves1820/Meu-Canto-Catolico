export interface NotaCatecismo {
  numero: number;
  texto: string;
}

export type ItemCabecalho =
  | { tipo: "titulo"; nivel: 1 | 2 | 3; texto: string; notas?: NotaCatecismo[] }
  | { tipo: "citacao"; texto: string; notas?: NotaCatecismo[] }
  | { tipo: "tabela"; colunas?: string[]; linhas: string[][]; notas?: NotaCatecismo[] };

export interface ParagrafoCatecismo {
  numero: number;
  /** Títulos, epígrafes e tabelas que antecedem o parágrafo. */
  cabecalho?: ItemCabecalho[];
  /** Blocos separados por "\n\n"; marcadores de nota no formato "[n]". */
  texto: string;
  notas?: NotaCatecismo[];
}

export interface CapituloCatecismo {
  titulo: string;
  paragrafos: ParagrafoCatecismo[];
  /** Conteúdo que vem depois do último parágrafo (ex.: quadro do Credo). */
  apendice?: ItemCabecalho[];
}

export interface ParteCatecismo {
  numero: number;
  titulo: string;
  capitulos: CapituloCatecismo[];
}

export interface DadosCatecismo {
  titulo: string;
  subtitulo: string;
  fonte: string;
  totalParagrafos: number;
  partes: ParteCatecismo[];
}

/** Artigo, parágrafo temático ou seção (I., II.…) dentro de um capítulo. */
export interface DivisaoCatecismo {
  /** Ex.: "Artigo 1", "Parágrafo 3", "II". */
  rotulo: string;
  titulo: string;
  /** Resumo opcional — ex.: a fórmula catequética de cada mandamento. */
  descricao?: string;
  /** Número do primeiro parágrafo da divisão. */
  inicio: number;
  subdivisoes: DivisaoCatecismo[];
}

export interface ResumoCapitulo {
  slug: string;
  titulo: string;
  inicio: number;
  fim: number;
  divisoes: DivisaoCatecismo[];
}

export interface ResumoParte {
  numero: number;
  /** Ex.: "Primeira Parte" (vazio no Prólogo). */
  rotulo: string;
  titulo: string;
  capitulos: ResumoCapitulo[];
}

export interface CapituloComContexto {
  capitulo: CapituloCatecismo & ResumoCapitulo;
  parte: ResumoParte;
  anterior: ResumoCapitulo | null;
  proximo: ResumoCapitulo | null;
}

export interface ResultadoBuscaCatecismo {
  numero: number;
  slug: string;
  capitulo: string;
  trecho: string;
  /** Intervalos [início, fim) das ocorrências da busca dentro do trecho. */
  destaques: [number, number][];
}

export interface PropsPaginaCapituloCatecismo {
  params: Promise<{ capitulo: string }>;
  searchParams: Promise<{ p?: string }>;
}
