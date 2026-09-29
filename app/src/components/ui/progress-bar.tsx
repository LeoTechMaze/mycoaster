import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Brand, Radii } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ProgressBarProps = {
  /** 0–100 */
  pct: number;
  /** Track color; defaults to the light track used on white cards. */
  trackColor?: string;
  fillColor?: string;
  style?: StyleProp<ViewStyle>;
};

export function ProgressBar({ pct, trackColor, fillColor = Brand.lime, style }: ProgressBarProps) {
  const c = useTheme();
  return (
    <View style={[styles.track, { backgroundColor: trackColor ?? c.progressTrack }, style]}>
      <View style={[styles.fill, { width: `${Math.min(100, Math.max(0, pct))}%`, backgroundColor: fillColor }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 8,
    borderRadius: Radii.bar,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Radii.bar,
  },
});
