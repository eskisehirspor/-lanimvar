import { canTransition, lifecycleSteps, stepForStatus, taskStatuses, transitions } from '../status';

describe('task lifecycle contract', () => {
  it('only transitions to known statuses', () => {
    for (const s of taskStatuses) for (const to of transitions[s]) expect(taskStatuses).toContain(to);
  });
  it('follows the Şimdi Lazım happy path', () => {
    const path = ['draft', 'searching', 'assigned', 'en_route', 'arrived', 'in_progress', 'proof_submitted', 'completed'] as const;
    for (let i = 0; i < path.length - 1; i++) expect(canTransition(path[i]!, path[i + 1]!)).toBe(true);
  });
  it('cannot skip the PIN gate', () => {
    expect(canTransition('en_route', 'in_progress')).toBe(false);
    expect(canTransition('assigned', 'in_progress')).toBe(false);
  });
  it('re-dispatches when a Tasker is released', () => expect(canTransition('arrived', 'searching')).toBe(true));
  it('maps statuses onto six strip steps', () => {
    expect(lifecycleSteps).toHaveLength(6);
    expect(stepForStatus('completed')).toBe('done');
    expect(stepForStatus('cancelled')).toBeNull();
  });
});
