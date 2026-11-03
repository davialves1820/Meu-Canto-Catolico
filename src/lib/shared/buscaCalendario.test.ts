import { describe, expect, it } from "vitest";
import { buscarNoCalendario, criarIndiceBusca, normalizarBusca } from "./buscaCalendario";

const indice = criarIndiceBusca(2026, [
  { nome: "Natal do Senhor", data: "2026-12-25", grau: "SOLENIDADE" },
  { nome: "Domingo de Páscoa", data: "2026-04-05", grau: "SOLENIDADE" },
  { nome: "Santíssimo Corpo e Sangue de Cristo", data: "2026-06-04", grau: "SOLENIDADE" },
]);
const ids = (consulta: string) => buscarNoCalendario(indice, consulta).map((r) => r.id);

describe("normalizarBusca", () => {
  it("remove acentos, maiúsculas e espaços extras", () => {
    expect(normalizarBusca("  Tríduo   PASCAL ")).toBe("triduo pascal");
  });
});

describe("buscarNoCalendario", () => {
  it("encontra Páscoa sem acento", () => {
    const [primeiro] = buscarNoCalendario(indice, "pascoa");
    expect(primeiro).toMatchObject({ tipo: "celebracao", id: "pascoa", data: "2026-04-05" });
  });

  it("não duplica celebrações fixas que já são móveis", () => {
    expect(ids("domingo de pascoa")).toEqual(["pascoa"]);
    expect(ids("corp")).toEqual(["corpus-christi"]);
  });

  it("informa o grau da celebração", () => {
    expect(buscarNoCalendario(indice, "natal do senhor")[0]).toMatchObject({ grau: "solenidade" });
    expect(buscarNoCalendario(indice, "cinzas")[0]).toMatchObject({ grau: "dia santo" });
  });

  it.each([
    ["cinzas", "cinzas"],
    ["ramos", "ramos"],
    ["CORPUS CHRISTI", "corpus-christi"],
    ["corpo de deus", "corpus-christi"],
  ])("aceita o sinônimo %s", (consulta, id) => {
    expect(ids(consulta)[0]).toBe(id);
  });

  it("devolve tempo e celebrações para 'semana santa'", () => {
    expect(ids("semana santa")).toEqual(expect.arrayContaining(["triduo", "ramos", "sexta-paixao"]));
  });

  it("encontra tempos e celebrações fixas", () => {
    expect(buscarNoCalendario(indice, "advento")[0]).toMatchObject({ tipo: "tempo", tempo: "advento" });
    expect(ids("natal")).toEqual(expect.arrayContaining(["natal", "2026-12-25-natal do senhor"]));
  });

  it("retorna lista vazia sem resultado ou com consulta vazia", () => {
    expect(buscarNoCalendario(indice, "xyz")).toEqual([]);
    expect(buscarNoCalendario(indice, "   ")).toEqual([]);
  });
});
