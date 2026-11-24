"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronRight, Loader2, ArrowLeft, BookOpen, X, AlertCircle, BookMarked } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { parsearReferencia, urlDaReferencia } from "@/lib/server/utils/parsearReferencia";
import { Breadcrumb } from "@/components/shared/Breadcrumb";

interface ResultadoBusca { book: string; chapter: number; verse: number; text: string; }

const TERMOS_RAPIDOS = ["Amor", "Paz", "Justiça", "Oração", "Salvação", "Luz", "Graça"];

function destacar(text: string, query: string) {
  if (!query.trim()) {
    return <>{text}</>;
  }
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part)
          ? <mark key={i} className="rounded px-0.5 not-italic font-bold" style={{ background: "hsl(var(--gold)/0.25)", color: "hsl(var(--foreground))" }}>{part}</mark>
          : <span key={i}>{part}</span>
      )}
    </>
  );
}

export default function PaginaBuscaBiblia() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ResultadoBusca[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState(false);
  const [referencia, setReferencia] = useState<{ label: string; url: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    if (query.length < 3) {
      /* eslint-disable-next-line react-hooks/set-state-in-effect */
      setResults([]);
      setSearched(false);
      setError(false);
      setReferencia(null);
      return;
    }

    // Tenta interpretar como referência bíblica antes de fazer a busca full-text
    const ref = parsearReferencia(query);
    if (ref) {
      setReferencia({
        label: `${ref.livro} ${ref.capitulo}${ref.versiculo ? `,${ref.versiculo}` : ""}`,
        url: urlDaReferencia(ref),
      });
    } else {
      setReferencia(null);
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      setError(false);
      try {
        const res = await fetch(`/api/biblia/search?q=${encodeURIComponent(query)}`);
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
    setReferencia(null);
    inputRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border/40 bg-card/30 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 py-12 md:py-20">
          <Breadcrumb items={[{ label: "Bíblia", href: "/biblia" }, { label: "Pesquisar" }]} className="mb-6" />
          <Link
            href="/biblia"
            className="inline-flex items-center gap-2 text-[10px] font-body font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors mb-8 group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Voltar para a Bíblia
          </Link>

          <h1 className="font-heading text-5xl md:text-6xl text-foreground mb-4 font-medium">Pesquisar</h1>
          <p className="font-body text-sm md:text-base text-muted-foreground mb-12 max-w-xl">
            Busque por palavras, frases ou referências (ex: <span className="font-semibold text-primary">Jo 3,16</span>) em toda a Bíblia Ave Maria.
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
              placeholder='Ex: "No princípio", amor, Jo 3,16…'
              className="w-full bg-card border border-border/40 rounded-2xl shadow-sm focus:border-primary focus:ring-0 transition-all py-6 pl-16 pr-16 text-lg md:text-xl outline-none placeholder:text-muted-foreground/40 font-body"
            />
            {query && (
              <button onClick={limparPesquisa} className="absolute right-6 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors focus:outline-none" aria-label="Limpar pesquisa">
                <X className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Atalho de referência bíblica */}
          <AnimatePresence>
            {referencia && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="mt-4"
              >
                <button
                  onClick={() => router.push(referencia.url)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-body font-bold transition-all border border-primary/30 hover:bg-primary/5"
                  style={{ color: "hsl(var(--primary))" }}
                >
                  <BookMarked size={16} />
                  Ir direto para {referencia.label}
                  <ChevronRight size={14} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {query.length > 0 && query.length < 3 && (
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
                      Use palavras-chave como &quot;alegria&quot; ou referências como <strong>Jo 3,16</strong> para ir direto ao versículo.
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
                  <p className="font-heading text-lg font-semibold text-foreground/40">Nenhum versículo encontrado</p>
                  <p className="text-sm text-muted-foreground font-body max-w-xs mx-auto">Tente palavras diferentes ou verifique a ortografia.</p>
                </motion.div>
              )}

              {results.map((result, idx) => (
                <motion.div key={`${result.book}-${result.chapter}-${result.verse}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(idx * 0.04, 0.4) }}>
                  <Link
                    href={`/biblia/${encodeURIComponent(result.book)}/${result.chapter}?v=${result.verse}`}
                    className="group flex gap-6 rounded-2xl p-6 transition-all duration-300 border border-border/40 bg-card hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <div className="shrink-0 px-3 h-12 rounded-xl flex items-center justify-center bg-primary/10 transition-colors group-hover:bg-primary/20">
                      <span className="text-sm font-bold font-mono text-primary">{result.chapter}:{result.verse}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-bold font-body uppercase tracking-[0.2em] text-primary/80">{result.book}</span>
                        <ChevronRight size={16} className="text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all shrink-0" />
                      </div>
                      <p className="text-base text-foreground/80 leading-relaxed line-clamp-4 font-reading italic">
                        &quot;{destacar(result.text, query)}&quot;
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
