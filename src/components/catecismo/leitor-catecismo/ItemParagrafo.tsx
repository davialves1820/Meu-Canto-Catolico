import type { ParagrafoCatecismo } from "@/types/catecismo";
import type { TokensTema } from "@/types/biblia";
import { ListaNotas, TextoComNotas } from "./TextoComNotas";

interface Props {
  paragrafo: ParagrafoCatecismo;
  t: TokensTema;
  exibirNotas: boolean;
  estaDestacado: boolean;
  refParagrafo: (el: HTMLElement | null) => void;
}

export default function ItemParagrafo({ paragrafo, t, exibirNotas, estaDestacado, refParagrafo }: Props) {
  const idNotas = `nota-${paragrafo.numero}`;
  const blocos = paragrafo.texto.split("\n\n");

  return (
    <article
      id={`p-${paragrafo.numero}`}
      ref={refParagrafo}
      className={`group flex gap-4 sm:gap-6 rounded-xl px-3 sm:px-4 py-4 scroll-mt-28 transition-all duration-500 ${t.versiculo} ${estaDestacado ? t.destaque : ""}`}
      aria-label={`Parágrafo ${paragrafo.numero}`}
    >
      <a
        href={`#p-${paragrafo.numero}`}
        className={`mt-1.5 shrink-0 w-9 text-right font-body text-[11px] font-bold select-none ${t.muted} opacity-50 group-hover:opacity-100 hover:text-primary transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded`}
        aria-label={`Link para o parágrafo ${paragrafo.numero}`}
      >
        {paragrafo.numero}
      </a>
      <div className={`flex-1 min-w-0 ${t.texto}`} style={{ fontFamily: "var(--font-reading)", lineHeight: 1.9 }}>
        {blocos.map((bloco, i) => (
          <p key={i} className={i > 0 ? "mt-4" : undefined}>
            <TextoComNotas texto={bloco} idNotas={idNotas} exibirNotas={exibirNotas} />
          </p>
        ))}
        {exibirNotas && paragrafo.notas && <ListaNotas notas={paragrafo.notas} idNotas={idNotas} t={t} />}
      </div>
    </article>
  );
}
