"use client";

import Link from "next/link";
import { getSeasonForDate, rotuloSemana, type TempoId } from "@/lib/shared/anoLiturgico";
import temposLiturgicos from "@/data/temposLiturgicos.json";
import { classeBordaCor, classeFundoCor } from "./coresLiturgicas";

interface ConteudoTempo {
  nome: string;
  cor: string;
  significadoCor: string;
  duracao: string;
  sentido: string;
  links: { rotulo: string; href: string }[];
}

const CONTEUDO = temposLiturgicos as Record<TempoId, ConteudoTempo>;

interface PropsCardTempoLiturgico {
  /** Tempo escolhido no filtro; sem filtro, o card mostra o tempo de hoje. */
  tempoFiltro: TempoId | null;
}

export default function CardTempoLiturgico({ tempoFiltro }: PropsCardTempoLiturgico) {
  const hoje = new Date();
  const tempo = tempoFiltro ?? getSeasonForDate(hoje).tempo;
  const conteudo = CONTEUDO[tempo];

  const semana = tempoFiltro ? null : rotuloSemana(hoje);
  const titulo = tempoFiltro
    ? conteudo.nome
    : `Hoje estamos no ${conteudo.nome}${semana ? `, ${semana}` : ""}`;

  return (
    <section
      aria-labelledby="titulo-tempo-liturgico"
      className={`mb-8 mx-2 ghost-border border-l-4 ${classeBordaCor(conteudo.cor)} bg-surface p-6 sm:p-8 sacred-shadow space-y-4`}
    >
      <div className="flex items-center gap-3">
        <span className={`w-3 h-3 rounded-full shrink-0 ${classeFundoCor(conteudo.cor)}`} aria-hidden="true" />
        <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary">
          {tempoFiltro ? "Tempo litúrgico" : "Tempo litúrgico atual"}
        </span>
      </div>

      <h2 id="titulo-tempo-liturgico" className="font-headline-lg text-headline-lg text-on-surface">
        {titulo}
      </h2>

      <p className="font-body-md text-on-surface leading-relaxed">{conteudo.sentido}</p>

      <dl className="grid gap-3 sm:grid-cols-2 font-body-md text-on-surface-variant">
        <div>
          <dt className="font-label-sm text-label-sm uppercase tracking-widest text-secondary mb-1">Cor litúrgica</dt>
          <dd>{conteudo.significadoCor}</dd>
        </div>
        <div>
          <dt className="font-label-sm text-label-sm uppercase tracking-widest text-secondary mb-1">Duração</dt>
          <dd>{conteudo.duracao}</dd>
        </div>
      </dl>

      <nav aria-label={`Páginas relacionadas a ${conteudo.nome}`} className="flex flex-wrap gap-2 pt-2">
        {conteudo.links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="px-3 py-1.5 ghost-border font-label-sm text-label-sm text-secondary hover:bg-surface-container-low transition-colors"
          >
            {link.rotulo}
          </Link>
        ))}
      </nav>
    </section>
  );
}
