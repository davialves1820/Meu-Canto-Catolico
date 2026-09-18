export type TipoResultadoBusca = "pagina" | "santo" | "oracao" | "biblia";

export interface ResultadoBusca {
  tipo: TipoResultadoBusca;
  titulo: string;
  descricao: string;
  href: string;
}

export interface RespostaBuscaGlobal {
  resultados: ResultadoBusca[];
}
