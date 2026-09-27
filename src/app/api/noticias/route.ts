import { NextRequest, NextResponse } from "next/server";
import { buscarNoticias, filtrarNoticias, LIMITE_MAXIMO } from "@/lib/server/services/noticias";
import { TODAS_AS_FONTES, ehFonteValida } from "@/config/feeds";

const LIMITE_POR_PAGINA = 9;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const pagina = Math.max(1, parseInt(searchParams.get("pagina") ?? "1", 10));
  const busca = (searchParams.get("busca") ?? "").trim().slice(0, 200);
  const fonteParam = searchParams.get("fonte");
  const fontes = ehFonteValida(fonteParam) ? [fonteParam] : TODAS_AS_FONTES;

  // Com busca, sempre carrega o teto de itens disponíveis pra filtrar sobre o
  // maior conjunto possível — sem isso, a busca "cresceria" página a página.
  const limite = busca ? LIMITE_MAXIMO : Math.min(pagina * LIMITE_POR_PAGINA, LIMITE_MAXIMO);

  try {
    const todas = await buscarNoticias(fontes, limite);
    const filtradas = busca ? filtrarNoticias(todas, busca) : todas;
    const inicio = (pagina - 1) * LIMITE_POR_PAGINA;
    const noticias = filtradas.slice(inicio, inicio + LIMITE_POR_PAGINA);
    const temMais = busca
      ? inicio + LIMITE_POR_PAGINA < filtradas.length
      : todas.length === limite; // se trouxe o máximo, pode ter mais

    return NextResponse.json(
      { noticias, temMais, pagina },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      }
    );
  } catch {
    return NextResponse.json({ error: "Falha ao buscar notícias" }, { status: 500 });
  }
}
