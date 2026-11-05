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

/** [primeiro dia, cor] de cada trecho com a mesma cor; a cor é null no tema padrão. */
export type TrocaDeCor = [string, string | null];

/**
 * Reduz o calendário ("YYYY-MM-DD" -> cor) aos dias em que a cor do tema muda. Dias
 * brancos e de cor desconhecida entram como null, então não geram troca entre si.
 */
export function calcularTrocasDeCor(coresPorDia: Record<string, string | null | undefined>): TrocaDeCor[] {
  const trocas: TrocaDeCor[] = [];
  for (const dia of Object.keys(coresPorDia).sort()) {
    const cor = normalizarCorLiturgica(coresPorDia[dia]);
    if (trocas.length === 0 || trocas[trocas.length - 1][1] !== cor) trocas.push([dia, cor]);
  }
  return trocas;
}

/**
 * Script que define `data-liturgical-color` em <html> com a data de São Paulo. Roda no
 * navegador, antes da pintura: a cor do dia fora do HTML evita que todas as páginas
 * mudem (e sejam regravadas no cache de ISR) a cada troca de cor.
 */
export function gerarScriptTema(trocas: TrocaDeCor[], ultimoDia: string): string {
  return `(function(){var t=${JSON.stringify(trocas)},u=${JSON.stringify(ultimoDia)},p={};
new Intl.DateTimeFormat("en-US",{timeZone:"America/Sao_Paulo",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date()).forEach(function(x){p[x.type]=x.value});
var h=p.year+"-"+p.month+"-"+p.day,c=null;
if(h<=u)for(var i=0;i<t.length&&t[i][0]<=h;i++)c=t[i][1];
if(c)document.documentElement.setAttribute("data-liturgical-color",c);})();`;
}
