"use client";

import { useEffect, useMemo, useState } from "react";
import { Flame, Search, Sparkles, X } from "lucide-react";
import CartaoNovena from "@/components/novena/CartaoNovena";
import { MESES, normalizarTexto } from "@/lib/shared/calendarioSantos";
import { dataDaFesta, formatarDiaMes, hojeEmBrasilia, novenasDeHoje } from "@/lib/shared/novenas";
import { PropsNovenasView } from "@/types/novena";

const QUALQUER_EPOCA = "qualquer-epoca";

/** Mês por extenso (como em MESES), "qualquer-epoca" ou null para todos. */
type Filtro = string | null;

const capitalizar = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function Grade({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">{children}</div>;
}

function TituloSecao({ rotulo, titulo }: { rotulo: string; titulo: string }) {
  return (
    <div className="mb-8">
      <span className="font-label-sm text-secondary mb-2 block">{rotulo}</span>
      <h2 className="font-headline-lg text-3xl md:text-4xl text-primary">{titulo}</h2>
    </div>
  );
}

export default function NovenasView({ novenas, ano }: PropsNovenasView) {
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<Filtro>(null);
  const [hoje, setHoje] = useState<string | null>(null);

  // "Hoje" e o ?mes= da URL só existem no navegador: lidos após montar, a página continua estática.
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setHoje(hojeEmBrasilia());
    const mes = new URLSearchParams(window.location.search).get("mes");
    if (mes === QUALQUER_EPOCA || (MESES as readonly string[]).includes(mes ?? "")) setFiltro(mes);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const escolherFiltro = (novo: Filtro) => {
    const valor = novo === filtro ? null : novo;
    setFiltro(valor);
    const url = new URL(window.location.href);
    if (valor) url.searchParams.set("mes", valor);
    else url.searchParams.delete("mes");
    window.history.replaceState(null, "", url);
  };

  // Os botões de mês saem da lista completa, para não sumirem durante a busca.
  const opcoesFiltro = useMemo(() => {
    const meses = new Set(novenas.filter((n) => n.festa).map((n) => Number(dataDaFesta(n.festa!, ano).slice(5, 7)) - 1));
    return [
      ...[...meses].sort((a, b) => a - b).map((m) => ({ valor: MESES[m], rotulo: capitalizar(MESES[m]).slice(0, 3) })),
      ...(novenas.some((n) => !n.festa) ? [{ valor: QUALQUER_EPOCA, rotulo: "Qualquer época" }] : []),
    ];
  }, [novenas, ano]);

  const filtradas = useMemo(() => {
    const q = normalizarTexto(busca);
    if (!q) return novenas;
    return novenas.filter((n) => normalizarTexto(n.santo).includes(q) || normalizarTexto(n.titulo).includes(q));
  }, [novenas, busca]);

  const { porMes, semData } = useMemo(() => {
    const comData = filtradas
      .filter((n) => n.festa)
      .map((n) => ({ novena: n, festa: dataDaFesta(n.festa!, ano) }))
      .sort((a, b) => a.festa.slice(5).localeCompare(b.festa.slice(5)) || a.novena.santo.localeCompare(b.novena.santo, "pt-BR"));

    const grupos = new Map<number, typeof comData>();
    for (const item of comData) {
      const mes = Number(item.festa.slice(5, 7)) - 1;
      grupos.set(mes, [...(grupos.get(mes) ?? []), item]);
    }
    const todos = [...grupos.entries()];
    const semFesta = filtradas.filter((n) => !n.festa);
    if (!filtro) return { porMes: todos, semData: semFesta };
    if (filtro === QUALQUER_EPOCA) return { porMes: [], semData: semFesta };
    return { porMes: todos.filter(([mes]) => MESES[mes] === filtro), semData: [] };
  }, [filtradas, ano, filtro]);

  const { emAndamento, emBreve } = useMemo(
    () => (hoje ? novenasDeHoje(novenas, hoje) : { emAndamento: [], emBreve: [] }),
    [novenas, hoje]
  );

  const buscando = busca.trim() !== "";
  // Destaques do dia só na visão geral: com busca ou mês escolhido, a lista mostra só o pedido.
  const visaoGeral = !buscando && !filtro;
  const vazio = porMes.length === 0 && semData.length === 0;

  return (
    <div className="space-y-20">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" aria-hidden="true" />
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar novena por santo ou devoção..."
            aria-label="Buscar novena"
            className="w-full rounded-full border border-outline-variant bg-white py-3.5 pl-12 pr-12 font-body-md text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary transition-colors"
          />
          {buscando && (
            <button
              type="button"
              onClick={() => setBusca("")}
              aria-label="Limpar busca"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary"
            >
              <X size={18} />
            </button>
          )}
        </div>
        <div className="py-2 overflow-x-auto" role="group" aria-label="Filtrar por mês da festa">
          <div className="flex items-center gap-1 min-w-max mx-auto w-fit">
            <button
              type="button"
              onClick={() => escolherFiltro(null)}
              aria-pressed={!filtro}
              className={`h-8 px-4 text-[10px] font-bold uppercase tracking-widest transition-all ${
                !filtro ? "bg-primary text-on-primary" : "text-on-surface-variant hover:text-primary"
              }`}
            >
              Todos
            </button>
            <div className="mx-2 h-4 w-px bg-outline-variant/30" aria-hidden="true" />
            {opcoesFiltro.map(({ valor, rotulo }) => (
              <button
                key={valor}
                type="button"
                onClick={() => escolherFiltro(valor)}
                aria-pressed={filtro === valor}
                className={`h-8 px-2.5 text-[10px] font-bold uppercase tracking-widest transition-all ${
                  filtro === valor ? "bg-primary text-on-primary" : "text-on-surface-variant hover:text-primary"
                }`}
              >
                {rotulo}
              </button>
            ))}
          </div>
        </div>
      </div>

      {visaoGeral && emAndamento.length > 0 && (
        <section className="bg-surface-container-lowest border border-secondary/10 p-6 md:p-12 rounded-2xl md:rounded-3xl shadow-sm">
          <div className="flex items-center gap-2 text-primary mb-2">
            <Flame size={16} aria-hidden="true" />
            <span className="font-label-sm">Em andamento</span>
          </div>
          <h2 className="font-headline-lg text-3xl md:text-4xl text-primary mb-8">Novenas de hoje</h2>
          <Grade>
            {emAndamento.map(({ novena, dia }) => (
              <CartaoNovena
                key={novena.slug}
                novena={novena}
                diaAtual={dia ?? undefined}
                detalhe={dia ? `Dia ${dia} de ${novena.totalDias}` : "Domingo: não se conta"}
              />
            ))}
          </Grade>
        </section>
      )}

      {visaoGeral && emBreve.length > 0 && (
        <section>
          <TituloSecao rotulo="Prepare-se" titulo="Começam em breve" />
          <Grade>
            {emBreve.map(({ novena, inicio }) => (
              <CartaoNovena key={novena.slug} novena={novena} detalhe={`Começa em ${formatarDiaMes(inicio)}`} />
            ))}
          </Grade>
        </section>
      )}

      {visaoGeral && (emAndamento.length > 0 || emBreve.length > 0) && (
        <div className="flex items-center justify-center w-full" aria-hidden="true">
          <div className="flex-1 h-px bg-secondary/30" />
          <span className="px-4 text-secondary"><Sparkles size={20} /></span>
          <div className="flex-1 h-px bg-secondary/30" />
        </div>
      )}

      {vazio && (
        <div className="py-20 text-center border border-dashed border-outline-variant">
          <p className="text-on-surface-variant font-body-md">Nenhuma novena encontrada para os filtros selecionados.</p>
          <button
            type="button"
            onClick={() => {
              setBusca("");
              if (filtro) escolherFiltro(filtro);
            }}
            className="text-secondary font-label-sm mt-4 inline-block uppercase tracking-widest hover:underline"
          >
            Limpar filtros
          </button>
        </div>
      )}

      {porMes.map(([mes, itens]) => (
        <section key={mes}>
          <TituloSecao rotulo="Festas de" titulo={capitalizar(MESES[mes])} />
          <Grade>
            {itens.map(({ novena, festa }) => (
              <CartaoNovena key={novena.slug} novena={novena} detalhe={`Festa: ${formatarDiaMes(festa)}`} />
            ))}
          </Grade>
        </section>
      ))}

      {semData.length > 0 && (
        <section>
          <TituloSecao rotulo="Sem data marcada" titulo="Em qualquer época" />
          <Grade>
            {semData.map((novena) => (
              <CartaoNovena key={novena.slug} novena={novena} detalhe="Qualquer época do ano" />
            ))}
          </Grade>
        </section>
      )}
    </div>
  );
}
