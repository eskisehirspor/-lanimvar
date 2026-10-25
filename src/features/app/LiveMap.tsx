import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Circle, Marker } from 'react-native-maps';

import { withAlpha } from '@/theme/contrast';
import { useTheme } from '@/theme';
import { Avatar } from '@/ui';

export interface LiveMapProps {
  center: { lat: number; lng: number };
  /** approx = a soft area, no pin (privacy); exact = a pin at the door. */
  mode: 'approx' | 'exact';
  tasker?: { lat: number; lng: number; initials: string } | null;
  height: number;
}

/** Real map (Apple Maps on iOS, Google on Android). The web build uses LiveMap.web.tsx. */
export function LiveMap({ center, mode, tasker, height }: LiveMapProps) {
  const theme = useTheme();
  const c = theme.color;
  const ref = useRef<MapView>(null);

  useEffect(() => {
    if (!tasker) return;
    ref.current?.fitToCoordinates(
      [
        { latitude: center.lat, longitude: center.lng },
        { latitude: tasker.lat, longitude: tasker.lng },
      ],
      { edgePadding: { top: 80, right: 60, bottom: 80, left: 60 }, animated: true },
    );
  }, [tasker, center.lat, center.lng]);

  return (
    <View style={{ height }}>
      <MapView
        ref={ref}
        style={StyleSheet.absoluteFill}
        initialRegion={{ latitude: center.lat, longitude: center.lng, latitudeDelta: 0.02, longitudeDelta: 0.02 }}
        showsPointsOfInterests={false}
        toolbarEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
      >
        {mode === 'approx' ? (
          <Circle center={{ latitude: center.lat, longitude: center.lng }} radius={350} fillColor={withAlpha(c.brand.dot, 0.25)} strokeColor={c.brand.dotOutline} strokeWidth={1.5} />
        ) : (
          <Marker coordinate={{ latitude: center.lat, longitude: center.lng }} pinColor={c.brand.dot} />
        )}
        {tasker ? (
          <Marker coordinate={{ latitude: tasker.lat, longitude: tasker.lng }} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false}>
            <Avatar initials={tasker.initials} size={36} ring tone="inverse" />
          </Marker>
        ) : null}
      </MapView>
    </View>
  );
}
