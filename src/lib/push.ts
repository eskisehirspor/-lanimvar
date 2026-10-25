import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { Platform } from 'react-native';

import { rpc } from '@/lib/api/client';

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }),
});

/**
 * Registers this device for pushes and stores the Expo token on the profile.
 * Silently skips where pushes cannot work (web, simulators, no EAS project yet).
 */
export async function registerPush() {
  if (Platform.OS === 'web' || !Device.isDevice) return;
  const projectId = Constants.expoConfig?.extra?.eas?.projectId as string | undefined;
  if (!projectId) return;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('tasks', { name: 'Görevler', importance: AndroidImportance.HIGH });
  }
  let { granted } = await Notifications.getPermissionsAsync();
  if (!granted) granted = (await Notifications.requestPermissionsAsync()).granted;
  if (!granted) return;
  const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
  await rpc('update_profile', { p_full_name: null, p_push_token: data });
}
