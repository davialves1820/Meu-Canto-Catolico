"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { Download, Share, X } from "lucide-react";
import { siteConfig } from "@/config/site";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

const DISMISS_KEY = "mcc-install-banner-dismissed";

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as { standalone?: boolean }).standalone === true
  );
}

function isIOSDevice(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

// Store somente-cliente sem eventos reais para ler valores de browser (userAgent, matchMedia,
// localStorage) sem disparar setState dentro do corpo do efeito e sem gerar hidratação divergente.
const neverChanges = () => () => {};

function useClientFlag(compute: () => boolean): boolean {
  return useSyncExternalStore(neverChanges, compute, () => false);
}

/** Banner discreto que oferece instalar o PWA: prompt nativo no Android/Chrome, instruções no iOS. */
export function InstallAppBanner() {
  const standalone = useClientFlag(isStandalone);
  const isIOS = useClientFlag(isIOSDevice);
  const dismissed = useClientFlag(() => localStorage.getItem(DISMISS_KEY) === "1");

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [promptVisible, setPromptVisible] = useState(false);

  useEffect(() => {
    if (standalone || dismissed || isIOS) return;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setPromptVisible(true);
    };
    const handleAppInstalled = () => {
      setPromptVisible(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [standalone, dismissed, isIOS]);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    if (outcome === "accepted") setPromptVisible(false);
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    localStorage.setItem(DISMISS_KEY, "1");
    setPromptVisible(false);
  }, []);

  const showIOSBanner = isIOS && !standalone && !dismissed;
  const visible = showIOSBanner || promptVisible;

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Instalar aplicativo"
      className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-md items-start gap-4 rounded-2xl border border-[#c9a84c]/30 bg-white p-4 shadow-xl md:inset-x-auto md:right-6 md:left-auto"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#c9a84c]/10 text-primary">
        <Download size={20} aria-hidden="true" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-body-sm font-semibold text-[#1b1c19]">Instalar {siteConfig.shortName}</p>

        {showIOSBanner ? (
          <p className="mt-0.5 text-xs leading-snug text-[#4d4540]">
            Toque em <Share size={12} className="inline -mt-0.5" aria-hidden="true" /> Compartilhar e depois em
            &quot;Adicionar à Tela de Início&quot;.
          </p>
        ) : (
          <>
            <p className="mt-0.5 text-xs leading-snug text-[#4d4540]">
              Acesse a liturgia, a Bíblia e as orações direto da tela inicial, mesmo offline.
            </p>
            <button
              onClick={handleInstall}
              className="mt-3 rounded-full bg-[#000000] px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-white transition-colors hover:bg-primary"
            >
              Instalar
            </button>
          </>
        )}
      </div>

      <button
        onClick={handleDismiss}
        aria-label="Fechar aviso de instalação"
        className="shrink-0 text-[#736a65] transition-colors hover:text-primary"
      >
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
