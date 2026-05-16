import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, Receipt, Target, CreditCard, PieChart,
  Sparkles, Settings, LogOut, HelpCircle, ArrowLeft, Menu, X
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

function NavLink({
  href, icon: Icon, label, location, onClick,
}: {
  href: string; icon: any; label: string; location: string; onClick?: () => void;
}) {
  const isActive = location === href || (href !== "/" && location.startsWith(`${href}/`));
  return (
    <Link href={href} onClick={onClick}>
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

function MobileDrawer({
  open,
  onClose,
  location,
}: {
  open: boolean;
  onClose: () => void;
  location: string;
}) {
  const { logout, user } = useAuth();
  const { t } = useI18n();
  const navItems    = useNavItems();
  const bottomItems = useBottomItems();

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 bg-card border-r border-border flex flex-col shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <Link href="/dashboard" onClick={onClose} className="flex items-center gap-2.5 font-bold text-lg tracking-tight">
            <div className="w-8 h-8 rounded bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
              $
            </div>
            PoupaMais
          </Link>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {navItems.map(item => (
            <NavLink
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              location={location}
              onClick={onClose}
            />
          ))}
        </nav>

        {/* Bottom items */}
        <div className="px-3 pb-2 space-y-0.5 border-t border-border pt-3">
          {bottomItems.map(item => (
            <NavLink
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              location={location}
              onClick={onClose}
            />
          ))}
        </div>

        {/* User + logout */}
        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-2.5 mb-3 px-1">
            <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center overflow-hidden shrink-0">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user?.name} className="w-full h-full object-cover" />
              ) : (
                <span className="font-medium text-sm">{user?.name?.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="overflow-hidden flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground hover:text-foreground text-xs h-8"
            onClick={() => { onClose(); logout(); }}
            data-testid="button-logout-mobile"
          >
            <LogOut className="w-3.5 h-3.5 mr-2" />
            {t("auth.logout")}
          </Button>
        </div>
      </div>
    </>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { logout, user } = useAuth();
  const { t } = useI18n();
  const navItems    = useNavItems();
  const bottomItems = useBottomItems();

  const [drawerOpen, setDrawerOpen] = useState(false);

  const isHome    = HOME_ROUTES.has(location);
  const pageTitle = PAGE_TITLES[location] ?? "PoupaMais";

  const handleBack = () => {
    if (window.history.length > 1) window.history.back();
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">

      {/* Sidebar — desktop only */}
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

      {/* Mobile drawer */}
      <div className="md:hidden">
        <MobileDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          location={location}
        />
      </div>

      {/* Main content */}
      <main className="flex-1 flex flex-col relative overflow-hidden min-w-0">

        {/* Mobile top bar */}
        <div className="md:hidden sticky top-0 z-30 flex items-center gap-2 px-3 py-3 bg-background/95 backdrop-blur-sm border-b border-border shrink-0">
          <button
            onClick={() => setDrawerOpen(true)}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors shrink-0"
            aria-label="Abrir menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <span className="font-semibold text-sm flex-1 truncate">
            {isHome ? "PoupaMais" : pageTitle}
          </span>

          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center overflow-hidden shrink-0">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user?.name} className="w-full h-full object-cover" />
            ) : (
              <span className="font-medium text-xs">{user?.name?.charAt(0).toUpperCase()}</span>
            )}
          </div>
        </div>

        {/* Desktop back button */}
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

        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
