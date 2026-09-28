import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { verificarRateLimit } from "@/lib/server/utils/rateLimit";
import { AVATAR_TAMANHO_MAXIMO_BYTES, AVATAR_TIPOS_PERMITIDOS } from "@/lib/shared/avatar";

export async function POST(request: NextRequest) {
  const bloqueado = verificarRateLimit(request, { limite: 10, janela: 60_000 });
  if (bloqueado) {
    return bloqueado;
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "Upload de imagens não está configurado no momento." },
      { status: 503 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
    }
    if (!AVATAR_TIPOS_PERMITIDOS.includes(file.type as (typeof AVATAR_TIPOS_PERMITIDOS)[number])) {
      return NextResponse.json({ error: "Formato de imagem não suportado. Use JPEG, PNG ou WebP." }, { status: 400 });
    }
    if (file.size > AVATAR_TAMANHO_MAXIMO_BYTES) {
      return NextResponse.json({ error: "A imagem precisa ter no máximo 4MB." }, { status: 400 });
    }

    const extensao = file.type.split("/")[1];
    const nomeArquivo = `avatares/${crypto.randomUUID()}.${extensao}`;

    const blob = await put(nomeArquivo, file, {
      access: "public",
      contentType: file.type,
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("[avatar]", error);
    return NextResponse.json({ error: "Não foi possível enviar a imagem." }, { status: 500 });
  }
}
