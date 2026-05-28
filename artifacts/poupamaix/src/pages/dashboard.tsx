import { useGetDashboardSummary, useGetSpendingByCategory, useGetMonthlyTrend, useGetGoals, useGetPendingTransactions, getGetPendingTransactionsQueryKey, useGetWallets, getGetWalletsQueryKey } from "@workspace/api-client-react";
import { formatCurrency } from "@/lib/format";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/contexts/theme-context";
import { useI18n } from "@/contexts/i18n-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowDownRight, ArrowUpRight, Wallet, Sparkles, Plus, Bell, Clock, Target, Receipt } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { QuickAddTransaction } from "@/components/quick-add-transaction";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/* ── Primeiros Passos ──────────────────────────────────────────── */
interface OnboardingStep {
  key: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  label: string;
  desc: string;
  cta: React.ReactNode;
}

interface GettingStartedProps {
  hasWallet: boolean;
  hasGoal: boolean;
  hasTransaction: boolean;
  isLoading: boolean;
}

function GettingStarted({ hasWallet, hasGoal, hasTransaction, isLoading }: GettingStartedProps) {
  const total = 3;
  const done = [hasWallet, hasGoal, hasTransaction].filter(Boolean).length;

  if (isLoading) return null;
  if (done === total) return null;

  const allSteps: OnboardingStep[] = [
    {
      key: "wallet",
      icon: Wallet,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      label: "Criar primeira carteira",
      desc: "Organize seu dinheiro por conta ou banco",
      cta: (
        <Link href="/wallets">
          <Button size="sm" variant="outline" className="shrink-0 h-8 text-xs px-3">Criar</Button>
        </Link>
      ),
    },
    {
      key: "goal",
      icon: Target,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      label: "Criar primeira meta financeira",
      desc: "Defina um objetivo e acompanhe seu progresso",
      cta: (
        <Link href="/goals">
          <Button size="sm" variant="outline" className="shrink-0 h-8 text-xs px-3">Criar</Button>
        </Link>
      ),
    },
    {
      key: "transaction",
      icon: Receipt,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      label: "Adicionar primeira transação",
      desc: "Registre uma receita ou despesa",
      cta: (
        <QuickAddTransaction>
          <Button size="sm" variant="outline" className="shrink-0 h-8 text-xs px-3">Adicionar</Button>
        </QuickAddTransaction>
      ),
    },
  ];

  const doneMap: Record<string, boolean> = { wallet: hasWallet, goal: hasGoal, transaction: hasTransaction };
  const steps = allSteps.filter((s) => !doneMap[s.key]);

  return (
    <Card className="bg-card border-border overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <CardTitle className="text-base flex items-center gap-2">
              Primeiros Passos
              <span className="text-xs font-normal text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                {done}/{total}
              </span>
            </CardTitle>
            <CardDescription className="mt-0.5">Configure seu controle financeiro</CardDescription>
          </div>
        </div>
        <div className="mt-3 h-1 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-700"
            style={{ width: `${(done / total) * 100}%` }}
          />
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-2 pb-4">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.key}
              className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-border/40 hover:bg-secondary/50 transition-colors"
            >
              <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", step.bg)}>
                <Icon className={cn("w-4 h-4", step.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-tight">{step.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
              </div>
              {step.cta}
            </div>
          );
        })}
      </CardContent>
    </Card>
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

      {/* Primeiros Passos */}
      <GettingStarted
        hasWallet={hasWallet}
        hasGoal={hasGoal}
        hasTransaction={hasTransaction}
        isLoading={gettingStartedLoading}
      />

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
