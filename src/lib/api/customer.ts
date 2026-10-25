import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import { queryClient } from '@/lib/query/queryClient';

import { db, rpc } from './client';
import { toAppError } from './errors';
import type { PricingRule, Task, TaskEvent, TaskMedia, TaskTasker } from './types';

export const keys = {
  pricing: ['pricing'] as const,
  myTasks: ['tasks', 'mine'] as const,
  task: (id: string) => ['task', id] as const,
  tasker: (id: string) => ['task', id, 'tasker'] as const,
  events: (id: string) => ['task', id, 'events'] as const,
  media: (id: string) => ['task', id, 'media'] as const,
  pin: (id: string) => ['task', id, 'pin'] as const,
};

export function usePricing() {
  return useQuery({
    queryKey: keys.pricing,
    staleTime: 10 * 60_000,
    queryFn: async () => {
      const { data, error } = await db().from('pricing_rules').select('*').eq('active', true).order('sort');
      if (error) throw toAppError(error);
      return data as PricingRule[];
    },
  });
}

export function useMyTasks() {
  return useQuery({
    queryKey: keys.myTasks,
    queryFn: async () => {
      const { data, error } = await db().from('tasks').select('*').order('created_at', { ascending: false }).limit(50);
      if (error) throw toAppError(error);
      return data as Task[];
    },
  });
}

/** One task, kept live by Realtime (RLS limits the stream to the owner). */
export function useTask(id: string) {
  useEffect(() => {
    const channel = db()
      .channel(`task:${id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'tasks', filter: `id=eq.${id}` }, (p) => {
        queryClient.setQueryData(keys.task(id), p.new as Task);
        queryClient.invalidateQueries({ queryKey: keys.myTasks });
        queryClient.invalidateQueries({ queryKey: keys.tasker(id) });
      })
      .subscribe();
    return () => {
      db().removeChannel(channel);
    };
  }, [id]);
  return useQuery({
    queryKey: keys.task(id),
    // Realtime is the fast path; a slow poll covers dropped sockets.
    refetchInterval: 15_000,
    queryFn: async () => {
      const { data, error } = await db().from('tasks').select('*').eq('id', id).single();
      if (error) throw toAppError(error);
      return data as Task;
    },
  });
}

export function useTaskTasker(id: string, live: boolean) {
  return useQuery({
    queryKey: keys.tasker(id),
    enabled: live,
    refetchInterval: live ? 5_000 : false,
    queryFn: async () => (await rpc<TaskTasker[]>('task_tasker', { p_task: id }))[0] ?? null,
  });
}

export function useTaskEvents(id: string) {
  return useQuery({
    queryKey: keys.events(id),
    queryFn: async () => {
      const { data, error } = await db().from('task_events').select('*').eq('task_id', id).order('id');
      if (error) throw toAppError(error);
      return data as TaskEvent[];
    },
  });
}

/** Media with short-lived signed URLs (the bucket is private). */
export function useTaskMedia(id: string, enabled = true) {
  return useQuery({
    queryKey: keys.media(id),
    enabled,
    queryFn: async () => {
      const { data, error } = await db().from('task_media').select('*').eq('task_id', id).order('created_at');
      if (error) throw toAppError(error);
      const rows = data as TaskMedia[];
      if (!rows.length) return [];
      const { data: signed } = await db().storage.from('task-media').createSignedUrls(rows.map((r) => r.storage_path), 600);
      return rows.map((r, i) => ({ ...r, url: signed?.[i]?.signedUrl ?? null }));
    },
  });
}

export interface NewTask {
  category: string;
  title: string;
  description: string;
  price: number;
  approxLabel: string;
  lat: number;
  lng: number;
  exactAddress: string;
  exactDetails: string;
  scheduledFor?: string | null;
  preferredTasker?: string | null;
}

export async function createTask(t: NewTask): Promise<string> {
  const id = await rpc<string>('create_task', {
    p_category: t.category,
    p_title: t.title,
    p_description: t.description,
    p_price: t.price,
    p_approx_label: t.approxLabel,
    p_lat: t.lat,
    p_lng: t.lng,
    p_exact_address: t.exactAddress,
    p_exact_details: t.exactDetails,
    p_scheduled_for: t.scheduledFor ?? null,
    p_preferred_tasker: t.preferredTasker ?? null,
  });
  queryClient.invalidateQueries({ queryKey: keys.myTasks });
  return id;
}

export const cancelTask = (id: string, reason?: string) => rpc<void>('cancel_task', { p_task: id, p_reason: reason ?? null });
export const getPin = (id: string) => rpc<string | null>('get_task_pin', { p_task: id });
export const rotatePin = (id: string) => rpc<void>('rotate_pin', { p_task: id });
export const confirmCompletion = (id: string) => rpc<void>('confirm_completion', { p_task: id });
export const openDispute = (id: string, reason: string, details?: string) => rpc<string>('open_dispute', { p_task: id, p_reason: reason, p_details: details ?? null });
export const leaveReview = (id: string, rating: number, comment?: string) => rpc<void>('leave_review', { p_task: id, p_rating: rating, p_comment: comment ?? null });
