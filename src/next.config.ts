import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Vercel Blob Storage
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
        port: "",
        pathname: "/**",
      },
      // Vatican News: permite otimização de imagens (WebP/AVIF, lazy loading).
      // Remover `unoptimized` de NoticiaCard e NoticiaDestaque após adicionar isto
      {
        protocol: "https",
        hostname: "www.vaticannews.va",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "media.vaticannews.va",
        pathname: "/**",
      },
      // CNBB: as imagens do feed vêm em http (não https), então o protocolo
      // precisa bater exatamente — o navegador nunca busca a URL http direto,
      // é o servidor Next que baixa e reotimiza (serve tudo via https do site).
      {
        protocol: "http",
        hostname: "www.cnbb.org.br",
        pathname: "/**",
      },
      // Santos: imagens externas (Wikipedia, etc.)
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;