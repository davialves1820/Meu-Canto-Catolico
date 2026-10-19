import { ReactNode } from "react";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/shared/pageMetadata";

export const metadata: Metadata = pageMetadata({
  title: "Pesquisar no Catecismo",
  description: "Busque palavras, temas ou o número de um parágrafo (ex: 1324) em todo o Catecismo da Igreja Católica.",
  path: "/catecismo/pesquisa",
  keywords: ["pesquisar catecismo", "buscar no catecismo", "parágrafo do catecismo", "CIC"],
});

export default function CatecismoPesquisaLayout({ children }: { children: ReactNode }) {
  return children;
}
