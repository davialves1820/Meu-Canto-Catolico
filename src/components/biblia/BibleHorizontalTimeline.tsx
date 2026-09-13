"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { ChevronLeft, ChevronRight, MoveHorizontal, Sparkles } from "lucide-react";
import { TimelineCor, TimelineEvento, TimelineFiltro } from "@/types/timeline";

interface BibleHorizontalTimelineProps {
  eventos: TimelineEvento[];
}

/** Filtro fixo por Testamento, sempre exibido primeiro. */
const FILTROS: TimelineFiltro[] = [
  { id: "todos", label: "Todos" },
  { id: "antigo", label: "Antigo Testamento" },
  { id: "novo", label: "Novo Testamento" },
];

/** Paleta suave por grupo de eventos, usando tokens de cor já existentes no tema. */
const PALETA: Record<TimelineCor, { texto: string; suave: string; borda: string; ponto: string; acento: string }> = {
  gold: { texto: "text-primary", suave: "bg-primary/10", borda: "border-primary/25", ponto: "bg-primary", acento: "border-l-primary" },
  cobalt: { texto: "text-cobalt", suave: "bg-cobalt/10", borda: "border-cobalt/25", ponto: "bg-cobalt", acento: "border-l-cobalt" },
  emerald: { texto: "text-emerald", suave: "bg-emerald/10", borda: "border-emerald/25", ponto: "bg-emerald", acento: "border-l-emerald" },
  crimson: { texto: "text-crimson", suave: "bg-crimson/10", borda: "border-crimson/25", ponto: "bg-crimson", acento: "border-l-crimson" },
  violet: { texto: "text-violet", suave: "bg-violet/10", borda: "border-violet/25", ponto: "bg-violet", acento: "border-l-violet" },
};

const PASSO_SCROLL = 420;

export function BibleHorizontalTimeline({ eventos }: BibleHorizontalTimelineProps) {
  // Navegação rápida por marco — um por grupo de eventos, na ordem em que aparecem.
  const marcos = useMemo<TimelineFiltro[]>(
    () => Array.from(new Map(eventos.map((e) => [e.eraTag, e.eraTag])).keys()).map((eraTag) => ({ id: eraTag, label: eraTag })),
    [eventos],
  );

  const scrollRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const arrastando = useRef(false);
  const inicioX = useRef(0);
  const inicioScroll = useRef(0);

  const [ativoId, setAtivoId] = useState<string>("todos");
  const [progresso, setProgresso] = useState(0);
  const [podeVoltar, setPodeVoltar] = useState(false);
  const [podeAvancar, setPodeAvancar] = useState(true);
  const [segurando, setSegurando] = useState(false);

  const atualizarEstadoScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const maximo = el.scrollWidth - el.clientWidth;
    setProgresso(maximo > 0 ? Math.min(100, Math.max(0, (el.scrollLeft / maximo) * 100)) : 0);
    setPodeVoltar(el.scrollLeft > 4);
    setPodeAvancar(el.scrollLeft < maximo - 4);
  }, []);

  // Mede o estado inicial de rolagem assim que o container é montado no DOM.
  const definirScrollRef = useCallback(
    (el: HTMLDivElement | null) => {
      scrollRef.current = el;
      if (el) atualizarEstadoScroll();
    },
    [atualizarEstadoScroll],
  );

  useEffect(() => {
    window.addEventListener("resize", atualizarEstadoScroll);
    return () => window.removeEventListener("resize", atualizarEstadoScroll);
  }, [atualizarEstadoScroll]);

  function rolar(direcao: 1 | -1) {
    scrollRef.current?.scrollBy({ left: direcao * PASSO_SCROLL, behavior: "smooth" });
  }

  function irPara(id: string) {
    setAtivoId(id);
    let alvo: TimelineEvento | undefined;
    if (id === "todos") alvo = eventos[0];
    else if (id === "antigo" || id === "novo") alvo = eventos.find((e) => e.testamento === id);
    else alvo = eventos.find((e) => e.eraTag === id);
    if (!alvo) return;
    cardRefs.current[alvo.id]?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      rolar(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      rolar(-1);
    }
  }

  // Arraste com o mouse (drag-to-scroll); toque nativo permanece intacto.
  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse") return;
    const el = scrollRef.current;
    if (!el) return;
    arrastando.current = true;
    inicioX.current = e.clientX;
    inicioScroll.current = el.scrollLeft;
    setSegurando(true);
    el.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    if (!arrastando.current) return;
    const el = scrollRef.current;
    if (!el) return;
    el.scrollLeft = inicioScroll.current - (e.clientX - inicioX.current);
  }

  function pararArraste() {
    arrastando.current = false;
    setSegurando(false);
  }

  return (
    <section aria-labelledby="linha-do-tempo-titulo">
      {/* Filtro por Testamento + controles de navegação */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar" role="group" aria-label="Filtrar por Testamento">
          {FILTROS.map((f) => {
            const ativo = ativoId === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => irPara(f.id)}
                className={`px-4 py-1.5 rounded-full text-[11px] font-label-sm whitespace-nowrap border transition-colors ${
                  ativo
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-transparent text-on-surface-variant border-border hover:border-primary hover:text-primary"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
          <span className="hidden md:flex items-center gap-1.5 text-[11px] font-label-sm text-outline normal-case tracking-normal">
            <MoveHorizontal size={14} className="text-primary" aria-hidden="true" />
            Arraste ou use as setas
          </span>
          <div className="hidden sm:flex items-center gap-1.5 border-l border-border pl-3">
            <button
              type="button"
              onClick={() => rolar(-1)}
              disabled={!podeVoltar}
              aria-label="Voltar"
              className="h-9 w-9 rounded-full border border-border flex items-center justify-center text-primary hover:bg-surface-container-low disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft size={18} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => rolar(1)}
              disabled={!podeAvancar}
              aria-label="Avançar"
              className="h-9 w-9 rounded-full border border-border flex items-center justify-center text-primary hover:bg-surface-container-low disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Navegação rápida por marco/era */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar mb-6" role="group" aria-label="Ir para um período da Bíblia">
        {marcos.map((m) => {
          const ativo = ativoId === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => irPara(m.id)}
              className={`px-2.5 py-1 rounded text-[10px] font-label-sm whitespace-nowrap transition-colors ${
                ativo ? "bg-surface-container-highest text-primary" : "text-outline hover:text-primary"
              }`}
            >
              {m.label}
            </button>
          );
        })}
      </div>

      {/* Esteira cronológica horizontal */}
      <div className="relative">
        <div
          ref={definirScrollRef}
          role="region"
          aria-label="Linha do tempo horizontal da Bíblia. Use as setas do teclado, arraste com o mouse ou deslize com o dedo para navegar."
          tabIndex={0}
          onScroll={atualizarEstadoScroll}
          onKeyDown={onKeyDown}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={pararArraste}
          onPointerLeave={pararArraste}
          onPointerCancel={pararArraste}
          className={`flex gap-5 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-4 pt-1 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
            segurando ? "cursor-grabbing select-none" : "cursor-grab"
          }`}
        >
          {eventos.map((evento) => (
            <div
              key={evento.id}
              ref={(el) => {
                cardRefs.current[evento.id] = el;
              }}
              className={`relative flex flex-col shrink-0 snap-start ${
                evento.destaque ? "w-[76vw] max-w-[300px] sm:w-[300px]" : "w-[68vw] max-w-[250px] sm:w-[250px]"
              }`}
            >
              {/* Trecho do eixo sob este card — cor sólida do próprio evento, estendida até o gap para ficar contínuo. */}
              <div
                aria-hidden="true"
                className={`absolute -left-2.5 -right-2.5 top-[13px] h-[3px] ${PALETA[evento.cor].ponto}`}
              />
              <div className="flex flex-col items-center" aria-hidden="true">
                <span
                  className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full ${PALETA[evento.cor].ponto} text-[12px] font-bold text-white ring-4 ring-background shadow-sm`}
                >
                  {evento.ordem}
                </span>
                <span className={`h-4 w-px ${PALETA[evento.cor].ponto} opacity-40`} />
              </div>
              <EventoCard evento={evento} />
            </div>
          ))}
        </div>

        {/* Indicador de progresso da rolagem */}
        <div className="mt-5 h-1 w-full max-w-[220px] mx-auto rounded-full bg-surface-container-highest overflow-hidden" aria-hidden="true">
          <div className="h-full bg-primary rounded-full transition-[width] duration-150 ease-out" style={{ width: `${progresso}%` }} />
        </div>
      </div>
    </section>
  );
}

function EventoCard({ evento }: { evento: TimelineEvento }) {
  const paleta = PALETA[evento.cor];

  return (
    <article
      className={`flex flex-col h-full rounded-xl border border-border border-l-4 ${paleta.acento} bg-card p-4 shadow-sm transition-shadow hover:shadow-md ${
        evento.destaque ? "ring-1 ring-primary/15 bg-primary/5" : ""
      }`}
    >
      <span className={`font-label-sm ${paleta.texto} mb-1.5`}>{evento.eraTag}</span>

      {evento.destaque && (
        <span className="inline-flex items-center gap-1 text-[10px] font-label-sm text-primary mb-1.5">
          <Sparkles size={11} aria-hidden="true" /> Marco central
        </span>
      )}

      <h3 className="font-headline-sm text-on-surface mb-1.5 leading-snug">{evento.titulo}</h3>

      <p className="font-body-sm text-[13px] text-on-surface-variant leading-relaxed">{evento.resumo}</p>

      {evento.citacao && (
        <div className={`mt-3 rounded-lg ${paleta.suave} border-l-2 ${paleta.borda} p-2.5`}>
          <p className="font-reading italic text-[13px] text-on-surface leading-snug mb-1">«{evento.citacao.texto}»</p>
          <span className={`font-label-sm ${paleta.texto}`}>{evento.citacao.referencia}</span>
        </div>
      )}
    </article>
  );
}
