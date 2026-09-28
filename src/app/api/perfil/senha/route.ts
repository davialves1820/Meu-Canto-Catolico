import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { buscarSenhaHashPorId, redefinirSenha } from "@/lib/server/services/usuarios";
import { enviarEmailSenhaAlterada } from "@/lib/server/services/email";
import { verificarRateLimit } from "@/lib/server/utils/rateLimit";

export async function PATCH(request: NextRequest) {
  const bloqueado = verificarRateLimit(request, { limite: 10, janela: 60_000 });
  if (bloqueado) {
    return bloqueado;
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const currentPassword = typeof body.currentPassword === "string" ? body.currentPassword : "";
    const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";

    if (newPassword.length < 8) {
      return NextResponse.json({ error: "A nova senha precisa ter no mínimo 8 caracteres." }, { status: 400 });
    }

    const hashAtual = await buscarSenhaHashPorId(session.user.id);
    if (!hashAtual) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    const senhaValida = await bcrypt.compare(currentPassword, hashAtual);
    if (!senhaValida) {
      return NextResponse.json({ error: "Senha atual incorreta." }, { status: 400 });
    }

    const novoHash = await bcrypt.hash(newPassword, 12);
    await redefinirSenha(session.user.id, novoHash);
    if (session.user.email) {
      await enviarEmailSenhaAlterada({ para: session.user.email, nome: session.user.name ?? "" });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[perfil/senha]", error);
    return NextResponse.json({ error: "Não foi possível alterar a senha." }, { status: 500 });
  }
}
