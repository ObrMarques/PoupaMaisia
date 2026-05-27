import {
  Crown, Bot, Bell, Wallet, Target, Zap, Star,
  CheckCircle2,
} from "lucide-react";
import { useSubscription } from "@/hooks/use-subscription";
import { useI18n } from "@/contexts/i18n-context";

export default function Premium() {
  const { isPremium } = useSubscription();
  const { t } = useI18n();

  const BENEFITS = [
    {
      icon: Bot,
      title: t("premium.aiTitle"),
      description: t("premium.aiDesc"),
      highlight: true,
    },
    {
      icon: Bell,
      title: t("premium.alertsTitle"),
      description: t("premium.alertsDesc"),
      highlight: false,
    },
    {
      icon: Wallet,
      title: t("premium.walletsTitle"),
      description: t("premium.walletsDesc"),
      highlight: false,
    },
    {
      icon: Target,
      title: t("premium.goalsTitle"),
      description: t("premium.goalsDesc"),
      highlight: false,
    },
    {
      icon: Zap,
      title: t("premium.featuresTitle"),
      description: t("premium.featuresDesc"),
      highlight: false,
    },
  ];

  return (
    <div className="min-h-full bg-background">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-foreground/5 via-transparent to-transparent pointer-events-none" />
        <div className="relative px-4 pt-10 pb-8 md:pt-16 md:pb-12 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-foreground shadow-2xl mx-auto mb-6">
            <Crown className="w-10 h-10 text-background" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            {t("premium.title")}
          </h1>

          {isPremium && (
            <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full bg-foreground text-background text-sm font-medium">
              <CheckCircle2 className="w-4 h-4" />
              {t("premium.alreadyPremium")}
            </div>
          )}
        </div>
      </div>

      <div className="px-4 pb-12 max-w-2xl mx-auto space-y-6">

        {/* Benefits */}
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground px-1">
            {t("premium.whatsIncluded")}
          </p>
          {BENEFITS.map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.title}
                className={`flex items-start gap-4 p-4 rounded-2xl border transition-all ${
                  b.highlight
                    ? "border-foreground/20 bg-card shadow-sm"
                    : "border-border bg-card hover:border-foreground/10"
                }`}
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                  b.highlight ? "bg-foreground" : "bg-secondary"
                }`}>
                  <Icon className={`w-5 h-5 ${b.highlight ? "text-background" : "text-muted-foreground"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <p className="font-semibold text-sm">{b.title}</p>
                    {b.highlight && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-foreground text-background text-[10px] font-semibold">
                        <Star className="w-2.5 h-2.5 fill-background" />
                        {t("premium.highlight")}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{b.description}</p>
                </div>
                <CheckCircle2 className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              </div>
            );
          })}
        </div>

        {/* Stripe Pricing Table */}
        {isPremium ? (
          <div className="rounded-2xl border border-border bg-card p-6 text-center space-y-4">
            <p className="text-sm text-muted-foreground">{t("premium.thanksPremium")}</p>
            <a
              href="https://billing.stripe.com/p/login/6oUbJ12gi04T2Ix4L6gMw00"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-background hover:bg-secondary text-sm font-medium transition-colors"
            >
              {t("premium.manageSubscription")}
            </a>
          </div>
        ) : (
          <stripe-pricing-table
            pricing-table-id="prctbl_1TaE0BDNf06AuejqggZPBZqP"
            publishable-key="pk_live_51TX3j4DNf06Auejq8chhktEKco5aIHX08uTnNKqwo1g6vfrGILEfqNbIO9vBYeqtrnIuHisc9LRTgJGLWiYGJyXb00ZrZJppmM"
          />
        )}

      </div>
    </div>
  );
}
