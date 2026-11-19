/**
 * Plugin rehype que transforma o nome das orações básicas citadas num texto ("Três
 * Ave-Marias e um Glória") em links para a página de cada uma (/oracoes/ave-maria).
 * Não mexe em títulos nem em links que já existem.
 */

interface NoTexto {
  type: "text";
  value: string;
}

interface NoElemento {
  type: "element";
  tagName: string;
  properties: Record<string, unknown>;
  children: No[];
}

type No = NoTexto | NoElemento | { type: string; children?: No[] };

/** Ordem importa: "Glória ao Pai" antes de "Glória" sozinho. */
const ORACOES: { padrao: RegExp; slug: string }[] = [
  { padrao: /\bPai[- ][Nn]ossos?\b/, slug: "pai-nosso" },
  { padrao: /\bAve[- ]Marias?\b/, slug: "ave-maria" },
  { padrao: /\bGlória ao Pai\b/, slug: "gloria-ao-pai" },
  // "Glória" sozinho só como nome da oração: maiúsculo e seguido de pontuação ("e um Glória.").
  { padrao: /\bGlórias?(?=\s*[.,;:)]|\s*$)/, slug: "gloria-ao-pai" },
  { padrao: /\bSalve[- ]Rainha\b/, slug: "salve-rainha" },
  { padrao: /\bCredo\b/, slug: "simbolo-dos-apostolos" },
  { padrao: /\b[Ss]inal da [Cc]ruz\b/, slug: "sinal-da-cruz" },
];

const PADRAO_GERAL = new RegExp(ORACOES.map((o) => o.padrao.source).join("|"), "gu");
const IGNORAR = new Set(["a", "h1", "h2", "h3", "h4", "h5", "h6"]);

function slugDe(trecho: string): string | null {
  return ORACOES.find((o) => new RegExp(`^(?:${o.padrao.source})$`, "u").test(trecho))?.slug ?? null;
}

function dividir(texto: string): No[] {
  const partes: No[] = [];
  let ultimo = 0;
  for (const m of texto.matchAll(PADRAO_GERAL)) {
    const slug = slugDe(m[0]);
    if (!slug) continue;
    if (m.index > ultimo) partes.push({ type: "text", value: texto.slice(ultimo, m.index) });
    partes.push({
      type: "element",
      tagName: "a",
      properties: { href: `/oracoes/${slug}` },
      children: [{ type: "text", value: m[0] }],
    });
    ultimo = m.index + m[0].length;
  }
  if (!partes.length) return [{ type: "text", value: texto }];
  if (ultimo < texto.length) partes.push({ type: "text", value: texto.slice(ultimo) });
  return partes;
}

function percorrer(no: No) {
  if (!("children" in no) || !no.children) return;
  if (no.type === "element" && IGNORAR.has((no as NoElemento).tagName)) return;
  no.children = no.children.flatMap((filho) => {
    if (filho.type === "text") return dividir((filho as NoTexto).value);
    percorrer(filho);
    return [filho];
  });
}

export function rehypeLinksOracoes() {
  return (arvore: No) => percorrer(arvore);
}

/** Exposto para teste. */
export const linksOracoesEmTexto = dividir;
