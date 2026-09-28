"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, Lock, Eye, EyeOff, ArrowRight, CircleAlert } from "lucide-react";

export default function RedefinirSenhaForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  if (!token) {
    return (
      <div className="text-center space-y-4 py-4">
        <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
          <CircleAlert size={26} className="text-destructive" aria-hidden="true" />
        </div>
        <p className="font-body-md text-on-surface">Link de redefinição inválido.</p>
        <Link href="/esqueci-senha" className="inline-block font-label-md text-xs uppercase tracking-wider text-primary hover:underline underline-offset-4">
          Pedir um novo link
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    setCarregando(true);

    try {
      const res = await fetch("/api/redefinir-senha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: senha }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErro(data.error ?? "Não foi possível redefinir a senha.");
        setCarregando(false);
        return;
      }

      router.push("/entrar?redefinida=1");
    } catch {
      setErro("Não foi possível redefinir a senha. Tente novamente.");
      setCarregando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div className="space-y-2">
        <label htmlFor="senha" className="block font-label-sm text-on-surface uppercase tracking-wider">
          Nova senha
        </label>
        <div className="relative flex items-center">
          <Lock size={18} className="absolute left-4 text-outline pointer-events-none" aria-hidden="true" />
          <input
            id="senha"
            type={mostrarSenha ? "text" : "password"}
            required
            minLength={8}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            autoComplete="new-password"
            placeholder="••••••••••••"
            className="w-full pl-12 pr-12 py-3.5 bg-surface-container-low text-on-surface rounded-xl font-body-md text-sm placeholder:text-outline outline-none transition-colors focus:bg-surface-container"
          />
          <button
            type="button"
            onClick={() => setMostrarSenha((v) => !v)}
            aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
            className="absolute right-4 text-outline hover:text-on-surface transition-colors"
          >
            {mostrarSenha ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
          </button>
        </div>
        <p className="font-label-sm text-[10px] text-outline">Mínimo de 8 caracteres.</p>
      </div>

      <div className="space-y-2">
        <label htmlFor="confirmarSenha" className="block font-label-sm text-on-surface uppercase tracking-wider">
          Confirmar nova senha
        </label>
        <div className="relative flex items-center">
          <Lock size={18} className="absolute left-4 text-outline pointer-events-none" aria-hidden="true" />
          <input
            id="confirmarSenha"
            type={mostrarSenha ? "text" : "password"}
            required
            minLength={8}
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            autoComplete="new-password"
            placeholder="••••••••••••"
            className="w-full pl-12 pr-4 py-3.5 bg-surface-container-low text-on-surface rounded-xl font-body-md text-sm placeholder:text-outline outline-none transition-colors focus:bg-surface-container"
          />
        </div>
      </div>

      {erro && (
        <p role="alert" className="font-body-sm text-sm text-destructive">
          {erro}
        </p>
      )}

      <button
        type="submit"
        disabled={carregando}
        className="w-full inline-flex items-center justify-center gap-3 bg-primary text-primary-foreground rounded-xl py-4 font-label-md text-sm font-bold uppercase tracking-widest transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-60"
      >
        {carregando
          ? <Loader2 size={16} className="animate-spin" aria-hidden="true" />
          : <ArrowRight size={16} aria-hidden="true" />
        }
        {carregando ? "Salvando..." : "Redefinir senha"}
      </button>
    </form>
  );
}
