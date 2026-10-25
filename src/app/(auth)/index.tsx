import * as AppleAuthentication from 'expo-apple-authentication';
import { router } from 'expo-router';
import { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Wordmark } from '@/brand/Wordmark';
import { attempt } from '@/features/app/Notice';
import { t } from '@/i18n';
import { signInWithApple, signInWithGoogle } from '@/lib/auth/providers';
import { useTheme } from '@/theme';
import { Button, ClayObject, Grain, Icon, MaskReveal, Rise, Tactile, Text } from '@/ui';

/** Welcome: the promise, then three doors (phone first; Apple and Google one tap). */
export default function Welcome() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const c = theme.color;
  const g = theme.layout.gutter;
  const [busy, setBusy] = useState<'apple' | 'google' | null>(null);

  const run = async (which: 'apple' | 'google') => {
    setBusy(which);
    await attempt(which === 'apple' ? signInWithApple : signInWithGoogle);
    setBusy(null);
  };

  return (
    <View style={[styles.flex, { backgroundColor: c.surface.inverse }]}>
      <Grain opacity={0.1} />
      <View style={{ paddingTop: insets.top + 22, paddingHorizontal: g }}>
        <Wordmark capHeight={16} color={c.ink.onInverse} />
      </View>
      <View style={styles.art} pointerEvents="none">
        <Rise delay={500} distance={30}>
          <ClayObject name="couch" size={180} />
        </Rise>
      </View>
      <View style={{ paddingHorizontal: g, marginTop: 'auto' }}>
        <MaskReveal delay={120}>
          <Text variant="display.hero" tone="onInverse">
            {t('auth.heroA')}
          </Text>
        </MaskReveal>
        <MaskReveal delay={240}>
          <Text variant="display.hero" serif tone="brand" style={{ color: c.brand.dot }}>
            {t('auth.heroB')}
          </Text>
        </MaskReveal>
        <Rise delay={420}>
          <Text variant="body.l" tone="onInverseSecondary" style={{ marginTop: 12 }}>
            {t('auth.sub')}
          </Text>
        </Rise>
      </View>
      <Rise delay={560} style={{ paddingHorizontal: g, paddingTop: 28, paddingBottom: insets.bottom + 16, gap: 10 }}>
        <Tactile haptic="press" onPress={() => router.push('/phone')} style={[styles.primary, { backgroundColor: c.brand.fill }]} accessibilityLabel={t('auth.phone')}>
          <Icon name="phone" size={20} color={c.brand.onFill} weight="bold" />
          <Text variant="button" style={{ color: c.brand.onFill, fontSize: 17 }}>
            {t('auth.phone')}
          </Text>
        </Tactile>
        {Platform.OS === 'ios' ? (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
            cornerRadius={30}
            style={styles.apple}
            onPress={() => run('apple')}
          />
        ) : (
          <Button label={t('auth.apple')} level="secondary" onInverse loading={busy === 'apple'} onPress={() => run('apple')} />
        )}
        <Button label={t('auth.google')} level="secondary" onInverse loading={busy === 'google'} onPress={() => run('google')} />
        <Text variant="meta" tone="onInverseTertiary" align="center" style={{ marginTop: 6 }}>
          {t('auth.legal')}
        </Text>
        <View style={styles.links}>
          <Text variant="meta" tone="onInverseSecondary" onPress={() => router.push('/legal/terms')} style={styles.link}>
            {t('auth.terms')}
          </Text>
          <Text variant="meta" tone="onInverseSecondary" onPress={() => router.push('/legal/privacy')} style={styles.link}>
            {t('auth.privacy')}
          </Text>
        </View>
      </Rise>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  art: { position: 'absolute', right: -10, top: 110 },
  primary: { height: 60, borderRadius: 30, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  apple: { height: 54, width: '100%' },
  links: { flexDirection: 'row', justifyContent: 'center', gap: 18 },
  link: { textDecorationLine: 'underline' },
});
