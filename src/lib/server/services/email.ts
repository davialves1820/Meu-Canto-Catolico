import { Resend } from "resend";

const REMETENTE = process.env.RESEND_FROM_EMAIL || undefined;

let client: Resend | null = null;

function getClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  if (!client) {
    client = new Resend(apiKey);
  }
  return client;
}

function layout(titulo: string, corpo: string): string {
  return `
    <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; color: #1b1c19;">
      <h2 style="color: #755b00;">${titulo}</h2>
      ${corpo}
    </div>
  `;
}

async function enviar({ para, assunto, html }: { para: string; assunto: string; html: string }): Promise<boolean> {
  const resend = getClient();
  if (!resend || !REMETENTE) {
    console.error("[email] RESEND_API_KEY ou RESEND_FROM_EMAIL não configurados.");
    return false;
  }

  try {
    const { error } = await resend.emails.send({ from: REMETENTE, to: para, subject: assunto, html });
    if (error) {
      console.error("[email] Falha ao enviar via Resend:", error);
      return false;
    }
    return true;
  } catch (error) {
    console.error("[email] Erro ao enviar e-mail:", error);
    return false;
  }
}

export async function enviarEmailBoasVindas({ para, nome }: { para: string; nome: string }): Promise<boolean> {
  return enviar({
    para,
    assunto: "Bem-vindo(a) ao Meu Canto Católico",
    html: layout(
      "Sua conta foi criada",
      `
        <p>Olá, ${nome}.</p>
        <p>Sua conta no Meu Canto Católico foi criada com sucesso. Agora você pode acompanhar a Liturgia Diária, salvar suas orações favoritas e muito mais.</p>
        <p style="font-size: 13px; color: #4d4540;">Se você não criou essa conta, por favor ignore este e-mail.</p>
      `,
    ),
  });
}

export async function enviarEmailSenhaAlterada({ para, nome }: { para: string; nome: string }): Promise<boolean> {
  return enviar({
    para,
    assunto: "Sua senha foi alterada — Meu Canto Católico",
    html: layout(
      "Senha alterada",
      `
        <p>Olá, ${nome}.</p>
        <p>A senha da sua conta no Meu Canto Católico foi alterada com sucesso.</p>
        <p style="font-size: 13px; color: #4d4540;">Se você não fez essa alteração, redefina sua senha imediatamente pela página "Esqueci minha senha" e, se possível, entre em contato conosco.</p>
      `,
    ),
  });
}

export async function enviarEmailRedefinicaoSenha({
  para,
  nome,
  linkRedefinicao,
}: {
  para: string;
  nome: string;
  linkRedefinicao: string;
}): Promise<boolean> {
  return enviar({
    para,
    assunto: "Redefinir sua senha — Meu Canto Católico",
    html: layout(
      "Redefinir sua senha",
      `
        <p>Olá, ${nome}.</p>
        <p>Recebemos um pedido para redefinir a senha da sua conta no Meu Canto Católico. Clique no botão abaixo para escolher uma nova senha:</p>
        <p style="text-align: center; margin: 32px 0;">
          <a href="${linkRedefinicao}" style="background: #755b00; color: #fbf9f4; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Redefinir senha
          </a>
        </p>
        <p style="font-size: 13px; color: #4d4540;">Este link expira em 1 hora. Se você não pediu essa redefinição, pode ignorar este e-mail com segurança — sua senha continua a mesma.</p>
      `,
    ),
  });
}
