import { useState } from "react";
import { useGetSpendingByCategory, useGetMonthlyTrend } from "@workspace/api-client-react";
import { formatCurrency } from "@/lib/format";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/contexts/i18n-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, AreaChart, Area } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

export default function Reports() {
  const { user } = useAuth();
  const { t, locale } = useI18n();
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const { data: spending, isLoading: loadingSpending } = useGetSpendingByCategory({ month, year });
  const { data: trend, isLoading: loadingTrend } = useGetMonthlyTrend();

  function getMonthName(m: number, format: "long" | "short" = "long") {
    return new Date(2024, m - 1, 1).toLocaleString(locale, { month: format });
  }

  const MONTHS = Array.from({ length: 12 }, (_, i) => getMonthName(i + 1, "long"));

  const trendData = trend?.map(item => ({
    ...item,
    name: getMonthName(item.month, "short"),
  }));

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("reports.title")}</h1>
          <p className="text-muted-foreground">{t("reports.subtitle")}</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Select value={month.toString()} onValueChange={(v) => setMonth(parseInt(v))}>
            <SelectTrigger className="flex-1 md:w-[140px] bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((m, i) => (
                <SelectItem key={i + 1} value={(i + 1).toString()}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={year.toString()} onValueChange={(v) => setYear(parseInt(v))}>
            <SelectTrigger className="w-[90px] md:w-[100px] bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[2023, 2024, 2025, 2026].map(y => (
                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card">
          <CardHeader>
            <CardTitle>{t("reports.spendingByCategory")}</CardTitle>
            <CardDescription>{t("reports.spendingDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] overflow-hidden">
              {loadingSpending ? (
                <Skeleton className="h-full w-full rounded-full" />
              ) : spending?.length === 0 ? (
                <div className="h-full flex items-center justify-center text-muted-foreground">{t("reports.noData")}</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={spending}
                      dataKey="amount"
                      nameKey="categoryName"
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={2}
                    >
                      {spending?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.categoryColor || "#8884d8"} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{backgroundColor: "#1A1A1A", borderColor: "#2A2A2A", borderRadius: "8px"}}
                      formatter={(value: number) => formatCurrency(value, user?.currency)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="mt-6 space-y-3">
              {spending?.map((s) => (
                <div key={s.categoryId} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${s.categoryColor}20`, color: s.categoryColor }}>
                      {s.categoryIcon || "•"}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{s.categoryName}</p>
                      <p className="text-xs text-muted-foreground">{s.percentage.toFixed(1)}% ({s.transactionCount} {t("reports.transactionCount")})</p>
                    </div>
                  </div>
                  <div className="font-medium">
                    {formatCurrency(s.amount, user?.currency)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle>{t("reports.cashFlow")}</CardTitle>
              <CardDescription>{t("reports.cashFlowDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] overflow-hidden">
                {loadingTrend ? (
                  <Skeleton className="h-full w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00C851" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#00C851" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FF4444" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#FF4444" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v/1000}k`} />
                      <RechartsTooltip contentStyle={{backgroundColor: "#1A1A1A", borderColor: "#2A2A2A", borderRadius: "8px"}} />
                      <Area type="monotone" dataKey="income" name={t("reports.income")} stroke="#00C851" fillOpacity={1} fill="url(#colorIncome)" />
                      <Area type="monotone" dataKey="expenses" name={t("reports.expenses")} stroke="#FF4444" fillOpacity={1} fill="url(#colorExpense)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardHeader>
              <CardTitle>{t("reports.netSavings")}</CardTitle>
              <CardDescription>{t("reports.netSavingsDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] overflow-hidden">
                {loadingTrend ? (
                  <Skeleton className="h-full w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v/1000}k`} />
                      <RechartsTooltip contentStyle={{backgroundColor: "#1A1A1A", borderColor: "#2A2A2A", borderRadius: "8px"}} cursor={{fill: "rgba(255,255,255,0.05)"}} />
                      <Bar dataKey="savings" name={t("reports.savings")} radius={[4, 4, 0, 0]}>
                        {trendData?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.savings >= 0 ? "#FFFFFF" : "#FF4444"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
