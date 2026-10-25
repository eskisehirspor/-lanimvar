/**
 * A supabase-js look-alike over the in-memory demo backend: just the surface the
 * app uses (auth, from().select…, rpc, channel, storage, functions).
 */
import { db, DEMO_CODE, listen, mediaUrl, newUser, putMedia, rpcs, session, userForPhone, visible } from './backend';

type AuthEvent = 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED';
type Session = { user: { id: string }; access_token: string };
const authListeners = new Set<(e: AuthEvent, s: Session | null) => void>();
const currentSession = (): Session | null => (session.userId ? { user: { id: session.userId }, access_token: 'demo' } : null);
const wait = (ms = 180) => new Promise((r) => setTimeout(r, ms));

function signIn(userId: string) {
  session.userId = userId;
  const s = currentSession();
  authListeners.forEach((cb) => cb('SIGNED_IN', s));
}

const ok = <T>(data: T) => ({ data, error: null });
const err = (message: string) => ({ data: null, error: { message } });

class Query implements PromiseLike<{ data: unknown; error: { message: string } | null }> {
  private filters: ((r: Record<string, unknown>) => boolean)[] = [];
  private sort: { col: string; asc: boolean } | null = null;
  private max = Infinity;
  private mode: 'many' | 'single' | 'maybe' = 'many';
  constructor(private table: string) {}
  select() {
    return this;
  }
  eq(col: string, val: unknown) {
    this.filters.push((r) => r[col] === val);
    return this;
  }
  in(col: string, vals: unknown[]) {
    this.filters.push((r) => vals.includes(r[col]));
    return this;
  }
  order(col: string, opts?: { ascending?: boolean }) {
    this.sort = { col, asc: opts?.ascending ?? true };
    return this;
  }
  limit(n: number) {
    this.max = n;
    return this;
  }
  single() {
    this.mode = 'single';
    return this;
  }
  maybeSingle() {
    this.mode = 'maybe';
    return this;
  }
  private run() {
    let rows = visible(this.table).filter((r) => this.filters.every((f) => f(r)));
    if (this.sort) {
      const { col, asc } = this.sort;
      rows = [...rows].sort((a, b) => (String(a[col]) < String(b[col]) ? -1 : String(a[col]) > String(b[col]) ? 1 : 0) * (asc ? 1 : -1));
    }
    rows = rows.slice(0, this.max).map((r) => ({ ...r }));
    if (this.mode === 'many') return ok(rows);
    if (this.mode === 'maybe') return ok(rows[0] ?? null);
    return rows[0] ? ok(rows[0]) : err('not found');
  }
  then<A, B>(onOk?: (v: { data: unknown; error: { message: string } | null }) => A | PromiseLike<A>, onErr?: (e: unknown) => B | PromiseLike<B>) {
    return wait(120).then(() => this.run()).then(onOk, onErr);
  }
}

export function createDemoClient() {
  return {
    auth: {
      getSession: async () => ok({ session: currentSession() }),
      onAuthStateChange: (cb: (e: AuthEvent, s: Session | null) => void) => {
        authListeners.add(cb);
        return { data: { subscription: { unsubscribe: () => authListeners.delete(cb) } } };
      },
      signInWithOtp: async () => {
        await wait(500);
        return { error: null };
      },
      verifyOtp: async ({ phone, token }: { phone: string; token: string }) => {
        await wait(400);
        if (token !== DEMO_CODE) return { error: { message: 'Token has expired or is invalid' } };
        signIn(userForPhone(phone.replace('+', '')));
        return { error: null };
      },
      signInWithIdToken: async () => {
        signIn(newUser({}));
        return { error: null };
      },
      signInWithOAuth: async () => {
        await wait(300);
        signIn(newUser({}));
        return { data: { url: null }, error: null };
      },
      exchangeCodeForSession: async () => ({ error: null }),
      updateUser: async ({ data }: { data: { full_name?: string } }) => {
        const p = db.profiles!.find((x) => x.id === session.userId);
        if (p && data.full_name && !p.full_name) p.full_name = data.full_name;
        return { error: null };
      },
      signOut: async () => {
        session.userId = null;
        authListeners.forEach((cb) => cb('SIGNED_OUT', null));
        return { error: null };
      },
      startAutoRefresh: () => undefined,
      stopAutoRefresh: () => undefined,
    },
    from: (table: string) => new Query(table),
    rpc: async (name: string, args?: Record<string, unknown>) => {
      await wait(220);
      const fn = rpcs[name];
      if (!fn) return err(`unknown rpc ${name}`);
      try {
        return ok(fn(args ?? {}) ?? null);
      } catch (e) {
        return err(e instanceof Error ? e.message : String(e));
      }
    },
    channel: () => {
      const offs: (() => void)[] = [];
      const ch = {
        on: (_kind: string, opts: { table: string; filter?: string }, cb: (p: { new: Record<string, unknown> }) => void) => {
          const m = opts.filter?.match(/^(\w+)=eq\.(.+)$/);
          offs.push(listen({ table: opts.table, filter: m ? { col: m[1]!, val: m[2]! } : undefined, cb }));
          return ch;
        },
        subscribe: () => ch,
        unsubscribe: () => offs.forEach((o) => o()),
      };
      return ch;
    },
    removeChannel: (ch: { unsubscribe: () => void }) => ch.unsubscribe(),
    storage: {
      from: () => ({
        upload: async (path: string, _body: unknown, opts?: { previewUrl?: string }) => {
          putMedia(path, opts?.previewUrl ?? mediaUrl(path));
          return { error: null };
        },
        createSignedUrls: async (paths: string[]) => ok(paths.map((p) => ({ path: p, signedUrl: mediaUrl(p) }))),
      }),
    },
    functions: {
      invoke: async (name: string) => {
        if (name === 'delete-account') rpcs.delete_my_account!({});
        return { error: null };
      },
    },
  };
}
