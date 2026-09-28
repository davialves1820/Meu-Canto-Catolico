import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";
import { buscarUsuarioPorEmailComSenha } from "@/lib/server/services/usuarios";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email;
        const password = credentials?.password;
        if (typeof email !== "string" || typeof password !== "string") {
          return null;
        }

        const usuario = await buscarUsuarioPorEmailComSenha(email);
        if (!usuario) return null;

        const senhaValida = await bcrypt.compare(password, usuario.passwordHash);
        if (!senhaValida) return null;

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
