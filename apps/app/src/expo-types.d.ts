// Expo's global types (CSS imports, process.env.EXPO_PUBLIC_*, etc.).
// expo-env.d.ts already references these, but Expo generates that file on
// `expo start` and it is gitignored, so a fresh checkout (CI) lacks it and
// `tsc` fails on `import '@/global.css'`. This tracked file keeps typecheck
// working everywhere; a duplicate reference is harmless.
/// <reference types="expo/types" />
