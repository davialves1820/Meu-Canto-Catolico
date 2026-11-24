import { NextRequest, NextResponse } from "next/server";

interface Janela {
  count: number;
  resetAt: number;
}

// Em memória: cada instância serverless tem a própria contagem, e ela zera quando a
// instância reinicia. Freia abuso simples; não é uma trava global.
const store = new Map<string, Janela>();

setInterval(() => {
  const agora = Date.now();
  for (const [key, janela] of store.entries()) {
    if (janela.resetAt < agora) {
      store.delete(key);
    }
  }
}, 60_000);

interface OpsRateLimit {
  limite?: number;
  janela?: number;
}

export function ipDaRequisicao(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    request.headers.get("x-real-ip") ??
    "anonymous"
  );
}

/** Momento (epoch ms) em que a chave volta a ser aceita, ou null se ainda não atingiu o limite. */
export function bloqueadaAte(chave: string, limite: number): number | null {
  const entrada = store.get(chave);
  return entrada && entrada.resetAt >= Date.now() && entrada.count >= limite ? entrada.resetAt : null;
}

export function contarTentativa(chave: string, janela: number): void {
  const agora = Date.now();
  const entrada = store.get(chave);
  if (!entrada || entrada.resetAt < agora) {
    store.set(chave, { count: 1, resetAt: agora + janela });
  } else {
    entrada.count++;
  }
}

export function limparTentativas(chave: string): void {
  store.delete(chave);
}

/** Limita por IP em cada rota: usar muito a busca não bloqueia o cadastro, por exemplo. */
export function verificarRateLimit(
  request: NextRequest,
  { limite = 30, janela = 60_000 }: OpsRateLimit = {}
): NextResponse | null {
  const chave = `${request.method} ${request.nextUrl.pathname} ${ipDaRequisicao(request)}`;

  const resetAt = bloqueadaAte(chave, limite);
  if (resetAt !== null) {
    const retryAfter = Math.ceil((resetAt - Date.now()) / 1000);
    return NextResponse.json(
      { error: "Muitas requisições. Tente novamente em instantes." },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfter),
          "X-RateLimit-Limit": String(limite),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(resetAt / 1000)),
        },
      }
    );
  }

  contarTentativa(chave, janela);
  return null;
}
