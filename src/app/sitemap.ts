import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { getDadosBiblia } from "@/lib/server/services/biblia";
import { getIndiceCatecismo } from "@/lib/server/services/catecismo";
import { CONFIG_CAT } from "@/types/oracao";
import { CATEQUESE } from "@/config/catequese";
import santosData from "@/data/santos.json";
import type { Santo } from "@/types/santos";

const url = (path: string) => `${siteConfig.url}${path}`;

const STATIC_ROUTES: { path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }[] = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/liturgia", changeFrequency: "daily", priority: 0.9 },
  { path: "/biblia", changeFrequency: "weekly", priority: 0.9 },
  { path: "/biblia/pesquisa", changeFrequency: "monthly", priority: 0.5 },
  { path: "/catecismo", changeFrequency: "monthly", priority: 0.8 },
  { path: "/catecismo/pesquisa", changeFrequency: "monthly", priority: 0.5 },
  { path: "/santos", changeFrequency: "weekly", priority: 0.9 },
  { path: "/santos/calendario", changeFrequency: "weekly", priority: 0.7 },
  { path: "/oracoes", changeFrequency: "weekly", priority: 0.9 },
  { path: "/calendario", changeFrequency: "weekly", priority: 0.8 },
  { path: "/noticias", changeFrequency: "hourly", priority: 0.8 },
  { path: "/recursos", changeFrequency: "monthly", priority: 0.7 },
  { path: "/catequese", changeFrequency: "monthly", priority: 0.7 },
  { path: "/confissao", changeFrequency: "monthly", priority: 0.6 },
  { path: "/rosario", changeFrequency: "monthly", priority: 0.6 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const entradasEstaticas: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: url(r.path),
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  const santos = (santosData as { santos: Santo[] }).santos;
  const entradasSantos: MetadataRoute.Sitemap = santos.map((s) => ({
    url: url(`/santos/${s.slug}`),
    lastModified: now,
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  const entradasOracoes: MetadataRoute.Sitemap = Object.values(CONFIG_CAT).map((c) => ({
    url: url(`/oracoes/${c.slug}`),
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const entradasCatequese: MetadataRoute.Sitemap = CATEQUESE.flatMap((secao) =>
    secao.itens.map((item) => ({
      url: url(secao.id === "missa" ? "/catequese/missa" : `/catequese/${secao.id}/${item.slug}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }))
  );

  const { antigoTestamento, novoTestamento } = await getDadosBiblia();
  const entradasBiblia: MetadataRoute.Sitemap = [...antigoTestamento, ...novoTestamento].flatMap((livro) =>
    livro.capitulos.map((cap) => ({
      url: url(`/biblia/${encodeURIComponent(livro.nome)}/${cap.capitulo}`),
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.5,
    }))
  );

  const indiceCatecismo = await getIndiceCatecismo();
  const entradasCatecismo: MetadataRoute.Sitemap = indiceCatecismo.flatMap((parte) =>
    parte.capitulos.map((cap) => ({
      url: url(`/catecismo/${cap.slug}`),
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.6,
    }))
  );

  return [
    ...entradasEstaticas,
    ...entradasSantos,
    ...entradasOracoes,
    ...entradasCatequese,
    ...entradasBiblia,
    ...entradasCatecismo,
  ];
}
