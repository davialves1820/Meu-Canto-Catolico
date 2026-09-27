"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, Loader2 } from "lucide-react";

interface Props {
  valorInicial: string;
}

export default function BuscaNoticias({ valorInicial }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [valor, setValor] = useState(valorInicial);
  const [isPending, startTransition] = useTransition();

  const prevValorInicialRef = useRef(valorInicial);
  useEffect(() => {
    if (valorInicial !== prevValorInicialRef.current) {
      prevValorInicialRef.current = valorInicial;
      setValor(valorInicial);
    }
  }, [valorInicial]);

  // Debounce: atualiza a URL (e portanto os resultados, via SSR) um tempo depois
  // que o usuário para de digitar — sem exigir um botão de "buscar".
  useEffect(() => {
    const timer = setTimeout(() => {
      const q = new URLSearchParams(searchParams.toString());
      const atual = q.get("busca") ?? "";
      if (valor === atual) return;

      if (valor.trim()) {
        q.set("busca", valor.trim());
      } else {
        q.delete("busca");
      }
      startTransition(() => {
        router.push(`/noticias?${q.toString()}`, { scroll: false });
      });
    }, 400);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valor]);

  return (
    <form
      role="search"
      onSubmit={(e) => e.preventDefault()}
      className="relative w-full max-w-md mx-auto mt-8"
    >
      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
        {isPending
          ? <Loader2 size={16} className="animate-spin text-outline" aria-hidden="true" />
          : <Search size={16} className="text-outline" aria-hidden="true" />
        }
      </div>
      <input
        type="search"
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        placeholder="Pesquisar notícias..."
        aria-label="Pesquisar notícias"
        className="w-full bg-surface-container-lowest border border-secondary/15 rounded-full py-3 pl-11 pr-11 text-sm font-body-md text-on-surface outline-none transition-colors focus:border-primary/40 placeholder:text-outline"
      />
      {valor && (
        <button
          type="button"
          onClick={() => setValor("")}
          aria-label="Limpar busca"
          className="absolute inset-y-0 right-0 flex items-center pr-4 text-outline hover:text-primary transition-colors"
        >
          <X size={16} aria-hidden="true" />
        </button>
      )}
    </form>
  );
}
