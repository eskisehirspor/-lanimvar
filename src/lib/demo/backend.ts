/**
 * In-browser stand-in for the Supabase backend, for the public demo build only
 * (EXPO_PUBLIC_DEMO=1). It mirrors the RPC contract in supabase/migrations closely
 * enough to click through every flow, and simulates the other side (a Tasker who
 * accepts, a customer who posts work). Data lives in memory and resets on reload.
 * NEVER part of a real build: real builds talk to Supabase, where the rules live.
 */
import { clay, clayStage } from '@/brand/clay';
import type { TaskStatus } from '@/features/task/model/status';

type Row = Record<string, unknown>;
export type Tables = Record<string, Row[]>;

export const DEMO_CODE = '123456';
export const ids = {
  customer: 'demo-customer',
  tasker: 'demo-tasker',
  admin: 'demo-admin',
  simTasker: 'demo-sim-tasker',
  simCustomer: 'demo-sim-customer',
};
const phones: Record<string, string> = { '905550000001': ids.customer, '905550000002': ids.tasker, '905550000003': ids.admin };

const now = () => new Date().toISOString();
const ago = (min: number) => new Date(Date.now() - min * 60_000).toISOString();
let seq = 1;
const uid = (p = 'id') => `${p}-${Date.now().toString(36)}-${(seq++).toString(36)}`;
const DEST = { lat: 39.7767, lng: 30.5206 };

/** A drawn "photo" (SVG data URI) for proof pictures, so no image hosting is needed. */
export function samplePhoto(kind: 'before' | 'after') {
  const bg = kind === 'after' ? clayStage.leaf : clayStage.sun;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" fill="${bg}"/><rect x="0" y="92" width="120" height="28" fill="${clay.cream.lo}"/><rect x="22" y="44" width="76" height="36" rx="12" fill="${clay.sun.base}"/><rect x="18" y="64" width="84" height="22" rx="9" fill="${clay.sun.lo}"/><rect x="10" y="56" width="20" height="34" rx="10" fill="${clay.sun.hi}"/><rect x="90" y="56" width="20" height="34" rx="10" fill="${clay.sun.lo}"/></svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

function seed(): Tables {
  const people: Row[] = [
    { id: ids.customer, role: 'customer', full_name: 'Ayşe Kaya', phone: '905550000001', onboarded_at: ago(9000), is_banned: false, deleted_at: null, legal_version: '2026-10-26', created_at: ago(9000), first_name: 'Ayşe', last_name: 'Kaya', email: 'ayse@example.com', phone_verified_at: ago(9000), email_verified_at: ago(9000), birth_date: '1994-03-12', home_district: 'Tepebaşı', home_neighbourhood: 'Hoşnudiye', home_address: 'Ahmet Kanatlı Cad. No: 24', home_details: 'Kat 3 Daire 7', home_lat: 39.7767, home_lng: 30.5206 },
    { id: ids.tasker, role: 'tasker', full_name: 'Mehmet Koç', phone: '905550000002', onboarded_at: ago(8000), is_banned: false, deleted_at: null, legal_version: '2026-10-26', created_at: ago(8000), first_name: 'Mehmet', last_name: 'Koç', email: 'mehmet@example.com', phone_verified_at: ago(8000), email_verified_at: ago(8000), birth_date: '1997-08-02', home_district: 'Odunpazarı', home_address: 'Vişnelik Mah. 12. Sok. No: 4' },
    { id: ids.admin, role: 'admin', full_name: 'Destek Ekibi', phone: '905550000003', onboarded_at: ago(10000), is_banned: false, deleted_at: null, legal_version: '2026-10-26', created_at: ago(10000), email: 'destek@example.com', phone_verified_at: ago(10000), email_verified_at: ago(10000) },
    { id: ids.simTasker, role: 'tasker', full_name: 'Emre Yıldız', phone: '905550000010', onboarded_at: ago(7000), is_banned: false, deleted_at: null, legal_version: '2026-10-25', created_at: ago(7000) },
    { id: ids.simCustomer, role: 'customer', full_name: 'Zeynep Arslan', phone: '905550000011', onboarded_at: ago(6000), is_banned: false, deleted_at: null, legal_version: '2026-10-25', created_at: ago(6000) },
    { id: 'demo-p1', role: 'tasker', full_name: 'Selin Ak', phone: '905550000012', onboarded_at: ago(300), is_banned: false, deleted_at: null, legal_version: '2026-10-25', created_at: ago(300) },
    { id: 'demo-p2', role: 'tasker', full_name: 'Burak Demir', phone: '905550000013', onboarded_at: ago(200), is_banned: false, deleted_at: null, legal_version: '2026-10-25', created_at: ago(200) },
  ];
  const tasker_profiles: Row[] = [
    { id: ids.tasker, user_id: ids.tasker, verification: 'approved', is_online: false, rating_avg: 4.9, rating_count: 28, completed_count: 31, last_lat: 39.78, last_lng: 30.515, categories: [], national_id: '10000000146', has_vehicle: true, application_submitted_at: ago(8000) },
    { id: ids.simTasker, user_id: ids.simTasker, verification: 'approved', is_online: true, rating_avg: 4.8, rating_count: 54, completed_count: 61, last_lat: 39.785, last_lng: 30.505 },
    { id: 'demo-p1', user_id: 'demo-p1', verification: 'pending', is_online: false, rating_avg: 0, rating_count: 0, completed_count: 0, categories: ['football', 'okey', 'heavy'], national_id: '11111111110', has_vehicle: false, application_submitted_at: ago(280), id_front_path: 'demo-p1/id-front.jpg', selfie_path: 'demo-p1/selfie.jpg' },
    { id: 'demo-p2', user_id: 'demo-p2', verification: 'pending', is_online: false, rating_avg: 0, rating_count: 0, completed_count: 0 },
  ];
  const pricing_rules: Row[] = (
    [
      ['heavy', 'Ağır eşya', 'daily', 650, 300, 3000, 1],
      ['moving', 'Taşıma', 'daily', 900, 400, 6000, 1],
      ['assembly', 'Montaj', 'daily', 450, 200, 2500, 1],
      ['repair', 'Küçük tamir', 'daily', 400, 200, 2500, 1],
      ['shopping', 'Alışveriş', 'daily', 250, 150, 1500, 1],
      ['cleaning', 'Temizlik', 'daily', 700, 300, 4000, 1],
      ['football', 'Halısahaya oyuncu', 'social', 0, 0, 300, 4],
      ['okey', 'Okeye 4. kişi', 'social', 0, 0, 200, 3],
      ['games', 'King, Batak, Play arkadaşı', 'social', 0, 0, 200, 3],
      ['sport', 'Spor partneri', 'social', 0, 0, 300, 2],
      ['queue', 'Sırada bekleme', 'wait', 300, 150, 1500, 1],
      ['athome', 'Evde servis bekleme', 'wait', 250, 150, 1500, 1],
      ['parcel', 'Kargo götür, teslim al', 'wait', 150, 80, 600, 1],
      ['dogwalk', 'Köpek gezdirme', 'pets', 150, 80, 500, 1],
      ['petsit', 'Evcil hayvan besleme', 'pets', 200, 100, 800, 1],
      ['plants', 'Bitki sulama', 'pets', 120, 60, 400, 1],
      ['snow', 'Kar küreme', 'pets', 300, 150, 1500, 1],
      ['garden', 'Bahçe işleri', 'pets', 400, 200, 2500, 1],
      ['carwash', 'Araç yıkama', 'pets', 300, 150, 1000, 1],
      ['tech', 'Telefon, bilgisayar kurulumu', 'extra', 300, 150, 1500, 1],
      ['event', 'Etkinlik hazırlığı', 'extra', 500, 200, 3000, 1],
      ['photo', 'Fotoğraf çekimi', 'extra', 500, 200, 3000, 1],
      ['tutor', 'Ders çalışma, özel ders', 'extra', 300, 150, 1500, 1],
    ] as const
  ).map(([category, label, section, rec, min, max, people], i) => ({ id: `rule-${category}`, category, label, section, sort: i, recommended_price: rec, min_price: min, max_price: max, max_people: people, active: true }));

  // A week of history so the admin dashboard has something to say.
  const titles = ['Koltuk indirme', 'Dolap montajı', 'Market alışverişi', 'Ev temizliği', 'Koli taşıma', 'Raf takma', 'Çamaşır makinesi taşıma'];
  const cats = ['heavy', 'assembly', 'shopping', 'cleaning', 'moving', 'repair', 'heavy'];
  const hoods = ['Hoşnudiye', 'Bahçelievler', 'Vişnelik', 'Osmangazi', 'Batıkent', 'Yenibağlar'];
  const tasks: Row[] = [];
  const task_events: Row[] = [];
  const task_assignments: Row[] = [];
  for (let i = 0; i < 26; i++) {
    const created = 60 * (4 + i * 6);
    const acceptMin = 1.5 + ((i * 37) % 60) / 10;
    const status: TaskStatus = i % 9 === 4 ? 'expired' : i % 11 === 6 ? 'cancelled' : i === 3 ? 'disputed' : 'completed';
    const id = `hist-${i}`;
    const customer = i % 3 === 0 ? ids.customer : ids.simCustomer;
    const accepted = status === 'expired' ? null : new Date(Date.parse(ago(created)) + acceptMin * 60_000).toISOString();
    tasks.push({
      id, customer_id: customer, category: cats[i % cats.length], title: titles[i % titles.length], description: null, price: 250 + ((i * 130) % 900),
      status, approx_label: `${hoods[i % hoods.length]}, Eskişehir`, approx_lat: 39.777, approx_lng: 30.521, exact_address: 'Demo Cad. No: 1', exact_details: null,
      exact_lat: DEST.lat, exact_lng: DEST.lng, searching_since: ago(created), first_accepted_at: accepted, arrived_at: null, started_at: null,
      completed_at: status === 'completed' ? ago(created - 50) : null, cancelled_at: status === 'cancelled' ? ago(created - 5) : null, created_at: ago(created),
    });
    task_events.push({ id: seq++, task_id: id, actor_id: customer, type: 'created', data: {}, created_at: ago(created) });
    if (accepted) {
      task_assignments.push({ id: uid('as'), task_id: id, tasker_id: ids.simTasker, status: status === 'completed' ? 'completed' : 'released', accepted_at: accepted });
      task_events.push({ id: seq++, task_id: id, actor_id: ids.simTasker, type: 'accepted', data: { seconds_to_accept: Math.round(acceptMin * 60) }, created_at: accepted });
    }
  }
  const disputes: Row[] = [
    { id: 'case-1', task_id: 'hist-3', reporter_id: ids.simCustomer, subject_id: ids.simTasker, kind: 'dispute', status: 'open', reason: 'İş tamamlanmadı ya da hasar var', details: 'Dolabın kapağı çizilmiş.', resolution: null, created_at: ago(400), resolved_at: null },
    { id: 'case-2', task_id: 'hist-8', reporter_id: ids.simTasker, subject_id: ids.simCustomer, kind: 'incident', status: 'open', reason: 'unsafe_place', details: null, resolution: null, created_at: ago(90), resolved_at: null },
    { id: 'case-3', task_id: null, reporter_id: ids.customer, subject_id: 'demo-p2', kind: 'report', status: 'reviewing', reason: 'fake', details: 'Profil fotoğrafı başkasına ait gibi.', resolution: null, created_at: ago(1500), resolved_at: null },
  ];
  const audit_log: Row[] = [{ id: seq++, actor_id: ids.admin, action: 'tasker_verification', target_type: 'profile', target_id: ids.simTasker, data: { status: 'approved' }, created_at: ago(7000) }];
  return { profiles: people, tasker_profiles, pricing_rules, tasks, task_events, task_assignments, task_dispatches: [], task_media: [], reviews: [], disputes, user_blocks: [], audit_log };
}

export const db: Tables = seed();
const pins = new Map<string, string>();
const media = new Map<string, string>();
const timers: ReturnType<typeof setTimeout>[] = [];

// ─── Change feed (stands in for Realtime) ─────────────────────────────────────
type Listener = { table: string; filter?: { col: string; val: string }; cb: (p: { new: Row }) => void };
const listeners = new Set<Listener>();
export function listen(l: Listener) {
  listeners.add(l);
  return () => listeners.delete(l);
}
function emit(table: string, row: Row) {
  for (const l of listeners) if (l.table === table && (!l.filter || String(row[l.filter.col]) === l.filter.val)) l.cb({ new: { ...row } });
}

// ─── Session ──────────────────────────────────────────────────────────────────
export const session: { userId: string | null } = { userId: null };
/** What "auth" has verified for each demo user (mirrors auth.users phone/email confirmation). */
export const verified = new Map<string, { phone: string | null; email: string | null }>([
  [ids.customer, { phone: '905550000001', email: 'ayse@example.com' }],
  [ids.tasker, { phone: '905550000002', email: 'mehmet@example.com' }],
  [ids.admin, { phone: '905550000003', email: 'destek@example.com' }],
]);
export function userForPhone(phone: string) {
  const known = phones[phone];
  if (known) return known;
  const existing = db.profiles!.find((p) => p.phone === phone);
  if (existing) return existing.id as string;
  return newUser({ phone });
}
export function newUser(meta: { phone?: string; full_name?: string; email?: string }) {
  const id = uid('user');
  verified.set(id, { phone: meta.phone ?? null, email: meta.email ?? null });
  db.profiles!.push({ id, role: 'customer', full_name: meta.full_name ?? null, phone: meta.phone ?? null, onboarded_at: null, is_banned: false, deleted_at: null, legal_version: null, created_at: now() });
  return id;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fail = (code: string) => {
  throw new Error(code);
};
const me = () => {
  const p = db.profiles!.find((x) => x.id === session.userId);
  if (!p || p.deleted_at) fail('not_signed_in');
  if (p!.is_banned) fail('banned');
  return p!;
};
const task = (id: unknown) => db.tasks!.find((t) => t.id === id) ?? fail('not_allowed');
const tp = (user: unknown) => db.tasker_profiles!.find((x) => x.user_id === user);
const log = (taskId: string, type: string, data: Record<string, unknown> = {}, actor: string | null = session.userId) => {
  const e = { id: seq++, task_id: taskId, actor_id: actor, type, data, created_at: now() };
  db.task_events!.push(e);
  emit('task_events', e);
};
const audit = (action: string, target_type: string, target_id: string, data: Record<string, unknown> = {}) => db.audit_log!.push({ id: seq++, actor_id: session.userId, action, target_type, target_id, data, created_at: now() });
function update(t: Row, patch: Row) {
  Object.assign(t, patch, { updated_at: now() });
  emit('tasks', t);
}
const activeAssignment = (taskId: string) => db.task_assignments!.find((a) => a.task_id === taskId && a.status === 'active');
const myAssignment = (taskId: string) => db.task_assignments!.find((a) => a.task_id === taskId && a.status === 'active' && a.tasker_id === session.userId);
function setPin(taskId: string, reason: string) {
  pins.set(taskId, String(100000 + Math.floor(Math.random() * 900000)));
  log(taskId, reason === 'generated' ? 'pin_generated' : 'pin_rotated', { reason });
}
const dropPin = (taskId: string) => pins.delete(taskId) && log(taskId, 'pin_deleted');
const failures = (taskId: string) => {
  const evs = db.task_events!.filter((e) => e.task_id === taskId);
  const last = Math.max(0, ...evs.filter((e) => e.type === 'pin_generated' || e.type === 'pin_rotated').map((e) => e.id as number));
  return evs.filter((e) => e.type === 'pin_failed' && (e.id as number) > last).length;
};
const later = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms));
const first = (name: unknown) => String(name ?? '').split(' ')[0] ?? '';
const initials = (name: unknown) =>
  String(name ?? '?')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

/** For the demo only: the PIN a simulated customer would say at the door. */
export const demoPinFor = (taskId: string) => pins.get(taskId) ?? null;

// ─── Simulation: the other side of the marketplace ───────────────────────────
function simulateTaskerFor(taskId: string) {
  later(4500, () => {
    const t = task(taskId);
    if (t.status !== 'searching') return;
    db.task_assignments!.push({ id: uid('as'), task_id: taskId, tasker_id: ids.simTasker, status: 'active', accepted_at: now() });
    update(t, { status: 'assigned', first_accepted_at: now() });
    log(taskId, 'accepted', { seconds_to_accept: 4 }, ids.simTasker);
    setPin(taskId, 'generated');
    const sim = tp(ids.simTasker)!;
    Object.assign(sim, { last_lat: DEST.lat + 0.012, last_lng: DEST.lng - 0.014 });
    later(4000, () => {
      if (task(taskId).status !== 'assigned') return;
      update(task(taskId), { status: 'en_route' });
      log(taskId, 'en_route', {}, ids.simTasker);
      let step = 0;
      const move = () => {
        if (task(taskId).status !== 'en_route') return;
        step++;
        Object.assign(sim, { last_lat: DEST.lat + 0.012 * (1 - step / 8), last_lng: DEST.lng - 0.014 * (1 - step / 8), last_seen_at: now() });
        if (step < 8) later(2000, move);
        else {
          update(task(taskId), { status: 'arrived', arrived_at: now() });
          log(taskId, 'arrived', { distance_m: 12 }, ids.simTasker);
          // The customer says the code at the door; the simulated Tasker types it in.
          later(9000, () => {
            if (task(taskId).status !== 'arrived') return;
            update(task(taskId), { status: 'in_progress', started_at: now() });
            log(taskId, 'pin_verified', {}, ids.simTasker);
            later(7000, () => {
              if (task(taskId).status !== 'in_progress') return;
              const path = `${taskId}/${ids.simTasker}/after.jpg`;
              media.set(path, samplePhoto('after'));
              db.task_media!.push({ id: uid('m'), task_id: taskId, uploader_id: ids.simTasker, kind: 'after', storage_path: path, created_at: now() });
              update(task(taskId), { status: 'proof_submitted', proof_submitted_at: now() });
              log(taskId, 'proof_submitted', {}, ids.simTasker);
            });
          });
        }
      };
      later(1500, move);
    });
  });
}

const simJobs = [
  { title: 'Buzdolabını 2. kata çıkarma', category: 'heavy', price: 700, label: 'Bahçelievler, Eskişehir', desc: 'Asansör yok. İki kişi gerekebilir ama tek kişi de olur, el arabası var.' },
  { title: 'IKEA dolap montajı', category: 'assembly', price: 500, label: 'Vişnelik, Eskişehir', desc: '3 kapaklı gardırop, kutusu açılmadı.' },
  { title: 'Haftalık market alışverişi', category: 'shopping', price: 250, label: 'Hoşnudiye, Eskişehir', desc: 'Liste hazır, yaklaşık 12 kalem.' },
  { title: 'Bu akşam okeye 4. kişi', category: 'okey', price: 0, label: 'Bahçelievler, Eskişehir', desc: 'Saat 21:00, çay bizden. Mahalle kahvesi, sakin ortam.' },
  { title: 'Halısahaya 1 kişi eksik', category: 'football', price: 0, label: 'Vişnelik, Eskişehir', desc: '7v7, saha parası bizden. Kaleci de olur.' },
];
let simJobIndex = 0;
function offerSimJob(target: string) {
  const me = tp(target);
  if (!me?.is_online) return;
  if (db.task_assignments!.some((a) => a.tasker_id === target && a.status === 'active')) return;
  const j = simJobs[simJobIndex++ % simJobs.length]!;
  const id = uid('task');
  db.tasks!.push({
    id, customer_id: ids.simCustomer, category: j.category, title: j.title, description: j.desc, price: j.price, status: 'searching',
    approx_label: j.label, approx_lat: 39.777, approx_lng: 30.521, exact_address: 'Kızılcıklı Mahmut Pehlivan Cad. No: 18', exact_details: 'Kat 2, Daire 5 · zile basın',
    exact_lat: DEST.lat, exact_lng: DEST.lng, searching_since: now(), first_accepted_at: null, arrived_at: null, started_at: null, completed_at: null, cancelled_at: null, created_at: now(),
  });
  log(id, 'created', {}, ids.simCustomer);
  const d = { id: uid('d'), task_id: id, tasker_id: target, status: 'offered', distance_m: 1300 + simJobIndex * 400, offered_at: now(), expires_at: new Date(Date.now() + 90_000).toISOString() };
  db.task_dispatches!.push(d);
  emit('task_dispatches', d);
}

// ─── RPCs ─────────────────────────────────────────────────────────────────────
type Args = Record<string, unknown>;
const live = ['assigned', 'en_route', 'arrived', 'in_progress'];

export const rpcs: Record<string, (a: Args) => unknown> = {
  is_admin: () => me().role === 'admin',
  complete_onboarding: (a) => {
    const p = db.profiles!.find((x) => x.id === session.userId) ?? fail('not_signed_in');
    if (!a.p_accept_terms || !a.p_accept_kvkk || String(a.p_first_name ?? '').trim().length < 2 || String(a.p_last_name ?? '').trim().length < 2) fail('invalid_input');
    const birth = Date.parse(String(a.p_birth_date ?? ''));
    if (!birth || birth > Date.now() - 18 * 365.25 * 86400_000) fail('underage');
    if (String(a.p_address ?? '').trim().length < 5) fail('invalid_input');
    const v = verified.get(String(p!.id));
    if (!v?.phone) fail('phone_unverified');
    if (!v?.email) fail('email_unverified');
    Object.assign(p!, {
      first_name: a.p_first_name, last_name: a.p_last_name, full_name: `${String(a.p_first_name).trim()} ${String(a.p_last_name).trim()}`, birth_date: a.p_birth_date,
      phone: v!.phone, email: v!.email, phone_verified_at: now(), email_verified_at: now(),
      home_district: a.p_district, home_neighbourhood: a.p_neighbourhood || null, home_address: a.p_address, home_details: a.p_details || null, home_lat: a.p_lat, home_lng: a.p_lng,
      role: p!.role === 'admin' ? 'admin' : a.p_role, onboarded_at: now(), legal_version: a.p_legal_version,
    });
    if (a.p_role === 'tasker' && !tp(p!.id)) db.tasker_profiles!.push({ id: p!.id, user_id: p!.id, verification: 'pending', is_online: false, rating_avg: 0, rating_count: 0, completed_count: 0, categories: [] });
    return p;
  },
  submit_tasker_application: (a) => {
    const p = me();
    const prof = tp(p.id) ?? fail('not_allowed');
    if (!/^[1-9]\d{10}$/.test(String(a.p_national_id))) fail('invalid_national_id');
    // Demo: applications are approved at once so the Tasker flow can be tried right away.
    Object.assign(prof!, { national_id: a.p_national_id, id_front_path: a.p_id_front_path, selfie_path: a.p_selfie_path, categories: a.p_categories, has_vehicle: a.p_has_vehicle, bio: a.p_bio, application_submitted_at: now(), verification: 'approved' });
    return prof;
  },
  update_home_address: (a) => Object.assign(me(), { home_district: a.p_district, home_neighbourhood: a.p_neighbourhood || null, home_address: a.p_address, home_details: a.p_details || null, home_lat: a.p_lat, home_lng: a.p_lng }),
  sync_verification: () => me(),
  update_profile: (a) => Object.assign(me(), a.p_full_name ? { full_name: a.p_full_name } : {}),
  create_task: (a) => {
    const p = me();
    const rule = db.pricing_rules!.find((r) => r.category === a.p_category) ?? fail('invalid_input');
    const price = Number(a.p_price);
    if (price < Number(rule!.min_price) || price > Number(rule!.max_price)) fail('invalid_input');
    const contact = /(\+?9?0?[\s.-]*5\d{2}[\s.-]*\d{3}[\s.-]*\d{2}[\s.-]*\d{2})|([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})|(TR\s?\d{2}(\s?\d{4}){5})|(whatsapp|instagram|telegram|t\.me\/|@[a-z0-9_.]{3,})/i;
    if ([a.p_title, a.p_description, a.p_exact_details].some((x) => contact.test(String(x ?? '')))) fail('contact_info_not_allowed');
    const id = uid('task');
    const t = {
      id, customer_id: p.id, category: a.p_category, title: a.p_title, description: a.p_description || null, price, status: 'searching',
      approx_label: a.p_approx_label, approx_lat: Math.round(Number(a.p_lat) * 1000) / 1000, approx_lng: Math.round(Number(a.p_lng) * 1000) / 1000,
      exact_address: a.p_exact_address, exact_details: a.p_exact_details || null, exact_lat: a.p_lat, exact_lng: a.p_lng, searching_since: now(),
      first_accepted_at: null, arrived_at: null, started_at: null, completed_at: null, cancelled_at: null, created_at: now(),
      scheduled_for: a.p_scheduled_for ?? null, preferred_tasker_id: a.p_preferred_tasker ?? null,
    };
    db.tasks!.push(t);
    log(id, 'created', { price });
    log(id, 'dispatched', { offers: 7 }, null);
    simulateTaskerFor(id);
    return id;
  },
  cancel_task: (a) => {
    const t = task(a.p_task);
    if (t.customer_id !== me().id) fail('not_allowed');
    if (!['searching', 'assigned', 'en_route', 'arrived'].includes(String(t.status))) fail('invalid_state');
    db.task_assignments!.filter((x) => x.task_id === t.id && x.status === 'active').forEach((x) => (x.status = 'released'));
    dropPin(String(t.id));
    update(t, { status: 'cancelled', cancelled_at: now(), cancel_reason: a.p_reason ?? null });
    log(String(t.id), 'cancelled');
  },
  tasker_set_online: (a) => {
    const p = tp(me().id) ?? fail('not_allowed');
    Object.assign(p!, { is_online: !!a.p_online, last_lat: a.p_lat ?? p!.last_lat, last_lng: a.p_lng ?? p!.last_lng, last_seen_at: now() });
    if (a.p_online) {
      const target = String(me().id);
      later(3000, () => offerSimJob(target));
      later(25000, () => !db.task_dispatches!.some((d) => d.tasker_id === target && d.status === 'offered') && offerSimJob(target));
    }
    return p;
  },
  tasker_ping: () => undefined,
  tasker_offers: () => {
    const uidNow = me().id;
    return db.task_dispatches!
      .filter((d) => d.tasker_id === uidNow && d.status === 'offered' && Date.parse(String(d.expires_at)) > Date.now())
      .map((d) => {
        const t = task(d.task_id);
        const c = db.profiles!.find((p) => p.id === t.customer_id);
        return { task_id: t.id, title: t.title, description: t.description, category: t.category, price: t.price, approx_label: t.approx_label, approx_lat: t.approx_lat, approx_lng: t.approx_lng, distance_m: d.distance_m, expires_at: d.expires_at, customer_first_name: first(c?.full_name), customer_tasks: 7, scheduled_for: t.scheduled_for ?? null, rehire: false };
      })
      .filter((o) => task(o.task_id).status === 'searching');
  },
  decline_offer: (a) => db.task_dispatches!.filter((d) => d.task_id === a.p_task && d.tasker_id === me().id).forEach((d) => (d.status = 'declined')),
  accept_task: (a) => {
    const p = me();
    const t = task(a.p_task);
    if (t.status !== 'searching') fail('already_taken');
    const d = db.task_dispatches!.find((x) => x.task_id === t.id && x.tasker_id === p.id) ?? fail('not_allowed');
    if (d!.status !== 'offered' || Date.parse(String(d!.expires_at)) <= Date.now()) fail('offer_expired');
    d!.status = 'accepted';
    db.task_assignments!.push({ id: uid('as'), task_id: t.id, tasker_id: p.id, status: 'active', accepted_at: now() });
    update(t, { status: 'assigned', first_accepted_at: now() });
    log(String(t.id), 'accepted');
    setPin(String(t.id), 'generated');
  },
  tasker_jobs: () => {
    const uidNow = me().id;
    return db.task_assignments!
      .filter((x) => x.tasker_id === uidNow && (x.status === 'active' || x.status === 'completed'))
      .map((x) => {
        const t = task(x.task_id);
        const c = db.profiles!.find((p) => p.id === t.customer_id);
        return { task_id: t.id, title: t.title, category: t.category, price: t.price, status: t.status, approx_label: t.approx_label, approx_lat: t.approx_lat, approx_lng: t.approx_lng, customer_id: t.customer_id, customer_first_name: first(c?.full_name), accepted_at: x.accepted_at, arrived_at: t.arrived_at };
      })
      .reverse();
  },
  get_task_address: (a) => {
    if (!myAssignment(String(a.p_task))) fail('not_allowed');
    const t = task(a.p_task);
    if (!live.includes(String(t.status))) fail('invalid_state');
    log(String(t.id), 'address_viewed');
    return [{ exact_address: t.exact_address, exact_details: t.exact_details, exact_lat: t.exact_lat, exact_lng: t.exact_lng }];
  },
  get_task_pin: (a) => {
    const t = task(a.p_task);
    if (t.customer_id !== me().id || !['assigned', 'en_route', 'arrived'].includes(String(t.status))) fail('not_allowed');
    return pins.get(String(t.id)) ?? null;
  },
  verify_pin: (a) => {
    const id = String(a.p_task);
    if (!myAssignment(id)) fail('not_allowed');
    const t = task(id);
    if (t.status !== 'arrived') fail('invalid_state');
    const f = failures(id);
    if (f >= 5) fail('pin_locked');
    if (a.p_pin === pins.get(id)) {
      update(t, { status: 'in_progress', started_at: now() });
      log(id, 'pin_verified');
      return true;
    }
    log(id, 'pin_failed', { attempt: f + 1 });
    if (f + 1 >= 5) log(id, 'pin_locked');
    return false;
  },
  rotate_pin: (a) => {
    const t = task(a.p_task);
    if (t.customer_id !== me().id) fail('not_allowed');
    setPin(String(t.id), 'customer_rotated');
  },
  tasker_start_route: (a) => {
    if (!myAssignment(String(a.p_task))) fail('not_allowed');
    update(task(a.p_task), { status: 'en_route' });
    log(String(a.p_task), 'en_route');
  },
  tasker_arrived: (a) => {
    if (!myAssignment(String(a.p_task))) fail('not_allowed');
    update(task(a.p_task), { status: 'arrived', arrived_at: now() });
    log(String(a.p_task), 'arrived', { distance_m: 15 });
  },
  add_task_media: (a) => {
    const id = uid('m');
    db.task_media!.push({ id, task_id: a.p_task, uploader_id: me().id, kind: a.p_kind, storage_path: a.p_path, created_at: now() });
    log(String(a.p_task), 'media_added', { kind: a.p_kind });
    return id;
  },
  submit_proof: (a) => {
    const id = String(a.p_task);
    if (!myAssignment(id)) fail('not_allowed');
    if (!db.task_media!.some((m) => m.task_id === id && m.kind === 'after' && m.uploader_id === session.userId)) fail('invalid_input');
    update(task(id), { status: 'proof_submitted', proof_submitted_at: now() });
    log(id, 'proof_submitted');
    // The simulated customer checks the photos and confirms.
    later(5000, () => {
      if (task(id).status !== 'proof_submitted') return;
      completeTask(id, ids.simCustomer);
    });
  },
  confirm_completion: (a) => {
    const t = task(a.p_task);
    if (t.customer_id !== me().id || t.status !== 'proof_submitted') fail('invalid_state');
    completeTask(String(t.id), session.userId);
  },
  task_tasker: (a) => {
    const t = task(a.p_task);
    const as = db.task_assignments!.filter((x) => x.task_id === t.id && (x.status === 'active' || x.status === 'completed')).at(-1);
    if (!as) return [];
    const p = db.profiles!.find((x) => x.id === as.tasker_id);
    const prof = tp(as.tasker_id);
    const showLoc = ['assigned', 'en_route', 'arrived'].includes(String(t.status));
    return [{ tasker_id: as.tasker_id, first_name: first(p?.full_name), initials: initials(p?.full_name), rating_avg: prof?.rating_avg ?? 0, rating_count: prof?.rating_count ?? 0, completed_count: prof?.completed_count ?? 0, verified: true, lat: showLoc ? prof?.last_lat : null, lng: showLoc ? prof?.last_lng : null, seen_at: now() }];
  },
  safety_checkin: (a) => log(String(a.p_task), 'safety_ok'),
  raise_incident: (a) => {
    const id = uid('case');
    db.disputes!.push({ id, task_id: a.p_task, reporter_id: me().id, subject_id: null, kind: 'incident', status: 'open', reason: a.p_kind, details: a.p_details ?? null, resolution: null, created_at: now(), resolved_at: null });
    log(String(a.p_task), a.p_kind === 'emergency' ? 'emergency_called' : 'safety_issue', { kind: a.p_kind });
    return id;
  },
  release_task: (a) => {
    const id = String(a.p_task);
    const as = myAssignment(id) ?? fail('not_allowed');
    as!.status = 'released';
    dropPin(id);
    update(task(id), { status: 'searching', searching_since: now(), arrived_at: null });
    log(id, 'tasker_released', { reason: a.p_reason });
    if (a.p_reason === 'unsafe') db.disputes!.push({ id: uid('case'), task_id: id, reporter_id: me().id, kind: 'incident', status: 'open', reason: 'unsafe_place', created_at: now() });
  },
  report_customer_no_show: (a) => {
    const id = String(a.p_task);
    const t = task(id);
    if (Date.now() - Date.parse(String(t.arrived_at)) < 10 * 60_000) fail('too_early');
    update(t, { status: 'no_show_customer' });
    dropPin(id);
    log(id, 'no_show_customer');
  },
  open_dispute: (a) => {
    const id = uid('case');
    update(task(a.p_task), { status: 'disputed' });
    db.disputes!.push({ id, task_id: a.p_task, reporter_id: me().id, kind: 'dispute', status: 'open', reason: a.p_reason, details: a.p_details ?? null, created_at: now() });
    return id;
  },
  leave_review: (a) => {
    const t = task(a.p_task);
    if (t.status !== 'completed') fail('invalid_state');
    if (db.reviews!.some((r) => r.task_id === t.id && r.author_id === session.userId)) fail('duplicate key');
    db.reviews!.push({ id: uid('r'), task_id: t.id, author_id: session.userId, rating: a.p_rating, created_at: now() });
    log(String(t.id), 'reviewed', { rating: a.p_rating });
  },
  report_user: (a) => {
    const id = uid('case');
    db.disputes!.push({ id, task_id: a.p_task ?? null, reporter_id: me().id, subject_id: a.p_subject, kind: 'report', status: 'open', reason: a.p_reason, details: a.p_details ?? null, created_at: now() });
    return id;
  },
  block_user: (a) => db.user_blocks!.push({ id: uid('b'), blocker_id: me().id, blocked_id: a.p_subject, created_at: now() }),
  unblock_user: () => undefined,
  delete_my_account: () => {
    const p = me();
    db.tasks!.filter((t) => t.customer_id === p.id && ['searching', 'assigned', 'en_route'].includes(String(t.status))).forEach((t) => update(t, { status: 'cancelled' }));
    Object.assign(p, { full_name: null, phone: null, deleted_at: now() });
    audit('account_deleted', 'profile', String(p.id));
  },

  // ── Admin ──
  admin_metrics: (a) => {
    if (me().role !== 'admin') fail('not_allowed');
    const since = Date.now() - Number(a.p_days ?? 7) * 86400_000;
    const w = db.tasks!.filter((t) => Date.parse(String(t.created_at)) > since);
    const secs = w.filter((t) => t.first_accepted_at).map((t) => (Date.parse(String(t.first_accepted_at)) - Date.parse(String(t.created_at))) / 1000).sort((x, y) => x - y);
    const pct = (q: number) => (secs.length ? Math.round(secs[Math.min(secs.length - 1, Math.floor(q * secs.length))]!) : null);
    const open = (kind: string[]) => db.disputes!.filter((d) => kind.includes(String(d.kind)) && ['open', 'reviewing'].includes(String(d.status))).length;
    return [{
      tasks_created: w.length, tasks_accepted: secs.length, tasks_completed: w.filter((t) => t.status === 'completed').length, tasks_expired: w.filter((t) => t.status === 'expired').length,
      accept_p50_s: pct(0.5), accept_p90_s: pct(0.9), open_incidents: open(['incident']), open_disputes: open(['dispute', 'no_show']), open_reports: open(['report']),
      pending_taskers: db.tasker_profiles!.filter((x) => x.verification === 'pending').length, online_taskers: db.tasker_profiles!.filter((x) => x.is_online).length,
    }];
  },
  admin_people: (a) => {
    if (me().role !== 'admin') fail('not_allowed');
    const q = String(a.p_query ?? '').toLocaleLowerCase('tr-TR');
    return db.profiles!
      .filter((p) => (!a.p_role || p.role === a.p_role) && (!q || String(p.full_name ?? '').toLocaleLowerCase('tr-TR').includes(q) || String(p.phone ?? '').includes(q)))
      .map((p) => {
        const x = tp(p.id);
        return { ...p, phone_verified: !!p.phone_verified_at, email_verified: !!p.email_verified_at, verification: x?.verification ?? null, is_online: x?.is_online ?? null, rating_avg: x?.rating_avg ?? null, completed_count: x?.completed_count ?? null, national_id: x?.national_id ?? null, id_front_path: x?.id_front_path ?? null, selfie_path: x?.selfie_path ?? null, categories: x?.categories ?? null, has_vehicle: x?.has_vehicle ?? null, application_submitted_at: x?.application_submitted_at ?? null, late_cancels: p.id === ids.simCustomer ? 2 : 0, open_reports: db.disputes!.filter((d) => d.subject_id === p.id && ['open', 'reviewing'].includes(String(d.status))).length };
      });
  },
  admin_set_tasker_verification: (a) => {
    Object.assign(tp(a.p_user) ?? fail('invalid_input'), { verification: a.p_status });
    audit('tasker_verification', 'profile', String(a.p_user), { status: a.p_status });
  },
  admin_ban_user: (a) => {
    Object.assign(db.profiles!.find((p) => p.id === a.p_user) ?? fail('invalid_input'), { is_banned: a.p_banned });
    audit(a.p_banned ? 'user_banned' : 'user_unbanned', 'profile', String(a.p_user), { reason: a.p_reason });
  },
  admin_set_role: (a) => {
    Object.assign(db.profiles!.find((p) => p.id === a.p_user) ?? fail('invalid_input'), { role: a.p_role });
    audit('role_changed', 'profile', String(a.p_user), { role: a.p_role });
  },
  admin_update_dispute: (a) => {
    Object.assign(db.disputes!.find((d) => d.id === a.p_id) ?? fail('invalid_input'), { status: a.p_status, resolution: a.p_resolution ?? null, resolved_at: ['resolved', 'dismissed'].includes(String(a.p_status)) ? now() : null });
    audit('dispute_updated', 'dispute', String(a.p_id), { status: a.p_status });
  },
  admin_settle_task: (a) => {
    update(task(a.p_task), { status: a.p_outcome });
    audit('task_settled', 'task', String(a.p_task), { outcome: a.p_outcome, note: a.p_note });
  },
  admin_task_address: (a) => {
    const t = task(a.p_task);
    audit('address_viewed', 'task', String(t.id), { reason: a.p_reason });
    return [{ exact_address: t.exact_address, exact_details: t.exact_details, exact_lat: t.exact_lat, exact_lng: t.exact_lng }];
  },
  admin_upsert_pricing_rule: (a) => {
    let r = db.pricing_rules!.find((x) => x.category === a.p_category);
    if (!r) db.pricing_rules!.push((r = { id: uid('rule'), category: a.p_category }));
    Object.assign(r, { label: a.p_label, recommended_price: a.p_recommended, min_price: a.p_min, max_price: a.p_max, active: a.p_active });
    audit('pricing_rule_saved', 'pricing_rule', String(a.p_category));
    return r;
  },
};

function completeTask(id: string, actor: string | null) {
  const t = task(id);
  update(t, { status: 'completed', completed_at: now() });
  const as = activeAssignment(id);
  if (as) {
    as.status = 'completed';
    const prof = tp(as.tasker_id);
    if (prof) prof.completed_count = Number(prof.completed_count) + 1;
  }
  dropPin(id);
  log(id, 'completed', {}, actor);
}

// ─── Row visibility (a simplified echo of the RLS policies) ──────────────────
export function visible(table: string): Row[] {
  const rows = db[table] ?? [];
  const p = db.profiles!.find((x) => x.id === session.userId);
  if (!p) return [];
  if (p.role === 'admin') return rows;
  const mineTask = (taskId: unknown) => db.tasks!.some((t) => t.id === taskId && t.customer_id === p.id) || db.task_assignments!.some((a) => a.task_id === taskId && a.tasker_id === p.id);
  switch (table) {
    case 'profiles':
      return rows.filter((r) => r.id === p.id);
    case 'tasker_profiles':
      return rows.filter((r) => r.user_id === p.id);
    case 'pricing_rules':
      return rows.filter((r) => r.active);
    case 'tasks':
      return rows.filter((r) => r.customer_id === p.id);
    case 'task_events':
    case 'task_media':
      return rows.filter((r) => mineTask(r.task_id));
    case 'task_dispatches':
      return rows.filter((r) => r.tasker_id === p.id);
    case 'disputes':
      return rows.filter((r) => r.reporter_id === p.id);
    default:
      return [];
  }
}

export const mediaUrl = (path: string) => media.get(path) ?? samplePhoto('after');
export const putMedia = (path: string, url: string) => media.set(path, url);
