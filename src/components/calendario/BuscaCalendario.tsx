"use client";

import { useId, useMemo, useState } from "react";
import { DateTime } from "luxon";
import { CalendarDays, Search, Sparkles, X } from "lucide-react";
import { type DadosDiaLiturgico } from "@/types/calendario";
import { type TempoId } from "@/lib/shared/anoLiturgico";
import { buscarNoCalendario, criarIndiceBusca, type ResultadoBusca } from "@/lib/shared/buscaCalendario";

interface PropsBuscaCalendario {
  ano: number;
  calendario: Record<string, DadosDiaLiturgico[]>;
  aoSelecionarTempo: (tempo: TempoId) => void;
  aoIrParaData: (dateStr: string) => void;
}

const RANKS_FIXOS = new Set(["SOLENIDADE", "FESTA", "FESTA DO SENHOR"]);

function detalhe(resultado: ResultadoBusca): string {
  if (resultado.tipo === "tempo") return "Tempo litúrgico";
  const data = DateTime.fromISO(resultado.data).setLocale("pt-BR").toFormat("cccc, dd/MM/yyyy");
  return `${resultado.grau.charAt(0).toUpperCase()}${resultado.grau.slice(1)} · ${data}`;
}

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
        entradas.filter((e) => RANKS_FIXOS.has(e.rank)).map((e) => ({ nome: e.nome, data, grau: e.rank })),
      );
    return criarIndiceBusca(ano, fixas);
  }, [ano, calendario]);

  const resultados = useMemo(() => buscarNoCalendario(indice, consulta), [indice, consulta]);
  const mostrarLista = aberto && consulta.trim().length > 0;

  const escolher = (resultado: ResultadoBusca) => {
    if (resultado.tipo === "tempo") aoSelecionarTempo(resultado.tempo);
    else aoIrParaData(resultado.data);
    setConsulta("");
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
    <div className="relative z-30 mb-6 px-2">
      <label htmlFor={`${idLista}-campo`} className="sr-only">
        Buscar tempo ou celebração
      </label>
      <div className="flex items-center gap-3 ghost-border bg-card px-4 py-3 focus-within:ring-1 focus-within:ring-primary">
        <Search size={18} className="text-on-surface-variant shrink-0" aria-hidden="true" />
        <input
          id={`${idLista}-campo`}
          type="text"
          inputMode="search"
          enterKeyHint="search"
          role="combobox"
          autoComplete="off"
          spellCheck={false}
          aria-expanded={mostrarLista}
          aria-controls={idLista}
          aria-autocomplete="list"
          aria-activedescendant={mostrarLista && resultados[ativo] ? `${idLista}-${ativo}` : undefined}
          placeholder="Buscar festa ou tempo: Páscoa, Advento…"
          value={consulta}
          onChange={(e) => {
            setConsulta(e.target.value);
            setAtivo(0);
            setAberto(true);
          }}
          onFocus={() => setAberto(true)}
          onBlur={() => setAberto(false)}
          onKeyDown={aoTeclar}
          className="flex-1 min-w-0 bg-transparent font-body-md text-on-surface placeholder:text-on-surface-variant/60 outline-none"
        />
        {consulta && (
          <button
            type="button"
            aria-label="Limpar busca"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setConsulta("")}
            className="p-1 text-on-surface-variant hover:text-primary"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {mostrarLista && (
        <ul
          id={idLista}
          role="listbox"
          aria-label="Resultados da busca"
          className="absolute left-2 right-2 top-full mt-1 ghost-border bg-card shadow-xl max-h-[60vh] overflow-y-auto divide-y divide-outline-variant/20"
        >
          {resultados.length === 0 ? (
            <li className="px-4 py-4 font-body-md text-sm text-on-surface-variant">
              Nenhum resultado para “{consulta.trim()}”. Tente “Páscoa”, “Advento” ou “Corpus Christi”.
            </li>
          ) : (
            resultados.map((r, i) => {
              const Icone = r.tipo === "tempo" ? Sparkles : CalendarDays;
              return (
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
                  className={`flex items-start gap-3 px-4 py-3 cursor-pointer ${i === ativo ? "bg-surface-container-low" : ""}`}
                >
                  <Icone size={16} className="mt-1 text-secondary shrink-0" aria-hidden="true" />
                  <span className="min-w-0">
                    <span className={`block font-body-md leading-snug ${i === ativo ? "text-primary" : "text-on-surface"}`}>
                      {r.nome}
                    </span>
                    <span className="block text-xs text-on-surface-variant mt-0.5">{detalhe(r)}</span>
                  </span>
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}
