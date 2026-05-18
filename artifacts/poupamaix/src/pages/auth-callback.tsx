import { useEffect } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code   = params.get("code");
    const next   = params.get("next") ?? "/dashboard";

    if (code) {
      // PKCE flow: exchange the authorization code for a session
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) {
          setLocation("/sign-in");
        } else {
          setLocation(next.startsWith("/") ? next : "/dashboard");
        }
      });
      return;
    }

    // Implicit / password-recovery flow: wait for auth state event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setLocation("/reset-password");
      } else if (session) {
        setLocation("/dashboard");
      } else {
        setLocation("/sign-in");
      }
    });

    // Fallback: session may already exist (e.g. hash token already parsed)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setLocation("/dashboard");
    });

    return () => subscription.unsubscribe();
  }, [setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
