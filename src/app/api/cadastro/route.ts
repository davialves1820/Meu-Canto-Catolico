import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { criarUsuario, emailJaCadastrado } from "@/lib/server/services/usuarios";
import { enviarEmailBoasVindas } from "@/lib/server/services/email";
import { verificarRateLimit } from "@/lib/server/utils/rateLimit";

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  const bloqueado = verificarRateLimit(request, { limite: 10, janela: 60_000 });
  if (bloqueado) {
    return bloqueado;
  }

  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const avatarUrlBruta = typeof body.avatarUrl === "string" ? body.avatarUrl.trim() : "";
    const termsAccepted = body.termsAccepted === true;

    if (name.length < 2) {
      return NextResponse.json({ error: "Informe seu nome." }, { status: 400 });
    }
    if (!REGEX_EMAIL.test(email)) {
      return NextResponse.json({ error: "E-mail inválido." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "A senha precisa ter no mínimo 8 caracteres." }, { status: 400 });
    }
    if (!termsAccepted) {
      return NextResponse.json({ error: "É preciso concordar com os Termos de Uso e a Política de Privacidade." }, { status: 400 });
    }
    // Só aceita URLs que realmente vieram do nosso upload — evita que alguém
    // passe uma URL arbitrária direto pra essa rota, pulando /api/avatar.
    const avatarUrl = avatarUrlBruta.startsWith("https://") && avatarUrlBruta.includes(".public.blob.vercel-storage.com/")
      ? avatarUrlBruta
      : undefined;

    if (await emailJaCadastrado(email)) {
      return NextResponse.json({ error: "Já existe uma conta com esse e-mail." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await criarUsuario({ name, email, passwordHash, avatarUrl });
    await enviarEmailBoasVindas({ para: email, nome: name });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[cadastro]", error);
    return NextResponse.json({ error: "Não foi possível criar a conta." }, { status: 500 });
  }
}
