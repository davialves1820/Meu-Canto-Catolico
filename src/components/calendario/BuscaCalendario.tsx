"use client";

import { useId, useMemo, useState } from "react";
import { DateTime } from "luxon";
import { CalendarDays, Search } from "lucide-react";
import { type DadosDiaLiturgico } from "@/types/calendario";
import { type TempoId } from "@/lib/shared/anoLiturgico";
import { buscarNoCalendario, criarIndiceBusca, type ResultadoBusca } from "@/lib/shared/buscaCalendario";

interface PropsBuscaCalendario {
  ano: number;
  calendario: Record<string, DadosDiaLiturgico[]>;
  aoSelecionarTempo: (tempo: TempoId) => void;
  aoIrParaData: (dateStr: string) => void;
}

const RANKS_FIXOS = new Set(["SOLENIDADE", "FESTA"]);

export default function BuscaCalendario({ ano, calendario, aoSelecionarTempo, aoIrParaData }: PropsBuscaCalendario) {
  const [consulta, setConsulta] = useState("");
  const [aberto, setAberto] = useState(false);
  const [ativo, setAtivo] = useState(0);
  const idLista = useId();

  // Solenidades e festas fixas do ano complementam as celebrações móveis calculadas.
  const indice = useMemo(() => {
    const fixas = Object.entries(calendario)
      .filter(([data]) => data.startsWith(`${ano}-`))
      .flatMap(([data, entradas]) =>
        entradas.filter((e) => RANKS_FIXOS.has(e.rank)).map((e) => ({ nome: e.nome, data })),
      );
    return criarIndiceBusca(ano, fixas);
  }, [ano, calendario]);

  const resultados = useMemo(() => buscarNoCalendario(indice, consulta), [indice, consulta]);
  const mostrarLista = aberto && consulta.trim().length > 0;

  const escolher = (resultado: ResultadoBusca) => {
    if (resultado.tipo === "tempo") aoSelecionarTempo(resultado.tempo);
    else aoIrParaData(resultado.data);
    setConsulta(resultado.nome);
    setAberto(false);
  };

  const aoTeclar = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setAberto(true);
      if (resultados.length) {
        const passo = e.key === "ArrowDown" ? 1 : -1;
        setAtivo((i) => (i + passo + resultados.length) % resultados.length);
      }
    } else if (e.key === "Enter" && mostrarLista && resultados[ativo]) {
      e.preventDefault();
      escolher(resultados[ativo]);
    } else if (e.key === "Escape") {
      setAberto(false);
    }
  };

  return (
    <div className="relative mb-6 px-2">
      <label htmlFor={`${idLista}-campo`} className="sr-only">
        Buscar tempo ou celebração
      </label>
      <div className="flex items-center gap-3 ghost-border bg-surface px-4 py-3 focus-within:ring-1 focus-within:ring-primary">
        <Search size={18} className="text-on-surface-variant shrink-0" aria-hidden="true" />
        <input
          id={`${idLista}-campo`}
          type="search"
          role="combobox"
          autoComplete="off"
          aria-expanded={mostrarLista}
          aria-controls={idLista}
          aria-autocomplete="list"
          aria-activedescendant={mostrarLista && resultados[ativo] ? `${idLista}-${ativo}` : undefined}
          placeholder="Buscar: Páscoa, Advento, Corpus Christi…"
          value={consulta}
          onChange={(e) => {
            setConsulta(e.target.value);
            setAtivo(0);
            setAberto(true);
          }}
          onFocus={() => setAberto(true)}
          onBlur={() => setAberto(false)}
          onKeyDown={aoTeclar}
          className="flex-1 bg-transparent font-body-md text-on-surface placeholder:text-on-surface-variant/60 outline-none"
        />
      </div>

      {mostrarLista && (
        <ul
          id={idLista}
          role="listbox"
          aria-label="Resultados da busca"
          className="absolute left-2 right-2 top-full mt-1 z-30 ghost-border bg-surface sacred-shadow max-h-80 overflow-y-auto"
        >
          {resultados.length === 0 ? (
            <li className="px-4 py-3 font-body-md text-on-surface-variant">
              Nenhum resultado para “{consulta.trim()}”. Tente “Páscoa”, “Advento” ou “Corpus Christi”.
            </li>
          ) : (
            resultados.map((r, i) => (
              <li
                key={`${r.tipo}-${r.id}`}
                id={`${idLista}-${i}`}
                role="option"
                aria-selected={i === ativo}
                // mousedown evita que o blur do campo feche a lista antes do clique.
                onMouseDown={(e) => {
                  e.preventDefault();
                  escolher(r);
                }}
                onMouseEnter={() => setAtivo(i)}
                className={`flex items-center justify-between gap-4 px-4 py-3 cursor-pointer font-body-md
                  ${i === ativo ? "bg-surface-container-low text-primary" : "text-on-surface"}`}
              >
                <span className="flex items-center gap-3 min-w-0">
                  <CalendarDays size={16} className="text-secondary shrink-0" aria-hidden="true" />
                  <span className="truncate">{r.nome}</span>
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest shrink-0">
                  {r.tipo === "tempo" ? "Tempo" : DateTime.fromISO(r.data).toFormat("dd/MM/yyyy")}
                </span>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
