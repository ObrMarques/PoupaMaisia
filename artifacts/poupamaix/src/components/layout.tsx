import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, Receipt, Target, CreditCard, PieChart,
  Sparkles, Settings, LogOut, HelpCircle, ArrowLeft
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/contexts/i18n-context";
import { Button } from "@/components/ui/button";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard":    "Painel",
  "/":             "Painel",
  "/transactions": "Transações",
  "/goals":        "Metas",
  "/cards":        "Cartões",
  "/reports":      "Relatórios",
  "/ai":           "PoupaAI",
  "/premium":      "Premium",
  "/settings":     "Configurações",
  "/support":      "Suporte",
};

const HOME_ROUTES = new Set(["/", "/dashboard"]);

function useNavItems() {
  const { t } = useI18n();
  return [
    { href: "/dashboard",    icon: LayoutDashboard, label: t("nav.dashboard") },
    { href: "/transactions", icon: Receipt,          label: t("nav.transactions") },
    { href: "/goals",        icon: Target,           label: t("nav.goals") },
    { href: "/cards",        icon: CreditCard,       label: t("nav.cards") },
    { href: "/reports",      icon: PieChart,         label: t("nav.reports") },
    { href: "/ai",           icon: Sparkles,         label: t("nav.ai") },
    { href: "/premium",      icon: Sparkles,         label: t("nav.premium") },
  ];
}

function useBottomItems() {
  const { t } = useI18n();
  return [
    { href: "/support",  icon: HelpCircle, label: t("nav.support") },
    { href: "/settings", icon: Settings,   label: t("nav.settings") },
  ];
}

function useMobileItems() {
  const { t } = useI18n();
  return [
    { href: "/dashboard",    icon: LayoutDashboard, label: t("nav.dashboard") },
    { href: "/transactions", icon: Receipt,          label: t("nav.transactions") },
    { href: "/goals",        icon: Target,           label: t("nav.goals") },
    { href: "/ai",           icon: Sparkles,         label: "AI" },
    { href: "/settings",     icon: Settings,         label: t("nav.settings") },
  ];
}

function NavLink({ href, icon: Icon, label, location }: { href: string; icon: any; label: string; location: string }) {
  const isActive = location === href || location.startsWith(`${href}/`);
  return (
    <Link href={href}>
      <div
        className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors cursor-pointer text-sm ${
          isActive
            ? "bg-secondary text-foreground font-medium"
            : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
        }`}
        data-testid={`nav-${href.replace("/", "")}`}
      >
        <Icon className="w-4 h-4 shrink-0" />
        {label}
      </div>
    </Link>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { logout, user } = useAuth();
  const { t } = useI18n();
  const navItems    = useNavItems();
  const bottomItems = useBottomItems();
  const mobileItems = useMobileItems();

  const isHome    = HOME_ROUTES.has(location);
  const pageTitle = PAGE_TITLES[location] ?? "PoupaMais";

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar — desktop */}
      <aside className="hidden md:flex flex-col w-60 border-r border-border bg-card shrink-0">
        <div className="p-5 pb-4">
          <Link href="/dashboard" className="flex items-center gap-2.5 font-bold text-lg tracking-tight">
            <div className="w-8 h-8 rounded bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
              $
            </div>
            PoupaMais
          </Link>
        </div>

        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {navItems.map(item => (
            <NavLink key={item.href} href={item.href} icon={item.icon} label={item.label} location={location} />
          ))}
        </nav>

        <div className="px-3 pb-2 space-y-0.5 border-t border-border pt-3">
          {bottomItems.map(item => (
            <NavLink key={item.href} href={item.href} icon={item.icon} label={item.label} location={location} />
          ))}
        </div>

        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-2.5 mb-3 px-1">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center overflow-hidden shrink-0">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span className="font-medium text-xs">{user?.name?.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="overflow-hidden flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{user?.name}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground hover:text-foreground text-xs h-8"
            onClick={logout}
            data-testid="button-logout"
          >
            <LogOut className="w-3.5 h-3.5 mr-2" />
            {t("auth.logout")}
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col relative overflow-hidden min-w-0">
        {/* Top bar — mobile header with back button */}
        <div className="md:hidden sticky top-0 z-40 flex items-center gap-2 px-3 py-3 bg-background/95 backdrop-blur-sm border-b border-border shrink-0">
          {isHome ? (
            <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
              P
            </div>
          ) : (
            <button
              onClick={handleBack}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors"
              aria-label="Voltar"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <span className="font-semibold text-sm flex-1">{isHome ? "PoupaMais" : pageTitle}</span>
          {isHome && (
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center overflow-hidden shrink-0">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span className="font-medium text-xs">{user?.name?.charAt(0).toUpperCase()}</span>
              )}
            </div>
          )}
        </div>

        {/* Desktop back button — top-left corner on non-home pages */}
        {!isHome && (
          <div className="hidden md:block absolute top-4 left-4 z-30">
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors text-xs font-medium"
              aria-label="Voltar"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Voltar
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto pb-16 md:pb-0">
          {children}
        </div>
      </main>

      {/* Bottom nav — mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-border bg-card/95 backdrop-blur-md z-50 pt-2 pb-safe flex items-center justify-around px-1">
        {mobileItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}>
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
