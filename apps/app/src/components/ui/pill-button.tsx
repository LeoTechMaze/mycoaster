import { Pressable, StyleSheet, Text, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { Brand, FontFamily, Radii, Shadows } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type PillButtonVariant =
  | 'blue' // primary CTA — blue bg, white text, blue shadow
  | 'navy' // dark button — navy bg, white text
  | 'lime' // reward CTA — lime bg, navy text, lime shadow
  | 'white' // white bg + card border (e.g. "Continue with Google")
  | 'outline' // transparent bg + muted border (e.g. "Sign up with email")
  | 'disabled'; // disabled state (e.g. "Post review" before input)

export type PillButtonProps = Omit<PressableProps, 'style'> & {
  label: string;
  variant?: PillButtonVariant;
  /** Extra element rendered before the label (e.g. the Google "G"). */
  leading?: React.ReactNode;
  withShadow?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function PillButton({
  label,
  variant = 'blue',
  leading,
  withShadow = true,
  style,
  ...rest
}: PillButtonProps) {
  const c = useTheme();

  const container: StyleProp<ViewStyle> = [
    styles.base,
    variant === 'blue' && { backgroundColor: Brand.blue },
    variant === 'blue' && withShadow && Shadows.blueCta,
    variant === 'navy' && { backgroundColor: Brand.navy },
    variant === 'lime' && { backgroundColor: Brand.lime, borderWidth: 2, borderColor: Brand.lime },
    variant === 'lime' && withShadow && Shadows.limeCta,
    variant === 'white' && { backgroundColor: c.card, borderWidth: 1.5, borderColor: c.border },
    variant === 'outline' && { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: c.borderMuted },
    variant === 'disabled' && { backgroundColor: c.disabledBg },
    style,
  ];

  const labelColor =
    variant === 'blue' || variant === 'navy'
      ? '#ffffff'
      : variant === 'lime'
        ? Brand.navy
        : variant === 'white'
          ? c.text
          : variant === 'outline'
            ? c.textSecondary
            : c.textMuted;

  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [container, pressed && styles.pressed]}
      {...rest}
    >
      {leading}
      <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: Radii.pill,
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  pressed: {
    opacity: 0.85,
  },
  label: {
    fontFamily: FontFamily.bold,
    fontSize: 14.5,
  },
});
