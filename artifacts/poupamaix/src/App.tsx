import { lazy, Suspense } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "./hooks/use-auth";
import { useEffect } from "react";
import { AppLayout } from "@/components/layout";
import { Skeleton } from "@/components/ui/skeleton";

const Login = lazy(() => import("@/pages/login"));
const Register = lazy(() => import("@/pages/register"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const Transactions = lazy(() => import("@/pages/transactions"));
const Goals = lazy(() => import("@/pages/goals"));
const Cards = lazy(() => import("@/pages/cards"));
const Reports = lazy(() => import("@/pages/reports"));
const AI = lazy(() => import("@/pages/ai"));
const Premium = lazy(() => import("@/pages/premium"));
const Settings = lazy(() => import("@/pages/settings"));
const Support = lazy(() => import("@/pages/support"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      gcTime: 1000 * 60 * 10,
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
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

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { token } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!token) {
      setLocation("/login");
    }
  }, [token, setLocation]);

  if (!token) return null;

  return (
    <AppLayout>
      <Suspense fallback={<PageSkeleton />}>
        <Component />
      </Suspense>
    </AppLayout>
  );
}

function PublicRoute({ component: Component }: { component: React.ComponentType }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <Component />
    </Suspense>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={() => <PublicRoute component={Login} />} />
      <Route path="/register" component={() => <PublicRoute component={Register} />} />
      <Route path="/dashboard" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/transactions" component={() => <ProtectedRoute component={Transactions} />} />
      <Route path="/goals" component={() => <ProtectedRoute component={Goals} />} />
      <Route path="/cards" component={() => <ProtectedRoute component={Cards} />} />
      <Route path="/reports" component={() => <ProtectedRoute component={Reports} />} />
      <Route path="/ai" component={() => <ProtectedRoute component={AI} />} />
      <Route path="/premium" component={() => <ProtectedRoute component={Premium} />} />
      <Route path="/settings" component={() => <ProtectedRoute component={Settings} />} />
      <Route path="/support" component={() => <ProtectedRoute component={Support} />} />
      <Route path="/" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route component={() => <ProtectedRoute component={Dashboard} />} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL?.replace(/\/$/, "") || ""}>
          <AuthProvider>
            <div className="dark">
              <div className="min-h-[100dvh] bg-background text-foreground">
                <Router />
              </div>
            </div>
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
