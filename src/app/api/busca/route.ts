import { NextRequest, NextResponse } from "next/server";
import { buscaGlobal } from "@/lib/server/services/busca";
import { validarQueryBusca } from "@/lib/server/utils/validarQueryBusca";
import { verificarRateLimit } from "@/lib/server/utils/rateLimit";

export async function GET(request: NextRequest) {
  const bloqueado = verificarRateLimit(request, { limite: 30, janela: 60_000 });
  if (bloqueado) {
    return bloqueado;
  }

  const { query, erro } = validarQueryBusca(request.nextUrl.searchParams, 2);
  if (erro) {
    return erro;
  }

  try {
    const resultados = await buscaGlobal(query);
    return NextResponse.json({ resultados });
  } catch (error) {
    console.error("Erro na busca global:", error);
    return NextResponse.json({ resultados: [] }, { status: 500 });
  }
}
