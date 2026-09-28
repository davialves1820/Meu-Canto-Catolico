import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

// Next.js 16 renomeou o arquivo de "middleware" pra "proxy". A exportação via
// destructuring ("export const { auth: middleware } = ...") não era reconhecida
// pela análise estática do Next — usar um default export resolve isso.
const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  matcher: ["/conta/:path*"],
};
