import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { TokensTema } from "@/types/biblia";

interface Props {
  t: TokensTema;
  estaAberto: boolean;
  totalParagrafos: number;
  aoIrPara: (numero: number) => void;
}

export default function IrParaParagrafo({ t, estaAberto, totalParagrafos, aoIrPara }: Props) {
  const [valor, setValor] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (estaAberto) {
      inputRef.current?.focus();
    }
  }, [estaAberto]);

  const numero = Number(valor);
  const valido = Number.isInteger(numero) && numero >= 1 && numero <= totalParagrafos;

  return (
    <AnimatePresence>
      {estaAberto && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className={`overflow-hidden border-b shadow-inner ${t.borda}`}
        >
          <form
            className="p-6 flex flex-wrap items-center gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (valido) {
                aoIrPara(numero);
                setValor("");
              }
            }}
          >
            <label htmlFor="ir-para-paragrafo" className={`text-[10px] font-bold font-body uppercase tracking-[0.2em] opacity-60 ${t.muted}`}>
              Ir para o parágrafo
            </label>
            <input
              ref={inputRef}
              id="ir-para-paragrafo"
              type="number"
              inputMode="numeric"
              min={1}
              max={totalParagrafos}
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder={`1 – ${totalParagrafos}`}
              className={`w-36 rounded-xl border bg-transparent px-4 py-2.5 font-body text-base outline-none focus:border-primary ${t.borda} ${t.texto}`}
            />
            <button
              type="submit"
              disabled={!valido}
              className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 font-body text-xs font-bold uppercase tracking-widest bg-primary text-primary-foreground transition-all disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Ir <ArrowRight size={14} aria-hidden="true" />
            </button>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
