import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

declare global {
  var __prisma: PrismaClient | undefined;
}

let prisma: PrismaClient | null | undefined;

/**
 * Cliente Prisma (Neon via pooler) lazy-singleton. Retorna null se DATABASE_URL não
 * estiver configurada, para permitir que o resto do app funcione sem banco em dev local.
 * max:1 porque a connection string já usa o pooler do Neon — cada instância serverless
 * já é isolada, não precisa de um pool interno também.
 */
export function getPrisma(): PrismaClient | null {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return null;

  if (prisma === undefined) {
    if (global.__prisma) {
      prisma = global.__prisma;
    } else {
      const adapter = new PrismaPg({ connectionString, max: 1 });
      prisma = new PrismaClient({ adapter });
      if (process.env.NODE_ENV !== "production") global.__prisma = prisma;
    }
  }

  return prisma;
}
