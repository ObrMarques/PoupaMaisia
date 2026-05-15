import { useGetDashboardSummary, useGetSpendingByCategory, useGetMonthlyTrend, useGetGoals } from "@workspace/api-client-react";
import { formatCurrency } from "@/lib/format";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/contexts/theme-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowDownRight, ArrowUpRight, Wallet, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

const MONTH_NAMES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

export default function Dashboard() {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const tooltipStyle = isDark
    ? { backgroundColor: "#1A1A1A", borderColor: "#2A2A2A", color: "#fff" }
    : { backgroundColor: "#FFFFFF", borderColor: "#E0E0E0", color: "#111" };
  const { data: summary, isLoading: loadingSummary } = useGetDashboardSummary();
  const { data: spending, isLoading: loadingSpending } = useGetSpendingByCategory();
  const { data: trend, isLoading: loadingTrend } = useGetMonthlyTrend();
  const { data: goals, isLoading: loadingGoals } = useGetGoals();

  const currency = user?.currency || 'BRL';

  const trendData = trend?.map(t => ({
    ...t,
    name: MONTH_NAMES[(t.month - 1) % 12],
  }));

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Visão Geral</h1>
          <p className="text-muted-foreground">Olá, {user?.name}</p>
        </div>
        <Link href="/ai">
          <Button className="bg-primary text-primary-foreground">
            <Sparkles className="w-4 h-4 mr-2" />
            Perguntar ao PoupaAI
          </Button>
        </Link>
      </div>

      {/* Cartões de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Saldo Total</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingSummary ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-2xl font-bold" data-testid="text-total-balance">{formatCurrency(summary?.totalBalance || 0, currency)}</div>
            )}
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Receitas do Mês</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-[#00C851]" />
          </CardHeader>
          <CardContent>
            {loadingSummary ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-2xl font-bold text-[#00C851]">{formatCurrency(summary?.monthlyIncome || 0, currency)}</div>
            )}
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Despesas do Mês</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-[#FF4444]" />
          </CardHeader>
          <CardContent>
            {loadingSummary ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-2xl font-bold text-[#FF4444]">{formatCurrency(summary?.monthlyExpenses || 0, currency)}</div>
            )}
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Economia</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingSummary ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-2xl font-bold">{(summary?.savingsRate || 0).toFixed(1)}%</div>
            )}
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
              <div className="h-[300px]">
                {loadingTrend ? (
                  <Skeleton className="h-full w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trendData}>
                      <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${currency === 'BRL' ? 'R$' : '$'}${value}`} />
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
              <div className="h-[200px]">
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
