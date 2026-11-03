import { DateTime } from "luxon";
import { type TempoId } from "@/lib/shared/anoLiturgico";

export interface DadosDiaLiturgico {
  chave: string;
  nome: string;
  rank: string;
  nomeRank: string;
  cores: string[];
  nomesCores: string[];
  temporadas: string[];
  nomesTemporadas: string[];
}

export interface EntradaDiaJson {
  nome: string;
  cor: string;
  rank: string;
  temporada: string;
}

export type ModoVisualizacao = "grade" | "lista";

export interface EstadoCalendario {
  /* estado atual */
  dataAtual: DateTime;
  diaSelecionado: string | null;
  modoVisualizacao: ModoVisualizacao;
  estaMontado: boolean;
  tempoFiltro: TempoId | null;
  /** Dia realçado temporariamente após uma busca. */
  diaDestacado: string | null;
  anosDisponiveis: number[];

  /* derivados */
  rotuloMes: string;
  diasNoMes: { data: DateTime; ehMesAtual: boolean }[];
  listaDias: DateTime[];
  dadosSelecionados: DadosDiaLiturgico[] | null;

  /* ações */
  irAnterior: () => void;
  irProximo: () => void;
  irHoje: () => void;
  selecionarDia: (dateStr: string) => void;
  limparDia: () => void;
  setModoVisualizacao: (m: ModoVisualizacao) => void;
  selecionarTempo: (tempo: TempoId | null) => void;
  mudarAno: (ano: number) => void;
  irParaMes: (dateStr: string) => void;
  irParaData: (dateStr: string) => void;
}

export interface CelulaDia {
  data: DateTime;
  ehMesAtual: boolean;
}

export interface PropsBarraLateralDia {
  diaSelecionado: string | null;
  dadosSelecionados: DadosDiaLiturgico[] | null;
}

export interface PropsDrawerDia {
  diaSelecionado: string | null;
  dadosSelecionados: DadosDiaLiturgico[] | null;
  aoFechar: () => void;
}

export interface PropsVisualizacaoCalendario {
  calendarioInicial: Record<string, DadosDiaLiturgico[]>;
}

export interface PropsVisualizacaoListaCalendario {
  dias: DateTime[];
  calendario: Record<string, DadosDiaLiturgico[]>;
  diaSelecionado: string | null;
  estaMontado: boolean;
  rotuloMes: string;
  tempoFiltro: TempoId | null;
  diaDestacado: string | null;
  aoSelecionarDia: (dateStr: string) => void;
}

export interface PropsCabecalhoCalendario {
  rotuloMes: string;
  modoVisualizacao: ModoVisualizacao;
  aoAnterior: () => void;
  aoProximo: () => void;
  aoHoje: () => void;
  aoMudarModo: (m: ModoVisualizacao) => void;
}

export interface PropsVisualizacaoGradeCalendario {
  dias: CelulaDia[];
  calendario: Record<string, DadosDiaLiturgico[]>;
  diaSelecionado: string | null;
  estaMontado: boolean;
  rotuloMes: string;
  tempoFiltro: TempoId | null;
  diaDestacado: string | null;
  aoSelecionarDia: (dateStr: string) => void;
}
