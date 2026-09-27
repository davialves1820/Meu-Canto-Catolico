import { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, EB_Garamond, Montserrat } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { PWARegister } from "@/components/shared/PWARegister";
import { InstallAppBanner } from "@/components/shared/InstallAppBanner";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import { JsonLd } from "@/components/shared/JsonLd";
import { siteConfig, absoluteUrl } from "@/config/site";
import { getCorLiturgicaHoje } from "@/lib/server/services/calendarioLiturgico";
import { normalizarCorLiturgica } from "@/lib/shared/temaLiturgico";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const ebGaramond = EB_Garamond({
  variable: "--font-eb-garamond",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — Liturgia Diária, Bíblia, Santos e Orações`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  applicationName: siteConfig.name,
  category: "religion",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} — Liturgia Diária, Bíblia, Santos e Orações`,
    description: siteConfig.description,
    images: [
      {
        url: absoluteUrl("/opengraph-image"),
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — Liturgia Diária, Bíblia, Santos e Orações`,
    description: siteConfig.description,
    images: [absoluteUrl("/opengraph-image")],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: siteConfig.name,
  },
  icons: {
    icon: [
      { url: "/images/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/images/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/images/favicon-48.png", sizes: "48x48", type: "image/png" },
    ],
    apple: "/images/icon-180.png",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteConfig.name,
  alternateName: "Meu Canto Catolico",
  url: siteConfig.url,
  logo: absoluteUrl("/images/icon-512.png"),
  description: siteConfig.description,
  sameAs: [],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteConfig.name,
  alternateName: "Meu Canto Catolico",
  url: siteConfig.url,
  inLanguage: "pt-BR",
  description: siteConfig.description,
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${siteConfig.url}/santos?busca={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export const viewport: Viewport = {
  themeColor: "#c9a84c",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default async function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const corLiturgica = normalizarCorLiturgica(await getCorLiturgicaHoje());

  return (
    <html lang="pt-BR" data-liturgical-color={corLiturgica ?? undefined}>
      <body className={`${geistSans.variable} ${geistMono.variable} ${ebGaramond.variable} ${montserrat.variable} antialiased bg-[#fbf9f4] text-[#1b1c19] min-h-screen flex flex-col`}>
        <JsonLd data={organizationJsonLd} />
        <JsonLd data={websiteJsonLd} />
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <PWARegister />
        <InstallAppBanner />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}