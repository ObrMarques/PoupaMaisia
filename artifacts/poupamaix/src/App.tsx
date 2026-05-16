import { lazy, Suspense, useEffect, useRef } from "react";
import { Switch, Route, Router as WouterRouter, useLocation, Redirect } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { ClerkProvider, SignIn, SignUp, useClerk, useUser } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { shadcn } from "@clerk/themes";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "./hooks/use-auth";
import { AppLayout } from "@/components/layout";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeProvider } from "@/contexts/theme-context";
import { I18nProvider } from "@/contexts/i18n-context";
import { useSubscription } from "@/hooks/use-subscription";
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
const Premium      = lazy(() => import("@/pages/premium"));
const Settings     = lazy(() => import("@/pages/settings"));
const Support      = lazy(() => import("@/pages/support"));
const Paywall      = lazy(() => import("@/pages/paywall"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:            0,
      gcTime:               1000 * 60 * 5,
      retry:                1,
      refetchInterval:      15 * 1000,
      refetchOnWindowFocus: true,
      refetchOnReconnect:   true,
    },
  },
});

// REQUIRED — copy verbatim
const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

// REQUIRED — copy verbatim. Empty in dev, auto-set in prod.
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

const basePath = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY");
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
    socialButtonsPlacement: "top" as const,
    socialButtonsVariant: "blockButton" as const,
  },
  variables: {
    colorPrimary: "#111111",
    colorForeground: "#111111",
    colorMutedForeground: "#737373",
    colorDanger: "#ef4444",
    colorBackground: "#ffffff",
    colorInput: "#f2f2f2",
    colorInputForeground: "#111111",
    colorNeutral: "#e0e0e0",
    fontFamily: "Inter, sans-serif",
    borderRadius: "0.5rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-white rounded-2xl w-[440px] max-w-full overflow-hidden shadow-lg",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-[#111111] font-bold",
    headerSubtitle: "text-[#737373]",
    socialButtonsBlockButtonText: "text-[#111111] font-medium",
    formFieldLabel: "text-[#111111] font-medium",
    footerActionLink: "text-[#111111] font-semibold hover:underline",
    footerActionText: "text-[#737373]",
    dividerText: "text-[#737373]",
    identityPreviewEditButton: "text-[#111111]",
    formFieldSuccessText: "text-green-600",
    alertText: "text-[#111111]",
    logoBox: "flex justify-center",
    logoImage: "w-10 h-10",
    socialButtonsBlockButton: "border border-[#e0e0e0] bg-white hover:bg-[#f5f5f5]",
    formButtonPrimary: "bg-[#111111] hover:bg-[#333333] text-white",
    formFieldInput: "bg-[#f2f2f2] border-[#e0e0e0] text-[#111111]",
    footerAction: "bg-transparent",
    dividerLine: "bg-[#e0e0e0]",
    alert: "bg-[#fef2f2]",
    otpCodeFieldInput: "border-[#e0e0e0] bg-[#f2f2f2]",
    formFieldRow: "",
    main: "",
  },
};

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

const OPEN_ROUTES = new Set(["/settings", "/support", "/paywall"]);

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
  const { hasAccess }            = useSubscription();
  const [location, setLocation]  = useLocation();

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) { setLocation("/sign-in"); return; }
    if (!hasAccess && !OPEN_ROUTES.has(location)) {
      setLocation("/paywall");
    }
  }, [isSignedIn, isLoaded, hasAccess, location, setLocation]);

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

function PaywallRoute() {
  const { isSignedIn, isLoaded } = useAuth();
  const { hasAccess }            = useSubscription();
  const [, setLocation]          = useLocation();

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) { setLocation("/sign-in"); return; }
    if (hasAccess)  { setLocation("/dashboard"); }
  }, [isSignedIn, isLoaded, hasAccess, setLocation]);

  if (!isLoaded || !isSignedIn || hasAccess) return null;

  return (
    <Suspense fallback={<SpinnerLoader />}>
      <Paywall />
    </Suspense>
  );
}

function HomeRedirect() {
  const { isSignedIn, isLoaded } = useAuth();
  if (!isLoaded) return <SpinnerLoader />;
  return isSignedIn ? <Redirect to="/dashboard" /> : <Redirect to="/sign-in" />;
}

function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <SignIn
        routing="path"
        path={`${basePath}/sign-in`}
        signUpUrl={`${basePath}/sign-up`}
        forceRedirectUrl={`${basePath}/dashboard`}
      />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <SignUp
        routing="path"
        path={`${basePath}/sign-up`}
        signInUrl={`${basePath}/sign-in`}
        forceRedirectUrl={`${basePath}/dashboard`}
      />
    </div>
  );
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
        qc.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, qc]);

  return null;
}

/**
 * All children here have access to: Clerk, QueryClient, Theme, I18n, Auth
 */
function AppShell() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <AuthProvider>
          <div className="min-h-[100dvh] bg-background text-foreground">
            <DashboardPrefetcher />
            <Switch>
              <Route path="/"             component={HomeRedirect} />
              <Route path="/sign-in/*?"   component={SignInPage} />
              <Route path="/sign-up/*?"   component={SignUpPage} />
              {/* legacy routes redirect to sign pages */}
              <Route path="/login"        component={() => { const [,s] = useLocation(); useEffect(() => s("/sign-in"), []); return null; }} />
              <Route path="/register"     component={() => { const [,s] = useLocation(); useEffect(() => s("/sign-up"), []); return null; }} />
              <Route path="/paywall"      component={() => <PaywallRoute />} />
              <Route path="/dashboard"    component={() => <ProtectedRoute component={Dashboard} />} />
              <Route path="/transactions" component={() => <ProtectedRoute component={Transactions} />} />
              <Route path="/goals"        component={() => <ProtectedRoute component={Goals} />} />
              <Route path="/wallets"      component={() => <ProtectedRoute component={Wallets} />} />
              <Route path="/reports"      component={() => <ProtectedRoute component={Reports} />} />
              <Route path="/ai"           component={() => <ProtectedRoute component={AI} />} />
              <Route path="/premium"      component={() => <ProtectedRoute component={Premium} />} />
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

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        formFieldLabel__emailAddress: "Endereço de e-mail",
        signIn: {
          start: {
            title: "Bem-vindo de volta",
            subtitle: "Entre com sua conta para continuar",
            actionText: "Não tem uma conta?",
            actionLink: "Cadastre-se",
          },
        },
        signUp: {
          start: {
            title: "Criar sua conta",
            subtitle: "Comece sua jornada com o PoupaMais",
            actionText: "Já tem uma conta?",
            actionLink: "Entrar",
          },
        },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <TooltipProvider>
          <AppShell />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;
