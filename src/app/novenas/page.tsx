import { Metadata } from "next";
import { getNovenasResumo } from "@/lib/server/services/novenas";
import NovenasView from "@/components/novena/NovenasView";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { pageMetadata } from "@/lib/shared/pageMetadata";
import { hojeEmBrasilia } from "@/lib/shared/novenas";

export const metadata: Metadata = pageMetadata({
  title: "Novenas",
  description:
    "Mais de cem novenas católicas completas, organizadas pelas festas do ano: reze dia a dia com orações inicial e final, veja as novenas de hoje e acompanhe seu progresso.",
  path: "/novenas",
  keywords: ["novenas", "novena católica", "novena de hoje", "rezar novena", "trezena de Santo Antônio"],
});

export default async function PaginaNovenas() {
  const novenas = await getNovenasResumo();
  const ano = Number(hojeEmBrasilia().slice(0, 4));

  return (
    <div className="min-h-screen bg-[#fbf9f4]">
      <section className="relative overflow-hidden bg-surface-container-low py-16 md:py-24">
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, var(--color-primary) 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop text-center">
          <Breadcrumb items={[{ label: "Novenas" }]} className="mb-6 justify-center" />
          <p className="font-label-sm mb-2 text-secondary">Nove dias de oração</p>
          <h1 className="font-headline-xl text-primary mb-6">Novenas</h1>
          <p className="font-body-lg text-on-surface-variant max-w-xl mx-auto leading-relaxed">
            {novenas.length} novenas completas, organizadas pelas festas do ano. Reze um dia de cada vez, com as
            orações inicial e final, e acompanhe o seu progresso.
          </p>
        </div>
      </section>

      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-16 md:py-24">
        <NovenasView novenas={novenas} ano={ano} />
      </div>
    </div>
  );
}
