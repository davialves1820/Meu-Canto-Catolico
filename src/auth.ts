import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";
import { buscarUsuarioPorEmailComSenha } from "@/lib/server/services/usuarios";
import { bloqueadaAte, contarTentativa, ipDaRequisicao, limparTentativas } from "@/lib/server/utils/rateLimit";

const JANELA_LOGIN_MS = 15 * 60_000;
/** Erros de senha para o mesmo e-mail vindos do mesmo IP. */
const LIMITE_POR_CONTA = 8;
/** Erros de um IP somando todos os e-mails (várias pessoas podem dividir a mesma rede). */
const LIMITE_POR_IP = 40;

class MuitasTentativas extends CredentialsSignin {
  code = "muitas_tentativas";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      authorize: async (credentials, request) => {
        const email = credentials?.email;
        const password = credentials?.password;
        if (typeof email !== "string" || typeof password !== "string") {
          return null;
        }

        // O bloqueio por conta inclui o IP para que ninguém trave o login de outra pessoa de fora.
        const ip = ipDaRequisicao(request);
        const chaveIp = `login ${ip}`;
        const chaveConta = `login ${ip} ${email.trim().toLowerCase()}`;
        if (bloqueadaAte(chaveConta, LIMITE_POR_CONTA) !== null || bloqueadaAte(chaveIp, LIMITE_POR_IP) !== null) {
          throw new MuitasTentativas();
        }

        const usuario = await buscarUsuarioPorEmailComSenha(email);
        const senhaValida = !!usuario && (await bcrypt.compare(password, usuario.passwordHash));
        if (!senhaValida) {
          contarTentativa(chaveConta, JANELA_LOGIN_MS);
          contarTentativa(chaveIp, JANELA_LOGIN_MS);
          return null;
        }
        limparTentativas(chaveConta);

        return { id: usuario.id, name: usuario.name, email: usuario.email, image: usuario.avatarUrl };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.picture = user.image;
      }
      // Disparado por update() em useSession() no cliente, logo após editar
      // o perfil — atualiza o token sem precisar deslogar/logar de novo.
      if (trigger === "update" && session) {
        if (typeof session.name === "string") token.name = session.name;
        if ("image" in session) token.picture = session.image;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.image = (token.picture as string | null) ?? null;
      }
      return session;
    },
  },
});
