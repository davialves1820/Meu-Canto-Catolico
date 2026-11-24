"use client";

/**
 * Cópia do progresso das devoções na conta do usuário (/api/progresso). O localStorage
 * continua sendo a fonte imediata; o servidor só leva o progresso para outros aparelhos.
 * Falhas de rede ou de banco são ignoradas: a devoção segue funcionando localmente.
 *
 * Toda chamada diz de qual usuário é o progresso; se a sessão já for de outro (login trocado
 * em outra aba), o servidor recusa em vez de misturar as contas.
 */

const ESPERA_MS = 1_000;
const TIMEOUT_MS = 6_000;

interface ProgressoRemoto<T> {
  dados: T;
  atualizadoEm: number;
}

/** `ok: false` = não deu para saber; diferente de a conta não ter progresso (`progresso: null`). */
export type LeituraRemota<T> = { ok: true; progresso: ProgressoRemoto<T> | null } | { ok: false };

export async function lerProgressoRemoto<T>(usuario: string, chave: string): Promise<LeituraRemota<T>> {
  try {
    const params = new URLSearchParams({ usuario, chave });
    const resposta = await fetch(`/api/progresso?${params}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!resposta.ok) return { ok: false };
    const { progresso } = (await resposta.json()) as { progresso: ProgressoRemoto<T> | null };
    return { ok: true, progresso };
  } catch {
    return { ok: false };
  }
}

const pendentes = new Map<string, { timer: ReturnType<typeof setTimeout>; enviar: () => Promise<void> }>();

/** Envia já o que ainda espera: ao sair da página, ou antes de encerrar a sessão. */
export async function descarregarProgressoPendente(): Promise<void> {
  const envios = [...pendentes.values()];
  pendentes.clear();
  await Promise.all(
    envios.map(({ timer, enviar }) => {
      clearTimeout(timer);
      return enviar();
    })
  );
}

let ouvindoSaida = false;

function ouvirSaida() {
  if (ouvindoSaida) return;
  ouvindoSaida = true;
  // No celular, trocar de app pode encerrar a aba sem "pagehide": visibilitychange cobre isso.
  window.addEventListener("pagehide", () => void descarregarProgressoPendente());
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") void descarregarProgressoPendente();
  });
}

/** Agrupa cliques seguidos (ex.: marcar vários dias) num único envio por chave. */
export function salvarProgressoRemoto<T>(usuario: string, chave: string, dados: T, atualizadoEm: number): void {
  ouvirSaida();
  const id = `${usuario}|${chave}`;
  const anterior = pendentes.get(id);
  if (anterior) clearTimeout(anterior.timer);

  const enviar = async () => {
    try {
      await fetch("/api/progresso", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, chave, dados, atualizadoEm }),
        // Permite que o envio termine mesmo com a página já fechando.
        keepalive: true,
      });
    } catch {
      // sem rede — o registro local, mais recente, sobe na próxima visita
    }
  };

  const timer = setTimeout(() => {
    pendentes.delete(id);
    void enviar();
  }, ESPERA_MS);
  pendentes.set(id, { timer, enviar });
}
