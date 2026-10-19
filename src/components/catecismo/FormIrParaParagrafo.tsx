"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Hash } from "lucide-react";

export function FormIrParaParagrafo({ totalParagrafos }: { totalParagrafos: number }) {
  const router = useRouter();
  const [valor, setValor] = useState("");
  const numero = Number(valor);
  const valido = Number.isInteger(numero) && numero >= 1 && numero <= totalParagrafos;

  return (
    <form
      className="flex items-center gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (valido) {
          router.push(`/catecismo/paragrafo/${numero}`);
        }
      }}
    >
      <label htmlFor="ir-para-paragrafo-indice" className="font-body text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
        Ir para o parágrafo
      </label>
      <div className="relative">
        <Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary opacity-60 pointer-events-none" aria-hidden="true" />
        <input
          id="ir-para-paragrafo-indice"
          type="number"
          inputMode="numeric"
          min={1}
          max={totalParagrafos}
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          placeholder="1234"
          className="w-28 rounded-xl border border-border/40 bg-card py-2.5 pl-8 pr-3 font-body text-base outline-none focus:border-primary transition-colors"
        />
      </div>
      <button
        type="submit"
        disabled={!valido}
        aria-label="Ir para o parágrafo"
        className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-all disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <ArrowRight size={16} aria-hidden="true" />
      </button>
    </form>
  );
}
