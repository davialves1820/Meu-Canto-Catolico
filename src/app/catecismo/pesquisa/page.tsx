"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronRight, Loader2, ArrowLeft, BookOpen, X, AlertCircle, Hash } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import type { ResultadoBuscaCatecismo } from "@/types/catecismo";

const TERMOS_RAPIDOS = ["Eucaristia", "Graça", "Consciência", "Batismo", "Matrimônio", "Espírito Santo", "Oração"];
const TOTAL_PARAGRAFOS = 2865;

function numeroDoParagrafo(query: string): number | null {
  const m = query.trim().match(/^§?\s*(\d{1,4})$/);
  const n = m ? Number(m[1]) : NaN;
  return n >= 1 && n <= TOTAL_PARAGRAFOS ? n : null;
}

function destacar(trecho: string, destaques: [number, number][]) {
  if (destaques.length === 0) {
    return <>{trecho}</>;
  }
  const partes: React.ReactNode[] = [];
  let pos = 0;
  destaques.forEach(([inicio, fim], i) => {
    partes.push(<span key={`t${i}`}>{trecho.slice(pos, inicio)}</span>);
    partes.push(
      <mark key={`m${i}`} className="rounded px-0.5 not-italic font-bold" style={{ background: "hsl(var(--gold)/0.25)", color: "hsl(var(--foreground))" }}>
        {trecho.slice(inicio, fim)}
      </mark>
    );
    pos = fim;
  });
  partes.push(<span key="fim">{trecho.slice(pos)}</span>);
  return <>{partes}</>;
}

export default function PaginaBuscaCatecismo() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ResultadoBuscaCatecismo[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const numero = numeroDoParagrafo(query);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    if (query.trim().length < 3 && numeroDoParagrafo(query) === null) {
      setResults([]);
      setSearched(false);
      setError(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      setError(false);
      try {
        const res = await fetch(`/api/catecismo/search?q=${encodeURIComponent(query.trim())}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setResults(data.results || []);
        setSearched(true);
      } catch {
        setError(true);
        setResults([]);
        setSearched(false);
      } finally {
        setLoading(false);
      }
    }, 420);

    return () => clearTimeout(timer);
  }, [query]);

  const limparPesquisa = () => {
    setQuery("");
    setResults([]);
    setSearched(false);
    setError(false);
    inputRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border/40 bg-card/30 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 py-12 md:py-20">
          <Breadcrumb items={[{ label: "Catecismo", href: "/catecismo" }, { label: "Pesquisar" }]} className="mb-6" />
          <Link
            href="/catecismo"
            className="inline-flex items-center gap-2 text-[10px] font-body font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors mb-8 group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Voltar para o Catecismo
          </Link>

          <h1 className="font-heading text-5xl md:text-6xl text-foreground mb-4 font-medium">Pesquisar</h1>
          <p className="font-body text-sm md:text-base text-muted-foreground mb-12 max-w-xl">
            Busque por palavras, temas ou pelo número do parágrafo (ex: <span className="font-semibold text-primary">1324</span>) em todo o Catecismo da Igreja Católica.
          </p>

          <div className="relative group w-full">
            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
              {loading
                ? <Loader2 className="w-8 h-8 text-primary animate-spin opacity-70" />
                : <Search className="text-primary w-8 h-8 opacity-70 group-focus-within:scale-110 transition-transform" />
              }
            </div>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='Ex: "presença real", graça, 1324…'
              aria-label="Pesquisar no Catecismo"
              className="w-full bg-card border border-border/40 rounded-2xl shadow-sm focus:border-primary focus:ring-0 transition-all py-6 pl-16 pr-16 text-lg md:text-xl outline-none placeholder:text-muted-foreground/40 font-body"
            />
            {query && (
              <button onClick={limparPesquisa} className="absolute right-6 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors focus:outline-none" aria-label="Limpar pesquisa">
                <X className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Atalho para o número do parágrafo */}
          <AnimatePresence>
            {numero !== null && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="mt-4"
              >
                <button
                  onClick={() => router.push(`/catecismo/paragrafo/${numero}`)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-body font-bold transition-all border border-primary/30 hover:bg-primary/5"
                  style={{ color: "hsl(var(--primary))" }}
                >
                  <Hash size={16} />
                  Ir direto para o parágrafo {numero}
                  <ChevronRight size={14} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {query.trim().length > 0 && query.trim().length < 3 && numero === null && (
            <p className="mt-4 text-[10px] font-body font-bold uppercase tracking-widest text-primary/50 animate-pulse">
              Continue digitando...
            </p>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="flex items-center gap-3 rounded-xl border border-border p-4 mb-6"
              style={{ background: "hsl(var(--card))" }} role="alert"
            >
              <AlertCircle size={18} className="shrink-0" style={{ color: "hsl(var(--crimson-light))" }} />
              <p className="text-sm font-body text-muted-foreground">Não foi possível realizar a pesquisa. Verifique sua conexão e tente novamente.</p>
              <button onClick={() => setQuery((q) => q + " ")} className="ml-auto text-xs font-bold font-body shrink-0 transition-colors focus-visible:outline-none rounded" style={{ color: "hsl(var(--gold))" }}>
                Tentar novamente
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {!searched && !error && query.length === 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
              <p className="text-xs font-bold font-body uppercase tracking-widest text-muted-foreground">Temas populares</p>
              <div className="flex flex-wrap gap-2" role="list" aria-label="Temas populares">
                {TERMOS_RAPIDOS.map((term) => (
                  <button key={term} role="listitem" onClick={() => setQuery(term)} aria-label={`Pesquisar por ${term}`}
                    className="px-4 py-2 rounded-full text-sm font-body font-semibold border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))", color: "hsl(var(--foreground)/0.7)" }}>
                    {term}
                  </button>
                ))}
              </div>
              <div className="mt-8 p-5 rounded-xl border" style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--gold)/0.15)" }}>
                <div className="flex items-start gap-3">
                  <BookOpen size={17} className="mt-0.5 shrink-0" style={{ color: "hsl(var(--gold))" }} />
                  <div>
                    <p className="text-sm font-bold font-heading text-foreground mb-1">Dica de pesquisa</p>
                    <p className="text-sm font-body text-muted-foreground leading-relaxed">
                      O texto segue a edição portuguesa da Santa Sé, mas você pode pesquisar com a grafia brasileira (ex: &quot;batismo&quot; encontra &quot;Baptismo&quot;). Digite um número, como <strong>1324</strong>, para ir direto ao parágrafo.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {searched && !loading && !error && (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4" role="region" aria-label="Resultados da pesquisa" aria-live="polite">
              <div className="flex items-center justify-between py-2">
                <p className="text-sm font-body text-muted-foreground">
                  {results.length === 0 ? `Nenhum resultado para "${query}"` : results.length >= 50 ? "Primeiros 50 resultados" : `${results.length} resultado${results.length !== 1 ? "s" : ""} para "${query}"`}
                </p>
                {results.length > 0 && (
                  <button onClick={limparPesquisa} aria-label="Limpar resultados" className="text-xs font-bold font-body text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none rounded">
                    Limpar
                  </button>
                )}
              </div>

              {results.length === 0 && (
                <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16 space-y-3">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto" style={{ background: "hsl(var(--secondary))" }}>
                    <Search size={26} className="text-muted-foreground/40" />
                  </div>
                  <p className="font-heading text-lg font-semibold text-foreground/40">Nenhum parágrafo encontrado</p>
                  <p className="text-sm text-muted-foreground font-body max-w-xs mx-auto">Tente palavras diferentes ou verifique a ortografia.</p>
                </motion.div>
              )}

              {results.map((result, idx) => (
                <motion.div key={result.numero} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(idx * 0.04, 0.4) }}>
                  <Link
                    href={`/catecismo/${result.slug}?p=${result.numero}`}
                    className="group flex gap-6 rounded-2xl p-6 transition-all duration-300 border border-border/40 bg-card hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <div className="shrink-0 px-3 h-12 min-w-14 rounded-xl flex items-center justify-center bg-primary/10 transition-colors group-hover:bg-primary/20">
                      <span className="text-sm font-bold font-mono text-primary">§{result.numero}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3 mb-3">
                        <span className="text-[10px] font-bold font-body uppercase tracking-[0.2em] text-primary/80">{result.capitulo}</span>
                        <ChevronRight size={16} className="text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all shrink-0" />
                      </div>
                      <p className="text-base text-foreground/80 leading-relaxed line-clamp-5 font-reading">
                        {destacar(result.trecho, result.destaques)}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}

              {results.length >= 50 && (
                <p className="text-center text-xs text-muted-foreground font-body py-4">
                  Exibindo apenas os primeiros 50 resultados. Refine sua busca para resultados mais precisos.
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
