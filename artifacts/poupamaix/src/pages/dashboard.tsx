import { useGetDashboardSummary, useGetSpendingByCategory, useGetMonthlyTrend, useGetGoals, useGetPendingTransactions, getGetPendingTransactionsQueryKey, useGetWallets, getGetWalletsQueryKey, useUpdateProfile, getGetMeQueryKey } from "@workspace/api-client-react";
import { formatCurrency } from "@/lib/format";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/contexts/theme-context";
import { useI18n } from "@/contexts/i18n-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowDownRight, ArrowUpRight, Wallet, Sparkles, Plus, Bell, Clock, Target, Receipt, X, CheckCircle2 } from "lucide-react";
import React, { useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { QuickAddTransaction } from "@/components/quick-add-transaction";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";

/* ── Primeiros Passos — Carrossel ──────────────────────────────── */
interface OnboardingCarouselProps {
  hasWallet: boolean;
  hasGoal: boolean;
  hasTransaction: boolean;
}

function OnboardingCarousel({ hasWallet, hasGoal, hasTransaction }: OnboardingCarouselProps) {
  const { user, updateUser } = useAuth();
  const qc = useQueryClient();
  const updateMutation = useUpdateProfile();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartScroll = useRef(0);

  const total = 3;
  const done = [hasWallet, hasGoal, hasTransaction].filter(Boolean).length;

  const handleDismiss = () => {
    updateMutation.mutate(
      { data: { onboardingDismissed: true } },
      {
        onSuccess: (updated) => {
          updateUser(updated as any);
          qc.invalidateQueries({ queryKey: getGetMeQueryKey() });
        },
      }
    );
  };

  const onScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    setActiveIdx(Math.max(0, Math.min(total - 1, idx)));
  }, [total]);

  const goTo = (idx: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ left: idx * el.clientWidth, behavior: "smooth" });
  };

  /* mouse drag for desktop */
  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    dragStartX.current = e.pageX;
    dragStartScroll.current = scrollRef.current?.scrollLeft ?? 0;
    if (scrollRef.current) scrollRef.current.style.cursor = "grabbing";
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();
    scrollRef.current.scrollLeft = dragStartScroll.current - (e.pageX - dragStartX.current);
  };
  const onMouseUp = () => {
    isDragging.current = false;
    if (scrollRef.current) scrollRef.current.style.cursor = "grab";
  };

  interface StepDef {
    key: string;
    icon: React.ElementType;
    gradient: string;
    iconColor: string;
    title: string;
    desc: string;
    done: boolean;
    cta: React.ReactNode;
  }

  const steps: StepDef[] = [
    {
      key: "wallet",
      icon: Wallet,
      gradient: "from-blue-500/20 to-blue-600/5",
      iconColor: "text-blue-500",
      title: "Criar primeira carteira",
      desc: "Organize seu dinheiro separando por conta corrente, poupança ou carteira de dinheiro.",
      done: hasWallet,
      cta: (
        <Link href="/wallets">
          <Button className="w-full mt-4" size="sm">Criar carteira</Button>
        </Link>
      ),
    },
    {
      key: "goal",
      icon: Target,
      gradient: "from-purple-500/20 to-purple-600/5",
      iconColor: "text-purple-500",
      title: "Criar primeira meta",
      desc: "Defina um objetivo financeiro — viagem, reserva de emergência ou qualquer sonho.",
      done: hasGoal,
      cta: (
        <Link href="/goals">
          <Button className="w-full mt-4" size="sm">Criar meta</Button>
        </Link>
      ),
    },
    {
      key: "transaction",
      icon: Receipt,
      gradient: "from-emerald-500/20 to-emerald-600/5",
      iconColor: "text-emerald-500",
      title: "Adicionar transação",
      desc: "Registre sua primeira receita ou despesa para começar a controlar seu dinheiro.",
      done: hasTransaction,
      cta: (
        <QuickAddTransaction>
          <Button className="w-full mt-4" size="sm">Nova transação</Button>
        </QuickAddTransaction>
      ),
    },
  ];

  return (
    <div className="relative">
      {/* Header row */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold">Primeiros Passos</h2>
          <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
            {done}/{total}
          </span>
        </div>
        <button
          onClick={handleDismiss}
          disabled={updateMutation.isPending}
          className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          aria-label="Fechar"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-secondary rounded-full overflow-hidden mb-4 mx-1">
        <div
          className="h-full bg-primary rounded-full transition-all duration-700"
          style={{ width: `${(done / total) * 100}%` }}
        />
      </div>

      {/* Carousel */}
      <div
        ref={scrollRef}
        onScroll={onScroll}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        className="flex overflow-x-scroll gap-3 pb-2 select-none"
        style={{
          scrollSnapType: "x mandatory",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          cursor: "grab",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <div
              key={step.key}
              style={{ scrollSnapAlign: "start", minWidth: "calc(85% - 6px)", flexShrink: 0 }}
              className={cn(
                "rounded-2xl border border-border/60 bg-card p-5 relative overflow-hidden transition-all duration-300",
                step.done && "opacity-70"
              )}
            >
              {/* Gradient background blob */}
              <div className={cn("absolute inset-0 bg-gradient-to-br opacity-60 pointer-events-none", step.gradient)} />

              {/* Done badge */}
              {step.done && (
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-[#00C851]/15 text-[#00C851] text-xs font-medium px-2 py-0.5 rounded-full border border-[#00C851]/20">
                  <CheckCircle2 className="w-3 h-3" />
                  Concluído
                </div>
              )}

              {/* Step number */}
              <div className="flex items-center gap-2 mb-3 relative">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                  step.done ? "bg-[#00C851]/15" : "bg-secondary"
                )}>
                  {step.done
                    ? <CheckCircle2 className="w-5 h-5 text-[#00C851]" />
                    : <Icon className={cn("w-5 h-5", step.iconColor)} />
                  }
                </div>
                <span className="text-xs font-medium text-muted-foreground">Passo {i + 1} de {total}</span>
              </div>

              {/* Content */}
              <div className="relative">
                <h3 className="text-base font-semibold leading-snug">{step.title}</h3>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{step.desc}</p>
                {!step.done && step.cta}
              </div>
            </div>
          );
        })}
      </div>

      {/* Dot indicators */}
      <div className="flex items-center justify-center gap-1.5 mt-3">
        {steps.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={cn(
              "rounded-full transition-all duration-300",
              i === activeIdx
                ? "w-5 h-1.5 bg-primary"
                : "w-1.5 h-1.5 bg-secondary hover:bg-muted-foreground/40"
            )}
            aria-label={`Ir para passo ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const { t, locale } = useI18n();

  const tooltipStyle = isDark
    ? { backgroundColor: "#1A1A1A", borderColor: "#2A2A2A", color: "#fff" }
    : { backgroundColor: "#FFFFFF", borderColor: "#E0E0E0", color: "#111" };

  const { data: summary } = useGetDashboardSummary();
  const { data: spending, isLoading: loadingSpending } = useGetSpendingByCategory();
  const { data: trend, isLoading: loadingTrend } = useGetMonthlyTrend();
  const { data: goals, isLoading: loadingGoals } = useGetGoals();
  const { data: pending, isLoading: loadingPending } = useGetPendingTransactions({
    query: { staleTime: 0, queryKey: getGetPendingTransactionsQueryKey() },
  });
  const { data: wallets, isLoading: loadingWallets } = useGetWallets({
    query: { staleTime: 0, queryKey: getGetWalletsQueryKey() },
  });
  const currency = user?.currency || "BRL";

  const totalWalletBalance = wallets?.reduce((sum, w) => sum + w.balance, 0) ?? 0;

  function getMonthShort(month: number) {
    return new Date(2024, month - 1, 1).toLocaleString(locale, { month: "short" });
  }

  const trendData = trend?.map(t => ({
    ...t,
    name: getMonthShort(t.month),
  }));

  // Primeiros Passos flags — derived from already-fetched data, no extra API call
  const hasWallet     = (wallets?.length ?? 0) > 0;
  const hasGoal       = (goals?.length ?? 0) > 0;
  const hasTransaction =
    (summary?.monthlyIncome ?? 0) > 0 ||
    (summary?.monthlyExpenses ?? 0) > 0 ||
    (spending?.length ?? 0) > 0;
  const gettingStartedLoading = loadingWallets || loadingGoals;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("dashboard.controlTitle")}</h1>
          <p className="text-muted-foreground">{t("dashboard.greeting")}, {user?.name ?? "Usuário"}</p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <QuickAddTransaction>
            <Button variant="outline" className="flex-1 md:flex-none bg-background">
              <Plus className="w-4 h-4 mr-2" />
              {t("dashboard.newTransaction")}
            </Button>
          </QuickAddTransaction>
          <Link href="/ai" className="flex-1 md:flex-none">
            <Button className="w-full bg-primary text-primary-foreground">
              <Sparkles className="w-4 h-4 mr-2" />
              {t("dashboard.askAI")}
            </Button>
          </Link>
          <Link href="/premium" className="hidden md:flex">
            <Button variant="outline" size="icon" className="bg-background shrink-0" aria-label={t("dashboard.billsToPay")}>
              <Bell className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Primeiros Passos — Carrossel (oculto quando dismissed ou todos concluídos) */}
      {!gettingStartedLoading && !user?.onboardingDismissed && !(hasWallet && hasGoal && hasTransaction) && (
        <OnboardingCarousel
          hasWallet={hasWallet}
          hasGoal={hasGoal}
          hasTransaction={hasTransaction}
        />
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("dashboard.balance")}</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-balance">{formatCurrency(summary?.totalBalance || 0, currency)}</div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("dashboard.monthlyIncome")}</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-[#00C851]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#00C851]">{formatCurrency(summary?.monthlyIncome || 0, currency)}</div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("dashboard.monthlyExpenses")}</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-[#FF4444]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#FF4444]">{formatCurrency(summary?.monthlyExpenses || 0, currency)}</div>
          </CardContent>
        </Card>
        <Link href="/transactions?status=pending" className="block">
          <Card className="bg-card h-full cursor-pointer hover:bg-secondary/30 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{t("dashboard.billsToPay")}</CardTitle>
              <Clock className="h-4 w-4 text-[#C49A00] dark:text-[#F4C542]" />
            </CardHeader>
            <CardContent>
              {loadingPending ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold text-[#C49A00] dark:text-[#F4C542]">
                    {formatCurrency(pending?.total || 0, currency)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {pending?.count
                      ? `${pending.count} ${pending.count === 1 ? t("dashboard.pendingBill") : t("dashboard.pendingBills")}`
                      : t("dashboard.noPending")}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Charts area */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>{t("dashboard.cashFlow")}</CardTitle>
              <CardDescription>{t("dashboard.cashFlowDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] overflow-hidden">
                {loadingTrend ? (
                  <Skeleton className="h-full w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trendData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                      <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} width={48} tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(0)}k` : `${value}`} />
                      <RechartsTooltip cursor={{fill: "transparent"}} contentStyle={tooltipStyle} />
                      <Bar dataKey="income" name={t("dashboard.income")} fill="#00C851" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="expenses" name={t("dashboard.expenses")} fill="#FF4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Wallets Card */}
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle>{t("dashboard.wallets")}</CardTitle>
              <Link href="/wallets">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">{t("dashboard.viewAll")}</Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingWallets ? (
                <div className="space-y-3">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : wallets?.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-2">{t("dashboard.noWallets")}</p>
              ) : (
                <>
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <span className="text-xs text-muted-foreground">{t("dashboard.walletsTotal")}</span>
                    <span className="text-lg font-bold">{formatCurrency(totalWalletBalance, currency)}</span>
                  </div>
                  <div className="space-y-2">
                    {wallets?.slice(0, 4).map((w) => (
                      <div key={w.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm shrink-0" style={{ backgroundColor: w.color + "26" }}>
                            <span>{w.icon}</span>
                          </div>
                          <span className="text-muted-foreground truncate max-w-[110px]">{w.name}</span>
                        </div>
                        <span className={`font-medium tabular-nums ${w.balance < 0 ? "text-[#FF4444]" : ""}`}>
                          {formatCurrency(w.balance, currency)}
                        </span>
                      </div>
                    ))}
                  </div>
                  {(wallets?.length ?? 0) > 4 && (
                    <Link href="/wallets">
                      <p className="text-xs text-muted-foreground text-center pt-1 hover:text-foreground transition-colors cursor-pointer">
                        +{(wallets?.length ?? 0) - 4} {t("dashboard.viewAll").toLowerCase()}
                      </p>
                    </Link>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>{t("dashboard.spendingByCategory")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] overflow-hidden">
                {loadingSpending ? (
                  <Skeleton className="h-full w-full rounded-full" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={spending}
                        dataKey="amount"
                        nameKey="categoryName"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                      >
                        {spending?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.categoryColor || "#8884d8"} />
                        ))}
                      </Pie>
                      <RechartsTooltip contentStyle={tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="mt-4 space-y-2">
                {spending?.slice(0, 4).map((s) => (
                  <div key={s.categoryId} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.categoryColor }} />
                      <span className="text-muted-foreground">{s.categoryName}</span>
                    </div>
                    <span className="font-medium">{formatCurrency(s.amount, currency)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t("dashboard.goalsProgress")}</CardTitle>
              <Link href="/goals">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">{t("dashboard.viewAll")}</Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {loadingGoals ? (
                  Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
                ) : goals?.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">{t("dashboard.noGoals")}</p>
                ) : (
                  goals?.slice(0, 3).map((g) => {
                    const progress = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
                    return (
                      <div key={g.id} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{g.name}</span>
                          <span className="text-muted-foreground">{progress}%</span>
                        </div>
                        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all duration-500"
                            style={{ width: `${progress}%`, backgroundColor: g.color || "var(--primary)" }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{formatCurrency(g.currentAmount, currency)}</span>
                          <span>{formatCurrency(g.targetAmount, currency)}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
