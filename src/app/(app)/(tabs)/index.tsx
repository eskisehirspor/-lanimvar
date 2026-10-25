import { CustomerHome } from '@/features/customer/Home';
import { TaskerHome } from '@/features/tasker/Home';
import { useAuth } from '@/lib/auth/store';

export default function Home() {
  const role = useAuth((s) => s.profile?.role);
  return role === 'tasker' ? <TaskerHome /> : <CustomerHome />;
}
