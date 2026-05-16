import React, { createContext, useContext } from 'react';
import { useUser, useClerk } from '@clerk/react';
import { useGetMe, getGetMeQueryKey } from '@workspace/api-client-react';

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
  isLoaded: boolean;
  isSignedIn: boolean;
  updateUser: (user: AppUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded: clerkLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();

  const { data: dbUser, isLoading } = useGetMe({
    query: { queryKey: getGetMeQueryKey(), enabled: !!isSignedIn, retry: 1 },
  });

  const updateUser = (_user: AppUser) => {
    // no-op: user data comes from server via react-query invalidation
  };

  const logout = () => {
    signOut({ redirectUrl: '/' });
  };

  const isLoaded = clerkLoaded && (!isSignedIn || !isLoading);

  return (
    <AuthContext.Provider value={{
      user: (dbUser as AppUser | undefined) ?? null,
      isLoaded,
      isSignedIn: !!isSignedIn,
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
