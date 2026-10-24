import { Redirect } from 'expo-router';

import { designLabEnabled } from '@/features/lab/enabled';

/**
 * Unknown paths go home. In Lab-enabled preview builds (e.g. a hosted web
 * preview whose URL path is not "/"), they open the Design Lab instead.
 */
export default function NotFound() {
  return <Redirect href={designLabEnabled ? '/lab' : '/'} />;
}
