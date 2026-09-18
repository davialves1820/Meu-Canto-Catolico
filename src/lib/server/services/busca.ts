import oracoesData from "@/data/oracoes.json";

import { PAGINAS_BUSCA } from "@/config/paginasBusca";
import { CONFIG_CAT, Oracao } from "@/types/oracao";
import { ResultadoBusca } from "@/types/busca";
import { getSantos } from "./santos";
import { pesquisarBiblia } from "./biblia";

const TODAS_ORACOES = (oracoesData as { oracoes: Oracao[] }).oracoes;
const LIMITE_POR_CATEGORIA = 5;

function normalizar(texto: string): string {
  return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function buscarPaginas(q: string): ResultadoBusca[] {
  return PAGINAS_BUSCA.filter(
    (p) => normalizar(p.titulo).includes(q) || normalizar(p.descricao).includes(q)
  )
    .slice(0, LIMITE_POR_CATEGORIA)
    .map((p) => ({ tipo: "pagina" as const, titulo: p.titulo, descricao: p.descricao, href: p.href }));
}

async function buscarSantos(query: string): Promise<ResultadoBusca[]> {
  const { santos } = await getSantos({ busca: query, porPagina: LIMITE_POR_CATEGORIA });
  return santos.map((s) => ({
    tipo: "santo" as const,
    titulo: s.nome,
    descricao: s.data_festa ? `Santo — festa em ${s.data_festa}` : "Santo",
    href: `/santos/${s.slug}`,
  }));
}

function buscarOracoes(q: string): ResultadoBusca[] {
  const encontradas = TODAS_ORACOES.filter((o) => normalizar(o.titulo).includes(q)).slice(0, LIMITE_POR_CATEGORIA);

  return encontradas.reduce<ResultadoBusca[]>((acc, oracao) => {
    const slugCategoria = CONFIG_CAT[oracao.categoria]?.slug;
    if (!slugCategoria) return acc;
    acc.push({
      tipo: "oracao",
      titulo: oracao.titulo,
      descricao: `Oração — ${oracao.categoria}`,
      href: `/oracoes/${slugCategoria}`,
    });
    return acc;
  }, []);
}

async function buscarBiblia(query: string): Promise<ResultadoBusca[]> {
  // Full-text scan em ~31k versículos — só compensa com termos a partir de 3 letras.
  if (query.trim().length < 3) return [];

  const versiculos = await pesquisarBiblia(query);
  return versiculos.slice(0, LIMITE_POR_CATEGORIA).map((v) => ({
    tipo: "biblia" as const,
    titulo: `${v.book} ${v.chapter},${v.verse}`,
    descricao: v.text,
    href: `/biblia/${encodeURIComponent(v.book)}/${v.chapter}?v=${v.verse}`,
  }));
}

export async function buscaGlobal(query: string): Promise<ResultadoBusca[]> {
  const q = normalizar(query.trim());
  if (!q) return [];

  const [paginas, santos, oracoes, biblia] = await Promise.all([
    Promise.resolve(buscarPaginas(q)),
    buscarSantos(query),
    Promise.resolve(buscarOracoes(q)),
    buscarBiblia(query),
  ]);

  return [...paginas, ...santos, ...oracoes, ...biblia];
}
