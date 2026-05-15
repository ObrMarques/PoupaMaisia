import { lazy, Suspense, useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "./hooks/use-auth";
import { AppLayout } from "@/components/layout";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeProvider } from "@/contexts/theme-context";
import { I18nProvider } from "@/contexts/i18n-context";
import { useSubscription } from "@/hooks/use-subscription";

const Login        = lazy(() => import("@/pages/login"));
const Register     = lazy(() => import("@/pages/register"));
const Dashboard    = lazy(() => import("@/pages/dashboard"));
const Transactions = lazy(() => import("@/pages/transactions"));
const Goals        = lazy(() => import("@/pages/goals"));
const Cards        = lazy(() => import("@/pages/cards"));
const Reports      = lazy(() => import("@/pages/reports"));
const AI           = lazy(() => import("@/pages/ai"));
const Premium      = lazy(() => import("@/pages/premium"));
const Settings     = lazy(() => import("@/pages/settings"));
const Support      = lazy(() => import("@/pages/support"));
const Paywall      = lazy(() => import("@/pages/paywall"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      gcTime:    1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect:   false,
    },
  },
});

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

/** Routes that remain accessible even after the trial expires, so users can
 *  manage their account and subscribe. */
const OPEN_ROUTES = new Set(["/settings", "/support", "/paywall"]);

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { token }            = useAuth();
  const { hasAccess }        = useSubscription();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!token) { setLocation("/login"); return; }
    if (!hasAccess && !OPEN_ROUTES.has(location)) {
      setLocation("/paywall");
    }
  }, [token, hasAccess, location, setLocation]);

  if (!token) return null;

  return (
    <AppLayout>
      <Suspense fallback={<PageSkeleton />}>
        <Component />
      </Suspense>
    </AppLayout>
  );
}

function PaywallRoute() {
  const { token }     = useAuth();
  const { hasAccess } = useSubscription();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!token)    { setLocation("/login");    return; }
    if (hasAccess) { setLocation("/dashboard"); }
  }, [token, hasAccess, setLocation]);

  if (!token || hasAccess) return null;

  return (
    <Suspense fallback={<SpinnerLoader />}>
      <Paywall />
    </Suspense>
  );
}

function PublicRoute({ component: Component }: { component: React.ComponentType }) {
  return (
    <Suspense fallback={<SpinnerLoader />}>
      <Component />
    </Suspense>
  );
}

function ThemedApp() {
  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <Switch>
        <Route path="/login"        component={() => <PublicRoute component={Login} />} />
        <Route path="/register"     component={() => <PublicRoute component={Register} />} />
        <Route path="/paywall"      component={() => <PaywallRoute />} />
        <Route path="/dashboard"    component={() => <ProtectedRoute component={Dashboard} />} />
        <Route path="/transactions" component={() => <ProtectedRoute component={Transactions} />} />
        <Route path="/goals"        component={() => <ProtectedRoute component={Goals} />} />
        <Route path="/cards"        component={() => <ProtectedRoute component={Cards} />} />
        <Route path="/reports"      component={() => <ProtectedRoute component={Reports} />} />
        <Route path="/ai"           component={() => <ProtectedRoute component={AI} />} />
        <Route path="/premium"      component={() => <ProtectedRoute component={Premium} />} />
        <Route path="/settings"     component={() => <ProtectedRoute component={Settings} />} />
        <Route path="/support"      component={() => <ProtectedRoute component={Support} />} />
        <Route path="/"             component={() => <ProtectedRoute component={Dashboard} />} />
        <Route                      component={() => <ProtectedRoute component={Dashboard} />} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <I18nProvider>
            <WouterRouter base={import.meta.env.BASE_URL?.replace(/\/$/, "") || ""}>
              <AuthProvider>
                <ThemedApp />
              </AuthProvider>
            </WouterRouter>
          </I18nProvider>
        </ThemeProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
