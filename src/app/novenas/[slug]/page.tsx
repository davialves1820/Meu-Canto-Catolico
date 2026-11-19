import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { CalendarDays, ChevronLeft, ChevronRight, Cross, Hourglass, Sparkles } from "lucide-react";
import { getNovenaPorSlug, getNovenasResumo } from "@/lib/server/services/novenas";
import { getSantoPorSlug } from "@/lib/server/services/santos";
import { SANTO_POR_NOVENA } from "@/config/santosNovenas";
import LeitorNovena from "@/components/novena/LeitorNovena";
import { PropsPaginaDetalheNovena } from "@/types/novena";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { JsonLd } from "@/components/shared/JsonLd";
import { pageMetadata } from "@/lib/shared/pageMetadata";
import { MESES } from "@/lib/shared/calendarioSantos";
import { siteConfig, absoluteUrl } from "@/config/site";

const FESTAS_MOVEIS: Record<string, string> = {
  epifania: "Domingo entre 2 e 8 de janeiro",
  "divina-misericordia": "2º Domingo da Páscoa",
  pentecostes: "50º dia do Tempo Pascal",
  trindade: "Domingo após Pentecostes",
  "sagrado-coracao": "Sexta-feira após Corpus Christi",
  "imaculado-coracao": "Sábado após o Sagrado Coração",
  "cristo-rei": "Último domingo do Tempo Comum",
};

export async function generateStaticParams() {
  const novenas = await getNovenasResumo();
  return novenas.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: PropsPaginaDetalheNovena): Promise<Metadata> {
  const { slug } = await params;
  const novena = await getNovenaPorSlug(slug);
  if (!novena) return { title: "Novena não encontrada" };

  return pageMetadata({
    title: novena.titulo,
    description: `${novena.descricao} Reze os ${novena.versoes[0].dias.length} dias com as orações inicial e final.`.slice(0, 300),
    path: `/novenas/${novena.slug}`,
    image: novena.imagem_url,
    imageAlt: `Imagem de ${novena.santo}`,
    type: "article",
    keywords: [novena.titulo, `novena ${novena.santo}`, "novena", "oração"],
  });
}

export default async function PaginaDetalheNovena({ params }: PropsPaginaDetalheNovena) {
  const { slug } = await params;
  const novena = await getNovenaPorSlug(slug);
  if (!novena) {
    notFound();
  }

  const totalDias = novena.versoes[0].dias.length;
  const santo = SANTO_POR_NOVENA[novena.slug] ? await getSantoPorSlug(SANTO_POR_NOVENA[novena.slug]) : null;
  const festa = novena.festa
    ? "movel" in novena.festa
      ? FESTAS_MOVEIS[novena.festa.movel]
      : `${novena.festa.dia} de ${MESES[novena.festa.mes - 1]}`
    : null;

  const campos = [
    { label: "Festa", valor: festa ?? "Qualquer época do ano", icone: <CalendarDays size={14} /> },
    {
      label: "Duração",
      valor: `${totalDias} dias${novena.pula_domingos ? ", sem contar os domingos" : ""}`,
      icone: <Hourglass size={14} />,
    },
  ];

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: novena.titulo,
    description: novena.descricao,
    image: novena.imagem_url ? [novena.imagem_url] : undefined,
    author: { "@type": "Organization", name: siteConfig.name },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: { "@type": "ImageObject", url: absoluteUrl("/images/icon-512.png") },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": absoluteUrl(`/novenas/${novena.slug}`) },
  };

  return (
    <div className="max-w-4xl mx-auto px-margin-mobile md:px-6 py-12 md:py-24">
      <JsonLd data={articleJsonLd} />
      <Breadcrumb items={[{ label: "Novenas", href: "/novenas" }, { label: novena.santo }]} className="mb-8" />
      <Link
        href="/novenas"
        className="inline-flex items-center gap-2 font-label-sm text-on-surface-variant hover:text-primary transition-colors mb-12 group"
      >
        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Todas as novenas
      </Link>

      <header className="mb-16">
        <div className="flex flex-col md:flex-row gap-10 md:gap-12 items-start">
          {novena.imagem_url && (
            <div className="w-full sm:w-72 shrink-0 aspect-[3/4] relative rounded-2xl overflow-hidden border border-outline-variant shadow-sm bg-surface-container">
              <Image
                src={novena.imagem_url}
                alt={`Imagem de ${novena.santo}`}
                fill
                className="object-cover"
                style={{ objectPosition: novena.posicao_imagem ?? "center" }}
                sizes="(max-width: 640px) 100vw, 288px"
                priority
                unoptimized
              />
            </div>
          )}

          <div className="flex-1 pt-2">
            <div className="flex items-center gap-2 text-primary mb-4">
              <Sparkles size={16} />
              <span className="font-label-sm">Novena</span>
            </div>
            <h1 className="font-headline-xl text-4xl md:text-headline-xl text-primary mb-6">{novena.titulo}</h1>
            <p className="font-body-lg text-on-surface-variant leading-relaxed">{novena.descricao}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
              {campos.map((c) => (
                <div key={c.label} className="flex gap-3">
                  <div className="mt-1 text-primary/60">{c.icone}</div>
                  <div>
                    <span className="block font-label-sm text-[10px] text-on-surface-variant opacity-60">{c.label}</span>
                    <span className="font-body-md text-on-surface font-medium">{c.valor}</span>
                  </div>
                </div>
              ))}
            </div>
            {santo && (
              <Link
                href={`/santos/${santo.slug}`}
                className="inline-flex items-center gap-1.5 mt-8 font-label-sm text-[11px] text-secondary hover:text-primary transition-colors"
              >
                Conheça a vida de {santo.nome}
                <ChevronRight size={14} aria-hidden="true" />
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="flex items-center justify-center w-full my-12">
        <div className="flex-1 h-px bg-secondary/30"></div>
        <span className="px-4 text-secondary"><Cross size={20} /></span>
        <div className="flex-1 h-px bg-secondary/30"></div>
      </div>

      <LeitorNovena novena={novena} />

      <footer className="mt-24 pt-12 border-t border-outline-variant/30 text-center space-y-6">
        <Link href="/novenas" className="px-12 py-3 bg-primary text-on-primary font-label-md hover:bg-primary/90 transition-all rounded-full inline-block">
          Explorar outras novenas
        </Link>
        <p className="text-sm text-on-surface-variant">
          Texto da novena:{" "}
          <a
            href="https://coracoessagradosbsb.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline hover:no-underline"
          >
            Corações Sagrados BSB
          </a>
          .
        </p>
      </footer>
    </div>
  );
}
