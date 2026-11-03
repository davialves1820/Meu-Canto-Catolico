import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import temposLiturgicos from "../../data/temposLiturgicos.json";
import catecismo from "../../data/catecismo.json";
import { CATEQUESE } from "../../config/catequese";

const RAIZ = path.resolve(__dirname, "../..");
const paragrafos = new Set(JSON.stringify(catecismo).match(/"numero":\d+/g)!.map((m) => Number(m.slice(9))));

/** Confere se o link aponta para uma página que existe no site. */
function existe(href: string): boolean {
  const paragrafo = href.match(/^\/catecismo\/paragrafo\/(\d+)$/);
  if (paragrafo) return paragrafos.has(Number(paragrafo[1]));

  const catequese = href.match(/^\/catequese\/([^/]+)\/([^/]+)$/);
  if (catequese) {
    const secao = CATEQUESE.find((s) => s.id === catequese[1]);
    return !!secao?.itens.some((i) => i.slug === catequese[2]);
  }

  return fs.existsSync(path.join(RAIZ, "app", href, "page.tsx"));
}

describe("temposLiturgicos.json", () => {
  const tempos = Object.entries(temposLiturgicos);

  it("cobre os seis tempos", () => {
    expect(tempos.map(([id]) => id).sort()).toEqual(["advento", "comum", "natal", "pascal", "quaresma", "triduo"]);
  });

  it.each(tempos)("%s: sentido com no máximo ~60 palavras", (_, tempo) => {
    expect(tempo.sentido.split(/\s+/).length).toBeLessThanOrEqual(65);
  });

  it.each(tempos)("%s: todos os links existem no site", (_, tempo) => {
    for (const { href } of tempo.links) expect(existe(href), href).toBe(true);
  });
});
