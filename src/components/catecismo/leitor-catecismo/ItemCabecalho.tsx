import type { ItemCabecalho as TipoItemCabecalho } from "@/types/catecismo";
import type { TokensTema } from "@/types/biblia";
import { ListaNotas, TextoComNotas } from "./TextoComNotas";

/** "PRIMEIRA SECÇÃO", "CAPÍTULO SEGUNDO", "ARTIGO 3"… aparecem como rótulo acima do título que nomeiam. */
const ROTULO = /^((PRIMEIRA|SEGUNDA|TERCEIRA|QUARTA) (PARTE|SECÇÃO)|CAPÍTULO \S+|ARTIGO \d+|PARÁGRAFO \d+|INTRODUÇÃO)$/i;

interface Props {
  item: TipoItemCabecalho;
  idNotas: string;
  t: TokensTema;
  exibirNotas: boolean;
}

export default function ItemCabecalho({ item, idNotas, t, exibirNotas }: Props) {
  const notas = exibirNotas && item.notas ? <ListaNotas notas={item.notas} idNotas={idNotas} t={t} /> : null;

  if (item.tipo === "citacao") {
    return (
      <blockquote
        className={`mx-auto max-w-xl my-8 px-6 py-4 border-l-2 italic ${t.borda} ${t.texto}`}
        style={{ fontFamily: "var(--font-reading)", lineHeight: 1.8 }}
      >
        <TextoComNotas texto={item.texto} idNotas={idNotas} exibirNotas={exibirNotas} />
        {notas}
      </blockquote>
    );
  }

  if (item.tipo === "tabela") {
    return (
      <div className="my-10">
        <div className="overflow-x-auto">
          <table className={`w-full min-w-[520px] border-collapse text-[0.85em] ${t.texto}`} style={{ fontFamily: "var(--font-reading)" }}>
            {item.colunas && (
              <thead>
                <tr>
                  {item.colunas.map((col, i) => (
                    <th key={i} scope="col" className={`text-left align-bottom px-4 pb-3 border-b font-body text-[0.7em] font-bold uppercase tracking-[0.15em] text-primary ${t.borda}`}>
                      <TextoComNotas texto={col} idNotas={idNotas} exibirNotas={exibirNotas} />
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {item.linhas.map((linha, i) => (
                <tr key={i} className={`border-b last:border-b-0 ${t.borda}`}>
                  {linha.map((celula, j) => (
                    <td key={j} className="align-top px-4 py-3 leading-relaxed">
                      <TextoComNotas texto={celula} idNotas={idNotas} exibirNotas={exibirNotas} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {notas}
      </div>
    );
  }

  const conteudo = <TextoComNotas texto={item.texto} idNotas={idNotas} exibirNotas={exibirNotas} />;

  if (item.nivel === 1) {
    if (ROTULO.test(item.texto)) {
      return (
        <p className="mt-16 mb-2 text-center font-body text-[0.6em] font-bold uppercase tracking-[0.4em] text-primary opacity-80">
          {conteudo}
        </p>
      );
    }
    return (
      <>
        <h2 className={`mt-4 mb-10 text-center font-heading text-[1.35em] font-medium tracking-wide ${t.texto}`}>
          {conteudo}
        </h2>
        {notas}
      </>
    );
  }

  if (item.nivel === 2) {
    return (
      <>
        <h3 className={`mt-12 mb-4 font-heading text-[1.2em] font-medium ${t.texto}`}>{conteudo}</h3>
        {notas}
      </>
    );
  }

  if (/^Resumindo:?$/i.test(item.texto)) {
    return (
      <p className="mt-12 mb-3 inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-body text-[0.6em] font-bold uppercase tracking-[0.3em] bg-primary/10 text-primary">
        Resumindo
      </p>
    );
  }

  return (
    <>
      <h4 className={`mt-10 mb-3 font-body text-[0.7em] font-bold uppercase tracking-[0.2em] ${t.muted}`}>{conteudo}</h4>
      {notas}
    </>
  );
}
