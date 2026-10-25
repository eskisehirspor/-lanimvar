import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import { useAuth } from '@/lib/auth/store';
import { queryClient } from '@/lib/query/queryClient';

import { db, rpc } from './client';
import { toAppError } from './errors';
import type { ExactAddress, Job, Offer, TaskerProfile } from './types';

export const taskerKeys = {
  me: ['tasker', 'me'] as const,
  offers: ['tasker', 'offers'] as const,
  jobs: ['tasker', 'jobs'] as const,
  address: (id: string) => ['tasker', 'address', id] as const,
};

export function useTaskerProfile() {
  const uid = useAuth((s) => s.session?.user.id);
  return useQuery({
    queryKey: taskerKeys.me,
    enabled: !!uid,
    queryFn: async () => {
      const { data, error } = await db().from('tasker_profiles').select('user_id, verification, is_online, rating_avg, rating_count, completed_count').eq('user_id', uid!).maybeSingle();
      if (error) throw toAppError(error);
      return data as TaskerProfile | null;
    },
  });
}

/** Live offers: a Realtime nudge on the Tasker's own dispatch rows, then the safe card RPC. */
export function useOffers(enabled: boolean) {
  const uid = useAuth((s) => s.session?.user.id);
  useEffect(() => {
    if (!enabled || !uid) return;
    const channel = db()
      .channel(`offers:${uid}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'task_dispatches', filter: `tasker_id=eq.${uid}` }, () => {
        queryClient.invalidateQueries({ queryKey: taskerKeys.offers });
      })
      .subscribe();
    return () => {
      db().removeChannel(channel);
    };
  }, [enabled, uid]);
  return useQuery({
    queryKey: taskerKeys.offers,
    enabled,
    refetchInterval: enabled ? 20_000 : false,
    queryFn: () => rpc<Offer[]>('tasker_offers'),
  });
}

/** Live nudges for one job: the Tasker cannot read task rows, but sees the task's events. */
export function useJobLive(taskId: string) {
  useEffect(() => {
    const channel = db()
      .channel(`job:${taskId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'task_events', filter: `task_id=eq.${taskId}` }, () => {
        queryClient.invalidateQueries({ queryKey: taskerKeys.jobs });
      })
      .subscribe();
    return () => {
      db().removeChannel(channel);
    };
  }, [taskId]);
}

export function useJobs() {
  return useQuery({ queryKey: taskerKeys.jobs, queryFn: () => rpc<Job[]>('tasker_jobs'), refetchInterval: 15_000 });
}

/** The exact address: fetched only for the active job, never cached to disk. */
export function useJobAddress(id: string, enabled: boolean) {
  return useQuery({
    queryKey: taskerKeys.address(id),
    enabled,
    gcTime: 0,
    staleTime: Infinity,
    queryFn: async () => (await rpc<ExactAddress[]>('get_task_address', { p_task: id }))[0] ?? null,
  });
}

const refreshJobs = () => {
  queryClient.invalidateQueries({ queryKey: taskerKeys.jobs });
  queryClient.invalidateQueries({ queryKey: taskerKeys.offers });
};

export async function setOnline(online: boolean, lat?: number, lng?: number) {
  await rpc('tasker_set_online', { p_online: online, p_lat: lat ?? null, p_lng: lng ?? null });
  queryClient.invalidateQueries({ queryKey: taskerKeys.me });
}
export const ping = (lat: number, lng: number) => rpc<void>('tasker_ping', { p_lat: lat, p_lng: lng });
export const declineOffer = (id: string) => rpc<void>('decline_offer', { p_task: id }).finally(refreshJobs);
export const acceptTask = (id: string) => rpc<void>('accept_task', { p_task: id }).finally(refreshJobs);
export const startRoute = (id: string) => rpc<void>('tasker_start_route', { p_task: id }).finally(refreshJobs);
export const markArrived = (id: string, lat: number | null, lng: number | null) => rpc<void>('tasker_arrived', { p_task: id, p_lat: lat, p_lng: lng }).finally(refreshJobs);
export const verifyPin = (id: string, pin: string) => rpc<boolean>('verify_pin', { p_task: id, p_pin: pin }).finally(refreshJobs);
export const submitProof = (id: string) => rpc<void>('submit_proof', { p_task: id }).finally(refreshJobs);
export const releaseTask = (id: string, reason: 'unsafe' | 'cannot_do' | 'customer_request' | 'other') => rpc<void>('release_task', { p_task: id, p_reason: reason }).finally(refreshJobs);
export const reportNoShow = (id: string) => rpc<void>('report_customer_no_show', { p_task: id }).finally(refreshJobs);
