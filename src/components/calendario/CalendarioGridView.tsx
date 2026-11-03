"use client";

import { motion } from "framer-motion";
import { DateTime } from "luxon";
import { getSeasonsForDate } from "@/lib/shared/anoLiturgico";
import { classeFundoCor } from "./coresLiturgicas";
import { type PropsVisualizacaoGradeCalendario } from "@/types/calendario";
import { Star } from "lucide-react";

const DIAS_SEMANA = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"];

export default function CalendarioGridView({
  dias,
  calendario,
  diaSelecionado,
  estaMontado,
  tempoFiltro,
  diaDestacado,
  aoSelecionarDia,
}: PropsVisualizacaoGradeCalendario) {
  return (
    <div className="calendar-grid ghost-border bg-surface shadow-sm overflow-hidden">
      {/* Day Labels */}
      {DIAS_SEMANA.map((d, idx) => (
        <div
          key={d}
          className={`p-4 border-b border-outline-variant/20 bg-surface-container-lowest text-center font-label-sm text-label-sm text-on-surface-variant ${idx < 6 ? "border-r" : ""}`}
        >
          {d}
        </div>
      ))}

      {/* Days */}
      {dias.map(({ data, ehMesAtual }, idx) => {
        const dateStr = data.toISODate()!;
        const ld = calendario[dateStr] || [];
        const main = ld[0];
        const isSelected = diaSelecionado === dateStr;
        const isToday = estaMontado && data.hasSame(DateTime.now(), "day");
        const cor = main?.cores?.[0] || "BRANCO";
        const noTempo = !!tempoFiltro && getSeasonsForDate(dateStr).some((p) => p.tempo === tempoFiltro);
        const isDestacado = diaDestacado === dateStr;

        return (
          <motion.button
            key={dateStr}
            id={`dia-${dateStr}`}
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              if (ehMesAtual) aoSelecionarDia(dateStr);
            }}
            className={`h-32 sm:h-40 p-3 border-outline-variant/20 flex flex-col justify-between transition-colors text-left
              ${ehMesAtual ? "hover:bg-surface-container-low cursor-pointer" : "bg-surface-container-low/30 cursor-default opacity-40"}
              ${idx % 7 !== 6 ? "border-r" : ""}
              ${idx < dias.length - 7 ? "border-b" : ""}
              ${isSelected ? "bg-surface-container-highest/40 ring-1 ring-inset ring-primary z-10" : ""}
              ${tempoFiltro && ehMesAtual ? (noTempo ? "bg-secondary/10" : "opacity-30") : ""}
              ${isDestacado ? "ring-2 ring-inset ring-secondary animate-pulse z-20" : ""}
            `}
          >
            <div className="flex justify-between items-start w-full">
              <span className={`font-body-md text-body-md ${isToday ? "font-bold text-primary" : "text-on-surface"}`}>
                {data.day}
              </span>
              {main?.rank === "SOLEMNITY" && (
                <Star size={14} className="text-secondary fill-secondary" />
              )}
            </div>

            {main && ehMesAtual && (
              <div className="flex flex-col gap-1 w-full">
                <div 
                  className={`w-full h-1 ${classeFundoCor(cor)}`}
                  title={main.nome}
                />
                <span className="hidden md:block text-[10px] leading-tight font-body-md text-on-surface-variant line-clamp-1">
                  {main.nome}
                </span>
              </div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
