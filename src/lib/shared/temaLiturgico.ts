const CORES_VALIDAS = new Set(["branco", "verde", "vermelho", "roxo", "rosa", "preto"]);

/**
 * Normaliza uma cor litúrgica (ex.: "ROXO", vinda do calendário) para a chave usada
 * no atributo `data-liturgical-color` e nos seletores de tema em globals.css.
 * "branco" e cores desconhecidas retornam null — nesse caso a interface usa o
 * tema dourado padrão do site, sem precisar de uma regra CSS explícita.
 */
export function normalizarCorLiturgica(cor: string | null | undefined): string | null {
  if (!cor) return null;
  const chave = cor
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
  return chave !== "branco" && CORES_VALIDAS.has(chave) ? chave : null;
}
