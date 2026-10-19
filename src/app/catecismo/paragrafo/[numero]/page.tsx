import { notFound, redirect } from "next/navigation";
import { getCapituloDoParagrafo } from "@/lib/server/services/catecismo";

/** Link curto e estável para um parágrafo: /catecismo/paragrafo/1324 → capítulo correspondente com destaque. */
export default async function PaginaParagrafoCatecismo({ params }: { params: Promise<{ numero: string }> }) {
  const { numero } = await params;
  const n = parseInt(numero, 10);
  const capitulo = Number.isInteger(n) ? await getCapituloDoParagrafo(n) : undefined;

  if (!capitulo) {
    notFound();
  }

  redirect(`/catecismo/${capitulo.slug}?p=${n}`);
}
