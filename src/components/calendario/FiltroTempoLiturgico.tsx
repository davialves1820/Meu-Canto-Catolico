"use client";

import { DateTime } from "luxon";
import { batismoDoSenhor, liturgicalSeasons, type TempoId } from "@/lib/shared/anoLiturgico";
import { NOMES_TEMPOS } from "@/lib/shared/buscaCalendario";

interface PropsFiltroTempoLiturgico {
  tempoFiltro: TempoId | null;
  ano: number;
  anosDisponiveis: number[];
  aoSelecionarTempo: (tempo: TempoId | null) => void;
  aoMudarAno: (ano: number) => void;
  aoIrParaMes: (dateStr: string) => void;
}

const OPCOES: { tempo: TempoId | null; rotulo: string }[] = [
  { tempo: null, rotulo: "Todos" },
  ...(Object.entries(NOMES_TEMPOS) as [TempoId, string][]).map(([tempo, rotulo]) => ({ tempo, rotulo })),
];

const formatar = (iso: string, comAno = false) => DateTime.fromISO(iso).toFormat(comAno ? "dd/MM/yyyy" : "dd/MM");

export default function FiltroTempoLiturgico({
  tempoFiltro,
  ano,
  anosDisponiveis,
  aoSelecionarTempo,
  aoMudarAno,
  aoIrParaMes,
}: PropsFiltroTempoLiturgico) {
  const anos = anosDisponiveis.includes(ano) ? anosDisponiveis : [...anosDisponiveis, ano].sort();

  // O Natal do fim do ano só termina no Batismo do Senhor do ano seguinte.
  const intervalos = tempoFiltro
    ? liturgicalSeasons(ano)
        .filter((p) => p.tempo === tempoFiltro)
        .map((p) => ({
          inicio: p.inicio,
          rotulo:
            p.id === "natal-fim"
              ? `${formatar(p.inicio)} a ${formatar(batismoDoSenhor(ano + 1), true)}`
              : `${formatar(p.inicio)} a ${formatar(p.fim)}`,
        }))
    : [];

  return (
    <div className="mb-8 px-2 space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div role="group" aria-label="Filtrar por tempo litúrgico" className="flex flex-wrap gap-2 flex-1">
          {OPCOES.map(({ tempo, rotulo }) => {
            const ativo = tempoFiltro === tempo;
            return (
              <button
                key={rotulo}
                type="button"
                aria-pressed={ativo}
                onClick={() => aoSelecionarTempo(tempo)}
                className={`px-4 py-2 rounded-full font-label-sm text-label-sm uppercase tracking-widest transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary
                  ${ativo ? "bg-primary text-background" : "ghost-border text-on-surface-variant hover:bg-surface-container-low"}`}
              >
                {rotulo}
              </button>
            );
          })}
        </div>

        <label className="flex items-center gap-2 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">
          Ano
          <select
            value={ano}
            onChange={(e) => aoMudarAno(Number(e.target.value))}
            className="ghost-border bg-surface px-3 py-2 text-on-surface focus-visible:outline-2 focus-visible:outline-primary"
          >
            {anos.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </label>
      </div>

      {tempoFiltro && (
        <p className="font-body-md text-on-surface-variant" aria-live="polite">
          <span className="font-medium text-on-surface">
            {NOMES_TEMPOS[tempoFiltro]} {ano}:
          </span>{" "}
          {intervalos.map((intervalo, i) => (
            <span key={intervalo.inicio}>
              {i > 0 && " e "}
              <button
                type="button"
                onClick={() => aoIrParaMes(intervalo.inicio)}
                className="underline decoration-dotted underline-offset-4 hover:text-primary"
                title="Ir para este período"
              >
                {intervalo.rotulo}
              </button>
            </span>
          ))}
        </p>
      )}
    </div>
  );
}
