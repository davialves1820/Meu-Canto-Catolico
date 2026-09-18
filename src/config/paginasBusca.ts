import { RECURSOS } from "@/config/recursos";
import { CATEQUESE } from "@/config/catequese";

export interface PaginaBusca {
  titulo: string;
  descricao: string;
  href: string;
}

const PAGINAS_PRINCIPAIS: PaginaBusca[] = [
  { titulo: "Início", descricao: "Página inicial do Meu Canto Católico.", href: "/" },
  { titulo: "Bíblia", descricao: "Leitura da Bíblia Ave-Maria, livro por livro e capítulo por capítulo.", href: "/biblia" },
  { titulo: "Pesquisar na Bíblia", descricao: "Busque versículos, temas, livros ou capítulos da Bíblia.", href: "/biblia/pesquisa" },
  { titulo: "Liturgia Diária", descricao: "Leituras, salmo e evangelho do dia, com exegese e contexto patrístico.", href: "/liturgia" },
  { titulo: "Orações", descricao: "Livro de orações católicas, organizado por categoria.", href: "/oracoes" },
  { titulo: "Notícias", descricao: "Últimas notícias do Papa e da Igreja Católica, direto do Vatican News.", href: "/noticias" },
  { titulo: "Recursos", descricao: "Todas as ferramentas devocionais do site em um só lugar.", href: "/recursos" },
];

/** Reaproveita o hub de /recursos (Rosário, Confissão, Catequese, Calendário, Santos, Linha do Tempo). */
const PAGINAS_RECURSOS: PaginaBusca[] = RECURSOS.map(({ titulo, descricao, href }) => ({
  titulo,
  descricao,
  href,
}));

/** Deriva do manifesto de catequese — cada novo artigo adicionado lá aparece automaticamente na busca. */
const PAGINAS_CATEQUESE: PaginaBusca[] = CATEQUESE.flatMap((secao) =>
  secao.itens.map((item) => ({
    titulo: item.titulo,
    descricao: `Catequese — ${secao.secao}`,
    href: secao.id === "missa" ? "/catequese/missa" : `/catequese/${secao.id}/${item.slug}`,
  }))
);

export const PAGINAS_BUSCA: PaginaBusca[] = [
  ...PAGINAS_PRINCIPAIS,
  ...PAGINAS_RECURSOS,
  ...PAGINAS_CATEQUESE,
];
