import { NextRequest, NextResponse } from "next/server";
import { gerarTokenReset } from "@/lib/server/services/usuarios";
import { enviarEmailRedefinicaoSenha } from "@/lib/server/services/email";
import { verificarRateLimit } from "@/lib/server/utils/rateLimit";
import { siteConfig } from "@/config/site";

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  const bloqueado = verificarRateLimit(request, { limite: 5, janela: 60_000 });
  if (bloqueado) {
    return bloqueado;
  }

  // Resposta sempre igual, exista ou não o e-mail — evita que a rota vire
  // uma forma de descobrir quais e-mails estão cadastrados no site.
  const respostaGenerica = NextResponse.json({
    ok: true,
    message: "Se esse e-mail estiver cadastrado, enviamos um link de redefinição.",
  });

  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim() : "";
    if (!REGEX_EMAIL.test(email)) {
      return respostaGenerica;
    }

    const resultado = await gerarTokenReset(email);
    if (!resultado) {
      return respostaGenerica;
    }

    const baseUrl = process.env.NEXTAUTH_URL ?? siteConfig.url;
    const link = `${baseUrl}/redefinir-senha?token=${resultado.token}`;

    await enviarEmailRedefinicaoSenha({ para: email, nome: resultado.name, linkRedefinicao: link });

    return respostaGenerica;
  } catch (error) {
    console.error("[esqueci-senha]", error);
    return respostaGenerica;
  }
}
