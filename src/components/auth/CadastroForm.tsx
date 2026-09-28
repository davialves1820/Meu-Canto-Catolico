"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { Loader2, Mail, Lock, Eye, EyeOff, User, Camera, Check, ArrowRight } from "lucide-react";
import { AVATAR_TAMANHO_MAXIMO_BYTES, AVATAR_TIPOS_PERMITIDOS } from "@/lib/shared/avatar";

type ForcaSenha = { label: string; cor: string; nivel: number };

function calcularForcaSenha(senha: string): ForcaSenha {
  if (!senha) return { label: "Mínimo de 8 caracteres", cor: "text-on-surface-variant", nivel: 0 };

  let pontos = 0;
  if (senha.length >= 8) pontos++;
  if (/[A-Z]/.test(senha)) pontos++;
  if (/[0-9]/.test(senha)) pontos++;
  if (/[^A-Za-z0-9]/.test(senha)) pontos++;

  if (pontos <= 1) return { label: "Senha fraca", cor: "text-destructive", nivel: 1 };
  if (pontos === 2) return { label: "Senha razoável", cor: "text-secondary", nivel: 2 };
  if (pontos === 3) return { label: "Senha boa", cor: "text-primary", nivel: 3 };
  return { label: "Senha forte", cor: "text-primary", nivel: 4 };
}

export default function CadastroForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [aceitaTermos, setAceitaTermos] = useState(false);

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [enviandoAvatar, setEnviandoAvatar] = useState(false);
  const [erroAvatar, setErroAvatar] = useState<string | null>(null);

  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  const forca = calcularForcaSenha(senha);

  const handleSelecionarAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = "";
    setErroAvatar(null);

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
        setAvatarUrl(null);
        return;
      }

      setAvatarUrl(data.url);
    } catch {
      setErroAvatar("Não foi possível enviar a foto. Tente novamente.");
      setAvatarUrl(null);
    } finally {
      setEnviandoAvatar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }
    if (!aceitaTermos) {
      setErro("É preciso concordar com os Termos de Uso e a Política de Privacidade.");
      return;
    }

    setCarregando(true);

    try {
      const res = await fetch("/api/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nome,
          email,
          password: senha,
          avatarUrl: avatarUrl ?? undefined,
          termsAccepted: aceitaTermos,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErro(data.error ?? "Não foi possível criar a conta.");
        setCarregando(false);
        return;
      }

      const resultado = await signIn("credentials", { email, password: senha, redirect: false });
      if (resultado?.error) {
        setErro("Conta criada! Não conseguimos entrar automaticamente — tente fazer login.");
        setCarregando(false);
        return;
      }

      router.push("/conta");
      router.refresh();
    } catch {
      setErro("Não foi possível criar a conta. Tente novamente.");
      setCarregando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Foto de perfil */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          aria-label="Escolher foto de perfil"
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
          <p className="font-body-sm text-xs text-on-surface-variant">Opcional — JPEG, PNG ou WebP, até 4MB.</p>
          {erroAvatar && <p className="font-body-sm text-xs text-destructive mt-1">{erroAvatar}</p>}
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
            onChange={(e) => setNome(e.target.value)}
            autoComplete="name"
            className="w-full pl-12 pr-4 py-3.5 bg-surface-container-low text-on-surface rounded-xl font-body-md text-sm placeholder:text-outline outline-none transition-colors focus:bg-surface-container"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="block font-label-sm text-on-surface uppercase tracking-wider">
          E-mail
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
          <span className={`font-label-sm text-[11px] ${forca.cor}`}>{forca.label}</span>
        </div>
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
        <div className="grid grid-cols-4 gap-1.5 h-1.5">
          {[1, 2, 3, 4].map((nivel) => (
            <div
              key={nivel}
              className={`h-full rounded-full transition-colors duration-300 ${nivel <= forca.nivel
                ? forca.nivel <= 1 ? "bg-destructive" : forca.nivel === 2 ? "bg-secondary" : "bg-primary"
                : "bg-outline-variant"
                }`}
            />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="confirmarSenha" className="block font-label-sm text-on-surface uppercase tracking-wider">
          Confirmar senha
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

      <label className="flex items-start gap-3 cursor-pointer group">
        <div className="relative flex items-center justify-center mt-0.5 shrink-0">
          <input
            type="checkbox"
            required
            checked={aceitaTermos}
            onChange={(e) => setAceitaTermos(e.target.checked)}
            className="peer sr-only"
          />
          <div className="w-5 h-5 rounded bg-surface-container-low border border-secondary/20 peer-checked:bg-primary peer-checked:border-primary transition-colors flex items-center justify-center">
            <Check size={13} className="text-primary-foreground opacity-0 peer-checked:opacity-100 transition-opacity" aria-hidden="true" />
          </div>
        </div>
        <span className="font-body-sm text-sm text-on-surface-variant group-hover:text-on-surface transition-colors">
          Li e concordo com os <Link href="/termos" className="text-primary underline underline-offset-2">Termos de Uso</Link> e a{" "}
          <Link href="/privacidade" className="text-primary underline underline-offset-2">Política de Privacidade</Link>.
        </span>
      </label>

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
        {carregando ? "Criando conta..." : "Criar conta"}
      </button>

      <p className="text-center font-body-sm text-on-surface-variant">
        Já tem conta?{" "}
        <Link href="/entrar" className="font-label-md text-xs uppercase tracking-wider text-primary hover:underline underline-offset-4">
          Entrar
        </Link>
      </p>
    </form>
  );
}
