export type TipoResultadoBusca = "pagina" | "santo" | "novena" | "oracao" | "biblia" | "catecismo";

export interface ResultadoBusca {
  tipo: TipoResultadoBusca;
  titulo: string;
  descricao: string;
  href: string;
}

export interface RespostaBuscaGlobal {
  resultados: ResultadoBusca[];
}
