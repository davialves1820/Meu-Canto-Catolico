"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { ResumoCapitulo } from "@/types/catecismo";

interface OpcoesNavegacaoCatecismo {
  anterior: ResumoCapitulo | null;
  proximo: ResumoCapitulo | null;
}

interface RetornoNavegacaoCatecismo {
  /** Sentido da última troca de capítulo, para animar a entrada (0 = chegada direta). */
  direcaoEntrada: 1 | -1 | 0;
  navegar: (delta: 1 | -1) => void;
  manipuladoresToque: {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchEnd: (e: React.TouchEvent) => void;
  };
}

// Cada capítulo é uma rota: o sentido da navegação sobrevive à troca de página aqui.
let ultimaDirecao: 1 | -1 | 0 = 0;

/** Passa os capítulos do Catecismo como a Bíblia passa as páginas: deslize, setas ← → e botões. */
export function useNavegacaoCatecismo({ anterior, proximo }: OpcoesNavegacaoCatecismo): RetornoNavegacaoCatecismo {
  const router = useRouter();
  const [direcaoEntrada] = useState(() => ultimaDirecao);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    ultimaDirecao = 0;
    if (anterior) router.prefetch(`/catecismo/${anterior.slug}`);
    if (proximo) router.prefetch(`/catecismo/${proximo.slug}`);
  }, [router, anterior, proximo]);

  const navegar = useCallback(
    (delta: 1 | -1) => {
      const destino = delta === 1 ? proximo : anterior;
      if (!destino) {
        return;
      }
      ultimaDirecao = delta;
      router.push(`/catecismo/${destino.slug}`);
    },
    [router, anterior, proximo]
  );

  // Só ← e →: ↑ ↓ continuam rolando o texto, já que os capítulos do Catecismo são longos
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const alvo = e.target as HTMLElement | null;
      if (e.altKey || e.ctrlKey || e.metaKey || alvo?.closest("input, textarea, select, [contenteditable='true']")) {
        return;
      }
      if (e.key === "ArrowRight") navegar(1);
      if (e.key === "ArrowLeft") navegar(-1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [navegar]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) {
      return;
    }
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    // Tabelas (Credo, Mandamentos) rolam na horizontal e o sumário tem gesto próprio — ali não troca de capítulo
    const ignorar = (e.target as HTMLElement | null)?.closest(".overflow-x-auto, [role='dialog']");
    if (!ignorar && Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      navegar(dx < 0 ? 1 : -1);
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  return { direcaoEntrada, navegar, manipuladoresToque: { onTouchStart, onTouchEnd } };
}
