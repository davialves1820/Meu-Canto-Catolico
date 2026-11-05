import { describe, expect, it } from "vitest";
import { calcularTrocasDeCor, gerarScriptTema, normalizarCorLiturgica, type TrocaDeCor } from "./temaLiturgico";

/** Executa o script gerado num instante fixo e devolve a cor aplicada em <html>. */
function corAplicada(trocas: TrocaDeCor[], ultimoDia: string, instante: string): string | undefined {
  const atributos: Record<string, string> = {};
  const document = { documentElement: { setAttribute: (nome: string, valor: string) => (atributos[nome] = valor) } };
  const DataFixa = class extends Date {
    constructor() {
      super(instante);
    }
  };
  new Function("document", "Date", gerarScriptTema(trocas, ultimoDia))(document, DataFixa);
  return atributos["data-liturgical-color"];
}

describe("normalizarCorLiturgica", () => {
  it("usa o tema padrão para branco e cores desconhecidas", () => {
    expect(normalizarCorLiturgica("ROXO")).toBe("roxo");
    expect(normalizarCorLiturgica("BRANCO")).toBeNull();
    expect(normalizarCorLiturgica("AZUL")).toBeNull();
  });
});

describe("calcularTrocasDeCor", () => {
  it("guarda só os dias em que o tema muda, mesmo fora de ordem", () => {
    expect(
      calcularTrocasDeCor({
        "2026-01-04": "VERDE",
        "2026-01-01": "BRANCO",
        "2026-01-02": "BRANCO",
        "2026-01-03": "AZUL",
        "2026-01-05": "VERDE",
        "2026-01-06": "ROXO",
      }),
    ).toEqual([
      ["2026-01-01", null],
      ["2026-01-04", "verde"],
      ["2026-01-06", "roxo"],
    ]);
  });
});

describe("gerarScriptTema", () => {
  const trocas: TrocaDeCor[] = [
    ["2026-11-01", null],
    ["2026-11-03", "verde"],
    ["2026-11-05", "roxo"],
  ];

  it.each([
    ["2026-11-03T12:00:00Z", "verde"],
    ["2026-11-04T23:00:00Z", "verde"],
    ["2026-11-05T12:00:00Z", "roxo"],
    ["2026-11-02T12:00:00Z", undefined],
    ["2026-10-31T12:00:00Z", undefined],
  ])("em %s aplica %s", (instante, cor) => {
    expect(corAplicada(trocas, "2026-11-30", instante)).toBe(cor);
  });

  it("usa a data de São Paulo, não a UTC", () => {
    // 02:00 UTC do dia 5 ainda é dia 4 em São Paulo.
    expect(corAplicada(trocas, "2026-11-30", "2026-11-05T02:00:00Z")).toBe("verde");
  });

  it("não aplica cor depois do fim do calendário", () => {
    expect(corAplicada(trocas, "2026-11-30", "2026-12-01T12:00:00Z")).toBeUndefined();
  });
});
