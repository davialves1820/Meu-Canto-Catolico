import { describe, expect, it } from "vitest";
import {
  batismoDoSenhor,
  celebracoesMoveis,
  easter,
  epifania,
  getSeasonForDate,
  getSeasonsForDate,
  liturgicalSeasons,
  primeiroDomingoAdvento,
  rotuloSemana,
  semanaTempoComum,
} from "./anoLiturgico";

const periodo = (ano: number, id: string) => liturgicalSeasons(ano).find((p) => p.id === id)!;
const celebracao = (ano: number, id: string) => celebracoesMoveis(ano).find((c) => c.id === id)!;

describe("easter", () => {
  it.each([
    [2024, "2024-03-31"],
    [2025, "2025-04-20"],
    [2026, "2026-04-05"],
    [2027, "2027-03-28"],
    [2029, "2029-04-01"],
    [2038, "2038-04-25"],
  ])("Páscoa de %i em %s", (ano, data) => {
    expect(easter(ano)).toBe(data);
  });
});

describe("liturgicalSeasons — 2026", () => {
  const ano = 2026;

  it("calcula os marcos pedidos", () => {
    expect(periodo(ano, "quaresma").inicio).toBe("2026-02-18");
    expect(easter(ano)).toBe("2026-04-05");
    expect(periodo(ano, "pascal").fim).toBe("2026-05-24");
    expect(periodo(ano, "advento").inicio).toBe("2026-11-29");
  });

  it("retorna os oito períodos em ordem, sem buracos", () => {
    const periodos = liturgicalSeasons(ano);
    expect(periodos.map((p) => p.id)).toEqual([
      "natal-inicio",
      "comum-1",
      "quaresma",
      "triduo",
      "pascal",
      "comum-2",
      "advento",
      "natal-fim",
    ]);
    expect(periodos[0].inicio).toBe("2026-01-01");
    expect(periodos.at(-1)!.fim).toBe("2026-12-31");
  });

  it("aplica a regra do Brasil para Epifania e Batismo", () => {
    expect(epifania(ano)).toBe("2026-01-04");
    expect(batismoDoSenhor(ano)).toBe("2026-01-11");
    expect(periodo(ano, "natal-inicio").fim).toBe("2026-01-11");
    expect(periodo(ano, "comum-1").inicio).toBe("2026-01-12");
  });

  it("marca Gaudete e Laetare com rosa opcional", () => {
    expect(periodo(ano, "advento").domingosRosa).toEqual([{ nome: "Gaudete", data: "2026-12-13", cor: "rosa", corOpcional: true }]);
    expect(periodo(ano, "quaresma").domingosRosa).toEqual([{ nome: "Laetare", data: "2026-03-15", cor: "rosa", corOpcional: true }]);
  });

  it("trata a Quinta-feira Santa como Quaresma (manhã) e Tríduo (noite)", () => {
    expect(periodo(ano, "quaresma")).toMatchObject({ fim: "2026-04-02", fimParcial: "manha" });
    expect(periodo(ano, "triduo")).toMatchObject({ inicio: "2026-04-02", inicioParcial: "noite", fim: "2026-04-05" });

    expect(getSeasonsForDate("2026-04-02").map((p) => p.tempo)).toEqual(["quaresma", "triduo"]);
    expect(getSeasonForDate("2026-04-02").tempo).toBe("quaresma");
    expect(getSeasonForDate("2026-04-02", "noite").tempo).toBe("triduo");
  });

  it("coloca o Domingo de Páscoa no Tríduo e no início do Tempo Pascal", () => {
    expect(getSeasonsForDate("2026-04-05").map((p) => p.tempo)).toEqual(["triduo", "pascal"]);
    expect(getSeasonForDate("2026-04-05").tempo).toBe("triduo");
    expect(getSeasonForDate("2026-04-06").tempo).toBe("pascal");
  });
});

describe("liturgicalSeasons — 2029 (Epifania em 7 de janeiro)", () => {
  it("move o Batismo do Senhor para a segunda-feira", () => {
    expect(epifania(2029)).toBe("2029-01-07");
    expect(batismoDoSenhor(2029)).toBe("2029-01-08");
    expect(periodo(2029, "comum-1").inicio).toBe("2029-01-09");
  });

  it("calcula Cinzas, Pentecostes e Advento", () => {
    expect(periodo(2029, "quaresma").inicio).toBe("2029-02-14");
    expect(periodo(2029, "pascal").fim).toBe("2029-05-20");
    expect(primeiroDomingoAdvento(2029)).toBe("2029-12-02");
  });
});

describe("liturgicalSeasons — 2023 (Epifania em 8 de janeiro)", () => {
  it("move o Batismo do Senhor para a segunda-feira", () => {
    expect(epifania(2023)).toBe("2023-01-08");
    expect(batismoDoSenhor(2023)).toBe("2023-01-09");
  });
});

describe("liturgicalSeasons — 2027", () => {
  it("calcula os marcos", () => {
    expect(epifania(2027)).toBe("2027-01-03");
    expect(batismoDoSenhor(2027)).toBe("2027-01-10");
    expect(periodo(2027, "quaresma").inicio).toBe("2027-02-10");
    expect(periodo(2027, "pascal").fim).toBe("2027-05-16");
    expect(primeiroDomingoAdvento(2027)).toBe("2027-11-28");
  });
});

describe("getSeasonForDate", () => {
  it.each([
    ["2026-01-01", "natal"],
    ["2026-02-17", "comum"],
    ["2026-02-18", "quaresma"],
    ["2026-04-03", "triduo"],
    ["2026-05-24", "pascal"],
    ["2026-05-25", "comum"],
    ["2026-11-28", "comum"],
    ["2026-11-29", "advento"],
    ["2026-12-25", "natal"],
  ])("%s → %s", (data, tempo) => {
    expect(getSeasonForDate(data).tempo).toBe(tempo);
  });

  it("aceita Date", () => {
    expect(getSeasonForDate(new Date(2026, 2, 1)).tempo).toBe("quaresma");
  });
});

describe("semanaTempoComum", () => {
  it("conta a primeira parte a partir do Batismo", () => {
    expect(semanaTempoComum("2026-01-12")).toBe(1);
    expect(semanaTempoComum("2026-01-18")).toBe(2);
  });

  it("conta a segunda parte de trás para frente (Cristo Rei = 34ª)", () => {
    expect(semanaTempoComum("2026-11-22")).toBe(34);
    expect(semanaTempoComum("2026-11-28")).toBe(34);
    expect(semanaTempoComum("2026-11-21")).toBe(33);
    expect(semanaTempoComum("2026-11-03")).toBe(31);
  });

  it("retorna null fora do Tempo Comum", () => {
    expect(semanaTempoComum("2026-03-01")).toBeNull();
  });
});

describe("rotuloSemana", () => {
  it.each([
    ["2026-11-03", "31ª semana"],
    ["2026-11-29", "1ª semana"],
    ["2026-12-14", "3ª semana"],
    ["2026-02-19", "dias após as Cinzas"],
    ["2026-02-22", "1ª semana"],
    ["2026-03-30", "Semana Santa"],
    ["2026-04-12", "2ª semana"],
  ])("%s → %s", (data, rotulo) => {
    expect(rotuloSemana(data)).toBe(rotulo);
  });

  it("retorna null no Natal e no Tríduo", () => {
    expect(rotuloSemana("2026-12-26")).toBeNull();
    expect(rotuloSemana("2026-04-03")).toBeNull();
  });
});

describe("celebracoesMoveis", () => {
  it("gera as celebrações de 2026", () => {
    const esperado: Record<string, string> = {
      epifania: "2026-01-04",
      "batismo-do-senhor": "2026-01-11",
      cinzas: "2026-02-18",
      ramos: "2026-03-29",
      "quinta-santa": "2026-04-02",
      "sexta-paixao": "2026-04-03",
      "sabado-santo": "2026-04-04",
      pascoa: "2026-04-05",
      ascensao: "2026-05-17",
      pentecostes: "2026-05-24",
      trindade: "2026-05-31",
      "corpus-christi": "2026-06-04",
      "sagrado-coracao": "2026-06-12",
      "cristo-rei": "2026-11-22",
      "sagrada-familia": "2026-12-27",
    };
    const lista = celebracoesMoveis(2026);
    expect(Object.fromEntries(lista.map((c) => [c.id, c.data]))).toEqual(esperado);
    expect(lista.map((c) => c.data)).toEqual([...lista.map((c) => c.data)].sort());
  });

  it("gera as celebrações de 2027", () => {
    expect(celebracao(2027, "cinzas").data).toBe("2027-02-10");
    expect(celebracao(2027, "ascensao").data).toBe("2027-05-09");
    expect(celebracao(2027, "corpus-christi").data).toBe("2027-05-27");
    expect(celebracao(2027, "cristo-rei").data).toBe("2027-11-21");
    expect(celebracao(2027, "sagrada-familia").data).toBe("2027-12-26");
  });

  it("usa 30/12 para a Sagrada Família quando o Natal é domingo (2022)", () => {
    expect(celebracao(2022, "sagrada-familia").data).toBe("2022-12-30");
  });

  it("preenche todos os campos e mantém a Ascensão no domingo", () => {
    for (const c of celebracoesMoveis(2029)) {
      expect(c).toEqual({
        id: expect.any(String),
        nome: expect.any(String),
        data: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
        grau: expect.stringMatching(/^(solenidade|festa|memória|dia santo)$/),
        cor: expect.any(String),
        slug: expect.stringMatching(/^[a-z0-9-]+$/),
      });
    }
    expect(new Date(`${celebracao(2029, "ascensao").data}T00:00:00Z`).getUTCDay()).toBe(0);
  });
});
