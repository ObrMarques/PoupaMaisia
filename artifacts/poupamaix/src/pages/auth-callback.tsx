import { useEffect } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setLocation("/reset-password");
      } else if (session) {
        setLocation("/dashboard");
      } else {
        setLocation("/sign-in");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setLocation("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
