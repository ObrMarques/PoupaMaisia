import { useAuth } from "@/hooks/use-auth";

const TRIAL_DAYS = 7;

export interface SubscriptionStatus {
  hasAccess: boolean;
  isInTrial: boolean;
  isPremium: boolean;
  trialDaysLeft: number;
  trialDaysTotal: number;
  trialExpired: boolean;
}

export function useSubscription(): SubscriptionStatus {
  const { user } = useAuth();

  if (!user) {
    return {
      hasAccess: false,
      isInTrial: false,
      isPremium: false,
      trialDaysLeft: 0,
      trialDaysTotal: TRIAL_DAYS,
      trialExpired: false,
    };
  }

  const now = new Date();
  const createdAt = new Date(user.createdAt);
  const trialEnd = new Date(createdAt.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);
  const isInTrial = now < trialEnd;
  const trialExpired = !isInTrial;

  const msLeft = Math.max(0, trialEnd.getTime() - now.getTime());
  const trialDaysLeft = Math.ceil(msLeft / (24 * 60 * 60 * 1000));

  const isPremiumActive =
    user.isPremium === true &&
    (!user.premiumExpiresAt || now < new Date(user.premiumExpiresAt));

  const hasAccess = isInTrial || isPremiumActive;

  return {
    hasAccess,
    isInTrial,
    isPremium: isPremiumActive,
    trialDaysLeft,
    trialDaysTotal: TRIAL_DAYS,
    trialExpired,
  };
}
