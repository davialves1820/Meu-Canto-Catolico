"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Loader2, Mail, Lock, Eye, EyeOff, ArrowRight, CircleCheck } from "lucide-react";

export default function EntrarForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setCarregando(true);

    const resultado = await signIn("credentials", { email, password: senha, redirect: false });

    if (resultado?.error) {
      setErro("E-mail ou senha incorretos.");
      setCarregando(false);
      return;
    }

    const callbackUrl = searchParams.get("callbackUrl") || "/conta";
    router.push(callbackUrl);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {searchParams.get("redefinida") === "1" && (
        <p className="flex items-center gap-2 font-body-sm text-sm text-primary bg-primary/5 border border-primary/15 rounded-xl px-4 py-3">
          <CircleCheck size={16} className="shrink-0" aria-hidden="true" />
          Senha redefinida com sucesso. Entre com sua nova senha.
        </p>
      )}

      <div className="space-y-2">
        <label htmlFor="email" className="block font-label-sm text-on-surface uppercase tracking-wider">
          Endereço de e-mail
        </label>
        <div className="relative flex items-center">
          <Mail size={18} className="absolute left-4 text-outline pointer-events-none" aria-hidden="true" />
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="seu.email@exemplo.com"
            className="w-full pl-12 pr-4 py-3.5 bg-surface-container-low text-on-surface rounded-xl font-body-md text-sm placeholder:text-outline outline-none transition-colors focus:bg-surface-container"
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="senha" className="block font-label-sm text-on-surface uppercase tracking-wider">
            Senha
          </label>
          <Link href="/esqueci-senha" className="font-label-sm text-xs text-primary hover:underline underline-offset-4">
            Esqueceu a senha?
          </Link>
        </div>
        <div className="relative flex items-center">
          <Lock size={18} className="absolute left-4 text-outline pointer-events-none" aria-hidden="true" />
          <input
            id="senha"
            type={mostrarSenha ? "text" : "password"}
            required
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            autoComplete="current-password"
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
        {carregando ? "Entrando..." : "Entrar"}
      </button>

      <p className="text-center font-body-sm text-on-surface-variant pt-2">
        Ainda não tem conta?{" "}
        <Link href="/cadastro" className="font-label-md text-xs uppercase tracking-wider text-primary hover:underline underline-offset-4">
          Criar conta
        </Link>
      </p>
    </form>
  );
}
