import Link from "next/link";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { CONFIG_CAT, Oracao } from "@/types/oracao";

interface PropsPaginaOracao {
  oracao: Oracao;
  relacionadas: Oracao[];
}

/** Página própria de uma oração (/oracoes/ave-maria), com link fixo para compartilhar. */
export default function PaginaOracao({ oracao, relacionadas }: PropsPaginaOracao) {
  const categoria = CONFIG_CAT[oracao.categoria];
  const paragrafos = oracao.texto.split(/\n\n+/);

  return (
    <div className="max-w-3xl mx-auto px-margin-mobile md:px-6 py-12 md:py-24">
      <Link
        href={`/oracoes/${categoria.slug}`}
        className="inline-flex items-center gap-2 font-label-sm text-on-surface-variant hover:text-primary transition-colors mb-12 group"
      >
        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        {oracao.categoria}
      </Link>

      <article className="bg-surface-container-lowest border border-secondary/10 rounded-2xl md:rounded-3xl shadow-sm p-6 sm:p-10 md:p-16">
        <div className="flex items-center gap-2 text-secondary mb-4">
          <Sparkles size={16} aria-hidden="true" />
          <span className="font-label-sm">{oracao.categoria}</span>
        </div>
        <h1 className="font-headline-xl text-4xl md:text-headline-xl text-primary mb-10">{oracao.titulo}</h1>
        <div className="space-y-8">
          {paragrafos.map((para, i) => (
            <p
              key={i}
              className={`whitespace-pre-line ${
                i === 0
                  ? "font-headline-md italic leading-relaxed text-on-surface text-xl md:text-2xl border-l-2 border-secondary/20 pl-6 md:pl-8"
                  : "font-body-lg text-on-surface-variant leading-relaxed text-base md:text-lg pl-6 md:pl-8"
              }`}
            >
              {para}
            </p>
          ))}
        </div>
        <p className="mt-16 pt-8 border-t border-secondary/10 text-sm text-on-surface-variant">
          Fonte:{" "}
          <a href={oracao.url} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:no-underline">
            Padre Paulo Ricardo
          </a>
          .
        </p>
      </article>

      {relacionadas.length > 0 && (
        <section className="mt-16">
          <h2 className="font-headline-md text-headline-md text-primary mb-6">Outras orações</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {relacionadas.map((o) => (
              <li key={o.slug}>
                <Link
                  href={`/oracoes/${o.slug}`}
                  className="group flex items-center justify-between gap-3 rounded-xl border border-outline-variant/40 bg-white px-5 py-4 hover:border-primary transition-colors"
                >
                  <span className="font-body-md text-on-surface group-hover:text-primary transition-colors">{o.titulo}</span>
                  <ChevronRight size={16} className="shrink-0 text-on-surface-variant group-hover:text-primary" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
