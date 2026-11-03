"use client";

import { motion } from "framer-motion";
import { DateTime } from "luxon";
import { ChevronRight } from "lucide-react";
import { getSeasonsForDate } from "@/lib/shared/anoLiturgico";
import { classeFundoCor } from "./coresLiturgicas";
import { type PropsVisualizacaoListaCalendario } from "@/types/calendario";

export default function CalendarioListView({
  dias,
  calendario,
  diaSelecionado,
  estaMontado,
  tempoFiltro,
  diaDestacado,
  aoSelecionarDia,
}: PropsVisualizacaoListaCalendario) {
  return (
    <div className="ghost-border bg-surface shadow-sm overflow-hidden divide-y divide-outline-variant/20">
      {dias.map((data) => {
        const dateStr = data.toISODate()!;
        const ld = calendario[dateStr] || [];
        const main = ld[0];
        const isSelected = diaSelecionado === dateStr;
        const isToday = estaMontado && data.hasSame(DateTime.now(), "day");
        const diaSemana = data.setLocale("pt-BR").toFormat("ccc").toUpperCase();
        const cor = main?.cores?.[0] || "BRANCO";
        const noTempo = !!tempoFiltro && getSeasonsForDate(dateStr).some((p) => p.tempo === tempoFiltro);
        const isDestacado = diaDestacado === dateStr;


        return (
          <motion.button
            key={dateStr}
            id={`dia-${dateStr}`}
            type="button"
            whileTap={{ scale: 0.99 }}
            onClick={() => {
              if (main) aoSelecionarDia(dateStr);
            }}
            className={`w-full flex items-center gap-6 px-6 py-4 text-left transition-colors hover:bg-surface-container-low
              ${isSelected ? "bg-surface-container-low ring-1 ring-inset ring-primary/20" : ""}
              ${tempoFiltro ? (noTempo ? "bg-secondary/10" : "opacity-30") : ""}
              ${isDestacado ? "ring-2 ring-inset ring-secondary animate-pulse" : ""}
            `}
          >
            {/* Date Info */}
            <div className="flex flex-col items-center w-12 shrink-0">
              <span className="text-[10px] font-label-sm text-on-surface-variant tracking-widest mb-1">
                {diaSemana}
              </span>
              <span className={`text-xl font-body-md ${isToday ? "font-bold text-primary" : "text-on-surface"}`}>
                {data.day}
              </span>
            </div>

            {/* Liturgical Color Dot */}
            <div 
              className={`w-3 h-3 rounded-full shrink-0 ${classeFundoCor(cor)}`}
              aria-hidden="true"
            />

            {/* Celebration Info */}
            <div className="flex-1 min-w-0">
              {main ? (
                <>
                  <h4 className="text-body-md font-medium text-on-surface line-clamp-1">
                    {main.nome}
                  </h4>
                  <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mt-0.5">
                    {main.nomeRank}
                  </p>
                </>
              ) : (
                <p className="text-body-md text-on-surface-variant italic">Féria</p>
              )}
            </div>

            {/* Action */}
            <ChevronRight size={18} className="text-outline-variant opacity-50" />
          </motion.button>
        );
      })}
    </div>
  );
}

