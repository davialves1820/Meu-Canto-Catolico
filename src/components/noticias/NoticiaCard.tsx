import Image from "next/image";
import Link from "next/link";
import { Noticia } from "@/types/noticias";
import { formatarData } from "@/lib/server/services/noticias";
import { ArrowUpRight, Sparkles } from "lucide-react";

export default function NoticiaCard({ noticia }: { noticia: Noticia }) {
  return (
    <article className="group flex flex-col h-full bg-surface-container-lowest border border-secondary/5 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-secondary/5 transition-all duration-500">
      <div className="relative overflow-hidden aspect-video bg-surface-container-low">
        {noticia.imagem ? (
          <Image
            src={noticia.imagem}
            alt={noticia.titulo}
            fill
            className="object-cover transition-all duration-1000 group-hover:scale-110"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="text-secondary/20" size={32} />
          </div>
        )}
        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500" />
      </div>

      <div className="flex flex-col flex-1 p-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="font-label-sm text-primary/70 px-2 py-0.5 rounded-full border border-primary/20 bg-primary/5">
            {noticia.fonteLabel}
          </span>
          <div className="h-[1px] w-4 bg-secondary/30" />
          <p className="font-label-sm text-secondary">
            {formatarData(noticia.publicadoEm)}
          </p>
        </div>

        <h3 className="font-headline-md text-primary mb-4 group-hover:text-secondary transition-colors duration-300 leading-snug">
          {noticia.titulo}
        </h3>

        <p className="font-body-sm text-on-surface-variant line-clamp-3 mb-8 flex-1 opacity-80 leading-relaxed">
          {noticia.resumo}
        </p>

        <Link
          href={noticia.url}
          target="_blank"
          className="inline-flex items-center gap-2 font-label-md text-primary hover:text-secondary transition-all group/link"
        >
          LER NOTÍCIA
          <ArrowUpRight size={14} className="group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform" />
        </Link>
      </div>
    </article>
  );
}

