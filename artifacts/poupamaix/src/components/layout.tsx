import { Link, useLocation } from "wouter";
import { LayoutDashboard, Receipt, Target, CreditCard, PieChart, Sparkles, Settings, LogOut, HelpCircle } from "lucide-react";
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
];

const bottomNavItems = [
  { href: "/support", icon: HelpCircle, label: "Suporte" },
  { href: "/settings", icon: Settings, label: "Configurações" },
];

const mobileNavItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Início" },
  { href: "/transactions", icon: Receipt, label: "Transações" },
  { href: "/goals", icon: Target, label: "Metas" },
  { href: "/ai", icon: Sparkles, label: "PoupaAI" },
  { href: "/settings", icon: Settings, label: "Config." },
];

function NavLink({ item, location }: { item: typeof navItems[0]; location: string }) {
  const isActive = location === item.href || location.startsWith(`${item.href}/`);
  return (
    <Link href={item.href}>
      <div className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors cursor-pointer text-sm ${
        isActive ? "bg-secondary text-foreground font-medium" : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
      }`} data-testid={`nav-${item.href.replace("/", "")}`}>
        <item.icon className="w-4 h-4 shrink-0" />
        {item.label}
      </div>
    </Link>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { logout, user } = useAuth();

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Barra lateral (desktop) */}
      <aside className="hidden md:flex flex-col w-60 border-r border-border bg-card shrink-0">
        <div className="p-5 pb-4">
          <Link href="/dashboard" className="flex items-center gap-2.5 font-bold text-lg tracking-tight">
            <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
              P
            </div>
            PoupaMais
          </Link>
        </div>

        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {navItems.map(item => <NavLink key={item.href} item={item} location={location} />)}
        </nav>

        <div className="px-3 pb-2 space-y-0.5 border-t border-border pt-3">
          {bottomNavItems.map(item => <NavLink key={item.href} item={item} location={location} />)}
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
          <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground hover:text-foreground text-xs h-8" onClick={logout} data-testid="button-logout">
            <LogOut className="w-3.5 h-3.5 mr-2" />
            Sair da conta
          </Button>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 flex flex-col relative overflow-hidden pb-16 md:pb-0 min-w-0">
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>

      {/* Barra de navegação (mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-border bg-card/95 backdrop-blur-md z-50 pt-2 pb-safe flex items-center justify-around px-1">
        {mobileNavItems.map((item) => {
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
