"use client";

import { useState } from "react";
import { Loader2, Lock, Eye, EyeOff, Check, CircleCheck } from "lucide-react";

export default function AlterarSenhaForm({ aoConcluir }: { aoConcluir: () => void }) {
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    if (novaSenha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    setSalvando(true);

    try {
      const res = await fetch("/api/perfil/senha", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: senhaAtual, newPassword: novaSenha }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErro(data.error ?? "Não foi possível alterar a senha.");
        setSalvando(false);
        return;
      }

      setSucesso(true);
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");
      setTimeout(aoConcluir, 1200);
    } catch {
      setErro("Não foi possível alterar a senha. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="space-y-2">
        <label htmlFor="senhaAtual" className="block font-label-sm text-on-surface uppercase tracking-wider">
          Senha atual
        </label>
        <div className="relative flex items-center">
          <Lock size={18} className="absolute left-4 text-outline pointer-events-none" aria-hidden="true" />
          <input
            id="senhaAtual"
            type={mostrarSenha ? "text" : "password"}
            required
            value={senhaAtual}
            onChange={(e) => setSenhaAtual(e.target.value)}
            autoComplete="current-password"
            placeholder="••••••••••••"
            className="w-full pl-12 pr-12 py-3 bg-surface-container-low text-on-surface rounded-xl font-body-md text-sm placeholder:text-outline outline-none transition-colors focus:bg-surface-container"
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

      <div className="space-y-2">
        <label htmlFor="novaSenha" className="block font-label-sm text-on-surface uppercase tracking-wider">
          Nova senha
        </label>
        <div className="relative flex items-center">
          <Lock size={18} className="absolute left-4 text-outline pointer-events-none" aria-hidden="true" />
          <input
            id="novaSenha"
            type={mostrarSenha ? "text" : "password"}
            required
            minLength={8}
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            autoComplete="new-password"
            placeholder="Mínimo de 8 caracteres"
            className="w-full pl-12 pr-4 py-3 bg-surface-container-low text-on-surface rounded-xl font-body-md text-sm placeholder:text-outline outline-none transition-colors focus:bg-surface-container"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="confirmarSenhaNova" className="block font-label-sm text-on-surface uppercase tracking-wider">
          Confirmar nova senha
        </label>
        <div className="relative flex items-center">
          <Lock size={18} className="absolute left-4 text-outline pointer-events-none" aria-hidden="true" />
          <input
            id="confirmarSenhaNova"
            type={mostrarSenha ? "text" : "password"}
            required
            minLength={8}
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            autoComplete="new-password"
            placeholder="Confirme a nova senha"
            className="w-full pl-12 pr-4 py-3 bg-surface-container-low text-on-surface rounded-xl font-body-md text-sm placeholder:text-outline outline-none transition-colors focus:bg-surface-container"
          />
        </div>
      </div>

      {erro && (
        <p role="alert" className="font-body-sm text-sm text-destructive">
          {erro}
        </p>
      )}
      {sucesso && (
        <p className="flex items-center gap-2 font-body-sm text-sm text-primary">
          <CircleCheck size={16} className="shrink-0" aria-hidden="true" />
          Senha alterada com sucesso.
        </p>
      )}

      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={aoConcluir}
          className="px-4 py-2.5 rounded-xl font-label-md text-sm uppercase tracking-wider text-on-surface-variant hover:text-on-surface transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={salvando}
          className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl px-6 py-2.5 font-label-md text-sm font-bold uppercase tracking-widest transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-60"
        >
          {salvando
            ? <Loader2 size={16} className="animate-spin" aria-hidden="true" />
            : <Check size={16} aria-hidden="true" />
          }
          {salvando ? "Salvando..." : "Atualizar senha"}
        </button>
      </div>
    </form>
  );
}
