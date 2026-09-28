"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { User, Camera, SquarePen, LockKeyhole, LogOut } from "lucide-react";
import Modal from "@/components/shared/Modal";
import PerfilForm from "@/components/auth/PerfilForm";
import AlterarSenhaForm from "@/components/auth/AlterarSenhaForm";

interface Props {
  nomeInicial: string;
  email: string;
  avatarUrlInicial: string | null;
  membroDesde: string;
  onSignOut: () => void;
}

export default function ContaBanner({ nomeInicial, email, avatarUrlInicial, membroDesde, onSignOut }: Props) {
  const [modalPerfilAberto, setModalPerfilAberto] = useState(false);
  const [modalSenhaAberto, setModalSenhaAberto] = useState(false);

  // update() em PerfilForm atualiza a sessão do next-auth — lê daqui pra refletir
  // nome/foto na hora, sem precisar recarregar a página. Antes da sessão carregar
  // no cliente, cai nos valores vindos do servidor (que já são os mesmos).
  const { data: sessao } = useSession();
  const nome = sessao ? sessao.user?.name ?? "" : nomeInicial;
  const avatarUrl = sessao ? sessao.user?.image ?? null : avatarUrlInicial;

  return (
    <>
      <div className="bg-surface-container-low rounded-2xl border border-secondary/10 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => setModalPerfilAberto(true)}
              aria-label="Alterar foto de perfil"
              className="relative shrink-0 w-20 h-20 rounded-full bg-surface-container-lowest border border-secondary/15 flex items-center justify-center overflow-hidden hover:border-primary/40 transition-colors group"
            >
              {avatarUrl ? (
                <Image src={avatarUrl} alt="" fill unoptimized className="object-cover" />
              ) : (
                <User size={30} className="text-outline" aria-hidden="true" />
              )}
              <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-surface-container-lowest shadow-md flex items-center justify-center text-on-surface group-hover:bg-surface-container transition-colors">
                <Camera size={14} aria-hidden="true" />
              </div>
            </button>

            <div>
              <h1 className="font-headline-lg text-on-surface">{nome}</h1>
              <p className="font-body-sm text-on-surface-variant mt-0.5">{email}</p>
              <p className="font-label-sm text-[11px] text-outline uppercase tracking-wider mt-1">
                Membro desde {membroDesde}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end flex-wrap">
            <button
              type="button"
              onClick={() => setModalPerfilAberto(true)}
              className="px-4 py-2.5 rounded-xl bg-surface-container-lowest hover:bg-surface-container text-on-surface font-label-md text-xs uppercase tracking-wider transition-colors flex items-center gap-2"
            >
              <SquarePen size={16} aria-hidden="true" />
              Editar Perfil
            </button>
            <button
              type="button"
              onClick={() => setModalSenhaAberto(true)}
              className="px-4 py-2.5 rounded-xl bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant hover:text-on-surface font-label-md text-xs uppercase tracking-wider transition-colors flex items-center gap-2"
            >
              <LockKeyhole size={16} aria-hidden="true" />
              Alterar Senha
            </button>
            <button
              type="button"
              onClick={onSignOut}
              aria-label="Sair da conta"
              className="p-2.5 rounded-xl text-destructive hover:bg-destructive/10 transition-colors flex items-center justify-center"
            >
              <LogOut size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <Modal
        aberto={modalPerfilAberto}
        aoFechar={() => setModalPerfilAberto(false)}
        titulo="Editar Perfil"
        descricao="Atualize seu nome e sua foto de perfil."
      >
        <PerfilForm
          nomeInicial={nome}
          avatarUrlInicial={avatarUrl}
          aoConcluir={() => setModalPerfilAberto(false)}
        />
      </Modal>

      <Modal
        aberto={modalSenhaAberto}
        aoFechar={() => setModalSenhaAberto(false)}
        titulo="Alterar Senha"
        descricao="Escolha uma nova senha para sua conta."
      >
        <AlterarSenhaForm aoConcluir={() => setModalSenhaAberto(false)} />
      </Modal>
    </>
  );
}
