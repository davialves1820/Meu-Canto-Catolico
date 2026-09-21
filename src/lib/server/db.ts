import postgres from "postgres";

let sql: postgres.Sql | null = null;

/**
 * Cliente Postgres (Neon) lazy-singleton. Retorna null se DATABASE_URL não estiver
 * configurada, para permitir que o resto do app funcione sem banco em dev local.
 * Usa a connection string com pooler do Neon — max:1 porque cada instância
 * serverless já é isolada, não precisa de um pool interno também.
 */
export function getDb(): postgres.Sql | null {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return null;
  if (!sql) {
    sql = postgres(connectionString, { max: 1 });
  }
  return sql;
}
