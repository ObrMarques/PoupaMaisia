import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "./hooks/use-auth";
import { useEffect } from "react";
import { AppLayout } from "@/components/layout";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import Transactions from "@/pages/transactions";
import Goals from "@/pages/goals";
import Cards from "@/pages/cards";
import Reports from "@/pages/reports";
import AI from "@/pages/ai";
import Premium from "@/pages/premium";
import Settings from "@/pages/settings";

const queryClient = new QueryClient();

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
      <Component />
    </AppLayout>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/dashboard" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/transactions" component={() => <ProtectedRoute component={Transactions} />} />
      <Route path="/goals" component={() => <ProtectedRoute component={Goals} />} />
      <Route path="/cards" component={() => <ProtectedRoute component={Cards} />} />
      <Route path="/reports" component={() => <ProtectedRoute component={Reports} />} />
      <Route path="/ai" component={() => <ProtectedRoute component={AI} />} />
      <Route path="/premium" component={() => <ProtectedRoute component={Premium} />} />
      <Route path="/settings" component={() => <ProtectedRoute component={Settings} />} />
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
