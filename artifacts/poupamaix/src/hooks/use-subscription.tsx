import { useGetMe } from "@workspace/api-client-react";

export interface SubscriptionStatus {
  hasAccess: boolean;
  isInTrial: boolean;
  isPremium: boolean;
  trialDaysLeft: number;
  trialDaysTotal: number;
  trialExpired: boolean;
}

export function useSubscription(): SubscriptionStatus {
  const { data: me } = useGetMe();
  const isPremium = me?.isPremium ?? false;

  return {
    hasAccess: isPremium,
    isInTrial: false,
    isPremium,
    trialDaysLeft: 0,
    trialDaysTotal: 0,
    trialExpired: false,
  };
}
