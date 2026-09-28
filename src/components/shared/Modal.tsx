"use client";

import { useEffect, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useFocusTrap } from "@/lib/client/hooks/utils/useFocusTrap";

interface Props {
  aberto: boolean;
  aoFechar: () => void;
  titulo: string;
  descricao?: string;
  children: ReactNode;
}

export default function Modal({ aberto, aoFechar, titulo, descricao, children }: Props) {
  const modalRef = useFocusTrap<HTMLDivElement>(aberto);

  useEffect(() => {
    if (!aberto) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") aoFechar();
    };
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [aberto, aoFechar]);

  return (
    <AnimatePresence>
      {aberto && (
        <>
          <motion.div
            key="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={aoFechar}
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
            aria-hidden="true"
          />
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              key="modal-card"
              ref={modalRef}
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              role="dialog"
              aria-modal="true"
              aria-label={titulo}
              className="w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-xl p-8 relative pointer-events-auto max-h-[85vh] overflow-y-auto"
            >
              <button
                type="button"
                onClick={aoFechar}
                aria-label="Fechar"
                className="absolute top-4 right-4 p-1.5 rounded-full text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
              >
                <X size={18} aria-hidden="true" />
              </button>
              <div className="mb-6 pr-8">
                <h2 className="font-headline-md text-primary">{titulo}</h2>
                {descricao && <p className="font-body-sm text-on-surface-variant mt-1">{descricao}</p>}
              </div>
              {children}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
