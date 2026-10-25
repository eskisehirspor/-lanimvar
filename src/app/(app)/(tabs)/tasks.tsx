import { CustomerTasks } from '@/features/customer/Tasks';
import { TaskerHistory } from '@/features/tasker/History';
import { useAuth } from '@/lib/auth/store';

export default function Tasks() {
  const role = useAuth((s) => s.profile?.role);
  return role === 'tasker' ? <TaskerHistory /> : <CustomerTasks />;
}
