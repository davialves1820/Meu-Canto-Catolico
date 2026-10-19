import type { DivisaoCatecismo, ParagrafoCatecismo } from "@/types/catecismo";

const ROTULO_DIVISAO = /^(ARTIGO|PARÁGRAFO) (\d+)$/i;
const SECAO_ROMANA = /^([IVX]+)\.\s+(.+)$/;

/** Palavras que continuam com inicial maiúscula ao converter os títulos em CAIXA ALTA da fonte. */
const MAIUSCULAS = new Set([
  "deus", "cristo", "jesus", "espírito", "pai", "filho", "senhor", "maria", "mãe", "igreja", "trindade",
  "santíssima", "virgem", "israel", "pôncio", "pilatos", "evangelho", "escritura", "testamento",
  "baptismo", "confirmação", "eucaristia", "penitência", "reconciliação", "matrimónio", "ordem",
  "céu", "céus", "terra", "ámen", "amen", "unigénito", "criador", "todopoderoso",
]);
/** Palavras que só ficam maiúsculas ao lado de outra: "Espírito Santo", "Sagrada Escritura", "Pai Nosso". */
const MAIUSCULAS_DEPOIS = new Map([["santo", "espírito"], ["nosso", "pai"], ["pascal", "mistério"]]);
const MAIUSCULAS_ANTES = new Map([["sagrada", "escritura"], ["antigo", "testamento"], ["novo", "testamento"], ["mistério", "pascal"]]);

const capitalizar = (palavra: string) => palavra.replace(/\p{L}/u, (c) => c.toUpperCase());

/** "O PRIMEIRO MANDAMENTO" → "O primeiro mandamento"; "CREIO EM DEUS PAI" → "Creio em Deus Pai". */
export function tituloLegivel(texto: string): string {
  if (texto !== texto.toUpperCase()) {
    return texto;
  }
  const palavras = texto.toLowerCase().split(" ");
  const limpa = (p: string | undefined) => (p ?? "").replace(/[^\p{L}]/gu, "");
  return palavras
    .map((p, i) => {
      const atual = limpa(p);
      const deveCapitalizar =
        i === 0 ||
        MAIUSCULAS.has(atual) ||
        MAIUSCULAS_DEPOIS.get(atual) === limpa(palavras[i - 1]) ||
        MAIUSCULAS_ANTES.get(atual) === limpa(palavras[i + 1]);
      return deveCapitalizar ? capitalizar(p) : p;
    })
    .join(" ");
}

/**
 * Monta a árvore de divisões de um capítulo a partir dos títulos da fonte:
 * Artigos → Parágrafos temáticos → seções I., II.… dentro deles.
 * Capítulos sem artigos usam as seções romanas como primeiro nível.
 */
export function montarDivisoes(paragrafos: ParagrafoCatecismo[]): DivisaoCatecismo[] {
  const artigos: DivisaoCatecismo[] = [];
  const romanas: DivisaoCatecismo[] = [];
  let artigo: DivisaoCatecismo | null = null;
  let paragrafo: DivisaoCatecismo | null = null;

  for (const p of paragrafos) {
    const titulos = (p.cabecalho ?? []).filter((c) => c.tipo === "titulo");

    titulos.forEach((titulo, i) => {
      const rotulo = titulo.nivel === 1 ? titulo.texto.match(ROTULO_DIVISAO) : null;
      if (rotulo) {
        const prox = titulos[i + 1];
        const nome = prox && prox.nivel === 1 && !ROTULO_DIVISAO.test(prox.texto) ? prox.texto : "";
        const divisao: DivisaoCatecismo = {
          rotulo: `${capitalizar(rotulo[1].toLowerCase())} ${rotulo[2]}`,
          titulo: tituloLegivel(nome),
          inicio: p.numero,
          subdivisoes: [],
        };
        if (/^artigo$/i.test(rotulo[1])) {
          artigos.push(divisao);
          artigo = divisao;
          paragrafo = null;
        } else {
          (artigo ? artigo.subdivisoes : artigos).push(divisao);
          paragrafo = divisao;
        }
        return;
      }

      const romana = titulo.nivel === 2 ? titulo.texto.match(SECAO_ROMANA) : null;
      if (romana) {
        const secao: DivisaoCatecismo = { rotulo: romana[1], titulo: romana[2], inicio: p.numero, subdivisoes: [] };
        const dono = paragrafo ?? artigo;
        if (dono) {
          dono.subdivisoes.push(secao);
        } else {
          romanas.push(secao);
        }
      }
    });
  }

  return artigos.length > 0 ? artigos : romanas;
}
