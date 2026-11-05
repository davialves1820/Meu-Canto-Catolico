import { getCalendarioLiturgico } from "@/lib/server/services/calendarioLiturgico";
import { calcularTrocasDeCor, gerarScriptTema } from "@/lib/shared/temaLiturgico";

// Gerado no build a partir do calendário: não muda de um dia para o outro, pois a
// escolha da cor acontece no navegador.
export const dynamic = "force-static";

export async function GET() {
  const calendario = await getCalendarioLiturgico();
  const dias = Object.keys(calendario).sort();
  const coresPorDia = Object.fromEntries(dias.map((dia) => [dia, calendario[dia][0]?.cor]));

  return new Response(gerarScriptTema(calcularTrocasDeCor(coresPorDia), dias[dias.length - 1]), {
    headers: {
      "Content-Type": "text/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
