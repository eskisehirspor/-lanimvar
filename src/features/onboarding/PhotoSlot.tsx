import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { attempt } from '@/features/app/Notice';
import { t } from '@/i18n';
import { samplePhoto } from '@/lib/demo/backend';
import { isDemo } from '@/lib/supabase/config';
import { useTheme } from '@/theme';
import { Icon, Tactile, Text, type IconName } from '@/ui';

/** A labelled photo frame: tap to shoot (front camera for selfies), shows what was taken. */
export function PhotoSlot({ label, icon, preview, front, onShot }: { label: string; icon: IconName; preview: string | null; front?: boolean; onShot: (uri: string) => Promise<void> }) {
  const theme = useTheme();
  const c = theme.color;
  const [busy, setBusy] = useState(false);
  const shoot = async () => {
    setBusy(true);
    await attempt(async () => {
      if (isDemo) return onShot(samplePhoto(front ? 'after' : 'before'));
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) return;
      const r = await ImagePicker.launchCameraAsync({ quality: 0.8, exif: false, cameraType: front ? ImagePicker.CameraType.front : ImagePicker.CameraType.back });
      if (!r.canceled && r.assets[0]) await onShot(r.assets[0].uri);
    });
    setBusy(false);
  };
  return (
    <Tactile haptic="select" pressScale={0.97} onPress={shoot} disabled={busy} accessibilityLabel={label} style={[styles.slot, { backgroundColor: c.surface.grouped, borderColor: preview ? c.status.success : c.surface.hairlineStrong }]}>
      {preview ? <Image source={{ uri: preview }} style={StyleSheet.absoluteFill} /> : null}
      <View style={[styles.badge, { backgroundColor: preview ? c.status.success : c.surface.panel }]}>
        <Icon name={preview ? 'check' : icon} size={18} color={preview ? c.ink.onInverse : c.ink.primary} weight="bold" />
      </View>
      <View style={[styles.label, { backgroundColor: c.surface.panel }]}>
        <Text variant="label" style={{ fontSize: 13 }}>
          {busy ? '…' : preview ? t('onboarding.photoRetake') : label}
        </Text>
      </View>
    </Tactile>
  );
}

const styles = StyleSheet.create({
  slot: { flex: 1, aspectRatio: 0.8, borderRadius: 20, borderWidth: 1.5, borderStyle: 'dashed', overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  badge: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  label: { position: 'absolute', left: 10, right: 10, bottom: 10, borderRadius: 12, paddingVertical: 6, alignItems: 'center' },
});
