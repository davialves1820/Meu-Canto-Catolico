import React from "react";
import CalendarioView from "@/components/calendario/CalendarioView";
import { type EntradaDiaJson, type DadosDiaLiturgico } from "@/types/calendario";
import { getCalendarioLiturgico } from "@/lib/server/services/calendarioLiturgico";
import { Metadata } from "next";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { pageMetadata } from "@/lib/shared/pageMetadata";

export const metadata: Metadata = pageMetadata({
  title: "Calendário Litúrgico",
  description: "Acompanhe o calendário litúrgico da Igreja Católica: tempos, festas, solenidades e cores litúrgicas de cada dia do ano.",
  path: "/calendario",
  keywords: ["calendário litúrgico", "tempo litúrgico", "cores litúrgicas", "ano litúrgico"],
});

function mapearEntrada(entries: EntradaDiaJson[]): DadosDiaLiturgico[] {
  return entries.map((entry) => ({
    chave: entry.nome.toLowerCase().replace(/[^a-z0-9]/g, "_"),
    nome: entry.nome,
    rank: entry.rank,
    nomeRank: entry.rank,
    cores: [entry.cor],
    nomesCores: [entry.cor],
    temporadas: [entry.temporada],
    nomesTemporadas: [entry.temporada],
  }));
}

export default async function CalendarioPage() {
  const dados = await getCalendarioLiturgico();

  const resultado: Record<string, DadosDiaLiturgico[]> = {};
  for (const [dateStr, entries] of Object.entries(dados)) {
    resultado[dateStr] = mapearEntrada(entries);
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop pt-6">
        <Breadcrumb items={[{ label: "Calendário Litúrgico" }]} className="mb-8" />
        <section className="text-center mb-12">
          <h1 className="font-headline-xl text-headline-xl text-primary mb-4">Calendário Litúrgico</h1>
          <p className="font-body-md text-on-surface-variant max-w-2xl mx-auto">
            Acompanhe o calendário litúrgico da Igreja Católica: tempos, festas, solenidades e cores litúrgicas de cada dia do ano.
          </p>
        </section>
      </div>
      <CalendarioView calendarioInicial={resultado} />
    </div>
  );
}
