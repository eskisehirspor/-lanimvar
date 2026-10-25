import { useQuery } from '@tanstack/react-query';

import type { TaskStatus } from '@/features/task/model/status';
import { queryClient } from '@/lib/query/queryClient';

import { db, rpc } from './client';
import { toAppError } from './errors';
import type { AdminMetrics, AdminPerson, AppRole, AuditRow, Dispute, DisputeStatus, ExactAddress, PricingRule, Task, TaskEvent, Verification } from './types';

const k = {
  metrics: ['admin', 'metrics'] as const,
  tasks: (status: string) => ['admin', 'tasks', status] as const,
  task: (id: string) => ['admin', 'task', id] as const,
  people: (q: string, role: string) => ['admin', 'people', q, role] as const,
  disputes: (status: string) => ['admin', 'disputes', status] as const,
  pricing: ['admin', 'pricing'] as const,
  audit: ['admin', 'audit'] as const,
};

const refresh = () => queryClient.invalidateQueries({ queryKey: ['admin'] });

export const useMetrics = (days = 7) => useQuery({ queryKey: [...k.metrics, days], queryFn: async () => (await rpc<AdminMetrics[]>('admin_metrics', { p_days: days }))[0] ?? null, refetchInterval: 30_000 });

export function useAdminTasks(status: TaskStatus | 'all') {
  return useQuery({
    queryKey: k.tasks(status),
    refetchInterval: 20_000,
    queryFn: async () => {
      // The panel lists tasks without the exact address column.
      let q = db().from('tasks').select('id, customer_id, category, title, price, status, approx_label, created_at, first_accepted_at, completed_at').order('created_at', { ascending: false }).limit(200);
      if (status !== 'all') q = q.eq('status', status);
      const { data, error } = await q;
      if (error) throw toAppError(error);
      return data as Pick<Task, 'id' | 'customer_id' | 'category' | 'title' | 'price' | 'status' | 'approx_label' | 'created_at' | 'first_accepted_at' | 'completed_at'>[];
    },
  });
}

export function useAdminTask(id: string) {
  return useQuery({
    queryKey: k.task(id),
    queryFn: async () => {
      const client = db();
      const [task, events, assignments, disputes, media] = await Promise.all([
        client.from('tasks').select('id, customer_id, category, title, description, price, status, approx_label, approx_lat, approx_lng, created_at, first_accepted_at, arrived_at, started_at, completed_at, cancelled_at, cancel_reason').eq('id', id).single(),
        client.from('task_events').select('*').eq('task_id', id).order('id'),
        client.from('task_assignments').select('id, tasker_id, status, accepted_at, released_at, release_reason').eq('task_id', id).order('accepted_at'),
        client.from('disputes').select('*').eq('task_id', id).order('created_at'),
        client.from('task_media').select('*').eq('task_id', id).order('created_at'),
      ]);
      if (task.error) throw toAppError(task.error);
      const paths = (media.data ?? []).map((m) => m.storage_path as string);
      const signed = paths.length ? (await client.storage.from('task-media').createSignedUrls(paths, 600)).data : [];
      return {
        task: task.data as Task & { cancel_reason: string | null },
        events: (events.data ?? []) as TaskEvent[],
        assignments: (assignments.data ?? []) as { id: string; tasker_id: string; status: string; accepted_at: string; released_at: string | null; release_reason: string | null }[],
        disputes: (disputes.data ?? []) as Dispute[],
        media: (media.data ?? []).map((m, i) => ({ id: m.id as string, kind: m.kind as string, url: signed?.[i]?.signedUrl ?? null })),
      };
    },
  });
}

export const usePeople = (query: string, role: AppRole | 'all') =>
  useQuery({ queryKey: k.people(query, role), queryFn: () => rpc<AdminPerson[]>('admin_people', { p_query: query || null, p_role: role === 'all' ? null : role, p_limit: 200 }) });

export function useDisputes(status: DisputeStatus | 'active') {
  return useQuery({
    queryKey: k.disputes(status),
    refetchInterval: 20_000,
    queryFn: async () => {
      let q = db().from('disputes').select('*').order('created_at', { ascending: false }).limit(200);
      q = status === 'active' ? q.in('status', ['open', 'reviewing']) : q.eq('status', status);
      const { data, error } = await q;
      if (error) throw toAppError(error);
      return data as Dispute[];
    },
  });
}

export const useAdminPricing = () =>
  useQuery({
    queryKey: k.pricing,
    queryFn: async () => {
      const { data, error } = await db().from('pricing_rules').select('*').order('sort');
      if (error) throw toAppError(error);
      return data as PricingRule[];
    },
  });

export const useAudit = () =>
  useQuery({
    queryKey: k.audit,
    queryFn: async () => {
      const { data, error } = await db().from('audit_log').select('*').order('id', { ascending: false }).limit(200);
      if (error) throw toAppError(error);
      return data as AuditRow[];
    },
  });

export const setVerification = (user: string, status: Verification, note?: string) => rpc('admin_set_tasker_verification', { p_user: user, p_status: status, p_note: note ?? null }).finally(refresh);
export const setBanned = (user: string, banned: boolean, reason?: string) => rpc('admin_ban_user', { p_user: user, p_banned: banned, p_reason: reason ?? null }).finally(refresh);
export const setRole = (user: string, role: AppRole) => rpc('admin_set_role', { p_user: user, p_role: role }).finally(refresh);
export const updateDispute = (id: string, status: DisputeStatus, resolution?: string) => rpc('admin_update_dispute', { p_id: id, p_status: status, p_resolution: resolution ?? null }).finally(refresh);
export const settleTask = (id: string, outcome: 'completed' | 'cancelled', note: string) => rpc('admin_settle_task', { p_task: id, p_outcome: outcome, p_note: note }).finally(refresh);
export const savePricing = (r: Omit<PricingRule, 'id' | 'sort'>) =>
  rpc('admin_upsert_pricing_rule', {
    p_category: r.category,
    p_label: r.label,
    p_recommended: r.recommended_price,
    p_min: r.min_price,
    p_max: r.max_price,
    p_active: r.active,
    p_section: r.section,
    p_max_people: r.max_people,
  }).finally(refresh);
export const readAddress = async (id: string, reason: string) => (await rpc<ExactAddress[]>('admin_task_address', { p_task: id, p_reason: reason }))[0] ?? null;
