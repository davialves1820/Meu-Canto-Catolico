import { Metadata } from "next";
import { RosarioApp } from "@/components/rosario/RosarioApp";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { pageMetadata } from "@/lib/shared/pageMetadata";

export const metadata: Metadata = pageMetadata({
  title: "Santo Rosário Interativo",
  description:
    "Reze o Santo Rosário de forma visual e interativa: toque em cada conta, acompanhe os mistérios gozosos, dolorosos, gloriosos e luminosos, e siga seu progresso em tempo real.",
  path: "/rosario",
  keywords: ["santo rosário", "terço católico", "mistérios do rosário", "rezar o terço"],
});

export default function PaginaRosario() {
  return (
    <>
      <Breadcrumb items={[{ label: "Santo Rosário" }]} />
      <RosarioApp />
    </>
  );
}
