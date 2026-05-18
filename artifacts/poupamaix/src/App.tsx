import { lazy, Suspense, useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation, Redirect } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "./hooks/use-auth";
import { AppLayout } from "@/components/layout";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeProvider } from "@/contexts/theme-context";
import { I18nProvider } from "@/contexts/i18n-context";
import {
  getDashboardSummary, getSpendingByCategory, getMonthlyTrend,
  getGetDashboardSummaryQueryKey, getGetSpendingByCategoryQueryKey, getGetMonthlyTrendQueryKey,
} from "@workspace/api-client-react";

const Dashboard    = lazy(() => import("@/pages/dashboard"));
const Transactions = lazy(() => import("@/pages/transactions"));
const Goals        = lazy(() => import("@/pages/goals"));
const Wallets      = lazy(() => import("@/pages/wallets"));
const Reports      = lazy(() => import("@/pages/reports"));
const AI           = lazy(() => import("@/pages/ai"));
const SignUpPage   = lazy(() => import("@/pages/sign-up"));
const SignInPage   = lazy(() => import("@/pages/sign-in"));
const Settings     = lazy(() => import("@/pages/settings"));
const Support      = lazy(() => import("@/pages/support"));
const AuthCallback = lazy(() => import("@/pages/auth-callback"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:            1000 * 60 * 5,
      gcTime:               1000 * 60 * 10,
      retry:                1,
      refetchInterval:      false,
      refetchOnWindowFocus: false,
      refetchOnReconnect:   true,
    },
  },
});

const basePath = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

function PageSkeleton() {
  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <Skeleton className="h-10 w-48" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="lg:col-span-2 h-72 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
    </div>
  );
}

function SpinnerLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function DashboardPrefetcher() {
  const { isSignedIn } = useAuth();
  const qc = useQueryClient();

  useEffect(() => {
    if (!isSignedIn) return;
    qc.prefetchQuery({ queryKey: getGetDashboardSummaryQueryKey(),   queryFn: () => getDashboardSummary() });
    qc.prefetchQuery({ queryKey: getGetSpendingByCategoryQueryKey(), queryFn: () => getSpendingByCategory() });
    qc.prefetchQuery({ queryKey: getGetMonthlyTrendQueryKey(),       queryFn: () => getMonthlyTrend() });
  }, [isSignedIn, qc]);

  return null;
}

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isSignedIn, isLoaded } = useAuth();
  const [, setLocation]          = useLocation();

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) { setLocation("/sign-in"); return; }
  }, [isSignedIn, isLoaded, setLocation]);

  if (!isLoaded) return <SpinnerLoader />;
  if (!isSignedIn) return null;

  return (
    <AppLayout>
      <Suspense fallback={<PageSkeleton />}>
        <Component />
      </Suspense>
    </AppLayout>
  );
}

function HomeRedirect() {
  const { isSignedIn, isLoaded } = useAuth();
  if (!isLoaded) return <SpinnerLoader />;
  return isSignedIn ? <Redirect to="/dashboard" /> : <Redirect to="/sign-in" />;
}

function AppShell() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <AuthProvider>
          <div className="min-h-[100dvh] bg-background text-foreground" translate="no">
            <DashboardPrefetcher />
            <Switch>
              <Route path="/"             component={HomeRedirect} />
              <Route path="/sign-in"      component={() => <Suspense fallback={<SpinnerLoader />}><SignInPage /></Suspense>} />
              <Route path="/sign-up"      component={() => <Suspense fallback={<SpinnerLoader />}><SignUpPage /></Suspense>} />
              <Route path="/auth/callback" component={() => <Suspense fallback={<SpinnerLoader />}><AuthCallback /></Suspense>} />
              {/* legacy redirects */}
              <Route path="/login"        component={() => { const [,s] = useLocation(); useEffect(() => s("/sign-in"), []); return null; }} />
              <Route path="/register"     component={() => { const [,s] = useLocation(); useEffect(() => s("/sign-up"), []); return null; }} />
              <Route path="/paywall"      component={() => { const [,s] = useLocation(); useEffect(() => s("/dashboard"), []); return null; }} />
              <Route path="/sso-callback" component={() => { const [,s] = useLocation(); useEffect(() => s("/auth/callback"), []); return null; }} />
              <Route path="/dashboard"    component={() => <ProtectedRoute component={Dashboard} />} />
              <Route path="/transactions" component={() => <ProtectedRoute component={Transactions} />} />
              <Route path="/goals"        component={() => <ProtectedRoute component={Goals} />} />
              <Route path="/wallets"      component={() => <ProtectedRoute component={Wallets} />} />
              <Route path="/reports"      component={() => <ProtectedRoute component={Reports} />} />
              <Route path="/ai"           component={() => <ProtectedRoute component={AI} />} />
              <Route path="/premium"      component={() => { const [,s] = useLocation(); useEffect(() => s("/dashboard"), []); return null; }} />
              <Route path="/settings"     component={() => <ProtectedRoute component={Settings} />} />
              <Route path="/support"      component={() => <ProtectedRoute component={Support} />} />
              <Route                      component={HomeRedirect} />
            </Switch>
          </div>
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AppShell />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </WouterRouter>
  );
}

export default App;
