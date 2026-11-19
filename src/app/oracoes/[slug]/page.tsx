import { notFound } from "next/navigation";
import { Metadata } from "next";
import {
    SLUG_PARA_CAT,
    CONFIG_CAT,
    type PropsPaginaCategoriaOracoes,
} from "@/types/oracao";

import OracoesCategoriaPage from "@/components/oracao/OracoesCategoriaPage";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { JsonLd } from "@/components/shared/JsonLd";
import { pageMetadata } from "@/lib/shared/pageMetadata";
import { absoluteUrl } from "@/config/site";

export async function generateStaticParams() {
    return Object.values(CONFIG_CAT).map((c) => ({
        slug: c.slug,
    }));
}

export async function generateMetadata({
    params,
}: PropsPaginaCategoriaOracoes): Promise<Metadata> {

    const slug = (await params).slug;

    const catName = SLUG_PARA_CAT[slug];

    if (!catName) {
        return { title: "Categoria não encontrada" };
    }

    return pageMetadata({
        title: catName,
        description: `${CONFIG_CAT[catName].descricao} — orações católicas da categoria ${catName} no Livro de Orações do Meu Canto Católico.`,
        path: `/oracoes/${slug}`,
        keywords: [catName, "orações católicas", "livro de orações"],
    });
}

export default async function Page({
    params,
}: PropsPaginaCategoriaOracoes) {

    const slug = (await params).slug;

    const catName = SLUG_PARA_CAT[slug];
    if (!catName) {
        notFound();
    }

    const webPageJsonLd = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: catName,
        description: CONFIG_CAT[catName].descricao,
        url: absoluteUrl(`/oracoes/${slug}`),
        inLanguage: "pt-BR",
    };

    return (
        <>
            <JsonLd data={webPageJsonLd} />
            <Breadcrumb items={[{ label: "Orações", href: "/oracoes" }, { label: catName }]} />
            <OracoesCategoriaPage slug={slug} />
        </>
    );
}