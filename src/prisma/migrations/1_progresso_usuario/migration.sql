-- CreateTable
CREATE TABLE "progresso_usuario" (
    "user_id" UUID NOT NULL,
    "chave" TEXT NOT NULL,
    "dados" JSONB NOT NULL,
    "atualizado_em" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "progresso_usuario_pkey" PRIMARY KEY ("user_id","chave")
);

-- AddForeignKey
ALTER TABLE "progresso_usuario" ADD CONSTRAINT "progresso_usuario_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
