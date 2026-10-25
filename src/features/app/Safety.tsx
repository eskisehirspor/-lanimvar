import { useState } from 'react';
import { Linking } from 'react-native';

import { cancelTask } from '@/lib/api/customer';
import { releaseTask } from '@/lib/api/tasker';
import { raiseIncident, safetyCheckin, type IncidentKind } from '@/lib/api/trust';
import { supportContact } from '@/lib/support';
import { EmergencyScreen, SafetyHandle, SafetySheet } from '@/ui';

import { attempt } from './Notice';

const issueKind: Record<string, IncidentKind> = { behaviour: 'harassment', scope: 'problem', environment: 'unsafe_place', other: 'other' };

/**
 * The P0 safety layer, identical for both sides: a labelled handle that opens
 * Güvendeyim / Sorun var / Görevi bırak / Acil durum. Every action is recorded server-side.
 */
export function SafetyLayer({ taskId, role, onLeft }: { taskId: string; role: 'customer' | 'tasker'; onLeft?: () => void }) {
  const [open, setOpen] = useState(false);
  const [emergency, setEmergency] = useState<{ x: number; y: number } | null>(null);

  return (
    <>
      <SafetyHandle floating onPress={() => setOpen(true)} />
      <SafetySheet
        visible={open}
        onClose={() => setOpen(false)}
        onSafe={() => attempt(() => safetyCheckin(taskId))}
        onIssue={(reason) => attempt(() => raiseIncident(taskId, issueKind[reason] ?? 'other'))}
        onLeave={async () => {
          setOpen(false);
          await attempt(async () => {
            if (role === 'tasker') await releaseTask(taskId, 'unsafe');
            else {
              await raiseIncident(taskId, 'unsafe_place');
              await cancelTask(taskId, 'unsafe');
            }
          });
          onLeft?.();
        }}
        onEmergency={(origin) => {
          setOpen(false);
          setEmergency(origin);
          attempt(() => raiseIncident(taskId, 'emergency'));
        }}
      />
      <EmergencyScreen
        visible={!!emergency}
        origin={emergency ?? undefined}
        onClose={() => setEmergency(null)}
        onCall112={() => Linking.openURL('tel:112')}
        onCallTeam={() => (supportContact.phone ? Linking.openURL(`tel:${supportContact.phone}`) : Linking.openURL(`mailto:${supportContact.email}`))}
      />
    </>
  );
}
