"use client";

import { motion, AnimatePresence } from "framer-motion";
import { DateTime } from "luxon";
import { Book, Music, BookOpen, X } from "lucide-react";
import Link from "next/link";
import { type PropsDrawerDia, type DadosDiaLiturgico, type DevocoesCalendario } from "@/types/calendario";
import DevocoesDoDia from "./DevocoesDoDia";

function Backdrop({ onClick }: { onClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed lg:hidden inset-0 z-40 bg-black/40 backdrop-blur-sm"
      onClick={onClick}
      aria-hidden="true"
    />
  );
}

function Sheet({
  diaSelecionado,
  dadosSelecionados,
  devocoes,
  aoFechar,
}: {
  diaSelecionado: string;
  dadosSelecionados: DadosDiaLiturgico[];
  devocoes: DevocoesCalendario;
  aoFechar: () => void;
}) {
  const main = dadosSelecionados[0];
  const data = DateTime.fromISO(diaSelecionado).setLocale("pt-BR");
  const dataFormatada = data.toFormat("d 'de' MMMM 'de' yyyy");

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 30, stiffness: 320 }}
      className="fixed lg:hidden inset-x-0 bottom-0 z-50 rounded-t-3xl border-t border-outline-variant/30 bg-white shadow-[0_-20px_50px_-15px_rgba(0,0,0,0.15)] overflow-hidden"
      role="dialog"
      aria-label="Detalhes litúrgicos do dia"
      style={{ maxHeight: "90vh" }}
    >
      {/* Drag handle */}
      <div className="flex justify-center pt-3 pb-1">
        <div className="w-12 h-1 bg-outline-variant/30 rounded-full" aria-hidden="true" />
      </div>

      <div className="px-6 md:px-8 pb-10 overflow-y-auto" style={{ maxHeight: "calc(90vh - 40px)" }}>
        <div className="flex justify-between items-start gap-6 mb-8 pt-4">
          <div className="space-y-2">
            <p className="font-label-sm text-label-sm text-secondary uppercase tracking-widest">
              {dataFormatada}
            </p>
            <h3 className="font-headline-md text-headline-md text-primary leading-tight">
              {main.nome}
            </h3>
          </div>
          <button
            onClick={aoFechar}
            className="p-2 rounded-full hover:bg-surface-container-low transition-colors text-on-surface-variant shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <h4 className="font-label-md text-label-md text-primary">Detalhes Litúrgicos</h4>
            <p className="font-body-md text-on-surface-variant leading-relaxed">
              {main.nomeRank} do {main.nomesTemporadas?.join(", ")}.
              Cor Litúrgica: {main.nomesCores?.join(", ")}.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-label-md text-label-md text-primary uppercase tracking-widest">Leituras</h4>
            <div className="grid grid-cols-1 gap-3">
              {[
                { Icon: Book, label: "Primeira Leitura" },
                { Icon: Music, label: "Salmo Responsorial" },
                { Icon: BookOpen, label: "Evangelho" },
              ].map(({ Icon, label }) => (
                <div key={label} className="flex items-center gap-4 p-4 ghost-border bg-surface-container-lowest rounded-lg">
                  <Icon size={18} className="text-secondary shrink-0" />
                  <span className="font-body-md text-on-surface-variant">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <DevocoesDoDia dia={diaSelecionado} devocoes={devocoes} />

          <Link
            href={`/liturgia?dia=${data.day}&mes=${data.month}&ano=${data.year}`}
            className="block w-full py-5 mt-4 bg-primary text-background text-center font-label-md uppercase tracking-widest rounded-lg shadow-xl shadow-primary/10 transition-transform active:scale-[0.98]"
          >
            Ver Liturgia Completa
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default function DaySheet({ diaSelecionado, dadosSelecionados, devocoes, aoFechar }: PropsDrawerDia) {
  return (
    <AnimatePresence>
      {dadosSelecionados && diaSelecionado && (
        <>
          <Backdrop onClick={aoFechar} />
          <Sheet
            diaSelecionado={diaSelecionado}
            dadosSelecionados={dadosSelecionados}
            devocoes={devocoes}
            aoFechar={aoFechar}
          />
        </>
      )}
    </AnimatePresence>
  );
}

