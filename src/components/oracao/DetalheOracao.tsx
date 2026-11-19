"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, Book, Sparkles, Link2 } from "lucide-react";
import { PropsDetalheOracao } from "@/types/oracao";
import { useFocusTrap } from "@/lib/client/hooks/utils/useFocusTrap";

function TextoOracao({ text, title }: { text: string; title: string }) {
  const paragraphs = text.split(/\n\n+/);
  return (
    <article className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-2 h-2 rounded-full bg-secondary" />
        <h4 className="font-label-md text-primary tracking-[0.2em]">{title.toUpperCase()}</h4>
      </div>
      <div className="space-y-8">
        {paragraphs.map((para, i) => (
          <p
            key={i}
            className={
              i === 0
                ? "font-headline-md italic leading-relaxed text-on-surface border-l-2 border-secondary/20 pl-6 md:pl-8"
                : "font-body-lg text-on-surface-variant leading-relaxed pl-6 md:pl-8"
            }
          >
            {para}
          </p>
        ))}
      </div>
    </article>
  );
}

export default function DetalheOracao({
  oracao: prayer,
  aoFechar: onClose,
  aoAnterior: onPrev,
  aoProximo: onNext,
  temAnterior: hasPrev,
  temProximo: hasNext,
}: PropsDetalheOracao) {
  // Focus trap: aprisiona foco dentro do modal enquanto aberto
  const modalRef = useFocusTrap<HTMLDivElement>(true);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
      if (e.key === "ArrowRight") {
        onNext();
      }
      if (e.key === "ArrowLeft") {
        onPrev();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose, onNext, onPrev]);

  // Impede scroll do fundo enquanto modal está aberto
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "auto"; };
  }, []);

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="prayer-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        aria-hidden="true"
      />

      {/* Modal */}
      <motion.div
        key="prayer-modal"
        ref={modalRef}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        role="dialog"
        aria-modal="true"
        aria-label={`Oração: ${prayer.titulo}`}
        className="fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-3xl border-t border-border overflow-hidden shadow-2xl md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:top-12 md:bottom-12 md:w-[800px] md:rounded-2xl md:border bg-surface-container-lowest max-h-[95vh] md:max-h-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-secondary/10 bg-surface-container-low/50 sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-primary">
              <Book size={18} />
            </div>
            <span className="font-label-sm text-secondary tracking-widest truncate max-w-[150px] md:max-w-none">
              {prayer.categoria}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onPrev}
              disabled={!hasPrev}
              className="p-2 hover:bg-black/5 rounded-full transition-colors text-on-surface-variant disabled:opacity-20"
              aria-label="Oração anterior"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={onNext}
              disabled={!hasNext}
              className="p-2 hover:bg-black/5 rounded-full transition-colors text-on-surface-variant disabled:opacity-20"
              aria-label="Próxima oração"
            >
              <ChevronRight size={20} />
            </button>
            <Link
              href={`/oracoes/${prayer.slug}`}
              className="p-2 hover:bg-black/5 rounded-full transition-colors text-on-surface-variant"
              aria-label="Abrir a página desta oração"
              title="Abrir a página desta oração"
            >
              <Link2 size={20} />
            </Link>
            <div className="w-px h-4 bg-secondary/10 mx-1" />
            <button
              onClick={onClose}
              className="p-2 hover:bg-black/5 rounded-full transition-colors text-on-surface-variant"
              aria-label="Fechar oração"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
          <div className="px-6 md:px-16 py-10 md:py-20">
            <TextoOracao text={prayer.texto} title={prayer.titulo} />
            <div className="mt-16 pt-12 border-t border-secondary/5 flex flex-col items-center text-center">
              <Sparkles className="text-secondary/20 mb-4" size={24} aria-hidden="true" />
              <p className="font-label-sm text-outline-variant italic">Ad Maiorem Dei Gloriam</p>
            </div>
          </div>
        </div>

        <div className="h-4 md:hidden bg-surface-container-lowest shrink-0" />
      </motion.div>
    </AnimatePresence>
  );
}
