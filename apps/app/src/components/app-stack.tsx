import { Stack } from 'expo-router/stack';

import { Radii } from '@/constants/theme';

export default function AppStack() {
  return (
    <Stack
      screenOptions={{
        headerTransparent: true,
        headerShadowVisible: false,
        headerLargeTitle: false,
        headerShown: false,
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="tutorial" />
      <Stack.Screen name="login" />
      <Stack.Screen name="park/[id]" />
      <Stack.Screen name="coaster/[id]" />
      <Stack.Screen
        name="log-ride"
        options={{
          presentation: 'formSheet',
          sheetAllowedDetents: [0.7],
          sheetCornerRadius: Radii.sheet,
          sheetGrabberVisible: false,
        }}
      />
      <Stack.Screen
        name="review-composer"
        options={{
          presentation: 'formSheet',
          sheetAllowedDetents: [0.6],
          sheetCornerRadius: Radii.sheet,
          sheetGrabberVisible: false,
        }}
      />
    </Stack>
  );
}
