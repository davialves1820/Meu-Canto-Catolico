"use client";

import { useEffect } from "react";
import { type PropsVisualizacaoCalendario } from "@/types/calendario";
import { useCalendario } from "../../lib/client/hooks/calendario/useCalendario";
import CalendarioHeader from "./CalendarioHeader";
import CalendarioGridView from "./CalendarioGridView";
import CalendarioListView from "./CalendarioListView";
import DaySidebar from "./DaySidebar";
import DaySheet from "./DaySheet";
import FiltroTempoLiturgico from "./FiltroTempoLiturgico";
import CardTempoLiturgico from "./CardTempoLiturgico";
import BuscaCalendario from "./BuscaCalendario";
import { CalendarioSkeleton } from "@/components/ui/skeletons";

export default function CalendarioView({ calendarioInicial }: PropsVisualizacaoCalendario) {
  const cal = useCalendario(calendarioInicial);

  // Depois de uma busca, leva o usuário até a data destacada.
  useEffect(() => {
    if (!cal.diaDestacado) return;
    const handle = requestAnimationFrame(() => {
      document.getElementById(`dia-${cal.diaDestacado}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    return () => cancelAnimationFrame(handle);
  }, [cal.diaDestacado, cal.modoVisualizacao]);

  // Renderiza skeleton durante hidratação em vez de null,
  // evitando layout shift (CLS) — especialmente visível em mobile.
  if (!cal.estaMontado) {
    return <CalendarioSkeleton />;
  }

  return (
    <main className="pt-4 md:pt-12 pb-24 px-gutter max-w-container-max mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        <div className="col-span-1 lg:col-span-2">
          <BuscaCalendario
            ano={cal.dataAtual.year}
            calendario={calendarioInicial}
            aoSelecionarTempo={cal.selecionarTempo}
            aoIrParaData={cal.irParaData}
          />

          <FiltroTempoLiturgico
            tempoFiltro={cal.tempoFiltro}
            ano={cal.dataAtual.year}
            anosDisponiveis={cal.anosDisponiveis}
            aoSelecionarTempo={cal.selecionarTempo}
            aoMudarAno={cal.mudarAno}
            aoIrParaMes={cal.irParaMes}
          />

          <CardTempoLiturgico tempoFiltro={cal.tempoFiltro} />

          <CalendarioHeader
            rotuloMes={cal.rotuloMes}
            modoVisualizacao={cal.modoVisualizacao}
            aoMudarModo={cal.setModoVisualizacao}
            aoAnterior={cal.irAnterior}
            aoProximo={cal.irProximo}
            aoHoje={cal.irHoje}
          />

          {cal.modoVisualizacao === "grade" ? (
            <CalendarioGridView
              dias={cal.diasNoMes}
              calendario={calendarioInicial}
              diaSelecionado={cal.diaSelecionado}
              estaMontado={cal.estaMontado}
              rotuloMes={cal.rotuloMes}
              tempoFiltro={cal.tempoFiltro}
              diaDestacado={cal.diaDestacado}
              aoSelecionarDia={cal.selecionarDia}
            />
          ) : (
            <CalendarioListView
              dias={cal.listaDias}
              calendario={calendarioInicial}
              diaSelecionado={cal.diaSelecionado}
              estaMontado={cal.estaMontado}
              rotuloMes={cal.rotuloMes}
              tempoFiltro={cal.tempoFiltro}
              diaDestacado={cal.diaDestacado}
              aoSelecionarDia={cal.selecionarDia}
            />
          )}

          <div className="mt-12 flex flex-wrap gap-8 items-center justify-center p-8 ghost-border rounded-lg bg-surface">
            {[
              { cor: "bg-green-700", label: "Tempo Comum" },
              { cor: "bg-white border border-outline-variant", label: "Festas e Solenidades" },
              { cor: "bg-red-700", label: "Paixão e Mártires" },
              { cor: "bg-purple-700", label: "Penitência e Advento" },
            ].map(({ cor, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${cor}`} />
                <span className="font-label-sm text-label-sm">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <DaySidebar
          diaSelecionado={cal.diaSelecionado}
          dadosSelecionados={cal.dadosSelecionados}
        />
      </div>

      <DaySheet
        diaSelecionado={cal.diaSelecionado}
        dadosSelecionados={cal.dadosSelecionados}
        aoFechar={cal.limparDia}
      />
    </main>
  );
}
