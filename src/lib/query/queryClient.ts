import { focusManager, QueryClient } from '@tanstack/react-query';
import { AppState, Platform } from 'react-native';

export const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 2, staleTime: 30_000 }, mutations: { retry: 0 } },
});

/** Refetch when the app returns to the foreground. */
export function bindQueryFocus(): () => void {
  if (Platform.OS === 'web') return () => undefined;
  const sub = AppState.addEventListener('change', (s) => focusManager.setFocused(s === 'active'));
  return () => sub.remove();
}
