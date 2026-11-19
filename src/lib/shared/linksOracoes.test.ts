import { describe, expect, it } from "vitest";
import oracoesData from "../../data/oracoes.json";
import { linksOracoesEmTexto } from "./linksOracoes";

const links = (texto: string) =>
  linksOracoesEmTexto(texto)
    .filter((n) => n.type === "element")
    .map((n) => (n as unknown as { properties: { href: string } }).properties.href);

describe("linksOracoes", () => {
  it("liga as orações citadas", () => {
    expect(links("Rezar um Pai-Nosso, três Ave-Marias e um Glória.")).toEqual([
      "/oracoes/pai-nosso",
      "/oracoes/ave-maria",
      "/oracoes/gloria-ao-pai",
    ]);
    expect(links("Glória ao Pai e Salve-Rainha")).toEqual(["/oracoes/gloria-ao-pai", "/oracoes/salve-rainha"]);
  });

  it("não confunde a palavra glória com a oração", () => {
    expect(links("para a maior glória de Deus")).toEqual([]);
    expect(links("na Glória do Pai eterno")).toEqual([]);
  });

  it("mantém o texto ao redor", () => {
    const nos = linksOracoesEmTexto("Rezar o Credo hoje");
    expect(nos.map((n) => (n.type === "text" ? (n as unknown as { value: string }).value : "[link]"))).toEqual([
      "Rezar o ",
      "[link]",
      " hoje",
    ]);
  });

  it("aponta só para orações que existem", () => {
    const slugs = new Set((oracoesData as { oracoes: { slug: string }[] }).oracoes.map((o) => o.slug));
    for (const href of links("Pai-Nosso Ave-Maria Glória ao Pai Salve-Rainha Credo sinal da cruz")) {
      expect(slugs.has(href.replace("/oracoes/", "")), href).toBe(true);
    }
  });
});
