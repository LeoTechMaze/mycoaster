import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { Brand, FontFamily } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type AvatarProps = {
  initial: string;
  size?: number;
  /** blue: blue bg / white text · tint: blueTint bg / blue text · lime: lime bg / navy text */
  variant?: 'blue' | 'tint' | 'lime';
  style?: StyleProp<ViewStyle>;
};

export function Avatar({ initial, size = 34, variant = 'tint', style }: AvatarProps) {
  const c = useTheme();
  const bg = variant === 'blue' ? Brand.blue : variant === 'lime' ? Brand.lime : c.blueTint;
  const fg = variant === 'blue' ? '#ffffff' : variant === 'lime' ? Brand.navy : Brand.blue;

  return (
    <View
      style={[
        styles.circle,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: bg },
        style,
      ]}
    >
      <Text style={[styles.initial, { color: fg, fontSize: Math.round(size * 0.38) }]}>{initial}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    fontFamily: FontFamily.bold,
  },
});
