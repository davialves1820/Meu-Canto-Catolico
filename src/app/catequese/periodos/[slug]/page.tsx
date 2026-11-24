import fs from "fs/promises";
import path from "path";
import { MarkdownPage } from "@/components/catequese/MarkdownPage";
import { notFound } from "next/navigation";
import { obterTituloPorSlug, CATEQUESE } from "@/config/catequese";
import { pageMetadata } from "@/lib/shared/pageMetadata";

// Todos os slugs são conhecidos no build: sem isto, cada URL inventada grava um 404 no cache (ISR).
export const dynamicParams = false;

export async function generateStaticParams() {
  const secao = CATEQUESE.find((s) => s.id === "periodos");
  return (secao?.itens ?? []).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const title = obterTituloPorSlug(slug);
  return pageMetadata({
    title: `${title} | Períodos Litúrgicos`,
    description: `Saiba o que é o período litúrgico de ${title} e como vivê-lo na fé católica.`,
    path: `/catequese/periodos/${slug}`,
    type: "article",
    keywords: [title, "períodos litúrgicos", "catequese católica"],
  });
}

export default async function PeriodoPage({ params }: { params: Promise<{ slug: string }> }) {
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
      description={`Saiba o que é o período litúrgico de ${title} e como vivê-lo na fé católica.`}
      path={`/catequese/periodos/${slug}`}
      breadcrumbItems={[{ label: "Catequese", href: "/catequese" }, { label: title }]}
    />
  );
}
