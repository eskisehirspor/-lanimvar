import { Redirect } from 'expo-router';
import { Platform } from 'react-native';

import { CustomerHome } from '@/features/customer/Home';
import { TaskerHome } from '@/features/tasker/Home';
import { useAuth } from '@/lib/auth/store';

export default function Home() {
  const role = useAuth((s) => s.profile?.role);
  // Admins on the web land in the panel.
  if (role === 'admin' && Platform.OS === 'web') return <Redirect href="/admin" />;
  return role === 'tasker' ? <TaskerHome /> : <CustomerHome />;
}
