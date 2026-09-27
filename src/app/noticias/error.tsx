"use client";

import { useEffect } from "react";
import { RotateCcw, Newspaper } from "lucide-react";
import Link from "next/link";

export default function NoticiasError({ error, reset }: { error: Error & { digest?: string }; reset: () => void; }) {
    useEffect(() => {
        console.error("[noticias/error]", error);
    }, [error]);

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center">
            <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border border-border"
                style={{ background: "hsl(var(--secondary))" }}
            >
                <Newspaper size={28} className="text-muted-foreground" aria-hidden="true" />
            </div>

            <h2 className="font-heading text-3xl font-bold text-foreground mb-3">
                Não foi possível carregar as notícias
            </h2>
            <p className="font-body text-muted-foreground mb-8 max-w-md">
                Ocorreu um erro ao buscar as notícias. Verifique sua conexão e tente novamente.
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
                <button
                    onClick={() => reset()}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-body font-bold text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    style={{
                        background: "hsl(var(--primary))",
                        color: "hsl(var(--primary-foreground))",
                    }}
                >
                    <RotateCcw size={16} aria-hidden="true" />
                    Tentar novamente
                </button>
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-body font-bold text-sm border border-border text-foreground hover:border-primary/40 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                    Voltar para o Início
                </Link>
            </div>

            {error.digest && (
                <p className="mt-8 text-[10px] font-body text-muted-foreground/40 uppercase tracking-widest">
                    ref: {error.digest}
                </p>
            )}
        </div>
    );
}