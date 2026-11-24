import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { lerProgresso, salvarProgresso, PADRAO_CHAVE_PROGRESSO } from "@/lib/server/services/progresso";
import { verificarRateLimit } from "@/lib/server/utils/rateLimit";

/** Progresso de uma devoção é pequeno (dias rezados, passo do terço); acima disso é abuso. */
const TAMANHO_MAXIMO = 4_000;

export async function GET(request: NextRequest) {
  const bloqueado = verificarRateLimit(request, { limite: 60, janela: 60_000 });
  if (bloqueado) {
    return bloqueado;
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  // O cliente diz de quem é o progresso: se o login foi trocado em outra aba, recusa.
  if (request.nextUrl.searchParams.get("usuario") !== session.user.id) {
    return NextResponse.json({ error: "Sessão de outro usuário." }, { status: 409 });
  }

  const chave = request.nextUrl.searchParams.get("chave") ?? "";
  if (!PADRAO_CHAVE_PROGRESSO.test(chave)) {
    return NextResponse.json({ error: "Chave inválida." }, { status: 400 });
  }

  try {
    const progresso = await lerProgresso(session.user.id, chave);
    return NextResponse.json({ progresso }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("[progresso]", error);
    return NextResponse.json({ error: "Não foi possível carregar o progresso." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const bloqueado = verificarRateLimit(request, { limite: 60, janela: 60_000 });
  if (bloqueado) {
    return bloqueado;
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  try {
    const texto = await request.text();
    if (texto.length > TAMANHO_MAXIMO) {
      return NextResponse.json({ error: "Progresso grande demais." }, { status: 413 });
    }

    const body = JSON.parse(texto);
    if (body.usuario !== session.user.id) {
      return NextResponse.json({ error: "Sessão de outro usuário." }, { status: 409 });
    }
    const chave = typeof body.chave === "string" ? body.chave : "";
    const atualizadoEm = Number(body.atualizadoEm);
    if (!PADRAO_CHAVE_PROGRESSO.test(chave) || body.dados === undefined) {
      return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
    }
    // Relógio do aparelho: aceita só datas plausíveis, sem permitir "travar" o registro no futuro.
    if (!Number.isFinite(atualizadoEm) || atualizadoEm <= 0 || atualizadoEm > Date.now() + 60_000) {
      return NextResponse.json({ error: "Data inválida." }, { status: 400 });
    }

    await salvarProgresso(session.user.id, chave, body.dados, atualizadoEm);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[progresso]", error);
    return NextResponse.json({ error: "Não foi possível salvar o progresso." }, { status: 500 });
  }
}
