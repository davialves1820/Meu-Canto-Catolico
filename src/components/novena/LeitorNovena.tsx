"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Flame, RotateCcw, Sparkles } from "lucide-react";
import TextoNovena from "@/components/novena/TextoNovena";
import { useProgressoNovena } from "@/lib/client/hooks/novenas/useProgressoNovena";
import { diaDaNovena, formatarPeriodo, hojeEmBrasilia, type DiaEmAndamento } from "@/lib/shared/novenas";
import { PropsLeitorNovena } from "@/types/novena";

const TITULO_GENERICO = /^(dia\s*\d+|\d+º\s*dia|[a-zà-ú]+\s+dia)(\s*[-–—:]\s*)?/i;

/** "Primeiro Dia - Meditação" → "Meditação"; títulos que só repetem o número somem. */
function subtitulo(titulo: string): string {
  const resto = titulo.replace(TITULO_GENERICO, "").trim();
  return /^(da novena|de \d+)?$/i.test(resto) ? "" : resto;
}

function Divisor() {
  return (
    <div className="flex items-center justify-center w-full my-10" aria-hidden="true">
      <div className="flex-1 h-px bg-secondary/20" />
      <span className="px-4 text-secondary/60">
        <Sparkles size={16} />
      </span>
      <div className="flex-1 h-px bg-secondary/20" />
    </div>
  );
}

export default function LeitorNovena({ novena }: PropsLeitorNovena) {
  const [versaoId, setVersaoId] = useState(novena.versoes[0].id);
  const versao = novena.versoes.find((v) => v.id === versaoId) ?? novena.versoes[0];
  const total = versao.dias.length;

  const [dia, setDia] = useState(1);
  const [hoje, setHoje] = useState<DiaEmAndamento | null>(null);
  const { rezados, pronto, alternar, reiniciar } = useProgressoNovena(novena.slug, versao.id);
  const leituraRef = useRef<HTMLDivElement>(null);

  const datas = useMemo(
    () => ({ festa: novena.festa, inicio: novena.inicio, pula_domingos: novena.pula_domingos, totalDias: total }),
    [novena.festa, novena.inicio, novena.pula_domingos, total]
  );

  // A data depende do relógio do leitor: calculada só no navegador, a página continua estática.
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    const emAndamento = diaDaNovena(datas, hojeEmBrasilia());
    setHoje(emAndamento);
    if (emAndamento?.dia) setDia(emAndamento.dia);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [datas]);

  const irPara = (novo: number, rolar = false) => {
    setDia(novo);
    if (rolar) leituraRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const atual = versao.dias[dia - 1] ?? versao.dias[0];
  const sub = subtitulo(atual.titulo);
  const rezado = rezados.has(dia);

  return (
    <div className="space-y-10">
      {novena.versoes.length > 1 && (
        <div>
          <p className="font-label-sm text-[10px] text-on-surface-variant opacity-70 mb-3">Versão da novena</p>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Versão da novena">
            {novena.versoes.map((v) => (
              <button
                key={v.id}
                type="button"
                role="radio"
                aria-checked={v.id === versao.id}
                onClick={() => {
                  setVersaoId(v.id);
                  setDia((d) => Math.min(d, v.dias.length));
                }}
                className={`px-5 py-2 rounded-full border font-label-sm text-xs transition-all ${
                  v.id === versao.id
                    ? "bg-primary text-on-primary border-primary"
                    : "border-outline-variant text-on-surface hover:border-primary"
                }`}
              >
                {v.nome}
              </button>
            ))}
          </div>
        </div>
      )}

      {hoje && (
        <div className="flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-5" role="status">
          <Flame size={18} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
          <p className="font-body-md text-on-surface">
            {hoje.dia ? (
              <>
                Hoje é o <strong className="text-primary">{hoje.dia}º dia</strong> desta novena
              </>
            ) : (
              <>Hoje é domingo: os domingos não contam como dia desta devoção</>
            )}{" "}
            <span className="text-on-surface-variant">({formatarPeriodo(hoje.periodo)}).</span>
          </p>
        </div>
      )}

      <section aria-label="Dias da novena">
        <div className="flex items-end justify-between gap-4 mb-4">
          <div>
            <p className="font-label-sm text-[10px] text-on-surface-variant opacity-70">Seu progresso</p>
            <p className="font-body-md text-on-surface">
              <strong className="text-primary">{rezados.size}</strong> de {total} dias rezados
            </p>
          </div>
          {rezados.size > 0 && (
            <button
              type="button"
              onClick={reiniciar}
              disabled={!pronto}
              className="inline-flex items-center gap-1.5 font-label-sm text-[11px] text-on-surface-variant hover:text-primary transition-colors"
            >
              <RotateCcw size={13} aria-hidden="true" />
              Recomeçar
            </button>
          )}
        </div>
        <div className="h-1 w-full bg-surface-container-high rounded-full overflow-hidden mb-6">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${(rezados.size / total) * 100}%` }}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {versao.dias.map((_, i) => {
            const n = i + 1;
            const ativo = n === dia;
            const feito = rezados.has(n);
            return (
              <button
                key={n}
                type="button"
                onClick={() => irPara(n)}
                aria-current={ativo ? "step" : undefined}
                aria-label={`Dia ${n}${feito ? " (rezado)" : ""}${hoje?.dia === n ? " — hoje" : ""}`}
                className={`relative w-10 h-10 flex items-center justify-center font-label-sm text-label-sm border transition-all ${
                  ativo
                    ? "bg-primary text-on-primary border-primary"
                    : feito
                      ? "border-primary/40 text-primary bg-primary/5"
                      : "border-outline-variant text-on-surface hover:border-primary"
                }`}
              >
                {feito && !ativo ? <Check size={16} aria-hidden="true" /> : String(n).padStart(2, "0")}
                {hoje?.dia === n && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-secondary ring-2 ring-surface" aria-hidden="true" />
                )}
              </button>
            );
          })}
        </div>
      </section>

      <div
        ref={leituraRef}
        className="scroll-mt-24 bg-white border border-[#c9a84c]/30 rounded-2xl p-6 sm:p-10 md:p-14 shadow-[0_10px_40px_-10px_rgba(201,168,76,0.15)]"
      >
        {versao.oracao_inicial && (
          <section>
            <p className="font-label-sm text-secondary mb-2">Para todos os dias</p>
            <h2 className="font-headline-md text-headline-md text-primary mb-6">Oração inicial</h2>
            <TextoNovena texto={versao.oracao_inicial} />
            <Divisor />
          </section>
        )}

        <section aria-live="polite">
          <p className="font-label-sm text-secondary mb-2">
            Dia {dia} de {total}
          </p>
          <h2 className="font-headline-md text-headline-md text-primary mb-6">{sub || `${dia}º dia`}</h2>
          <TextoNovena texto={atual.texto} capitular />
        </section>

        {versao.oracao_final && (
          <section>
            <Divisor />
            <p className="font-label-sm text-secondary mb-2">Para todos os dias</p>
            <h2 className="font-headline-md text-headline-md text-primary mb-6">Oração final</h2>
            <TextoNovena texto={versao.oracao_final} />
          </section>
        )}

        <div className="mt-12 pt-8 border-t border-secondary/10 flex flex-col items-center gap-6">
          <button
            type="button"
            onClick={() => alternar(dia)}
            disabled={!pronto}
            aria-pressed={rezado}
            className={`inline-flex items-center gap-2 px-8 py-3 rounded-full font-label-md transition-all disabled:opacity-60 ${
              rezado
                ? "border border-primary text-primary hover:bg-primary/5"
                : "bg-primary text-on-primary hover:bg-primary/90"
            }`}
          >
            <Check size={16} aria-hidden="true" />
            {rezado ? `Dia ${dia} rezado` : `Marcar o dia ${dia} como rezado`}
          </button>

          <nav className="flex w-full items-center justify-between" aria-label="Navegação entre os dias">
            <button
              type="button"
              onClick={() => irPara(dia - 1, true)}
              disabled={dia === 1}
              className="inline-flex items-center gap-1 font-label-sm text-on-surface-variant hover:text-primary transition-colors disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronLeft size={16} aria-hidden="true" />
              Dia anterior
            </button>
            <button
              type="button"
              onClick={() => irPara(dia + 1, true)}
              disabled={dia === total}
              className="inline-flex items-center gap-1 font-label-sm text-on-surface-variant hover:text-primary transition-colors disabled:opacity-30 disabled:pointer-events-none"
            >
              Próximo dia
              <ChevronRight size={16} aria-hidden="true" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}
