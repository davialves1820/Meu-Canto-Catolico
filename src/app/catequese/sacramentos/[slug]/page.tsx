import fs from "fs/promises";
import path from "path";
import { MarkdownPage } from "@/components/catequese/MarkdownPage";
import { notFound } from "next/navigation";
import { obterTituloPorSlug, CATEQUESE } from "@/config/catequese";
import { pageMetadata } from "@/lib/shared/pageMetadata";

// Todos os slugs são conhecidos no build: sem isto, cada URL inventada grava um 404 no cache (ISR).
export const dynamicParams = false;

export async function generateStaticParams() {
  const secao = CATEQUESE.find((s) => s.id === "sacramentos");
  return (secao?.itens ?? []).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const title = obterTituloPorSlug(slug);
  return pageMetadata({
    title: `${title} | Sacramentos`,
    description: `Conheça o sacramento de ${title}: significado, história e vivência na Igreja Católica.`,
    path: `/catequese/sacramentos/${slug}`,
    type: "article",
    keywords: [title, "sacramentos", "catequese católica"],
  });
}

export default async function SacramentoPage({ params }: { params: Promise<{ slug: string }> }) {
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
      description={`Conheça o sacramento de ${title}: significado, história e vivência na Igreja Católica.`}
      path={`/catequese/sacramentos/${slug}`}
      breadcrumbItems={[{ label: "Catequese", href: "/catequese" }, { label: title }]}
    />
  );
}
