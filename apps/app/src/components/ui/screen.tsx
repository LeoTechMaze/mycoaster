import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ScreenProps = {
  children: React.ReactNode;
  /** Vertical gap between direct children (handoff rhythm: 14–16). */
  gap?: number;
  /** Extra top padding below the status bar. */
  topPadding?: number;
  /** Set false on stack screens without the tab bar. */
  aboveTabBar?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Scrollable screen scaffold: app background, 20px horizontal padding, safe areas. */
export function Screen({ children, gap = 14, topPadding = 12, aboveTabBar = true, style }: ScreenProps) {
  const c = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: c.background }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + topPadding,
          paddingBottom: (aboveTabBar ? BottomTabInset : insets.bottom) + Spacing.four,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.inner, { gap }, style]}>{children}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: Spacing.screenX,
  },
  inner: {
    flex: 1,
    maxWidth: MaxContentWidth,
  },
});
