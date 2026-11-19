"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { lerProgressoRemoto, salvarProgressoRemoto } from "@/lib/client/progressoRemoto";
import type { ProgressoRosario, SlugMisterio } from "@/types/rosario";

const CHAVE_PROGRESSO = "rosario-progresso";

interface ProgressoSalvo {
  misterioSlug: SlugMisterio;
  passoIndex: number;
}

export function useRosarioProgresso(misterioInicial: SlugMisterio) {
  const { status } = useSession();
  const [misterioSlug, setMisterioSlugState] = useState<SlugMisterio>(misterioInicial);
  const [passoIndex, setPassoIndexState] = useState(-1);
  const [concluidos, setConcluidos] = useState<Set<number>>(new Set());
  const [progressoSalvo, setProgressoSalvo] = useState<ProgressoSalvo | null>(null);

  // Lê o progresso salvo no mount (e de novo quando a sessão carrega) — apenas oferece
  // "continuar", não aplica automaticamente (o usuário decide na tela inicial).
  useEffect(() => {
    let local: ProgressoRosario | null = null;
    /* eslint-disable react-hooks/set-state-in-effect */
    try {
      const bruto = localStorage.getItem(CHAVE_PROGRESSO);
      local = bruto ? (JSON.parse(bruto) as ProgressoRosario) : null;
      if (local && typeof local.passoIndex === "number" && local.passoIndex >= 0) {
        setProgressoSalvo({ misterioSlug: local.misterioSlug, passoIndex: local.passoIndex });
      }
    } catch {
      // localStorage indisponível ou dado corrompido — ignora silenciosamente
    }
    /* eslint-enable react-hooks/set-state-in-effect */
    if (status !== "authenticated") return;

    // Com login, o terço começado em outro aparelho também pode ser continuado aqui.
    let cancelado = false;
    lerProgressoRemoto<ProgressoRosario>("rosario").then((remoto) => {
      if (cancelado) return;
      const salvo = remoto?.dados;
      if (salvo && remoto.atualizadoEm > (local?.atualizadoEm ?? 0)) {
        try {
          localStorage.setItem(CHAVE_PROGRESSO, JSON.stringify(salvo));
        } catch {
          // segue só em memória
        }
        setProgressoSalvo(salvo.passoIndex >= 0 ? { misterioSlug: salvo.misterioSlug, passoIndex: salvo.passoIndex } : null);
      } else if (local && (!remoto || local.atualizadoEm > remoto.atualizadoEm)) {
        salvarProgressoRemoto("rosario", local, local.atualizadoEm);
      }
    });
    return () => {
      cancelado = true;
    };
  }, [status]);

  const persistir = useCallback((slug: SlugMisterio, indice: number, done: Set<number>) => {
    const dado: ProgressoRosario = {
      misterioSlug: slug,
      passoIndex: indice,
      concluidos: Array.from(done),
      atualizadoEm: Date.now(),
    };
    try {
      localStorage.setItem(CHAVE_PROGRESSO, JSON.stringify(dado));
    } catch {
      // armazenamento cheio/indisponível — progresso segue funcionando em memória
    }
    if (status === "authenticated") salvarProgressoRemoto("rosario", dado, dado.atualizadoEm);
  }, [status]);

  const selecionarMisterio = useCallback(
    (slug: SlugMisterio) => {
      setMisterioSlugState(slug);
      setPassoIndexState(-1);
      setConcluidos(new Set());
      persistir(slug, -1, new Set());
      setProgressoSalvo(null);
    },
    [persistir]
  );

  const selecionarPasso = useCallback(
    (indice: number) => {
      setPassoIndexState(indice);
      setConcluidos((atual) => {
        const novo = new Set(atual).add(indice);
        persistir(misterioSlug, indice, novo);
        return novo;
      });
    },
    [misterioSlug, persistir]
  );

  const avancar = useCallback(
    (total: number) => {
      selecionarPasso(Math.min(passoIndex + 1, total - 1));
    },
    [passoIndex, selecionarPasso]
  );

  const voltar = useCallback(() => {
    setPassoIndexState((atual) => {
      const novo = Math.max(atual - 1, 0);
      persistir(misterioSlug, novo, concluidos);
      return novo;
    });
  }, [misterioSlug, concluidos, persistir]);

  const reiniciar = useCallback(() => {
    setPassoIndexState(-1);
    setConcluidos(new Set());
    persistir(misterioSlug, -1, new Set());
    setProgressoSalvo(null);
  }, [misterioSlug, persistir]);

  const continuarDeOndeParou = useCallback(() => {
    if (!progressoSalvo) return;
    let concluidosSalvos: number[] = [];
    try {
      const bruto = localStorage.getItem(CHAVE_PROGRESSO);
      if (bruto) concluidosSalvos = (JSON.parse(bruto) as ProgressoRosario).concluidos ?? [];
    } catch {
      // ignora — segue com progresso vazio em memória
    }
    setMisterioSlugState(progressoSalvo.misterioSlug);
    setPassoIndexState(progressoSalvo.passoIndex);
    setConcluidos(new Set(concluidosSalvos));
    setProgressoSalvo(null);
  }, [progressoSalvo]);

  return {
    misterioSlug,
    passoIndex,
    concluidos,
    progressoSalvo,
    selecionarMisterio,
    selecionarPasso,
    avancar,
    voltar,
    reiniciar,
    continuarDeOndeParou,
  };
}
