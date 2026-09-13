import Link from "next/link";
import { Metadata } from "next";
import { ArrowRight, BookOpenText } from "lucide-react";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { pageMetadata } from "@/lib/shared/pageMetadata";
import { BibleHorizontalTimeline } from "@/components/biblia/BibleHorizontalTimeline";
import { TimelineEvento } from "@/types/timeline";
import timelineJson from "@/data/timelineData.json";

const TIMELINE_EVENTOS = (timelineJson as { eventos: TimelineEvento[] }).eventos;

export const metadata: Metadata = pageMetadata({
  title: "Linha do Tempo da Bíblia",
  description:
    "Percorra a História da Salvação evento a evento, em uma linha do tempo horizontal: da Criação e da Queda à Encarnação de Jesus Cristo e à Igreja Apostólica, com mais de cem marcos do cânon católico integral de 73 livros.",
  path: "/historia-da-salvacao",
  keywords: [
    "linha do tempo da bíblia",
    "história da salvação",
    "cronologia bíblica católica",
    "períodos bíblicos",
    "antigo testamento",
    "novo testamento",
    "cânon católico",
  ],
});

export default function HistoriaDaSalvacaoPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden bg-surface-container-low py-8 sm:py-10 md:py-14">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, var(--color-primary) 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop text-center">
          <Breadcrumb items={[{ label: "Linha do Tempo da Bíblia" }]} className="mb-4 justify-center" />

          <h1 id="linha-do-tempo-titulo" className="font-headline-xl text-3xl sm:text-4xl md:text-headline-xl text-primary mb-4">
            A Linha do Tempo da Bíblia
          </h1>
          <p className="font-body-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
            Percorra a história sagrada em vista panorâmica contínua: da Criação primordial à formação do povo eleito,
            da plenitude messiânica em Cristo até a consumação dos séculos na Jerusalém Celeste.
          </p>
        </div>
      </section>

      {/* Esteira horizontal */}
      <section className="max-w-[1400px] mx-auto px-margin-mobile md:px-margin-desktop py-8 md:py-16">
        <div className="flex items-center gap-3 mb-6">
          <span className="h-2.5 w-2.5 rounded-full bg-primary" aria-hidden="true" />
          <h2 className="font-headline-md text-on-surface">Do Gênesis ao Apocalipse, Evento a Evento</h2>
        </div>

        <BibleHorizontalTimeline eventos={TIMELINE_EVENTOS} />
      </section>

      {/* Convite para continuar */}
      <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop pb-16 md:pb-24">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-border bg-surface-container-low p-6">
          <div className="flex items-center gap-3">
            <BookOpenText size={24} className="text-primary shrink-0" aria-hidden="true" />
            <p className="font-body-md text-on-surface-variant">
              Quer aprofundar algum desses períodos direto na fonte? Leia a Bíblia Sagrada completa, capítulo a capítulo.
            </p>
          </div>
          <Link
            href="/biblia"
            className="inline-flex items-center gap-1.5 font-label-sm text-primary whitespace-nowrap hover:underline underline-offset-4"
          >
            Ir para a Bíblia
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}
