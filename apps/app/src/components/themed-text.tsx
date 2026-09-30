import { StyleSheet, Text, type TextProps } from 'react-native';

import { FontFamily, Fonts, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'small' | 'smallBold' | 'subtitle' | 'link' | 'linkPrimary' | 'code';
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();

  return (
    <Text
      style={[
        { color: theme[themeColor ?? 'text'] },
        type === 'default' && styles.default,
        type === 'title' && styles.title,
        type === 'small' && styles.small,
        type === 'smallBold' && styles.smallBold,
        type === 'subtitle' && styles.subtitle,
        type === 'link' && styles.link,
        type === 'linkPrimary' && styles.linkPrimary,
        type === 'code' && styles.code,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  small: {
    fontSize: 12.5,
    lineHeight: 18,
    fontFamily: FontFamily.medium,
  },
  smallBold: {
    fontSize: 12.5,
    lineHeight: 18,
    fontFamily: FontFamily.bold,
  },
  default: {
    fontSize: 14,
    lineHeight: 21,
    fontFamily: FontFamily.medium,
  },
  /** Screen title — 27/700, letter-spacing −0.5 (Home, Explore, Leaderboard). */
  title: {
    fontSize: 27,
    lineHeight: 32,
    letterSpacing: -0.5,
    fontFamily: FontFamily.bold,
  },
  /** Section header — 17/700. */
  subtitle: {
    fontSize: 17,
    lineHeight: 22,
    fontFamily: FontFamily.bold,
  },
  link: {
    lineHeight: 30,
    fontSize: 14,
    fontFamily: FontFamily.medium,
  },
  linkPrimary: {
    lineHeight: 30,
    fontSize: 14,
    fontFamily: FontFamily.medium,
    color: '#3d5af1',
  },
  code: {
    fontFamily: Fonts?.mono,
    fontSize: 12,
  },
});
