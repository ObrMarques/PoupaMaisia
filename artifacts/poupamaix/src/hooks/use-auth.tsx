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
  const [session, setSession]           = useState<Session | null>(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const qc = useQueryClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setSessionLoaded(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        qc.clear();
      }
    });

    return () => subscription.unsubscribe();
  }, [qc]);

  const isSignedIn = !!session;

  const { data: dbUser, isLoading, error: meError } = useGetMe({
    query: {
      queryKey: getGetMeQueryKey(),
      enabled: isSignedIn && sessionLoaded,
      // Never retry a 401 — the token is invalid; signing out is the right move
      retry: (failureCount, error: any) => {
        if (error?.status === 401) return false;
        return failureCount < 1;
      },
    },
  });

  // When /api/auth/me returns 401 while we think we're signed in,
  // the session is stale/expired — sign out and redirect to sign-in.
  useEffect(() => {
    if (!meError) return;
    const status = (meError as any)?.status;
    if (status === 401) {
      supabase.auth.signOut().then(() => {
        window.location.replace('/sign-in');
      });
    }
  }, [meError]);

  const updateUser = (updatedUser: AppUser) => {
    qc.setQueryData(getGetMeQueryKey(), updatedUser);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/sign-in';
  };

  const isLoaded = sessionLoaded && (!isSignedIn || (!isLoading && (!!dbUser || !!meError)));

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
