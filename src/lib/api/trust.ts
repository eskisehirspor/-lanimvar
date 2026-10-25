import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

import { samplePhoto } from '@/lib/demo/backend';
import { queryClient } from '@/lib/query/queryClient';
import { isDemo } from '@/lib/supabase/config';

import { db, rpc } from './client';
import { keys } from './customer';
import { toAppError } from './errors';
import type { MediaKind } from './types';

export const safetyCheckin = (task: string) => rpc<void>('safety_checkin', { p_task: task });
export type IncidentKind = 'problem' | 'emergency' | 'unsafe_place' | 'harassment' | 'damage' | 'other';
export const raiseIncident = (task: string, kind: IncidentKind, details?: string) => rpc<string>('raise_incident', { p_task: task, p_kind: kind, p_details: details ?? null });
export const reportUser = (subject: string, reason: string, details?: string, task?: string) =>
  rpc<string>('report_user', { p_subject: subject, p_reason: reason, p_details: details ?? null, p_task: task ?? null });
export const blockUser = (subject: string) => rpc<void>('block_user', { p_subject: subject });
export const unblockUser = (subject: string) => rpc<void>('unblock_user', { p_subject: subject });

/**
 * Photo → resized JPEG (location metadata stripped by re-encoding) → private
 * bucket at <task>/<uid>/<time>.jpg → media row through the RPC.
 */
export async function uploadTaskPhoto(task: string, uid: string, uri: string, kind: MediaKind, coords?: { lat: number; lng: number }) {
  if (isDemo) {
    const path = `${task}/${uid}/${Date.now()}-${kind}.jpg`;
    await db().storage.from('task-media').upload(path, new ArrayBuffer(0), { previewUrl: uri || samplePhoto('after') } as never);
    await rpc('add_task_media', { p_task: task, p_kind: kind, p_path: path, p_lat: coords?.lat ?? null, p_lng: coords?.lng ?? null });
    queryClient.invalidateQueries({ queryKey: keys.media(task) });
    return;
  }
  const ref = await ImageManipulator.manipulate(uri).resize({ width: 1600 }).renderAsync();
  const img = await ref.saveAsync({ compress: 0.72, format: SaveFormat.JPEG });
  const body = await (await fetch(img.uri)).arrayBuffer();
  const path = `${task}/${uid}/${Date.now()}-${kind}.jpg`;
  const { error } = await db().storage.from('task-media').upload(path, body, { contentType: 'image/jpeg', upsert: false });
  if (error) throw toAppError(error);
  await rpc('add_task_media', { p_task: task, p_kind: kind, p_path: path, p_lat: coords?.lat ?? null, p_lng: coords?.lng ?? null });
  queryClient.invalidateQueries({ queryKey: keys.media(task) });
}
