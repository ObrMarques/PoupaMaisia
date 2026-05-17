import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Switch, Route, Router as WouterRouter, useLocation, Redirect } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { ClerkProvider, SignIn, SignUp, useClerk } from "@clerk/react";
import { useSignIn, useSignUp } from "@clerk/react/legacy";
import { ptBR } from "@clerk/localizations";
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
    badge: "!hidden",
    cardBoxFooter: "!hidden",
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

function useHideClerkDevBanner() {
  useEffect(() => {
    const CLERK_DEV_STRINGS = ["development mode", "modo de desenvolvimento", "modo desenvolvimento"];
    const remove = () => {
      document.querySelectorAll<HTMLElement>("[class*='cl-']").forEach((el) => {
        const text = el.textContent?.toLowerCase().trim() ?? "";
        if (CLERK_DEV_STRINGS.some((s) => text === s || text.startsWith(s))) {
          let target: HTMLElement = el;
          while (
            target.parentElement &&
            target.parentElement !== document.body &&
            target.parentElement.children.length === 1
          ) {
            target = target.parentElement as HTMLElement;
          }
          target.style.setProperty("display", "none", "important");
        }
      });
    };
    remove();
    const observer = new MutationObserver(remove);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);
}

const googleIcon = (
  <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.909-2.259c-.806.54-1.837.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

function GoogleRedirectButton({ mode }: { mode: "signIn" | "signUp" }) {
  const { signIn, isLoaded: signInLoaded } = useSignIn();
  const { signUp, isLoaded: signUpLoaded } = useSignUp();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const redirectUrl = `${window.location.origin}${basePath}/sign-in/sso-callback`;
      const redirectUrlComplete = `${window.location.origin}${basePath}/dashboard`;
      if (mode === "signIn" && signIn) {
        await (signIn as any).create({
          strategy: "oauth_google",
          redirectUrl,
          actionCompleteRedirectUrl: redirectUrlComplete,
        });
      } else if (mode === "signUp" && signUp) {
        await (signUp as any).create({
          strategy: "oauth_google",
          redirectUrl,
          actionCompleteRedirectUrl: redirectUrlComplete,
        });
      }
    } catch {
      setLoading(false);
    }
  };

  const isLoaded = mode === "signIn" ? signInLoaded : signUpLoaded;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!isLoaded || loading}
      className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg border border-[#e0e0e0] bg-white hover:bg-[#f5f5f5] transition-colors text-sm font-medium text-[#111111] disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
      ) : googleIcon}
      Continuar com Google
    </button>
  );
}

const authAppearanceNoSocial = {
  ...clerkAppearance,
  elements: {
    ...clerkAppearance.elements,
    socialButtonsRoot: "!hidden",
    dividerRow: "!hidden",
    header: "!hidden",
    logoBox: "!hidden",
    headerTitle: "!hidden",
    headerSubtitle: "!hidden",
    cardBox: "!shadow-none !rounded-none w-full max-w-full overflow-hidden !bg-transparent",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
  },
};

function SignInPage() {
  useHideClerkDevBanner();
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <div className="bg-white rounded-2xl w-[440px] max-w-full overflow-hidden shadow-lg">
        <div className="px-8 pt-8 pb-2 space-y-1 text-center">
          <img src={`${basePath}/logo.svg`} alt="PoupaMais" className="w-10 h-10 mx-auto mb-3" />
          <h1 className="text-xl font-bold text-[#111111]">Bem-vindo de volta</h1>
          <p className="text-sm text-[#737373]">Entre com sua conta para continuar</p>
        </div>
        <div className="px-8 pb-2 pt-4">
          <GoogleRedirectButton mode="signIn" />
        </div>
        <div className="px-8 pb-2 flex items-center gap-3">
          <div className="flex-1 h-px bg-[#e0e0e0]" />
          <span className="text-xs text-[#737373]">ou</span>
          <div className="flex-1 h-px bg-[#e0e0e0]" />
        </div>
        <SignIn
          routing="path"
          path={`${basePath}/sign-in`}
          signUpUrl={`${basePath}/sign-up`}
          forceRedirectUrl={`${basePath}/dashboard`}
          appearance={authAppearanceNoSocial}
        />
      </div>
    </div>
  );
}

function SignUpPage() {
  useHideClerkDevBanner();
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <div className="bg-white rounded-2xl w-[440px] max-w-full overflow-hidden shadow-lg">
        <div className="px-8 pt-8 pb-2 space-y-1 text-center">
          <img src={`${basePath}/logo.svg`} alt="PoupaMais" className="w-10 h-10 mx-auto mb-3" />
          <h1 className="text-xl font-bold text-[#111111]">Criar sua conta</h1>
          <p className="text-sm text-[#737373]">Comece sua jornada com o PoupaMais</p>
        </div>
        <div className="px-8 pb-2 pt-4">
          <GoogleRedirectButton mode="signUp" />
        </div>
        <div className="px-8 pb-2 flex items-center gap-3">
          <div className="flex-1 h-px bg-[#e0e0e0]" />
          <span className="text-xs text-[#737373]">ou</span>
          <div className="flex-1 h-px bg-[#e0e0e0]" />
        </div>
        <SignUp
          routing="path"
          path={`${basePath}/sign-up`}
          signInUrl={`${basePath}/sign-in`}
          forceRedirectUrl={`${basePath}/dashboard`}
          appearance={authAppearanceNoSocial}
        />
      </div>
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
        ...ptBR,
        signIn: {
          ...ptBR.signIn,
          start: {
            ...ptBR.signIn?.start,
            title: "Bem-vindo de volta",
            subtitle: "Entre com sua conta para continuar",
            actionText: "Não tem uma conta?",
            actionLink: "Cadastre-se",
          },
        },
        signUp: {
          ...ptBR.signUp,
          start: {
            ...ptBR.signUp?.start,
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
