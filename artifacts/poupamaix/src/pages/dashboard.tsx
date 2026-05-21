import { useGetDashboardSummary, useGetSpendingByCategory, useGetMonthlyTrend, useGetGoals, useGetPendingTransactions, usePayTransaction, getGetPendingTransactionsQueryKey, getGetTransactionsQueryKey, getGetDashboardSummaryQueryKey, getGetWalletsQueryKey } from "@workspace/api-client-react";
import { formatCurrency } from "@/lib/format";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/contexts/theme-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowDownRight, ArrowUpRight, Wallet, Sparkles, TrendingUp, Plus, Bell, Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { QuickAddTransaction } from "@/components/quick-add-transaction";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

const MONTH_NAMES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr + "T00:00:00");
  return Math.round((d.getTime() - today.getTime()) / 86400000);
}

export default function Dashboard() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const queryClient = useQueryClient();
  const tooltipStyle = isDark
    ? { backgroundColor: "#1A1A1A", borderColor: "#2A2A2A", color: "#fff" }
    : { backgroundColor: "#FFFFFF", borderColor: "#E0E0E0", color: "#111" };
  const { data: summary } = useGetDashboardSummary();
  const { data: spending, isLoading: loadingSpending } = useGetSpendingByCategory();
  const { data: trend, isLoading: loadingTrend } = useGetMonthlyTrend();
  const { data: goals, isLoading: loadingGoals } = useGetGoals();
  const { data: pending, isLoading: loadingPending } = useGetPendingTransactions();
  const payMutation = usePayTransaction();

  const invalidateAfterPay = () => {
    queryClient.invalidateQueries({ queryKey: getGetPendingTransactionsQueryKey(), refetchType: 'all' });
    queryClient.invalidateQueries({ queryKey: getGetTransactionsQueryKey(),         refetchType: 'all' });
    queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey(),     refetchType: 'all' });
    queryClient.invalidateQueries({ queryKey: getGetWalletsQueryKey(),              refetchType: 'all' });
  };

  const handleMarkPaid = (id: number) => {
    payMutation.mutate({ id }, { onSettled: () => { invalidateAfterPay(); } });
  };

  const currency = user?.currency || 'BRL';

  const trendData = trend?.map(t => ({
    ...t,
    name: MONTH_NAMES[(t.month - 1) % 12],
  }));

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Controle financeiro</h1>
          <p className="text-muted-foreground">Olá, {user?.name ?? "Usuário"}</p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <QuickAddTransaction>
            <Button variant="outline" className="flex-1 md:flex-none bg-background">
              <Plus className="w-4 h-4 mr-2" />
              Nova Transação
            </Button>
          </QuickAddTransaction>
          <Link href="/ai" className="flex-1 md:flex-none">
            <Button className="w-full bg-primary text-primary-foreground">
              <Sparkles className="w-4 h-4 mr-2" />
              Perguntar ao PoupaAI
            </Button>
          </Link>
          <Link href="/premium" className="hidden md:flex">
            <Button variant="outline" size="icon" className="bg-background shrink-0" aria-label="Alertas inteligentes">
              <Bell className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Contas a Pagar ──────────────────────── */}
      {(loadingPending || (pending && pending.count > 0)) && (
        <div className="rounded-2xl border border-[#F4C542]/40 bg-[#FFF8E1] dark:bg-[#F4C542]/5 dark:border-[#F4C542]/20 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#F4C542]/30">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#F4C542]/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-[#8B6914] dark:text-[#F4C542]" />
              </div>
              <div>
                <p className="font-semibold text-[#3D2800] dark:text-[#F4C542] text-sm">Contas a Pagar</p>
                {!loadingPending && pending && (
                  <p className="text-xs text-[#8B6914] dark:text-[#D4A017]">
                    {pending.count} {pending.count === 1 ? "conta pendente" : "contas pendentes"} · Total: {formatCurrency(pending.total, currency)}
                  </p>
                )}
              </div>
            </div>
            <Link href="/transactions?status=pending">
              <Button variant="ghost" size="sm" className="text-[#8B6914] dark:text-[#F4C542] hover:bg-[#F4C542]/20 text-xs">
                Ver todas
              </Button>
            </Link>
          </div>

          {loadingPending ? (
            <div className="px-5 py-3 space-y-2">
              {Array(2).fill(0).map((_, i) => <Skeleton key={i} className="h-12 w-full bg-[#F4C542]/10" />)}
            </div>
          ) : (
            <div className="divide-y divide-[#F4C542]/20">
              {pending?.items.slice(0, 4).map(tx => {
                const days = daysUntil(tx.date);
                const isOverdue = days < 0;
                const isUrgent  = !isOverdue && days <= 3;
                return (
                  <div key={tx.id} className="flex items-center justify-between px-5 py-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={cn(
                        "w-2 h-2 rounded-full shrink-0",
                        isOverdue ? "bg-red-500" : isUrgent ? "bg-orange-400" : "bg-[#F4C542]"
                      )} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#3D2800] dark:text-[#F4C542] truncate">
                          {tx.description || tx.categoryName}
                        </p>
                        <p className={cn(
                          "text-xs",
                          isOverdue ? "text-red-600 dark:text-red-400 font-medium"
                            : isUrgent ? "text-orange-600 dark:text-orange-400 font-medium"
                              : "text-[#8B6914] dark:text-[#D4A017]"
                        )}>
                          {isOverdue
                            ? `Venceu há ${Math.abs(days)} ${Math.abs(days) === 1 ? "dia" : "dias"}`
                            : days === 0
                              ? "Vence hoje"
                              : `Vence em ${new Date(tx.date + "T00:00:00").toLocaleDateString("pt-BR")}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-3 shrink-0">
                      <span className="font-semibold text-sm text-[#8B6914] dark:text-[#F4C542] tabular-nums">
                        -{formatCurrency(tx.amount, currency)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-[#8B6914] dark:text-[#F4C542] hover:bg-[#F4C542]/20"
                        title="Marcar como pago"
                        onClick={() => handleMarkPaid(tx.id)}
                        disabled={payMutation.isPending}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
              {pending && pending.count > 4 && (
                <div className="px-5 py-3 flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#8B6914] dark:text-[#F4C542] shrink-0" />
                  <p className="text-xs text-[#8B6914] dark:text-[#D4A017]">
                    + {pending.count - 4} outras contas pendentes
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Cartões de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Saldo Total</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-balance">{formatCurrency(summary?.totalBalance || 0, currency)}</div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Receitas do Mês</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-[#00C851]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#00C851]">{formatCurrency(summary?.monthlyIncome || 0, currency)}</div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Despesas do Mês</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-[#FF4444]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#FF4444]">{formatCurrency(summary?.monthlyExpenses || 0, currency)}</div>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Economia</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(summary?.savingsRate || 0).toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Área dos Gráficos */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Fluxo de Caixa</CardTitle>
              <CardDescription>Receitas x Despesas ao longo do tempo</CardDescription>
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
                      <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={tooltipStyle} />
                      <Bar dataKey="income" name="Receitas" fill="#00C851" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="expenses" name="Despesas" fill="#FF4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Área Lateral */}
        <div className="space-y-8">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Gastos por Categoria</CardTitle>
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
                          <Cell key={`cell-${index}`} fill={entry.categoryColor || '#8884d8'} />
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
              <CardTitle>Progresso das Metas</CardTitle>
              <Link href="/goals">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">Ver todas</Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {loadingGoals ? (
                  Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
                ) : goals?.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Nenhuma meta ativa.</p>
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
                            style={{ width: `${progress}%`, backgroundColor: g.color || 'var(--primary)' }}
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
