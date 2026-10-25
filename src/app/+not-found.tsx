import { Redirect } from 'expo-router';

import { designLabEnabled } from '@/features/lab/enabled';
import { isWebPreview } from '@/lib/preview';

/**
 * Unknown paths (or a path the current auth state may not open) go home. The
 * single-file web preview opens the Design Lab prototype instead.
 */
export default function NotFound() {
  return <Redirect href={isWebPreview && designLabEnabled ? '/lab/prototype' : '/'} />;
}
