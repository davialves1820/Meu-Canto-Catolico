"use client";

import { useCallback, useMemo, useState } from "react";
import { useProgressoSincronizado } from "@/lib/client/hooks/utils/useProgressoSincronizado";
import type { ConfigProgresso, RegistroProgresso } from "@/lib/client/progressoLocal";

/** Formatos gravados antes de o progresso ter dono: [1, 2] e { dias, atualizadoEm }. */
function converterAntigo(bruto: unknown): RegistroProgresso<number[]> | null {
  if (Array.isArray(bruto)) return { dados: bruto as number[], atualizadoEm: 0 };
  const antigo = bruto as { dias?: number[]; atualizadoEm?: number } | null;
  return Array.isArray(antigo?.dias) ? { dados: antigo.dias, atualizadoEm: antigo.atualizadoEm ?? 0 } : null;
}

const ordenar = (dias: Iterable<number>) => [...new Set(dias)].sort((a, b) => a - b);

/**
 * Dias já rezados (1-based) de uma versão da novena. Fica no navegador e, com login,
 * também na conta.
 */
export function useProgressoNovena(slug: string, versao: string) {
  const [rezados, setRezados] = useState<Set<number>>(new Set());

  const config = useMemo<ConfigProgresso<number[]>>(
    () => ({
      chave: `novena:${slug}:${versao}`,
      base: `novena-progresso:${slug}:${versao}`,
      converterAntigo,
      mesclar: (a, b) => ordenar([...a.dados, ...b.dados]),
    }),
    [slug, versao]
  );

  const { pronto, gravar, reiniciar: reiniciarSalvo } = useProgressoSincronizado(config, (registro) =>
    setRezados(new Set(registro?.dados))
  );

  const alternar = useCallback(
    (dia: number) => {
      const novo = new Set(rezados);
      if (novo.has(dia)) novo.delete(dia);
      else novo.add(dia);
      setRezados(novo);
      gravar(ordenar(novo));
    },
    [rezados, gravar]
  );

  const reiniciar = useCallback(() => {
    setRezados(new Set());
    reiniciarSalvo([]);
  }, [reiniciarSalvo]);

  return { rezados, pronto, alternar, reiniciar };
}
