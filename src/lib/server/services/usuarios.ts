import crypto from "crypto";
import { getPrisma } from "@/lib/server/prisma";

export interface Usuario {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}

interface UsuarioComSenha extends Usuario {
  passwordHash: string;
}

function normalizarEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function buscarUsuarioPorEmailComSenha(email: string): Promise<UsuarioComSenha | null> {
  const db = getPrisma();
  if (!db) return null;

  const usuario = await db.user.findUnique({
    where: { email: normalizarEmail(email) },
    select: { id: true, name: true, email: true, avatarUrl: true, passwordHash: true },
  });

  if (!usuario) return null;
  return usuario;
}

export async function emailJaCadastrado(email: string): Promise<boolean> {
  const db = getPrisma();
  if (!db) throw new Error("Banco de dados não configurado.");

  const usuario = await db.user.findUnique({
    where: { email: normalizarEmail(email) },
    select: { id: true },
  });
  return !!usuario;
}

export async function buscarUsuarioPorId(id: string): Promise<Usuario | null> {
  const db = getPrisma();
  if (!db) return null;

  return db.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, avatarUrl: true },
  });
}

export async function atualizarUsuario({
  id,
  name,
  avatarUrl,
}: {
  id: string;
  name: string;
  avatarUrl: string | null;
}): Promise<Usuario> {
  const db = getPrisma();
  if (!db) throw new Error("Banco de dados não configurado.");

  return db.user.update({
    where: { id },
    data: { name, avatarUrl },
    select: { id: true, name: true, email: true, avatarUrl: true },
  });
}

export async function buscarSenhaHashPorId(id: string): Promise<string | null> {
  const db = getPrisma();
  if (!db) return null;

  const usuario = await db.user.findUnique({ where: { id }, select: { passwordHash: true } });
  return usuario?.passwordHash ?? null;
}

export async function buscarDataCadastro(id: string): Promise<Date | null> {
  const db = getPrisma();
  if (!db) return null;

  const usuario = await db.user.findUnique({ where: { id }, select: { criadoEm: true } });
  return usuario?.criadoEm ?? null;
}

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Gera um token de redefinição de senha (válido por 1h) e salva o hash dele
 * (nunca o token puro) no usuário com esse e-mail. Retorna o token puro (pra
 * ir no link do e-mail) e o nome do usuário — ou null se o e-mail não existe.
 * O chamador deve responder de forma genérica de qualquer jeito, pra não dar
 * pra descobrir por tentativa quais e-mails estão cadastrados.
 */
export async function gerarTokenReset(email: string): Promise<{ token: string; name: string } | null> {
  const db = getPrisma();
  if (!db) return null;

  const emailNormalizado = normalizarEmail(email);
  const usuario = await db.user.findUnique({ where: { email: emailNormalizado }, select: { id: true, name: true } });
  if (!usuario) return null;

  const token = crypto.randomBytes(32).toString("hex");
  const expiraEm = new Date(Date.now() + 60 * 60 * 1000); // 1h

  await db.user.update({
    where: { id: usuario.id },
    data: { resetTokenHash: hashToken(token), resetTokenExpiresAt: expiraEm },
  });

  return { token, name: usuario.name };
}

export async function buscarUsuarioPorTokenReset(token: string): Promise<{ id: string; name: string; email: string } | null> {
  const db = getPrisma();
  if (!db) return null;

  const usuario = await db.user.findFirst({
    where: { resetTokenHash: hashToken(token), resetTokenExpiresAt: { gt: new Date() } },
    select: { id: true, name: true, email: true },
  });
  return usuario;
}

export async function redefinirSenha(userId: string, novoPasswordHash: string): Promise<void> {
  const db = getPrisma();
  if (!db) throw new Error("Banco de dados não configurado.");

  await db.user.update({
    where: { id: userId },
    data: { passwordHash: novoPasswordHash, resetTokenHash: null, resetTokenExpiresAt: null },
  });
}

export async function criarUsuario({
  name,
  email,
  passwordHash,
  avatarUrl,
}: {
  name: string;
  email: string;
  passwordHash: string;
  avatarUrl?: string;
}): Promise<Usuario> {
  const db = getPrisma();
  if (!db) throw new Error("Banco de dados não configurado.");

  const id = crypto.randomUUID();
  const emailNormalizado = normalizarEmail(email);

  await db.user.create({
    data: {
      id,
      name,
      email: emailNormalizado,
      passwordHash,
      avatarUrl: avatarUrl ?? null,
      termsAcceptedAt: new Date(),
    },
  });

  return { id, name, email: emailNormalizado, avatarUrl: avatarUrl ?? null };
}
