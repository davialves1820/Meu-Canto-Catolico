"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { lerProgressoRemoto, salvarProgressoRemoto } from "@/lib/client/progressoRemoto";

interface ProgressoNovena {
  dias: number[];
  atualizadoEm: number;
}

const chave = (slug: string, versao: string) => `novena:${slug}:${versao}`;
const chaveLocal = (slug: string, versao: string) => `novena-progresso:${slug}:${versao}`;

function lerLocal(slug: string, versao: string): ProgressoNovena {
  try {
    const bruto = localStorage.getItem(chaveLocal(slug, versao));
    if (!bruto) return { dias: [], atualizadoEm: 0 };
    const salvo = JSON.parse(bruto) as ProgressoNovena | number[];
    // Formato antigo: só a lista de dias, sem data.
    return Array.isArray(salvo) ? { dias: salvo, atualizadoEm: 0 } : salvo;
  } catch {
    // localStorage indisponível ou dado corrompido — começa do zero
    return { dias: [], atualizadoEm: 0 };
  }
}

function gravarLocal(slug: string, versao: string, progresso: ProgressoNovena) {
  try {
    localStorage.setItem(chaveLocal(slug, versao), JSON.stringify(progresso));
  } catch {
    // armazenamento cheio/indisponível — o progresso segue em memória
  }
}

/**
 * Dias já rezados (1-based) de uma versão da novena. Fica no navegador e, com login,
 * também na conta: vale o registro mais recente entre os dois.
 */
export function useProgressoNovena(slug: string, versao: string) {
  const { status } = useSession();
  const [rezados, setRezados] = useState<Set<number>>(new Set());

  useEffect(() => {
    const local = lerLocal(slug, versao);
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setRezados(new Set(local.dias));
    if (status !== "authenticated") return;

    let cancelado = false;
    lerProgressoRemoto<number[]>(chave(slug, versao)).then((remoto) => {
      if (cancelado) return;
      if (remoto && remoto.atualizadoEm > local.atualizadoEm) {
        gravarLocal(slug, versao, { dias: remoto.dados, atualizadoEm: remoto.atualizadoEm });
        setRezados(new Set(remoto.dados));
      } else if (local.dias.length && (!remoto || local.atualizadoEm > remoto.atualizadoEm)) {
        // Progresso feito antes do login (ou offline) sobe para a conta.
        salvarProgressoRemoto(chave(slug, versao), local.dias, local.atualizadoEm || Date.now());
      }
    });
    return () => {
      cancelado = true;
    };
  }, [slug, versao, status]);

  const persistir = useCallback(
    (dias: Set<number>) => {
      const progresso = { dias: [...dias].sort((a, b) => a - b), atualizadoEm: Date.now() };
      gravarLocal(slug, versao, progresso);
      if (status === "authenticated") salvarProgressoRemoto(chave(slug, versao), progresso.dias, progresso.atualizadoEm);
    },
    [slug, versao, status]
  );

  const alternar = useCallback(
    (dia: number) => {
      setRezados((atual) => {
        const novo = new Set(atual);
        if (novo.has(dia)) novo.delete(dia);
        else novo.add(dia);
        persistir(novo);
        return novo;
      });
    },
    [persistir]
  );

  const reiniciar = useCallback(() => {
    setRezados(new Set());
    persistir(new Set());
  }, [persistir]);

  return { rezados, alternar, reiniciar };
}
