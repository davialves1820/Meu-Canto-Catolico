import { getPrisma } from "@/lib/server/prisma";
import type { Prisma } from "@/generated/prisma/client";

/** "rosario" ou "novena:<slug>:<versao>". */
export const PADRAO_CHAVE_PROGRESSO = /^(rosario|novena:[a-z0-9-]{1,80}:[a-z0-9_-]{1,40})$/;

export interface ProgressoSalvo {
  dados: unknown;
  /** Epoch em ms. */
  atualizadoEm: number;
}

export async function lerProgresso(userId: string, chave: string): Promise<ProgressoSalvo | null> {
  const db = getPrisma();
  if (!db) return null;

  const registro = await db.progressoUsuario.findUnique({
    where: { userId_chave: { userId, chave } },
    select: { dados: true, atualizadoEm: true },
  });
  return registro ? { dados: registro.dados, atualizadoEm: registro.atualizadoEm.getTime() } : null;
}

/** Grava só se for mais recente que o salvo: um aparelho atrasado não apaga o progresso de outro. */
export async function salvarProgresso(userId: string, chave: string, dados: unknown, atualizadoEm: number): Promise<void> {
  const db = getPrisma();
  if (!db) throw new Error("Banco de dados não configurado.");

  const data = new Date(atualizadoEm);
  const valor = dados as Prisma.InputJsonValue;
  await db.$transaction(async (tx) => {
    const atual = await tx.progressoUsuario.findUnique({
      where: { userId_chave: { userId, chave } },
      select: { atualizadoEm: true },
    });
    if (atual && atual.atualizadoEm >= data) return;
    await tx.progressoUsuario.upsert({
      where: { userId_chave: { userId, chave } },
      create: { userId, chave, dados: valor, atualizadoEm: data },
      update: { dados: valor, atualizadoEm: data },
    });
  });
}
