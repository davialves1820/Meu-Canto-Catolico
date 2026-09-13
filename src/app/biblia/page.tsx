import { getDadosBiblia } from "@/lib/server/services/biblia";
import { BibleIndexSkeleton } from "@/components/ui/skeletons";
import { Metadata } from "next";
import { Suspense } from "react";
import { BibleSearchBar } from "@/components/biblia/BibleSearchBar";
import { BooksGrid } from "@/components/biblia/BooksGrid";
import { CanonArchitecture } from "@/components/biblia/CanonArchitecture";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { pageMetadata } from "@/lib/shared/pageMetadata";

export const metadata: Metadata = pageMetadata({
  title: "Bíblia Sagrada",
  description: "Leia a Bíblia Sagrada completa na tradução Ave Maria, acompanhe seu progresso de leitura e pesquise versículos por palavra ou referência.",
  path: "/biblia",
  keywords: ["bíblia sagrada", "bíblia católica", "bíblia ave maria", "ler a bíblia online"],
});

export const revalidate = 86400;

async function ConteudoBiblia() {
  const data = await getDadosBiblia();

  return (
    <main className="max-w-[1400px] mx-auto px-6 lg:px-16 py-12 lg:py-20">
      <Breadcrumb items={[{ label: "Bíblia" }]} className="mb-8" />
      {/* Hero & Search Section */}
      <section className="flex flex-col items-center text-center mb-24">
        <h1 className="font-headline-xl text-primary mb-6">
          Bíblia Sagrada
        </h1>
        <p className="font-reading text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto italic mb-12">
          &quot;A vossa palavra é um facho que ilumina meus passos, uma luz no meu caminho.&quot; (Sl 118, 105)
        </p>

        {/* Prominent Search Bar (Client Component) */}
        <div className="w-full flex flex-col items-center">
          <BibleSearchBar />
        </div>
      </section>

      <CanonArchitecture />

      <div className="gold-divider mt-24 mb-24" />

      {/* Bible Books Grid (Client Component) */}
      <div className="space-y-32">
        <BooksGrid
          title="Antigo Testamento"
          subtitle="A Antiga Aliança"
          books={data.antigoTestamento}
        />

        <BooksGrid
          title="Novo Testamento"
          subtitle="A Nova e Eterna Aliança"
          books={data.novoTestamento}
        />
      </div>
    </main>
  );
}

export default function PaginaBiblia() {
  return (
    <Suspense fallback={<BibleIndexSkeleton />}>
      <ConteudoBiblia />
    </Suspense>
  );
}


