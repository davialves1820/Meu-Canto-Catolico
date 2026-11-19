"use client";

/**
 * Cópia do progresso das devoções na conta do usuário (/api/progresso). O localStorage
 * continua sendo a fonte imediata; o servidor só leva o progresso para outros aparelhos.
 * Falhas de rede ou de banco são ignoradas: a devoção segue funcionando localmente.
 */

export interface ProgressoRemoto<T> {
  dados: T;
  atualizadoEm: number;
}

export async function lerProgressoRemoto<T>(chave: string): Promise<ProgressoRemoto<T> | null> {
  try {
    const resposta = await fetch(`/api/progresso?chave=${encodeURIComponent(chave)}`, { cache: "no-store" });
    if (!resposta.ok) return null;
    const { progresso } = (await resposta.json()) as { progresso: ProgressoRemoto<T> | null };
    return progresso;
  } catch {
    return null;
  }
}

const pendentes = new Map<string, ReturnType<typeof setTimeout>>();

/** Agrupa cliques seguidos (ex.: marcar vários dias) num único envio por chave. */
export function salvarProgressoRemoto<T>(chave: string, dados: T, atualizadoEm: number = Date.now()): void {
  const anterior = pendentes.get(chave);
  if (anterior) clearTimeout(anterior);
  pendentes.set(
    chave,
    setTimeout(() => {
      pendentes.delete(chave);
      fetch("/api/progresso", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chave, dados, atualizadoEm }),
        // Termina o envio mesmo se a pessoa fechar a aba logo depois de marcar o dia.
        keepalive: true,
      }).catch(() => {});
    }, 1_000)
  );
}
