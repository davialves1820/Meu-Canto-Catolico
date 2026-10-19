import { Fragment } from "react";
import type { NotaCatecismo } from "@/types/catecismo";
import type { TokensTema } from "@/types/biblia";

/** Linha de texto com marcadores "[n]" convertidos em links para a nota. */
function Linha({ texto, idNotas, exibirNotas }: { texto: string; idNotas: string; exibirNotas: boolean }) {
  const partes = texto.split(/\[(\d+)\]/);
  return (
    <>
      {partes.map((parte, i) =>
        i % 2 === 0 ? (
          <Fragment key={i}>{parte}</Fragment>
        ) : exibirNotas ? (
          <sup key={i} className="ml-0.5">
            <a
              href={`#${idNotas}-${parte}`}
              className="font-body font-bold text-[0.65em] text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
              aria-label={`Nota ${parte}`}
            >
              {parte}
            </a>
          </sup>
        ) : null
      )}
    </>
  );
}

/** Texto multilinha: "\n" vira quebra de linha (poemas, orações), mantendo os marcadores de nota. */
export function TextoComNotas({ texto, idNotas, exibirNotas }: { texto: string; idNotas: string; exibirNotas: boolean }) {
  const linhas = texto.split("\n");
  return (
    <>
      {linhas.map((linha, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          <Linha texto={linha} idNotas={idNotas} exibirNotas={exibirNotas} />
        </Fragment>
      ))}
    </>
  );
}

export function ListaNotas({ notas, idNotas, t }: { notas: NotaCatecismo[]; idNotas: string; t: TokensTema }) {
  return (
    <ol className={`mt-4 space-y-1 border-l-2 pl-4 font-body text-[0.72em] leading-relaxed ${t.borda} ${t.muted}`}>
      {notas.map((nota) => (
        <li key={nota.numero} id={`${idNotas}-${nota.numero}`} className="scroll-mt-28">
          <span className="font-bold mr-1">{nota.numero}.</span>
          {nota.texto}
        </li>
      ))}
    </ol>
  );
}
