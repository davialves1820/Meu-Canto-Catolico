import Image from "next/image";
import Link from "next/link";
import { PropsCartaoNovena } from "@/types/novena";

export default function CartaoNovena({ novena, detalhe, diaAtual }: PropsCartaoNovena) {
  return (
    <Link href={`/novenas/${novena.slug}`} className="group cursor-pointer block" aria-label={`Rezar a ${novena.titulo}`}>
      <div className="relative aspect-[3/4] overflow-hidden mb-4 border border-outline-variant/30 bg-surface-container">
        {novena.imagem_url ? (
          <Image
            src={novena.imagem_url}
            alt={`Imagem de ${novena.santo}`}
            fill
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
            style={{ objectPosition: novena.posicao_imagem ?? "center" }}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="font-headline-xl text-5xl opacity-10" aria-hidden="true">✝</span>
          </div>
        )}
        {diaAtual && (
          <span className="absolute top-3 left-3 rounded-full bg-primary px-3 py-1 font-label-sm text-[10px] text-on-primary shadow-sm">
            {diaAtual}º dia hoje
          </span>
        )}
      </div>
      {detalhe && <p className="font-label-sm text-label-sm text-secondary mb-1">{detalhe}</p>}
      <h3 className="font-headline-md text-xl md:text-headline-md text-primary group-hover:text-secondary transition-colors line-clamp-2">
        {novena.santo}
      </h3>
      <p className="text-xs text-on-surface-variant mt-2 line-clamp-2 font-body-md">{novena.descricao}</p>
    </Link>
  );
}
