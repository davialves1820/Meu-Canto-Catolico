import Link from "next/link";
import { BookOpen } from "lucide-react";
import { parsearReferencia, urlDaReferencia } from "@/lib/server/utils/parsearReferencia";

/** Referência da leitura ("Lc 19,41-44") como link para o capítulo na Bíblia, quando reconhecida. */
export default function ReferenciaBiblica({ referencia }: { referencia: string }) {
  const ref = parsearReferencia(referencia);
  const classe = "text-xl md:text-2xl font-heading font-medium text-primary tracking-normal";

  if (!ref) {
    return <p className={classe}>{referencia}</p>;
  }

  return (
    <Link
      href={urlDaReferencia(ref)}
      className={`${classe} group inline-flex items-center gap-2 hover:underline underline-offset-4`}
      title={`Ler ${ref.livro} ${ref.capitulo} na Bíblia`}
    >
      {referencia}
      <BookOpen size={16} className="opacity-50 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
    </Link>
  );
}
