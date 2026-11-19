import { describe, expect, it } from "vitest";
import novenasData from "../../data/novenas.json";
import { dataDaFesta, diaDaNovena, formatarPeriodo, hojeEmBrasilia, periodoNovena, proximoPeriodo } from "./novenas";
import type { Novena } from "@/types/novena";

const novenas = (novenasData as { novenas: Novena[] }).novenas;
const resumo = (slug: string) => {
  const n = novenas.find((x) => x.slug === slug)!;
  return { ...n, totalDias: n.versoes[0].dias.length };
};

describe("dataDaFesta", () => {
  it("calcula as festas móveis de 2026", () => {
    expect(dataDaFesta({ movel: "epifania" }, 2026)).toBe("2026-01-04");
    expect(dataDaFesta({ movel: "divina-misericordia" }, 2026)).toBe("2026-04-12");
    expect(dataDaFesta({ movel: "pentecostes" }, 2026)).toBe("2026-05-24");
    expect(dataDaFesta({ movel: "trindade" }, 2026)).toBe("2026-05-31");
    expect(dataDaFesta({ movel: "sagrado-coracao" }, 2026)).toBe("2026-06-12");
    expect(dataDaFesta({ movel: "imaculado-coracao" }, 2026)).toBe("2026-06-13");
    expect(dataDaFesta({ movel: "cristo-rei" }, 2026)).toBe("2026-11-22");
  });
});

describe("periodoNovena", () => {
  it("termina na véspera da festa", () => {
    expect(periodoNovena(resumo("nossa-senhora-aparecida"), 2026)).toEqual({
      inicio: "2026-10-03",
      fim: "2026-10-11",
      festa: "2026-10-12",
    });
  });

  it("começa na Sexta-feira Santa para a Divina Misericórdia", () => {
    expect(periodoNovena(resumo("divina-misericordia"), 2026)?.inicio).toBe("2026-04-03");
  });

  it("dura 13 dias na trezena de Santo Antônio", () => {
    expect(periodoNovena(resumo("santo-antonio"), 2026)).toMatchObject({ inicio: "2026-05-31", fim: "2026-06-12" });
  });

  it("pula os domingos na Quaresma de São Miguel e termina na festa", () => {
    expect(periodoNovena(resumo("quaresma-de-sao-miguel-arcanjo"), 2026)).toMatchObject({
      inicio: "2026-08-15",
      fim: "2026-09-29",
    });
  });

  it("é null para novenas sem data", () => {
    expect(periodoNovena(resumo("sao-jose"), 2026)).toBeNull();
  });
});

describe("diaDaNovena", () => {
  it("conta o dia em andamento", () => {
    expect(diaDaNovena(resumo("nossa-senhora-aparecida"), "2026-10-03")?.dia).toBe(1);
    expect(diaDaNovena(resumo("nossa-senhora-aparecida"), "2026-10-11")?.dia).toBe(9);
    expect(diaDaNovena(resumo("nossa-senhora-aparecida"), "2026-10-12")).toBeNull();
  });

  it("acha a novena de uma festa de janeiro que começou em dezembro", () => {
    expect(diaDaNovena(resumo("santa-maria-mae-de-deus"), "2026-12-23")).toMatchObject({
      dia: 1,
      periodo: { festa: "2027-01-01" },
    });
  });

  it("não conta domingos na Quaresma de São Miguel", () => {
    // 15/08/2026 é sábado e 16/08 é domingo.
    expect(diaDaNovena(resumo("quaresma-de-sao-miguel-arcanjo"), "2026-08-15")?.dia).toBe(1);
    expect(diaDaNovena(resumo("quaresma-de-sao-miguel-arcanjo"), "2026-08-16")?.dia).toBeNull();
    expect(diaDaNovena(resumo("quaresma-de-sao-miguel-arcanjo"), "2026-08-17")?.dia).toBe(2);
    // Em 2026 há 7 domingos no período: o último dia é o 39º.
    expect(diaDaNovena(resumo("quaresma-de-sao-miguel-arcanjo"), "2026-09-29")?.dia).toBe(39);
    expect(diaDaNovena(resumo("quaresma-de-sao-miguel-arcanjo"), "2026-09-30")).toBeNull();
  });
});

describe("proximoPeriodo", () => {
  it("passa para o ano seguinte depois da festa", () => {
    expect(proximoPeriodo(resumo("nossa-senhora-aparecida"), "2026-10-20")?.festa).toBe("2027-10-12");
  });
});

describe("formatação", () => {
  it("formata o período no mesmo mês e entre meses", () => {
    expect(formatarPeriodo({ inicio: "2026-06-04", fim: "2026-06-12", festa: "2026-06-13" })).toBe("4 a 12 de junho");
    expect(formatarPeriodo({ inicio: "2026-05-31", fim: "2026-06-12", festa: "2026-06-13" })).toBe(
      "31 de maio a 12 de junho"
    );
  });

  it("usa o fuso de Brasília", () => {
    expect(hojeEmBrasilia(new Date("2026-11-20T02:00:00Z"))).toBe("2026-11-19");
  });
});

describe("novenas.json", () => {
  it("tem slugs únicos e todos os dias preenchidos", () => {
    expect(new Set(novenas.map((n) => n.slug)).size).toBe(novenas.length);
    for (const n of novenas) {
      expect(n.versoes.length, n.slug).toBeGreaterThan(0);
      for (const v of n.versoes) for (const d of v.dias) expect(d.texto.trim(), `${n.slug}/${v.id}`).not.toBe("");
    }
  });

  it("não traz HTML cru", () => {
    expect(JSON.stringify(novenasData)).not.toMatch(/<\/?(p|div|span|h\d|br)\b/);
  });
});
