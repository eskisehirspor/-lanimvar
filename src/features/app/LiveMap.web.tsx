import { View } from 'react-native';

import { MapCanvas } from '@/ui';

import type { LiveMapProps } from './LiveMap';

/** Web has no native map module: the schematic canvas keeps layouts identical. */
export function LiveMap({ mode, height }: LiveMapProps) {
  return (
    <View style={{ height }}>
      <MapCanvas mode={mode} height={height} />
    </View>
  );
}
