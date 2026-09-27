"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Noticia } from "@/types/noticias";
import NoticiaCard from "./NoticiaCard";
import { Loader2 } from "lucide-react";

interface Props {
  noticiasIniciais: Noticia[];
  temMaisInicial?: boolean;
  busca?: string;
}

export default function NoticiasInfiniteGrid({ noticiasIniciais, temMaisInicial = true, busca = "" }: Props) {
  const [noticias, setNoticias] = useState<Noticia[]>(noticiasIniciais);
  const [pagina, setPagina] = useState(1);
  const [temMais, setTemMais] = useState(temMaisInicial);
  const [carregando, setCarregando] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Quando a busca muda, a página troca (novo SSR de "página 1") — reseta o
  // estado do scroll infinito pra recomeçar a paginação do zero.
  useEffect(() => {
    setNoticias(noticiasIniciais);
    setPagina(1);
    setTemMais(temMaisInicial);
  }, [noticiasIniciais, temMaisInicial]);

  const carregarMais = useCallback(async () => {
    if (carregando || !temMais) {
      return;
    }
    setCarregando(true);

    try {
      const proximaPagina = pagina + 1;
      const params = new URLSearchParams({ pagina: String(proximaPagina) });
      if (busca) params.set("busca", busca);
      const res = await fetch(`/api/noticias?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      setNoticias((prev) => {
        // Desduplicar pelo id para evitar chaves repetidas
        const ids = new Set(prev.map((n) => n.id));
        const novas = (data.noticias as Noticia[]).filter((n) => !ids.has(n.id));
        return [...prev, ...novas];
      });
      setTemMais(data.temMais);
      setPagina(proximaPagina);
    } catch (err) {
      console.error("[NoticiasInfiniteGrid]", err);
      setTemMais(false);
    } finally {
      setCarregando(false);
    }
  }, [carregando, temMais, pagina, busca]);

  // Observa o elemento sentinela — quando entra na viewport, carrega mais
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          carregarMais();
        }
      },
      { rootMargin: "200px" } // começa a carregar 200px antes do fim
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [carregarMais]);

  return (
    <>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {noticias.map((n) => (
          <NoticiaCard key={n.id} noticia={n} />
        ))}
      </div>

      {/* Sentinela invisível que aciona o carregamento */}
      <div ref={sentinelRef} className="h-4 mt-8" aria-hidden="true" />

      {carregando && (
        <div className="flex justify-center py-8" aria-live="polite" aria-label="Carregando mais notícias">
          <Loader2 className="w-6 h-6 animate-spin text-secondary/40" />
        </div>
      )}

      {!temMais && noticias.length > 0 && (
        <p className="text-center text-sm text-on-surface-variant font-body py-8 opacity-60">
          Você chegou ao fim das notícias disponíveis.
        </p>
      )}
    </>
  );
}
