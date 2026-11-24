"use client";

import { useState, useEffect, useRef } from "react";

interface RetornoDestaqueVersiculo {
  versiculoDestaque: number | undefined;
  destacarVersiculo: (versiculo: number) => void;
  limparDestaque: () => void;
  refsVersiculo: React.MutableRefObject<Map<number, HTMLElement>>;
}

export function useDestaqueVersiculo(versiculoParaDestacar: number | undefined, indexCapitulo: number): RetornoDestaqueVersiculo {
  const [versiculoDestaque, setVersiculoDestaque] = useState<number | undefined>(versiculoParaDestacar);
  const refsVersiculo = useRef<Map<number, HTMLElement>>(new Map());

  // Sincronizar quando a propriedade highlightVerse for alterada
  useEffect(() => {
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setVersiculoDestaque(versiculoParaDestacar);
  }, [versiculoParaDestacar]);

  // Rola até o versículo destacado e limpa automaticamente
  useEffect(() => {
    if (!versiculoDestaque) return;
    const el = refsVersiculo.current.get(versiculoDestaque);
    if (!el) return;
    const scrollTimer = setTimeout(
      () => el.scrollIntoView({ behavior: "smooth", block: "center" }),
      400
    );
    const clearTimer = setTimeout(() => setVersiculoDestaque(undefined), 3500);
    return () => {
      clearTimeout(scrollTimer);
      clearTimeout(clearTimer);
    };
  }, [versiculoDestaque, indexCapitulo]);

  return {
    versiculoDestaque,
    destacarVersiculo: (versiculo: number) => setVersiculoDestaque(versiculo),
    limparDestaque: () => setVersiculoDestaque(undefined),
    refsVersiculo,
  };
}
