"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2, X, FileText, Users, BookOpen, BookMarked, CornerDownLeft } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ResultadoBusca, TipoResultadoBusca } from "@/types/busca";

const SUGESTOES = ["Batismo", "Páscoa", "São Francisco", "Ave Maria", "Missa"];

const CONFIG_TIPO: Record<TipoResultadoBusca, { label: string; icone: LucideIcon }> = {
  pagina: { label: "Páginas", icone: FileText },
  santo: { label: "Santos", icone: Users },
  oracao: { label: "Orações", icone: BookOpen },
  biblia: { label: "Bíblia", icone: BookMarked },
};
const ORDEM_TIPOS: TipoResultadoBusca[] = ["pagina", "santo", "oracao", "biblia"];

interface Estado {
  aberto: boolean;
  valor: string;
  resultados: ResultadoBusca[];
  carregando: boolean;
  buscou: boolean;
  indiceAtivo: number;
}

type Acao =
  | { type: "ABRIR" }
  | { type: "FECHAR" }
  | { type: "SET_VALOR"; payload: string }
  | { type: "SET_RESULTADOS"; payload: ResultadoBusca[] }
  | { type: "SET_CARREGANDO"; payload: boolean }
  | { type: "MOVER_INDICE"; payload: number };

const ESTADO_INICIAL: Estado = {
  aberto: false,
  valor: "",
  resultados: [],
  carregando: false,
  buscou: false,
  indiceAtivo: -1,
};

function reducer(state: Estado, action: Acao): Estado {
  switch (action.type) {
    case "ABRIR":
      return { ...ESTADO_INICIAL, aberto: true };
    case "FECHAR":
      return { ...ESTADO_INICIAL, aberto: false };
    case "SET_VALOR":
      return { ...state, valor: action.payload, indiceAtivo: -1 };
    case "SET_RESULTADOS":
      return { ...state, resultados: action.payload, buscou: true, indiceAtivo: -1 };
    case "SET_CARREGANDO":
      return { ...state, carregando: action.payload };
    case "MOVER_INDICE":
      return { ...state, indiceAtivo: action.payload };
    default:
      return state;
  }
}

export default function BuscaGlobal() {
  const router = useRouter();
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement>(null);
  const painelRef = useRef<HTMLDivElement>(null);
  const [state, dispatch] = useReducer(reducer, ESTADO_INICIAL);
  const [montado, setMontado] = useState(false);

  const fechar = useCallback(() => dispatch({ type: "FECHAR" }), []);

  // O header tem backdrop-blur, que cria um containing block novo para position:fixed
  // e prende o modal dentro da caixa do header. Um portal para o body evita isso.
  useEffect(() => setMontado(true), []);

  // Atalho global Ctrl/Cmd+K e Esc
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        dispatch({ type: "ABRIR" });
      } else if (e.key === "Escape") {
        dispatch({ type: "FECHAR" });
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Fecha ao navegar e trava o scroll do body enquanto o modal está aberto
  useEffect(() => {
    dispatch({ type: "FECHAR" });
  }, [pathname]);

  useEffect(() => {
    if (!state.aberto) return;
    document.body.style.overflow = "hidden";
    const raf = requestAnimationFrame(() => inputRef.current?.focus());
    return () => {
      document.body.style.overflow = "";
      cancelAnimationFrame(raf);
    };
  }, [state.aberto]);

  // Debounce da busca
  useEffect(() => {
    if (state.valor.trim().length < 2) {
      dispatch({ type: "SET_RESULTADOS", payload: [] });
      return;
    }

    dispatch({ type: "SET_CARREGANDO", payload: true });
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/busca?q=${encodeURIComponent(state.valor)}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        dispatch({ type: "SET_RESULTADOS", payload: data.resultados ?? [] });
      } catch (err) {
        console.error("[BuscaGlobal]", err);
        dispatch({ type: "SET_RESULTADOS", payload: [] });
      } finally {
        dispatch({ type: "SET_CARREGANDO", payload: false });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [state.valor]);

  const irPara = useCallback(
    (href: string) => {
      fechar();
      router.push(href);
    },
    [fechar, router]
  );

  const handleKeyDownInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      dispatch({ type: "MOVER_INDICE", payload: Math.min(state.indiceAtivo + 1, state.resultados.length - 1) });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      dispatch({ type: "MOVER_INDICE", payload: Math.max(state.indiceAtivo - 1, 0) });
    } else if (e.key === "Enter") {
      e.preventDefault();
      const alvo = state.resultados[state.indiceAtivo] ?? state.resultados[0];
      if (alvo) irPara(alvo.href);
    }
  };

  let contadorGlobal = -1;

  return (
    <>
      <button
        type="button"
        onClick={() => dispatch({ type: "ABRIR" })}
        aria-label="Abrir pesquisa global"
        className="flex items-center gap-2 p-2 rounded-lg text-[#1b1c19] hover:bg-[#f0eee9] transition-colors focus-visible:outline-none"
      >
        <Search size={20} aria-hidden="true" />
      </button>

      {montado && createPortal(
      <AnimatePresence>
        {state.aberto && (
          <motion.div
            key="busca-global-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto backdrop-blur-sm px-4 py-20 md:py-28"
            onMouseDown={(e) => {
              if (painelRef.current && !painelRef.current.contains(e.target as Node)) fechar();
            }}
          >
            <motion.div
              key="busca-global-painel"
              ref={painelRef}
              role="dialog"
              aria-modal="true"
              aria-label="Pesquisa global"
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="w-full max-w-2xl max-h-[70vh] flex flex-col overflow-hidden rounded-2xl border border-[#c9a84c]/25 bg-white shadow-xl"
            >
              <div className="flex items-center gap-3 border-b border-outline-variant px-5 py-4">
                {state.carregando
                  ? <Loader2 size={18} className="shrink-0 animate-spin text-outline" aria-hidden="true" />
                  : <Search size={18} className="shrink-0 text-outline" aria-hidden="true" />
                }
                <input
                  ref={inputRef}
                  type="search"
                  role="combobox"
                  value={state.valor}
                  onChange={(e) => dispatch({ type: "SET_VALOR", payload: e.target.value })}
                  onKeyDown={handleKeyDownInput}
                  placeholder="Pesquisar em todo o site..."
                  aria-label="Pesquisar em todo o site"
                  aria-autocomplete="list"
                  aria-expanded={state.resultados.length > 0}
                  aria-controls="busca-global-resultados"
                  className="flex-1 bg-transparent text-base font-body-md text-on-surface outline-none placeholder:text-outline-variant"
                />
                <button
                  type="button"
                  onClick={fechar}
                  aria-label="Fechar pesquisa"
                  className="shrink-0 rounded-lg p-1 text-outline hover:bg-surface-container transition-colors"
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </div>

              <div id="busca-global-resultados" className="min-h-0 flex-1 overflow-y-auto p-2">
                {state.valor.trim().length < 2 && (
                  <div className="p-4">
                    <p className="mb-3 font-label-sm text-[11px] uppercase tracking-widest text-on-surface-variant">
                      Sugestões
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {SUGESTOES.map((termo) => (
                        <button
                          key={termo}
                          type="button"
                          onClick={() => dispatch({ type: "SET_VALOR", payload: termo })}
                          className="rounded-full border border-outline-variant px-3 py-1.5 text-sm font-body-sm text-on-surface-variant hover:border-primary hover:text-primary transition-colors"
                        >
                          {termo}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {state.valor.trim().length >= 2 && !state.carregando && state.buscou && state.resultados.length === 0 && (
                  <p className="p-6 text-center font-body-sm text-on-surface-variant">
                    Nenhum resultado encontrado para &ldquo;{state.valor}&rdquo;.
                  </p>
                )}

                {ORDEM_TIPOS.map((tipo) => {
                  const itens = state.resultados.filter((r) => r.tipo === tipo);
                  if (itens.length === 0) return null;
                  const { label, icone: Icone } = CONFIG_TIPO[tipo];

                  return (
                    <div key={tipo} className="mb-2">
                      <p className="px-3 pt-3 pb-1 font-label-sm text-[11px] uppercase tracking-widest text-on-surface-variant">
                        {label}
                      </p>
                      <ul role="listbox" aria-label={label}>
                        {itens.map((item) => {
                          contadorGlobal += 1;
                          const idx = contadorGlobal;
                          const ativo = idx === state.indiceAtivo;
                          return (
                            <li key={`${item.tipo}-${item.href}-${item.titulo}`} role="option" aria-selected={ativo}>
                              <button
                                type="button"
                                onClick={() => irPara(item.href)}
                                onMouseEnter={() => dispatch({ type: "MOVER_INDICE", payload: idx })}
                                className={`flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${ativo ? "bg-surface-container" : "hover:bg-surface-container"
                                  }`}
                              >
                                <Icone size={16} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
                                <span className="min-w-0 flex-1">
                                  <span className="block truncate font-heading text-sm text-on-surface">{item.titulo}</span>
                                  <span className="block truncate font-body-sm text-xs text-on-surface-variant">{item.descricao}</span>
                                </span>
                                {ativo && <CornerDownLeft size={14} className="mt-1 shrink-0 text-outline" aria-hidden="true" />}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
      )}
    </>
  );
}
