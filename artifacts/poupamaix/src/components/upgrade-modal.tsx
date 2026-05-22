import { Crown, X, ChevronRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

const STRIPE_CHECKOUT_URL = "https://buy.stripe.com/6oUbJ12gi04T2Ix4L6gMw00";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  feature?: string;
}

export function UpgradeModal({ open, onClose, feature }: UpgradeModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div
        className="relative z-10 w-full sm:max-w-sm bg-[#0A0A0A] dark:bg-[#0A0A0A] border border-white/15 rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/10 transition-colors"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-lg">
            <Crown className="w-7 h-7 text-black" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-lg font-bold text-white">Recurso Exclusivo Premium</h2>
            {feature && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-xs text-white/70">
                <Lock className="w-3 h-3" />
                {feature}
              </div>
            )}
          </div>

          <p className="text-sm text-white/60 leading-relaxed">
            Assine o <span className="text-white font-semibold">PoupaMais Premium</span> por apenas{" "}
            <span className="text-white font-semibold">R$ 9,90/mês</span> e desbloqueie carteiras
            ilimitadas, metas ilimitadas, PoupaAI e alertas inteligentes.
          </p>

          <div className="w-full space-y-2 pt-1">
            <a href={STRIPE_CHECKOUT_URL} target="_blank" rel="noopener noreferrer" className="block w-full" onClick={onClose}>
              <Button className="w-full h-11 bg-white text-black hover:bg-white/90 font-semibold text-sm">
                Assinar agora — R$ 9,90/mês
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </a>
            <Button
              variant="ghost"
              onClick={onClose}
              className="w-full h-9 text-white/50 hover:text-white/80 hover:bg-white/10 text-sm"
            >
              Agora não
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
