import { getDadosCatecismo, getIndiceCatecismo } from "@/lib/server/services/catecismo";
import { BibleIndexSkeleton } from "@/components/ui/skeletons";
import { Metadata } from "next";
import { Suspense } from "react";
import { BibleSearchBar } from "@/components/biblia/BibleSearchBar";
import { FormIrParaParagrafo } from "@/components/catecismo/FormIrParaParagrafo";
import { PartesCatecismo } from "@/components/catecismo/PartesCatecismo";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { pageMetadata } from "@/lib/shared/pageMetadata";

export const metadata: Metadata = pageMetadata({
  title: "Catecismo da Igreja Católica",
  description: "Leia o Catecismo da Igreja Católica completo, parágrafo por parágrafo, e pesquise por palavra, tema ou número do parágrafo.",
  path: "/catecismo",
  keywords: ["catecismo da igreja católica", "catecismo", "CIC", "doutrina católica", "ler o catecismo online"],
});

export const revalidate = 86400;

async function ConteudoCatecismo() {
  const [indice, dados] = await Promise.all([getIndiceCatecismo(), getDadosCatecismo()]);

  return (
    <main className="max-w-[1400px] mx-auto px-6 lg:px-16 py-12 lg:py-20">
      <Breadcrumb items={[{ label: "Catecismo" }]} className="mb-8" />

      <section className="flex flex-col items-center text-center mb-24">
        <h1 className="font-headline-xl text-primary mb-6">
          Catecismo da Igreja Católica
        </h1>
        <p className="font-reading text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto italic mb-12">
          &quot;A finalidade da doutrina e do ensino deve fixar-se toda no amor, que não acaba.&quot; (CIC 25)
        </p>

        <div className="w-full flex flex-col items-center gap-6">
          <BibleSearchBar
            href="/catecismo/pesquisa"
            placeholder="Pesquisar temas, palavras ou o número do parágrafo..."
            ariaLabel="Pesquisar no Catecismo — pressione Enter para abrir a busca"
          />
          <FormIrParaParagrafo totalParagrafos={dados.totalParagrafos} />
        </div>
      </section>

      <div className="gold-divider mb-24" />

      <PartesCatecismo partes={indice} />

      <p className="mt-24 text-center font-body text-xs text-muted-foreground">
        Texto integral em português, conforme publicado pela Santa Sé em{" "}
        <a href={dados.fonte} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline underline-offset-4">
          vatican.va
        </a>
        .
      </p>
    </main>
  );
}

export default function PaginaCatecismo() {
  return (
    <Suspense fallback={<BibleIndexSkeleton />}>
      <ConteudoCatecismo />
    </Suspense>
  );
}
