import { typography } from '@clareo/design-system';

const { families } = typography;

// Legacy compatibility shim. Maps the old surface to the shared
// platform fonts; new code should pull `theme.fonts` / `theme.type`
// from `useTheme()` to get role-aware styles + responsive sizes.
export const Fonts = {
  light: families.body.nativeFamilies.light,
  regular: families.body.nativeFamilies.regular,
  medium: families.body.nativeFamilies.medium,
  semiBold: families.body.nativeFamilies.medium,
  bold: families.body.nativeFamilies.bold,
  serifItalic: families.display.nativeFamilies.italic,
  serifRegular: families.display.nativeFamilies.regular,
} as const;
