import { Metadata } from "next";
import { ConfissaoApp } from "@/components/confissao/ConfissaoApp";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { pageMetadata } from "@/lib/shared/pageMetadata";

export const metadata: Metadata = pageMetadata({
  title: "Preparação para a Confissão — Exame de Consciência",
  description:
    "Prepare-se para o Sacramento da Confissão com o que é pecado mortal, os requisitos de uma confissão válida, um exame de consciência interativo pelos Dez Mandamentos e pelos Cinco Mandamentos da Igreja, o passo a passo do rito, o Ato de Contrição e orientação para quem está há muito tempo sem se confessar. Nada é salvo nem enviado: tudo fica só no seu aparelho.",
  path: "/confissao",
  keywords: ["exame de consciência", "confissão católica", "sacramento da confissão", "ato de contrição"],
});

export default function PaginaConfissao() {
  return (
    <>
      <Breadcrumb items={[{ label: "Confissão" }]} />
      <ConfissaoApp />
    </>
  );
}
