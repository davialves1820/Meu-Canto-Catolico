import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { buscarUsuarioPorTokenReset, redefinirSenha } from "@/lib/server/services/usuarios";
import { enviarEmailSenhaAlterada } from "@/lib/server/services/email";
import { verificarRateLimit } from "@/lib/server/utils/rateLimit";

export async function POST(request: NextRequest) {
  const bloqueado = verificarRateLimit(request, { limite: 10, janela: 60_000 });
  if (bloqueado) {
    return bloqueado;
  }

  try {
    const body = await request.json();
    const token = typeof body.token === "string" ? body.token : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!token) {
      return NextResponse.json({ error: "Link de redefinição inválido." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "A senha precisa ter no mínimo 8 caracteres." }, { status: 400 });
    }

    const usuario = await buscarUsuarioPorTokenReset(token);
    if (!usuario) {
      return NextResponse.json({ error: "Link inválido ou expirado. Peça um novo." }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await redefinirSenha(usuario.id, passwordHash);
    await enviarEmailSenhaAlterada({ para: usuario.email, nome: usuario.name });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[redefinir-senha]", error);
    return NextResponse.json({ error: "Não foi possível redefinir a senha." }, { status: 500 });
  }
}
