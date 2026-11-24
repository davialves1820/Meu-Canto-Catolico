"use client";

import { useCallback, useState } from "react";
import { useProgressoSincronizado } from "@/lib/client/hooks/utils/useProgressoSincronizado";
import type { ConfigProgresso } from "@/lib/client/progressoLocal";
import type { ProgressoRosario, SlugMisterio } from "@/types/rosario";

const CONFIG: ConfigProgresso<ProgressoRosario> = {
  chave: "rosario",
  base: "rosario-progresso",
  converterAntigo: (bruto) => {
    const antigo = bruto as ProgressoRosario | null;
    return typeof antigo?.passoIndex === "number" ? { dados: antigo, atualizadoEm: antigo.atualizadoEm ?? 0 } : null;
  },
  // Dois terços em andamento não se somam: vale o último rezado.
  mesclar: (a, b) => (b.atualizadoEm > a.atualizadoEm ? b.dados : a.dados),
};

export function useRosarioProgresso(misterioInicial: SlugMisterio) {
  const [misterioSlug, setMisterioSlugState] = useState<SlugMisterio>(misterioInicial);
  const [passoIndex, setPassoIndexState] = useState(-1);
  const [concluidos, setConcluidos] = useState<Set<number>>(new Set());
  const [progressoSalvo, setProgressoSalvo] = useState<ProgressoRosario | null>(null);

  // Apenas oferece "continuar" (inclusive de outro aparelho, com login): não aplica
  // automaticamente, o usuário decide na tela inicial.
  const { gravar } = useProgressoSincronizado(CONFIG, (registro) =>
    setProgressoSalvo(registro && registro.dados.passoIndex >= 0 ? registro.dados : null)
  );

  const persistir = useCallback(
    (slug: SlugMisterio, indice: number, done: Set<number>) => {
      gravar({ misterioSlug: slug, passoIndex: indice, concluidos: Array.from(done), atualizadoEm: Date.now() });
    },
    [gravar]
  );

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
    setMisterioSlugState(progressoSalvo.misterioSlug);
    setPassoIndexState(progressoSalvo.passoIndex);
    setConcluidos(new Set(progressoSalvo.concluidos));
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
