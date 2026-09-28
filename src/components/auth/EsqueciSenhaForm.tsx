"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Mail, ArrowRight, MailCheck } from "lucide-react";

export default function EsqueciSenhaForm() {
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setCarregando(true);

    try {
      const res = await fetch("/api/esqueci-senha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setErro(data?.error ?? "Não foi possível enviar o link. Tente novamente.");
        setCarregando(false);
        return;
      }

      setEnviado(true);
    } catch {
      setErro("Não foi possível enviar o link. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  if (enviado) {
    return (
      <div className="text-center space-y-4 py-4">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <MailCheck size={26} className="text-primary" aria-hidden="true" />
        </div>
        <p className="font-body-md text-on-surface">
          Se <strong>{email}</strong> estiver cadastrado, enviamos um link de redefinição para essa caixa de entrada.
        </p>
        <p className="font-body-sm text-on-surface-variant">
          O link expira em 1 hora. Confira também a caixa de spam.
        </p>
        <Link href="/entrar" className="inline-block font-label-md text-xs uppercase tracking-wider text-primary hover:underline underline-offset-4 pt-2">
          Voltar para o login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
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
        {carregando ? "Enviando..." : "Enviar link de redefinição"}
      </button>

      <p className="text-center font-body-sm text-on-surface-variant">
        Lembrou a senha?{" "}
        <Link href="/entrar" className="font-label-md text-xs uppercase tracking-wider text-primary hover:underline underline-offset-4">
          Entrar
        </Link>
      </p>
    </form>
  );
}
