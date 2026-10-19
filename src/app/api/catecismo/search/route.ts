import { pesquisarCatecismo } from "@/lib/server/services/catecismo";
import { validarQueryBusca } from "@/lib/server/utils/validarQueryBusca";
import { verificarRateLimit } from "@/lib/server/utils/rateLimit";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // 20 buscas por minuto por IP — a busca faz scan nos 2865 parágrafos
  const bloqueado = verificarRateLimit(request, { limite: 20, janela: 60_000 });
  if (bloqueado) {
    return bloqueado;
  }

  // Mínimo de 1 caractere para permitir buscar parágrafos pelo número (ex: "1")
  const { query, erro } = validarQueryBusca(request.nextUrl.searchParams, 1);
  if (erro) {
    return erro;
  }

  try {
    const results = await pesquisarCatecismo(query);
    return NextResponse.json({ results });
  } catch {
    return NextResponse.json(
      { error: "Falha ao pesquisar no Catecismo" },
      { status: 500 }
    );
  }
}
