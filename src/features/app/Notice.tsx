import { Alert, Platform } from 'react-native';

import { t } from '@/i18n';
import { errorText } from '@/lib/api/errors';

/** One place for confirmations and error messages (native alerts; window.confirm on web). */
export function confirm(title: string, body: string | undefined, okLabel: string, destructive = false): Promise<boolean> {
  if (Platform.OS === 'web') return Promise.resolve(window.confirm([title, body].filter(Boolean).join('\n\n')));
  return new Promise((resolve) =>
    Alert.alert(title, body, [
      { text: t('common.cancel'), style: 'cancel', onPress: () => resolve(false) },
      { text: okLabel, style: destructive ? 'destructive' : 'default', onPress: () => resolve(true) },
    ]),
  );
}

export function showError(e: unknown) {
  const msg = errorText(e);
  if (Platform.OS === 'web') window.alert(msg);
  else Alert.alert(msg);
}

export function notify(msg: string) {
  if (Platform.OS === 'web') window.alert(msg);
  else Alert.alert(msg);
}

/** Wraps an async action: errors become a readable message. */
export async function attempt<T>(fn: () => Promise<T>): Promise<T | undefined> {
  try {
    return await fn();
  } catch (e) {
    showError(e);
    return undefined;
  }
}
