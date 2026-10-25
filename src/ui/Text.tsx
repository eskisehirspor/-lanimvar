import { Children, type ReactNode } from 'react';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { fontFamilies } from '@/brand/fonts';
import { trUpper } from '@/i18n/turkish';
import { useTheme, type Theme, type TypeVariant } from '@/theme';
import { toTextStyle } from '@/theme/typography';

export type TextTone =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'onInverse'
  | 'onInverseSecondary'
  | 'onInverseTertiary'
  | 'onFill'
  | 'brand'
  | 'live'
  | 'success'
  | 'attention'
  | 'critical'
  | 'onCritical'
  | 'link';

export function toneColor(theme: Theme, tone: TextTone): string {
  const c = theme.color;
  const map: Record<TextTone, string> = {
    primary: c.ink.primary,
    secondary: c.ink.secondary,
    tertiary: c.ink.tertiary,
    onInverse: c.ink.onInverse,
    onInverseSecondary: c.ink.onInverseSecondary,
    onInverseTertiary: c.ink.onInverseTertiary,
    onFill: c.brand.onFill,
    brand: c.brand.text,
    live: c.status.live,
    success: c.status.success,
    attention: c.status.attention,
    critical: c.safety.critical,
    onCritical: c.safety.onCritical,
    link: c.link.color,
  };
  return map[tone];
}

export interface TextProps extends RNTextProps {
  variant?: TypeVariant;
  tone?: TextTone;
  /** Semibold for UI-voice variants. */
  emphasis?: boolean;
  align?: 'left' | 'center' | 'right';
  /** Editorial accent: italic serif at the same optical size. For one or two words nested in a display line. */
  serif?: boolean;
  children?: ReactNode;
}

/** The only text primitive: tokens, Turkish casing and tones stay consistent. */
export function Text({ variant = 'body', tone = 'primary', emphasis, align, serif, style, children, selectable = false, ...rest }: TextProps) {
  const theme = useTheme();
  const token = theme.type[variant];
  const base = toTextStyle(token);
  const s = serif
    ? // Instrument Serif has a smaller x-height: size it up so it sits level with the grotesk.
      { ...base, fontFamily: fontFamilies.accent, fontSize: Math.round(token.fontSize * 1.14), letterSpacing: token.letterSpacing * 0.4 }
    : emphasis && token.voice === 'ui'
      ? { ...base, fontFamily: fontFamilies.ui.semibold }
      : base;
  const caps = token.caps && !serif;
  return (
    <RNText selectable={selectable} style={[s, { color: toneColor(theme, tone) }, align ? { textAlign: align } : null, style]} {...rest}>
      {caps ? Children.map(children, (ch) => (typeof ch === 'string' ? trUpper(ch) : ch)) : children}
    </RNText>
  );
}
