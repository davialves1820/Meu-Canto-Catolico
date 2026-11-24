import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.shortName,
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: siteConfig.backgroundColor,
    theme_color: siteConfig.themeColor,
    orientation: "portrait-primary",
    lang: "pt-BR",
    categories: ["religion", "lifestyle", "education"],
    icons: [
      { src: "/images/icon-96.png", sizes: "96x96", type: "image/png" },
      { src: "/images/icon-180.png", sizes: "180x180", type: "image/png" },
      { src: "/images/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/images/icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/images/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/images/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      {
        name: "Liturgia de Hoje",
        short_name: "Liturgia",
        description: "Ver a liturgia diária",
        url: "/liturgia",
        icons: [{ src: "/images/icon-96.png", sizes: "96x96" }],
      },
      {
        name: "Bíblia Sagrada",
        short_name: "Bíblia",
        description: "Ler a Bíblia",
        url: "/biblia",
        icons: [{ src: "/images/icon-96.png", sizes: "96x96" }],
      },
      {
        name: "Calendário Litúrgico",
        short_name: "Calendário",
        description: "Ver o calendário litúrgico",
        url: "/calendario",
        icons: [{ src: "/images/icon-96.png", sizes: "96x96" }],
      },
      {
        name: "Terço e Rosário",
        short_name: "Rosário",
        description: "Rezar o terço e o rosário",
        url: "/rosario",
        icons: [{ src: "/images/icon-96.png", sizes: "96x96" }],
      },
      {
        name: "Novenas",
        short_name: "Novenas",
        description: "Ver as novenas de hoje",
        url: "/novenas",
        icons: [{ src: "/images/icon-96.png", sizes: "96x96" }],
      },
      {
        name: "Orações",
        short_name: "Orações",
        description: "Ver o livro de orações",
        url: "/oracoes",
        icons: [{ src: "/images/icon-96.png", sizes: "96x96" }],
      },
      {
        name: "Santos e Celebrações",
        short_name: "Santos",
        description: "Ver os santos do dia",
        url: "/santos",
        icons: [{ src: "/images/icon-96.png", sizes: "96x96" }],
      },
      {
        name: "Notícias do Vaticano",
        short_name: "Notícias",
        description: "Últimas notícias da Igreja Católica",
        url: "/noticias",
        icons: [{ src: "/images/icon-96.png", sizes: "96x96" }],
      },
    ],
  };
}
