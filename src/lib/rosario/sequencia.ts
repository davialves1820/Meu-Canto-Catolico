import type { GrupoMisterio, PassoRosario } from "@/types/rosario";

const ORDINAIS = ["1ª", "2ª", "3ª", "4ª", "5ª", "6ª", "7ª", "8ª", "9ª", "10ª"];

/** Quantidade de passos da introdução (Sinal da Cruz, Creio, Pai-Nosso, 3 Ave-Marias, Glória). */
const TAMANHO_INTRODUCAO = 7;

/** Título da seção de um passo fora das dezenas: "Orações Iniciais" ou "Orações Finais". */
export function tituloOracoesForaDasDezenas(passo: PassoRosario): string {
  return passo.ordem < TAMANHO_INTRODUCAO ? "Orações Iniciais" : "Orações Finais";
}

/**
 * Gera a sequência completa e ordenada de passos (contas) do Santo Rosário
 * para um grupo de mistérios: introdução, as 5 dezenas e as orações finais.
 *
 * Esta função é pura — o mesmo grupo de mistérios sempre produz a mesma sequência,
 * o que permite memoizá-la com segurança nos componentes.
 */
export function gerarSequenciaRosario(grupo: GrupoMisterio): PassoRosario[] {
  const passos: PassoRosario[] = [];
  let ordem = 0;

  const adicionar = (passo: Omit<PassoRosario, "ordem">) => {
    passos.push({ ...passo, ordem: ordem++ });
  };

  // Introdução: Sinal da Cruz, Creio, Pai-Nosso, 3 Ave-Marias, Glória
  adicionar({ tipo: "cruz", oracaoSlug: "sinal-da-cruz", rotulo: "Sinal da Cruz" });
  adicionar({ tipo: "creio", oracaoSlug: "creio", rotulo: "Creio (Credo)" });
  adicionar({ tipo: "pai-nosso", oracaoSlug: "pai-nosso", rotulo: "Pai-Nosso" });
  const virtudes = ["pela Fé", "pela Esperança", "pela Caridade"];
  for (let i = 0; i < 3; i++) {
    adicionar({
      tipo: "ave-maria",
      oracaoSlug: "ave-maria",
      rotulo: `${ORDINAIS[i]} Ave-Maria (${virtudes[i]})`,
      posicaoNaDezena: i + 1,
    });
  }
  adicionar({ tipo: "gloria", oracaoSlug: "gloria-ao-pai", rotulo: "Glória ao Pai" });

  // As 5 dezenas, uma por mistério do grupo selecionado
  grupo.misterios.forEach((misterio, grupoIndex) => {
    adicionar({
      tipo: "pai-nosso",
      oracaoSlug: "pai-nosso",
      rotulo: `Pai-Nosso — ${misterio.nome}`,
      grupoIndex,
    });
    for (let i = 0; i < 10; i++) {
      adicionar({
        tipo: "ave-maria",
        oracaoSlug: "ave-maria",
        rotulo: `${ORDINAIS[i]} Ave-Maria`,
        grupoIndex,
        posicaoNaDezena: i + 1,
      });
    }
    adicionar({
      tipo: "gloria",
      oracaoSlug: "gloria-ao-pai",
      rotulo: "Glória ao Pai",
      grupoIndex,
    });
    adicionar({
      tipo: "o-meu-jesus",
      oracaoSlug: "o-meu-jesus",
      rotulo: "Ó Meu Jesus",
      grupoIndex,
    });
  });

  // Orações finais
  adicionar({ tipo: "salve-rainha", oracaoSlug: "salve-rainha", rotulo: "Salve-Rainha" });
  adicionar({ tipo: "cruz", oracaoSlug: "sinal-da-cruz", rotulo: "Sinal da Cruz final" });

  return passos;
}

export interface SecaoSequencia {
  titulo: string;
  itens: { passo: PassoRosario; indice: number }[];
}

/** Agrupa a sequência em seções legíveis (Introdução, cada dezena, Orações Finais) para exibição em texto. */
export function agruparPorSecao(sequencia: PassoRosario[], grupo: GrupoMisterio): SecaoSequencia[] {
  const secoes: SecaoSequencia[] = [];
  const chaveSecao = (passo: PassoRosario): string => {
    if (passo.grupoIndex === undefined) {
      return tituloOracoesForaDasDezenas(passo);
    }
    const misterio = grupo.misterios[passo.grupoIndex];
    return `${misterio.numero}º Mistério — ${misterio.nome}`;
  };

  sequencia.forEach((passo, indice) => {
    const titulo = chaveSecao(passo);
    const atual = secoes[secoes.length - 1];
    if (atual && atual.titulo === titulo) {
      atual.itens.push({ passo, indice });
    } else {
      secoes.push({ titulo, itens: [{ passo, indice }] });
    }
  });

  return secoes;
}
