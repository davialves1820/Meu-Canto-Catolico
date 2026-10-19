import { getCapituloCatecismo, getDadosCatecismo, getIndiceCatecismo } from "@/lib/server/services/catecismo";
import LeitorCatecismo from "@/components/catecismo/leitor-catecismo/LeitorCatecismo";
import { BibleChapterSkeleton } from "@/components/ui/skeletons";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Suspense } from "react";
import { type PropsPaginaCapituloCatecismo } from "@/types/catecismo";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { pageMetadata } from "@/lib/shared/pageMetadata";

export const revalidate = 86400;

export async function generateStaticParams() {
  const indice = await getIndiceCatecismo();
  return indice.flatMap((parte) => parte.capitulos.map((cap) => ({ capitulo: cap.slug })));
}

export async function generateMetadata({ params }: PropsPaginaCapituloCatecismo): Promise<Metadata> {
  const { capitulo: slug } = await params;
  const dados = await getCapituloCatecismo(slug);
  if (!dados) {
    return {};
  }
  const { capitulo, parte } = dados;
  return pageMetadata({
    title: `${capitulo.titulo} (§${capitulo.inicio}–${capitulo.fim}) | Catecismo`,
    description: `Leia os parágrafos ${capitulo.inicio} a ${capitulo.fim} do Catecismo da Igreja Católica${parte.rotulo ? ` — ${parte.rotulo}: ${parte.titulo}` : ""}.`,
    path: `/catecismo/${capitulo.slug}`,
    keywords: [capitulo.titulo, "catecismo da igreja católica", "catecismo", "doutrina católica"],
  });
}

async function ConteudoCapitulo({ slug, paragrafoDestaque }: { slug: string; paragrafoDestaque?: number }) {
  const [dados, indice, { totalParagrafos }] = await Promise.all([
    getCapituloCatecismo(slug),
    getIndiceCatecismo(),
    getDadosCatecismo(),
  ]);

  if (!dados) {
    notFound();
  }

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Catecismo", href: "/catecismo" },
          { label: dados.capitulo.titulo },
        ]}
      />
      <LeitorCatecismo
        key={dados.capitulo.slug}
        dados={dados}
        indice={indice}
        totalParagrafos={totalParagrafos}
        paragrafoDestaque={paragrafoDestaque}
      />
    </>
  );
}

export default async function PaginaCapituloCatecismo({ params, searchParams }: PropsPaginaCapituloCatecismo) {
  const { capitulo: slug } = await params;
  const { p } = await searchParams;
  const paragrafoDestaque = p ? parseInt(p, 10) : undefined;

  return (
    <div className="space-y-6">
      <Suspense fallback={<BibleChapterSkeleton />}>
        <ConteudoCapitulo slug={slug} paragrafoDestaque={paragrafoDestaque} />
      </Suspense>
    </div>
  );
}
