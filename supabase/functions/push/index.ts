// Push notifications, called by Database Webhooks (see supabase/README.md):
//   task_dispatches INSERT → "Yeni iş" to the Tasker
//   tasks UPDATE (status)  → status line to the customer
// Pushes carry a title, a short line and the task id. NEVER a PIN or an exact address.
import { createClient } from 'npm:@supabase/supabase-js@2';

type Payload = { type: 'INSERT' | 'UPDATE'; table: string; record: Record<string, unknown>; old_record?: Record<string, unknown> };

const statusLines: Record<string, { title: string; body: string }> = {
  assigned: { title: 'Görevli bulundu', body: 'Kabul edildi. Görevli birazdan yola çıkacak.' },
  en_route: { title: 'Görevli yolda', body: 'Varış süresini uygulamadan izleyebilirsin.' },
  arrived: { title: 'Görevli kapıda', body: 'Kapıda kodunu söylemeyi unutma.' },
  proof_submitted: { title: 'İş bitti', body: 'Fotoğraflara bakıp onayla.' },
  expired: { title: 'Görevli bulunamadı', body: 'Fiyatı ya da saati değiştirip tekrar deneyebilirsin.' },
};

Deno.serve(async (req) => {
  if (req.headers.get('x-webhook-secret') !== Deno.env.get('PUSH_WEBHOOK_SECRET')) return new Response('forbidden', { status: 403 });
  const p = (await req.json()) as Payload;
  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

  let to: string | null = null;
  let message: { title: string; body: string } | null = null;
  const taskId = String(p.record.task_id ?? p.record.id ?? '');

  if (p.table === 'task_dispatches' && p.type === 'INSERT') {
    const { data: task } = await db.from('tasks').select('title, price, approx_label').eq('id', taskId).single();
    if (task) message = { title: `Yeni iş · ${task.price} TL`, body: `${task.title} · ${task.approx_label}` };
    to = String(p.record.tasker_id);
  } else if (p.table === 'tasks' && p.type === 'UPDATE' && p.record.status !== p.old_record?.status) {
    message = statusLines[String(p.record.status)] ?? null;
    to = String(p.record.customer_id);
  }
  if (!to || !message) return new Response('skip');

  const { data: profile } = await db.from('profiles').select('push_token').eq('id', to).single();
  if (!profile?.push_token) return new Response('no token');

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to: profile.push_token, title: message.title, body: message.body, data: { taskId }, sound: 'default' }),
  });
  return new Response('sent');
});
