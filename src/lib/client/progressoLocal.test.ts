import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  apagarLocal,
  gravarLocal,
  lerLocal,
  resolverProgresso,
  type ConfigProgresso,
  type RegistroProgresso,
} from "./progressoLocal";

type Dias = RegistroProgresso<number[]>;

const config: ConfigProgresso<number[]> = {
  chave: "novena:x:principal",
  base: "novena-progresso:x:principal",
  converterAntigo: (bruto) => (Array.isArray(bruto) ? { dados: bruto, atualizadoEm: 0 } : null),
  mesclar: (a, b) => [...new Set([...a.dados, ...b.dados])].sort(),
};

const reg = (dados: number[], atualizadoEm: number, extra: Partial<Dias> = {}): Dias => ({ dados, atualizadoEm, ...extra });
const resolver = (o: Partial<Record<"proprio" | "anonimo" | "remoto", Dias>>) =>
  resolverProgresso({ proprio: null, anonimo: null, remoto: null, ...o }, config.mesclar, 1000);

describe("armazenamento por dono", () => {
  beforeEach(() => {
    const dados = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => dados.get(k) ?? null,
      setItem: (k: string, v: string) => dados.set(k, v),
      removeItem: (k: string) => dados.delete(k),
    });
  });

  it("não mostra o progresso de uma conta a outra nem a quem está deslogado", () => {
    gravarLocal(config, "ana", reg([1, 2], 10));
    expect(lerLocal(config, "ana")?.dados).toEqual([1, 2]);
    expect(lerLocal(config, "bia")).toBeNull();
    expect(lerLocal(config, null)).toBeNull();
  });

  it("lê o formato antigo sem marcá-lo como anônimo", () => {
    localStorage.setItem(config.base, "[1,2]");
    expect(lerLocal(config, null)).toEqual({ dados: [1, 2], atualizadoEm: 0 });
    apagarLocal(config, null);
    expect(lerLocal(config, null)).toBeNull();
  });

  it("ignora dado corrompido", () => {
    localStorage.setItem(config.base, "{");
    expect(lerLocal(config, null)).toBeNull();
  });
});

describe("resolverProgresso", () => {
  it("fica com o mais recente entre o aparelho e a conta", () => {
    expect(resolver({ proprio: reg([1], 10), remoto: reg([1, 2], 20) })).toEqual({ final: reg([1, 2], 20), enviar: false });
    expect(resolver({ proprio: reg([1], 30), remoto: reg([1, 2], 20) })).toEqual({ final: reg([1], 30), enviar: true });
  });

  it("não perde os dias da conta ao juntar o que foi feito sem login", () => {
    expect(resolver({ anonimo: reg([5], 90, { anonimo: true }), remoto: reg([1, 2, 3, 4], 20) })).toEqual({
      final: reg([1, 2, 3, 4, 5], 1000),
      enviar: true,
    });
  });

  it("mescla o que foi feito offline em vez de substituir a conta", () => {
    expect(resolver({ proprio: reg([5], 90, { pendente: true }), remoto: reg([1, 2], 20) }).final).toEqual(
      reg([1, 2, 5], 1000)
    );
  });

  it("sobe a união mesmo com o relógio do aparelho atrasado", () => {
    expect(resolver({ proprio: reg([5], 90, { pendente: true }), remoto: reg([1], 5000) })).toEqual({
      final: reg([1, 5], 5001),
      enviar: true,
    });
  });

  it("não leva para a conta um registro antigo, de dono desconhecido", () => {
    expect(resolver({ anonimo: reg([1, 2], 50) })).toEqual({ final: null, enviar: false });
    expect(resolver({ anonimo: reg([9], 50), remoto: reg([1], 20) })).toEqual({ final: reg([1], 20), enviar: false });
  });
});
