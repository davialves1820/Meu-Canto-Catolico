import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getSantoPorSlug, getSantos } from "@/lib/server/services/santos";
import { Metadata } from "next";
import { ChevronLeft, Calendar, Crown, Star, Cross, Sparkles } from "lucide-react";
import LinkExternoSanto from "@/components/santos/LinkExternoSanto";
import { PropsPaginaDetalheSanto } from "@/types/santos";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { JsonLd } from "@/components/shared/JsonLd";
import { pageMetadata } from "@/lib/shared/pageMetadata";
import { siteConfig, absoluteUrl } from "@/config/site";

export async function generateStaticParams() {
  const { santos } = await getSantos({ tipo: "Todos", busca: "", pagina: 1, porPagina: 9999 });
  return santos.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PropsPaginaDetalheSanto): Promise<Metadata> {
  const { slug } = await params;
  const santo = await getSantoPorSlug(slug);
  if (!santo) return { title: "Santo não encontrado" };

  const descricao =
    santo.resumo?.slice(0, 155).trim() ??
    `Conheça a vida, a data de festa e a hagiografia de ${santo.nome}.`;

  return pageMetadata({
    title: santo.nome,
    description: descricao,
    path: `/santos/${santo.slug}`,
    image: santo.imagem_url || undefined,
    imageAlt: `Imagem de ${santo.nome}`,
    type: "article",
    keywords: [santo.nome, "santoral", santo.tipo, santo.padroeiro_de].filter(Boolean),
  });
}

const ICONE_CAMPO: Record<string, React.ReactNode> = {
  "Data de Festa": <Calendar size={14} />,
  "Padroeiro de": <Star size={14} />,
  "Canonizado por": <Crown size={14} />,
};

export default async function PaginaDetalheSanto({ params }: PropsPaginaDetalheSanto) {
  const { slug } = await params;
  const santo = await getSantoPorSlug(slug);
  if (!santo) {
    notFound();
  }

  const campos = [
    { label: "Data de Festa", valor: santo.data_festa },
    { label: "Nascimento", valor: santo.nascimento },
    { label: "Morte", valor: santo.morte },
    { label: "Padroeiro de", valor: santo.padroeiro_de },
    { label: "Canonizado por", valor: santo.canonizado_por },
  ].filter((c) => c.valor);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: santo.nome,
    description: santo.resumo?.slice(0, 300),
    image: santo.imagem_url ? [santo.imagem_url] : undefined,
    author: { "@type": "Organization", name: siteConfig.name },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: { "@type": "ImageObject", url: absoluteUrl("/images/icon-512.png") },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": absoluteUrl(`/santos/${santo.slug}`) },
  };

  return (
    <div className="max-w-4xl mx-auto px-margin-mobile md:px-6 py-12 md:py-24">
      <JsonLd data={articleJsonLd} />
      <Breadcrumb items={[{ label: "Santoral", href: "/santos" }, { label: santo.nome }]} className="mb-8" />
      <Link
        href="/santos"
        className="inline-flex items-center gap-2 font-label-sm text-on-surface-variant hover:text-primary transition-colors mb-12 group"
      >
        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Voltar para a lista
      </Link>

      <article>
        <header className="mb-16">
          <div className="flex flex-col md:flex-row gap-12 items-start">
            {santo.imagem_url && (
              <div className="w-full md:w-72 shrink-0 aspect-[3/4] relative rounded-2xl overflow-hidden border border-outline-variant shadow-sm">
                <Image
                  src={santo.imagem_url}
                  alt={`Imagem de ${santo.nome}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 288px"
                  priority
                  unoptimized
                />
              </div>
            )}

            <div className="flex-1 pt-4">
              <div className="flex items-center gap-2 text-primary mb-4">
                <Sparkles size={16} />
                <span className="font-label-sm">{santo.tipo}</span>
              </div>
              <h1 className="font-headline-xl text-headline-xl text-primary mb-6">{santo.nome}</h1>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
                {campos.slice(0, 4).map((c) => (
                  <div key={c.label} className="flex gap-3">
                    <div className="mt-1 text-primary/60">
                      {ICONE_CAMPO[c.label] ?? <Cross size={14} />}
                    </div>
                    <div>
                      <span className="block font-label-sm text-[10px] text-on-surface-variant opacity-60">{c.label}</span>
                      <span className="font-body-md text-on-surface font-medium">{c.valor}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </header>

        <div className="flex items-center justify-center w-full my-12">
          <div className="flex-1 h-px bg-secondary/30"></div>
          <span className="px-4 text-secondary"><Cross size={20} /></span>
          <div className="flex-1 h-px bg-secondary/30"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <h2 className="font-headline-md text-headline-md text-primary">Hagiografia</h2>
            <div className="font-reading text-body-lg text-on-surface/90 leading-relaxed space-y-6 first-letter:text-5xl first-letter:font-heading first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:text-primary">
              {santo.resumo?.split('\n').map((para, i) => <p key={i}>{para}</p>) ?? (
                <p>Biografia em desenvolvimento.</p>
              )}
            </div>
          </div>

          <aside className="space-y-8">
            <div className="bg-surface-container p-8 rounded-2xl border border-outline-variant/30">
              <h3 className="font-label-md text-primary mb-6 border-b border-primary/10 pb-2">Detalhes</h3>
              <div className="space-y-6">
                {campos.map((c) => (
                  <div key={c.label}>
                    <span className="block font-label-sm text-[10px] text-on-surface-variant opacity-70 mb-1">{c.label}</span>
                    <span className="font-body-sm text-on-surface">{c.valor}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-primary/5 p-8 rounded-2xl border border-primary/10">
              <p className="font-label-sm text-primary mb-4">Saiba Mais</p>
              <LinkExternoSanto href={santo.url} />
            </div>
          </aside>
        </div>
      </article>

      <footer className="mt-24 pt-12 border-t border-outline-variant/30 text-center">
        <Link href="/santos" className="px-12 py-3 bg-primary text-on-primary font-label-md hover:bg-primary/90 transition-all rounded-full inline-block">
          Explorar outros Santos
        </Link>
      </footer>
    </div>
  );
}
