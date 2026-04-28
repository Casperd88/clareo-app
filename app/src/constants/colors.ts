import { lightTheme, palette } from '@clareo/design-system';

// Legacy compatibility shim. New code should call `useTheme()` so it
// reacts to light/dark mode. This mapping covers screens that haven't
// migrated yet so the surface stays consistent.
export const Colors = {
  primary: lightTheme.primary,
  secondary: lightTheme.secondary,
  accent: lightTheme.accent,
  background: lightTheme.bg,
  white: lightTheme.bgRaised,
  progressTrack: lightTheme.surfaceMuted,
  progressThumb: lightTheme.primary,
  border: lightTheme.border,
  borderStrong: lightTheme.borderStrong,
  surface: lightTheme.surface,
  surfaceSecondary: lightTheme.surfaceSecondary,
  paper: palette.neutral.paper,
  ink: palette.neutral.ink,
} as const;
