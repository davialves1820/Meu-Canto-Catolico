import { useLayoutEffect, useState } from "react";
import { X } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { DivisaoCatecismo, ResumoParte } from "@/types/catecismo";
import type { TokensTema } from "@/types/biblia";

interface Props {
  t: TokensTema;
  indice: ResumoParte[];
  slugAtual: string;
  estaAberto: boolean;
  aoFechar: () => void;
}

/** Artigos e parágrafos temáticos do capítulo aberto (sem os tópicos I., II.… para não alongar demais). */
function DivisoesCapituloAtual({ divisoes, t, aoFechar }: { divisoes: DivisaoCatecismo[]; t: TokensTema; aoFechar: () => void }) {
  return (
    <ul className={`mt-1 mb-2 ml-3 space-y-0.5 border-l pl-3 ${t.borda}`}>
      {divisoes.map((d) => (
        <li key={d.inicio}>
          <a
            href={`#s-${d.inicio}`}
            onClick={aoFechar}
            className={`block rounded-lg px-2 py-1.5 text-[13px] font-body leading-snug transition-all hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${t.texto}`}
          >
            <span className="mr-1.5 text-[10px] font-bold text-primary/70">{/^[IVX]+$/.test(d.rotulo) ? `${d.rotulo}.` : d.rotulo}</span>
            {d.titulo}
          </a>
          {d.subdivisoes.some((s) => !/^[IVX]+$/.test(s.rotulo)) && (
            <DivisoesCapituloAtual divisoes={d.subdivisoes.filter((s) => !/^[IVX]+$/.test(s.rotulo))} t={t} aoFechar={aoFechar} />
          )}
        </li>
      ))}
    </ul>
  );
}

export default function SumarioCatecismo({ t, indice, slugAtual, estaAberto, aoFechar }: Props) {
  // O painel fica fixo logo abaixo do header do site (que é sticky), sem cobri-lo
  const [topo, setTopo] = useState(0);

  useLayoutEffect(() => {
    if (!estaAberto) return;
    const medir = () => setTopo(Math.max(0, document.querySelector("header")?.getBoundingClientRect().bottom ?? 0));
    medir();
    window.addEventListener("resize", medir);
    return () => window.removeEventListener("resize", medir);
  }, [estaAberto]);

  useLayoutEffect(() => {
    if (!estaAberto) return;
    const aoTeclar = (e: KeyboardEvent) => e.key === "Escape" && aoFechar();
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [estaAberto, aoFechar]);

  return (
    <AnimatePresence>
      {estaAberto && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-x-0 bottom-0 z-30 bg-black/20"
            style={{ top: topo }}
            onClick={aoFechar}
            aria-hidden="true"
          />
          <motion.div
            initial={{ x: -360, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -360, opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className={`fixed left-0 z-40 w-[min(22rem,100vw)] overflow-y-auto overscroll-contain rounded-br-2xl border-r border-b shadow-2xl ${t.borda}`}
            style={{ top: topo, maxHeight: `calc(100dvh - ${topo}px)`, background: t.bg }}
            role="dialog"
            aria-label="Sumário do Catecismo"
          >
            <div className={`flex items-center justify-between px-6 py-5 border-b sticky top-0 backdrop-blur-md z-10 ${t.barraFerramentas}`}>
              <p className={`font-heading font-medium text-lg ${t.texto}`}>Sumário</p>
              <button
                onClick={aoFechar}
                aria-label="Fechar sumário"
                className={`p-2 rounded-xl transition-all hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${t.muted}`}
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <nav className="p-4 space-y-6">
              {indice.map((parte) => (
                <div key={parte.numero}>
                  <p className="px-3 mb-2 font-body text-[10px] font-bold uppercase tracking-[0.25em] text-primary">
                    {parte.rotulo || parte.titulo}
                  </p>
                  {parte.rotulo && (
                    <p className={`px-3 mb-2 font-heading text-sm ${t.muted}`}>{parte.titulo}</p>
                  )}
                  <ul className="space-y-0.5">
                    {parte.capitulos.map((cap) => {
                      const atual = cap.slug === slugAtual;
                      return (
                        <li key={cap.slug}>
                          <Link
                            href={`/catecismo/${cap.slug}`}
                            onClick={aoFechar}
                            aria-current={atual ? "page" : undefined}
                            className={`flex items-baseline justify-between gap-3 rounded-xl px-3 py-2 text-sm font-body transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                              atual ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : `${t.texto} hover:bg-primary/5`
                            }`}
                          >
                            <span>{cap.titulo}</span>
                            <span className={`shrink-0 text-[10px] font-bold ${atual ? "opacity-80" : "opacity-50"}`}>
                              {cap.inicio}–{cap.fim}
                            </span>
                          </Link>
                          {atual && cap.divisoes.length > 0 && (
                            <DivisoesCapituloAtual divisoes={cap.divisoes} t={t} aoFechar={aoFechar} />
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
