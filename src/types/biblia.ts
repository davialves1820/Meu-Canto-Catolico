export type Tema = "pergaminho" | "escuro" | "claro";
export type TamanhoFonte = 14 | 16 | 18 | 20 | 22 | 24;
export type ModoLeitura = "paginado" | "continuo";

export interface Versiculo {
  versiculo: number;
  texto: string;
}

export interface Capitulo {
  capitulo: number;
  versiculos: Versiculo[];
}

export interface Livro {
  nome: string;
  capitulos: Capitulo[];
}

export interface TokensTema {
  bg: string;
  container: string;
  texto: string;
  muted: string;
  borda: string;
  barraFerramentas: string;
  versiculo: string;
  destaque: string;
}

export const TEMAS: Record<Tema, TokensTema> = {
  pergaminho: {
    bg: "hsl(40,35%,88%)",
    container: "text-[#2a1d0b]",
    texto: "text-[#2a1d0b]",
    muted: "text-[#5f5038]",
    borda: "border-[#b8954a66]",
    barraFerramentas: "bg-[#e6dcc2] border-[#b8954a88]",
    versiculo: "hover:bg-[#b8954a22]",
    destaque: "bg-[#c8960c33] border-l-4 border-[#a87400]",
  },
  escuro: {
    bg: "hsl(30,14%,9%)",
    container: "text-[#f5efe4]",
    texto: "text-[#f5efe4]",
    muted: "text-[#b0a48f]",
    borda: "border-[#4a423280]",
    barraFerramentas: "bg-[#1f1a15] border-[#4a4232]",
    versiculo: "hover:bg-[#3a332a80]",
    destaque: "bg-[#c8960c33] border-l-4 border-[#d4a017]",
  },
  claro: {
    bg: "#ffffff",
    container: "text-slate-900",
    texto: "text-slate-900",
    muted: "text-slate-500",
    borda: "border-slate-300",
    barraFerramentas: "bg-white border-slate-300",
    versiculo: "hover:bg-slate-100",
    destaque: "bg-amber-200 border-l-4 border-amber-600",
  },
};

export const LABELS_TEMA: Record<Tema, string> = {
  pergaminho: "Sépia",
  escuro: "Noite",
  claro: "Dia",
};

export const TAMANHO_FONTE_MIN: TamanhoFonte = 14;
export const TAMANHO_FONTE_MAX: TamanhoFonte = 24;
export const TAMANHO_FONTE_PASSO = 2;

export interface DadosBiblia {
  antigoTestamento: Livro[];
  novoTestamento: Livro[];
}

export interface PropsBookCard {
  name: string;
  chapters: number;
}

/** Só o que a grade de livros mostra: o texto dos versículos não vai para o cliente. */
export interface ResumoLivro {
  nome: string;
  totalCapitulos: number;
}

export interface PropsBooksGrid {
  title: string;
  subtitle: string;
  books: ResumoLivro[];
}

export interface PropsItemVersiculo {
  versiculo: Versiculo;
  t: TokensTema;
  tamanhoFonte: number;
  ehPrimeiro: boolean;
  estaDestacado: boolean;
  refVersiculo: (el: HTMLElement | null) => void;
}

export interface PropsBotaoBarraFerramentas {
  onClick: () => void;
  active?: boolean;
  label: string;
  children: React.ReactNode;
}

export interface PropsSumario {
  t: TokensTema;
  capitulos: Capitulo[];
  indexAtual: number;
  estaAberto: boolean;
  aoFechar: () => void;
  aoSelecionar: (index: number) => void;
}

export interface PropsPainelConfiguracoes {
  t: TokensTema;
  estaAberto: boolean;
  tamanhoFonte: TamanhoFonte;
  tema: Tema;
  bg: string;
  aoMudarTamanhoFonte: (s: TamanhoFonte) => void;
  aoMudarTema: (th: Tema) => void;
}

export interface PropsBarraFerramentasLeitor {
  t: TokensTema;
  nomeLivro: string;
  numeroCapitulo: number;
  quantidadeVersiculos: number;
  modoLeitura: ModoLeitura;
  exibirSumario: boolean;
  exibirConfiguracoes: boolean;
  exibirBusca: boolean;
  aoAlternarSumario: () => void;
  aoAlternarConfiguracoes: () => void;
  aoAlternarModoLeitura: () => void;
  aoAlternarBusca: () => void;
}

export interface PropsBuscaVersiculo {
  t: TokensTema;
  livro: Livro;
  indexCapituloAtual: number;
  estaAberto: boolean;
  aoFechar: () => void;
  aoIrPara: (indexCapitulo: number, versiculo?: number) => void;
}

export interface PropsBarraProgressoLeitor {
  atual: number;
  total: number;
}

export interface PropsRodapeNavegacao {
  t: TokensTema;
  indexCapitulo: number;
  total: number;
  temProximo: boolean;
  temAnterior: boolean;
  aoAnterior: () => void;
  aoProximo: () => void;
}

export interface PropsCabecalhoCapitulo {
  t: TokensTema;
  nomeLivro: string;
  numeroCapitulo: number;
}

export interface PropsConteudoCapitulo {
  livro: Livro;
  indexCapitulo: number;
  direcao: 1 | -1;
  tamanhoFonte: TamanhoFonte;
  t: TokensTema;
  modoLeitura: ModoLeitura;
  versiculoDestaque: number | undefined;
  refsVersiculo: React.MutableRefObject<Map<number, HTMLElement>>;
}

export interface PropsLeitorBiblia {
  livro: Livro;
  indexCapituloInicial: number;
  versiculoDestaque?: number;
}

export interface PropsPaginaCapitulo {
  params: Promise<{ book: string; chapter: string }>;
  searchParams: Promise<{ v?: string }>;
}
