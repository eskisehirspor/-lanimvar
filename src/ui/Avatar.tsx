import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme';

import { Icon } from './Icon';
import { Text } from './Text';

export interface AvatarProps {
  initials: string;
  size?: 28 | 36 | 44 | 56 | 72;
  verified?: boolean;
  /** Ring separates the avatar from busy backgrounds (maps, stacks). */
  ring?: boolean;
  tone?: 'warm' | 'neutral' | 'brand' | 'inverse';
}

/** Person marker. Initials until real photos exist; verified adds a success badge. */
export function Avatar({ initials, size = 44, verified, ring, tone = 'warm' }: AvatarProps) {
  const theme = useTheme();
  const c = theme.color;
  // Warm monograms: each person keeps the same hue everywhere (stable hash of initials).
  const hue = theme.avatar.hues[[...initials].reduce((a, ch) => a + ch.charCodeAt(0), 0) % theme.avatar.hues.length]!;
  const bg = tone === 'brand' ? c.brand.fill : tone === 'inverse' ? c.surface.inverse : tone === 'warm' ? hue : c.surface.fieldStrong;
  const fg = tone === 'brand' ? c.brand.onFill : tone === 'inverse' ? c.ink.onInverse : tone === 'warm' ? theme.avatar.ink : c.ink.primary;
  const badge = size >= 44 ? 18 : 14;
  return (
    <View style={{ width: size, height: size }}>
      <View
        style={[
          styles.circle,
          { width: size, height: size, borderRadius: size / 2, backgroundColor: bg },
          ring ? { borderWidth: Math.max(2, size / 18), borderColor: c.surface.panel } : null,
        ]}
      >
        <Text variant="label" style={{ color: fg, fontSize: Math.round(size * 0.36), lineHeight: Math.round(size * 0.44), letterSpacing: 0.2 }}>
          {initials}
        </Text>
      </View>
      {verified ? (
        <View style={[styles.badge, { width: badge, height: badge, borderRadius: badge / 2, backgroundColor: c.status.success, borderColor: c.surface.panel }]}>
          <Icon name="check" size={badge * 0.55} color={c.ink.onInverse} weight="bold" />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', right: -2, bottom: -2, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
});
