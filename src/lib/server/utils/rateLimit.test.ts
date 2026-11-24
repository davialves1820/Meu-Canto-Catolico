import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { bloqueadaAte, contarTentativa, limparTentativas, verificarRateLimit } from "./rateLimit";

const requisicao = (rota: string, ip: string, method = "GET") =>
  new NextRequest(`http://localhost${rota}`, { method, headers: { "x-forwarded-for": ip } });

describe("verificarRateLimit", () => {
  it("bloqueia só depois do limite", () => {
    for (let i = 0; i < 3; i++) expect(verificarRateLimit(requisicao("/api/a", "1.1.1.1"), { limite: 3 })).toBeNull();
    expect(verificarRateLimit(requisicao("/api/a", "1.1.1.1"), { limite: 3 })?.status).toBe(429);
  });

  it("conta cada rota, método e IP em separado", () => {
    for (let i = 0; i < 10; i++) verificarRateLimit(requisicao("/api/busca", "2.2.2.2"), { limite: 30 });
    expect(verificarRateLimit(requisicao("/api/cadastro", "2.2.2.2", "POST"), { limite: 10 })).toBeNull();

    verificarRateLimit(requisicao("/api/p", "3.3.3.3"), { limite: 1 });
    expect(verificarRateLimit(requisicao("/api/p", "3.3.3.3", "PUT"), { limite: 1 })).toBeNull();
    expect(verificarRateLimit(requisicao("/api/p", "4.4.4.4"), { limite: 1 })).toBeNull();
  });
});

describe("tentativas de login", () => {
  it("bloqueia no limite e libera ao limpar", () => {
    for (let i = 0; i < 2; i++) contarTentativa("login x", 60_000);
    expect(bloqueadaAte("login x", 2)).not.toBeNull();
    limparTentativas("login x");
    expect(bloqueadaAte("login x", 2)).toBeNull();
  });
});
