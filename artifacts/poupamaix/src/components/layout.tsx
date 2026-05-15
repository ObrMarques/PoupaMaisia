import { Link, useLocation } from "wouter";
import { LayoutDashboard, Receipt, Target, CreditCard, PieChart, Sparkles, Settings, LogOut, Plus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Painel" },
  { href: "/transactions", icon: Receipt, label: "Transações" },
  { href: "/goals", icon: Target, label: "Metas" },
  { href: "/cards", icon: CreditCard, label: "Cartões" },
  { href: "/reports", icon: PieChart, label: "Relatórios" },
  { href: "/ai", icon: Sparkles, label: "PoupaAI" },
  { href: "/premium", icon: Sparkles, label: "Premium" },
  { href: "/settings", icon: Settings, label: "Configurações" },
];

const mobileNavItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Início" },
  { href: "/transactions", icon: Receipt, label: "Transações" },
  { href: "/goals", icon: Target, label: "Metas" },
  { href: "/ai", icon: Sparkles, label: "PoupaAI" },
  { href: "/settings", icon: Settings, label: "Config." },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { logout, user } = useAuth();

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Barra lateral (desktop) */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card">
        <div className="p-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl tracking-tighter">
            <div className="w-8 h-8 rounded bg-primary text-primary-foreground flex items-center justify-center font-bold">
              $
            </div>
            PoupaMais
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location === item.href || location.startsWith(`${item.href}/`);
            return (
              <Link key={item.href} href={item.href}>
                <div className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors cursor-pointer ${
                  isActive ? "bg-secondary text-foreground font-medium" : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                }`} data-testid={`nav-${item.href.replace('/', '')}`}>
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border mt-auto">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center overflow-hidden shrink-0">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span className="font-medium text-sm">{user?.name?.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground" onClick={logout} data-testid="button-logout">
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 flex flex-col relative overflow-hidden pb-16 md:pb-0">
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>

      {/* Barra de navegação (mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-border bg-card/90 backdrop-blur-md z-50 px-2 pb-safe pt-2 flex items-center justify-around">
        {mobileNavItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div className={`flex flex-col items-center p-2 cursor-pointer ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}>
                <item.icon className="w-5 h-5 mb-1" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
