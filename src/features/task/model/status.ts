/**
 * Task lifecycle contract (client side). The database lifecycle mirrors these
 * values; the server enforces transitions in RPCs, the client only presents.
 * Safety check-ins/issues, PIN failures and Tasker no-shows are lifecycle
 * EVENTS, not statuses.
 */
export const taskStatuses = [
  'draft',
  'searching',
  'assigned',
  'en_route',
  'arrived',
  'in_progress',
  'proof_submitted',
  'completed',
  'cancelled',
  'expired',
  'no_show_customer',
  'disputed',
] as const;

export type TaskStatus = (typeof taskStatuses)[number];

export const transitions: Record<TaskStatus, readonly TaskStatus[]> = {
  draft: ['searching', 'cancelled'],
  searching: ['assigned', 'cancelled', 'expired'],
  // → searching: Tasker released (no-show, safety exit) and the task re-dispatches.
  assigned: ['en_route', 'searching', 'cancelled'],
  en_route: ['arrived', 'searching', 'cancelled'],
  arrived: ['in_progress', 'no_show_customer', 'searching', 'cancelled'],
  in_progress: ['proof_submitted', 'disputed', 'cancelled'],
  proof_submitted: ['completed', 'disputed'],
  completed: ['disputed'],
  cancelled: [],
  expired: [],
  no_show_customer: ['disputed'],
  disputed: ['completed', 'cancelled'],
};

export function canTransition(from: TaskStatus, to: TaskStatus): boolean {
  return transitions[from].includes(to);
}

export const terminalStatuses: readonly TaskStatus[] = ['cancelled', 'expired', 'no_show_customer'];

export const lifecycleSteps = ['searching', 'assigned', 'en_route', 'arrived', 'in_progress', 'done'] as const;
export type LifecycleStep = (typeof lifecycleSteps)[number];

export function stepForStatus(status: TaskStatus): LifecycleStep | null {
  switch (status) {
    case 'searching':
    case 'assigned':
    case 'en_route':
    case 'arrived':
    case 'in_progress':
      return status;
    case 'proof_submitted':
    case 'completed':
      return 'done';
    default:
      return null;
  }
}

export type StatusTone = 'live' | 'active' | 'attention' | 'success' | 'neutral';

export const statusTone: Record<TaskStatus, StatusTone> = {
  draft: 'neutral',
  searching: 'live',
  assigned: 'active',
  en_route: 'live',
  arrived: 'live',
  in_progress: 'active',
  proof_submitted: 'attention',
  completed: 'success',
  cancelled: 'neutral',
  expired: 'neutral',
  no_show_customer: 'attention',
  disputed: 'attention',
};
