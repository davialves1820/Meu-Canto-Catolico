"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { DateTime } from "luxon";
import { Book, Music, BookOpen, Calendar as CalendarIcon } from "lucide-react";
import { type PropsBarraLateralDia } from "@/types/calendario";
import DevocoesDoDia from "./DevocoesDoDia";

export default function DaySidebar({ diaSelecionado, dadosSelecionados, devocoes }: PropsBarraLateralDia) {
  const dataFormatada = diaSelecionado
    ? DateTime.fromISO(diaSelecionado).setLocale("pt-BR").toFormat("d 'de' MMMM 'de' yyyy")
    : "";

  const dataUrl = diaSelecionado ? DateTime.fromISO(diaSelecionado) : null;

  return (
    <aside className="hidden lg:block lg:col-span-1 space-y-gutter">
      <AnimatePresence mode="wait">
        {dadosSelecionados && diaSelecionado ? (
          <motion.div
            key={diaSelecionado}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="sticky top-24 ghost-border bg-surface p-8 sacred-shadow space-y-8"
          >
            <div className="border-b border-outline-variant/30 pb-6 mb-6">
              <h3 className="font-label-sm text-label-sm uppercase tracking-widest text-secondary mb-2">
                {dataFormatada}
              </h3>
              <h2 className="font-headline-lg text-headline-lg text-on-surface">
                {dadosSelecionados[0].nome}
              </h2>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="font-label-md text-label-md mb-2 text-secondary uppercase tracking-widest">Detalhes Litúrgicos</h4>
                <p className="font-body-md text-on-surface-variant leading-relaxed">
                  {dadosSelecionados[0].nomeRank} do {dadosSelecionados[0].nomesTemporadas?.join(", ")}.
                  Cor Litúrgica: {dadosSelecionados[0].nomesCores?.join(", ")}.
                </p>
              </div>

              <div>
                <h4 className="font-label-md text-label-md mb-3 text-secondary uppercase tracking-widest">Sugestão de Leituras</h4>
                <ul className="space-y-3 text-on-surface-variant font-body-md">
                  <li className="flex items-center gap-3 group cursor-default">
                    <span className="p-1.5 rounded-full bg-surface-container-low text-secondary transition-colors group-hover:bg-secondary group-hover:text-background">
                      <Book size={14} />
                    </span>
                    <span className="group-hover:text-primary transition-colors">Primeira Leitura</span>
                  </li>
                  <li className="flex items-center gap-3 group cursor-default">
                    <span className="p-1.5 rounded-full bg-surface-container-low text-secondary transition-colors group-hover:bg-secondary group-hover:text-background">
                      <Music size={14} />
                    </span>
                    <span className="group-hover:text-primary transition-colors">Salmo Responsorial</span>
                  </li>
                  <li className="flex items-center gap-3 group cursor-default">
                    <span className="p-1.5 rounded-full bg-surface-container-low text-secondary transition-colors group-hover:bg-secondary group-hover:text-background">
                      <BookOpen size={14} />
                    </span>
                    <span className="group-hover:text-primary transition-colors">Evangelho</span>
                  </li>
                </ul>
              </div>

              <DevocoesDoDia dia={diaSelecionado} devocoes={devocoes} />

              {dataUrl && (
                <Link
                  href={`/liturgia?dia=${dataUrl.day}&mes=${dataUrl.month}&ano=${dataUrl.year}`}
                  className="block w-full py-4 bg-primary text-background text-center font-label-md uppercase tracking-widest transition-all active:scale-95 hover:opacity-90 shadow-lg shadow-primary/10"
                >
                  Ver Liturgia Completa
                </Link>
              )}
            </div>
          </motion.div>
        ) : (
          <div className="sticky top-24 ghost-border bg-surface p-12 sacred-shadow text-center space-y-4">
            <CalendarIcon size={48} className="mx-auto text-outline-variant opacity-30" />
            <p className="font-body-md text-on-surface-variant italic">
              Selecione um dia no calendário para contemplar seus mistérios.
            </p>
          </div>
        )}
      </AnimatePresence>
    </aside>
  );
}

