import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { DivisaoCatecismo, ResumoCapitulo, ResumoParte } from "@/types/catecismo";
const ehSecaoRomana = (d: DivisaoCatecismo) => /^[IVX]+$/.test(d.rotulo);

/** Link para o início de uma divisão dentro do leitor (âncora no título da seção). */
const hrefDivisao = (slug: string, d: DivisaoCatecismo) => `/catecismo/${slug}#s-${d.inicio}`;

function ListaSecoes({ slug, secoes }: { slug: string; secoes: DivisaoCatecismo[] }) {
  return (
    <ul className="mt-2 space-y-1 border-l border-primary/15 pl-4">
      {secoes.map((s) => (
        <li key={s.inicio}>
          <Link
            href={hrefDivisao(slug, s)}
            className="flex gap-2 rounded-md py-0.5 font-body text-sm text-muted-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span className="w-7 shrink-0 text-right text-[11px] font-bold text-primary/60 pt-px">{s.rotulo}.</span>
            <span>{s.titulo}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Tópicos I., II., III.… ficam recolhidos para o índice não ficar longo demais. */
function SecoesRecolhidas({ slug, secoes }: { slug: string; secoes: DivisaoCatecismo[] }) {
  if (secoes.length === 0) {
    return null;
  }
  return (
    <details className="group/secoes mt-1" suppressHydrationWarning>
      <summary className="inline-flex cursor-pointer list-none items-center gap-1 rounded font-body text-[10px] font-bold uppercase tracking-[0.15em] text-primary/70 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary [&::-webkit-details-marker]:hidden">
        <ChevronDown size={12} aria-hidden="true" className="transition-transform group-open/secoes:rotate-180" />
        {secoes.length} tópico{secoes.length !== 1 ? "s" : ""}
      </summary>
      <ListaSecoes slug={slug} secoes={secoes} />
    </details>
  );
}

function ItemDivisao({ slug, divisao }: { slug: string; divisao: DivisaoCatecismo }) {
  const paragrafos = divisao.subdivisoes.filter((d) => !ehSecaoRomana(d));
  const secoes = divisao.subdivisoes.filter(ehSecaoRomana);

  return (
    <li className="break-inside-avoid pb-6">
      <Link
        href={hrefDivisao(slug, divisao)}
        className="group/div block rounded-lg py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <span className="block font-body text-[10px] font-bold uppercase tracking-[0.2em] text-primary/70">
          {divisao.rotulo} · §{divisao.inicio}
        </span>
        <span className="block font-heading text-base text-foreground group-hover/div:text-primary transition-colors leading-snug">
          {divisao.titulo}
        </span>
        {divisao.descricao && (
          <span className="mt-0.5 block font-reading text-sm italic text-muted-foreground leading-snug">
            {divisao.descricao}
          </span>
        )}
      </Link>

      <SecoesRecolhidas slug={slug} secoes={secoes} />

      {paragrafos.length > 0 && (
        <ul className="mt-2 space-y-2 border-l border-primary/15 pl-4">
          {paragrafos.map((p) => (
            <li key={p.inicio}>
              <Link
                href={hrefDivisao(slug, p)}
                className="group/par flex gap-2 rounded-md font-body text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <span className="w-5 shrink-0 text-right text-[11px] font-bold text-primary/60 pt-px">{p.rotulo.replace("Parágrafo ", "")}.</span>
                <span className="text-foreground/80 group-hover/par:text-primary transition-colors">{p.titulo}</span>
              </Link>
              <SecoesRecolhidas slug={slug} secoes={p.subdivisoes} />
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

function CapituloCard({ capitulo }: { capitulo: ResumoCapitulo }) {
  const quantidade = capitulo.fim - capitulo.inicio + 1;
  const soSecoes = capitulo.divisoes.every(ehSecaoRomana);

  const titulo = (
    <div className="min-w-0">
      <h3 className="font-heading text-xl md:text-2xl text-foreground mb-2 leading-tight">
        <Link
          href={`/catecismo/${capitulo.slug}`}
          className="hover:text-primary transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {capitulo.titulo}
        </Link>
      </h3>
      <p className="font-body text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em]">
        §{capitulo.inicio}–{capitulo.fim} · {quantidade} parágrafo{quantidade !== 1 ? "s" : ""}
        {capitulo.divisoes.length > 0 && (
          <span className="text-primary/70">
            {" · "}
            {capitulo.divisoes.length} {soSecoes ? "tópico" : "artigo"}{capitulo.divisoes.length !== 1 ? "s" : ""}
          </span>
        )}
      </p>
    </div>
  );

  const classeCard = "bg-card border border-primary/5 rounded-2xl p-7 transition-all hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20";

  if (capitulo.divisoes.length === 0) {
    return (
      <article className={classeCard}>
        <div className="flex items-start justify-between gap-4">
          {titulo}
          <Link href={`/catecismo/${capitulo.slug}`} aria-label={`Ler ${capitulo.titulo}`} className="mt-1 shrink-0 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <ChevronRight className="w-5 h-5 text-primary opacity-40 hover:opacity-100 transition-opacity" aria-hidden="true" />
          </Link>
        </div>
      </article>
    );
  }

  return (
    <article className={classeCard}>
      {/* O título leva ao capítulo; o resto do cabeçalho (e a seta) recolhe/expande os artigos.
          suppressHydrationWarning: o navegador muda o atributo `open` se o usuário clicar antes da hidratação. */}
      <details className="group/cap" suppressHydrationWarning>
        <summary className="flex cursor-pointer list-none items-start justify-between gap-4 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary [&::-webkit-details-marker]:hidden">
          {titulo}
          <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-primary opacity-60 hover:opacity-100 hover:bg-primary/5 transition-all">
            <ChevronDown className="w-5 h-5 transition-transform group-open/cap:rotate-180" aria-hidden="true" />
            <span className="sr-only">Mostrar ou recolher os artigos</span>
          </span>
        </summary>

        <div className="mt-6 pt-6 border-t border-primary/10">
          {soSecoes ? (
            <ListaSecoes slug={capitulo.slug} secoes={capitulo.divisoes} />
          ) : (
            // Duas colunas como num sumário de livro: a lista corre de cima para baixo e nenhum artigo é partido
            <ol className={capitulo.divisoes.length > 1 ? "md:columns-2 md:gap-12" : undefined}>
              {capitulo.divisoes.map((d) => (
                <ItemDivisao key={d.inicio} slug={capitulo.slug} divisao={d} />
              ))}
            </ol>
          )}
        </div>
      </details>
    </article>
  );
}

export function PartesCatecismo({ partes }: { partes: ResumoParte[] }) {
  return (
    <div className="space-y-24">
      {partes.map((parte) => (
        <section key={parte.numero} aria-labelledby={`parte-${parte.numero}`}>
          <div className="mb-10 pb-6 border-b border-primary/10">
            {parte.rotulo && (
              <p className="font-body text-xs text-primary font-bold uppercase tracking-[0.3em] mb-3">{parte.rotulo}</p>
            )}
            <h2 id={`parte-${parte.numero}`} className="font-heading text-4xl lg:text-5xl text-foreground font-medium">
              {parte.titulo}
            </h2>
          </div>
          <div className="space-y-6">
            {parte.capitulos.map((cap) => (
              <CapituloCard key={cap.slug} capitulo={cap} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
