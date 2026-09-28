import type { NextAuthConfig } from "next-auth";

/**
 * Config "edge-safe": sem providers de verdade (Credentials usa bcryptjs + postgres,
 * que não rodam no Edge Runtime do middleware). O middleware só precisa validar o
 * cookie de sessão JWT já assinado — não precisa consultar o banco pra isso.
 * auth.ts estende esta config com o provider real, pra uso nas rotas/server components.
 */
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/entrar",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    authorized({ auth, request }) {
      const estaLogado = !!auth?.user;
      const emAreaProtegida = request.nextUrl.pathname.startsWith("/conta");
      return emAreaProtegida ? estaLogado : true;
    },
  },
  providers: [],
};
