"use client";

import { useCallback, useEffect, useState } from "react";

const chave = (slug: string, versao: string) => `novena-progresso:${slug}:${versao}`;

/** Dias já rezados (1-based) de uma versão da novena, guardados no navegador. */
export function useProgressoNovena(slug: string, versao: string) {
  const [rezados, setRezados] = useState<Set<number>>(new Set());

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    try {
      const bruto = localStorage.getItem(chave(slug, versao));
      setRezados(new Set(bruto ? (JSON.parse(bruto) as number[]) : []));
    } catch {
      // localStorage indisponível ou dado corrompido — começa do zero
      setRezados(new Set());
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [slug, versao]);

  const persistir = useCallback(
    (dias: Set<number>) => {
      try {
        if (dias.size) localStorage.setItem(chave(slug, versao), JSON.stringify([...dias].sort((a, b) => a - b)));
        else localStorage.removeItem(chave(slug, versao));
      } catch {
        // armazenamento cheio/indisponível — o progresso segue em memória
      }
    },
    [slug, versao]
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
