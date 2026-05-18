import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { useGetMe, getGetMeQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';

export interface AppUser {
  id: number;
  name: string;
  email: string;
  avatarUrl?: string | null;
  currency: string;
  language: string;
  isPremium: boolean;
  premiumExpiresAt?: string | null;
  onboardingCompleted: boolean;
  createdAt: string;
}

interface AuthContextType {
  user: AppUser | null;
  supabaseUser: SupabaseUser | null;
  session: Session | null;
  isLoaded: boolean;
  isSignedIn: boolean;
  updateUser: (user: AppUser) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const qc = useQueryClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setSessionLoaded(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const prevSession = session;
      setSession(prevSession);
      if (!prevSession) {
        qc.clear();
      }
    });

    return () => subscription.unsubscribe();
  }, [qc]);

  const isSignedIn = !!session;

  const { data: dbUser, isLoading } = useGetMe({
    query: {
      queryKey: getGetMeQueryKey(),
      enabled: isSignedIn && sessionLoaded,
      retry: 1,
    },
  });

  const updateUser = (_user: AppUser) => {
    // no-op: user data comes from server via react-query invalidation
  };

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/sign-in';
  };

  const isLoaded = sessionLoaded && (!isSignedIn || !isLoading);

  return (
    <AuthContext.Provider value={{
      user: (dbUser as AppUser | undefined) ?? null,
      supabaseUser: session?.user ?? null,
      session,
      isLoaded,
      isSignedIn,
      updateUser,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
