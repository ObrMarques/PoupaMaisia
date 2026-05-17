export interface SubscriptionStatus {
  hasAccess: boolean;
  isInTrial: boolean;
  isPremium: boolean;
  trialDaysLeft: number;
  trialDaysTotal: number;
  trialExpired: boolean;
}

export function useSubscription(): SubscriptionStatus {
  return {
    hasAccess: true,
    isInTrial: false,
    isPremium: true,
    trialDaysLeft: 0,
    trialDaysTotal: 0,
    trialExpired: false,
  };
}
