import { router, type Href } from 'expo-router';

import { getVerification } from '@/lib/auth/providers';

import { stepsFor, useDraft, type StepKey } from './draft';

const hrefs: Record<StepKey, Href> = {
  role: '/onboarding',
  name: '/onboarding/name',
  birth: '/onboarding/birth',
  phone: '/onboarding/phone',
  email: '/onboarding/email',
  address: '/onboarding/address',
  tasker: '/onboarding/tasker',
  consent: '/onboarding/consent',
};

/** Position in the flow and how to move on (verified contacts are skipped). */
export function useFlow(key: StepKey) {
  const role = useDraft((s) => s.role);
  const steps = stepsFor(role);
  const index = steps.indexOf(key);
  return {
    step: index + 1,
    total: steps.length,
    back: index > 0 ? () => router.back() : undefined,
    next: async () => {
      let i = index + 1;
      // A slow or failing check must never block the flow: then we simply don't skip.
      const v = await Promise.race([getVerification().catch(() => null), new Promise<null>((r) => setTimeout(() => r(null), 3000))]);
      while (i < steps.length && ((steps[i] === 'phone' && v?.phoneVerified) || (steps[i] === 'email' && v?.emailVerified))) i++;
      const target = steps[Math.min(i, steps.length - 1)]!;
      router.push(hrefs[target]);
    },
  };
}
