import fs from "fs/promises";
import path from "path";
import { MarkdownPage } from "@/components/catequese/MarkdownPage";
import { notFound } from "next/navigation";
import { obterTituloPorSlug, CATEQUESE } from "@/config/catequese";
import { pageMetadata } from "@/lib/shared/pageMetadata";

// Todos os slugs são conhecidos no build: sem isto, cada URL inventada grava um 404 no cache (ISR).
export const dynamicParams = false;

export async function generateStaticParams() {
  const secao = CATEQUESE.find((s) => s.id === "dias-preceito");
  return (secao?.itens ?? []).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const title = obterTituloPorSlug(slug);
  return pageMetadata({
    title: `${title} | Catequese`,
    description: `Entenda os Dias de Preceito da Igreja Católica: quais são, o que significam e por que são obrigatórios.`,
    path: `/catequese/dias-preceito/${slug}`,
    type: "article",
    keywords: [title, "dias de preceito", "catequese católica"],
  });
}

export default async function DiaPreceitoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const filePath = path.join(process.cwd(), "data/conteudo", `${slug}.md`);

  try {
    await fs.access(filePath);
  } catch {
    notFound();
  }

  const content = await fs.readFile(filePath, "utf8");
  const title = obterTituloPorSlug(slug);

  return (
    <MarkdownPage
      content={content}
      title={title}
      backHref="/catequese"
      backLabel="Voltar para Catequese"
      description="Entenda os Dias de Preceito da Igreja Católica: quais são, o que significam e por que são obrigatórios."
      path={`/catequese/dias-preceito/${slug}`}
      breadcrumbItems={[{ label: "Catequese", href: "/catequese" }, { label: title }]}
    />
  );
}
