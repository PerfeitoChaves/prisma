import { useState, useEffect } from "react";
import { Download, Share, PlusSquare, X, Check } from "lucide-react";
import { PrismaLogo } from "./PrismaComponents";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Verifica se já está rodando como app standalone (PWA instalado)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Detecta iOS (Safari não dispara beforeinstallprompt, precisa de instrução manual)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    if (isIosDevice) {
      setIsInstallable(true);
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const triggerInstall = async (onShowIOSModal: () => void) => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setIsInstalled(true);
        setIsInstallable(false);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      onShowIOSModal();
    }
  };

  return { isInstallable, isInstalled, isIOS, triggerInstall };
}

export function PWAInstallBanner({
  onInstallClick,
  onDismiss,
}: {
  onInstallClick: () => void;
  onDismiss: () => void;
}) {
  return (
    <aside aria-label="Instalar aplicativo" className="mx-auto max-w-4xl px-3 pt-3 sm:px-4">
      <div className="flex items-center justify-between gap-3 rounded-lg border border-press/30 bg-paper2 p-3 shadow-md">
        <div className="flex items-center gap-3">
          <PrismaLogo size={32} />
          <div>
            <h2 className="text-[13px] font-bold text-ink leading-tight">
              Instalar o PRISMA no seu celular
            </h2>
            <p className="text-[11.5px] text-ink2">
              Acesse direto pela tela inicial como aplicativo, sem abrir o navegador.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onInstallClick}
            className="inline-flex items-center gap-1.5 rounded-md bg-ink px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-paper2 shadow transition-all hover:bg-press active:scale-95"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Instalar</span>
          </button>
          <button
            onClick={onDismiss}
            className="rounded p-1 text-ink3 hover:text-ink"
            aria-label="Dispensar aviso"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

export function IOSInstallModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-ink/50 p-3 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-rule bg-paper2 p-5 shadow-2xl animate-pop-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-rule pb-3">
          <div className="flex items-center gap-2.5">
            <PrismaLogo size={28} />
            <span className="font-display text-[16px] font-bold text-ink">
              Como Instalar no iPhone / iPad
            </span>
          </div>
          <button onClick={onClose} className="rounded p-1 text-ink3 hover:text-ink">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-3.5 text-[13px] text-ink2">
          <div className="flex items-start gap-3 rounded-lg bg-paper p-3 border border-rule">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink text-paper2 text-[11px] font-bold">
              1
            </span>
            <div>
              <p className="font-medium text-ink">Toque no botão Compartilhar</p>
              <p className="text-[12px] text-ink3 mt-0.5">
                Localizado na barra inferior do Safari (o ícone de quadrado com seta para cima <Share className="inline h-3.5 w-3.5 text-ink align-sub" />).
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg bg-paper p-3 border border-rule">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink text-paper2 text-[11px] font-bold">
              2
            </span>
            <div>
              <p className="font-medium text-ink">Selecione "Adicionar à Tela de Início"</p>
              <p className="text-[12px] text-ink3 mt-0.5">
                Role o menu para baixo e toque em <PlusSquare className="inline h-3.5 w-3.5 text-ink align-sub" /> <strong>Adicionar à Tela de Início</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg bg-paper p-3 border border-rule">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-signal text-paper2 text-[11px] font-bold">
              3
            </span>
            <div>
              <p className="font-medium text-ink">Confirme tocando em "Adicionar"</p>
              <p className="text-[12px] text-ink3 mt-0.5">
                O ícone do <strong>PRISMA</strong> aparecerá na tela do seu aparelho como um app nativo, sem barra de URL.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <button
            onClick={onClose}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-ink py-2.5 text-[12px] font-bold uppercase tracking-wider text-paper2 hover:bg-press transition-colors"
          >
            <Check className="h-4 w-4" /> Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
