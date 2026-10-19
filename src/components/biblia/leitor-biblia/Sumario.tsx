import { useLayoutEffect, useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PropsSumario } from "@/types/biblia";

export default function Sumario({
  t,
  capitulos,
  indexAtual,
  estaAberto,
  aoFechar,
  aoSelecionar,
}: PropsSumario) {
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
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className={`fixed left-0 z-40 w-[min(20rem,100vw)] overflow-y-auto overscroll-contain rounded-br-2xl border-r border-b shadow-2xl ${t.borda}`}
            style={{ top: topo, maxHeight: `calc(100dvh - ${topo}px)`, background: t.bg }}
            role="dialog"
            aria-label="Índice de capítulos"
          >
            <div className={`flex items-center justify-between px-6 py-5 border-b sticky top-0 backdrop-blur-md z-10 ${t.barraFerramentas}`}>
              <p className={`font-heading font-medium text-lg ${t.texto}`}>Capítulos</p>
              <button
                onClick={aoFechar}
                aria-label="Fechar índice"
                className={`p-2 rounded-xl transition-all hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${t.muted}`}
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-4 gap-2">
              {capitulos.map((ch, idx) => (
                <button
                  key={ch.capitulo}
                  onClick={() => aoSelecionar(idx)}
                  aria-label={`Capítulo ${ch.capitulo}`}
                  aria-current={idx === indexAtual ? "true" : undefined}
                  className={`aspect-square rounded-xl text-xs font-bold font-body transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary border ${
                    idx === indexAtual
                      ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-110 z-10"
                      : "border-transparent hover:border-primary/30 hover:bg-primary/5 opacity-70 hover:opacity-100"
                  }`}
                >
                  {ch.capitulo}
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
