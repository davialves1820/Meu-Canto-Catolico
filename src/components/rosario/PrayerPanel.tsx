"use client";

import { AnimatePresence, motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import type { PropsPrayerPanel } from "@/types/rosario";
import { tituloOracoesForaDasDezenas } from "@/lib/rosario/sequencia";
import { PrayerCard } from "./PrayerCard";

export function PrayerPanel({ grupo, passo, oracao, tamanhoFonte }: PropsPrayerPanel) {
  if (!passo || !oracao) {
    return (
      <div className="rounded-2xl border border-[#c9a84c]/25 bg-white p-6 text-center">
        <p aria-hidden="true" className="mb-3 text-3xl">
          {grupo.emoji}
        </p>
        <h3 className="font-heading text-xl font-semibold mb-2 text-primary">{grupo.nome}</h3>
        <p className="font-body-md text-on-surface-variant">{grupo.descricao}</p>
        <p className="mt-4 font-body-sm text-on-surface-variant">
          Toque em &ldquo;Sinal da Cruz&rdquo; na lista ao lado, ou no botão Começar, para iniciar.
        </p>
      </div>
    );
  }

  const misterio = passo.grupoIndex !== undefined ? grupo.misterios[passo.grupoIndex] : null;
  const tituloSecao = misterio ? null : tituloOracoesForaDasDezenas(passo);

  return (
    <div className="rounded-2xl border border-[#c9a84c]/25 bg-white p-5 space-y-4">
      <div>
        <p className="font-label-sm text-secondary">{grupo.nome}</p>
        {misterio ? (
          <>
            <h3 className="font-heading text-xl font-semibold mt-1 text-primary">
              {misterio.numero}º Mistério — {misterio.nome}
            </h3>
            <p className="mt-0.5 font-body-sm italic text-on-surface-variant">Fruto: {misterio.fruto}</p>
          </>
        ) : (
          <h3 className="font-heading text-xl font-semibold mt-1 text-primary">{tituloSecao}</h3>
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={misterio ? `${misterio.numero}` : tituloSecao}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
        >
          {misterio && (
            <div className="flex gap-2 rounded-lg border border-[#c9a84c]/25 p-3 mb-4" style={{ backgroundColor: grupo.bgCor }}>
              <BookOpen size={16} className="mt-0.5 shrink-0" style={{ color: grupo.cor }} aria-hidden="true" />
              <p className="font-body-sm leading-relaxed text-on-surface">{misterio.meditacao}</p>
            </div>
          )}

          <p className="mb-1.5 font-label-sm text-secondary">Rezando agora</p>
          <p className="mb-3 font-body-sm font-semibold text-on-surface">{passo.rotulo}</p>

          <PrayerCard oracao={oracao} tamanhoFonte={tamanhoFonte} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
