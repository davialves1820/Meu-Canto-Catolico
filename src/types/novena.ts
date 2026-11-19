/** Festas móveis calculadas a cada ano a partir da Páscoa, da Epifania ou do Advento. */
export type FestaMovel =
  | "epifania"
  | "divina-misericordia"
  | "pentecostes"
  | "trindade"
  | "sagrado-coracao"
  | "imaculado-coracao"
  | "cristo-rei";

export interface DataFixa {
  mes: number;
  dia: number;
}

export type FestaNovena = DataFixa | { movel: FestaMovel };

export interface DiaNovena {
  titulo: string;
  /** Markdown. */
  texto: string;
}

export interface VersaoNovena {
  id: string;
  nome: string;
  oracao_inicial?: string;
  oracao_final?: string;
  dias: DiaNovena[];
}

export interface Novena {
  slug: string;
  titulo: string;
  santo: string;
  descricao: string;
  imagem_url?: string;
  posicao_imagem?: string;
  martir?: boolean;
  /** Ausente nas novenas que se rezam em qualquer época do ano. */
  festa?: FestaNovena;
  /** Quando a novena não termina na véspera da festa (ex.: Quaresma de São Miguel). */
  inicio?: DataFixa;
  /** Domingos não contam como dia da novena. */
  pula_domingos?: boolean;
  versoes: VersaoNovena[];
}

export type NovenaResumo = Pick<
  Novena,
  "slug" | "titulo" | "santo" | "descricao" | "imagem_url" | "posicao_imagem" | "festa" | "inicio" | "pula_domingos"
> & { totalDias: number };

/** Período da novena em um ano, com datas ISO "YYYY-MM-DD". */
export interface PeriodoNovena {
  inicio: string;
  fim: string;
  festa: string;
}

export interface PropsPaginaDetalheNovena {
  params: Promise<{ slug: string }>;
}

export interface PropsNovenasView {
  novenas: NovenaResumo[];
  /** Ano usado para posicionar as festas móveis na lista. */
  ano: number;
}

export interface PropsCartaoNovena {
  novena: NovenaResumo;
  /** Linha curta acima do nome (ex.: "Festa: 13 de junho"). */
  detalhe?: string;
  /** Dia em andamento hoje (1-based), quando a novena está sendo rezada. */
  diaAtual?: number;
}

export interface PropsLeitorNovena {
  novena: Novena;
}

export interface PropsTextoNovena {
  texto: string;
  capitular?: boolean;
}
