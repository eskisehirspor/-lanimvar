import { create } from 'zustand';

/** Minimal UI/session state only; server state belongs to TanStack Query. */
export type Role = 'customer' | 'tasker';

export const useSession = create<{ role: Role; setRole: (role: Role) => void }>((set) => ({
  role: 'customer',
  setRole: (role) => set({ role }),
}));
