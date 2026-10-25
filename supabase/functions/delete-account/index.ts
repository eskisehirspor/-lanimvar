// Deletes the caller's account (App Store 5.1.1(v)).
// 1) As the caller: public.delete_my_account() erases personal data and closes open work.
// 2) As service role: the auth user is soft-deleted, so the phone/email can sign up again
//    while anonymised task records stay for safety and legal retention.
import { createClient } from 'npm:@supabase/supabase-js@2';

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, content-type, apikey, x-client-info' };

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  const auth = req.headers.get('Authorization');
  if (!auth) return json({ error: 'not_signed_in' }, 401);

  const url = Deno.env.get('SUPABASE_URL')!;
  const asUser = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: auth } } });
  const { data: userData, error: userError } = await asUser.auth.getUser();
  if (userError || !userData.user) return json({ error: 'not_signed_in' }, 401);

  const { error: rpcError } = await asUser.rpc('delete_my_account');
  if (rpcError) return json({ error: rpcError.message }, 409);

  const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { error: deleteError } = await admin.auth.admin.deleteUser(userData.user.id, true);
  if (deleteError) return json({ error: 'delete_failed' }, 500);
  return json({ ok: true });
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
}
