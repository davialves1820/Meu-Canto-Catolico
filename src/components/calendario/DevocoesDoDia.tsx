"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ChevronRight, FlameKindling, Users } from "lucide-react";
import { diaDaNovena } from "@/lib/shared/novenas";
import { type PropsDevocoesDoDia } from "@/types/calendario";

const LIMITE_SANTOS = 4;

/** Santos com festa no dia e novenas que se rezam nele, com links para as páginas. */
export default function DevocoesDoDia({ dia, devocoes }: PropsDevocoesDoDia) {
  const santos = (devocoes.santosPorDia[dia.slice(5)] ?? []).slice(0, LIMITE_SANTOS);
  const novenas = useMemo(
    () =>
      devocoes.novenas
        .map((n) => ({ novena: n, atual: diaDaNovena(n, dia) }))
        .filter((x) => x.atual)
        .sort((a, b) => (b.atual!.dia ?? 0) - (a.atual!.dia ?? 0)),
    [devocoes.novenas, dia]
  );

  if (santos.length === 0 && novenas.length === 0) return null;

  const item =
    "group flex items-center justify-between gap-3 py-2 font-body-md text-on-surface-variant hover:text-primary transition-colors";

  return (
    <div className="space-y-6">
      {santos.length > 0 && (
        <div>
          <h4 className="font-label-md text-label-md mb-2 text-secondary uppercase tracking-widest flex items-center gap-2">
            <Users size={14} aria-hidden="true" />
            Santos do dia
          </h4>
          <ul className="divide-y divide-outline-variant/20">
            {santos.map((s) => (
              <li key={s.slug}>
                <Link href={`/santos/${s.slug}`} className={item}>
                  <span>{s.nome}</span>
                  <ChevronRight size={14} className="shrink-0 opacity-50" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {novenas.length > 0 && (
        <div>
          <h4 className="font-label-md text-label-md mb-2 text-secondary uppercase tracking-widest flex items-center gap-2">
            <FlameKindling size={14} aria-hidden="true" />
            Novenas
          </h4>
          <ul className="divide-y divide-outline-variant/20">
            {novenas.map(({ novena, atual }) => (
              <li key={novena.slug}>
                <Link href={`/novenas/${novena.slug}`} className={item}>
                  <span>
                    {novena.santo}
                    <span className="block text-xs text-on-surface-variant/70">
                      {atual!.dia ? `${atual!.dia}º dia de ${novena.totalDias}` : "Domingo: não se conta"}
                    </span>
                  </span>
                  <ChevronRight size={14} className="shrink-0 opacity-50" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
