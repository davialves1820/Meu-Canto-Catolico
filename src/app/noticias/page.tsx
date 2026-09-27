import { Suspense } from "react";
import { buscarNoticias, filtrarNoticias, LIMITE_MAXIMO } from "@/lib/server/services/noticias";
import { TODAS_AS_FONTES, FEEDS, FonteNoticia, ehFonteValida } from "@/config/feeds";
import NoticiaDestaque from "@/components/noticias/NoticiaDestaque";
import { NoticiasSkeleton } from "@/components/ui/skeletons";
import { Metadata } from "next";
import { Newspaper, Sparkles, SearchX } from "lucide-react";
import NoticiasInfiniteGrid from "@/components/noticias/NoticiasInfiniteGrid";
import BuscaNoticias from "@/components/noticias/BuscaNoticias";
import FiltroFonteNoticias from "@/components/noticias/FiltroFonteNoticias";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { pageMetadata } from "@/lib/shared/pageMetadata";

export const revalidate = 3600;

export const metadata: Metadata = pageMetadata({
  title: "Notícias Católicas",
  description: "As últimas notícias do Papa, da Santa Sé e da Igreja no Brasil, direto do Vatican News e da CNBB, atualizadas continuamente.",
  path: "/noticias",
  keywords: ["notícias católicas", "papa", "vatican news", "cnbb", "igreja no brasil"],
});

interface PropsPaginaNoticias {
  searchParams: Promise<{ busca?: string; fonte?: string }>;
}

async function NoticiasContent({ busca, fonte }: { busca: string; fonte: FonteNoticia | "todas" }) {
  const fontes = fonte === "todas" ? TODAS_AS_FONTES : [fonte];
  const todas = await buscarNoticias(fontes, busca ? LIMITE_MAXIMO : 20);
  const noticias = busca ? filtrarNoticias(todas, busca) : todas;
  const [destaque, ...resto] = noticias;
  // Na busca, todo o resultado já vem de uma vez (filtra sobre o pool inteiro
  // buscado); no modo normal, o grid pagina de verdade via /api/noticias.
  const temMaisInicial = !busca;

  if (noticias.length === 0) {
    return busca ? (
      <div className="text-center py-24 space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-surface-container-low flex items-center justify-center mx-auto border border-secondary/10">
          <SearchX size={28} className="text-secondary/40" />
        </div>
        <div className="space-y-2">
          <p className="font-headline-md text-primary">Nenhuma notícia encontrada</p>
          <p className="font-body-md text-on-surface-variant max-w-xs mx-auto">
            Não achamos nada para &ldquo;{busca}&rdquo;
            {fonte !== "todas" ? ` em ${FEEDS[fonte].label}` : ""} entre as notícias recentes.
          </p>
        </div>
      </div>
    ) : (
      <div className="text-center py-24 space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-surface-container-low flex items-center justify-center mx-auto border border-secondary/10">
          <Newspaper size={28} className="text-secondary/40" />
        </div>
        <div className="space-y-2">
          <p className="font-headline-md text-primary">Não foi possível carregar as notícias</p>
          <p className="font-body-md text-on-surface-variant max-w-xs mx-auto">
            Verifique sua conexão ou tente novamente em instantes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-20">
      {destaque && <NoticiaDestaque noticia={destaque} />}

      <section aria-labelledby="ultimas-heading">
        <div className="flex items-center gap-6 mb-12">
          <h2 id="ultimas-heading" className="font-headline-lg text-primary whitespace-nowrap">
            {busca ? "Resultados da busca" : "Últimas notícias"}
          </h2>
          <div className="h-[1px] flex-1 bg-secondary/10" />
        </div>

        {/* Grid inicial (SSR) + carregamento adicional via IntersectionObserver */}
        <NoticiasInfiniteGrid noticiasIniciais={resto} temMaisInicial={temMaisInicial} busca={busca} fonte={fonte === "todas" ? undefined : fonte} />
      </section>

      <div className="pt-16 border-t border-secondary/5 text-center space-y-4">
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="h-[1px] w-12 bg-secondary/20" />
          <Sparkles className="text-secondary/30" size={20} />
          <div className="h-[1px] w-12 bg-secondary/20" />
        </div>
        <p className="font-label-sm text-outline">
          {fonte === "cnbb" ? (
            <>
              Conteúdo via RSS da{" "}
              <a
                href="https://www.cnbb.org.br/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary hover:text-primary transition-colors underline underline-offset-4 decoration-secondary/30"
              >
                CNBB
              </a>
            </>
          ) : (
            <>
              Conteúdo via RSS do{" "}
              <a
                href="https://www.vaticannews.va/pt.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary hover:text-primary transition-colors underline underline-offset-4 decoration-secondary/30"
              >
                Vatican News
              </a>
              {fonte === "todas" && (
                <>
                  {" "}e da{" "}
                  <a
                    href="https://www.cnbb.org.br/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-secondary hover:text-primary transition-colors underline underline-offset-4 decoration-secondary/30"
                  >
                    CNBB
                  </a>
                </>
              )}
            </>
          )}
        </p>
      </div>
    </div>
  );
}

export default async function NoticiasPage({ searchParams }: PropsPaginaNoticias) {
  const params = await searchParams;
  const busca = params.busca?.trim() ?? "";
  const fonte: FonteNoticia | "todas" = ehFonteValida(params.fonte) ? params.fonte : "todas";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1">
        <section className="relative overflow-hidden bg-surface-container-low py-16 md:py-24">
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, var(--color-primary) 1px, transparent 0)`,
              backgroundSize: "40px 40px",
            }}
          />
          <div className="relative max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop text-center">
            <Breadcrumb items={[{ label: "Notícias" }]} className="mb-6 justify-center" />
            <h1 className="font-headline-xl text-primary mb-6">Notícias Católicas</h1>
            <p className="font-body-lg text-on-surface-variant max-w-xl mx-auto leading-relaxed">
              Mensagens do Papa, acontecimentos da Igreja e notícias da CNBB para alimentar sua fé e conhecimento.
            </p>
            <BuscaNoticias valorInicial={busca} />
            <FiltroFonteNoticias fonteAtiva={fonte} />
          </div>
        </section>

        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-16 md:py-24">
          <Suspense fallback={<NoticiasSkeleton />}>
            <NoticiasContent busca={busca} fonte={fonte} />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
