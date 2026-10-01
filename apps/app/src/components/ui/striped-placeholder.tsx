import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Line, Rect } from 'react-native-svg';

import { Fonts } from '@/constants/theme';

export type StripedPlaceholderProps = {
  hueA: string;
  hueB: string;
  /** Small monospace caption, e.g. "park photo". */
  label?: string;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

/**
 * Diagonal-striped placeholder block standing in for photos (per the handoff,
 * all imagery is placeholder until real photos come from the API via expo-image).
 */
export function StripedPlaceholder({ hueA, hueB, label, style, children }: StripedPlaceholderProps) {
  const lines = [];
  for (let i = -10; i < 30; i++) {
    const offset = i * 28;
    lines.push(
      <Line key={i} x1={offset} y1={200} x2={offset + 200} y2={0} stroke={hueB} strokeWidth={14} />,
    );
  }

  return (
    <View style={[styles.box, style]}>
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 200 200"
        preserveAspectRatio="xMidYMid slice"
        style={StyleSheet.absoluteFill}
      >
        <Rect x={0} y={0} width={200} height={200} fill={hueA} />
        {lines}
      </Svg>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  label: {
    fontFamily: Fonts?.mono,
    fontSize: 11,
    color: '#7c8bb4',
  },
});
