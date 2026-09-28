import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { atualizarUsuario } from "@/lib/server/services/usuarios";
import { verificarRateLimit } from "@/lib/server/utils/rateLimit";

export async function PATCH(request: NextRequest) {
  const bloqueado = verificarRateLimit(request, { limite: 20, janela: 60_000 });
  if (bloqueado) {
    return bloqueado;
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const avatarUrlBruta = typeof body.avatarUrl === "string" ? body.avatarUrl.trim() : "";

    if (name.length < 2) {
      return NextResponse.json({ error: "Informe seu nome." }, { status: 400 });
    }

    // Mesma regra do cadastro: só aceita URL vinda do nosso próprio upload,
    // ou string vazia pra remover a foto atual.
    const avatarUrl = avatarUrlBruta.startsWith("https://") && avatarUrlBruta.includes(".public.blob.vercel-storage.com/")
      ? avatarUrlBruta
      : null;

    const usuario = await atualizarUsuario({ id: session.user.id, name, avatarUrl });

    return NextResponse.json({ name: usuario.name, avatarUrl: usuario.avatarUrl });
  } catch (error) {
    console.error("[perfil]", error);
    return NextResponse.json({ error: "Não foi possível salvar as alterações." }, { status: 500 });
  }
}
