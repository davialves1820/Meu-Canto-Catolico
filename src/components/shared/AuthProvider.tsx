"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

// Sem a prop session: a sessão é buscada no cliente (/api/auth/session). Passá-la do
// servidor exigiria auth() no layout, o que tornava todas as páginas dinâmicas.
export function AuthProvider({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
