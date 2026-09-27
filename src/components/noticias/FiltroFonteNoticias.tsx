"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FEEDS, FonteNoticia } from "@/config/feeds";

interface Props {
  fonteAtiva: FonteNoticia | "todas";
}

const OPCOES: { label: string; value: FonteNoticia | "todas" }[] = [
  { label: "Todas", value: "todas" },
  ...Object.entries(FEEDS).map(([value, { label }]) => ({ label, value: value as FonteNoticia })),
];

export default function FiltroFonteNoticias({ fonteAtiva }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleFonte = (fonte: FonteNoticia | "todas") => {
    const q = new URLSearchParams(searchParams.toString());
    if (fonte !== "todas") q.set("fonte", fonte);
    else q.delete("fonte");
    router.push(`/noticias?${q.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 mt-6" role="group" aria-label="Filtrar por fonte">
      {OPCOES.map((opt) => {
        const isActive = opt.value === fonteAtiva;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => handleFonte(opt.value)}
            aria-pressed={isActive}
            className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border ${isActive
              ? "bg-primary text-primary-foreground border-primary shadow-sm"
              : "bg-transparent text-on-surface-variant border-outline-variant hover:border-primary hover:text-primary"
              }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
