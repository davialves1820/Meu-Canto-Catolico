import { notFound } from "next/navigation";
import { Metadata } from "next";
import {
    SLUG_PARA_CAT,
    CONFIG_CAT,
    type PropsPaginaCategoriaOracoes,
} from "@/types/oracao";

import OracoesCategoriaPage from "@/components/oracao/OracoesCategoriaPage";
import PaginaOracao from "@/components/oracao/PaginaOracao";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { JsonLd } from "@/components/shared/JsonLd";
import { pageMetadata } from "@/lib/shared/pageMetadata";
import { getOracaoPorSlug, getOracoes, getOracoesRelacionadas } from "@/lib/server/services/oracoes";
import { absoluteUrl } from "@/config/site";

// Todos os slugs são conhecidos no build: sem isto, cada URL inventada grava um 404 no cache (ISR).
export const dynamicParams = false;

// O mesmo segmento atende as categorias (/oracoes/comunhao) e cada oração
// (/oracoes/ave-maria): os slugs das duas listas não se repetem.
export async function generateStaticParams() {
    const oracoes = await getOracoes();
    return [
        ...Object.values(CONFIG_CAT).map((c) => ({ slug: c.slug })),
        ...oracoes.map((o) => ({ slug: o.slug })),
    ];
}

export async function generateMetadata({
    params,
}: PropsPaginaCategoriaOracoes): Promise<Metadata> {

    const slug = (await params).slug;

    const catName = SLUG_PARA_CAT[slug];

    if (catName) {
        return pageMetadata({
            title: catName,
            description: `${CONFIG_CAT[catName].descricao} — orações católicas da categoria ${catName} no Livro de Orações do Meu Canto Católico.`,
            path: `/oracoes/${slug}`,
            keywords: [catName, "orações católicas", "livro de orações"],
        });
    }

    const oracao = await getOracaoPorSlug(slug);
    if (!oracao) {
        return { title: "Oração não encontrada" };
    }

    return pageMetadata({
        title: oracao.titulo,
        description: `${oracao.texto.replace(/\s+/g, " ").slice(0, 150).trim()}…`,
        path: `/oracoes/${slug}`,
        type: "article",
        keywords: [oracao.titulo, `oração ${oracao.titulo}`, oracao.categoria, "orações católicas"],
    });
}

export default async function Page({
    params,
}: PropsPaginaCategoriaOracoes) {

    const slug = (await params).slug;

    const catName = SLUG_PARA_CAT[slug];
    if (!catName) {
        const oracao = await getOracaoPorSlug(slug);
        if (!oracao) {
            notFound();
        }
        const categoria = CONFIG_CAT[oracao.categoria];
        const relacionadas = await getOracoesRelacionadas(oracao, 6);

        return (
            <>
                <JsonLd
                    data={{
                        "@context": "https://schema.org",
                        "@type": "CreativeWork",
                        name: oracao.titulo,
                        text: oracao.texto,
                        genre: oracao.categoria,
                        url: absoluteUrl(`/oracoes/${slug}`),
                        inLanguage: "pt-BR",
                    }}
                />
                <Breadcrumb
                    items={[
                        { label: "Orações", href: "/oracoes" },
                        { label: oracao.categoria, href: `/oracoes/${categoria.slug}` },
                        { label: oracao.titulo },
                    ]}
                />
                <PaginaOracao oracao={oracao} relacionadas={relacionadas} />
            </>
        );
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
