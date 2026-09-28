"use client";

import { useRef, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Loader2, User, Camera, X, Check, CircleCheck } from "lucide-react";
import { AVATAR_TAMANHO_MAXIMO_BYTES, AVATAR_TIPOS_PERMITIDOS } from "@/lib/shared/avatar";

interface Props {
  nomeInicial: string;
  avatarUrlInicial: string | null;
  aoConcluir?: () => void;
}

export default function PerfilForm({ nomeInicial, avatarUrlInicial, aoConcluir }: Props) {
  const { update } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [nome, setNome] = useState(nomeInicial);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(avatarUrlInicial);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(avatarUrlInicial);
  const [enviandoAvatar, setEnviandoAvatar] = useState(false);
  const [erroAvatar, setErroAvatar] = useState<string | null>(null);

  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const alterado = nome.trim() !== nomeInicial || avatarUrl !== avatarUrlInicial;

  const handleSelecionarAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = "";
    setErroAvatar(null);
    setSucesso(false);

    if (!AVATAR_TIPOS_PERMITIDOS.includes(file.type as (typeof AVATAR_TIPOS_PERMITIDOS)[number])) {
      setErroAvatar("Formato de imagem não suportado. Use JPEG, PNG ou WebP.");
      return;
    }
    if (file.size > AVATAR_TAMANHO_MAXIMO_BYTES) {
      setErroAvatar("A imagem precisa ter no máximo 4MB.");
      return;
    }

    setAvatarPreview(URL.createObjectURL(file));
    setEnviandoAvatar(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/avatar", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setErroAvatar(data.error ?? "Não foi possível enviar a foto.");
        setAvatarPreview(avatarUrl);
        return;
      }

      setAvatarUrl(data.url);
    } catch {
      setErroAvatar("Não foi possível enviar a foto. Tente novamente.");
      setAvatarPreview(avatarUrl);
    } finally {
      setEnviandoAvatar(false);
    }
  };

  const handleRemoverAvatar = () => {
    setAvatarUrl(null);
    setAvatarPreview(null);
    setErroAvatar(null);
    setSucesso(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setSucesso(false);

    if (nome.trim().length < 2) {
      setErro("Informe seu nome.");
      return;
    }

    setSalvando(true);

    try {
      const res = await fetch("/api/perfil", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nome.trim(), avatarUrl: avatarUrl ?? "" }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErro(data.error ?? "Não foi possível salvar as alterações.");
        setSalvando(false);
        return;
      }

      // Atualiza a sessão em memória (Header, etc.) sem precisar deslogar/logar.
      await update({ name: data.name, image: data.avatarUrl });
      setSucesso(true);
      if (aoConcluir) setTimeout(aoConcluir, 1200);
    } catch {
      setErro("Não foi possível salvar as alterações. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          aria-label="Alterar foto de perfil"
          className="relative shrink-0 w-16 h-16 rounded-full bg-surface-container-low border border-secondary/15 flex items-center justify-center overflow-hidden hover:border-primary/40 transition-colors"
        >
          {avatarPreview ? (
            <Image src={avatarPreview} alt="" fill unoptimized className="object-cover" />
          ) : (
            <User size={24} className="text-outline" aria-hidden="true" />
          )}
          <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors flex items-center justify-center">
            {enviandoAvatar
              ? <Loader2 size={18} className="animate-spin text-white" aria-hidden="true" />
              : <Camera size={16} className="text-white opacity-0 hover:opacity-100 transition-opacity" aria-hidden="true" />
            }
          </div>
        </button>
        <div>
          <p className="font-label-md text-sm text-on-surface">Foto de perfil</p>
          <p className="font-body-sm text-xs text-on-surface-variant">JPEG, PNG ou WebP, até 4MB.</p>
          {erroAvatar && <p className="font-body-sm text-xs text-destructive mt-1">{erroAvatar}</p>}
          {avatarPreview && (
            <button
              type="button"
              onClick={handleRemoverAvatar}
              className="inline-flex items-center gap-1 font-label-sm text-xs text-on-surface-variant hover:text-destructive transition-colors mt-1"
            >
              <X size={12} aria-hidden="true" />
              Remover foto
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleSelecionarAvatar}
          className="hidden"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="nome" className="block font-label-sm text-on-surface uppercase tracking-wider">
          Nome completo
        </label>
        <div className="relative flex items-center">
          <User size={18} className="absolute left-4 text-outline pointer-events-none" aria-hidden="true" />
          <input
            id="nome"
            type="text"
            required
            minLength={2}
            value={nome}
            onChange={(e) => { setNome(e.target.value); setSucesso(false); }}
            autoComplete="name"
            className="w-full pl-12 pr-4 py-3.5 bg-surface-container-low text-on-surface rounded-xl font-body-md text-sm placeholder:text-outline outline-none transition-colors focus:bg-surface-container"
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
          Perfil atualizado.
        </p>
      )}

      <div className={aoConcluir ? "flex items-center justify-end gap-3 pt-2" : ""}>
        {aoConcluir && (
          <button
            type="button"
            onClick={aoConcluir}
            className="px-4 py-2.5 rounded-xl font-label-md text-sm uppercase tracking-wider text-on-surface-variant hover:text-on-surface transition-colors"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={salvando || enviandoAvatar || !alterado}
          className={
            aoConcluir
              ? "inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl px-6 py-2.5 font-label-md text-sm font-bold uppercase tracking-widest transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-60"
              : "w-full inline-flex items-center justify-center gap-3 bg-primary text-primary-foreground rounded-xl py-3.5 font-label-md text-sm font-bold uppercase tracking-widest transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-50"
          }
        >
          {salvando
            ? <Loader2 size={16} className="animate-spin" aria-hidden="true" />
            : <Check size={16} aria-hidden="true" />
          }
          {salvando ? "Salvando..." : "Salvar alterações"}
        </button>
      </div>
    </form>
  );
}
